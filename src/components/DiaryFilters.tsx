import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { UtecMetric } from '../types';

interface DiaryFiltersProps {
  filterRegional: string;
  setFilterRegional: (val: string) => void;
  filterRpa: string;
  setFilterRpa: (val: string) => void;
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
  scopedUtecs: UtecMetric[];
  scopedFilterSchools: { inep: string; name: string }[];
  uniqueMultipliers: string[];
  uniqueMonths: string[];
  resetAllFilters: () => void;
  anyFilterActive: boolean;
}

export default function DiaryFilters({
  filterRegional,
  setFilterRegional,
  filterRpa,
  setFilterRpa,
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
  scopedUtecs,
  scopedFilterSchools,
  uniqueMultipliers,
  uniqueMonths,
  resetAllFilters,
  anyFilterActive,
}: DiaryFiltersProps) {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-3xs space-y-3" id="diary-filters-bar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Filtros Integrados de Operação
          </h3>
        </div>
        {anyFilterActive && (
          <button
            onClick={resetAllFilters}
            className="flex items-center gap-1 py-1 px-2 text-[10px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            Limpar Filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {/* 1. Regional Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5">Regional</span>
          <select
            value={filterRegional}
            onChange={(e) => setFilterRegional(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="Todas">Todas as Regionais</option>
            <option value="Regional 1">Regional 1</option>
            <option value="Regional 2">Regional 2</option>
            <option value="Regional 3">Regional 3</option>
            <option value="Regional 4">Regional 4</option>
            <option value="Regional 5">Regional 5</option>
          </select>
        </div>

        {/* 2. RPA Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5">RPA</span>
          <select
            value={filterRpa}
            onChange={(e) => setFilterRpa(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="Todas">Todas as RPAs</option>
            <option value="RPA 1">RPA 1</option>
            <option value="RPA 2">RPA 2</option>
            <option value="RPA 3">RPA 3</option>
            <option value="RPA 4">RPA 4</option>
            <option value="RPA 5">RPA 5</option>
            <option value="RPA 6">RPA 6</option>
          </select>
        </div>

        {/* 3. UTEC Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5">UTEC</span>
          <select
            value={filterUtecId}
            onChange={(e) => setFilterUtecId(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="Todas">Todas as UTECs ({scopedUtecs.length})</option>
            {scopedUtecs.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. School Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5">Escola</span>
          <select
            value={filterEscolaInep}
            onChange={(e) => setFilterEscolaInep(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium truncate focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="Todas">Todas as Escolas ({scopedFilterSchools.length})</option>
            {scopedFilterSchools.map((school) => (
              <option key={school.inep} value={school.inep}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Category Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5">Categoria</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium truncate focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="Todas">Todas as Categorias</option>
            <option value="Diário - Expediente na UTEC">Expediente UTEC</option>
            <option value="Diário - Eventos Externos">Eventos Externos</option>
            <option value="Diário - Clubes e Projetos">Clubes e Projetos</option>
            <option value="Diário - Orientação REDS">Orientação REDS</option>
          </select>
        </div>

        {/* 6. Month Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5">Mês</span>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="Todas">Todo o Ano</option>
            {uniqueMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* 7. Multiplier/Solicitante Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5">Multiplicador</span>
          <select
            value={filterSolicitante}
            onChange={(e) => setFilterSolicitante(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium truncate focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
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
