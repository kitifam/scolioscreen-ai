import React, { createContext, useContext, useEffect, useState } from 'react';

// Define User type
export interface User {
  id: string;
  email: string;
  username?: string;
}

export interface Profile {
  id: string;
  birth_year?: number;
  sex?: string;
  height?: number;
  weight?: number;
  symptoms?: string;
  consent_given?: boolean;
  updated_at?: string;
}

// Use local storage for mock authentication and sessions
export type Session = { access_token: string; user: User };

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password?: string, username?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<any>) => Promise<void>;
  updateUsername: (newUsername: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => { },
  updateProfile: async () => { },
  updateUsername: async () => { },
  refreshProfile: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const savedProfile = localStorage.getItem(`scolioscreen_profile_${userId}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const updateProfile = async (updates: Partial<any>) => {
    try {
      if (!user) return;
      const currentProfile = profile || {};
      const updatedProfile = { ...currentProfile, ...updates, id: user.id, updated_at: new Date().toISOString() };
      localStorage.setItem(`scolioscreen_profile_${user.id}`, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const updateUsername = async (newUsername: string) => {
    try {
      if (!user) return;

      // Update global users list
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex].username = newUsername;
        localStorage.setItem('scolioscreen_users', JSON.stringify(users));
      }

      // Update current session user
      const updatedUser = { ...user, username: newUsername };
      localStorage.setItem('scolioscreen_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSession(prev => prev ? { ...prev, user: updatedUser } : null);
    } catch (err) {
      console.error('Error updating username:', err);
      throw err;
    }
  };

  useEffect(() => {
    // Load local session
    const localUserStr = localStorage.getItem('scolioscreen_user');
    if (localUserStr) {
      const localUser = JSON.parse(localUserStr);
      setUser(localUser);
      setSession({ access_token: 'mock-token', user: localUser });
      fetchProfile(localUser.id).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const getUsers = (): any[] => {
    try {
      return JSON.parse(localStorage.getItem('scolioscreen_users') || '[]');
    } catch {
      return [];
    }
  };

  const signIn = async (email: string, password?: string) => {
    setIsLoading(true);
    const users = getUsers();
    const existingUser = users.find(u => u.email === email);

    // If it's a social login or password matches
    if (existingUser && (!password || existingUser.password === password)) {
      const userData = { id: existingUser.id, email: existingUser.email, username: existingUser.username };
      localStorage.setItem('scolioscreen_user', JSON.stringify(userData));
      setUser(userData);
      setSession({ access_token: 'mock-token', user: userData });
      await fetchProfile(existingUser.id);
      setIsLoading(false);
      return { error: null };
    }

    setIsLoading(false);
    return { error: new Error('User not found or password incorrect') };
  };

  const signUp = async (email: string, password?: string, username?: string) => {
    setIsLoading(true);
    const users = getUsers();

    if (users.some(u => u.email === email)) {
      setIsLoading(false);
      return { error: new Error('User already exists') };
    }

    const newUser = {
      id: crypto.randomUUID(),
      email: email,
      username: username || '',
      password: password || '', // Empty password for social login
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('scolioscreen_users', JSON.stringify(users));

    // Auto login
    const userData = { id: newUser.id, email: newUser.email, username: newUser.username };
    localStorage.setItem('scolioscreen_user', JSON.stringify(userData));
    setUser(userData);
    setSession({ access_token: 'mock-token', user: userData });
    setProfile(null);
    setIsLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    setIsLoading(true);
    localStorage.removeItem('scolioscreen_user');
    sessionStorage.clear(); // Clear temporary screening data
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading, signIn, signUp, signOut, updateProfile, updateUsername, refreshProfile }}>
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
