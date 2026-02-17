import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, reason } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Log the deletion request for admin to process manually
    console.log('=== ACCOUNT DELETION REQUEST ===');
    console.log('Email:', email);
    console.log('Reason:', reason || 'No reason provided');
    console.log('Date:', new Date().toISOString());
    console.log('================================');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
