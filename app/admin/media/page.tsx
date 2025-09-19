'use client';

import { MediaLibrary } from '@/components/media-library';

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Media Library</h1>
        <p className="text-muted-foreground">
          Manage your images, videos, and other media files
        </p>
      </div>
      <MediaLibrary />
    </div>
  );
}