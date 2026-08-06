import { gql } from "graphql-request";

export const GET_PROJECT_ERRORS_QUERY = gql`
  query GetProjectErrors {
    projectErrors {
      id
      message
      action
      details
      timestamp
      project {
        id
        name
      }
    }
  }
`;
