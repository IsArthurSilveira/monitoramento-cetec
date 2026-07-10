/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  Users,
  School,
  Search,
  Filter,
  RotateCcw,
  Calendar,
  Clock,
  Building2,
  UserCheck,
  GraduationCap,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { RoboticsClub, EducationalUnit, UtecMetric } from '../types';

interface RoboticsClubsDashboardProps {
  roboticsClubs: RoboticsClub[];
  educationalUnits: EducationalUnit[];
  utecs: UtecMetric[];
  isDarkMode?: boolean;
}

export default function RoboticsClubsDashboard({
  roboticsClubs = [],
  educationalUnits = [],
  utecs = [],
  isDarkMode = false
}: RoboticsClubsDashboardProps) {
  // Navigation tabs within this dashboard
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'clubs' | 'no-clubs'>('stats');

  // Filter States
  const [selectedUtecId, setSelectedUtecId] = useState<string>('all');
  const [selectedRegional, setSelectedRegional] = useState<string>('all');
  const [selectedRpa, setSelectedRpa] = useState<string>('all');
  const [selectedModalidade, setSelectedModalidade] = useState<string>('all');

  // Pagination States for Clubs
  const [currentPageClubs, setCurrentPageClubs] = useState<number>(1);
  const [itemsPerPageClubs, setItemsPerPageClubs] = useState<number>(10);

  // Pagination States for Schools Without Clubs
  const [currentPageNoClubs, setCurrentPageNoClubs] = useState<number>(1);
  const [itemsPerPageNoClubs, setItemsPerPageNoClubs] = useState<number>(10);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPageClubs(1);
    setCurrentPageNoClubs(1);
  }, [selectedUtecId, selectedRegional, selectedRpa, selectedModalidade]);

  // Dropdown option sets derived dynamically
  const uniqueUtecs = useMemo(() => {
    const list = new Set<string>();
    roboticsClubs.forEach(c => {
      if (c.id_utec) list.add(c.id_utec);
    });
    return Array.from(list).map(id => {
      const matched = utecs.find(u => String(u.id) === String(id));
      return {
        id,
        name: matched ? matched.name : `UTEC ${id}`
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [roboticsClubs, utecs]);

  const uniqueRegionals = useMemo(() => {
    const list = new Set<string>();
    educationalUnits.forEach(u => {
      if (u.rpa_escola) {
        // Find regional from RPA or school
        const match = u.rpa_escola.match(/\d+/);
        if (match) {
          const rpaNum = parseInt(match[0], 10);
          const reg = rpaNum <= 2 ? 'Regional 1' : rpaNum === 3 ? 'Regional 2' : rpaNum === 4 ? 'Regional 3' : rpaNum === 5 ? 'Regional 4' : 'Regional 5';
          list.add(reg);
        }
      }
    });
    return Array.from(list).sort();
  }, [educationalUnits]);

  const uniqueRpas = useMemo(() => {
    const list = new Set<string>();
    educationalUnits.forEach(u => {
      if (u.rpa_escola) list.add(u.rpa_escola);
    });
    return Array.from(list).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [educationalUnits]);

  const uniqueModalidades = useMemo(() => {
    const list = new Set<string>();
    roboticsClubs.forEach(c => {
      if (c.modalidade_clube) {
        list.add(c.modalidade_clube.trim());
      }
    });
    return Array.from(list).sort((a, b) => a.localeCompare(b));
  }, [roboticsClubs]);

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedUtecId('all');
    setSelectedRegional('all');
    setSelectedRpa('all');
    setSelectedModalidade('all');
  };

  // 1. Filter Robotics Clubs
  const filteredClubs = useMemo(() => {
    return roboticsClubs.filter(clube => {
      // Find supporting school for this club
      const school = educationalUnits.find(u => {
        const idA = String(u.id_unidade || '').trim();
        const idB = String(clube.id_unidade || '').trim();
        return idA && idB && idA === idB;
      });

      // Filter by UTEC support
      if (selectedUtecId !== 'all' && String(clube.id_utec) !== selectedUtecId) {
        return false;
      }

      // Filter by Regional / RPA of supporting school
      if (school) {
        if (selectedRpa !== 'all' && school.rpa_escola !== selectedRpa) {
          return false;
        }
        if (selectedRegional !== 'all') {
          const match = school.rpa_escola.match(/\d+/);
          if (match) {
            const rpaNum = parseInt(match[0], 10);
            const reg = rpaNum <= 2 ? 'Regional 1' : rpaNum === 3 ? 'Regional 2' : rpaNum === 4 ? 'Regional 3' : rpaNum === 5 ? 'Regional 4' : 'Regional 5';
            if (reg !== selectedRegional) return false;
          } else {
            return false;
          }
        }
      } else {
        // If no matching school, let it pass regional filters only if regional filter is 'all'
        if (selectedRegional !== 'all' || selectedRpa !== 'all') {
          return false;
        }
      }

      // Filter by Modalidade
      if (selectedModalidade !== 'all') {
        const clubMod = (clube.modalidade_clube || '').trim();
        if (clubMod !== selectedModalidade) {
          return false;
        }
      }

      return true;
    });
  }, [roboticsClubs, educationalUnits, selectedUtecId, selectedRegional, selectedRpa, selectedModalidade]);

  // 2. Schools with and without Robotics Clubs (based on current filters)
  const schoolsAnalysis = useMemo(() => {
    // Determine which schools are matched to the active filters
    const activeSchools = educationalUnits.filter(school => {
      // Filter by UTEC
      if (selectedUtecId !== 'all' && String(school.id_utec_suporte) !== selectedUtecId) {
        return false;
      }
      // Filter by RPA
      if (selectedRpa !== 'all' && school.rpa_escola !== selectedRpa) {
        return false;
      }
      // Filter by Regional
      if (selectedRegional !== 'all') {
        const match = school.rpa_escola.match(/\d+/);
        if (match) {
          const rpaNum = parseInt(match[0], 10);
          const reg = rpaNum <= 2 ? 'Regional 1' : rpaNum === 3 ? 'Regional 2' : rpaNum === 4 ? 'Regional 3' : rpaNum === 5 ? 'Regional 4' : 'Regional 5';
          if (reg !== selectedRegional) return false;
        } else {
          return false;
        }
      }
      return true;
    });

    const schoolsWithClubs: EducationalUnit[] = [];
    const schoolsWithoutClubs: EducationalUnit[] = [];

    // Map schools to their club count
    activeSchools.forEach(school => {
      const hasClub = roboticsClubs.some(c => {
        const idA = String(c.id_unidade || '').trim();
        const idB = String(school.id_unidade || '').trim();
        return idA && idB && idA === idB;
      });

      if (hasClub) {
        schoolsWithClubs.push(school);
      } else {
        schoolsWithoutClubs.push(school);
      }
    });

    return {
      totalActiveSchools: activeSchools.length,
      withClubs: schoolsWithClubs,
      withoutClubs: schoolsWithoutClubs
    };
  }, [educationalUnits, roboticsClubs, selectedUtecId, selectedRegional, selectedRpa]);

  // 3. Compute KPI Metrics
  const metrics = useMemo(() => {
    let totalStudents = 0;
    let totalBoys = 0;
    let totalGirls = 0;

    filteredClubs.forEach(c => {
      totalStudents += c.qnt_alunos_clube || 0;
      totalBoys += c.qnt_alunos_masculino || 0;
      totalGirls += c.qnt_alunos_feminino || 0;
    });

    // Unique schools with clubs inside the active filtered clubs set
    const uniqueSchoolIdsInFilteredClubs = new Set<string>();
    filteredClubs.forEach(c => {
      if (c.id_unidade) uniqueSchoolIdsInFilteredClubs.add(String(c.id_unidade).trim());
    });

    return {
      clubCount: filteredClubs.length,
      studentCount: totalStudents,
      boyCount: totalBoys,
      girlCount: totalGirls,
      schoolsWithClubsCount: uniqueSchoolIdsInFilteredClubs.size,
      avgStudentsPerClub: filteredClubs.length > 0 ? (totalStudents / filteredClubs.length).toFixed(1) : '0'
    };
  }, [filteredClubs]);

  // 4. Chart Data: Clubs by Modalidade
  const modalidadeChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredClubs.forEach(c => {
      const mod = c.modalidade_clube || 'Não Informada';
      counts[mod] = (counts[mod] || 0) + 1;
    });

    return Object.keys(counts).map(name => ({
      name,
      value: counts[name]
    })).sort((a, b) => b.value - a.value);
  }, [filteredClubs]);

  // 5. Chart Data: Clubs by Utec Support
  const utecClubsChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredClubs.forEach(c => {
      const matchedUtec = utecs.find(u => String(u.id) === String(c.id_utec));
      const utecName = matchedUtec ? matchedUtec.name : `UTEC ${c.id_utec}`;
      counts[utecName] = (counts[utecName] || 0) + 1;
    });

    return Object.keys(counts).map(name => ({
      name,
      quantidade: counts[name]
    })).sort((a, b) => b.quantidade - a.quantidade);
  }, [filteredClubs, utecs]);

  // Paginated lists
  const paginatedClubs = useMemo(() => {
    const start = (currentPageClubs - 1) * itemsPerPageClubs;
    const end = start + itemsPerPageClubs;
    return filteredClubs.slice(start, end);
  }, [filteredClubs, currentPageClubs, itemsPerPageClubs]);

  const paginatedSchoolsWithoutClubs = useMemo(() => {
    const start = (currentPageNoClubs - 1) * itemsPerPageNoClubs;
    const end = start + itemsPerPageNoClubs;
    return schoolsAnalysis.withoutClubs.slice(start, end);
  }, [schoolsAnalysis.withoutClubs, currentPageNoClubs, itemsPerPageNoClubs]);

  // Colors mapping for Modalidades
  const MODALIDADE_COLORS = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#64748B'];

  // Custom tooltips
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/98 text-white px-3 py-2 rounded-xl shadow-2xl border border-slate-800 text-[11px] font-sans">
          <p className="font-bold mb-1 text-slate-300">{payload[0].name || payload[0].payload.name}</p>
          <p className="font-extrabold text-[#38BDF8]">
            {payload[0].name === 'Feminino' || payload[0].name === 'Masculino' ? 'Alunos: ' : 'Quantidade: '}
            <span className="text-white font-mono">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Filter Section */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                Clubes de Robótica
                <span className="bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Indicadores
                </span>
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Gestão, abrangência e distribuição dos Clubes de Robótica na Rede de Ensino
              </p>
            </div>
          </div>

          {/* Reset Filters Option */}
          {(selectedUtecId !== 'all' || selectedRegional !== 'all' || selectedRpa !== 'all' || selectedModalidade !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Inputs and Dropdowns Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {/* Modalidade Filter */}
          <div className="relative">
            <select
              value={selectedModalidade}
              onChange={(e) => setSelectedModalidade(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/60 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none cursor-pointer"
            >
              <option value="all">Modalidade: Todas</option>
              {uniqueModalidades.map(mod => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-3 h-3" />
            </span>
          </div>

          {/* Utec Filter */}
          <div className="relative">
            <select
              value={selectedUtecId}
              onChange={(e) => setSelectedUtecId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/60 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none cursor-pointer"
            >
              <option value="all">UTEC Apoio: Todas</option>
              {uniqueUtecs.map(utec => (
                <option key={utec.id} value={utec.id}>{utec.name}</option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-3 h-3" />
            </span>
          </div>

          {/* Regional Filter */}
          <div className="relative">
            <select
              value={selectedRegional}
              onChange={(e) => setSelectedRegional(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/60 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none cursor-pointer"
            >
              <option value="all">Regional: Todas</option>
              {uniqueRegionals.map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-3 h-3" />
            </span>
          </div>

          {/* RPA Filter */}
          <div className="relative">
            <select
              value={selectedRpa}
              onChange={(e) => setSelectedRpa(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/60 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none cursor-pointer"
            >
              <option value="all">RPA: Todas</option>
              {uniqueRpas.map(rpa => (
                <option key={rpa} value={rpa}>{rpa}</option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total Clubes */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total de Clubes</span>
            <span className="text-2xl font-black text-teal-600 dark:text-teal-400 block font-mono">
              {metrics.clubCount}
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block">
              Ativos na rede de ensino
            </span>
          </div>
          <div className="p-3 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        {/* Total Alunos */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total de Alunos</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block font-mono">
              {metrics.studentCount}
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block">
              Média: {metrics.avgStudentsPerClub} alunos / clube
            </span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Gênero Gaps */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Equidade de Gênero</span>
              <div className="flex gap-3 mt-1">
                <div>
                  <span className="text-sm font-black text-pink-500 font-mono block">
                    {metrics.girlCount}
                  </span>
                  <span className="text-[8px] font-bold text-pink-400 uppercase">Meninas</span>
                </div>
                <div className="border-l border-slate-100 dark:border-slate-800 h-6 my-auto" />
                <div>
                  <span className="text-sm font-black text-sky-500 font-mono block">
                    {metrics.boyCount}
                  </span>
                  <span className="text-[8px] font-bold text-sky-400 uppercase">Meninos</span>
                </div>
              </div>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
              <div 
                className="bg-pink-500 h-full transition-all duration-500" 
                style={{ width: `${metrics.studentCount > 0 ? (metrics.girlCount / metrics.studentCount) * 100 : 50}%` }}
              />
              <div 
                className="bg-sky-500 h-full transition-all duration-500" 
                style={{ width: `${metrics.studentCount > 0 ? (metrics.boyCount / metrics.studentCount) * 100 : 50}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-semibold text-slate-400 dark:text-slate-500 mt-1">
              <span>{metrics.studentCount > 0 ? ((metrics.girlCount / metrics.studentCount) * 100).toFixed(0) : 0}% F</span>
              <span>{metrics.studentCount > 0 ? ((metrics.boyCount / metrics.studentCount) * 100).toFixed(0) : 0}% M</span>
            </div>
          </div>
        </div>

        {/* Unidades Atendidas com Clubes */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Abrangência Escolar</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block font-mono">
              {metrics.schoolsWithClubsCount}
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block">
              de {schoolsAnalysis.totalActiveSchools} escolas no escopo ({schoolsAnalysis.totalActiveSchools > 0 ? ((metrics.schoolsWithClubsCount / schoolsAnalysis.totalActiveSchools) * 100).toFixed(0) : 0}%)
            </span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <School className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tab Navigation Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('stats')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
            activeSubTab === 'stats'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          Estatísticas e Gráficos
        </button>
        <button
          onClick={() => setActiveSubTab('clubs')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
            activeSubTab === 'clubs'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          Lista de Clubes ({filteredClubs.length})
        </button>
        <button
          onClick={() => setActiveSubTab('no-clubs')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
            activeSubTab === 'no-clubs'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          Escolas Sem Clubes ({schoolsAnalysis.withoutClubs.length})
        </button>
      </div>

      {/* Tab contents */}
      <div className="transition-all duration-300">
        <AnimatePresence mode="wait">
          {activeSubTab === 'stats' && (
            <motion.div
              key="stats-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {filteredClubs.length === 0 ? (
                <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-8 rounded-2xl text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum clube encontrado</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Ajuste os filtros de pesquisa ou localidade no topo da página.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chart 1: Modalidades */}
                  <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Distribuição por Modalidade
                      </h3>
                      <p className="text-[10px] text-slate-400">Classificação dos grupos de robótica ativos</p>
                    </div>
                    {modalidadeChartData.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-10">Sem dados.</p>
                    ) : (
                      <div className="h-60 flex flex-col justify-between">
                        <div className="h-44">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={modalidadeChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={65}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {modalidadeChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={MODALIDADE_COLORS[index % MODALIDADE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        {/* Legend */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                          {modalidadeChartData.slice(0, 4).map((entry, idx) => (
                            <div key={entry.name} className="flex items-center gap-1.5 min-w-0">
                              <span 
                                className="w-2.5 h-2.5 rounded-full shrink-0" 
                                style={{ backgroundColor: MODALIDADE_COLORS[idx % MODALIDADE_COLORS.length] }}
                              />
                              <span className="truncate">{entry.name}: <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{entry.value}</span></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chart 2: Student Gender Mix */}
                  <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Participação por Gênero
                      </h3>
                      <p className="text-[10px] text-slate-400">Total de alunos integrados segregados por sexo</p>
                    </div>
                    <div className="h-60 flex flex-col justify-between">
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Feminino', value: metrics.girlCount },
                                { name: 'Masculino', value: metrics.boyCount }
                              ].filter(i => i.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={0}
                              outerRadius={65}
                              dataKey="value"
                            >
                              <Cell fill="#EC4899" />
                              <Cell fill="#0EA5E9" />
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-around text-[10px] font-semibold pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                          <span>Feminino: <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{metrics.girlCount}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                          <span>Masculino: <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{metrics.boyCount}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chart 3: Clubs by UTECs */}
                  <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Clubes por UTEC de Apoio
                      </h3>
                      <p className="text-[10px] text-slate-400">Total de clubes suportados por cada UTEC</p>
                    </div>
                    {utecClubsChartData.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-10">Sem dados.</p>
                    ) : (
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={utecClubsChartData.slice(0, 6)} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke={isDarkMode ? '#334155' : '#F1F5F9'} />
                            <XAxis type="number" tick={{ fill: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 9 }} />
                            <YAxis dataKey="name" type="category" width={75} tick={{ fill: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 8.5, fontWeight: '600' }} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '10px' }} />
                            <Bar dataKey="quantidade" fill="#14B8A6" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeSubTab === 'clubs' && (
            <motion.div
              key="clubs-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {filteredClubs.length === 0 ? (
                <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-8 rounded-2xl text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum clube listado</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Ajuste os parâmetros de busca ou filtros de região para encontrar clubes de robótica.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  {/* Table for Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">
                          <th className="py-3 px-4">Clube & Unidade de Ensino</th>
                          <th className="py-3 px-4">UTEC Apoio</th>
                          <th className="py-3 px-4">Modalidade</th>
                          <th className="py-3 px-4 text-center">Alunos (F/M)</th>
                          <th className="py-3 px-4">Facilitador / Staff</th>
                          <th className="py-3 px-4">Dias e Horário</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {paginatedClubs.map((clube) => {
                          const school = educationalUnits.find(u => String(u.id_unidade || '').trim() === String(clube.id_unidade || '').trim());
                          const matchedUtec = utecs.find(u => String(u.id) === String(clube.id_utec));
                          const utecName = matchedUtec ? matchedUtec.name : `UTEC ${clube.id_utec}`;

                          return (
                            <tr key={clube.id_clube} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all">
                              <td className="py-3.5 px-4">
                                <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                                  {clube.nome_clube}
                                </div>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5 mt-0.5">
                                  <Building2 className="w-3 h-3 text-slate-400" />
                                  {school ? school.nome_unidade : `Código Escola: ${clube.id_unidade}`}
                                  {school?.rpa_escola && (
                                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[8px] font-black text-slate-500">
                                      {school.rpa_escola}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-600 dark:text-slate-400">
                                {utecName}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="bg-teal-50 dark:bg-teal-950/20 text-teal-800 dark:text-teal-300 px-2 py-1 rounded-lg font-bold text-[10px] border border-teal-100/50 dark:border-teal-900/40">
                                  {clube.modalidade_clube || 'Lego / Arduino'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm font-mono">
                                  {clube.qnt_alunos_clube}
                                </div>
                                <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold font-mono">
                                  {clube.qnt_alunos_feminino} F / {clube.qnt_alunos_masculino} M
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="text-[11px]">
                                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                    Mult: <span className="font-normal">{clube.multiplicador_clube || 'N/A'}</span>
                                  </div>
                                  {clube.estagiario_clube && (
                                    <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                      Estág: <span className="font-normal">{clube.estagiario_clube}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="text-[10px]">
                                  <div className="font-bold flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    {clube.dias_clube || 'N/A'}
                                  </div>
                                  <div className="font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    {clube.horario_clube || 'N/A'}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards for Mobile */}
                  <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedClubs.map((clube) => {
                      const school = educationalUnits.find(u => String(u.id_unidade || '').trim() === String(clube.id_unidade || '').trim());
                      const matchedUtec = utecs.find(u => String(u.id) === String(clube.id_utec));
                      const utecName = matchedUtec ? matchedUtec.name : `UTEC ${clube.id_utec}`;

                      return (
                        <div key={clube.id_clube} className="p-4 space-y-3">
                          <div>
                            <span className="bg-teal-50 dark:bg-teal-950/20 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                              {clube.modalidade_clube || 'Robótica'}
                            </span>
                            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1">
                              {clube.nome_clube}
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 font-bold">
                              <Building2 className="w-3 h-3" />
                              {school ? school.nome_unidade : `Código Unidade: ${clube.id_unidade}`}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                            <div>
                              <span className="text-[8px] text-slate-400 dark:text-slate-500 uppercase block font-bold tracking-wider">UTEC Suporte</span>
                              <span className="font-bold">{utecName}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 dark:text-slate-500 uppercase block font-bold tracking-wider">Estudantes</span>
                              <span className="font-bold">{clube.qnt_alunos_clube} ({clube.qnt_alunos_feminino}F / {clube.qnt_alunos_masculino}M)</span>
                            </div>
                            {clube.multiplicador_clube && (
                              <div className="col-span-2 border-t border-slate-200/40 pt-1 mt-1">
                                <span className="text-[8px] text-slate-400 dark:text-slate-500 uppercase block font-bold tracking-wider">Multiplicador</span>
                                <span className="font-medium">{clube.multiplicador_clube}</span>
                              </div>
                            )}
                            {clube.estagiario_clube && (
                              <div className="col-span-2 border-t border-slate-200/40 pt-1">
                                <span className="text-[8px] text-slate-400 dark:text-slate-500 uppercase block font-bold tracking-wider">Estagiário</span>
                                <span className="font-medium">{clube.estagiario_clube}</span>
                              </div>
                            )}
                            {(clube.dias_clube || clube.horario_clube) && (
                              <div className="col-span-2 border-t border-slate-200/40 pt-1">
                                <span className="text-[8px] text-slate-400 dark:text-slate-500 uppercase block font-bold tracking-wider">Agenda</span>
                                <span className="font-medium flex items-center gap-1 mt-0.5">
                                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" /> {clube.dias_clube || 'N/A'}
                                  {clube.horario_clube && <span className="text-slate-300">|</span>}
                                  {clube.horario_clube && <Clock className="w-3 h-3 text-slate-400 shrink-0" />} {clube.horario_clube}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Footer */}
                  <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {filteredClubs.length > 0 ? (
                        <span>
                          Exibindo <strong className="text-slate-700 dark:text-slate-200">{(currentPageClubs - 1) * itemsPerPageClubs + 1}</strong> a{' '}
                          <strong className="text-slate-700 dark:text-slate-200">{Math.min(currentPageClubs * itemsPerPageClubs, filteredClubs.length)}</strong> de{' '}
                          <strong className="text-slate-700 dark:text-slate-200">{filteredClubs.length}</strong> clubes
                        </span>
                      ) : (
                        <span>Nenhum clube para exibir</span>
                      )}
                    </div>

                    {Math.ceil(filteredClubs.length / itemsPerPageClubs) > 1 && (
                      <div className="flex items-center gap-1">
                        {/* Previous Button */}
                        <button
                          onClick={() => setCurrentPageClubs(prev => Math.max(prev - 1, 1))}
                          disabled={currentPageClubs === 1}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-45 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center"
                          title="Página Anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        {/* Numbered page buttons */}
                        {Array.from({ length: Math.ceil(filteredClubs.length / itemsPerPageClubs) }, (_, i) => i + 1).map((page) => {
                          const totalClubsPages = Math.ceil(filteredClubs.length / itemsPerPageClubs);
                          const isNear = Math.abs(page - currentPageClubs) <= 1;
                          const isFirstOrLast = page === 1 || page === totalClubsPages;
                          
                          if (totalClubsPages > 6 && !isNear && !isFirstOrLast) {
                            if (page === 2 || page === totalClubsPages - 1) {
                              return (
                                <span key={`clubs-ellipsis-${page}`} className="px-1 text-slate-400 dark:text-slate-600 font-semibold select-none text-xs">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          }

                          return (
                            <button
                              key={`clubs-page-${page}`}
                              onClick={() => setCurrentPageClubs(page)}
                              className={`w-7.5 h-7.5 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                currentPageClubs === page
                                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/20 hover:bg-teal-700'
                                  : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}

                        {/* Next Button */}
                        <button
                          onClick={() => setCurrentPageClubs(prev => Math.min(prev + 1, Math.ceil(filteredClubs.length / itemsPerPageClubs)))}
                          disabled={currentPageClubs === Math.ceil(filteredClubs.length / itemsPerPageClubs)}
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
                        value={itemsPerPageClubs}
                        onChange={(e) => {
                          setItemsPerPageClubs(Number(e.target.value));
                          setCurrentPageClubs(1);
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
              )}
            </motion.div>
          )}

          {activeSubTab === 'no-clubs' && (
            <motion.div
              key="no-clubs-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/30 rounded-2xl p-4 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-450 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    Oportunidades de Expansão dos Clubes
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-0.5">
                    Estas escolas abaixo estão dentro do escopo territorial atendido, mas no momento <strong>não possuem</strong> nenhum grupo de robótica associado na planilha <code>clubes_robotica</code>. Use esta lista para direcionar novas aberturas.
                  </p>
                </div>
              </div>

              {schoolsAnalysis.withoutClubs.length === 0 ? (
                <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-8 rounded-2xl text-center space-y-2">
                  <span className="text-2xl">🎉</span>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Cem por cento de Cobertura!</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Todas as escolas ativas sob os filtros atuais possuem pelo menos um Clube de Robótica.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  {/* Table for Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">
                          <th className="py-3 px-4">Escola / Unidade Escolar</th>
                          <th className="py-3 px-4">Código INEP</th>
                          <th className="py-3 px-4">RPA</th>
                          <th className="py-3 px-4">UTEC Apoio</th>
                          <th className="py-3 px-4">Estudantes Matriculados</th>
                          <th className="py-3 px-4">Direção / Gestor Escolar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {paginatedSchoolsWithoutClubs.map((school) => {
                          const matchedUtec = utecs.find(u => String(u.id) === String(school.id_utec_suporte));
                          const utecName = matchedUtec ? matchedUtec.name : `UTEC ${school.id_utec_suporte}`;

                          return (
                            <tr key={school.inep_escola} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all">
                              <td className="py-3 px-4">
                                <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                                  {school.nome_unidade}
                                </div>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                                  {school.endereco || 'Endereço não informado'}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-500 text-[11px]">
                                {school.inep_escola}
                              </td>
                              <td className="py-3 px-4">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-black text-[9px]">
                                  {school.rpa_escola || 'N/A'}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-600 dark:text-slate-400">
                                {utecName}
                              </td>
                              <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-bold font-mono">
                                {school.qtd_estudantes ? school.qtd_estudantes.toLocaleString('pt-BR') : '0'}
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-500 text-[11px]">
                                {school.gestor_unidade || 'Não Cadastrado'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards for Mobile */}
                  <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedSchoolsWithoutClubs.map((school) => {
                      const matchedUtec = utecs.find(u => String(u.id) === String(school.id_utec_suporte));
                      const utecName = matchedUtec ? matchedUtec.name : `UTEC ${school.id_utec_suporte}`;

                      return (
                        <div key={school.inep_escola} className="p-4 space-y-2">
                          <div>
                            <span className="bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                              Sem Clube
                            </span>
                            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1">
                              {school.nome_unidade}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                              INEP: {school.inep_escola} | {school.rpa_escola}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                            <div>
                              <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider">UTEC de Apoio</span>
                              <span className="font-bold">{utecName}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider">Estudantes</span>
                              <span className="font-bold font-mono">{school.qtd_estudantes ? school.qtd_estudantes.toLocaleString('pt-BR') : '0'}</span>
                            </div>
                            {school.gestor_unidade && (
                              <div className="col-span-2 border-t border-slate-200/40 pt-1 mt-1">
                                <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider">Direção</span>
                                <span className="font-semibold">{school.gestor_unidade}</span>
                              </div>
                            )}
                            {school.endereco && (
                              <div className="col-span-2 border-t border-slate-200/40 pt-1">
                                <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider">Endereço</span>
                                <span className="font-medium text-[9px] line-clamp-1">{school.endereco}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Footer */}
                  <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {schoolsAnalysis.withoutClubs.length > 0 ? (
                        <span>
                          Exibindo <strong className="text-slate-700 dark:text-slate-200">{(currentPageNoClubs - 1) * itemsPerPageNoClubs + 1}</strong> a{' '}
                          <strong className="text-slate-700 dark:text-slate-200">{Math.min(currentPageNoClubs * itemsPerPageNoClubs, schoolsAnalysis.withoutClubs.length)}</strong> de{' '}
                          <strong className="text-slate-700 dark:text-slate-200">{schoolsAnalysis.withoutClubs.length}</strong> escolas sem clubes
                        </span>
                      ) : (
                        <span>Nenhuma escola sem clube para exibir</span>
                      )}
                    </div>

                    {Math.ceil(schoolsAnalysis.withoutClubs.length / itemsPerPageNoClubs) > 1 && (
                      <div className="flex items-center gap-1">
                        {/* Previous Button */}
                        <button
                          onClick={() => setCurrentPageNoClubs(prev => Math.max(prev - 1, 1))}
                          disabled={currentPageNoClubs === 1}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-45 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center"
                          title="Página Anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        {/* Numbered page buttons */}
                        {Array.from({ length: Math.ceil(schoolsAnalysis.withoutClubs.length / itemsPerPageNoClubs) }, (_, i) => i + 1).map((page) => {
                          const totalNoClubsPages = Math.ceil(schoolsAnalysis.withoutClubs.length / itemsPerPageNoClubs);
                          const isNear = Math.abs(page - currentPageNoClubs) <= 1;
                          const isFirstOrLast = page === 1 || page === totalNoClubsPages;
                          
                          if (totalNoClubsPages > 6 && !isNear && !isFirstOrLast) {
                            if (page === 2 || page === totalNoClubsPages - 1) {
                              return (
                                <span key={`noc-ellipsis-${page}`} className="px-1 text-slate-400 dark:text-slate-600 font-semibold select-none text-xs">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          }

                          return (
                            <button
                              key={`noc-page-${page}`}
                              onClick={() => setCurrentPageNoClubs(page)}
                              className={`w-7.5 h-7.5 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                currentPageNoClubs === page
                                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20 hover:bg-amber-700'
                                  : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}

                        {/* Next Button */}
                        <button
                          onClick={() => setCurrentPageNoClubs(prev => Math.min(prev + 1, Math.ceil(schoolsAnalysis.withoutClubs.length / itemsPerPageNoClubs)))}
                          disabled={currentPageNoClubs === Math.ceil(schoolsAnalysis.withoutClubs.length / itemsPerPageNoClubs)}
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
                        value={itemsPerPageNoClubs}
                        onChange={(e) => {
                          setItemsPerPageNoClubs(Number(e.target.value));
                          setCurrentPageNoClubs(1);
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
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
