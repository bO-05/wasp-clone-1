import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameScores } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, playerName, score, gameType } = body;

    // Validation: playerName is required
    if (!playerName || typeof playerName !== 'string' || playerName.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Player name is required and cannot be empty',
          code: 'MISSING_PLAYER_NAME' 
        },
        { status: 400 }
      );
    }

    // Validation: score is required and must be non-negative integer
    if (score === undefined || score === null || typeof score !== 'number' || !Number.isInteger(score)) {
      return NextResponse.json(
        { 
          error: 'Score must be a valid integer',
          code: 'INVALID_SCORE_TYPE' 
        },
        { status: 400 }
      );
    }

    if (score < 0) {
      return NextResponse.json(
        { 
          error: 'Score must be a non-negative integer',
          code: 'NEGATIVE_SCORE' 
        },
        { status: 400 }
      );
    }

    // Validation: gameType is required
    if (!gameType || typeof gameType !== 'string' || gameType.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Game type is required and cannot be empty',
          code: 'MISSING_GAME_TYPE' 
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedPlayerName = playerName.trim();
    const sanitizedGameType = gameType.trim();

    // Create new game score
    const newScore = await db.insert(gameScores)
      .values({
        userId: userId || null,
        playerName: sanitizedPlayerName,
        score,
        gameType: sanitizedGameType,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newScore[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('game_type');
    const limitParam = searchParams.get('limit');

    // Validation: game_type is required
    if (!gameType || gameType.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Game type is required',
          code: 'MISSING_GAME_TYPE' 
        },
        { status: 400 }
      );
    }

    // Parse and validate limit
    const limit = Math.min(parseInt(limitParam || '10'), 100);

    // Query top scores for the game type, ordered by score DESC
    const scores = await db.select({
      id: gameScores.id,
      playerName: gameScores.playerName,
      score: gameScores.score,
      gameType: gameScores.gameType,
      createdAt: gameScores.createdAt
    })
      .from(gameScores)
      .where(eq(gameScores.gameType, gameType.trim()))
      .orderBy(desc(gameScores.score))
      .limit(limit);

    return NextResponse.json(scores, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error 
      },
      { status: 500 }
    );
  }
}