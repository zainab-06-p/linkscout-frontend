import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Use edge runtime for better performance
export const runtime = 'edge';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('🌐 Forwarding scrape request to backend:', url);

    // Forward to backend which has BeautifulSoup and proper scraping
    const backendResponse = await fetch(`${BACKEND_URL}/scrape-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(30000),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Backend scrape error:', errorData);
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || 'Failed to scrape URL',
          message: errorData.message || 'Unable to fetch content from this URL.',
        },
        { status: backendResponse.status, headers: corsHeaders }
      );
    }

    const data = await backendResponse.json();
    console.log(`✅ Backend scraped ${data.paragraphs?.length || 0} paragraphs`);

    return NextResponse.json(data, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Scrape API Error:', error);
    
    let errorMessage = 'Failed to scrape URL';
    let errorDetails = '';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = 'Request timeout';
        errorDetails = 'The backend took too long to respond. Please try again.';
      } else if (error.message.includes('fetch') || error.message.includes('network')) {
        errorMessage = 'Network error';
        errorDetails = 'Unable to connect to backend. Please try again later.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: errorDetails || 'Unable to fetch content. Please try a different URL.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
