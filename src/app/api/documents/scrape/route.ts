import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

const ScrapeSchema = z.object({
  url: z.string().url(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ScrapeSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'invalid_url', details: parsed.error.format() }, 
        { status: 400 }
      );
    }

    const { url } = parsed.data;

    // Fetch the URL pretending to be a standard browser
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 HakiRead/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // Parse the HTML using JSDOM
    const doc = new JSDOM(html, { url });
    
    // Pass the document to Readability
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      throw new Error('Readability failed to parse the article content.');
    }

    // Return the clean content
    return NextResponse.json({
      title: article.title,
      byline: article.byline,
      dir: article.dir,
      lang: article.lang,
      content: article.textContent.trim(), // Raw text content for RSVP
      html: article.content, // Cleaned HTML if needed for display
      length: article.length,
      excerpt: article.excerpt,
      sourceUrl: url
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during scraping';
    // Graceful scrape_failed response as required by the spec
    return NextResponse.json(
      { 
        error: 'scrape_failed', 
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
