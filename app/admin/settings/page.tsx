'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, Database, Palette, Globe } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your blog settings
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Site Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="site-title">Site Title</Label>
                <Input id="site-title" placeholder="My Blog" />
              </div>
              <div>
                <Label htmlFor="site-tagline">Site Tagline</Label>
                <Input id="site-tagline" placeholder="Just another blog" />
              </div>
            </div>
            <div>
              <Label htmlFor="site-description">Site Description</Label>
              <Textarea
                id="site-description"
                placeholder="A brief description of your blog..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="site-url">Site URL</Label>
                <Input id="site-url" placeholder="https://myblog.com" />
              </div>
              <div>
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input id="admin-email" type="email" placeholder="admin@myblog.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Display Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable dark mode for the admin interface
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Featured Posts</Label>
                <p className="text-sm text-muted-foreground">
                  Display featured posts prominently
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="posts-per-page">Posts Per Page</Label>
                <Input id="posts-per-page" type="number" defaultValue="10" />
              </div>
              <div>
                <Label htmlFor="excerpt-length">Excerpt Length</Label>
                <Input id="excerpt-length" type="number" defaultValue="150" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Database Status</h4>
              <p className="text-sm text-muted-foreground">
                SQLite database is connected and working properly.
              </p>
            </div>
            <Button variant="outline" className="w-full">
              <Database className="h-4 w-4 mr-2" />
              View Database Schema
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}