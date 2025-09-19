'use client';

import { EnhancedPostForm } from '@/components/enhanced-post-form';

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Post</h1>
        <p className="text-muted-foreground">
          Create a new blog post
        </p>
      </div>
      <EnhancedPostForm />
    </div>
  );
}