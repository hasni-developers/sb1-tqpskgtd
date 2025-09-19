'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Search, Upload, Edit, Trash2, Image, FileText, Film, Music } from 'lucide-react';
import { format } from 'date-fns';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  caption?: string;
  description?: string;
  width?: number;
  height?: number;
  createdAt: string;
  uploadedBy?: {
    name: string;
    email: string;
  };
  _count: {
    posts: number;
  };
}

interface MediaLibraryProps {
  onSelect?: (media: MediaItem) => void;
  selectable?: boolean;
}

export function MediaLibrary({ onSelect, selectable = false }: MediaLibraryProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mimeTypeFilter, setMimeTypeFilter] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (mimeTypeFilter) params.append('mimeType', mimeTypeFilter);

      const response = await fetch(`/api/media?${params}`);
      const data = await response.json();

      setMedia(data.media);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to fetch media');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [pagination.page, searchTerm, mimeTypeFilter]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete media');
      }

      toast.success('Media deleted successfully');
      fetchMedia();
    } catch (error) {
      toast.error('Failed to delete media');
      console.error(error);
    }
  };

  const handleUpdate = async (media: MediaItem, updates: Partial<MediaItem>) => {
    try {
      const response = await fetch(`/api/media/${media.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update media');
      }

      toast.success('Media updated successfully');
      setEditingMedia(null);
      fetchMedia();
    } catch (error) {
      toast.error('Failed to update media');
      console.error(error);
    }
  };

  const getMediaIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <Film className="h-4 w-4" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Media Library</CardTitle>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Media
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={mimeTypeFilter} onValueChange={setMimeTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="application">Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading media...</div>
        ) : media.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No media found.</p>
            <Button className="mt-4">
              <Upload className="h-4 w-4 mr-2" />
              Upload your first media file
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  className={`group relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                    selectable ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => selectable && onSelect?.(item)}
                >
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {item.mimeType.startsWith('image/') ? (
                      <img
                        src={item.url}
                        alt={item.alt || item.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        {getMediaIcon(item.mimeType)}
                        <span className="text-xs text-center px-2">
                          {item.originalName}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-2">
                    <p className="text-xs font-medium truncate" title={item.originalName}>
                      {item.originalName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(item.size)}
                    </p>
                    {item._count.posts > 0 && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Used in {item._count.posts} post{item._count.posts !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMedia(item);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Media Details</DialogTitle>
                          </DialogHeader>
                          {selectedMedia && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  {selectedMedia.mimeType.startsWith('image/') ? (
                                    <img
                                      src={selectedMedia.url}
                                      alt={selectedMedia.alt || selectedMedia.originalName}
                                      className="w-full rounded-lg"
                                    />
                                  ) : (
                                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                      {getMediaIcon(selectedMedia.mimeType)}
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="alt">Alt Text</Label>
                                    <Input
                                      id="alt"
                                      defaultValue={selectedMedia.alt || ''}
                                      placeholder="Alternative text..."
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="caption">Caption</Label>
                                    <Input
                                      id="caption"
                                      defaultValue={selectedMedia.caption || ''}
                                      placeholder="Image caption..."
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                      id="description"
                                      defaultValue={selectedMedia.description || ''}
                                      placeholder="Media description..."
                                      rows={3}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                <div>
                                  <strong>File name:</strong> {selectedMedia.filename}
                                </div>
                                <div>
                                  <strong>File size:</strong> {formatFileSize(selectedMedia.size)}
                                </div>
                                <div>
                                  <strong>Type:</strong> {selectedMedia.mimeType}
                                </div>
                                <div>
                                  <strong>Uploaded:</strong> {format(new Date(selectedMedia.createdAt), 'MMM d, yyyy')}
                                </div>
                                {selectedMedia.width && selectedMedia.height && (
                                  <div>
                                    <strong>Dimensions:</strong> {selectedMedia.width} × {selectedMedia.height}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}