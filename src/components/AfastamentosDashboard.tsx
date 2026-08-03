/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserX, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  X,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AfastamentoRecord, UtecMetric } from '../types';
import { INITIAL_AFASTAMENTOS } from '../data';

interface AfastamentosDashboardProps {
  utecs: UtecMetric[];
  afastamentos?: AfastamentoRecord[];
  isDarkMode?: boolean;
}

export default function AfastamentosDashboard({ 
  utecs, 
  afastamentos = INITIAL_AFASTAMENTOS,
  isDarkMode = false 
}: AfastamentosDashboardProps) {
  // Use afastamentos directly from Google Sheets / App state
  const records = afastamentos;
  
  // Filter states
  const [selectedRegional, setSelectedRegional] = useState<string>('Todas');
  const [selectedRpa, setSelectedRpa] = useState<string>('Todas');
  const [selectedUtecId, setSelectedUtecId] = useState<string>('Todas');
  const [selectedTipo, setSelectedTipo] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Chart hover state
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // Modal State for Detailed Afastamento
  const [selectedRecordModal, setSelectedRecordModal] = useState<AfastamentoRecord | null>(null);

  // Extract dynamic regional and RPA options
  const regionalOptions = useMemo(() => {
    const set = new Set<string>();
    utecs.forEach(u => { if (u.regional) set.add(u.regional.trim()); });
    records.forEach(r => { if (r.regional) set.add(r.regional.trim()); });
    return Array.from(set).sort();
  }, [utecs, records]);

  const rpaOptions = useMemo(() => {
    const set = new Set<string>();
    utecs.forEach(u => { 
      if (u.rpaSede) {
        const val = u.rpaSede.trim();
        set.add(val.startsWith('RPA') ? val : `RPA ${val}`);
      }
    });
    records.forEach(r => { 
      if (r.rpa) {
        const val = r.rpa.trim();
        set.add(val.startsWith('RPA') ? val : `RPA ${val}`);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [utecs, records]);

  const tipAfastamentoOptions = [
    'Licença Médica',
    'Licença Maternidade/Paternidade',
    'Férias',
    'Afastamento Preventivo',
    'Licença Prêmio',
    'Outros'
  ];

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Regional match
      const matchRegional = selectedRegional === 'Todas' || record.regional === selectedRegional;
      // RPA match
      const recRpa = (record.rpa || '').trim();
      const recRpaFormatted = recRpa.startsWith('RPA') ? recRpa : `RPA ${recRpa}`;
      const matchRpa = selectedRpa === 'Todas' || recRpa === selectedRpa || recRpaFormatted === selectedRpa;
      // UTEC match
      const matchUtec = selectedUtecId === 'Todas' || record.utecId === selectedUtecId;
      // Tipo match
      const matchTipo = selectedTipo === 'Todos' || record.tipoAfastamento === selectedTipo;
      // Status match
      const matchStatus = selectedStatus === 'Todos' || record.status === selectedStatus;
      // Query match
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        record.nomeProfissional.toLowerCase().includes(q) ||
        record.matricula.toLowerCase().includes(q) ||
        record.cargo.toLowerCase().includes(q) ||
        record.utecName.toLowerCase().includes(q);

      return matchRegional && matchRpa && matchUtec && matchTipo && matchStatus && matchQuery;
    });
  }, [records, selectedRegional, selectedRpa, selectedUtecId, selectedTipo, selectedStatus, searchQuery]);

  // KPI Calculations
  const totalAfastados = filteredRecords.length;
  const ativosCount = filteredRecords.filter(r => r.status === 'Ativo').length;
  const proximoRetornoCount = filteredRecords.filter(r => r.status === 'Próximo do Retorno').length;
  const licencasMedicasCount = filteredRecords.filter(r => r.tipoAfastamento === 'Licença Médica').length;

  // Chart Data 1: Donut (Por Tipo de Afastamento)
  const pieData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    filteredRecords.forEach(r => {
      counts[r.tipoAfastamento] = (counts[r.tipoAfastamento] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredRecords]);

  const PIE_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#64748B'];

  // Chart Data 2: Bar Chart (Afastamentos por UTEC)
  const barData = useMemo(() => {
    const utecMap: { [name: string]: number } = {};
    filteredRecords.forEach(r => {
      const shortName = r.utecName.replace('UTEC ', '');
      utecMap[shortName] = (utecMap[shortName] || 0) + 1;
    });
    return Object.entries(utecMap)
      .map(([utec, count]) => ({ utec, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredRecords]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  // Reset pagination when filter changes
  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedRegional('Todas');
    setSelectedRpa('Todas');
    setSelectedUtecId('Todas');
    setSelectedTipo('Todos');
    setSelectedStatus('Todos');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ['ID', 'Nome', 'Matrícula', 'Cargo', 'UTEC', 'Regional', 'RPA', 'Tipo Afastamento', 'Data Início', 'Data Fim', 'Dias', 'Status', 'Observação'];
    const rows = filteredRecords.map(r => [
      r.id,
      `"${r.nomeProfissional}"`,
      `"${r.matricula}"`,
      `"${r.cargo}"`,
      `"${r.utecName}"`,
      `"${r.regional}"`,
      `"${r.rpa}"`,
      `"${r.tipoAfastamento}"`,
      r.dataInicio,
      r.dataFim,
      r.diasAfastado,
      r.status,
      `"${r.observacao || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `afastamentos_utecs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for status badge
  const getStatusBadge = (status: AfastamentoRecord['status']) => {
    switch (status) {
      case 'Ativo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/80">
            <Clock className="w-3 h-3" />
            Ativo
          </span>
        );
      case 'Próximo do Retorno':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300/60 dark:border-blue-800/80">
            <AlertCircle className="w-3 h-3" />
            Retorno Próximo
          </span>
        );
      case 'Concluído':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/80">
            <CheckCircle2 className="w-3 h-3" />
            Concluído
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="afastamentos-dashboard-container" className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Interactive Filters Bar */}
      <div id="afastamentos-filters-bar" className="bg-white dark:bg-[#111827] p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
            <Filter className="w-4 h-4 text-[#1E40AF] dark:text-blue-400" />
            <span>Filtros do Painel de Afastamentos:</span>
          </div>
          
          <div className="flex items-center gap-3">
            {(selectedRegional !== 'Todas' || selectedRpa !== 'Todas' || selectedUtecId !== 'Todas' || selectedTipo !== 'Todos' || selectedStatus !== 'Todos' || searchQuery) && (
              <button
                id="clear-afastamentos-filters-btn"
                onClick={handleClearFilters}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Limpar Filtros
              </button>
            )}

            <button
              id="export-afastamentos-btn"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer shadow-3xs"
            >
              <Download className="w-3.5 h-3.5 text-[#1E40AF] dark:text-blue-400" />
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {/* Regional */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Regional</label>
            <select
              value={selectedRegional}
              onChange={(e) => handleFilterChange(setSelectedRegional, e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:border-[#1E40AF] focus:outline-hidden cursor-pointer"
            >
              <option value="Todas">Todas</option>
              {regionalOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* RPA */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">RPA</label>
            <select
              value={selectedRpa}
              onChange={(e) => handleFilterChange(setSelectedRpa, e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:border-[#1E40AF] focus:outline-hidden cursor-pointer"
            >
              <option value="Todas">Todas</option>
              {rpaOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* UTEC */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">UTEC</label>
            <select
              value={selectedUtecId}
              onChange={(e) => handleFilterChange(setSelectedUtecId, e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:border-[#1E40AF] focus:outline-hidden cursor-pointer"
            >
              <option value="Todas">Todas as UTECs</option>
              {utecs.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          {/* Tipo de Afastamento */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Tipo de Afastamento</label>
            <select
              value={selectedTipo}
              onChange={(e) => handleFilterChange(setSelectedTipo, e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:border-[#1E40AF] focus:outline-hidden cursor-pointer"
            >
              <option value="Todos">Todos os Tipos</option>
              {tipAfastamentoOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Status da Licença</label>
            <select
              value={selectedStatus}
              onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:border-[#1E40AF] focus:outline-hidden cursor-pointer"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Próximo do Retorno">Próximo do Retorno</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Buscar Servidor</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nome, matrícula..."
                value={searchQuery}
                onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                className="w-full text-xs font-medium pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:border-[#1E40AF] focus:outline-hidden"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Key Metrics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total de Registros</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalAfastados}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Afastamentos filtrados</span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-[#1E40AF] dark:text-blue-400 rounded-2xl">
            <UserX className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 block">Afastamentos Ativos</span>
            <span className="text-2xl font-black text-amber-700 dark:text-amber-300">{ativosCount}</span>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 block mt-0.5">Em andamento na rede</span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 block">Retorno Próximo</span>
            <span className="text-2xl font-black text-blue-700 dark:text-blue-300">{proximoRetornoCount}</span>
            <span className="text-[10px] text-blue-600/80 dark:text-blue-400/80 block mt-0.5">Nos próximos 15 dias</span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400 block">Licenças Médicas</span>
            <span className="text-2xl font-black text-rose-700 dark:text-rose-300">{licencasMedicasCount}</span>
            <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 block mt-0.5">Motivo de saúde / atestado</span>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. Analytics Visualizer Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Donut Distribution */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              Distribuição por Tipo de Afastamento
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Proporção dos principais motivos de licença na rede UTEC
            </p>
          </div>

          <div className="relative h-56 my-2">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      onMouseEnter={(_, idx) => setActivePieIndex(idx)}
                      onMouseLeave={() => setActivePieIndex(null)}
                    >
                      {pieData.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={PIE_COLORS[index % PIE_COLORS.length]} 
                          opacity={activePieIndex === null || activePieIndex === index ? 1 : 0.45}
                          stroke={activePieIndex === index ? 'rgba(255, 255, 255, 0.8)' : 'transparent'}
                          strokeWidth={activePieIndex === index ? 2 : 0}
                          style={{ transition: 'all 0.25s ease-in-out', cursor: 'pointer', outline: 'none' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', 
                        borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Badge: Total Afastamentos */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-200 origin-center ${activePieIndex !== null ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                  <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                    AFASTAMENTOS
                  </span>
                  <span className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">
                    {totalAfastados}
                  </span>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Sem dados para exibir o gráfico
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Top UTECs Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              Afastamentos por Unidade UTEC
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Volume total de servidores afastados por unidade tecnológica
            </p>
          </div>

          <div className="h-60 my-2">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1E293B' : '#F1F5F9'} />
                  <XAxis 
                    dataKey="utec" 
                    tick={{ fontSize: 10, fill: isDarkMode ? '#94A3B8' : '#64748B' }} 
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 10, fill: isDarkMode ? '#94A3B8' : '#64748B' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', 
                      borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }} 
                  />
                  <Bar dataKey="count" name="Afastamentos" fill="#1E40AF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Nenhum afastamento registrado
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Detailed Records Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              Registros de Afastamento ({filteredRecords.length})
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Lista detalhada de servidores e acompanhamento de vigências
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                <th className="py-3 px-4">Profissional / Matrícula</th>
                <th className="py-3 px-4">Cargo / Função</th>
                <th className="py-3 px-4">UTEC Lotação</th>
                <th className="py-3 px-4">Tipo Afastamento</th>
                <th className="py-3 px-4">Período / Duração</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((record) => (
                  <tr 
                    key={record.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition duration-150"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                        {record.nomeProfissional}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Mat: {record.matricula}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {record.cargo}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700 dark:text-slate-200">
                        {record.utecName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {record.regional} • {record.rpa}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-700 dark:text-blue-400">
                      {record.tipoAfastamento}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 dark:text-slate-200 font-mono font-medium text-[11px]">
                        {record.dataInicio.split('-').reverse().join('/')} a {record.dataFim.split('-').reverse().join('/')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Total: {record.diasAfastado} dias
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedRecordModal(record)}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Nenhum registro de afastamento encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Página {currentPage} de {totalPages} ({filteredRecords.length} registros)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Detalhes do Afastamento */}
      <AnimatePresence>
        {selectedRecordModal && (
          <div id="afastamento-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop with fade transition matching system standard */}
            <motion.div
              id="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#0F172A]/75 backdrop-blur-xs"
              onClick={() => setSelectedRecordModal(null)}
            />

            {/* Modal Card with spring slide-up zoom transition */}
            <motion.div
              id="afastamento-modal-card"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-white dark:bg-[#0F172A] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800/90 overflow-hidden z-10 max-h-[85vh] flex flex-col my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 bg-gradient-to-r from-slate-900 via-[#1E40AF] to-blue-800 text-white flex items-center justify-between border-b border-blue-900/50 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-xs">
                    <UserX className="w-5 h-5 text-blue-200" />
                  </div>
                  <h3 className="font-extrabold text-base tracking-tight">Detalhes do Afastamento</h3>
                </div>
                <button 
                  onClick={() => setSelectedRecordModal(null)}
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Profissional</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block mt-0.5">{selectedRecordModal.nomeProfissional}</span>
                    <span className="text-[11px] text-slate-500 font-mono block mt-0.5">Matrícula: {selectedRecordModal.matricula}</span>
                  </div>
                  <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Cargo / Função</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mt-1">{selectedRecordModal.cargo}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">UTEC de Lotação</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{selectedRecordModal.utecName}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{selectedRecordModal.regional} • {selectedRecordModal.rpa}</span>
                  </div>
                  <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Status da Licença</span>
                    <div className="mt-1.5">{getStatusBadge(selectedRecordModal.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Tipo de Afastamento</span>
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 block mt-0.5">{selectedRecordModal.tipoAfastamento}</span>
                  </div>
                  <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Vigência & Duração</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                      {selectedRecordModal.dataInicio.split('-').reverse().join('/')} a {selectedRecordModal.dataFim.split('-').reverse().join('/')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans font-semibold block mt-0.5">Total: {selectedRecordModal.diasAfastado} dias</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Observações / Justificativa</span>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {selectedRecordModal.observacao || 'Nenhuma observação adicional cadastrada.'}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedRecordModal(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
