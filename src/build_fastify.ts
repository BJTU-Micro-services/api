import fastify, {FastifyInstance} from 'fastify'
import FluentSchema from 'fluent-schema'
import Redis from 'redis'
import {EXPONENT_PUSH_TOKEN, LATITUDE, LONGITUDE, MESSAGE} from './constants'
import util from 'util'
// import fs from 'fs'
// import path from 'path'

export function buildFastify(): FastifyInstance {
  const redisClient = Redis.createClient();
  redisClient.on("error", function(error) {
    console.error(error);
  });
  const send_command: (command: string, args?: any[]) => Promise<any> = util.promisify(redisClient.send_command).bind(redisClient);

  // Require the server framework and instantiate it
  const server = fastify({
    logger: true,
    // https: {
    //   key: fs.readFileSync(path.join(__dirname, 'file.key')),
    //   cert: fs.readFileSync(path.join(__dirname, 'file.cert'))
    // }
  });

  const helpersRouteBodySchema = FluentSchema.object()
    .prop(EXPONENT_PUSH_TOKEN, FluentSchema.string()).required()
    .prop(LATITUDE, FluentSchema.number()).required()
    .prop(LONGITUDE, FluentSchema.number()).required();
  // Helpers route
  server.post('/helpers', {
    schema: {
      body: helpersRouteBodySchema,
    },
  }, async (request, reply) => {
    reply.code(200).send();
  });

  const deleteHelpersRouteBodySchema = FluentSchema.object()
    .prop(EXPONENT_PUSH_TOKEN, FluentSchema.string()).required();
  // This route deletes the helper prematurely from the database
  server.delete('/helpers', {
    schema: {
      body: deleteHelpersRouteBodySchema,
    },
  }, async (request, reply) => {
    reply.code(200).send();
  });

  const helpeeRouteBodySchema = FluentSchema.object()
    .prop(LATITUDE, FluentSchema.number()).required()
    .prop(LONGITUDE, FluentSchema.number()).required()
    .prop(MESSAGE, FluentSchema.string()).required();
  // Helpee route
  server.post('/helpee', {
    schema: {
      body: helpeeRouteBodySchema,
    },
  }, async (request, reply) => {
    reply.code(200).send({});
  });

  server.addHook('onClose', async (instance, done) => {
    await redisClient.quit()
    done()
  })

  return server;
}
