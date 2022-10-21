-- CreateIndex
CREATE INDEX "Comment_postId_authorId_idx" ON "Comment"("postId", "authorId");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");
