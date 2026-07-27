'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';
import { supabaseAdmin } from '@/lib/supabase/service';

// Enregistrement de polices si nécessaire
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 },
  ],
});

interface ReceiptData {
  studentName: string;
  certificateTitle: string;
  amountPaid: number;
  remaining: number;
  date: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Inter',
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 10,
    color: '#c5a028',
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 20,
    color: '#0a0a0a',
  },
  row: {
    fontSize: 11,
    marginBottom: 6,
    color: '#333333',
  },
  footer: {
    marginTop: 30,
    fontSize: 9,
    color: '#999999',
    textAlign: 'center',
  },
});

const ReceiptDocument = ({ data }: { data: ReceiptData }) => (
  <Document>
    <Page size="A6" style={styles.page}>
      <Text style={styles.header}>ACADÉMIE INTERNATIONALE</Text>
      <Text style={styles.title}>Reçu de paiement</Text>
      <Text style={styles.row}>Étudiant : {data.studentName}</Text>
      <Text style={styles.row}>Certificat : {data.certificateTitle}</Text>
      <Text style={styles.row}>Montant payé : {data.amountPaid} FCFA</Text>
      <Text style={styles.row}>Reste à payer : {data.remaining} FCFA</Text>
      <Text style={styles.row}>Date : {new Date(data.date).toLocaleDateString('fr-FR')}</Text>
      <Text style={styles.footer}>Académie Internationale — Cabinet Dr Lobé</Text>
    </Page>
  </Document>
);

export async function generateReceipt(data: ReceiptData): Promise<string> {
  const blob = await pdf(<ReceiptDocument data={data} />).toBlob();
  const fileName = `quittance_${Date.now()}.pdf`;
  
  const { data: upload, error } = await supabaseAdmin.storage
    .from('receipts')
    .upload(fileName, blob, { contentType: 'application/pdf' });

  if (error) throw new Error(error.message);

  const { data: publicUrl } = supabaseAdmin.storage
    .from('receipts')
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
}

export default ReceiptDocument;