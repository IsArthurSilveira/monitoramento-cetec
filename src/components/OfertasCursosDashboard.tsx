import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Download, 
  X, 
  Building2, 
  UserCheck, 
  Layers, 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  Eye, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CheckCircle2,
  Hourglass,
  Info,
  Target
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { OfertaCursoRecord, UtecMetric } from '../types';

interface OfertasCursosDashboardProps {
  utecs: UtecMetric[];
  ofertas: OfertaCursoRecord[];
  isDarkMode?: boolean;
}

const EIXO_COLORS: { [key: string]: string } = {
  'Cultura Digital': '#1E40AF',
  'Mundo Digital': '#0D9488',
  'Pensamento Computacional': '#7C3AED',
  'Outros': '#64748B'
};

const STATUS_CONFIG: { [key: string]: { label: string; bg: string; text: string; border: string; icon: any } } = {
  'iniciado': {
    label: 'Iniciado',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-900/50',
    icon: CheckCircle2
  },
  'a iniciar': {
    label: 'A Iniciar',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-900/50',
    icon: Hourglass
  },
  'concluido': {
    label: 'Concluído',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-900/50',
    icon: CheckCircle2
  },
  'concluído': {
    label: 'Concluído',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-900/50',
    icon: CheckCircle2
  }
};

export default function OfertasCursosDashboard({ utecs, ofertas, isDarkMode }: OfertasCursosDashboardProps) {
  // Filters state
  const [selectedRegional, setSelectedRegional] = useState<string>('Todas');
  const [selectedRpa, setSelectedRpa] = useState<string>('Todas');
  const [selectedUtec, setSelectedUtec] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedEixo, setSelectedEixo] = useState<string>('Todos');
  const [selectedTurno, setSelectedTurno] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Pagination & Modal state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const [selectedOfertaModal, setSelectedOfertaModal] = useState<OfertaCursoRecord | null>(null);
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // Filter options derived from data
  const regionals = useMemo(() => {
    const list = Array.from(new Set(utecs.map(u => u.regional).filter(Boolean)));
    return ['Todas', ...list.sort()];
  }, [utecs]);

  const rpas = useMemo(() => {
    const list = Array.from(new Set(utecs.map(u => u.rpaSede).filter(Boolean)));
    return ['Todas', ...list.sort()];
  }, [utecs]);

  const eixosList = useMemo(() => {
    const set = new Set<string>();
    ofertas.forEach(o => {
      if (o.eixo_tematico) {
        o.eixo_tematico.split(',').forEach(e => set.add(e.trim()));
      }
    });
    return ['Todos', ...Array.from(set).sort()];
  }, [ofertas]);

  // Filtered dataset
  const filteredOfertas = useMemo(() => {
    return ofertas.filter(item => {
      if (selectedRegional !== 'Todas' && item.regional !== selectedRegional) return false;
      if (selectedRpa !== 'Todas' && item.rpa !== selectedRpa) return false;
      if (selectedUtec !== 'Todas' && item.utecName !== selectedUtec && item.id_utec !== selectedUtec) return false;
      
      if (selectedStatus !== 'Todos') {
        const normItemStatus = (item.status_oferta || '').toLowerCase().trim();
        const normSelStatus = selectedStatus.toLowerCase().trim();
        if (normItemStatus !== normSelStatus) return false;
      }

      if (selectedEixo !== 'Todos') {
        const itemEixos = (item.eixo_tematico || '').toLowerCase();
        if (!itemEixos.includes(selectedEixo.toLowerCase())) return false;
      }

      if (selectedTurno !== 'Todos') {
        if ((item.turno_oferta || '').toLowerCase() !== selectedTurno.toLowerCase()) return false;
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const searchTarget = `
          ${item.id} ${item.turma_oferta} ${item.titulo_de_oferta} 
          ${item.professor_oferta} ${item.eixo_tematico} ${item.utecName} 
          ${item.ambiente} ${item.publico_oferta}
        `.toLowerCase();
        if (!searchTarget.includes(term)) return false;
      }

      return true;
    });
  }, [ofertas, selectedRegional, selectedRpa, selectedUtec, selectedStatus, selectedEixo, selectedTurno, searchTerm]);

  // KPIs
  const totalOfertasCount = filteredOfertas.length;
  
  // Quantidade de turmas (contagem de itens individuais/turmas)
  const totalTurmasCount = useMemo(() => {
    const turmasSet = new Set(filteredOfertas.map(o => o.turma_oferta || o.id));
    return turmasSet.size;
  }, [filteredOfertas]);

  const totalVagas = useMemo(() => {
    return filteredOfertas.reduce((acc, curr) => acc + (curr.vagas_oferta || 0), 0);
  }, [filteredOfertas]);

  const totalMatriculados = useMemo(() => {
    return filteredOfertas.reduce((acc, curr) => acc + (curr.matriculados_oferta || 0), 0);
  }, [filteredOfertas]);

  const professoresCount = useMemo(() => {
    const set = new Set(filteredOfertas.map(o => (o.professor_oferta || '').trim().toUpperCase()).filter(Boolean));
    return set.size;
  }, [filteredOfertas]);

  // Chart 1: Distribution by Eixo Tematico
  const eixoChartData = useMemo(() => {
    const map: { [key: string]: number } = {};
    filteredOfertas.forEach(o => {
      const eixos = (o.eixo_tematico || 'Outros').split(',').map(e => e.trim());
      eixos.forEach(e => {
        const primary = e.includes('Cultura') ? 'Cultura Digital' :
                        e.includes('Mundo') ? 'Mundo Digital' :
                        e.includes('Pensamento') || e.includes('Computacional') ? 'Pensamento Computacional' : 'Outros';
        map[primary] = (map[primary] || 0) + 1;
      });
    });

    return Object.keys(map).map(name => ({
      name,
      value: map[name],
      color: EIXO_COLORS[name] || '#64748B'
    }));
  }, [filteredOfertas]);

  // Chart 2: Top Professors by Offer Count
  const professorChartData = useMemo(() => {
    const map: { [key: string]: number } = {};
    filteredOfertas.forEach(o => {
      const prof = (o.professor_oferta || 'Não informado').trim().toUpperCase();
      map[prof] = (map[prof] || 0) + 1;
    });

    return Object.keys(map)
      .map(prof => ({ professor: prof, quantidade: map[prof] }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 8);
  }, [filteredOfertas]);

  // Chart 3: Quantity of Offers by Target Audience (Público Alvo)
  const publicoChartData = useMemo(() => {
    const map: { [key: string]: number } = {};
    filteredOfertas.forEach(o => {
      let raw = (o.publico_oferta || 'Comunidade').trim();
      let formatted = raw;
      if (raw.toLowerCase().includes('comunidade')) {
        formatted = 'Comunidade Geral';
      } else if (raw.toLowerCase().includes('estudante') || raw.toLowerCase().includes('rede')) {
        formatted = 'Estudantes da Rede';
      } else if (raw.toLowerCase().includes('professor') || raw.toLowerCase().includes('docente') || raw.toLowerCase().includes('educador')) {
        formatted = 'Docentes / Educadores';
      } else {
        formatted = raw.charAt(0).toUpperCase() + raw.slice(1);
      }
      map[formatted] = (map[formatted] || 0) + 1;
    });

    const PUBLICO_COLORS: { [key: string]: string } = {
      'Estudantes da Rede': '#0D9488',
      'Comunidade Geral': '#1E40AF',
      'Docentes / Educadores': '#7C3AED',
      'Outros': '#EA580C'
    };

    return Object.keys(map).map(publico => ({
      publico,
      quantidade: map[publico],
      color: PUBLICO_COLORS[publico] || '#2563EB'
    })).sort((a, b) => b.quantidade - a.quantidade);
  }, [filteredOfertas]);

  // Chart 3: Offers by Title (Top Course Categories)
  const titleChartData = useMemo(() => {
    const map: { [key: string]: number } = {};
    filteredOfertas.forEach(o => {
      let t = (o.titulo_de_oferta || '').trim();
      if (t.startsWith('TRILHA')) t = 'Trilhas de Tecnologia';
      else if (t.startsWith('CLUBE')) t = 'Clubes (Robótica/Cinema/Videocast)';
      else if (t.startsWith('COMPETÊNCIAS')) t = 'Competências Digitais';
      else t = t.length > 25 ? t.substring(0, 25) + '...' : t;

      map[t] = (map[t] || 0) + 1;
    });

    return Object.keys(map)
      .map(titulo => ({ titulo, quantidade: map[titulo] }))
      .sort((a, b) => b.quantidade - a.quantidade);
  }, [filteredOfertas]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredOfertas.length / itemsPerPage) || 1;
  const paginatedOfertas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOfertas.slice(start, start + itemsPerPage);
  }, [filteredOfertas, currentPage]);

  const handleExportCSV = () => {
    if (filteredOfertas.length === 0) return;
    const headers = ["ID", "UTEC", "Regional", "RPA", "Ambiente", "Turma", "Status", "Título", "Eixo Temático", "Turno", "Dias", "Professor", "Público", "Vagas", "Matriculados"];
    const rows = filteredOfertas.map(o => [
      o.id,
      `"${o.utecName || ''}"`,
      `"${o.regional || ''}"`,
      `"${o.rpa || ''}"`,
      `"${o.ambiente || ''}"`,
      `"${o.turma_oferta || ''}"`,
      `"${o.status_oferta || ''}"`,
      `"${o.titulo_de_oferta || ''}"`,
      `"${o.eixo_tematico || ''}"`,
      `"${o.turno_oferta || ''}"`,
      `"${o.dias_semana || ''}"`,
      `"${o.professor_oferta || ''}"`,
      `"${o.publico_oferta || ''}"`,
      o.vagas_oferta,
      o.matriculados_oferta
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ofertas_cursos_recife_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="ofertas-dashboard-container" className="space-y-5 animate-in fade-in duration-300">
      
      {/* 1. Filter Toolbar */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-[#1E40AF] dark:text-blue-400 rounded-xl">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Filtros da Oferta de Cursos</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Filtre por localização, status, eixo e professor em tempo real.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Relatório</span>
            </button>
          </div>
        </div>

        {/* Filters Select Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Regional */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block pl-0.5">Regional</label>
            <select
              value={selectedRegional}
              onChange={e => { setSelectedRegional(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs font-medium px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:outline-hidden text-slate-800 dark:text-slate-200"
            >
              {regionals.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* RPA */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block pl-0.5">RPA</label>
            <select
              value={selectedRpa}
              onChange={e => { setSelectedRpa(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs font-medium px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:outline-hidden text-slate-800 dark:text-slate-200"
            >
              {rpas.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* UTEC */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block pl-0.5">UTEC</label>
            <select
              value={selectedUtec}
              onChange={e => { setSelectedUtec(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs font-medium px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:outline-hidden text-slate-800 dark:text-slate-200 truncate"
            >
              <option value="Todas">Todas UTECs</option>
              {utecs.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block pl-0.5">Status</label>
            <select
              value={selectedStatus}
              onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs font-medium px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:outline-hidden text-slate-800 dark:text-slate-200"
            >
              <option value="Todos">Todos Status</option>
              <option value="iniciado">Iniciado</option>
              <option value="a iniciar">A Iniciar</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>

          {/* Eixo Temático */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block pl-0.5">Eixo Temático</label>
            <select
              value={selectedEixo}
              onChange={e => { setSelectedEixo(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs font-medium px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:outline-hidden text-slate-800 dark:text-slate-200 truncate"
            >
              {eixosList.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* Turno */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block pl-0.5">Turno</label>
            <select
              value={selectedTurno}
              onChange={e => { setSelectedTurno(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs font-medium px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:outline-hidden text-slate-800 dark:text-slate-200"
            >
              <option value="Todos">Todos Turnos</option>
              <option value="Manhã">Manhã</option>
              <option value="Tarde">Tarde</option>
              <option value="Noite">Noite</option>
            </select>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Pesquisar por título de oferta, professor, ambiente, público..."
            className="w-full text-xs font-medium pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:outline-hidden text-slate-800 dark:text-slate-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Ofertas */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-[#1E40AF] dark:text-blue-400 rounded-2xl flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total de Ofertas</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalOfertasCount}</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Cursos e Trilhas</span>
          </div>
        </div>

        {/* Card 2: Quantidade de Turmas */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total de Turmas</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalTurmasCount}</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Turmas Cadastradas</span>
          </div>
        </div>

        {/* Card 3: Total de Vagas */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total de Vagas</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalVagas}</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Vagas Disponibilizadas</span>
          </div>
        </div>

        {/* Card 4: Total Matriculados */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex-shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Matriculados</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalMatriculados}</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Inscrições Realizadas</span>
          </div>
        </div>

        {/* Card 5: Professores por Oferta */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Professores</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{professoresCount}</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Docentes Envolvidos</span>
          </div>
        </div>
      </div>

      {/* 3. Visual Charts Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Chart 1: Donut Pie Chart - Eixo Tematico (with Center Total Count Badge) */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-[#1E40AF] dark:text-blue-400 rounded-xl">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Eixo Temático</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Distribuição por área pedagógica</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-[#1E40AF] dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-900/40">
              {totalOfertasCount} Ofertas
            </span>
          </div>

          <div className="h-[220px] relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eixoChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  paddingAngle={4}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActivePieIndex(index)}
                  onMouseLeave={() => setActivePieIndex(null)}
                >
                  {eixoChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke={isDarkMode ? '#111827' : '#FFFFFF'} 
                      strokeWidth={2}
                      style={{
                        filter: activePieIndex === index ? 'brightness(1.15) drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    borderColor: isDarkMode ? '#374151' : '#E2E8F0',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(val: any) => [`${val} Ofertas`, 'Quantidade']}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Donut Total Count Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{totalOfertasCount}</span>
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ofertas</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {eixoChartData.map((e, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">{e.name}</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-auto">{e.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Bar Chart - Ofertas por Público-Alvo */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Ofertas por Público-Alvo</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Segmentação de turmas por perfil atendido</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg">
              Público
            </span>
          </div>

          <div className="h-[220px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={publicoChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1F2937' : '#F1F5F9'} />
                <XAxis 
                  dataKey="publico" 
                  tick={{ fontSize: 9, fill: isDarkMode ? '#94A3B8' : '#64748B' }} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: isDarkMode ? '#94A3B8' : '#64748B' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    borderColor: isDarkMode ? '#374151' : '#E2E8F0',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                  formatter={(val: any) => [`${val} Oferta(s)`, 'Público-Alvo']}
                />
                <Bar dataKey="quantidade" radius={[6, 6, 0, 0]}>
                  {publicoChartData.map((entry, index) => (
                    <Cell key={`cell-publico-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {publicoChartData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">{item.publico}</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-auto">{item.quantidade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Bar Chart - Ofertas por Professor */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Professores por Oferta</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Quantidade de turmas e ofertas ministradas</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              Top Docentes
            </span>
          </div>

          <div className="h-[220px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={professorChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1F2937' : '#F1F5F9'} />
                <XAxis 
                  dataKey="professor" 
                  tick={{ fontSize: 9, fill: isDarkMode ? '#94A3B8' : '#64748B' }} 
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: isDarkMode ? '#94A3B8' : '#64748B' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    borderColor: isDarkMode ? '#374151' : '#E2E8F0',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                  formatter={(val: any) => [`${val} Oferta(s)`, 'Turmas']}
                />
                <Bar dataKey="quantidade" fill="#4B39EF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium">
            Exibindo docentes com maior número de turmas e ofertas ativas.
          </div>
        </div>

      </div>

      {/* 4. Table Section */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Table Header Row */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-[#1E40AF] dark:text-blue-400 rounded-xl">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Tabela Detalhada de Ofertas</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {filteredOfertas.length} {filteredOfertas.length === 1 ? 'oferta encontrada' : 'ofertas encontradas'} no filtro atual
              </p>
            </div>
          </div>

          {/* Records Indicator */}
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Página {currentPage} de {totalPages}
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Turma / ID</th>
                <th className="py-3 px-4">Título da Oferta</th>
                <th className="py-3 px-4">Eixo Temático</th>
                <th className="py-3 px-4">UTEC</th>
                <th className="py-3 px-4">Professor</th>
                <th className="py-3 px-4">Turno</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Vagas / Mat.</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {paginatedOfertas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                    Nenhuma oferta de curso encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginatedOfertas.map((item) => {
                  const statusKey = (item.status_oferta || 'iniciado').toLowerCase().trim();
                  const statusInfo = STATUS_CONFIG[statusKey] || STATUS_CONFIG['iniciado'];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr 
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOfertaModal(item)}
                    >
                      {/* Turma / ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[11px]">
                          Turma {item.turma_oferta || item.id}
                        </span>
                      </td>

                      {/* Título da Oferta */}
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white max-w-[260px] truncate" title={item.titulo_de_oferta}>
                        {item.titulo_de_oferta}
                      </td>

                      {/* Eixo Temático */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-[160px] truncate" title={item.eixo_tematico}>
                        <span className="inline-flex items-center gap-1 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          {item.eixo_tematico}
                        </span>
                      </td>

                      {/* UTEC */}
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                        {item.utecName || 'UTEC GERAL'}
                      </td>

                      {/* Professor */}
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-semibold whitespace-nowrap">
                        {item.professor_oferta}
                      </td>

                      {/* Turno */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {item.turno_oferta}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Vagas / Matriculados */}
                      <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {item.matriculados_oferta} / {item.vagas_oferta}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedOfertaModal(item)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition-all cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold"
                          title="Visualizar Detalhes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detalhes</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredOfertas.length)} de {filteredOfertas.length} ofertas
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold font-mono">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Modal de Detalhes da Oferta de Curso (Centered Layout) */}
      {selectedOfertaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div 
            className="bg-white dark:bg-[#111827] max-w-2xl w-full rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-[#1E40AF] dark:text-blue-400 rounded-2xl flex-shrink-0 mt-0.5">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-[#1E40AF] dark:text-blue-400 rounded-md font-mono">
                      Turma {selectedOfertaModal.turma_oferta || selectedOfertaModal.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_CONFIG[(selectedOfertaModal.status_oferta || 'iniciado').toLowerCase()]?.bg || 'bg-slate-100'} ${STATUS_CONFIG[(selectedOfertaModal.status_oferta || 'iniciado').toLowerCase()]?.text || 'text-slate-700'} ${STATUS_CONFIG[(selectedOfertaModal.status_oferta || 'iniciado').toLowerCase()]?.border || 'border-slate-200'}`}>
                      {selectedOfertaModal.status_oferta}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                    {selectedOfertaModal.titulo_de_oferta}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {selectedOfertaModal.utecName} • {selectedOfertaModal.regional || 'Regional 1'} ({selectedOfertaModal.rpa || 'RPA 1'})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOfertaModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
              
              {/* Info Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Card UTEC e Local */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Unidade & Ambiente</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedOfertaModal.utecName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Ambiente: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedOfertaModal.ambiente}</span></p>
                </div>

                {/* Card Docente */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                    <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                    <span>Professor Responsável</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedOfertaModal.professor_oferta}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Público-Alvo: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedOfertaModal.publico_oferta}</span></p>
                </div>

                {/* Card Eixo e Horário */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Turno & Dias da Semana</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedOfertaModal.turno_oferta} • {selectedOfertaModal.dias_semana}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Carga Horária: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedOfertaModal.ch_diaria_oferta} diários ({selectedOfertaModal.ch_total_oferta} total)</span></p>
                </div>

                {/* Card Datas */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Período de Execução</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedOfertaModal.inicio_oferta} até {selectedOfertaModal.fim_oferta}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Vagas: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedOfertaModal.matriculados_oferta} / {selectedOfertaModal.vagas_oferta} matriculados</span></p>
                </div>

              </div>

              {/* Eixo Temático Details */}
              <div className="p-3.5 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-1">
                <span className="text-[10px] font-bold text-[#1E40AF] dark:text-blue-400 uppercase tracking-wider block">Eixo Temático Pedagógico</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{selectedOfertaModal.eixo_tematico}</p>
              </div>

              {/* Observações / Ementa */}
              {selectedOfertaModal.observacao_ementa_oferta && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Observações e Ementa</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {selectedOfertaModal.observacao_ementa_oferta}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex justify-end">
              <button
                onClick={() => setSelectedOfertaModal(null)}
                className="px-5 py-2.5 bg-[#1E40AF] hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
              >
                Fechar Detalhes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
