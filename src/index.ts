import fastify from "fastify";

const server = fastify({ logger: true });

server.get("/", async (request, reply) => {
  return "Hello there! 👋";
});

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  server.log.info("Incoming request at /");
});
