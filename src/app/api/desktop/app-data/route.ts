import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appData, session, user } from '@/db/schema';
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

    const sessionRecord = sessionData[0];
    
    if (new Date(sessionRecord.expiresAt) < new Date()) {
      return null;
    }

    return { id: sessionRecord.userId };
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

    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('app_id');

    if (!appId) {
      return NextResponse.json(
        { error: 'app_id parameter is required', code: 'MISSING_APP_ID' },
        { status: 400 }
      );
    }

    const results = await db
      .select()
      .from(appData)
      .where(and(eq(appData.userId, user.id), eq(appData.appId, appId)));

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
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

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { appId, dataKey, dataValue } = body;

    if (!appId || appId.trim() === '') {
      return NextResponse.json(
        { error: 'appId is required and cannot be empty', code: 'MISSING_APP_ID' },
        { status: 400 }
      );
    }

    if (!dataKey || dataKey.trim() === '') {
      return NextResponse.json(
        { error: 'dataKey is required and cannot be empty', code: 'MISSING_DATA_KEY' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newAppData = await db
      .insert(appData)
      .values({
        userId: user.id,
        appId: appId.trim(),
        dataKey: dataKey.trim(),
        dataValue: dataValue || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newAppData[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'PUT method not supported at collection level. Use /api/desktop/app-data/[id] for updates',
      code: 'METHOD_NOT_SUPPORTED',
    },
    { status: 400 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'DELETE method not supported at collection level. Use /api/desktop/app-data/[id] for deletion',
      code: 'METHOD_NOT_SUPPORTED',
    },
    { status: 400 }
  );
}