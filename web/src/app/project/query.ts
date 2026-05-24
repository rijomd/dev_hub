import { gql } from "graphql-request";

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      status
    }
  }
`;

export const GET_PROJECTS_QUERY = gql`
  query GetProjects {
    projects {
      id
      name
      language
      framework
      port
      status
      envVersion
      isLocal
      localPath
      gitUrl
    }
  }
`;


