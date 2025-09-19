import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const media = await prisma.media.findUnique({
      where: { id: params.id },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { alt, caption, description } = body;

    const media = await prisma.media.update({
      where: { id: params.id },
      data: {
        alt,
        caption,
        description
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.media.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}