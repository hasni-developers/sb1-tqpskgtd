import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const mimeType = searchParams.get('mimeType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    let where: any = {};

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } },
        { caption: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (mimeType) {
      where.mimeType = { startsWith: mimeType };
    }

    const media = await prisma.media.findMany({
      where,
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.media.count({ where });

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, originalName, mimeType, size, url, alt, caption, description, width, height, uploadedById } = body;

    const media = await prisma.media.create({
      data: {
        filename,
        originalName,
        mimeType,
        size,
        url,
        alt,
        caption,
        description,
        width,
        height,
        uploadedById
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error('Error creating media:', error);
    return NextResponse.json({ error: 'Failed to create media' }, { status: 500 });
  }
}