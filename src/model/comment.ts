import { Comment as PrismaCommnet } from "nexus-prisma";
import { objectType } from "nexus";

export const Comment = objectType({
  name: PrismaCommnet.$name,
  definition(t) {
    t.field(PrismaCommnet.id);
    t.field(PrismaCommnet.authorId);
    t.field(PrismaCommnet.postId);
    t.field(PrismaCommnet.author);
    t.field(PrismaCommnet.comment);
    t.field(PrismaCommnet.post);
    t.field(PrismaCommnet.createdAt);
  },
});
