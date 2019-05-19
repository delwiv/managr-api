import redis from 'redis'

import bluebird from 'bluebird'

bluebird.promisifyAll(redis)

const ONE_DAY = 60 * 60 * 24

const redisClient = redis.createClient()

export const MAILCOUNT_KEY = 'email.task'

const client = {
  set: (key, value, expire = ONE_DAY) => redisClient.setAsync(key, value, 'EX', expire),
  get: key => redisClient.getAsync(key),
  del: key => redisClient.delAsync(key),
  find: pattern => redisClient.keysAsync(pattern),
  expire: (key, expire = ONE_DAY) => redisClient.expireAsync(key, expire),
}

export default client
