import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Configure daily rotation for logs
const transport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    transport,
    new winston.transports.Console()
  ]
});

// Utility to hide sensitive information
const hideSensitiveData = (body: any) => {
  const clonedBody = { ...body };
  return clonedBody;
};

const hideSensitiveRes = (body: any) => {
  const clonedBody = { ...body };
  return clonedBody;
}

// Logger middleware
const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const oldWrite = res.write.bind(res);
  const oldEnd = res.end.bind(res);

  const chunks: Buffer[] = [];

  res.write = function (chunk: any, encoding?: string | Function, callback?: Function): boolean {
    chunks.push(Buffer.from(chunk));
    return oldWrite(chunk, encoding as any, callback as any);
  };

  res.end = function (chunk?: any, encoding?: string | Function, callback?: Function) {
    if (chunk) {
      chunks.push(Buffer.from(chunk));
    }
    const body = Buffer.concat(chunks).toString('utf8');
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      requestBody: hideSensitiveData(req.body),
      responseBody: hideSensitiveRes(body),
      status: res.statusCode,
      headers: req.headers,
      query: req.query
    };
  
    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error(logEntry);
    } else if (res.statusCode >= 400) {
      logger.warn(logEntry);
    } else {
      logger.info(logEntry);
    }
  
    return oldEnd(chunk, encoding as any, callback as any);
  };
  

  next();
};

export default loggerMiddleware;
