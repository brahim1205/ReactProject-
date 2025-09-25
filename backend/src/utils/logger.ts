import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'todolist-api' },
  transports: [
    // Écrire tous les logs de niveau `error` et en dessous dans `error.log`
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Écrire tous les logs de niveau `info` et en dessous dans `combined.log`
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Si nous ne sommes pas en production, logger aussi dans la console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;