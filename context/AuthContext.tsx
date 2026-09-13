'use client';

/**
 * AuthContext — Demo stub.
 * No Supabase, no authentication. Always returns null user so the app
 * operates in fully open-access mode.
 */

import React, { createContext, useContext, useMemo } from 'react';

export interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    orcid_id: string | null;
    tokens: number;
    avatar_url: string | null;
    role: string;
    [key: string]: any;
}

interface AuthContextType {
    user: null;
    profile: null;
    loading: false;
    isAdmin: false;
    isOrcidUser: false;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: false,
    isAdmin: false,
    isOrcidUser: false,
    refreshProfile: async () => {},
    signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const value = useMemo(() => ({
        user: null as null,
        profile: null as null,
        loading: false as const,
        isAdmin: false as const,
        isOrcidUser: false as const,
        refreshProfile: async () => {},
        signOut: async () => {},
    }), []);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
