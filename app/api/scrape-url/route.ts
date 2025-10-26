import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Use Node.js runtime for better fetch capabilities
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Paragraph {
  index: number;
  text: string;
  type: string;
}

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
  // Add CORS headers to response
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
        { status: 400 }
      );
    }

    console.log('🌐 Scraping URL:', url);

    // Validate and normalize URL
    let validUrl: string;
    try {
      validUrl = url.startsWith('http') ? url : `https://${url}`;
      new URL(validUrl);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch webpage with timeout
    let response;
    try {
      response = await fetch(validUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(15000),
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch URL',
          message: 'Unable to access this URL. It may be blocking requests or unreachable.'
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `HTTP ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    let title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled';

    // Remove noise
    $('script, style, nav, header, footer, aside, iframe, noscript').remove();

    // Find article content
    const articleSelectors = ['article', '[role="main"]', 'main', '.article-content', '.content', 'body'];
    let contentHtml = $('body').html() || '';
    
    for (const selector of articleSelectors) {
      const $selected = $(selector);
      if ($selected.length > 0) {
        contentHtml = $selected.html() || contentHtml;
        break;
      }
    }

    const $content = cheerio.load(contentHtml);
    const paragraphs: Paragraph[] = [];
    let index = 0;

    // Extract paragraphs
    $content('p, h1, h2, h3, h4, h5, h6, li').each((_idx, element) => {
      const $el = $content(element);
      const text = $el.text().trim();
      
      if (text.length < 20) return;
      
      const tagName = (element as any).tagName?.toLowerCase() || 'p';
      paragraphs.push({
        index: index++,
        text: text,
        type: tagName.startsWith('h') ? 'heading' : tagName === 'li' ? 'list' : 'p',
      });
    });

    // Fallback: split body text if no paragraphs found
    if (paragraphs.length === 0) {
      const bodyText = $content.text().trim();
      if (bodyText.length > 50) {
        bodyText.split(/\n\n+|(?<=\.)\s+/)
          .map(chunk => chunk.trim())
          .filter(chunk => chunk.length >= 20)
          .forEach((text, i) => {
            paragraphs.push({ index: i, text, type: 'p' });
          });
      }
    }

    console.log(`✅ Scraped ${paragraphs.length} paragraphs`);

    return NextResponse.json(
      {
        success: true,
        url: validUrl,
        title,
        paragraphs,
        total_paragraphs: paragraphs.length,
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('❌ Scrape Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Scraping failed',
        message: 'Unable to extract content from this URL.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
