import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Download, 
  Filter, 
  LogOut, 
  RotateCcw, 
  Calendar,
  Users,
  FileText,
  Clock,
  Shield,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  X
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { projectId } from '@/utils/supabase/info';
import { EditPersonDialog } from '@/components/EditPersonDialog';
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<UserEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, dateFrom, dateTo]);

  const fetchEntries = useCallback(async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f328fde2/user-entries`,
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
  }, [accessToken]);

  const filterEntries = useCallback(() => {
    let filtered = entries;

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.name.toLowerCase().includes(term) ||
        entry.mobile.includes(term) ||
        entry.address.toLowerCase().includes(term)
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
  }, [entries, searchTerm, dateFrom, dateTo]);

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
    a.download = `people-board-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV exported successfully!');
  };

  const handleEditEntry = (entry: UserEntry) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  const handleDeleteEntry = async (entry: UserEntry) => {
    if (!confirm(`Are you sure you want to delete ${entry.name}'s information?`)) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f328fde2/user-entries/${entry.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete entry');
      }

      // Remove from local state
      setEntries(prev => prev.filter(e => e.id !== entry.id));
      toast.success('Person information deleted successfully!');
    } catch (error) {
      console.error('Delete entry error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete person information');
    }
  };

  const handleSaveEdit = (updatedEntry: UserEntry) => {
    // Update the entry in local state
    setEntries(prev => prev.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ));
    setEditingEntry(null);
    setIsEditDialogOpen(false);
  };

  const getRecentEntries = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return entries.filter(entry => new Date(entry.dateAdded) >= sevenDaysAgo).length;
  };

  const hasActiveFilters = searchTerm || dateFrom || dateTo;
  const activeFilterCount = [searchTerm, dateFrom, dateTo].filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading People Board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">People Board</h1>
                  <p className="text-sm text-muted-foreground">Manage and view all user entries</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 hidden sm:inline-flex">
                <Shield className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="h-9 w-9 rounded-lg hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{entries.length}</p>
                  <p className="text-sm text-muted-foreground">Total People</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{getRecentEntries()}</p>
                  <p className="text-sm text-muted-foreground">Added This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{filteredEntries.length}</p>
                  <p className="text-sm text-muted-foreground">Filtered Results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters Section */}
        <div className="mb-6 space-y-4">
          {/* Quick Search Bar */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, mobile, or address..."
                    className="pl-10 h-12 bg-background border-border/50 focus:border-ring/50 focus:ring-2 focus:ring-ring/20"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className="h-12 px-4 border-border/50 hover:bg-muted/50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs bg-blue-100 text-blue-800">
                      {activeFilterCount}
                    </Badge>
                  )}
                  {isFiltersOpen ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Filters - Collapsible */}
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <CollapsibleContent>
              <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50 to-gray-50">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-medium text-foreground">Date Range Filter</h3>
                    </div>
                    {(dateFrom || dateTo) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setDateFrom('');
                          setDateTo('');
                        }}
                        className="h-8 px-3 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear Dates
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        From Date
                      </label>
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="h-12 bg-background border-border/50 focus:border-ring/50 focus:ring-2 focus:ring-ring/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        To Date
                      </label>
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="h-12 bg-background border-border/50 focus:border-ring/50 focus:ring-2 focus:ring-ring/20"
                      />
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                    <Button 
                      variant="outline" 
                      onClick={handleReset} 
                      className="h-10 px-6"
                      disabled={!hasActiveFilters}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Search: &quot;{searchTerm}&quot;
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {dateFrom && (
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  From: {new Date(dateFrom).toLocaleDateString()}
                  <button
                    onClick={() => setDateFrom('')}
                    className="ml-2 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {dateTo && (
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  To: {new Date(dateTo).toLocaleDateString()}
                  <button
                    onClick={() => setDateTo('')}
                    className="ml-2 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results Section with Export Button */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">People Directory</CardTitle>
                <Badge variant="secondary" className="text-sm bg-slate-100 text-slate-700">
                  {filteredEntries.length} result{filteredEntries.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              {/* Export Button - Prominent Position */}
              <div className="flex items-center gap-3">
                <Button 
                  onClick={exportCSV} 
                  className="h-10 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-sm"
                  disabled={filteredEntries.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                  {filteredEntries.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30">
                      {filteredEntries.length}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {entries.length === 0 ? 'No People Found' : 'No Matching Results'}
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {entries.length === 0 
                    ? 'Start by adding people to your board to see them here.'
                    : 'Try adjusting your search criteria or clearing the filters to see more results.'
                  }
                </p>
                {hasActiveFilters ? (
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="mt-4"
                  >
                    Clear All Filters
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-hidden rounded-lg border border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="font-semibold text-foreground">Name</TableHead>
                        <TableHead className="font-semibold text-foreground">Mobile Number</TableHead>
                        <TableHead className="font-semibold text-foreground">Address</TableHead>
                        <TableHead className="font-semibold text-foreground">Date Added</TableHead>
                        <TableHead className="font-semibold text-foreground w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.map((entry) => (
                        <TableRow 
                          key={entry.id} 
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                                {entry.name.charAt(0).toUpperCase()}
                              </div>
                              {entry.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {entry.mobile}
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-xs">
                            <div className="truncate" title={entry.address}>
                              {entry.address}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(entry.dateAdded).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditEntry(entry)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteEntry(entry)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {filteredEntries.map((entry) => (
                    <Card key={`${entry.id}-mobile`} className="border-0 shadow-sm bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                            {entry.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-foreground mb-1">
                                  {entry.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {entry.mobile}
                                </p>
                                <p className="text-sm text-muted-foreground mb-2 break-words">
                                  {entry.address}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(entry.dateAdded).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditEntry(entry)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteEntry(entry)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <EditPersonDialog
        entry={editingEntry}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEdit}
        accessToken={accessToken}
      />
    </div>
  );
}