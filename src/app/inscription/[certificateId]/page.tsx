import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import RegistrationClient from './RegistrationClient';

export default async function InscriptionPage({ params }: { params: { certificateId: string } }) {
  const supabase = await createServerSupabase();
  const { data: certificate } = await supabase
    .from('certificates')
    .select('*')
    .eq('id', params.certificateId)
    .single();

  if (!certificate) notFound();

  return <RegistrationClient certificate={certificate} />;
}