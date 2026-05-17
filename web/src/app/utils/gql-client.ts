import { GraphQLClient } from 'graphql-request';

const endpoint = 'http://localhost:8000/graphql';

export const client = new GraphQLClient(endpoint, {
  headers: () => {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },
});
