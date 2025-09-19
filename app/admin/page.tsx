'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  recentPosts: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    recentPosts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/posts?limit=100');
      const data = await response.json();
      
      const posts = data.posts || [];
      const totalPosts = posts.length;
      const publishedPosts = posts.filter((p: any) => p.status === 'PUBLISHED').length;
      const draftPosts = posts.filter((p: any) => p.status === 'DRAFT').length;
      const recentPosts = posts.slice(0, 5);

      setStats({
        totalPosts,
        publishedPosts,
        draftPosts,
        recentPosts,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your blog management dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              All posts in your blog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedPosts}</div>
            <p className="text-xs text-muted-foreground">
              Live on your website
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draftPosts}</div>
            <p className="text-xs text-muted-foreground">
              Unpublished posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.publishedPosts}</div>
            <p className="text-xs text-muted-foreground">
              Content pieces created
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No posts yet.</p>
              <Link
                href="/admin/posts/new"
                className="text-primary hover:underline"
              >
                Create your first post
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentPosts.map((post: any) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(post.updatedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        post.status === 'PUBLISHED'
                          ? 'default'
                          : post.status === 'DRAFT'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {post.status.toLowerCase()}
                    </Badge>
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}