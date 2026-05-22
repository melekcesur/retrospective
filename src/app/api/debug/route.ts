import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL ?? '';
  const token = process.env.TURSO_AUTH_TOKEN ?? '';
  return NextResponse.json({
    url_set: !!url,
    url_preview: url.slice(0, 40),
    token_set: !!token,
    token_length: token.length,
  });
}
