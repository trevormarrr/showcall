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

function buildWsUrl({ host, port, path }) {
  const h = host || '127.0.0.1'
  const p = port || 8080
  const base = path.startsWith('/') ? path : `/${path}`
  return `ws://${h}:${p}${base}`
}

function extractTimecode(payload) {
  try {
    const obj = typeof payload === 'string' ? JSON.parse(payload) : payload
    const keys = JSON.stringify(obj).toLowerCase()
    const hasTimecode = keys.includes('smpte') || keys.includes('timecode') || keys.includes('transport')
    if (!hasTimecode) return null

    let timecodeStr = obj?.smpte?.timecode || obj?.timecode?.value || obj?.transport?.timecode || obj?.timecode
    let frames = obj?.smpte?.frames ?? obj?.transport?.frames ?? obj?.frames
    let running = obj?.smpte?.running ?? obj?.transport?.running ?? obj?.running

    if (typeof timecodeStr !== 'string') {
      const h = obj?.smpte?.hours ?? obj?.hours
      const m = obj?.smpte?.minutes ?? obj?.minutes
      const s = obj?.smpte?.seconds ?? obj?.seconds
      const f = obj?.smpte?.frames ?? obj?.frames
      if ([h, m, s, f].every((v) => typeof v === 'number')) {
        timecodeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`
      }
    }

    if (!timecodeStr) return null
    return { timecode: timecodeStr, frames, running: !!running }
  } catch {
    return null
  }
}

class ResolumeTimecodeClient {
  constructor(config) {
    this.config = config || {}
    this.ws = null
    this._reconnectTimer = null
    this._lastSentTs = 0
    this._throttleMs = config.throttleMs ?? 75
  // WebSocket base per Resolume docs is /api/v1; keep legacy fallbacks
  this._paths = config.paths || ['/api/v1', '/api/v1/events', '/api/events', '/events']
    this._pathIndex = 0
    this.log = createLogger('client')
  }

  start() {
    this.stop()
  const url = buildWsUrl({ host: this.config.host, port: this.config.port, path: this._paths[this._pathIndex] })
    this.log.info('Connecting to Resolume WebSocket:', url)

    try {
      this.ws = new WebSocket(url)
    } catch (e) {
      this.log.error('Failed to construct WebSocket:', e.message)
      this._scheduleReconnect()
      return
    }

    this.ws.on('open', () => {
      this.log.info('✓ Connected to Resolume WebSocket API')
      this._broadcast({ connected: true })
      
      // Subscribe to the clip's transporttype parameter to detect when SMPTE 1 is selected
      // Based on the user's WebSocket logs, this is the correct path format
      const transportTypePath = '/composition/layers/2/clips/1/transporttype'
      
      try {
        const subscribeMsg = JSON.stringify({ action: 'subscribe', parameter: transportTypePath })
        this.ws.send(subscribeMsg)
        this.log.info(`Subscribed to ${transportTypePath} to monitor SMPTE 1 selection`)
      } catch (e) {
        this.log.warn('Subscribe failed for', transportTypePath, e.message)
      }
    })

    this.ws.on('message', (data) => {
      let obj = null
      try { obj = typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString()) } catch {}
      
      if (!obj) return
      
      // Log errors from Resolume
      if (obj.error) {
        this.log.warn('Resolume error:', obj.error, 'for path:', obj.path || obj.parameter)
        return
      }
      
      // Check if this is a transporttype parameter update
      if (obj.path === '/composition/layers/2/clips/1/transporttype') {
        const transportValue = obj.value
        this.log.info(`Transport type changed to: ${transportValue} (index: ${obj.index})`)
        
        if (transportValue === 'SMPTE 1' || obj.index === 2) {
          this.log.info('✓ SMPTE 1 is now ACTIVE!')
          this.log.info('Next step: Need to find the SMPTE input timecode parameter.')
          this.log.info('Looking at your earlier logs, check Resolume WebSocket messages for parameters containing "smpte" or "timecode"')
        }
      }
      
      // Log all parameter_update/parameter_set messages to help discover the timecode parameter
      if (obj.type === 'parameter_update' || obj.type === 'parameter_set') {
        const pathStr = obj.path || 'unknown'
        // Only log if it might be related to timecode/SMPTE
        if (pathStr.toLowerCase().includes('smpte') || pathStr.toLowerCase().includes('timecode')) {
          this.log.info(`SMPTE/Timecode parameter: ${pathStr} = ${JSON.stringify(obj.value).substring(0, 100)}`)
        }
      }
      
      // Try to extract timecode from the message
      const tc = extractTimecode(obj.value ?? obj)
      if (tc && tc.timecode) {
        const now = Date.now()
        if (now - this._lastSentTs >= this._throttleMs) {
          this._lastSentTs = now
          this._broadcast({ connected: true, ...tc })
          this.log.info(`Timecode update: ${tc.timecode}`)
        }
      }
    })

    this.ws.on('close', (code, reason) => {
  this.log.warn('Resolume WebSocket closed:', code, reason?.toString?.())
      this._broadcast({ connected: false })
      this._advancePathOnError(code)
      this._scheduleReconnect()
    })

    this.ws.on('error', (err) => {
  this.log.error('Resolume WebSocket error:', err.message)
      this._broadcast({ connected: false })
      this._advancePathOnError(err?.code)
      this._scheduleReconnect()
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
    const delay = this.config.reconnectMs ?? 4000
    this.log.info('Reconnecting in', delay, 'ms')
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null
      this.start()
    }, delay)
  }

  _advancePathOnError(codeOrErr) {
    // Try next candidate path on common failures
    const asStr = typeof codeOrErr === 'string' ? codeOrErr : (codeOrErr?.toString?.() || '')
    const msg = codeOrErr?.message || ''
    const hint404 = asStr.includes('404') || msg.includes('404')
    const connRefused = asStr.includes('ECONNREFUSED') || msg.includes('ECONNREFUSED')
    // Rotate path if 404 or connection refused; otherwise keep
    if (hint404 || connRefused) {
      this._pathIndex = (this._pathIndex + 1) % this._paths.length
      this.log.info('Switching events path to', this._paths[this._pathIndex])
    }
  }

  _broadcast(payload) {
    for (const wc of webContents.getAllWebContents()) {
      wc.send('resolume-timecode-update', payload)
    }
  }
}

module.exports = { ResolumeTimecodeClient }
