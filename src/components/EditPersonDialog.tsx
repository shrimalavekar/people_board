import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '@/utils/supabase/info';
import type { UserEntry } from '@/types';

interface EditPersonDialogProps {
  entry: UserEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEntry: UserEntry) => void;
  accessToken: string | null;
}

export function EditPersonDialog({ 
  entry, 
  isOpen, 
  onClose, 
  onSave, 
  accessToken 
}: EditPersonDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (entry) {
      setFormData({
        name: entry.name,
        mobile: entry.mobile,
        address: entry.address
      });
      setErrors({});
    }
  }, [entry]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!entry || !validateForm()) return;

    setLoading(true);
    try {
      console.log('Updating entry:', entry.id, 'with data:', {
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        address: formData.address.trim(),
      });

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f328fde2/user-entries/${entry.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            mobile: formData.mobile.trim(),
            address: formData.address.trim(),
          }),
        }
      );

      console.log('Update response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update response error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update entry`);
      }

      const result = await response.json();
      console.log('Update result:', result);
      
      // Update the entry with the saved data
      const updatedEntry: UserEntry = {
        ...entry,
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        address: formData.address.trim(),
        dateModified: result.entry?.dateModified || new Date().toISOString(),
      };

      onSave(updatedEntry);
      toast.success('Person information updated successfully!');
      onClose();
    } catch (error) {
      console.error('Update entry error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update person information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
              {entry?.name?.charAt(0).toUpperCase() || 'E'}
            </div>
            Edit Person Information
          </DialogTitle>
          <DialogDescription>
            Update the contact information for {entry?.name || 'this person'}. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-sm font-medium">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                className={`pl-10 h-11 ${errors.name ? 'border-destructive focus:border-destructive' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Mobile Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-mobile" className="text-sm font-medium">
              Mobile Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                placeholder="Enter mobile number"
                className={`pl-10 h-11 ${errors.mobile ? 'border-destructive focus:border-destructive' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.mobile && (
              <p className="text-sm text-destructive">{errors.mobile}</p>
            )}
          </div>

          {/* Address Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-address" className="text-sm font-medium">
              Address
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete address"
                className={`pl-10 min-h-[80px] resize-none ${errors.address ? 'border-destructive focus:border-destructive' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}