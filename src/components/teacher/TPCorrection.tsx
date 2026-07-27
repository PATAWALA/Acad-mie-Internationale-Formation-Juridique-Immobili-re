'use client';
import GradingForm from './GradingForm';

interface TPCorrectionProps {
  submission: {
    id: number;
    student_name: string;
    file_url: string;
    status: string;
  };
  onValidate: (grade: number, comment: string) => void;
  onCancel: () => void;
}

export default function TPCorrection({ submission, onValidate, onCancel }: TPCorrectionProps) {
  return (
    <GradingForm
      studentName={submission.student_name}
      fileUrl={submission.file_url}
      onSubmit={onValidate}
      onCancel={onCancel}
    />
  );
}