import { Post as PrismaPost } from "nexus-prisma";
import { objectType } from "nexus";

export const Post = objectType({
  name: PrismaPost.$name,
  definition(t) {
    t.field(PrismaPost.id);
    t.field(PrismaPost.authorId);
    t.field(PrismaPost.comments);
    t.field(PrismaPost.content);
    t.field(PrismaPost.title);
    t.field(PrismaPost.likes);
    t.field(PrismaPost.published);
    t.field(PrismaPost.author);
    t.field(PrismaPost.comments);
    t.field(PrismaPost.createdAt);
  },
});
