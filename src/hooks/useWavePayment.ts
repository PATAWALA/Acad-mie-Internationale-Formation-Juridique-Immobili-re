import { useState } from 'react';
import { initiateWavePayment } from '@/lib/wave';

export function useWavePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async (params: { amount: number; phone: string; enrollmentId: number }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await initiateWavePayment({
        amount: params.amount,
        currency: 'XOF',
        phone: params.phone,
        enrollmentId: params.enrollmentId,
      });
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { pay, loading, error };
}