import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const GetSchema = z.object({
  document_id: z.string().uuid(),
});

const PostSchema = z.object({
  document_id: z.string().uuid(),
  position: z.number().int().min(0),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = GetSchema.safeParse({
    document_id: searchParams.get('document_id'),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid document_id query parameter' },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('documents')
    .select('last_read_position, last_read_at')
    .eq('id', parsed.data.document_id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Document not found' },
      { status: 404 },
    );
  }

  return NextResponse.json({ progress: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = PostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('documents')
    .update({
      last_read_position: parsed.data.position,
      last_read_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.document_id);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
