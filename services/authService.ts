import { MOCK_USERS } from '../constants';
import { User } from '../types';

const USER_KEY = 'business_hub_user';

/**
 * Simulates a backend API call to log in.
 * In a real application, this would be a fetch/axios call to a server endpoint.
 * @param email The user's email.
 * @param password The user's password.
 * @param rememberMe Persist login across sessions.
 * @returns A promise that resolves with the User object on success.
 */
export const login = (email: string, password: string, rememberMe: boolean): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate network delay
            const user = MOCK_USERS.find(u => u.email === email);

            // In a real backend, password would be hashed and compared securely.
            const isPasswordCorrect = (user &&
                ((user.email === 'ddarruspe@gmail.com' && password === '1906') ||
                 (user.email !== 'ddarruspe@gmail.com' && password === 'password'))
            );

            if (user && isPasswordCorrect) {
                // In a real app, the backend returns a user object and a JWT.
                // We simulate this by storing the user object in localStorage or sessionStorage.
                const userToStore = { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, companyId: user.companyId, gender: user.gender, permissions: user.permissions };
                
                // Ensure only one session type exists at a time for robustness.
                if (rememberMe) {
                    localStorage.setItem(USER_KEY, JSON.stringify(userToStore));
                    sessionStorage.removeItem(USER_KEY); // Explicitly clear session storage
                } else {
                    sessionStorage.setItem(USER_KEY, JSON.stringify(userToStore));
                    localStorage.removeItem(USER_KEY); // Explicitly clear local storage
                }
                
                resolve(userToStore as User);
            } else {
                reject(new Error('login.errors.invalidCredentials'));
            }
        }, 500);
    });
};

/**
 * Simulates logging out by clearing the session from storage.
 */
export const logout = (): void => {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    // In a real app, you might also call a backend endpoint to invalidate the token.
};

/**
 * Gets the current authenticated user from storage, simulating a persistent session.
 * @returns The User object if a session exists, otherwise null.
 */
export const getCurrentUser = (): User | null => {
    // Prioritize localStorage (remember me) over sessionStorage
    const userJson = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!userJson) {
        return null;
    }
    try {
        // We need to parse date strings back into Date objects if any exist.
        // For now, the user object is simple.
        return JSON.parse(userJson) as User;
    } catch (error) {
        console.error("Failed to parse user from storage", error);
        // Clear corrupted data from both
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(USER_KEY);
        return null;
    }
};