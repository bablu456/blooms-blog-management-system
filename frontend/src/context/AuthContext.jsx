import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import {
    AUTH_SESSION_EVENT,
    clearStoredSession,
    getStoredSession,
    getStoredUser,
    persistSession,
    updateStoredUser,
} from '../services/session';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = getStoredUser();
        if (user) setCurrentUser(user);
        setLoading(false);
    }, []);

    useEffect(() => {
        const syncSession = () => {
            setCurrentUser(getStoredUser());
        };

        window.addEventListener(AUTH_SESSION_EVENT, syncSession);
        return () => window.removeEventListener(AUTH_SESSION_EVENT, syncSession);
    }, []);

    const login = (authPayload) => {
        const isTokenSession = authPayload?.accessToken && authPayload?.refreshToken && authPayload?.user;
        if (isTokenSession) {
            persistSession(authPayload);
            setCurrentUser(authPayload.user);
            toast.success(`Welcome back, ${authPayload.user.name || authPayload.user.username || 'User'}!`);
            return;
        }

        if (authPayload?.id) {
            updateStoredUser(authPayload);
            setCurrentUser(authPayload);
            toast.success(`Welcome back, ${authPayload.name || authPayload.username || 'User'}!`);
        }
    };

    const logout = async () => {
        const refreshToken = getStoredSession()?.refreshToken;
        try {
            if (refreshToken) {
                await api.post('/user/logout', { refreshToken });
            }
        } catch (error) {
            // Session clear should still continue even if server revocation call fails.
        }
        setCurrentUser(null);
        clearStoredSession();
        toast.success("Logged out successfully");
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
