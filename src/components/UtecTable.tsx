import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  AlertCircle,
  Building2,
  Users,
  FileText,
  Activity,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Trophy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { UtecMetric, EducationalUnit } from '../types';
import { REGIONALS, INITIAL_EDUCATIONAL_UNITS } from '../data';

interface UtecTableProps {
  utecs: UtecMetric[];
  educationalUnits?: EducationalUnit[];
  diaryRecords?: any[];
}

export default function UtecTable({ utecs, educationalUnits, diaryRecords = [] }: UtecTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegional, setSelectedRegional] = useState('Todas');
  const [selectedRpa, setSelectedRpa] = useState('Todas');
  const [selectedUtecFilter, setSelectedUtecFilter] = useState('Todas');
  const [selectedMovimentacao, setSelectedMovimentacao] = useState('Todas');
  const [selectedDiaryCountFilter, setSelectedDiaryCountFilter] = useState('Todas');
  const [selectedResourceFilter, setSelectedResourceFilter] = useState('Todos');

  const [sortField, setSortField] = useState<'nome' | 'utec' | 'regional' | 'rpa' | 'lct' | 'rob' | 'cine' | 'acoes' | 'movimentacao' | 'demanda'>('nome');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const unitsList = educationalUnits && educationalUnits.length > 0 ? educationalUnits : INITIAL_EDUCATIONAL_UNITS;

  // Map each educational unit to its supporting UTEC's regional, name, and diary interactions
  const unitsWithUtec = useMemo(() => {
    const uLookup = new Map<string, UtecMetric>();
    utecs.forEach(u => uLookup.set(u.id, u));

    return unitsList.map(unit => {
      const utec = uLookup.get(unit.id_utec_suporte);
      
      // Calculate interactions from diaryRecords robustly
      let diaryCount = 0;
      if (diaryRecords && diaryRecords.length > 0) {
        diaryCount = diaryRecords.filter(r => {
          // Match by INEP
          if (r.escolaInep && String(r.escolaInep).trim() === String(unit.inep_escola).trim()) {
            return true;
          }
          // Match by name containing or contained
          const unitNameNorm = String(unit.nome_unidade || "").toUpperCase().trim();
          const recordSchoolNorm = String(r.escolaNome || r.unidadeDeEnsino || "").toUpperCase().trim();
          if (unitNameNorm && recordSchoolNorm) {
            if (recordSchoolNorm.includes(unitNameNorm) || unitNameNorm.includes(recordSchoolNorm)) {
              return true;
            }
          }
          return false;
        }).length;
      }

      return {
        ...unit,
        utecName: utec ? utec.name : unit.id_utec_suporte.toUpperCase(),
        regional: utec ? utec.regional : 'Não Definida',
        diaryCount,
        status_movimentacao: diaryCount > 0 ? 'Com' : 'Sem'
      };
    });
  }, [utecs, unitsList, diaryRecords]);

  // Compute unique RPAs for selector dynamically
  const rpaList = useMemo(() => {
    const set = new Set<string>();
    unitsWithUtec.forEach(u => {
      if (u.rpa_escola) {
        set.add(String(u.rpa_escola).trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [unitsWithUtec]);

  // Compute unique UTECs for selector dynamically
  const utecList = useMemo(() => {
    const set = new Set<string>();
    unitsWithUtec.forEach(u => {
      if (u.utecName) {
        set.add(String(u.utecName).trim());
      }
    });
    return Array.from(set).sort();
  }, [unitsWithUtec]);

  // Compute unique Regionals for selector dynamically
  const regionalList = useMemo(() => {
    const set = new Set<string>();
    unitsWithUtec.forEach(u => {
      if (u.regional) {
        set.add(String(u.regional).trim());
      }
    });
    return Array.from(set).sort();
  }, [unitsWithUtec]);

  // Compute counts for active (Com Movimentação) vs inactive (Sem Movimentação) schools
  const { countCom, countSem } = useMemo(() => {
    let com = 0;
    let sem = 0;
    unitsWithUtec.forEach(u => {
      if (u.diaryCount > 0) {
        com++;
      } else {
        sem++;
      }
    });
    return { countCom: com, countSem: sem };
  }, [unitsWithUtec]);

  // Filtered educational units
  const filteredUnits = useMemo(() => {
    return unitsWithUtec.filter((unit) => {
      const query = searchQuery.toLowerCase();
      
      const matchesSearch = 
        unit.nome_unidade.toLowerCase().includes(query) ||
        unit.utecName.toLowerCase().includes(query) ||
        unit.regional.toLowerCase().includes(query) ||
        unit.inep_escola.includes(query) ||
        unit.endereco.toLowerCase().includes(query);
      
      const matchesRegional = selectedRegional === 'Todas' || unit.regional === selectedRegional;
      
      const matchesRpa = selectedRpa === 'Todas' || String(unit.rpa_escola).trim() === selectedRpa;
      
      const matchesUtec = selectedUtecFilter === 'Todas' || String(unit.utecName).trim() === selectedUtecFilter;
      
      const matchesMovimentacao = 
        selectedMovimentacao === 'Todas' || 
        (selectedMovimentacao === 'Com' && unit.diaryCount > 0) ||
        (selectedMovimentacao === 'Sem' && unit.diaryCount === 0);

      const matchesDiaryCount = 
        selectedDiaryCountFilter === 'Todas' ||
        (selectedDiaryCountFilter === 'Sem' && unit.diaryCount === 0) ||
        (selectedDiaryCountFilter === 'Com' && unit.diaryCount > 0) ||
        (selectedDiaryCountFilter === 'Poucos' && unit.diaryCount >= 1 && unit.diaryCount <= 4) ||
        (selectedDiaryCountFilter === 'Muitos' && unit.diaryCount >= 5);

      const matchesResource = 
        selectedResourceFilter === 'Todos' ||
        (selectedResourceFilter === 'LCT' && unit.qtd_lct > 0) ||
        (selectedResourceFilter === 'Robótica' && unit.qtd_robotica > 0) ||
        (selectedResourceFilter === 'Cineclube' && unit.qtd_cineclube > 0) ||
        (selectedResourceFilter === 'Nenhum' && unit.qtd_lct === 0 && unit.qtd_robotica === 0 && unit.qtd_cineclube === 0);

      return matchesSearch && matchesRegional && matchesRpa && matchesUtec && matchesMovimentacao && matchesDiaryCount && matchesResource;
    });
  }, [unitsWithUtec, searchQuery, selectedRegional, selectedRpa, selectedUtecFilter, selectedMovimentacao, selectedDiaryCountFilter, selectedResourceFilter]);

  // Sort units
  const sortedUnits = useMemo(() => {
    const sorted = [...filteredUnits];
    sorted.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (sortField === 'nome') {
        valA = a.nome_unidade || '';
        valB = b.nome_unidade || '';
      } else if (sortField === 'utec') {
        valA = a.utecName || '';
        valB = b.utecName || '';
      } else if (sortField === 'regional') {
        valA = a.regional || '';
        valB = b.regional || '';
      } else if (sortField === 'rpa') {
        valA = a.rpa_escola || '';
        valB = b.rpa_escola || '';
      } else if (sortField === 'lct') {
        valA = a.qtd_lct || 0;
        valB = b.qtd_lct || 0;
      } else if (sortField === 'rob') {
        valA = a.qtd_robotica || 0;
        valB = b.qtd_robotica || 0;
      } else if (sortField === 'cine') {
        valA = a.qtd_cineclube || 0;
        valB = b.qtd_cineclube || 0;
      } else if (sortField === 'acoes') {
        valA = a.diaryCount || 0;
        valB = b.diaryCount || 0;
      } else if (sortField === 'movimentacao') {
        valA = a.diaryCount > 0 ? 1 : 0;
        valB = b.diaryCount > 0 ? 1 : 0;
      } else if (sortField === 'demanda') {
        valA = a.por_demanda || '';
        valB = b.por_demanda || '';
      }

      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else {
        const strA = String(valA || '');
        const strB = String(valB || '');
        comparison = strA.localeCompare(strB, 'pt-BR', { numeric: true, sensitivity: 'base' });
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredUnits, sortField, sortDirection]);

  // Reset page to 1 whenever any filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRegional, selectedRpa, selectedUtecFilter, selectedMovimentacao, selectedDiaryCountFilter, selectedResourceFilter]);

  // Smooth scroll back to table header when page changes
  const isTableMounted = React.useRef(false);
  React.useEffect(() => {
    if (!isTableMounted.current) {
      isTableMounted.current = true;
      return;
    }
    const tableEl = document.getElementById('table-block-container');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  // Paginated Units list
  const totalItems = sortedUnits.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const paginatedUnits = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedUnits.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedUnits, currentPage, itemsPerPage]);

  const handleSort = (field: 'nome' | 'utec' | 'regional' | 'rpa' | 'lct' | 'rob' | 'cine' | 'acoes' | 'movimentacao' | 'demanda') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div id="table-system-section" className="w-full">
      {/* Table Container Block */}
      <div id="table-block-container" className="w-full bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Table Title and Subtitle Header */}
        <div id="table-tab-header" className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-3 bg-slate-50/50 dark:bg-slate-900/10">
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Unidades Educacionais / Escolas</h3>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">Lista de unidades de ensino suportadas e os recursos instalados</p>
          </div>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
            {filteredUnits.length} Escolas
          </span>
        </div>

        {/* Searching & Filter Controls Bar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/5 flex flex-col gap-2.5">
          {/* Search bar */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="utec-search-input"
              type="text"
              placeholder="Pesquisar por unidade, utec, regional..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-[#1E40AF] dark:focus:border-blue-500 focus:outline-hidden transition-all text-slate-700 dark:text-slate-200"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Regional Filter */}
            <div className="flex-1 min-w-[130px] sm:flex-initial sm:w-[140px]">
              <select
                id="regional-filter-select"
                value={selectedRegional}
                onChange={(e) => {
                  setSelectedRegional(e.target.value);
                  setSelectedUtecFilter('Todas'); // Reset dependent filter
                }}
                className="w-full text-xs font-bold px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-[#1E40AF] focus:outline-hidden transition-all text-slate-600 dark:text-slate-300 cursor-pointer text-ellipsis overflow-hidden"
              >
                <option value="Todas">Todas Regionais</option>
                {regionalList.map((reg) => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>

            {/* RPA Filter */}
            <div className="flex-1 min-w-[110px] sm:flex-initial sm:w-[120px]">
              <select
                id="rpa-filter-select"
                value={selectedRpa}
                onChange={(e) => setSelectedRpa(e.target.value)}
                className="w-full text-xs font-bold px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-[#1E40AF] focus:outline-hidden transition-all text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <option value="Todas">Todas RPAs</option>
                {rpaList.map((rpa) => (
                  <option key={rpa} value={rpa}>{rpa.startsWith('RPA') ? rpa : `RPA ${rpa}`}</option>
                ))}
              </select>
            </div>

            {/* UTEC Filter */}
            <div className="flex-1 min-w-[130px] sm:flex-initial sm:w-[150px]">
              <select
                id="utec-filter-select"
                value={selectedUtecFilter}
                onChange={(e) => setSelectedUtecFilter(e.target.value)}
                className="w-full text-xs font-bold px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-[#1E40AF] focus:outline-hidden transition-all text-slate-600 dark:text-slate-300 cursor-pointer text-ellipsis overflow-hidden"
              >
                <option value="Todas">Todas UTECs</option>
                {utecList.map((utecName) => (
                  <option key={utecName} value={utecName}>{utecName}</option>
                ))}
              </select>
            </div>

            {/* Movimentação Selector */}
            <div className="flex-1 min-w-[170px] sm:flex-initial sm:w-[190px]">
              <select
                id="movimentacao-filter-select"
                value={selectedMovimentacao}
                onChange={(e) => setSelectedMovimentacao(e.target.value)}
                className="w-full text-xs font-bold px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-[#1E40AF] focus:outline-hidden transition-all text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <option value="Todas">Movimentação: Todas ({unitsWithUtec.length})</option>
                <option value="Com">Com Movimentação ({countCom})</option>
                <option value="Sem">Sem Movimentação ({countSem})</option>
              </select>
            </div>

            {/* Filtro de Diários (Registros) */}
            <div className="flex-1 min-w-[170px] sm:flex-initial sm:w-[190px]">
              <select
                id="diary-count-filter-select"
                value={selectedDiaryCountFilter}
                onChange={(e) => setSelectedDiaryCountFilter(e.target.value)}
                className="w-full text-xs font-bold px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-[#1E40AF] focus:outline-hidden transition-all text-slate-600 dark:text-slate-300 cursor-pointer text-ellipsis overflow-hidden"
              >
                <option value="Todas">Registros: Qualquer Qtd.</option>
                <option value="Sem">Sem Registros (0)</option>
                <option value="Com">Com Registros (≥ 1)</option>
                <option value="Poucos">Poucos Registros (1 a 4)</option>
                <option value="Muitos">Muitos Registros (≥ 5)</option>
              </select>
            </div>

            {/* Filtro de Recursos */}
            <div className="flex-1 min-w-[150px] sm:flex-initial sm:w-[160px]">
              <select
                id="resource-filter-select"
                value={selectedResourceFilter}
                onChange={(e) => setSelectedResourceFilter(e.target.value)}
                className="w-full text-xs font-bold px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-[#1E40AF] focus:outline-hidden transition-all text-slate-600 dark:text-slate-300 cursor-pointer text-ellipsis overflow-hidden"
              >
                <option value="Todos">Recursos: Todos</option>
                <option value="LCT">Com LCT</option>
                <option value="Robótica">Com Robótica</option>
                <option value="Cineclube">Com Cineclube</option>
                <option value="Nenhum">Nenhum Recurso</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto" id="data-table-container">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* Figma Styled Light Blue Header row */}
              <tr className="bg-[#EBF3FF] dark:bg-slate-800" id="table-headers">
                {/* School Name */}
                <th 
                  onClick={() => handleSort('nome')}
                  className={`px-5 py-3 text-[10px] font-semibold tracking-wider cursor-pointer select-none transition-colors duration-150 ${
                    sortField === 'nome'
                      ? 'bg-blue-100 dark:bg-slate-700/50 text-blue-900 dark:text-blue-300'
                      : 'text-blue-950 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    ESCOLA / UNIDADE
                    {sortField === 'nome' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" /> : <ArrowDown className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* UTEC */}
                <th 
                  onClick={() => handleSort('utec')}
                  className={`px-4 py-3 text-[10px] font-semibold tracking-wider cursor-pointer select-none transition-colors duration-150 ${
                    sortField === 'utec'
                      ? 'bg-blue-100 dark:bg-slate-700/50 text-blue-900 dark:text-blue-300'
                      : 'text-blue-950 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    UTEC SUPORTE
                    {sortField === 'utec' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" /> : <ArrowDown className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* Regional */}
                <th 
                  onClick={() => handleSort('regional')}
                  className={`px-4 py-3 text-[10px] font-semibold tracking-wider cursor-pointer select-none transition-colors duration-150 ${
                    sortField === 'regional'
                      ? 'bg-blue-100 dark:bg-slate-700/50 text-blue-900 dark:text-blue-300'
                      : 'text-blue-950 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    REGIONAL
                    {sortField === 'regional' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" /> : <ArrowDown className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* RPA */}
                <th 
                  onClick={() => handleSort('rpa')}
                  className={`px-4 py-3 text-[10px] font-semibold tracking-wider cursor-pointer select-none transition-colors duration-150 ${
                    sortField === 'rpa'
                      ? 'bg-blue-100 dark:bg-slate-700/50 text-blue-900 dark:text-blue-300'
                      : 'text-blue-950 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    RPA
                    {sortField === 'rpa' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" /> : <ArrowDown className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* LCT */}
                <th 
                  onClick={() => handleSort('lct')}
                  className={`px-4 py-3 text-[10px] font-semibold tracking-wider text-center cursor-pointer select-none transition-colors duration-150 ${
                    sortField === 'lct'
                      ? 'bg-blue-100 dark:bg-slate-700/50 text-blue-900 dark:text-blue-300'
                      : 'text-blue-950 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    LCT
                    {sortField === 'lct' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" /> : <ArrowDown className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* ROB */}
                <th 
                  onClick={() => handleSort('rob')}
                  className={`px-4 py-3 text-[10px] font-semibold tracking-wider text-center cursor-pointer select-none transition-colors duration-150 ${
                    sortField === 'rob'
                      ? 'bg-blue-100 dark:bg-slate-700/50 text-blue-900 dark:text-blue-300'
                      : 'text-blue-950 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    ROB.
                    {sortField === 'rob' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" /> : <ArrowDown className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* CINE */}
                <th 
                  onClick={() => handleSort('cine')}
                  className={`px-4 py-3 text-[10px] font-semibold tracking-wider text-center cursor-pointer select-none transition-colors duration-150 ${
                    sortField === 'cine'
                      ? 'bg-blue-100 dark:bg-slate-700/50 text-blue-900 dark:text-blue-300'
                      : 'text-blue-950 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    CINE
                    {sortField === 'cine' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" /> : <ArrowDown className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100" />
                    )}
                  </div>
                </th>
                
                {/* Diário Actions */}
                <th 
                  onClick={() => handleSort('acoes')}
                  className={`px-4 py-3 text-[10px] font-semibold tracking-wider text-center cursor-pointer select-none transition-colors duration-150 ${
                    sortField === 'acoes'
                      ? 'bg-blue-100 dark:bg-slate-700/50 text-blue-900 dark:text-blue-300'
                      : 'text-blue-950 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    DIÁRIO
                    {sortField === 'acoes' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" /> : <ArrowDown className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* MOVIMENTAÇÃO */}
                <th 
                  onClick={() => handleSort('movimentacao')}
                  className={`px-4 py-3 text-[10px] font-semibold tracking-wider text-center cursor-pointer select-none transition-colors duration-150 ${
                    sortField === 'movimentacao'
                      ? 'bg-blue-100 dark:bg-slate-700/50 text-blue-900 dark:text-blue-300'
                      : 'text-blue-950 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    MOVIMENTAÇÃO
                    {sortField === 'movimentacao' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" /> : <ArrowDown className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* DEMANDA */}
                <th 
                  onClick={() => handleSort('demanda')}
                  className={`px-5 py-3 text-[10px] font-semibold tracking-wider text-center cursor-pointer select-none transition-colors duration-150 ${
                    sortField === 'demanda'
                      ? 'bg-blue-100 dark:bg-slate-700/50 text-blue-900 dark:text-blue-300'
                      : 'text-blue-950 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    DEMANDA
                    {sortField === 'demanda' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" /> : <ArrowDown className="w-4.5 h-4.5 text-blue-800 dark:text-blue-400 stroke-[3.5]" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800" id="table-body">
              {paginatedUnits.length > 0 ? (
                paginatedUnits.map((unit, index) => {
                  const hasDestaque = unit.premiado && unit.premiado.toUpperCase().includes("DESTAQUE");
                  // Unique index-based key prevents any duplicates reconciliation errors
                  const uniqueKey = `${unit.inep_escola}-${index}`;

                  return (
                    <tr
                      id={`table-row-${uniqueKey}`}
                      key={uniqueKey}
                      className={`transition-colors group hover:bg-blue-50/45 dark:hover:bg-slate-800/60 ${
                        index % 2 === 0 
                          ? 'bg-white dark:bg-[#111827]' 
                          : 'bg-slate-50/70 dark:bg-slate-900/40'
                      }`}
                    >
                      {/* Name of Unit */}
                      <td className="px-5 py-2.5">
                        <div className="flex flex-col max-w-[280px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors group-hover:text-[#1E40AF] dark:group-hover:text-blue-400">
                              {unit.nome_unidade}
                            </span>
                            {hasDestaque && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded text-[8px] font-semibold tracking-wider uppercase animate-pulse">
                                <Trophy className="w-2.5 h-2.5" />
                                Destaque
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                            INEP: {unit.inep_escola} | {unit.tipo_unidade}
                          </span>
                        </div>
                      </td>

                      {/* Support UTEC */}
                      <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300 text-xs">
                        <span className="bg-blue-50 dark:bg-blue-950/20 text-[#1E40AF] dark:text-blue-355 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {unit.utecName}
                        </span>
                      </td>

                      {/* Regional */}
                      <td className="px-4 py-2.5">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all px-2 py-0.5 rounded-md">
                          {unit.regional}
                        </span>
                      </td>

                      {/* RPA */}
                      <td className="px-4 py-2.5">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {unit.rpa_escola && unit.rpa_escola.toUpperCase().startsWith('RPA') ? unit.rpa_escola : `RPA ${unit.rpa_escola || 'N/A'}`}
                        </span>
                      </td>

                      {/* Equipped indicators */}
                      {/* LCT */}
                      <td className="px-4 py-2.5 text-center">
                        <div className="flex justify-center">
                          <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold border transition-all ${
                            unit.qtd_lct > 0 
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30 dark:border-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs' 
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                          }`}>
                            {unit.qtd_lct}
                          </span>
                        </div>
                      </td>

                      {/* Rob (Robótica) */}
                      <td className="px-4 py-2.5 text-center">
                        <div className="flex justify-center">
                          <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold border transition-all ${
                            unit.qtd_robotica > 0 
                              ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-500/30 dark:border-amber-500/10 text-amber-600 dark:text-amber-400 shadow-xs' 
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                          }`}>
                            {unit.qtd_robotica}
                          </span>
                        </div>
                      </td>

                      {/* Cineclube */}
                      <td className="px-4 py-2.5 text-center">
                        <div className="flex justify-center">
                          <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold border transition-all ${
                            unit.qtd_cineclube > 0 
                              ? 'bg-pink-50 dark:bg-pink-950/20 border-pink-500/30 dark:border-pink-500/10 text-pink-600 dark:text-pink-400 shadow-xs' 
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                          }`}>
                            {unit.qtd_cineclube}
                          </span>
                        </div>
                      </td>

                      {/* Diário Ações Count */}
                      <td className="px-4 py-2.5 text-center">
                        <div className="flex justify-center">
                          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                            unit.diaryCount > 0 
                              ? 'bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-200/50 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-mono shadow-xs' 
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                          }`}>
                            <FileText className="w-3 h-3 flex-shrink-0" />
                            {unit.diaryCount} {unit.diaryCount === 1 ? 'registro' : 'registros'}
                          </span>
                        </div>
                      </td>

                      {/* Movimentação status badge */}
                      <td className="px-4 py-2.5 text-center">
                        <div className="flex justify-center">
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-semibold border transition-all ${
                            unit.diaryCount > 0 
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/10 border-emerald-200/55 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 shadow-xs' 
                              : 'bg-rose-50/60 dark:bg-rose-950/10 border-rose-200/55 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 font-medium'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${unit.diaryCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            {unit.diaryCount > 0 ? 'Ativa' : 'Sem Movimentação'}
                          </span>
                        </div>
                      </td>

                      {/* Por Demanda status badge */}
                      <td className="px-5 py-2.5 text-center">
                        <div className="flex justify-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide inline-block ${
                            unit.por_demanda === 'Sim'
                              ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-950/40'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                          }`}>
                            {unit.por_demanda}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
                      <AlertCircle className="w-7 h-7 text-slate-350 dark:text-slate-600" />
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nenhum resultado encontrado</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">Tente ajustar seus termos de pesquisa (unidade, utec ou regional) ou filtros aplicados.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination / Bottom panel control */}
        <div id="table-pagination-footer" className="px-5 py-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {totalItems > 0 ? (
              <span>
                Exibindo <strong className="text-slate-700 dark:text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</strong> a{' '}
                <strong className="text-slate-700 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, totalItems)}</strong> de{' '}
                <strong className="text-slate-700 dark:text-slate-200">{totalItems}</strong> unidades
              </span>
            ) : (
              <span>Nenhuma unidade para exibir</span>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1" id="pagination-buttons-container">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-45 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center"
                title="Página Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Numbered page buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const isNear = Math.abs(page - currentPage) <= 1;
                const isFirstOrLast = page === 1 || page === totalPages;
                
                if (totalPages > 6 && !isNear && !isFirstOrLast) {
                  // Show ellipsis
                  if (page === 2 || page === totalPages - 1) {
                    return (
                      <span key={`ellipsis-${page}`} className="px-1 text-slate-400 dark:text-slate-600 font-semibold select-none text-xs">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={`page-${page}`}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7.5 h-7.5 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700'
                        : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-45 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center"
                title="Próxima Página"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Items per page Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Por página:</span>
            <select
              id="items-per-page-select"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer focus:outline-hidden"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
