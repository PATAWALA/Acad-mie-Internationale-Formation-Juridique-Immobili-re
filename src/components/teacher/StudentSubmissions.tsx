interface Submission {
  id: number;
  student_name: string;
  file_url: string;
  status: string;
}

interface StudentSubmissionsProps {
  submissions: Submission[];
  onSelect: (submission: Submission) => void;
  activeId?: number;
}

export default function StudentSubmissions({ submissions, onSelect, activeId }: StudentSubmissionsProps) {
  if (submissions.length === 0) {
    return <p className="text-gray-500">Aucune soumission en attente.</p>;
  }

  return (
    <div className="space-y-4">
      {submissions.map((sub) => (
        <button
          key={sub.id}
          onClick={() => onSelect(sub)}
          className={`w-full text-left p-4 rounded-2xl border transition ${
            activeId === sub.id
              ? 'bg-dark-700 border-gold-400/30'
              : 'bg-dark-800 border-dark-600 hover:border-dark-500'
          }`}
        >
          <p className="text-white font-medium">{sub.student_name}</p>
          <p className="text-xs text-gray-400 mt-1">{sub.status}</p>
        </button>
      ))}
    </div>
  );
}