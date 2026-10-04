export type LoginResponse = {
    login: {
        access_token: string;
        name: string;
        email: string;
        userType: string;
        createdBy: number | null;
    };
}