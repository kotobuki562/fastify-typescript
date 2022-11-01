import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifyServerOptions,
} from "fastify";

import { createServer } from "@graphql-yoga/node";
import { schema } from "./schema";

import prismaPlugin from "./plugins/prisma";
import { Context } from "./context";
import statusPlugin from "./plugins/status";
import { cors } from "./cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = fastify({ logger: true });

const graphQLServer = createServer<{
  req: FastifyRequest;
  reply: FastifyReply;
}>({
  cors,
  // Integrate Fastify logger
  schema,
  /* キャッシュのオプショn
  parserCache: {
    documentCache: documentCacheStore as CacheStore<DocumentNode>,
    errorCache: errorCacheStore as CacheStore<Error>,
  }, */
  logging: {
    debug: (...args) => args.forEach((arg) => app.log.debug(arg)),
    info: (...args) => args.forEach((arg) => app.log.info(arg)),
    warn: (...args) => args.forEach((arg) => app.log.warn(arg)),
    error: (...args) => args.forEach((arg) => app.log.error(arg)),
  },
  // maskedErrors: false,
});

app.register(statusPlugin);
app.register(prismaPlugin);

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

export async function startServer() {
  try {
    const port = process.env.PORT ?? 4000;
    await app.listen(port, "0.0.0.0");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
