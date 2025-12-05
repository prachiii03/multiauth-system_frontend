import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    // This is a proxy endpoint to your backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

    let endpoint = '';
    switch (action) {
      case 'login':
        endpoint = '/api/auth/login';
        break;
      case 'register':
        endpoint = '/api/auth/register';
        break;
      case 'logout':
        endpoint = '/api/auth/logout';
        break;
      case 'me':
        endpoint = '/api/auth/me';
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: JSON.stringify(data)
    });

    const responseData = await response.json();

    return NextResponse.json(responseData, {
      status: response.status
    });
  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || ''
      }
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status
    });
  } catch (error) {
    console.error('Auth GET Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}