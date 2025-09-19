'use client';

import { useState } from 'react';
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
import { RichTextEditor } from './rich-text-editor';
import { toast } from 'sonner';
import { Loader2, Save, Eye } from 'lucide-react';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  featured: z.boolean().default(false),
  featuredImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  tags: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostFormProps {
  post?: any;
  onSave?: () => void;
}

export function PostForm({ post, onSave }: PostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState(post?.content || '');

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
      tags: post?.tags || '',
    },
  });

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    try {
      const payload = { ...data, content };
      
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
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="seo" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
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
                <TabsContent value="advanced" className="space-y-4">
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      {...form.register('tags')}
                      placeholder="tag1, tag2, tag3..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="featuredImage">Featured Image URL</Label>
                    <Input
                      id="featuredImage"
                      {...form.register('featuredImage')}
                      placeholder="https://example.com/image.jpg"
                    />
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
        </div>
      </div>
    </form>
  );
}