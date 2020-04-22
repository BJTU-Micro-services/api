import {buildFastify} from './src/build_fastify'
const server = buildFastify();
// Run the server!
server.listen(3000, '0.0.0.0', (err, address) => {
  if (err) throw err;
  server.log.info(`server listening on ${address}`);
});
