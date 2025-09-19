'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

const tagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.string().optional(),
});

type TagFormData = z.infer<typeof tagSchema>;

interface TagFormProps {
  tag?: any;
  onSave?: () => void;
  onCancel?: () => void;
}

export function TagForm({ tag, onSave, onCancel }: TagFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: tag?.name || '',
      description: tag?.description || '',
      color: tag?.color || '#10b981',
    },
  });

  const onSubmit = async (data: TagFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(tag ? `/api/tags/${tag.id}` : '/api/tags', {
        method: tag ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save tag');
      }

      toast.success(tag ? 'Tag updated successfully!' : 'Tag created successfully!');
      onSave?.();
    } catch (error) {
      toast.error('Failed to save tag');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tag ? 'Edit Tag' : 'New Tag'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Tag name..."
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Tag description..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="color"
              {...form.register('color')}
              className="h-10 w-20"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {tag ? 'Update' : 'Create'} Tag
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}