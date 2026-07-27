import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  // Traitement du callback (à compléter avec ton intégration Wave)
  console.log('Callback reçu', body);
  return NextResponse.json({ received: true });
}