import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://zpsajst-linkscout-backend.hf.space';

// Use Node.js runtime for better compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for analysis

export async function POST(request: NextRequest) {
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 240000); // 4 minute timeout

  try {
    const body = await request.json();
    
    console.log('📡 Web Interface -> Backend: Forwarding analysis request');
    console.log('📡 Sending analysis request to:', `${BACKEND_URL}/api/v1/analyze-chunks`);

    // Forward request to Python backend
    const response = await fetch(`${BACKEND_URL}/api/v1/analyze-chunks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ Backend -> Web Interface: Analysis complete');
    
    return NextResponse.json(data);
    } catch (error) {
    console.error('❌ API Error:', error);
    
    // Clear timeout if it exists
    if (timeoutId) clearTimeout(timeoutId);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Analysis timed out',
            message: 'The analysis took too long to complete. Please try again or try with a shorter article.'
          },
          { status: 504 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to analyze content. The backend might be starting up, please try again in a few seconds.'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
