import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    application: 'digital-cash',
    timestamp: new Date().toISOString(),
  });
}
