import { NextRequest, NextResponse } from 'next/server';

// CRITICAL: Hardcoded for Vercel deployment reliability
// Vercel does NOT automatically read .env.production files
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://zpsajst-linkscout-backend.hf.space';

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

    console.log('🌐 Forwarding scrape request to backend:', BACKEND_URL);
    console.log('🔗 Target URL:', url);

    // Create AbortController for timeout (Edge runtime compatible)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    let backendResponse;
    try {
      // Forward to backend which has BeautifulSoup and proper scraping
      backendResponse = await fetch(`${BACKEND_URL}/scrape-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }

    clearTimeout(timeoutId);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('❌ Backend scrape error (HTTP ' + backendResponse.status + '):', errorData);
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || 'Failed to scrape URL',
          message: errorData.message || 'Unable to fetch content from this URL.',
          backendStatus: backendResponse.status
        },
        { status: backendResponse.status, headers: corsHeaders }
      );
    }

    const data = await backendResponse.json();
    console.log(`✅ Backend scraped ${data.paragraphs?.length || 0} paragraphs from ${url}`);

    return NextResponse.json(data, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Scrape API Error:', error);
    
    let errorMessage = 'Failed to scrape URL';
    let errorDetails = '';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('aborted')) {
        errorMessage = 'Request timeout';
        errorDetails = 'The backend took too long to respond (60s limit). The URL might be slow or blocked.';
      } else if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error';
        errorDetails = `Unable to connect to backend (${BACKEND_URL}). Backend might be starting up or down.`;
      } else {
        errorMessage = error.message;
        errorDetails = 'An unexpected error occurred during URL scraping.';
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: errorDetails || 'Unable to fetch content. Please try a different URL.',
        backendUrl: BACKEND_URL,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
