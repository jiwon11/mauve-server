import winston, { createLogger, format, transports } from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
const { combine, timestamp, printf, colorize, label, prettyPrint, json } = format;

const logDir = 'logs'; // logs 디렉토리 하위에 로그 파일 저장

const logFormat = printf(info => {
  return info.message;
});
/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    label({ label: process.env.NODE_ENV }),
    logFormat,
    json(),
    prettyPrint()
  ),
  transports: [
    // info 레벨 로그를 저장할 파일 설정
    new winstonDaily({
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir,
      filename: `%DATE%.log`, // file 이름 날짜로 저장
      maxFiles: 30, // 30일치 로그 파일 저장
      zippedArchive: true
    }),
    // warn 레벨 로그를 저장할 파일 설정
    new winstonDaily({
      level: 'warn',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/warn',
      filename: `%DATE%.warn.log`, // file 이름 날짜로 저장
      maxFiles: 30, // 30일치 로그 파일 저장
      zippedArchive: true
    }),
    // error 레벨 로그를 저장할 파일 설정
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/error', // error.log 파일은 /logs/error 하위에 저장
      filename: `%DATE%.error.log`,
      maxFiles: 30,
      zippedArchive: true
    })
  ]
});

logger.stream = {
  // morgan wiston 설정
  write: message => {
    logger.info(message);
  }
};

logger.add(
  new winston.transports.Console({
    format: combine(
      colorize({ all: true }), // console 에 출력할 로그 컬러 설정 적용함
      logFormat
    )
  })
);

export default logger;
