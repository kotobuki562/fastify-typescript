import { GraphQLYogaError } from "@graphql-yoga/node";

const ErrorCode = {
  USER_NOT_FOUND: "USER_NOT_FOUND",
  POST_NOT_FOUND: "POST_NOT_FOUND",
  COMMENT_NOT_FOUND: "COMMENT_NOT_FOUND",
} as const;

type GraphQLYogaErrorProps = {
  message: string;
  code: keyof typeof ErrorCode;
  description?: string;
};

export const graphqlYogaError = ({
  message,
  description,
  code,
}: GraphQLYogaErrorProps): GraphQLYogaError => {
  const error = new GraphQLYogaError(message, {
    code,
    description,
  });
  return error;
};
