'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.string().optional(),
  parentId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: any;
  categories?: any[];
  onSave?: () => void;
  onCancel?: () => void;
}

export function CategoryForm({ category, categories = [], onSave, onCancel }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      color: category?.color || '#3b82f6',
      parentId: category?.parentId || '',
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        parentId: data.parentId || null
      };
      
      const response = await fetch(category ? `/api/categories/${category.id}` : '/api/categories', {
        method: category ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save category');
      }

      toast.success(category ? 'Category updated successfully!' : 'Category created successfully!');
      onSave?.();
    } catch (error) {
      toast.error('Failed to save category');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const availableParents = categories.filter(c => c.id !== category?.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category ? 'Edit Category' : 'New Category'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Category name..."
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
              placeholder="Category description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                {...form.register('color')}
                className="h-10"
              />
            </div>

            <div>
              <Label htmlFor="parentId">Parent Category</Label>
              <Select
                value={form.watch('parentId')}
                onValueChange={(value) => form.setValue('parentId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {availableParents.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {category ? 'Update' : 'Create'} Category
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