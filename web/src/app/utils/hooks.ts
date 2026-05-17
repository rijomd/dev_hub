import { redirect } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';

import { ACCESS_TOKEN, USER_NAME } from "./authConstants";

export const requireAuth = () => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
        throw redirect({
            to: '/login',
        });
    }

    return token;
};


export const isAuthenticated = () => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (token) {
        throw redirect({
            to: '/',
        });
    }
};

export const useLogout = () => {
    const navigate = useNavigate();

    return () => {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(USER_NAME);

        navigate({
            to: '/login',
        });
    };
};