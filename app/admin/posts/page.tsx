'use client';

import { PostsTable } from '@/components/posts-table';

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Posts</h1>
        <p className="text-muted-foreground">
          Manage all your blog posts
        </p>
      </div>
      <PostsTable />
    </div>
  );
}