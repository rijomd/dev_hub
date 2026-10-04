import { gql } from "graphql-request";

export const LIST_DEVELOPERS_QUERY = gql`
  query ListDevelopers {
    listDevelopers {
      id
      name
      email
      createdBy
    }
  }
`;

export const LIST_PENDING_REQUESTS_QUERY = gql`
  query ListPendingRequests {
    listPendingRequests {
      id
      developerId
      organizationId
      status
      developer {
        id
        name
        email
      }
    }
  }
`;

export const CREATE_DEVELOPER_MUTATION = gql`
  mutation CreateDeveloper($input: CreateDeveloperInput!) {
    createDeveloper(input: $input) {
      id
      name
      email
    }
  }
`;

export const REMOVE_DEVELOPER_MUTATION = gql`
  mutation RemoveDeveloper($id: Int!) {
    removeDeveloper(id: $id)
  }
`;

export const APPROVE_JOIN_REQUEST_MUTATION = gql`
  mutation ApproveJoinRequest($requestId: Int!) {
    approveJoinRequest(requestId: $requestId)
  }
`;

export const REJECT_JOIN_REQUEST_MUTATION = gql`
  mutation RejectJoinRequest($requestId: Int!) {
    rejectJoinRequest(requestId: $requestId)
  }
`;

export const LIST_ORGANIZATIONS_QUERY = gql`
  query ListOrganizations {
    listOrganizations {
      id
      name
      email
    }
  }
`;

export const REQUEST_JOIN_ORG_MUTATION = gql`
  mutation RequestJoinOrganization($orgId: Int!) {
    requestJoinOrganization(orgId: $orgId)
  }
`;
