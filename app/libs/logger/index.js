import logger from 'morgan';
import moment from 'moment-timezone';

const stream = {
  // eslint-disable-next-line no-unused-vars
  write(message, encoding) {
    logger.silly(message);
  }
};

logger.token('cookie', req => req.cookie);
logger.token('remote-ip', req => req.ip || req.headers['x-real-ip'] || req.headers['x-forwarded-for']);
logger.token('host', req => req.hostname);
logger.token('user', req => {
  if (req.user) {
    return req.user;
  }
  return 'no user info';
});
logger.token('params', req => req.params);
logger.token('body', req => req.body);
logger.token('query', req => req.query);
logger.token('date', () => moment().tz('Asia/Seoul').format());

const dev = logger((tokens, req, res) => {
  return JSON.stringify({
    userIPv4: tokens['remote-ip'](req, res),
    user: tokens.user(req, res),
    dateTime: tokens.date(),
    method: tokens.method(req, res),
    host: tokens.host(req),
    url: decodeURI(tokens.url(req, res)),
    'total-time': `${tokens['total-time'](req, res)} ms`,
    'response-time': `${tokens['response-time'](req, res)} ms`,
    'http-version': tokens['http-version'](req, res),
    'status-code': tokens.status(req, res),
    query: tokens.query(req),
    params: tokens.params(req),
    body: tokens.body(req),
    'content-length': tokens.res(req, res, 'content-length'),
    referrer: tokens.referrer(req, res),
    cookie: tokens.cookie(req),
    'user-agent': tokens['user-agent'](req, res)
  });
});

export default { stream, dev };
