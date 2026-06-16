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
    login: (username: string, password: string) => Promise<void>;
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
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('airlink_user');
                localStorage.removeItem('airlink_token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        const response = await api.post('/login', { username, password });
        const { token, user: loggedInUser } = response.data;

        localStorage.setItem('airlink_token', token);
        localStorage.setItem('airlink_user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
    };

    const logout = async () => {
        try {
            await api.post('/logout');
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
