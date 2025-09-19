'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { EnhancedPostForm } from '@/components/enhanced-post-form';
import { Loader2 } from 'lucide-react';

export default function EditPostPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [params.id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`);
      if (response.ok) {
        const postData = await response.json();
        setPost(postData);
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <p className="text-muted-foreground">
          Update your blog post
        </p>
      </div>
      <EnhancedPostForm post={post} onSave={fetchPost} />
    </div>
  );
}