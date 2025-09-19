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

    const tags = await prisma.tag.findMany({
      where,
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    });

    const total = await prisma.tag.count({ where });

    return NextResponse.json({
      tags,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color } = body;

    // Generate unique slug
    const existingSlugs = await prisma.tag.findMany({
      select: { slug: true }
    }).then(tags => tags.map(t => t.slug));

    const slug = generateUniqueSlug(name, existingSlugs);

    const tag = await prisma.tag.create({
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

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}