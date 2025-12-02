// Resolume SMPTE Timecode client (CommonJS) - Hybrid WebSocket + REST polling
const { ipcMain, webContents } = require('electron')
const WebSocket = require('ws')
const http = require('http')

function createLogger(prefix) {
  return {
    info: (...args) => console.log(`[Timecode] ${prefix}`, ...args),
    warn: (...args) => console.warn(`[Timecode] ${prefix}`, ...args),
    error: (...args) => console.error(`[Timecode] ${prefix}`, ...args),
  }
}

// Helper to poll Resolume composition and extract timecode from connected SMPTE clips
function pollTimecode(host, port, callback) {
  const options = {
    hostname: host || '127.0.0.1',
    port: port || 8080,
    path: '/api/v1/composition',
    method: 'GET',
    timeout: 2000
  }
  
  const req = http.request(options, (res) => {
    let data = ''
    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => {
      try {
        const json = JSON.parse(data)
        const layers = json.layers || []
        
        // Find connected clips with SMPTE transport
        for (const layer of layers) {
          const clips = layer.clips || []
          for (const clip of clips) {
            const isConnected = clip.connected?.value === 1 || clip.connected === 1
            const transportType = clip.transporttype?.value || clip.transporttype || ''
            
            if (isConnected && (transportType.includes('SMPTE') || transportType.includes('LTC'))) {
              // Check video position for timecode
              const video = clip.video || {}
              const position = video.playbackPosition || video.position
              
              // Also check for timecode string in various places
              const checkTimecode = (obj, path = '') => {
                if (typeof obj === 'string' && obj.match(/^\d{2}:\d{2}:\d{2}[:\.]?\d{2}$/)) {
                  return obj
                }
                if (obj && typeof obj === 'object') {
                  for (const [key, val] of Object.entries(obj)) {
                    if (key.toLowerCase().includes('timecode') || key.toLowerCase().includes('smpte')) {
                      const tc = checkTimecode(val, `${path}/${key}`)
                      if (tc) return tc
                    }
                  }
                }
                return null
              }
              
              const timecode = checkTimecode(clip) || checkTimecode(video)
              
              if (timecode) {
                callback(null, { timecode, connected: true, transportType })
                return
              }
            }
          }
        }
        
        // No timecode found
        callback(null, { connected: true, timecode: null })
      } catch (e) {
        callback(e, null)
      }
    })
  })
  
  req.on('error', (err) => callback(err, null))
  req.on('timeout', () => {
    req.destroy()
    callback(new Error('Timeout'), null)
  })
  req.end()
}

class ResolumeTimecodeClient {
  constructor(config) {
    this.config = config || {}
    this.ws = null
    this._reconnectTimer = null
    this._pollTimer = null
    this._lastSentTs = 0
    this._throttleMs = config.throttleMs ?? 50 // 20 Hz max
    this._pollIntervalMs = config.pollIntervalMs ?? 100 // Poll at 10 Hz
    this._subscribedParams = new Set()
    this.log = createLogger('client')
  }

  start() {
    this.stop()
    const host = this.config.host || '127.0.0.1'
    const port = this.config.port || 8080
    
    this.log.info(`🎬 Starting LTC/SMPTE timecode monitoring`)
    this.log.info(`   Host: ${host}:${port}`)
    this.log.info(`   Poll rate: ${1000/this._pollIntervalMs} Hz`)
    
    // Start REST polling for timecode
    this._startPolling(host, port)
    
    // Also try WebSocket for parameter updates (backup method)
    this._startWebSocket(host, port)
  }

  _startPolling(host, port) {
    this.log.info('📡 Starting REST API polling for timecode...')
    
    this._pollTimer = setInterval(() => {
      pollTimecode(host, port, (err, data) => {
        if (err) {
          this._broadcast({ connected: false })
          return
        }
        
        if (data && data.timecode) {
          const now = Date.now()
          if (now - this._lastSentTs >= this._throttleMs) {
            this._lastSentTs = now
            this._broadcast({ 
              connected: true,
              timecode: data.timecode,
              transport: data.transportType
            })
          }
        } else if (data && data.connected && !data.timecode) {
          // Connected but no timecode
          this._broadcast({ connected: true, timecode: '--:--:--:--' })
        }
      })
    }, this._pollIntervalMs)
  }

  _startWebSocket(host, port) {
    const url = `ws://${host}:${port}/api/v1`
    this.log.info('🔌 Connecting WebSocket as backup:', url)

    try {
      this.ws = new WebSocket(url)
    } catch (e) {
      this.log.warn('WebSocket failed:', e.message)
      return
    }

    this.ws.on('open', () => {
      this.log.info('✓ WebSocket connected (backup channel)')
    })

    this.ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString())
        
        // Look for timecode in any parameter update
        if (msg.type === 'parameter_update' || msg.type === 'parameter_set') {
          const value = msg.value
          const isTimecode = typeof value === 'string' && value.match(/^\d{2}:\d{2}:\d{2}[:\.]?\d{2}$/)
          
          if (isTimecode) {
            const now = Date.now()
            if (now - this._lastSentTs >= this._throttleMs) {
              this._lastSentTs = now
              this._broadcast({ 
                connected: true, 
                timecode: value,
                source: 'websocket'
              })
            }
          }
        }
      } catch (e) {
        // Ignore
      }
    })

    this.ws.on('close', () => {
      this.log.warn('WebSocket closed (not critical, polling continues)')
    })

    this.ws.on('error', (err) => {
      // Silently ignore WS errors since polling is primary
    })
  }

  stop() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer)
      this._reconnectTimer = null
    }
    if (this._pollTimer) {
      clearInterval(this._pollTimer)
      this._pollTimer = null
    }
    if (this.ws) {
      try { this.ws.close() } catch {}
      this.ws = null
    }
  }

  _broadcast(payload) {
    for (const wc of webContents.getAllWebContents()) {
      wc.send('resolume-timecode-update', payload)
    }
  }
}

module.exports = { ResolumeTimecodeClient }
