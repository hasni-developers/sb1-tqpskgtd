'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import {
  LayoutDashboard,
  FileText,
  Settings,
  Menu,
  X,
  PenTool,
  Eye,
  FolderOpen,
  Tags,
  Image,
  MessageSquare,
  Users
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'All Posts',
    href: '/admin/posts',
    icon: FileText,
  },
  {
    title: 'New Post',
    href: '/admin/posts/new',
    icon: PenTool,
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: FolderOpen,
  },
  {
    title: 'Tags',
    href: '/admin/tags',
    icon: Tags,
  },
  {
    title: 'Media Library',
    href: '/admin/media',
    icon: Image,
  },
  {
    title: 'Comments',
    href: '/admin/comments',
    icon: MessageSquare,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = () => {
    const item = sidebarItems.find(item => item.href === pathname);
    if (item) return item.title;
    
    if (pathname.startsWith('/admin/posts/') && pathname !== '/admin/posts/new') {
      return 'Edit Post';
    }
    if (pathname.startsWith('/admin/categories/')) {
      return 'Edit Category';
    }
    if (pathname.startsWith('/admin/tags/')) {
      return 'Edit Tag';
    }
    
    return 'Admin';
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex h-screen bg-background">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link href="/admin" className="flex items-center space-x-2">
              <PenTool className="h-6 w-6" />
              <span className="font-bold text-lg">Blog CMS</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-4 py-6">
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Button
                    variant={pathname === item.href ? 'default' : 'ghost'}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.title}
                  </Button>
                </Link>
              ))}
            </nav>

            <Separator className="my-6" />

            <div className="space-y-2">
              <Link href="/" target="_blank">
                <Button variant="ghost" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-3" />
                  View Site
                </Button>
              </Link>
            </div>
          </ScrollArea>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {getPageTitle()}
              </span>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}