import { gql } from "graphql-request";

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      access_token
      name
      email
    }
  }
`;

