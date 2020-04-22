import fastify, {FastifyInstance} from 'fastify'
import FluentSchema from 'fluent-schema'
import Redis from 'redis'
import {KafkaClient, HighLevelProducer, Consumer} from 'kafka-node'
// import util from 'util'
// import fs from 'fs'
// import path from 'path'

export function buildFastify(): FastifyInstance {
  const redisClient = Redis.createClient();
  redisClient.on("error", function(error) {
    console.error(error);
  });
  //const send_command: (command: string, args?: any[]) => Promise<any> = util.promisify(redisClient.send_command).bind(redisClient);

  const kafkaClient = new KafkaClient()
  const producer = new HighLevelProducer(kafkaClient)
  const userConsumer = new Consumer(
    kafkaClient,
    [
      { topic: 'users'}
    ],
    {
      autoCommit: true
    }
  );

  // Require the server framework and instantiate it
  const server = fastify({
    logger: true,
    // https: {
    //   key: fs.readFileSync(path.join(__dirname, 'file.key')),
    //   cert: fs.readFileSync(path.join(__dirname, 'file.cert'))
    // }
  });

  // User creation route
  server.post('/user/create', async (request, reply) => {
    const payloads = [{ topic: "users", messages: {
        type: "requesting_user_creation"
      } }]
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error(err);
        reply.code(500).send()
      }
      console.log("Produced", data);
      reply.code(200).send()
    });
  });
  // This route deletes the user
  server.delete('/user/:userToken', async (request, reply) => {
    reply.code(200).send();
  });

  server.get('/ticket/list', (request, reply) => {
    const tickets = ['ticket_id_1', 'ticket_id_2', 'ticket_id_3']
    const response = {
      tickets_ids: tickets
    }
    reply.code(200).send(response);
  });

  server.post('/order/:ticketId', async (request, reply) => {
    reply.code(200).send();
  })

  const paySchema = FluentSchema.object()
    .prop("tickets_ids", FluentSchema.array().items(FluentSchema.string())).required()
    .prop("payment_id", FluentSchema.string()).required();
  // Payment route route
  server.post('/pay', {
    schema: {
      body: paySchema,
    },
  }, async (request, reply) => {
    const paymentId = request.body['payment_id'];
    const code = paymentId == 'i_totally_paid_for_those' ? 200 : 400
    reply.code(code).send();
  });

  server.addHook('onClose', async (instance, done) => {
    await redisClient.quit()
    kafkaClient.close()
    done()
  })

  return server;
}
