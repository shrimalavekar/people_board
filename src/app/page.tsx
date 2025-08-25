'use client'

import React, { useState, useEffect } from 'react';
import { LoginScreen } from '@/components/LoginScreen';
import { SignupScreen } from '@/components/SignupScreen';
import { UserEntryScreen } from '@/components/UserEntryScreen';
import { DashboardScreen } from '@/components/DashboardScreen';
import { supabase } from '@/utils/supabase/client';
import { Toaster } from '@/components/ui/sonner';
import type { User } from '@/types';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user && !error) {
        setUser(session.user as User);
        setAccessToken(session.access_token);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    setAccessToken(token);
    setShowSignup(false);
  };

  const handleSignup = (userData: User, token: string) => {
    setUser(userData);
    setAccessToken(token);
    setShowSignup(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAccessToken(null);
      setShowSignup(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not logged in - show login or signup
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Toaster />
        {showSignup ? (
          <SignupScreen 
            onSignup={handleSignup} 
            onBackToLogin={() => setShowSignup(false)} 
          />
        ) : (
          <LoginScreen 
            onLogin={handleLogin} 
            onGoToSignup={() => setShowSignup(true)} 
          />
        )}
      </div>
    );
  }

  // Logged in - check role
  const isSuperAdmin = user.user_metadata?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      {isSuperAdmin ? (
        <DashboardScreen
          user={user}
          accessToken={accessToken}
          onLogout={handleLogout}
        />
      ) : (
        <UserEntryScreen
          user={user}
          accessToken={accessToken}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
