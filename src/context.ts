import { PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

export type Context = {
  prisma: PrismaClient;
  request: FastifyRequest;
  reply: FastifyReply;
};
