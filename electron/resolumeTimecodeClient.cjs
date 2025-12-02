// Resolume SMPTE Timecode WebSocket client (CommonJS)
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

// Helper to fetch composition and find SMPTE clips
function findSMPTEClips(host, port, callback) {
  const options = {
    hostname: host || '127.0.0.1',
    port: port || 8080,
    path: '/api/v1/composition',
    method: 'GET',
    timeout: 5000
  }
  
  const req = http.request(options, (res) => {
    let data = ''
    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => {
      try {
        const json = JSON.parse(data)
        const smpteClips = []
        
        // Scan all layers and clips for SMPTE transport
        const layers = json.layers || []
        for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
          const layer = layers[layerIdx]
          const clips = layer.clips || []
          for (let clipIdx = 0; clipIdx < clips.length; clipIdx++) {
            const clip = clips[clipIdx]
            const transportType = clip.transporttype?.value || clip.transporttype
            if (transportType && (transportType.includes('SMPTE') || transportType.includes('LTC'))) {
              smpteClips.push({
                layer: layerIdx + 1,
                column: clipIdx + 1,
                transportType: transportType,
                path: `/composition/layers/${layerIdx + 1}/clips/${clipIdx + 1}`
              })
            }
          }
        }
        
        callback(null, smpteClips)
      } catch (e) {
        callback(e, [])
      }
    })
  })
  
  req.on('error', (err) => callback(err, []))
  req.on('timeout', () => {
    req.destroy()
    callback(new Error('Request timeout'), [])
  })
  req.end()
}

class ResolumeTimecodeClient {
  constructor(config) {
    this.config = config || {}
    this.ws = null
    this._reconnectTimer = null
    this._lastSentTs = 0
    this._throttleMs = config.throttleMs ?? 75
    this.log = createLogger('client')
    this._subscribedParams = new Set()
  }

  start() {
    this.stop()
    const host = this.config.host || '127.0.0.1'
    const port = this.config.port || 8080
    const url = `ws://${host}:${port}/api/v1`
    
    this.log.info('Connecting to Resolume WebSocket:', url)

    try {
      this.ws = new WebSocket(url)
    } catch (e) {
      this.log.error('Failed to connect:', e.message)
      this._scheduleReconnect()
      return
    }

    this.ws.on('open', () => {
      this.log.info('✓ WebSocket connected! Discovering SMPTE clips...')
      this._broadcast({ connected: true })
      
      // Find and subscribe to SMPTE clips
      findSMPTEClips(host, port, (err, clips) => {
        if (err) {
          this.log.warn('Failed to discover SMPTE clips:', err.message)
          this.log.info('Will listen for any timecode values in parameter updates')
          return
        }
        
        if (clips.length === 0) {
          this.log.info('No SMPTE clips found. Will listen for any timecode values.')
          return
        }
        
        this.log.info(`Found ${clips.length} SMPTE clip(s):`)
        clips.forEach(clip => {
          this.log.info(`  Layer ${clip.layer}, Column ${clip.column}: ${clip.transportType}`)
          
          // Subscribe to the transport parameter for this clip
          // Try multiple possible parameter paths
          const paths = [
            `${clip.path}/transport`,
            `${clip.path}/transport/timecode`,
            `${clip.path}/timecode`,
            `${clip.path}/video/position/positiontimecode`
          ]
          
          paths.forEach(paramPath => {
            try {
              const msg = JSON.stringify({ action: 'subscribe', parameter: paramPath })
              this.ws.send(msg)
              this._subscribedParams.add(paramPath)
            } catch (e) {
              // Ignore
            }
          })
        })
        
        this.log.info(`Subscribed to ${this._subscribedParams.size} timecode parameters`)
      })
    })

    this.ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString())
        
        // Log EVERY message type to see what Resolume sends
        if (msg.type && msg.type !== 'parameter_subscribed' && msg.type !== 'parameter_unsubscribed') {
          const shortValue = JSON.stringify(msg.value || '').substring(0, 80)
          this.log.info(`WS: ${msg.type} | path: ${msg.path || 'none'} | value: ${shortValue}`)
        }
        
        // Skip errors
        if (msg.error) {
          if (!msg.error.includes('Invalid parameter path')) {
            this.log.warn('Resolume error:', msg.error)
          }
          return
        }
        
        // Look for parameter updates/sets
        if (msg.type === 'parameter_update' || msg.type === 'parameter_set') {
          const path = msg.path || ''
          const value = msg.value
          
          // Check if the value looks like timecode
          const isTimecodeValue = typeof value === 'string' && value.match(/^\d{2}:\d{2}:\d{2}[:\.]?\d{2}$/)
          
          if (isTimecodeValue) {
            this.log.info(`📟 TIMECODE DETECTED: ${value} from ${path}`)
            const now = Date.now()
            if (now - this._lastSentTs >= this._throttleMs) {
              this._lastSentTs = now
              this._broadcast({ 
                connected: true, 
                timecode: value,
                source: path
              })
            }
          }
        }
      } catch (e) {
        // Silently ignore parse errors
      }
    })

    this.ws.on('close', (code) => {
      this.log.warn('WebSocket closed:', code)
      this._broadcast({ connected: false })
      this._scheduleReconnect()
    })

    this.ws.on('error', (err) => {
      this.log.error('WebSocket error:', err.message)
    })
  }

  stop() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer)
      this._reconnectTimer = null
    }
    if (this.ws) {
      try { this.ws.close() } catch {}
      this.ws = null
    }
  }

  _scheduleReconnect() {
    if (this._reconnectTimer) return
    const delay = 4000
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null
      this.start()
    }, delay)
  }

  _broadcast(payload) {
    for (const wc of webContents.getAllWebContents()) {
      wc.send('resolume-timecode-update', payload)
    }
  }
}

module.exports = { ResolumeTimecodeClient }
