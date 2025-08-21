"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Shield, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User as UserType } from '@/types';

interface SignupScreenProps {
  onSignup: (user: UserType, token: string) => void;
  onBackToLogin: () => void;
}

export function SignupScreen({ onSignup, onBackToLogin }: SignupScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'super_admin'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Create user via server endpoint
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const projectId = supabaseUrl.split('//')[1].split('.')[0];
      
      const signupResponse = await fetch(
        `${supabaseUrl}/functions/v1/make-server-f328fde2/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            email,
            password,
            name,
            role,
          }),
        }
      );

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      // After successful signup, sign them in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user && data.session) {
        onSignup(data.user as UserType, data.session.access_token);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Signup failed');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToLogin}
              className="absolute left-4 top-4 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl text-gray-900">Create Account</CardTitle>
          <CardDescription className="text-gray-600">
            Join our user management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Enter your password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Confirm your password"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-gray-700">Account Type</Label>
              <RadioGroup 
                value={role} 
                onValueChange={(value) => setRole(value as 'user' | 'super_admin')}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="user" id="user" className="text-blue-600" />
                  <div className="flex items-center space-x-2 flex-1">
                    <User className="h-4 w-4 text-gray-600" />
                    <div>
                      <Label htmlFor="user" className="text-gray-900 cursor-pointer">Regular User</Label>
                      <p className="text-sm text-gray-500">Can add and view own entries</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="super_admin" id="super_admin" className="text-blue-600" />
                  <div className="flex items-center space-x-2 flex-1">
                    <Shield className="h-4 w-4 text-gray-600" />
                    <div>
                      <Label htmlFor="super_admin" className="text-gray-900 cursor-pointer">Super Admin</Label>
                      <p className="text-sm text-gray-500">Can view all entries and export data</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onBackToLogin}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
