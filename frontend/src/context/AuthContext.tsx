import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

interface User {
    id: number;
    username: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string, portal?: 'staff' | 'customer') => Promise<void>;
    logout: () => Promise<void>;
    hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Try to load cached user session on mount
        const storedUser = localStorage.getItem('airlink_user');
        const token = localStorage.getItem('airlink_token');

        if (token && storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed && parsed.role) {
                    parsed.role = parsed.role.toLowerCase();
                }
                setUser(parsed);
            } catch (e) {
                localStorage.removeItem('airlink_user');
                localStorage.removeItem('airlink_token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username: string, password: string, portal: 'staff' | 'customer' = 'staff') => {
        const endpoint = portal === 'customer' ? '/customer/login' : '/login';
        const response = await api.post(endpoint, { username, password });
        const { token, user: loggedInUser, customer: loggedInCustomer } = response.data;

        const sessionUser = portal === 'customer' ? loggedInCustomer : loggedInUser;
        if (sessionUser && sessionUser.role) {
            sessionUser.role = sessionUser.role.toLowerCase();
        }

        localStorage.setItem('airlink_token', token);
        localStorage.setItem('airlink_user', JSON.stringify(sessionUser));
        setUser(sessionUser);
    };

    const logout = async () => {
        try {
            const endpoint = user?.role === 'customer' ? '/customer/logout' : '/logout';
            await api.post(endpoint);
        } catch (e) {
            // Ignore error on logout request, still clear local session
        } finally {
            localStorage.removeItem('airlink_token');
            localStorage.removeItem('airlink_user');
            setUser(null);
        }
    };

    const hasRole = (...roles: string[]): boolean => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
