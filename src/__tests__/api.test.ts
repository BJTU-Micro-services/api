import {buildFastify} from '../build_fastify'
import Redis from 'redis'
import util from 'util'

describe('api test', () => {
  const redisClient = Redis.createClient();
  redisClient.on("error", function(error) {
    console.error(error);
  });
  const send_command: (command: string, args?: any[]) => Promise<any> = util.promisify(redisClient.send_command).bind(redisClient);

  const fastify = buildFastify()

  beforeEach(function () {
  })

  afterEach(async () => {
    await send_command('FLUSHDB')
  })

  afterAll(async () => {
    await fastify.close()
    await redisClient.quit()
  })

  test('404 on unknown route', async (done) => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/',
    })
    expect(response.statusCode).toBe(404)
    done()
  })
})
