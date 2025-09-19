import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateUniqueSlug } from '@/lib/slugify';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: true,
        children: true,
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    });

    const total = await prisma.category.count({ where });

    return NextResponse.json({
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color, parentId } = body;

    // Generate unique slug
    const existingSlugs = await prisma.category.findMany({
      select: { slug: true }
    }).then(categories => categories.map(c => c.slug));

    const slug = generateUniqueSlug(name, existingSlugs);

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        color,
        parentId: parentId || null
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { posts: true }
        }
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}