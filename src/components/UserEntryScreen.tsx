import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogOut, User, Phone, MapPin, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '@/utils/supabase/info';
import type { User as UserType } from '@/types';

interface UserEntryScreenProps {
  user: UserType;
  accessToken: string | null;
  onLogout: () => void;
}

export function UserEntryScreen({ user, accessToken, onLogout }: UserEntryScreenProps) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateMobile = (mobile: string) => {
    const cleaned = mobile.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateMobile(mobile)) {
      setError('Mobile number must be 10-15 digits');
      setLoading(false);
      return;
    }

    try {
      const userEntry = {
        id: `${Date.now()}-${Math.random()}`,
        name: name.trim(),
        mobile: mobile.replace(/\D/g, ''),
        address: address.trim(),
        dateAdded: new Date().toISOString(),
        userId: user.id,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f328fde2/user-entries`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(userEntry),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save entry');
      }

      toast.success('Entry saved successfully!');
      setName('');
      setMobile('');
      setAddress('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save entry');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName('');
    setMobile('');
    setAddress('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium text-gray-900">Add New Entry</h1>
              <p className="text-sm text-gray-500">Welcome, {user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="p-2 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900">User Information</CardTitle>
              <p className="text-sm text-gray-600">Fill in the details below</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
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
                  <Label htmlFor="mobile" className="flex items-center gap-2 text-gray-700">
                    <Phone className="h-4 w-4" />
                    Mobile Number
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    placeholder="Enter mobile number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4" />
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="min-h-[100px] bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                    placeholder="Enter your complete address"
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Entry'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading}
                    className="flex-1 h-12 border-gray-300 hover:bg-gray-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}