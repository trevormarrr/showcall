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

function buildWsUrl({ host, port, path }) {
  const h = host || '127.0.0.1'
  const p = port || 8080
  const base = path.startsWith('/') ? path : `/${path}`
  return `ws://${h}:${p}${base}`
}

// Helper to fetch SMPTE data from REST API
function fetchSMPTEFromREST(host, port, callback) {
  const options = {
    hostname: host || '127.0.0.1',
    port: port || 8080,
    path: '/api/v1/composition',
    method: 'GET',
    timeout: 3000
  }
  
  const req = http.request(options, (res) => {
    let data = ''
    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => {
      try {
        const json = JSON.parse(data)
        // Look for SMPTE inputs in the composition
        // Based on Resolume's structure, SMPTE inputs are typically at /composition/smpte/inputs
        const smpte = json?.smpte?.inputs || []
        if (smpte.length > 0 && smpte[0]?.timecode) {
          callback(null, {
            timecode: smpte[0].timecode?.value || smpte[0].timecode,
            connected: true
          })
        } else {
          callback(null, null)
        }
      } catch (e) {
        callback(e, null)
      }
    })
  })
  
  req.on('error', (err) => callback(err, null))
  req.on('timeout', () => {
    req.destroy()
    callback(new Error('Request timeout'), null)
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
    this._throttleMs = config.throttleMs ?? 75
    this._pollIntervalMs = config.pollIntervalMs ?? 100 // Poll every 100ms for timecode
    this.log = createLogger('client')
  }

  start() {
    this.stop()
    this.log.info('Starting SMPTE timecode monitoring via REST API polling')
    this._startPolling()
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

  _startPolling() {
    const host = this.config.host || '127.0.0.1'
    const port = this.config.port || 8080
    
    this.log.info(`Polling Resolume REST API at ${host}:${port} for SMPTE timecode`)
    
    this._pollTimer = setInterval(() => {
      fetchSMPTEFromREST(host, port, (err, data) => {
        if (err) {
          // Silently ignore errors to avoid log spam
          this._broadcast({ connected: false })
          return
        }
        
        if (data && data.timecode) {
          const now = Date.now()
          if (now - this._lastSentTs >= this._throttleMs) {
            this._lastSentTs = now
            this._broadcast({ ...data, connected: true })
          }
        }
      })
    }, this._pollIntervalMs)
  }

  _broadcast(payload) {
    for (const wc of webContents.getAllWebContents()) {
      wc.send('resolume-timecode-update', payload)
    }
  }
}

module.exports = { ResolumeTimecodeClient }
