import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface Paragraph {
  index: number;
  text: string;
  type: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log('🌐 Scraping URL:', url);

    // Validate URL format
    let validUrl: string;
    try {
      validUrl = url.startsWith('http') ? url : `https://${url}`;
      new URL(validUrl); // Validate URL
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the webpage with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    let response;
    try {
      response = await fetch(validUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch URL. The website may be blocking automated requests or is unreachable.',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
        },
        { status: 500 }
      );
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    let title = $('title').text().trim();
    if (!title) {
      title = $('h1').first().text().trim() || 'Untitled Article';
    }

    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, iframe, noscript').remove();

    // Extract paragraphs from article content
    const paragraphs: Paragraph[] = [];
    let index = 0;

    // Try to find article content in common containers
    const articleSelectors = [
      'article',
      '[role="main"]',
      'main',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content',
      'body',
    ];

    let contentHtml = $('body').html() || '';
    for (const selector of articleSelectors) {
      const $selected = $(selector);
      if ($selected.length > 0) {
        contentHtml = $selected.html() || contentHtml;
        break;
      }
    }

    const $content = cheerio.load(contentHtml);

    // Extract text from paragraphs, headings, and list items
    $content('p, h1, h2, h3, h4, h5, h6, li').each((_idx: any, element: any) => {
      const $el = $content(element);
      const text = $el.text().trim();
      
      // Skip very short text (likely navigation or footer items)
      if (text.length < 20) {
        return;
      }

      // Skip if it's just a link
      if ($el.find('a').length === 1 && $el.text() === $el.find('a').text()) {
        return;
      }

      const tagName = element.tagName?.toLowerCase() || 'p';
      
      paragraphs.push({
        index: index++,
        text: text,
        type: tagName.startsWith('h') ? 'heading' : tagName === 'li' ? 'list' : 'p',
      });
    });

    // If no paragraphs found, try to extract all text
    if (paragraphs.length === 0) {
      const bodyText = $content.text().trim();
      if (bodyText.length > 50) {
        // Split by double newlines or periods followed by whitespace
        const chunks = bodyText
          .split(/\n\n+|(?<=\.)\s+/)
          .map((chunk: string) => chunk.trim())
          .filter((chunk: string) => chunk.length >= 20);

        chunks.forEach((text: string, i: number) => {
          paragraphs.push({
            index: i,
            text: text,
            type: 'p',
          });
        });
      }
    }

    console.log(`✅ Scraped ${paragraphs.length} paragraphs from URL`);

    return NextResponse.json({
      success: true,
      url: url,
      title: title,
      paragraphs: paragraphs,
      total_paragraphs: paragraphs.length,
    });

  } catch (error) {
    console.error('❌ URL Scraping Error:', error);
    
    // Provide more detailed error messages
    let errorMessage = 'Failed to scrape URL';
    let errorDetails = '';
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to fetch content from this URL';
        errorDetails = 'The website may be blocking automated requests, requires authentication, or is unreachable.';
      } else if (error.message.includes('timeout') || error.message.includes('aborted')) {
        errorMessage = 'Request timeout';
        errorDetails = 'The website took too long to respond. Please try again.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: errorDetails || 'Unable to fetch content from this URL. Please check if the URL is accessible.',
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
