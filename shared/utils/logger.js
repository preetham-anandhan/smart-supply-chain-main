// ==============================================
// Structured Logger — Smart Supply Chain
// Color-coded, tagged logging for all services
// ==============================================

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const LEVEL_CONFIG = {
  DEBUG: { color: COLORS.gray, emoji: '🔍' },
  INFO: { color: COLORS.cyan, emoji: '📋' },
  WARN: { color: COLORS.yellow, emoji: '⚠️' },
  ERROR: { color: COLORS.red, emoji: '❌' },
  EVENT: { color: COLORS.magenta, emoji: '⚡' },
  AGENT: { color: COLORS.green, emoji: '🤖' },
  AI: { color: COLORS.blue, emoji: '🧠' },
};

function createLogger(tag = 'SYSTEM') {
  const log = (level, message, data = null) => {
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.INFO;
    const timestamp = new Date().toISOString().slice(11, 23);
    const prefix = `${config.color}${config.emoji} [${timestamp}] [${tag}] [${level}]${COLORS.reset}`;

    if (data) {
      console.log(`${prefix} ${message}`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  };

  return {
    debug: (msg, data) => log('DEBUG', msg, data),
    info: (msg, data) => log('INFO', msg, data),
    warn: (msg, data) => log('WARN', msg, data),
    error: (msg, data) => log('ERROR', msg, data),
    event: (msg, data) => log('EVENT', msg, data),
    agent: (msg, data) => log('AGENT', msg, data),
    ai: (msg, data) => log('AI', msg, data),
  };
}

module.exports = { createLogger };
