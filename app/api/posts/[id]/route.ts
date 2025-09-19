import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateUniqueSlug } from '@/lib/slugify';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        categories: {
          include: { category: true }
        },
        tags: {
          include: { tag: true }
        },
        author: {
          select: { id: true, name: true, email: true }
        },
        media: {
          include: { media: true }
        },
        _count: {
          select: { comments: true }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      title, 
      content, 
      excerpt, 
      status, 
      featured, 
      featuredImage, 
      metaTitle, 
      metaDescription,
      categoryIds = [],
      tagIds = []
    } = body;

    const existingPost = await prisma.post.findUnique({
      where: { id: params.id }
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Generate new slug if title changed
    let slug = existingPost.slug;
    if (title !== existingPost.title) {
      const existingSlugs = await prisma.post.findMany({
        where: { id: { not: params.id } },
        select: { slug: true }
      }).then(posts => posts.map(p => p.slug));

      slug = generateUniqueSlug(title, existingSlugs);
    }

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        content,
        excerpt,
        status,
        featured: featured || false,
        featuredImage,
        metaTitle,
        metaDescription,
        publishedAt: status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED' ? new Date() : existingPost.publishedAt,
        categories: {
          deleteMany: {},
          create: categoryIds.map((categoryId: string) => ({
            category: { connect: { id: categoryId } }
          }))
        },
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId: string) => ({
            tag: { connect: { id: tagId } }
          }))
        }
      },
      include: {
        categories: {
          include: { category: true }
        },
        tags: {
          include: { tag: true }
        },
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}