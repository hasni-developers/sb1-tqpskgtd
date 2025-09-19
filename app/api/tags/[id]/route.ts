import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateUniqueSlug } from '@/lib/slugify';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json({ error: 'Failed to fetch tag' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, color } = body;

    const existingTag = await prisma.tag.findUnique({
      where: { id: params.id }
    });

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Generate new slug if name changed
    let slug = existingTag.slug;
    if (name !== existingTag.name) {
      const existingSlugs = await prisma.tag.findMany({
        where: { id: { not: params.id } },
        select: { slug: true }
      }).then(tags => tags.map(t => t.slug));

      slug = generateUniqueSlug(name, existingSlugs);
    }

    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        color
      },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.tag.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}