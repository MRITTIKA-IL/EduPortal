// src/app/api/contact/route.ts
// POST /api/contact — saves contact form submissions to SQL Server
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, subject, message } = body;

    // Basic validation
    if (!fullName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: fullName, email, subject, message' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Insert into SQL Server
    await query(
      `INSERT INTO ContactMessages (FullName, Email, Phone, Subject, MessageBody)
       VALUES (@fullName, @email, @phone, @subject, @message)`,
      { fullName, email, phone: phone || null, subject, message }
    );

    return NextResponse.json(
      { success: true, message: 'Your message has been received!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
