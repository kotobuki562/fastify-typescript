import {
  intArg,
  makeSchema,
  nonNull,
  objectType,
  stringArg,
  inputObjectType,
  arg,
  asNexusMethod,
  enumType,
  booleanArg,
} from "nexus";
import { DateTimeResolver } from "graphql-scalars";
// import { User, Post, Comment } from "nexus-prisma";
import { Prisma } from "@prisma/client";
import { User, Comment, Post } from "./model";
import path from "path";
import { GraphQLYogaError } from "@graphql-yoga/node";
import { prisma } from "./plugins/prisma";

interface CacheStore<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
}

export const DateTime = asNexusMethod(DateTimeResolver, "date");

const Query = objectType({
  name: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("users", {
      type: "User",
      resolve: async (_, __, ctx) => {
        console.log(ctx?.prisma || "no prisma");
        const users = await prisma.user.findMany();
        if (users.length === 0) {
          throw new GraphQLYogaError("ユーザーが見つかりません", {
            code: "USER_NOT_FOUND",
          });
        }
        return users;
      },
    });
    t.nonNull.list.nonNull.field("posts", {
      type: "Post",
      resolve: (_, __, ctx) => {
        return ctx.prisma.post.findMany();
      },
    });
    t.nonNull.list.nonNull.field("comments", {
      type: "Comment",
      resolve: (_, __, ctx) => {
        return ctx.prisma.comment.findMany();
      },
    });
  },
});

const Mutation = objectType({
  name: "Mutation",
  definition(t) {
    t.nonNull.field("createUser", {
      type: "User",
      args: {
        data: nonNull(
          arg({
            type: "UserCreateInput",
          })
        ),
      },
      resolve: (_, { data }, ctx) => {
        return ctx.prisma.user
          .create({
            data: {
              name: data.name,
              email: data.email,
            },
          })
          .catch((e) => {
            console.error(e);
            throw e;
          });
      },
    });
  },
});

const SortOrder = enumType({
  name: "SortOrder",
  members: ["asc", "desc"],
});

const PostOrderByUpdatedAtInput = inputObjectType({
  name: "PostOrderByUpdatedAtInput",
  definition(t) {
    t.nonNull.field("updatedAt", { type: "SortOrder" });
  },
});

const UserUniqueInput = inputObjectType({
  name: "UserUniqueInput",
  definition(t) {
    t.int("id");
    t.string("email");
  },
});

const PostCreateInput = inputObjectType({
  name: "PostCreateInput",
  definition(t) {
    t.nonNull.string("title");
    t.string("content");
  },
});

const CommentCreateInput = inputObjectType({
  name: "CommentCreateInput",
  definition(t) {
    t.nonNull.string("comment");
  },
});

const UserCreateInput = inputObjectType({
  name: "UserCreateInput",
  definition(t) {
    t.nonNull.string("email");
    t.string("name");
    t.list.nonNull.field("posts", { type: "PostCreateInput" });
  },
});

export const schema = makeSchema({
  types: [
    Query,
    Mutation,
    User,
    Comment,
    Post,
    UserUniqueInput,
    UserCreateInput,
    PostCreateInput,
    CommentCreateInput,
    SortOrder,
    PostOrderByUpdatedAtInput,
    DateTime,
  ],
  outputs: {
    schema: path.join(process.cwd(), "src/generated/schema.graphql"),
    typegen: path.join(process.cwd(), "src/generated/nexus.ts"),
  },
  contextType: {
    module: require.resolve("./context"),
    export: "Context",
  },
  sourceTypes: {
    modules: [
      {
        module: "@prisma/client",
        alias: "prisma",
      },
    ],
  },
});
