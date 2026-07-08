import React from 'react';
import { FileText, Users, GraduationCap } from 'lucide-react';

interface DiaryKPIsProps {
  totalRegistros: number;
  multiplicadoresCount: number;
  professoresImpactados: number;
  estudantesImpactados: number;
}

export default function DiaryKPIs({
  totalRegistros,
  multiplicadoresCount,
  professoresImpactados,
  estudantesImpactados,
}: DiaryKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="diary-kpi-grid">
      {/* Card 1: Total de Atividades */}
      <div 
        id="kpi-total-atividades"
        className="flex items-center justify-between p-4 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-3xs border-l-4 border-l-blue-600 dark:border-l-blue-500 hover:shadow-xs transition-all"
      >
        <div className="space-y-1 min-w-0">
          <span className="block text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase truncate">
            Total de Atividades
          </span>
          <h3 className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 leading-none">
            {totalRegistros}
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Registros sincronizados
          </p>
        </div>
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex-shrink-0">
          <FileText className="w-5 h-5" />
        </div>
      </div>

      {/* Card 2: Multiplicadores */}
      <div 
        id="kpi-multiplicadores"
        className="flex items-center justify-between p-4 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-3xs border-l-4 border-l-indigo-600 dark:border-l-indigo-500 hover:shadow-xs transition-all"
      >
        <div className="space-y-1 min-w-0">
          <span className="block text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase truncate">
            Multiplicadores Ativos
          </span>
          <h3 className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 leading-none">
            {multiplicadoresCount}
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Profissionais dedicados
          </p>
        </div>
        <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* Card 3: Professores Impactados */}
      <div 
        id="kpi-professores"
        className="flex items-center justify-between p-4 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-3xs border-l-4 border-l-emerald-600 dark:border-l-emerald-500 hover:shadow-xs transition-all"
      >
        <div className="space-y-1 min-w-0">
          <span className="block text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase truncate">
            Professores Impactados
          </span>
          <h3 className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 leading-none">
            {professoresImpactados}
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Docentes assessorados
          </p>
        </div>
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
      </div>

      {/* Card 4: Estudantes Impactados */}
      <div 
        id="kpi-estudantes"
        className="flex items-center justify-between p-4 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-3xs border-l-4 border-l-pink-600 dark:border-l-pink-500 hover:shadow-xs transition-all"
      >
        <div className="space-y-1 min-w-0">
          <span className="block text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase truncate">
            Estudantes Impactados
          </span>
          <h3 className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 leading-none">
            {estudantesImpactados}
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Alunos engajados
          </p>
        </div>
        <div className="p-3 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex-shrink-0">
          <Users className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
