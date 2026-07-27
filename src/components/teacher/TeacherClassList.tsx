interface ClassInfo {
  id: number;
  certificate_id: number;
  certificates?: {
    title: string;
  };
}

interface TeacherClassListProps {
  classes: ClassInfo[];
  selectedClass: ClassInfo | null;
  onSelect: (cls: ClassInfo) => void;
}

export default function TeacherClassList({ classes, selectedClass, onSelect }: TeacherClassListProps) {
  return (
    <div className="space-y-4">
      {classes.map((cls) => (
        <button
          key={cls.id}
          onClick={() => onSelect(cls)}
          className={`w-full text-left p-4 rounded-2xl border transition ${
            selectedClass?.id === cls.id
              ? 'bg-dark-700 border-gold-400/30'
              : 'bg-dark-800 border-dark-600 hover:border-dark-500'
          }`}
        >
          <p className="text-white font-medium">
            {cls.certificates?.title || `Classe ${cls.certificate_id}`}
          </p>
        </button>
      ))}
    </div>
  );
}