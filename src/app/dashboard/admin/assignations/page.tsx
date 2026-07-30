'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { CreateTeacherModal } from '@/components/dashboard/admin/CreateTeacherModal';
import { cn } from '@/lib/utils';
import { fadeIn, stagger } from '@/lib/animations';
import {
  UserCheck,
  Plus,
  Trash2,
  GraduationCap,
  Users,
  Loader2,
  AlertCircle,
  Link2,
  Unlink,
  UserPlus,
} from 'lucide-react';

export default function AdminAssignationsPage() {
  const supabase = createClientComponent();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState<number | ''>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from('certificate_teachers')
      .select('id, certificate_id, teacher_id, certificates(title), profiles!teacher_id(full_name, email)');
    if (data) setAssignments(data);
  };

  const fetchTeachers = async () => {
    const { data: teachs } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'TEACHER')
      .order('full_name');
    if (teachs) setTeachers(teachs);
  };

  useEffect(() => {
    const loadData = async () => {
      const { data: certs } = await supabase
        .from('certificates')
        .select('id, title')
        .order('title');
      if (certs) setCertificates(certs);
      await fetchTeachers();
      await fetchAssignments();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleAssign = async () => {
    if (!selectedCert || !selectedTeacher) {
      setError('Veuillez sélectionner un certificat et un enseignant.');
      return;
    }
    
    setAssigning(true);
    setError('');
    
    const { error: insertError } = await supabase
      .from('certificate_teachers')
      .insert({
        certificate_id: selectedCert,
        teacher_id: selectedTeacher,
      } as any);
    
    if (insertError) {
      setError(insertError.message);
    } else {
      setSelectedCert('');
      setSelectedTeacher('');
      fetchAssignments();
    }
    
    setAssigning(false);
  };

  const handleRemove = async (id: number) => {
    setRemovingId(id);
    const { error: removeError } = await supabase
      .from('certificate_teachers')
      .delete()
      .eq('id', id);
    if (!removeError) {
      fetchAssignments();
    } else {
      alert('Erreur : ' + removeError.message);
    }
    setRemovingId(null);
  };

  // Callback après création d'un enseignant : rafraîchir la liste et pré-sélectionner
  const handleTeacherCreated = () => {
    fetchTeachers();
    setIsModalOpen(false);
  };

  const groupedAssignments = assignments.reduce((acc: any, assignment) => {
    const certId = assignment.certificate_id;
    if (!acc[certId]) {
      acc[certId] = {
        certificate: assignment.certificates?.title || 'Inconnu',
        teachers: [],
      };
    }
    acc[certId].teachers.push(assignment);
    return acc;
  }, {});

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeIn} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-500/10 rounded-xl">
              <UserCheck className="w-5 h-5 text-violet-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Assignations
            </h1>
          </div>
          <p className="text-slate-400 text-sm ml-14">
            Assignez des enseignants aux certificats pour qu&apos;ils puissent corriger les travaux.
          </p>
        </div>
        
        {/* BOUTON AJOUTER UN ENSEIGNANT */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-violet-500/20"
        >
          <UserPlus className="w-4 h-4" />
          Ajouter un Enseignant
        </motion.button>
      </motion.div>

      {/* Formulaire d'assignation */}
      <motion.div
        variants={fadeIn}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <Link2 className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Nouvelle assignation
          </h2>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              Certificat
            </label>
            <select
              value={selectedCert}
              onChange={(e) => {
                setSelectedCert(Number(e.target.value));
                setError('');
              }}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="">-- Sélectionner un certificat --</option>
              {certificates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 w-full">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" />
              Enseignant
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => {
                setSelectedTeacher(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="">-- Sélectionner un enseignant --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name || t.email}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAssign}
            disabled={assigning}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-2.5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-violet-500/20 flex-shrink-0',
              assigning && 'opacity-70 cursor-not-allowed'
            )}
          >
            {assigning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Assignation...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Assigner
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Assignations existantes */}
      <motion.div variants={fadeIn}>
        <div className="flex items-center gap-3 mb-4">
          <Unlink className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Assignations existantes
          </h2>
          {!loading && (
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
              {assignments.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse"
              >
                <div className="h-5 bg-slate-800 rounded-lg w-1/4 mb-3" />
                <div className="flex gap-2">
                  <div className="h-8 bg-slate-800 rounded-full w-32" />
                  <div className="h-8 bg-slate-800 rounded-full w-32" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-3 bg-slate-800 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 text-sm">Aucune assignation pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedAssignments).map(([certId, group]: [string, any]) => (
              <motion.div
                key={certId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
              >
                <div className="px-5 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">
                    {group.certificate}
                  </h3>
                  <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">
                    {group.teachers.length} enseignant{group.teachers.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  {group.teachers.map((assignment: any) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-violet-300">
                            {(assignment.profiles?.full_name || '?')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            {assignment.profiles?.full_name || 'Inconnu'}
                          </p>
                          {assignment.profiles?.email && (
                            <p className="text-xs text-slate-500">
                              {assignment.profiles.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRemove(assignment.id)}
                        disabled={removingId === assignment.id}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                          'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
                          removingId === assignment.id && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {removingId === assignment.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        Retirer
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal de création d'enseignant */}
      <CreateTeacherModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </motion.div>
  );
}