'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RichTextEditor } from './rich-text-editor';
import { MediaLibrary } from './media-library';
import { toast } from 'sonner';
import { Loader2, Save, Eye, X, Plus, Image } from 'lucide-react';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']),
  featured: z.boolean().default(false),
  featuredImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

interface EnhancedPostFormProps {
  post?: any;
  onSave?: () => void;
}

export function EnhancedPostForm({ post, onSave }: EnhancedPostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState(post?.content || '');
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    post?.categories?.map((c: any) => c.category.id) || []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    post?.tags?.map((t: any) => t.tag.id) || []
  );
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || '',
      content: post?.content || '',
      excerpt: post?.excerpt || '',
      status: post?.status || 'DRAFT',
      featured: post?.featured || false,
      featuredImage: post?.featuredImage || '',
      metaTitle: post?.metaTitle || '',
      metaDescription: post?.metaDescription || '',
    },
  });

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?limit=100');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags?limit=100');
      const data = await response.json();
      setTags(data.tags || []);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    try {
      const payload = { 
        ...data, 
        content,
        categoryIds: selectedCategories,
        tagIds: selectedTags
      };
      
      const response = await fetch(post ? `/api/posts/${post.id}` : '/api/posts', {
        method: post ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save post');
      }

      toast.success(post ? 'Post updated successfully!' : 'Post created successfully!');
      onSave?.();
      router.push('/admin');
    } catch (error) {
      toast.error('Failed to save post');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = () => {
    form.setValue('status', 'DRAFT');
    form.handleSubmit(onSubmit)();
  };

  const handlePublish = () => {
    form.setValue('status', 'PUBLISHED');
    form.handleSubmit(onSubmit)();
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleMediaSelect = (media: any) => {
    form.setValue('featuredImage', media.url);
    setMediaDialogOpen(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="Enter post title..."
                  className="text-lg font-semibold"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  {...form.register('excerpt')}
                  placeholder="Brief description of the post..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Content</Label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO & Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="seo" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="taxonomy">Categories & Tags</TabsTrigger>
                  <TabsTrigger value="media">Featured Image</TabsTrigger>
                </TabsList>
                
                <TabsContent value="seo" className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      {...form.register('metaTitle')}
                      placeholder="SEO title..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      {...form.register('metaDescription')}
                      placeholder="SEO description..."
                      rows={3}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="taxonomy" className="space-y-4">
                  <div>
                    <Label>Categories</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {categories.map((category) => (
                        <Badge
                          key={category.id}
                          variant={selectedCategories.includes(category.id) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => handleCategoryToggle(category.id)}
                        >
                          {category.name}
                          {selectedCategories.includes(category.id) && (
                            <X className="h-3 w-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => handleTagToggle(tag.id)}
                        >
                          {tag.name}
                          {selectedTags.includes(tag.id) && (
                            <X className="h-3 w-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="media" className="space-y-4">
                  <div>
                    <Label>Featured Image</Label>
                    <div className="mt-2">
                      {form.watch('featuredImage') ? (
                        <div className="relative">
                          <img
                            src={form.watch('featuredImage')}
                            alt="Featured"
                            className="w-full max-w-sm rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => form.setValue('featuredImage', '')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
                          <DialogTrigger asChild>
                            <Button type="button" variant="outline" className="w-full">
                              <Image className="h-4 w-4 mr-2" />
                              Select Featured Image
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Select Featured Image</DialogTitle>
                            </DialogHeader>
                            <MediaLibrary onSelect={handleMediaSelect} selectable />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-80 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={form.watch('featured')}
                  onCheckedChange={(checked) => form.setValue('featured', checked)}
                />
                <Label htmlFor="featured">Featured post</Label>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(value) => form.setValue('status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={handleSaveDraft}
                  variant="outline"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Draft
                </Button>
                <Button
                  type="button"
                  onClick={handlePublish}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  Publish
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Post Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <strong>Categories:</strong> {selectedCategories.length}
              </div>
              <div>
                <strong>Tags:</strong> {selectedTags.length}
              </div>
              <div>
                <strong>Featured Image:</strong> {form.watch('featuredImage') ? 'Set' : 'None'}
              </div>
              <div>
                <strong>Word Count:</strong> {content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.length > 0).length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}