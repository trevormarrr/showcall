// Resolume SMPTE Timecode WebSocket client (CommonJS)
const { ipcMain, webContents } = require('electron')
const WebSocket = require('ws')

function createLogger(prefix) {
  return {
    info: (...args) => console.log(`[Timecode] ${prefix}`, ...args),
    warn: (...args) => console.warn(`[Timecode] ${prefix}`, ...args),
    error: (...args) => console.error(`[Timecode] ${prefix}`, ...args),
  }
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
      this.log.info('✓ Connected! Listening for all parameter updates...')
      this._broadcast({ connected: true })
    })

    this.ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString())
        
        // Skip errors
        if (msg.error) return
        
        // Look for parameter updates/sets
        if (msg.type === 'parameter_update' || msg.type === 'parameter_set') {
          const path = msg.path || ''
          const value = msg.value
          
          // Log ANYTHING that might be timecode-related
          const isTimecodeRelated = path.toLowerCase().includes('smpte') || 
                                   path.toLowerCase().includes('timecode') ||
                                   path.toLowerCase().includes('transport') ||
                                   (typeof value === 'string' && value.match(/^\d{2}:\d{2}:\d{2}:\d{2}$/))
          
          if (isTimecodeRelated) {
            this.log.info(`📟 ${msg.type}: ${path} = ${JSON.stringify(value).substring(0, 100)}`)
            
            // If this looks like a timecode string, broadcast it!
            if (typeof value === 'string' && value.match(/^\d{2}:\d{2}:\d{2}:\d{2}$/)) {
              const now = Date.now()
              if (now - this._lastSentTs >= this._throttleMs) {
                this._lastSentTs = now
                this._broadcast({ 
                  connected: true, 
                  timecode: value,
                  source: path
                })
                this.log.info(`✓ Broadcasting timecode: ${value}`)
              }
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
