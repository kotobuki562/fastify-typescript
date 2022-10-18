import { createServer } from "@graphql-yoga/node";
import fastify, { FastifyRequest, FastifyReply } from "fastify";

// This is the fastify instance you have created
const app = fastify({ logger: true });

const graphQLServer = createServer<{
  req: FastifyRequest;
  reply: FastifyReply;
}>({
  // Integrate Fastify logger
  logging: {
    debug: (...args) => args.forEach((arg) => app.log.debug(arg)),
    info: (...args) => args.forEach((arg) => app.log.info(arg)),
    warn: (...args) => args.forEach((arg) => app.log.warn(arg)),
    error: (...args) => args.forEach((arg) => app.log.error(arg)),
  },
});

/**
 * We pass the incoming HTTP request to GraphQL Yoga
 * and handle the response using Fastify's `reply` API
 * Learn more about `reply` https://www.fastify.io/docs/latest/Reply/
 **/
app.route({
  url: "/graphql",
  method: ["GET", "POST", "OPTIONS"],
  async handler(req, reply) {
    // Second parameter adds Fastify's `req` and `reply` to the GraphQL Context
    const response = await graphQLServer.handleIncomingMessage(req, {
      req,
      reply,
    });
    response.headers.forEach((value, key) => {
      reply.header(key, value);
    });

    reply.status(response.status);

    reply.send(response.body);

    return reply;
  },
});

app.listen(4000);
