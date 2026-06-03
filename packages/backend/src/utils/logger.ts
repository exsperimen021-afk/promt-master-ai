import { config } from '@config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: { [key in LogLevel]: number } = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel = LOG_LEVELS[config.LOG_LEVEL as LogLevel] || LOG_LEVELS.info;

const timestamp = (): string => new Date().toISOString();

const log = (level: LogLevel, message: string, data?: unknown): void => {
  if (LOG_LEVELS[level] < currentLogLevel) return;

  const logMessage = `[${timestamp()}] [${level.toUpperCase()}] ${message}`;
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};

export const logger = {
  debug: (message: string, data?: unknown): void => log('debug', message, data),
  info: (message: string, data?: unknown): void => log('info', message, data),
  warn: (message: string, data?: unknown): void => log('warn', message, data),
  error: (message: string, data?: unknown): void => log('error', message, data),
};
