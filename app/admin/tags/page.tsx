'use client';

import { useState, useEffect } from 'react';
import { TagForm } from '@/components/tag-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Search, Plus, Edit, Trash2, Tags } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  _count: { posts: number };
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/tags?${params}`);
      const data = await response.json();
      setTags(data.tags || []);
    } catch (error) {
      toast.error('Failed to fetch tags');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tag');
      }

      toast.success('Tag deleted successfully');
      fetchTags();
    } catch (error) {
      toast.error('Failed to delete tag');
      console.error(error);
    }
  };

  const handleSave = () => {
    setEditingTag(null);
    setDialogOpen(false);
    fetchTags();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground">
            Tag your posts for better organization
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTag(null)}>
              <Plus className="h-4 w-4 mr-2" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTag ? 'Edit Tag' : 'New Tag'}
              </DialogTitle>
            </DialogHeader>
            <TagForm
              tag={editingTag}
              onSave={handleSave}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading tags...</div>
          ) : tags.length === 0 ? (
            <div className="text-center py-8">
              <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No tags found.</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first tag
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <Card key={tag.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color || '#10b981' }}
                        />
                        <h3 className="font-semibold">{tag.name}</h3>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTag(tag);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the tag "{tag.name}".
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(tag.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    {tag.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {tag.description}
                      </p>
                    )}
                    
                    <Badge variant="secondary" className="text-xs">
                      {tag._count.posts} posts
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}