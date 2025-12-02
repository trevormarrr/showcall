/**
 * Logger Utility for ShowCall
 * Provides structured logging with levels, timestamps, and log rotation
 * 
 * Usage:
 *   import logger from './lib/logger.js'
 *   logger.info('Server started', { port: 3200 })
 *   logger.error('Connection failed', { error: err.message })
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

class Logger {
  constructor() {
    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      FATAL: 4
    };
    
    // Configuration
    this.currentLevel = process.env.LOG_LEVEL || 'INFO';
    this.logToFile = process.env.LOG_TO_FILE !== 'false';
    this.logToConsole = process.env.LOG_TO_CONSOLE !== 'false';
    
    // Log directory setup
    const USER_DATA_DIR = process.env.SERVER_USER_DATA
      || (process.platform === 'darwin'
          ? path.join(os.homedir(), 'Library', 'Application Support', 'ShowCall')
          : process.platform === 'win32'
            ? path.join(os.homedir(), 'AppData', 'Roaming', 'ShowCall')
            : path.join(os.homedir(), '.showcall'));
    
    this.logDir = path.join(USER_DATA_DIR, 'logs');
    this.logFile = path.join(this.logDir, 'showcall.log');
    this.errorLogFile = path.join(this.logDir, 'error.log');
    
    // Create log directory
    if (this.logToFile) {
      try {
        fs.mkdirSync(this.logDir, { recursive: true });
        this.rotateLogsIfNeeded();
      } catch (error) {
        console.error('Failed to create log directory:', error);
        this.logToFile = false;
      }
    }
    
    // Start daily rotation check
    this.startRotationCheck();
  }
  
  /**
   * Check if log rotation is needed (daily or >100MB)
   */
  rotateLogsIfNeeded() {
    try {
      if (fs.existsSync(this.logFile)) {
        const stats = fs.statSync(this.logFile);
        const fileSizeMB = stats.size / (1024 * 1024);
        const fileAge = Date.now() - stats.mtimeMs;
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        if (fileSizeMB > 100 || fileAge > oneDayMs) {
          this.rotateLogs();
        }
      }
    } catch (error) {
      console.error('Log rotation check failed:', error);
    }
  }
  
  /**
   * Rotate logs by renaming with timestamp
   */
  rotateLogs() {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const rotatedFile = path.join(this.logDir, `showcall-${timestamp}.log`);
      const rotatedErrorFile = path.join(this.logDir, `error-${timestamp}.log`);
      
      if (fs.existsSync(this.logFile)) {
        fs.renameSync(this.logFile, rotatedFile);
      }
      if (fs.existsSync(this.errorLogFile)) {
        fs.renameSync(this.errorLogFile, rotatedErrorFile);
      }
      
      // Clean up old logs (keep last 7 days)
      this.cleanupOldLogs();
      
      this.info('Logs rotated successfully');
    } catch (error) {
      console.error('Log rotation failed:', error);
    }
  }
  
  /**
   * Remove log files older than 7 days
   */
  cleanupOldLogs() {
    try {
      const files = fs.readdirSync(this.logDir);
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      files.forEach(file => {
        if (file.startsWith('showcall-') || file.startsWith('error-')) {
          const filePath = path.join(this.logDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtimeMs < sevenDaysAgo) {
            fs.unlinkSync(filePath);
            console.log(`Removed old log file: ${file}`);
          }
        }
      });
    } catch (error) {
      console.error('Log cleanup failed:', error);
    }
  }
  
  /**
   * Start daily rotation check
   */
  startRotationCheck() {
    // Check every hour for log rotation
    setInterval(() => {
      this.rotateLogsIfNeeded();
    }, 60 * 60 * 1000);
  }
  
  /**
   * Format log message with timestamp and metadata
   */
  formatMessage(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const meta = Object.keys(metadata).length > 0 
      ? JSON.stringify(metadata) 
      : '';
    
    return `[${timestamp}] [${level}] ${message} ${meta}`.trim();
  }
  
  /**
   * Write log to file
   */
  writeToFile(message, isError = false) {
    if (!this.logToFile) return;
    
    try {
      const file = isError ? this.errorLogFile : this.logFile;
      fs.appendFileSync(file, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
  
  /**
   * Write log to console with colors
   */
  writeToConsole(level, message) {
    if (!this.logToConsole) return;
    
    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m',  // Green
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m', // Red
      FATAL: '\x1b[35m'  // Magenta
    };
    const reset = '\x1b[0m';
    
    const coloredLevel = `${colors[level] || ''}${level}${reset}`;
    const coloredMessage = message.replace(`[${level}]`, `[${coloredLevel}]`);
    
    if (level === 'ERROR' || level === 'FATAL') {
      console.error(coloredMessage);
    } else if (level === 'WARN') {
      console.warn(coloredMessage);
    } else {
      console.log(coloredMessage);
    }
  }
  
  /**
   * Log a message at the specified level
   */
  log(level, message, metadata = {}) {
    const levelValue = this.levels[level];
    const currentLevelValue = this.levels[this.currentLevel];
    
    if (levelValue < currentLevelValue) {
      return; // Skip if below current log level
    }
    
    const formattedMessage = this.formatMessage(level, message, metadata);
    
    // Write to console
    this.writeToConsole(level, formattedMessage);
    
    // Write to file
    const isError = level === 'ERROR' || level === 'FATAL';
    this.writeToFile(formattedMessage, isError);
  }
  
  /**
   * Convenience methods for different log levels
   */
  debug(message, metadata) {
    this.log('DEBUG', message, metadata);
  }
  
  info(message, metadata) {
    this.log('INFO', message, metadata);
  }
  
  warn(message, metadata) {
    this.log('WARN', message, metadata);
  }
  
  error(message, metadata) {
    this.log('ERROR', message, metadata);
  }
  
  fatal(message, metadata) {
    this.log('FATAL', message, metadata);
  }
  
  /**
   * Log with action context (audit trail)
   */
  action(user, action, target, result, metadata = {}) {
    const actionLog = {
      user: user || 'system',
      action,
      target,
      result,
      ...metadata
    };
    this.info(`ACTION: ${action}`, actionLog);
  }
  
  /**
   * Log performance metrics
   */
  metric(name, value, unit = 'ms', metadata = {}) {
    const metricLog = {
      metric: name,
      value,
      unit,
      ...metadata
    };
    this.info(`METRIC: ${name} = ${value}${unit}`, metricLog);
  }
}

// Create singleton instance
const logger = new Logger();

// Export as default
export default logger;

// Export class for testing
export { Logger };
