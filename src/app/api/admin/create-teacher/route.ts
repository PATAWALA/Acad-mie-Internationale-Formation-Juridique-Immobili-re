import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, phone, role } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json(
        { error: "Le nom complet et l'email sont obligatoires." },
        { status: 400 }
      );
    }

    // Rôle par défaut : TEACHER, peut être ADMIN
    const finalRole = role || 'TEACHER';
    
    // Un mot de passe par défaut si l'Admin n'en saisit pas
    const finalPassword = password && password.trim() !== '' ? password : 'Professeur2026!';

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { 
        auth: { 
          autoRefreshToken: false, 
          persistSession: false 
        } 
      }
    );

    // 1. Création ultra-rapide sans confirmation par mail
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: finalPassword,
      email_confirm: true, // Marque l'email comme déjà confirmé
      user_metadata: { full_name: fullName, role: finalRole },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Insertion instantanée dans profiles avec le rôle dynamique
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      email,
      full_name: fullName,
      phone: phone || null,
      role: finalRole,
      status: 'PAID',
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}