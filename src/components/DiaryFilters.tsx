import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { UtecMetric } from '../types';

interface DiaryFiltersProps {
  filterUtecId: string;
  setFilterUtecId: (val: string) => void;
  filterEscolaInep: string;
  setFilterEscolaInep: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  filterMonth: string;
  setFilterMonth: (val: string) => void;
  filterSolicitante: string;
  setFilterSolicitante: (val: string) => void;
  utecs: UtecMetric[];
  scopedFilterSchools: { inep: string; name: string }[];
  uniqueMultipliers: string[];
  resetAllFilters: () => void;
  anyFilterActive: boolean;
}

export default function DiaryFilters({
  filterUtecId,
  setFilterUtecId,
  filterEscolaInep,
  setFilterEscolaInep,
  filterCategory,
  setFilterCategory,
  filterMonth,
  setFilterMonth,
  filterSolicitante,
  setFilterSolicitante,
  utecs,
  scopedFilterSchools,
  uniqueMultipliers,
  resetAllFilters,
  anyFilterActive,
}: DiaryFiltersProps) {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-3xs space-y-3" id="diary-filters-bar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Filtros Integrados de Operação
          </h3>
        </div>
        {anyFilterActive && (
          <button
            onClick={resetAllFilters}
            className="flex items-center gap-1 py-1 px-2 text-[10px] font-black text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            Limpar Filtros
          </button>
        )}
      </div>      <div className={`grid grid-cols-1 sm:grid-cols-2 ${utecs.length > 1 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3`}>
        {/* UTEC Filter */}
        {utecs.length > 1 && (
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5">UTEC</span>
            <select
              value={filterUtecId}
              onChange={(e) => setFilterUtecId(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-bold focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Todas">Todas as UTECs</option>
              {utecs.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* School Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5">Escola</span>
          <select
            value={filterEscolaInep}
            onChange={(e) => setFilterEscolaInep(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-bold truncate focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="Todas">Todas as Escolas ({scopedFilterSchools.length})</option>
            {scopedFilterSchools.map((school) => (
              <option key={school.inep} value={school.inep}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5">Categoria</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-bold truncate focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="Todas">Todas as Categorias</option>
            <option value="Diário - Expediente na UTEC">Expediente UTEC</option>
            <option value="Diário - Eventos Externos">Eventos Externos</option>
            <option value="Diário - Clubes e Projetos">Clubes e Projetos</option>
            <option value="Diário - Orientação REDS">Orientação REDS</option>
          </select>
        </div>

        {/* Month Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5">Mês</span>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-bold focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="Todas">Todo o Ano</option>
            <option value="fev. de 2026">Fevereiro</option>
            <option value="mar. de 2026">Março</option>
          </select>
        </div>

        {/* Multiplier/Solicitante Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5">Multiplicador</span>
          <select
            value={filterSolicitante}
            onChange={(e) => setFilterSolicitante(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-bold truncate focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="Todas">Todos ({uniqueMultipliers.length})</option>
            {uniqueMultipliers.map((mult) => (
              <option key={mult} value={mult}>
                {mult}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
