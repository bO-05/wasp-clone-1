import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { files, session, user } from '@/db/schema';
import { eq, and, lt } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const sessionData = await db
      .select({
        userId: session.userId,
        expiresAt: session.expiresAt,
      })
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionData.length === 0) {
      return null;
    }

    const currentSession = sessionData[0];
    
    if (new Date(currentSession.expiresAt) < new Date()) {
      return null;
    }

    return { id: currentSession.userId };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const parentPath = searchParams.get('parent_path');

    let query = db
      .select()
      .from(files)
      .where(eq(files.userId, user.id));

    if (parentPath !== null) {
      query = db
        .select()
        .from(files)
        .where(
          and(
            eq(files.userId, user.id),
            eq(files.parentPath, parentPath)
          )
        );
    }

    const results = await query;

    const sorted = results.sort((a, b) => {
      if (a.type === 'directory' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'directory') return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(sorted, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { path, name, type, content, parentPath } = body;

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    if (!path || !name || !type) {
      return NextResponse.json(
        {
          error: 'Missing required fields: path, name, type',
          code: 'MISSING_REQUIRED_FIELDS',
        },
        { status: 400 }
      );
    }

    if (type !== 'file' && type !== 'directory') {
      return NextResponse.json(
        {
          error: 'Invalid type. Must be "file" or "directory"',
          code: 'INVALID_TYPE',
        },
        { status: 400 }
      );
    }

    const existingFile = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.userId, user.id),
          eq(files.path, path)
        )
      )
      .limit(1);

    if (existingFile.length > 0) {
      return NextResponse.json(
        {
          error: 'A file or directory already exists at this path',
          code: 'PATH_EXISTS',
        },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    
    const newFile = await db
      .insert(files)
      .values({
        userId: user.id,
        path: path.trim(),
        name: name.trim(),
        type,
        content: content || null,
        parentPath: parentPath || null,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();

    return NextResponse.json(newFile[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Use PUT /api/desktop/files/[id] to update files',
      code: 'INVALID_ENDPOINT',
    },
    { status: 400 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Use DELETE /api/desktop/files/[id] to delete files',
      code: 'INVALID_ENDPOINT',
    },
    { status: 400 }
  );
}