"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, Filter, LogOut, RotateCcw, Plus, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { User, UserEntry } from '@/types';

interface DashboardScreenProps {
  user: User;
  accessToken: string | null;
  onLogout: () => void;
}

export function DashboardScreen({ user, accessToken, onLogout }: DashboardScreenProps) {
  const [entries, setEntries] = useState<UserEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, dateFrom, dateTo]);

  const fetchEntries = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/make-server-f328fde2/user-entries`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }

      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Fetch entries error:', error);
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.name.toLowerCase().includes(term) ||
        entry.mobile.includes(term)
      );
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(entry =>
        new Date(entry.dateAdded) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      filtered = filtered.filter(entry =>
        new Date(entry.dateAdded) <= new Date(dateTo)
      );
    }

    setFilteredEntries(filtered);
  };

  const handleReset = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
  };

  const exportCSV = () => {
    const headers = ['Name', 'Mobile No', 'Address', 'Date Added'];
    const csvData = [
      headers.join(','),
      ...filteredEntries.map(entry =>
        [
          `"${entry.name}"`,
          entry.mobile,
          `"${entry.address.replace(/"/g, '""')}"`,
          new Date(entry.dateAdded).toLocaleDateString(),
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-entries-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV exported successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-medium text-gray-900">Dashboard</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                {user.user_metadata?.role === 'super_admin' ? 'Super Admin' : 'User'}
              </Badge>
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

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From date"
                  className="pl-10 bg-white border-gray-200"
                />
              </div>
              <div className="flex-1 relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To date"
                  className="pl-10 bg-white border-gray-200"
                />
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or mobile number"
                className="pl-10 bg-white border-gray-200"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset} 
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportCSV} 
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-4">
          <span className="text-sm text-gray-600">
            {filteredEntries.length} record{filteredEntries.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {filteredEntries.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Filter className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">
                {entries.length === 0 ? 'No records found' : 'No records match your filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium text-gray-900">Name</TableHead>
                    <TableHead className="font-medium text-gray-900">Mobile No</TableHead>
                    <TableHead className="font-medium text-gray-900 hidden sm:table-cell">Address</TableHead>
                    <TableHead className="font-medium text-gray-900">Date Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        {entry.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {entry.mobile}
                      </TableCell>
                      <TableCell className="text-gray-600 hidden sm:table-cell max-w-xs">
                        <div className="truncate" title={entry.address}>
                          {entry.address}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(entry.dateAdded).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

    
      </div>
    </div>
  );
}
