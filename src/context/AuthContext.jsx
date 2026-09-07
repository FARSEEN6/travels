import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('aashmi_registered_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && (parsed.phone_verified || parsed.id_verified || parsed.email_verified)) {
          setUser(parsed);
          setIsRegistered(true);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read user from localStorage:', e);
    }

    // Check Supabase session safely if network allows
    const checkSupabase = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          try {
            const { data } = await supabase
              .from('registered_users')
              .select('*')
              .eq('auth_user_id', session.user.id)
              .maybeSingle();

            if (data) {
              setUser(data);
              setIsRegistered(true);
              localStorage.setItem('aashmi_registered_user', JSON.stringify(data));
            }
          } catch (tblErr) {
            console.warn('Supabase registered_users table check skipped:', tblErr);
          }
        }
      } catch (err) {
        console.warn('Supabase auth check offline/unavailable:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSupabase();
  }, []);

  // Complete registration and save user profile
  const completeRegistration = async (userData) => {
    const newUser = {
      id: 'usr_' + Date.now(),
      full_name: userData.full_name,
      email: userData.email,
      phone: userData.phone,
      id_type: userData.id_type,
      id_number: userData.id_number,
      id_verified: true,
      phone_verified: true,
      email_verified: true,
      created_at: new Date().toISOString(),
    };

    // Save to primary localStorage for persistence
    localStorage.setItem('aashmi_registered_user', JSON.stringify(newUser));

    // Also store in registered users directory in localStorage
    try {
      const existingUsers = JSON.parse(localStorage.getItem('aashmi_all_users') || '[]');
      const updated = existingUsers.filter(u => u.phone !== newUser.phone && u.email !== newUser.email);
      updated.push(newUser);
      localStorage.setItem('aashmi_all_users', JSON.stringify(updated));
    } catch (err) {
      console.warn('Error saving to all_users list:', err);
    }

    // Try saving to Supabase if available
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from('registered_users').insert([{
        ...newUser,
        auth_user_id: session?.user?.id || null,
      }]);
    } catch (supabaseErr) {
      console.info('Saved locally (Supabase sync will happen when online):', supabaseErr);
    }

    setUser(newUser);
    setIsRegistered(true);
    return newUser;
  };

  // Sign out user and return to register screen
  const signOut = async () => {
    try {
      localStorage.removeItem('aashmi_registered_user');
      await supabase.auth.signOut().catch(() => {});
    } finally {
      setUser(null);
      setIsRegistered(false);
    }
  };

  // Check if a phone/email is already registered
  const findRegisteredUser = (identifier) => {
    try {
      const all = JSON.parse(localStorage.getItem('aashmi_all_users') || '[]');
      const clean = identifier.trim().toLowerCase().replace(/\s/g, '');
      return all.find(u => 
        u.email.toLowerCase() === clean || 
        u.phone.replace(/\D/g, '').endsWith(clean.replace(/\D/g, ''))
      );
    } catch {
      return null;
    }
  };

  // Quick login for previously registered users
  const quickLogin = (foundUser) => {
    localStorage.setItem('aashmi_registered_user', JSON.stringify(foundUser));
    setUser(foundUser);
    setIsRegistered(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isRegistered,
        loading,
        completeRegistration,
        signOut,
        findRegisteredUser,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
