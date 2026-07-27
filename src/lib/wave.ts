interface WavePaymentRequest {
  amount: number;
  currency: string; // 'XOF'
  phone: string;
  enrollmentId: number;
}

interface WavePaymentResponse {
  transactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  message?: string;
}

export async function initiateWavePayment(params: WavePaymentRequest): Promise<WavePaymentResponse> {
  // TODO: Remplacer par l'appel à l'API Wave Côte d'Ivoire
  // Exemple avec l'API Wave (documentation à vérifier)
  const response = await fetch('https://api.wave.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WAVE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      client_reference: `enroll-${params.enrollmentId}`,
      phone_number: params.phone,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/callback?enrollmentId=${params.enrollmentId}`,
      error_url: `${process.env.NEXT_PUBLIC_SITE_URL}/paiement/erreur`,
    }),
  });

  if (!response.ok) {
    throw new Error('Échec de l’initiation du paiement Wave');
  }

  const data = await response.json();
  return {
    transactionId: data.id,
    status: 'PENDING',
  };
}