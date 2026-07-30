'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClientComponent } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { fadeIn, stagger } from '@/lib/animations';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  ScrollText,
  UserCheck,
  MessageCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/dashboard/admin/cours', label: 'Cours', icon: BookOpen },
  { href: '/dashboard/admin/certificats', label: 'Certificats', icon: GraduationCap },
  { href: '/dashboard/admin/certificats/emettre', label: 'Émettre certificats', icon: ScrollText },
  { href: '/dashboard/admin/assignations', label: 'Assignations', icon: UserCheck },
  { href: '/dashboard/admin/questions', label: 'Support', icon: MessageCircle },
  { href: '/dashboard/admin/parametres', label: 'Paramètres', icon: Settings },
];

export default function AdminSidebar() {
  const supabase = createClientComponent();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative flex flex-col bg-slate-900 border-r border-slate-800 min-h-screen transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Admin Panel</h2>
              <p className="text-[10px] text-slate-500 font-medium">Académie Juridique</p>
            </div>
          </motion.div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto">
            <Settings className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <motion.div key={item.href} variants={fadeIn}>
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-slate-800 text-white shadow-lg shadow-slate-900/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'
                  )} />
                  
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}

                  {/* Indicateur actif */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-500 rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Tooltip sur collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap border border-slate-700 shadow-xl z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className={cn(
            'group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
          
          {collapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap border border-slate-700 shadow-xl z-50">
              Déconnexion
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}