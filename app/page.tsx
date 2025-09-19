'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PenTool, Search, Calendar, User, ArrowRight } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: string;
  featured: boolean;
  createdAt: string;
  publishedAt: string;
  tags: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts?status=published&limit=20');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PenTool className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">My Blog</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome to my personal blog
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline">Admin</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <PenTool className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Posts Yet</h2>
              <p className="text-muted-foreground mb-6">
                This blog is just getting started. Check back soon for new content!
              </p>
              <Link href="/admin/posts/new">
                <Button>
                  <PenTool className="h-4 w-4 mr-2" />
                  Create First Post
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Badge variant="default">Featured</Badge>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="default">Featured</Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(post.publishedAt || post.createdAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <CardTitle className="text-xl">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt || stripHtml(post.content || '').substring(0, 150) + '...'}
                        </p>
                        {post.tags && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.split(',').map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Button variant="outline" className="w-full">
                          Read More
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Regular Posts */}
            {regularPosts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Latest Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(post.publishedAt || post.createdAt), 'MMM d, yyyy')}
                        </div>
                        <CardTitle className="text-xl">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt || stripHtml(post.content || '').substring(0, 150) + '...'}
                        </p>
                        {post.tags && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.split(',').map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Button variant="outline" className="w-full">
                          Read More
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {filteredPosts.length === 0 && searchTerm && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No posts found matching "{searchTerm}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 My Blog. Built with Next.js and Prisma.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}