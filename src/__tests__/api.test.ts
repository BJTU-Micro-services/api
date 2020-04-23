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

  test('/user/create', async (done) => {
    const body = {
      username: 'test_username'
    }
    const response = await fastify.inject({
      method: 'POST',
      url: '/user/create',
      payload: body
    })
    expect(response.statusCode).toBe(200)
    done()
  })

  test('/user/:userToken', async (done) => {
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/user/:userToken',
    })
    expect(response.statusCode).toBe(200)
    done()
  })

  test('/ticket/list', async (done) => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/ticket/list',
    })
    expect(response.statusCode).toBe(200)
    const ticketIds = JSON.parse(response.body).tickets_ids
    expect(ticketIds).toStrictEqual(['ticket_id_1', 'ticket_id_2', 'ticket_id_3'])
    done()
  })

  test('/order/:ticketId', async (done) => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/order/:ticketId',
    })
    expect(response.statusCode).toBe(200)
    done()
  })

  test('/pay success', async (done) => {
    const body = {
      tickets_ids: ['ticket_id_1'],
      payment_id: 'i_totally_paid_for_those'
    }
    const response = await fastify.inject({
      method: 'POST',
      url: '/pay',
      payload: body
    })
    expect(response.statusCode).toBe(200)
    done()
  })

  test('/pay failure', async (done) => {
    const body = {
      tickets_ids: ['ticket_id_1'],
      payment_id: 'invalid_token'
    }
    const response = await fastify.inject({
      method: 'POST',
      url: '/pay',
      payload: body
    })
    expect(response.statusCode).toBe(400)
    done()
  })
})
