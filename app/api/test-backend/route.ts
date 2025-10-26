import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://zpsajst-linkscout-backend.hf.space';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    backendUrl: BACKEND_URL,
    tests: {},
  };

  // Test 1: Backend health
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });
    results.tests.health = {
      status: healthResponse.status,
      ok: healthResponse.ok,
      data: await healthResponse.json().catch(() => null),
    };
  } catch (error) {
    results.tests.health = {
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    };
  }

  // Test 2: Scrape endpoint availability
  try {
    const scrapeResponse = await fetch(`${BACKEND_URL}/scrape-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' }),
      signal: AbortSignal.timeout(15000),
    });
    results.tests.scrapeUrl = {
      status: scrapeResponse.status,
      ok: scrapeResponse.ok,
      data: await scrapeResponse.json().catch(() => null),
    };
  } catch (error) {
    results.tests.scrapeUrl = {
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    };
  }

  // Test 3: Environment variables
  results.environment = {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };

  return NextResponse.json(results, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
