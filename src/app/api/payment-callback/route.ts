import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Vérifier que le paiement est bien validé
  if (body.status === 'SUCCESS' || body.transaction_status === 'completed') {
    const enrollmentId = parseInt(body.external_transaction_id || '0', 10);

    if (enrollmentId) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      await supabaseAdmin
        .from('enrollments')
        .update({
          payment_status: 'PAID',
          amount_paid: body.amount,
          remaining_balance: 0,
        })
        .eq('id', enrollmentId);
    }
  }

  return NextResponse.json({ received: true });
}