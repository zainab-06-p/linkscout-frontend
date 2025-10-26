import { NextRequest, NextResponse } from 'next/server';

// CRITICAL: Hardcoded for Vercel deployment reliability
// Vercel does NOT automatically read .env.production files
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://zpsajst-linkscout-backend.hf.space';

// Use Node.js runtime for better compatibility with fetch and timeouts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 second timeout

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

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (parseError) {
    console.error('❌ Failed to parse request body:', parseError);
    return NextResponse.json(
      { success: false, error: 'Invalid JSON in request body' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const { url } = requestBody;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('🌐 Scrape-URL API called');
    console.log('📍 Backend URL:', BACKEND_URL);
    console.log('🔗 Target URL:', url);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏱️ Request timeout - aborting');
      controller.abort();
    }, 55000); // 55s timeout (less than Vercel's 60s limit)

    let backendResponse;
    try {
      console.log('📡 Sending request to backend...');
      
      // Forward to backend which has BeautifulSoup and proper scraping
      backendResponse = await fetch(`${BACKEND_URL}/scrape-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      
      console.log('📨 Backend responded with status:', backendResponse.status);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('❌ Fetch failed:', fetchError);
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return NextResponse.json(
            {
              success: false,
              error: 'Request timeout',
              message: 'Backend took too long to respond. The backend might be starting up (cold start can take 60-90 seconds).',
              backendUrl: BACKEND_URL,
            },
            { status: 504, headers: corsHeaders }
          );
        }
        
        return NextResponse.json(
          {
            success: false,
            error: 'Network error',
            message: `Cannot connect to backend at ${BACKEND_URL}. Error: ${fetchError.message}`,
            backendUrl: BACKEND_URL,
          },
          { status: 502, headers: corsHeaders }
        );
      }
      
      throw fetchError;
    }

    clearTimeout(timeoutId);

    if (!backendResponse.ok) {
      let errorData;
      try {
        errorData = await backendResponse.json();
      } catch {
        errorData = { error: 'Backend returned non-JSON response' };
      }
      
      console.error('❌ Backend error (HTTP ' + backendResponse.status + '):', errorData);
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || `Backend error (${backendResponse.status})`,
          message: errorData.message || 'Unable to fetch content from this URL.',
          backendStatus: backendResponse.status,
          backendUrl: BACKEND_URL
        },
        { status: backendResponse.status, headers: corsHeaders }
      );
    }

    let data;
    try {
      data = await backendResponse.json();
    } catch (jsonError) {
      console.error('❌ Failed to parse backend response:', jsonError);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response from backend',
          message: 'Backend returned invalid JSON',
        },
        { status: 500, headers: corsHeaders }
      );
    }
    
    console.log(`✅ Backend scraped ${data.paragraphs?.length || 0} paragraphs`);

    return NextResponse.json(data, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Unexpected error in scrape-url API:', error);
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    
    let errorMessage = 'Internal server error';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorMessage = error.message || 'Unknown error';
      errorDetails = error.stack || '';
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: 'An unexpected error occurred. Please try again.',
        backendUrl: BACKEND_URL,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
