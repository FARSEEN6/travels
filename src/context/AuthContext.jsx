import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

// Default super-admin emails (always have admin access)
const SUPER_ADMIN_EMAILS = ['farseen.travels@gmail.com'];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ─── Admin Helpers (localStorage-based) ─────────────────────────────
const getAdminList = () => {
  try {
    return JSON.parse(localStorage.getItem('aashmi_admins') || '[]');
  } catch {
    return [];
  }
};

const saveAdminList = (list) => {
  localStorage.setItem('aashmi_admins', JSON.stringify(list));
};

const isEmailAdmin = (email) => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (SUPER_ADMIN_EMAILS.includes(clean)) return true;
  return getAdminList().includes(clean);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Recompute admin status whenever user changes
  const updateAdminStatus = (userObj) => {
    if (userObj?.email) {
      setIsAdmin(isEmailAdmin(userObj.email));
    } else {
      setIsAdmin(false);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // 1. Check localStorage first (fast restore)
    try {
      const storedUser = localStorage.getItem('aashmi_registered_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.email) {
          setUser(parsed);
          setIsRegistered(true);
          updateAdminStatus(parsed);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read user from localStorage:', e);
    }

    // 2. Check Supabase session (handles Google OAuth redirect)
    const checkSupabase = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const authUser = session.user;
          const googleEmail = authUser.email;

          // Check if this Google email is already registered
          const registeredProfile = findRegisteredUserByEmail(googleEmail);
          if (registeredProfile) {
            const merged = {
              ...registeredProfile,
              avatar_url: authUser.user_metadata?.avatar_url || registeredProfile.avatar_url || null,
            };
            setUser(merged);
            setIsRegistered(true);
            updateAdminStatus(merged);
            localStorage.setItem('aashmi_registered_user', JSON.stringify(merged));
          }
        }
      } catch (err) {
        console.warn('Supabase auth check offline/unavailable:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSupabase();

    // 3. Listen for auth state changes (Google OAuth callback)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        const authUser = session.user;
        const googleEmail = authUser.email;

        const registeredProfile = findRegisteredUserByEmail(googleEmail);
        if (registeredProfile) {
          const merged = {
            ...registeredProfile,
            avatar_url: authUser.user_metadata?.avatar_url || registeredProfile.avatar_url || null,
          };
          setUser(merged);
          setIsRegistered(true);
          updateAdminStatus(merged);
          localStorage.setItem('aashmi_registered_user', JSON.stringify(merged));
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsRegistered(false);
        setIsAdmin(false);
        localStorage.removeItem('aashmi_registered_user');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Register a new user with full form data
  const registerUser = async (formData) => {
    const newUser = {
      id: 'usr_' + Date.now(),
      first_name: formData.firstName,
      last_name: formData.lastName,
      full_name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone,
      password: formData.password,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      pin_code: formData.pinCode,
      id_verified: true,
      email_verified: true,
      phone_verified: true,
      created_at: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem('aashmi_registered_user', JSON.stringify(newUser));

    // Save to all_users directory
    try {
      const existingUsers = JSON.parse(localStorage.getItem('aashmi_all_users') || '[]');
      const updated = existingUsers.filter(u => u.email !== newUser.email);
      updated.push(newUser);
      localStorage.setItem('aashmi_all_users', JSON.stringify(updated));
    } catch (err) {
      console.warn('Error saving to all_users list:', err);
    }

    // Auto-set first registered user as admin if no admins exist yet
    const admins = getAdminList();
    if (admins.length === 0 && !SUPER_ADMIN_EMAILS.includes(newUser.email)) {
      admins.push(newUser.email);
      saveAdminList(admins);
    }

    // Try saving to Supabase
    try {
      await supabase.from('registered_users').insert([{
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        id_type: 'REGISTRATION',
        id_number: newUser.id,
        id_verified: true,
        phone_verified: true,
        email_verified: true,
      }]);
    } catch (supabaseErr) {
      console.info('Saved locally:', supabaseErr);
    }

    setUser(newUser);
    setIsRegistered(true);
    updateAdminStatus(newUser);
    return newUser;
  };

  // Login with email + password
  const loginWithCredentials = (email, password) => {
    const profile = findRegisteredUserByEmail(email);
    if (!profile) {
      return { success: false, error: 'No account found with this email. Please register first.' };
    }
    if (profile.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }
    localStorage.setItem('aashmi_registered_user', JSON.stringify(profile));
    setUser(profile);
    setIsRegistered(true);
    updateAdminStatus(profile);
    return { success: true };
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/register',
      },
    });
  };

  // Check Google login after redirect
  const checkGoogleLogin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const profile = findRegisteredUserByEmail(session.user.email);
        return profile || null;
      }
    } catch {
      return null;
    }
    return null;
  };

  // Helper: Find user by email in localStorage
  const findRegisteredUserByEmail = (email) => {
    try {
      const all = JSON.parse(localStorage.getItem('aashmi_all_users') || '[]');
      const clean = email.trim().toLowerCase();
      return all.find(u => u.email?.toLowerCase() === clean) || null;
    } catch {
      return null;
    }
  };

  // Get all registered users
  const getAllRegisteredUsers = () => {
    try {
      return JSON.parse(localStorage.getItem('aashmi_all_users') || '[]');
    } catch {
      return [];
    }
  };

  // ─── Admin Management ─────────────────────────────────────────────
  const setUserAsAdmin = (email) => {
    const clean = email.trim().toLowerCase();
    const admins = getAdminList();
    if (!admins.includes(clean)) {
      admins.push(clean);
      saveAdminList(admins);
    }
    // If the current logged-in user was just promoted, update state
    if (user?.email?.toLowerCase() === clean) {
      setIsAdmin(true);
    }
  };

  const removeUserAsAdmin = (email) => {
    const clean = email.trim().toLowerCase();
    // Cannot remove super admins
    if (SUPER_ADMIN_EMAILS.includes(clean)) return;
    const admins = getAdminList().filter(a => a !== clean);
    saveAdminList(admins);
    if (user?.email?.toLowerCase() === clean) {
      setIsAdmin(false);
    }
  };

  const checkIsAdmin = (email) => {
    return isEmailAdmin(email);
  };

  // Sign out
  const signOut = async () => {
    try {
      localStorage.removeItem('aashmi_registered_user');
      await supabase.auth.signOut().catch(() => {});
    } finally {
      setUser(null);
      setIsRegistered(false);
      setIsAdmin(false);
    }
  };

  // Quick login
  const quickLogin = (foundUser) => {
    localStorage.setItem('aashmi_registered_user', JSON.stringify(foundUser));
    setUser(foundUser);
    setIsRegistered(true);
    updateAdminStatus(foundUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isRegistered,
        isAdmin,
        loading,
        registerUser,
        loginWithCredentials,
        signInWithGoogle,
        checkGoogleLogin,
        findRegisteredUserByEmail,
        getAllRegisteredUsers,
        setUserAsAdmin,
        removeUserAsAdmin,
        checkIsAdmin,
        signOut,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
