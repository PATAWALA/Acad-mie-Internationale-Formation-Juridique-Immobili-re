'use client';

import { useState, useEffect } from 'react';
import { createClientComponent } from '@/lib/supabase/client';
import { getStudentProgress } from '@/lib/student-progress';
import { Search, Users, Loader2, ArrowLeft, UserCircle } from 'lucide-react';

interface AuditeursListProps {
  certId: number;
  onBack: () => void;
}

export default function AuditeursList({ certId, onBack }: AuditeursListProps) {
  const supabase = createClientComponent();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED'>('ALL');

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);

      // 1. Récupérer les inscriptions payées de cette formation
      const { data: enrolls, error: enrollError } = await supabase
        .from('enrollments')
        .select('student_id, payment_status')
        .eq('certificate_id', certId)
        .eq('payment_status', 'PAID');

      if (enrollError || !enrolls) {
        setLoading(false);
        setStudents([]);
        return;
      }

      // 2. Extraire les IDs d'étudiants en filtrant les valeurs null
      const studentIds = enrolls
        .map((e: any) => e.student_id)
        .filter((id: string | null): id is string => id !== null);

      if (studentIds.length === 0) {
        setLoading(false);
        setStudents([]);
        return;
      }

      // 3. Récupérer les profils de ces étudiants
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      if (profilesError || !profiles) {
        setLoading(false);
        setStudents([]);
        return;
      }

      // 4. Calculer la progression pour chaque étudiant
      const progressData: any[] = [];
      for (const student of profiles) {
        const progress = await getStudentProgress(certId, student.id);
        progressData.push({
          ...student,
          progressPercent: progress?.progressPercent ?? 0,
          modulesValidated: progress?.modulesValidated ?? 0,
          totalModules: progress?.totalModules ?? 0,
        });
      }

      setStudents(progressData);
      setLoading(false);
    };

    fetchStudents();
  }, [certId]);

  // Filtrage
  const filteredStudents = students.filter((student) => {
    // Filtre par statut de progression
    if (statusFilter !== 'ALL') {
      const pct = student.progressPercent || 0;
      if (statusFilter === 'COMPLETED' && pct !== 100) return false;
      if (statusFilter === 'IN_PROGRESS' && (pct === 0 || pct === 100)) return false;
      if (statusFilter === 'NOT_STARTED' && pct !== 0) return false;
    }

    // Filtre par recherche
    const searchLower = search.toLowerCase();
    const name = (student.full_name || '').toLowerCase();
    const email = (student.email || '').toLowerCase();
    return name.includes(searchLower) || email.includes(searchLower);
  });

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux formations
      </button>

      {/* En-tête */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          Auditeurs de la formation
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {students.length} auditeur{students.length > 1 ? 's' : ''} inscrit{students.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="ALL">Tous</option>
          <option value="COMPLETED">Terminés</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="NOT_STARTED">Non commencés</option>
        </select>
      </div>

      {/* Liste des auditeurs */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <UserCircle className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-semibold mb-1">Aucun auditeur trouvé</h3>
          <p className="text-slate-400 text-sm max-w-sm">
            {search ? 'Essayez avec un autre terme de recherche.' : 'Aucun auditeur payé pour cette formation.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student) => {
            const pct = student.progressPercent || 0;
            return (
              <div
                key={student.id}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-slate-700 transition-colors"
              >
                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{student.full_name || 'Sans nom'}</p>
                  <p className="text-slate-400 text-sm truncate">{student.email || ''}</p>
                </div>

                {/* Progression */}
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-blue-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-slate-400 text-sm w-10 text-right">{pct}%</span>
                </div>

                {/* Badge statut */}
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                    pct === 100
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : pct > 0
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {pct === 100 ? 'Terminé' : pct > 0 ? 'En cours' : 'Non commencé'}
                </span>

                {/* Bouton détails (à implémenter plus tard) */}
                <button
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                >
                  Détails
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}