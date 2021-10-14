import is from 'electron-is'
import logger from 'electron-log'

logger.transports.file.level = is.production() ? 'warn' : 'silly'
logger.info('[OverClock] Logger init')
logger.warn('[OverClock] Logger init')

export default logger
