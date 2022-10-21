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

export const DateTime = asNexusMethod(DateTimeResolver, "date");

const Query = objectType({
  name: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("users", {
      type: "User",
      resolve: (_, __, ctx) => {
        return ctx.prisma.user.findMany();
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
    t.nonNull.field("signupUser", {
      type: "User",
      args: {
        data: nonNull(
          arg({
            type: "UserCreateInput",
          })
        ),
      },
      resolve: async (_, args, context, info) => {
        const postData = args.data.posts?.map((post) => {
          return { title: post.title, content: post.content || undefined };
        });
        const { tracer } = context.request.openTelemetry();
        const childSpan = tracer.startSpan(`prisma`).setAttributes({
          "prisma.model": "user",
          "prisma.action": "create",
        });
        try {
          const user = await context.prisma.user.create({
            data: {
              name: args.data.name,
              email: args.data.email,
              posts: {
                create: postData,
              },
            },
          });
          return user;
        } catch (e) {
          childSpan.setAttribute("error", true);
          childSpan.setAttribute("prisma.error", e.toString());
          throw e;
        } finally {
          childSpan.end();
        }
      },
    });

    t.field("createDraft", {
      type: "Post",
      args: {
        data: nonNull(
          arg({
            type: "PostCreateInput",
          })
        ),
        authorEmail: nonNull(stringArg()),
      },
      resolve: async (_, args, context) => {
        const { tracer } = context.request.openTelemetry();
        const childSpan = tracer.startSpan(`prisma`).setAttributes({
          "prisma.model": "post",
          "prisma.action": "create",
        });
        const draft = await context.prisma.post.create({
          data: {
            title: args.data.title,
            content: args.data.content,
            author: {
              connect: { email: args.authorEmail },
            },
          },
        });
        childSpan.end();
        return draft;
      },
    });

    t.field("createComment", {
      type: "Comment",
      args: {
        data: nonNull(
          arg({
            type: "CommentCreateInput",
          })
        ),
        authorEmail: nonNull(stringArg()),
        postId: nonNull(intArg()),
      },
      resolve: async (_, args, context) => {
        const { tracer } = context.request.openTelemetry();
        const childSpan = tracer.startSpan(`prisma`).setAttributes({
          "prisma.model": "comment",
          "prisma.action": "create",
        });
        const comment = await context.prisma.comment.create({
          data: {
            comment: args.data.comment,
            post: {
              connect: { id: args.postId },
            },
            author: {
              connect: { email: args.authorEmail },
            },
          },
        });
        childSpan.end();
        return comment;
      },
    });

    t.field("likePost", {
      type: "Post",
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_, args, context) => {
        const { tracer } = context.request.openTelemetry();
        const childSpan = tracer.startSpan(`prisma`).setAttributes({
          "prisma.model": "post",
          "prisma.action": "update",
        });
        const post = await context.prisma.post.update({
          data: {
            likes: {
              increment: 1,
            },
          },
          where: {
            id: args.id,
          },
        });
        childSpan.end();
        return post;
      },
    });

    t.field("togglePublishPost", {
      type: "Post",
      args: {
        id: nonNull(intArg()),
        published: nonNull(booleanArg()),
      },
      resolve: async (_, args, context) => {
        const { tracer } = context.request.openTelemetry();
        const childSpan = tracer.startSpan(`prisma`).setAttributes({
          "prisma.model": "post",
          "prisma.action": "update",
        });
        const post = await context.prisma.post.update({
          where: { id: args.id },
          data: { published: args.published },
        });
        childSpan.end();
        return post;
      },
    });

    t.field("deletePost", {
      type: "Post",
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_, args, context) => {
        const { tracer } = context.request.openTelemetry();
        const childSpan = tracer.startSpan(`prisma`).setAttributes({
          "prisma.model": "post",
          "prisma.action": "delete",
        });
        const post = await context.prisma.post.delete({
          where: { id: args.id },
        });
        childSpan.end();
        return post;
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
    schema: __dirname + "src/generated/schema.graphql",
    typegen: __dirname + "src/generated/nexus.ts",
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
