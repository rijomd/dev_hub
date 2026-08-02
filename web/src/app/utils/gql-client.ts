import { GraphQLClient } from 'graphql-request';
import { ACCESS_TOKEN, END_POINT_HTTP } from './authConstants';
import { getItemLocalStorage } from './hooks';

export const client = new GraphQLClient(END_POINT_HTTP, {
  headers: () => {
    const token = getItemLocalStorage(ACCESS_TOKEN)
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },
});


export async function gqlRequest<T>(
  document: string,
  variables?: Record<string, any>,
): Promise<T> {
  return client.request<T>(document, variables);
}
