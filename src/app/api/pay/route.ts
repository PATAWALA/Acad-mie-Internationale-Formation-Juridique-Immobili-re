import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Client Supabase avec la clé de service (pour vérifier l'utilisateur côté serveur)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Récupérer le token d'authentification depuis les headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Vérifier l'utilisateur avec Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { enrollmentId, amount, method } = await request.json();
    if (!enrollmentId || !amount) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // Vérifier que l'enrollment appartient à l'utilisateur
    const { data: enrollment, error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .eq('student_id', user.id)
      .single();

    if (enrollError || !enrollment) {
      return NextResponse.json({ error: 'Inscription introuvable' }, { status: 404 });
    }

    // Pour l'instant, on simule le paiement (à remplacer par l'appel KKIAPAY quand le compte sera créé)
    // Simulation : on met à jour directement l'enrollment
    const { error: updateError } = await supabaseAdmin
      .from('enrollments')
      .update({
        payment_status: 'PAID',
        amount_paid: amount,
        remaining_balance: 0,
      })
      .eq('id', enrollmentId);

    if (updateError) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    // Redirection vers le dashboard avec succès
    return NextResponse.json({
      success: true,
      paymentUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/etudiant?payment=success`,
    });
  } catch (err: any) {
    console.error('Erreur API pay:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}