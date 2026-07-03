/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Building2, 
  Users, 
  Cpu, 
  Film, 
  BookOpen, 
  Trophy, 
  GraduationCap 
} from 'lucide-react';
import { UtecMetric } from '../types';

interface KpiRowProps {
  utecs: UtecMetric[];
}

export default function KpiRow({ utecs }: KpiRowProps) {
  // Compute totals from our current list
  const activeListCount = utecs.length;
  const totalUnidadesList = utecs.reduce((sum, item) => sum + item.unidades, 0);
  const totalEstudantesList = utecs.reduce((sum, item) => sum + item.estudantes, 0);
  const totalLctList = utecs.reduce((sum, item) => sum + item.lct, 0);
  const totalRobList = utecs.reduce((sum, item) => sum + item.rob, 0);
  const totalCineList = utecs.reduce((sum, item) => sum + item.cine, 0);
  const totalFcdList = utecs.reduce((sum, item) => sum + item.fcd, 0);
  const totalRevList = utecs.reduce((sum, item) => sum + item.rev, 0);

  // Remove any static baselines or mock numbers completely.
  // All KPIs are now calculated strictly from the live dynamic database.
  const finalUnidades = totalUnidadesList;
  const finalEstudantes = totalEstudantesList;
  const finalLct = totalLctList;
  const finalRob = totalRobList;
  const finalCine = totalCineList;
  const finalFcd = totalFcdList;
  const finalRev = totalRevList;

  const kpis = [
    {
      title: 'UNIDADES ATENDIDAS',
      value: finalUnidades.toString(),
      subtext: `${activeListCount} UTECs Ativas`,
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-500 dark:border-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      icon: Building2,
      progress: Math.min(100, (finalUnidades / (activeListCount * 30 || 1)) * 100),
      progressColor: 'bg-blue-600 dark:bg-blue-500',
    },
    {
      title: 'ESTUDANTES',
      value: finalEstudantes >= 1000 ? `${(finalEstudantes / 1000).toFixed(1)}k` : finalEstudantes.toString(),
      subtext: 'Matrículas ativas',
      textColor: 'text-violet-600 dark:text-violet-400',
      borderColor: 'border-violet-500 dark:border-violet-500',
      bgColor: 'bg-violet-50 dark:bg-violet-950/30',
      icon: Users,
      progress: 100,
      progressColor: 'bg-violet-600 dark:bg-violet-500',
    },
    {
      title: 'LAB LCT',
      value: finalLct.toString(),
      subtext: `${finalUnidades > 0 ? Math.round((finalLct / finalUnidades) * 100) : 0}% cob.`,
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500 dark:border-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      icon: GraduationCap,
      progress: finalUnidades > 0 ? (finalLct / finalUnidades) * 100 : 0,
      progressColor: 'bg-emerald-600 dark:bg-emerald-500',
    },
    {
      title: 'ROBÓTICA',
      value: finalRob.toString(),
      subtext: `${finalUnidades > 0 ? Math.round((finalRob / finalUnidades) * 100) : 0}% cob.`,
      textColor: 'text-amber-500 dark:text-amber-400',
      borderColor: 'border-amber-500 dark:border-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      icon: Cpu,
      progress: finalUnidades > 0 ? (finalRob / finalUnidades) * 100 : 0,
      progressColor: 'bg-amber-500 dark:bg-amber-400',
    },
    {
      title: 'CINECLUBE',
      value: finalCine.toString(),
      subtext: `${finalUnidades > 0 ? Math.round((finalCine / finalUnidades) * 100) : 0}% cob.`,
      textColor: 'text-pink-600 dark:text-pink-400',
      borderColor: 'border-pink-500 dark:border-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-950/30',
      icon: Film,
      progress: finalUnidades > 0 ? (finalCine / finalUnidades) * 100 : 0,
      progressColor: 'bg-pink-600 dark:bg-pink-500',
    },
    {
      title: 'FORMAÇÃO EFEC. DIG.',
      value: finalFcd.toString(),
      subtext: `${finalUnidades > 0 ? Math.round((finalFcd / finalUnidades) * 100) : 0}% cob.`,
      textColor: 'text-teal-600 dark:text-teal-400',
      borderColor: 'border-teal-500 dark:border-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-950/30',
      icon: BookOpen,
      progress: finalUnidades > 0 ? (finalFcd / finalUnidades) * 100 : 0,
      progressColor: 'bg-teal-600 dark:bg-teal-500',
    },
    {
      title: 'PREMIADOS',
      value: finalRev.toString(),
      subtext: `${finalUnidades > 0 ? ((finalRev / finalUnidades) * 100).toFixed(1) : '0.0'}% taxa`,
      textColor: 'text-amber-600 dark:text-amber-500',
      borderColor: 'border-amber-500 dark:border-amber-500',
      bgColor: 'bg-amber-50/70 dark:bg-amber-950/20',
      icon: Trophy,
      progress: finalUnidades > 0 ? (finalRev / finalUnidades) * 100 * 5 : 0,
      progressColor: 'bg-amber-600 dark:bg-amber-500',
    },
  ];

  return (
    <div id="kpi-row-grid" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            id={`kpi-card-${index}`}
            key={kpi.title}
            className={`flex flex-col justify-between p-4 bg-white dark:bg-[#111827] rounded-xl shadow-xs border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between gap-1.5">
              <span className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase truncate">
                {kpi.title}
              </span>
              <div className={`p-1.5 rounded-lg ${kpi.bgColor} ${kpi.textColor} flex-shrink-0`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
              </div>
            </div>
            
            <div className="mt-3 flex-1 flex flex-col justify-end">
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 leading-none">
                {kpi.value}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1 whitespace-nowrap">
                {kpi.subtext}
              </p>

              {/* Polished capacity/progress indicator bar */}
              <div className="mt-3 space-y-1">
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${kpi.progressColor}`} 
                    style={{ width: `${Math.min(100, Math.max(0, kpi.progress))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
