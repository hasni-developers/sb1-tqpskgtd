import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateUniqueSlug } from '@/lib/slugify';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const tagId = searchParams.get('tagId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let where: any = {};

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (categoryId) {
      where.categories = {
        some: { categoryId }
      };
    }

    if (tagId) {
      where.tags = {
        some: { tagId }
      };
    }

    const posts = await prisma.post.findMany({
      where,
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
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.post.count({ where });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
      tagIds = [],
      authorId
    } = body;

    // Generate unique slug
    const existingSlugs = await prisma.post.findMany({
      select: { slug: true }
    }).then(posts => posts.map(p => p.slug));

    const slug = generateUniqueSlug(title, existingSlugs);

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        status: status || 'DRAFT',
        featured: featured || false,
        featuredImage,
        metaTitle,
        metaDescription,
        authorId,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        categories: {
          create: categoryIds.map((categoryId: string) => ({
            category: { connect: { id: categoryId } }
          }))
        },
        tags: {
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

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}