import { gql } from "graphql-tag";

export const verifyUserGoogleTokenQuery = gql(`
  #graphql
  query VerifyUserGoogleToken($token: String!) {
    verifyGoogleToken(token: $token)
  }
`);