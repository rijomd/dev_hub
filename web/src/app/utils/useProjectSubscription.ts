import { useEffect } from 'react';
import { createClient } from 'graphql-ws';
import { useQueryClient } from '@tanstack/react-query';

import { getItemLocalStorage } from './hooks';
import { ACCESS_TOKEN, END_POINT_WSS } from './authConstants';
import { subscriptionQuery } from '../project/query';

export const useProjectSubscription = (projectId: number) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const token = getItemLocalStorage(ACCESS_TOKEN);

        // 1. Initialize the WebSocket client
        const wsClient = createClient({
            url: END_POINT_WSS,
            connectionParams: {
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                },
            },
        });

        // 3. Start the subscription
        const unsubscribe = wsClient.subscribe(
            {
                query: subscriptionQuery,
                variables: { id: projectId },
            },
            {
                next: (payload: any) => {
                    console.log(`Live Status Update for Project ${projectId}:`, payload);
                    queryClient.invalidateQueries({ queryKey: ['projects'] });
                },
                error: (err) => console.error('Subscription error:', err),
                complete: () => console.log('Subscription complete'),
            }
        );

        return () => {
            unsubscribe();
            wsClient.dispose();
        };
    }, [projectId, queryClient])


}