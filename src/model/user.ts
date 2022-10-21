import { User as PrismaUser } from "nexus-prisma";
import { objectType } from "nexus";

export const User = objectType({
  name: PrismaUser.$name,
  definition(t) {
    t.field(PrismaUser.id);
    t.field(PrismaUser.name);
    t.field(PrismaUser.email);
    t.field(PrismaUser.posts);
    t.field(PrismaUser.comments);
  },
});
