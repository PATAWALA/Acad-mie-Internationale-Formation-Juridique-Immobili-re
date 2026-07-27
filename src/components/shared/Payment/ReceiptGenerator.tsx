import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { supabaseAdmin } from '@/lib/supabase/service';

interface ReceiptData {
  studentName: string;
  certificateTitle: string;
  amountPaid: number;
  remaining: number;
  date: string;
}

const styles = StyleSheet.create({
  page: { padding: 20, fontFamily: 'Helvetica' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  text: { fontSize: 12, marginBottom: 4 },
});

export async function generateReceipt(data: ReceiptData): Promise<string> {
  const doc = (
    <Document>
      <Page size="A6" style={styles.page}>
        <Text style={styles.title}>ACADÉMIE INTERNATIONALE</Text>
        <Text style={styles.text}>Reçu de paiement</Text>
        <Text style={styles.text}>Étudiant : {data.studentName}</Text>
        <Text style={styles.text}>Certificat : {data.certificateTitle}</Text>
        <Text style={styles.text}>Montant payé : {data.amountPaid} FCFA</Text>
        <Text style={styles.text}>Reste à payer : {data.remaining} FCFA</Text>
        <Text style={styles.text}>Date : {new Date(data.date).toLocaleDateString('fr-FR')}</Text>
      </Page>
    </Document>
  );

  const blob = await pdf(doc).toBlob();
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