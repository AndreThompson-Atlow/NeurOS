'use server';

import { checkApiConnection } from '../../../../lib/server/genkit';
import { NextResponse } from 'next/server';

/**
 * Health check endpoint for the API
 * Checks that the AI API connection is working
 * GET /api/health
 */
export async function GET() {
  try {
    const apiWorking = await checkApiConnection();
    
    return NextResponse.json(
      { 
        status: apiWorking ? 'OK' : 'AI_CONNECTION_ERROR',
        aiConnection: apiWorking,
        timestamp: new Date().toISOString()
      },
      { 
        status: apiWorking ? 200 : 500 
      }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 