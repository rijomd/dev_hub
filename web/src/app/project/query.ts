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

export const RUN_PROJECT_MUTATION = gql`
  mutation RunProject($id: Int!) {
    runProject(id: $id) {
      id
      status
    }
  }
`;

export const BUILD_PROJECT_MUTATION = gql`
  mutation BuildProject($id: Int!) {
    buildProject(id: $id) {
      id
      status
    }
  }
`;

export const STOP_PROJECT_MUTATION = gql`
  mutation StopProject($id: Int!) {
    stopProject(id: $id) {
      id
      status
    }
  }
`;

export const subscriptionQuery = `
      subscription OnProjectStatusChanged($id: Int!) {
        projectStatusChanged(id: $id) {
          id
          status
        }
      }
    `;

export const GET_PROJECT_ERRORS_QUERY = gql`
  query GetProjectErrors($first: Int, $after: String) {
    projectErrors(first: $first, after: $after) {
      edges {
        cursor
        node {
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
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
