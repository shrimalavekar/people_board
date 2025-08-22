"use client";

import React, { useState, useEffect } from 'react';
import { LoginScreen } from '@/components/LoginScreen';
import { SignupScreen } from '@/components/SignupScreen';
import { DashboardScreen } from '@/components/DashboardScreen';
import { UserEntryScreen } from '@/components/UserEntryScreen';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

type Screen = 'login' | 'signup' | 'dashboard' | 'user-entry';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const user = session.user as User;
          setUser(user);
          setAccessToken(session.access_token);
          
          // Check user role and redirect accordingly
          const userRole = user.user_metadata?.role;
          if (userRole === 'super_admin') {
            setCurrentScreen('dashboard');
          } else {
            setCurrentScreen('user-entry');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user as User;
          setUser(user);
          setAccessToken(session.access_token);
          
          // Check user role and redirect accordingly
          const userRole = user.user_metadata?.role;
          if (userRole === 'super_admin') {
            setCurrentScreen('dashboard');
          } else {
            setCurrentScreen('user-entry');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAccessToken(null);
          setCurrentScreen('login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (user: User, token: string) => {
    setUser(user);
    setAccessToken(token);
    
    // Check user role and redirect accordingly
    const userRole = user.user_metadata?.role;
    if (userRole === 'super_admin') {
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('user-entry');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAccessToken(null);
      setCurrentScreen('login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleGoToSignup = () => {
    setCurrentScreen('signup');
  };

  const handleGoToLogin = () => {
    setCurrentScreen('login');
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  switch (currentScreen) {
    case 'login':
      return (
        <LoginScreen
          onLogin={handleLogin}
          onGoToSignup={handleGoToSignup}
        />
      );
    
    case 'signup':
      return (
        <SignupScreen
          onSignup={handleLogin}
          onBackToLogin={handleGoToLogin}
        />
      );
    
    case 'dashboard':
      // Only allow super-admin users to access dashboard
      if (user?.user_metadata?.role !== 'super_admin') {
        return (
          <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h1>
              <p className="text-red-600 mb-6">You don&apos;t have permission to access the dashboard.</p>
              <Button 
                onClick={() => setCurrentScreen('user-entry')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Go to User Entry
              </Button>
            </div>
          </div>
        );
      }
      
      return (
        <DashboardScreen
          user={user!}
          accessToken={accessToken}
          onLogout={handleLogout}
        />
      );
    
    case 'user-entry':
      return (
        <UserEntryScreen
          user={user!}
          accessToken={accessToken}
          onLogout={handleLogout}
        />
      );
    
    default:
      return (
        <LoginScreen
          onLogin={handleLogin}
          onGoToSignup={handleGoToSignup}
        />
      );
  }
}
