/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  X,
  HelpCircle,
  AlertCircle,
  Building,
  Check,
  ChevronRight,
  Sparkles,
  Layers,
  Sliders,
  GraduationCap,
  Cpu,
  Film,
  Users,
  Briefcase,
  Clock,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UtecMetric, EducationalUnit } from '../types';
import { REGIONALS } from '../data';

interface UtecInfoPageProps {
  utecs: UtecMetric[];
  educationalUnits?: EducationalUnit[];
  isRefreshing?: boolean;
  onRefresh?: () => Promise<void>;
}

// Recife Administrative Architecture Mapping Helpers
export function getUtecPhysicalRpa(utecId: string): string {
  const mapping: Record<string, string> = {
    'utec-1': 'RPA 1',
    'utec-2': 'RPA 3', // Physically in RPA 3, supports schools in Regional 1 (which are in RPA 2)
    'utec-3': 'RPA 3',
    'utec-4': 'RPA 4',
    'utec-5': 'RPA 5',
    'utec-6': 'RPA 2',
    'utec-7': 'RPA 3',
    'utec-8': 'RPA 4',
    'utec-9': 'RPA 5',
    'utec-10': 'RPA 1',
    'utec-11': 'RPA 2',
    'utec-12': 'RPA 3',
    'utec-13': 'RPA 4',
    'utec-14': 'RPA 5',
  };
  return mapping[utecId] || 'RPA 1';
}

export function getUtecViceCoordinator(utecId: string): string {
  const mapping: Record<string, string> = {
    'utec-1': 'Juliana Costa',
    'utec-2': 'Renato Silva',
    'utec-3': 'Fernanda Oliveira',
    'utec-4': 'Luiz Ramos',
    'utec-5': 'Roberto Cavalcanti',
    'utec-6': 'Beatriz Souza',
    'utec-7': 'Guilherme Santos',
    'utec-8': 'Isabela Moreira',
    'utec-9': 'Sandro Pontes',
    'utec-10': 'Camila Vasconcelos',
    'utec-11': 'Felipe Albuquerque',
    'utec-12': 'Larissa Mendes',
    'utec-13': 'Daniel Rocha',
    'utec-14': 'Sofia Ferreira',
  };
  return mapping[utecId] || 'Não cadastrado';
}

export function getRegionalComposition(regional: string): string {
  const mapping: Record<string, string> = {
    'Regional 1': 'RPA 1 e RPA 2',
    'Regional 2': 'RPA 3',
    'Regional 3': 'RPA 4',
    'Regional 4': 'RPA 5',
    'Regional 5': 'RPA 6',
  };
  return mapping[regional] || regional;
}

export function getRegionalByRpa(rpa: string): string {
  const normalized = rpa.toUpperCase().trim();
  const match = normalized.match(/\d+/);
  if (!match) return "Sem Regional";
  const rpaNum = parseInt(match[0], 10);
  switch (rpaNum) {
    case 1:
    case 2:
      return "Regional 1";
    case 3:
      return "Regional 2";
    case 4:
      return "Regional 3";
    case 5:
      return "Regional 4";
    case 6:
      return "Regional 5";
    default:
      return `Regional ${rpaNum}`;
  }
}

export default function UtecInfoPage({ 
  utecs, 
  educationalUnits = [], 
  isRefreshing = false, 
  onRefresh 
}: UtecInfoPageProps) {
  const [selectedUtecId, setSelectedUtecId] = useState<string>('');
  const [utecSearchQuery, setUtecSearchQuery] = useState('');
  const [selectedRegionalFilter, setSelectedRegionalFilter] = useState('Todas');
  const [selectedRpaFilter, setSelectedRpaFilter] = useState('Todas');
  
  // School search and filter inside the details panel
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<EducationalUnit | null>(null);

  // Quadro de Funcionários Modal state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');

  const utecsToUse = utecs;
  const unitsList = educationalUnits;

  // Reactively initialize and select the first UTEC
  useEffect(() => {
    if (utecsToUse && utecsToUse.length > 0 && !selectedUtecId) {
      setSelectedUtecId(utecsToUse[0].id);
    }
  }, [utecsToUse, selectedUtecId]);

  const selectedUtec = useMemo(() => {
    if (!selectedUtecId) {
      return utecsToUse[0] || null;
    }
    return utecsToUse.find(u => u.id === selectedUtecId) || null;
  }, [utecsToUse, selectedUtecId]);

  // Dynamically calculate what RPAs and Regionals each UTEC actually supports based on the school list
  const utecsWithDynamicScopes = useMemo(() => {
    const formatRpaString = (rpaStr: string): string => {
      const match = rpaStr.match(/\d+/);
      return match ? `RPA ${parseInt(match[0], 10)}` : rpaStr.trim();
    };

    return utecsToUse.map((utec) => {
      const supportedSchools = unitsList.filter(
        (unit) => unit.id_utec_suporte === utec.id
      );
      const rawRpas = supportedSchools.map((s) => s.rpa_escola || "");
      const formattedRpas = Array.from(new Set(rawRpas.map(formatRpaString)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) as string[];

      const regionals = Array.from(new Set(formattedRpas.map((rpa) => getRegionalByRpa(rpa))))
        .filter(Boolean)
        .sort() as string[];
      
      // Fallback to internal regional property if no schools exist
      if (regionals.length === 0) {
        regionals.push(utec.regional);
      }
      return {
        ...utec,
        dynamicRpas: formattedRpas,
        dynamicRegionals: regionals,
      };
    });
  }, [utecsToUse, unitsList]);

  const selectedUtecDynamicScope = useMemo(() => {
    if (!selectedUtec) return { rpas: [], regionals: [] };
    const match = utecsWithDynamicScopes.find((u) => u.id === selectedUtec.id);
    return {
      rpas: match?.dynamicRpas || [],
      regionals: match?.dynamicRegionals || [selectedUtec.regional],
    };
  }, [selectedUtec, utecsWithDynamicScopes]);

  // Filtered list of UTECs for the selection sidebar
  const filteredUtecs = useMemo(() => {
    return utecsWithDynamicScopes.filter((utec) => {
      const vice = (utec.viceName || getUtecViceCoordinator(utec.id)).toLowerCase();
      const matchesSearch = 
        utec.name.toLowerCase().includes(utecSearchQuery.toLowerCase()) ||
        utec.coordinator.toLowerCase().includes(utecSearchQuery.toLowerCase()) ||
        vice.includes(utecSearchQuery.toLowerCase());
      
      const matchesRegional = selectedRegionalFilter === 'Todas' || utec.dynamicRegionals.includes(selectedRegionalFilter);
      
      const physicalRpa = getUtecPhysicalRpa(utec.id);
      const matchesRpa = selectedRpaFilter === 'Todas' || 
        utec.dynamicRpas.includes(selectedRpaFilter) || 
        physicalRpa === selectedRpaFilter;

      return matchesSearch && matchesRegional && matchesRpa;
    });
  }, [utecsWithDynamicScopes, utecSearchQuery, selectedRegionalFilter, selectedRpaFilter]);

  // Auto-select first filtered UTEC when list changes
  useEffect(() => {
    if (filteredUtecs.length > 0) {
      const isStillInList = filteredUtecs.some(u => u.id === selectedUtecId);
      if (!isStillInList) {
        setSelectedUtecId(filteredUtecs[0].id);
      }
    }
  }, [filteredUtecs, selectedUtecId]);

  // Map of UTEC ID to object for fast lookup
  const utecLookup = useMemo(() => {
    const map = new Map<string, UtecMetric>();
    utecsToUse.forEach(u => map.set(u.id, u));
    return map;
  }, [utecsToUse]);

  // Schools for display (only supported by active UTEC)
  const schoolsToDisplay = useMemo(() => {
    if (!selectedUtec) return [];
    return unitsList.filter(u => u.id_utec_suporte === selectedUtec.id);
  }, [selectedUtec, unitsList]);

  // Filtered schools according to input
  const filteredSchools = useMemo(() => {
    return schoolsToDisplay.filter(school => {
      if (schoolSearchQuery.trim() === '') return true;
      const query = schoolSearchQuery.toLowerCase();
      return (
        school.nome_unidade.toLowerCase().includes(query) ||
        school.inep_escola.includes(query) ||
        school.endereco.toLowerCase().includes(query) ||
        school.rpa_escola.toLowerCase().includes(query)
      );
    });
  }, [schoolsToDisplay, schoolSearchQuery]);

  const handleSelectUtec = (utec: UtecMetric) => {
    setSelectedUtecId(utec.id);
    setSchoolSearchQuery('');
  };

  if (!utecsToUse || utecsToUse.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4" id="utec-info-loading">
        <div className="relative">
          {/* Outer Ring */}
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-800 animate-pulse"></div>
          {/* Spinning Ring */}
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-[#1E40AF] dark:border-t-blue-500 animate-spin"></div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
            Carregando Informações das UTECs...
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans font-medium">
            Sincronizando dados em tempo real com o Google Sheets da Prefeitura do Recife.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 animate-fade-in -mt-2 lg:-mt-4" id="info-tab-wrapper">
      
      {/* 2. Main Two-Column Panel */}
      <div id="utec-info-view-container" className={`grid grid-cols-1 ${utecsToUse.length > 1 ? 'lg:grid-cols-3' : ''} gap-6`}>
        
        {/* Left Column (1/3 Width) - Center selector sidebar */}
        {utecsToUse.length > 1 && (
          <div className="lg:col-span-1 lg:sticky lg:top-4 lg:self-start flex flex-col gap-4">
            
            {/* Header query panel */}
            <div className="bg-white dark:bg-[#111827] rounded-xl shadow-xs border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-3">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#1E40AF]" />
                Painel de Busca de Centros
              </h3>
              
              {/* Search text inputs */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar por UTEC, gestor ou vice-gestor..."
                  value={utecSearchQuery}
                  onChange={(e) => setUtecSearchQuery(e.target.value)}
                  className="w-full text-xs font-medium pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-[#1E40AF] focus:outline-hidden transition-all text-slate-700 dark:text-slate-100"
                />
              </div>

              {/* Filters side by side */}
              <div className="grid grid-cols-2 gap-2">
                {/* Regional drop filter */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block pl-1">Regional</label>
                  <select
                    value={selectedRegionalFilter}
                    onChange={(e) => setSelectedRegionalFilter(e.target.value)}
                    className="w-full text-xs font-bold px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-[#1E40AF] focus:outline-hidden text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <option value="Todas">Todas ({REGIONALS.length})</option>
                    {REGIONALS.map((reg) => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>

                {/* RPA drop filter */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block pl-1">RPA</label>
                  <select
                    value={selectedRpaFilter}
                    onChange={(e) => setSelectedRpaFilter(e.target.value)}
                    className="w-full text-xs font-bold px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-[#1E40AF] focus:outline-hidden text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <option value="Todas">Todas (6)</option>
                    {['RPA 1', 'RPA 2', 'RPA 3', 'RPA 4', 'RPA 5', 'RPA 6'].map((rpa) => (
                      <option key={rpa} value={rpa}>{rpa}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* List of Centers */}
            <div className="bg-white dark:bg-[#111827] rounded-xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden flex-1 lg:max-h-[calc(100vh-280px)] max-h-[500px] overflow-y-auto">
              {filteredUtecs.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUtecs.map((utec) => {
                    const isSelected = selectedUtec?.id === utec.id;
                    return (
                      <button
                        key={utec.id}
                        onClick={() => handleSelectUtec(utec)}
                        className={`w-full text-left py-3 px-4 transition-all duration-150 flex items-center justify-between group ${
                          isSelected 
                            ? 'bg-blue-50/70 dark:bg-blue-950/20 border-l-4 border-l-[#1E40AF]' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex flex-col overflow-hidden pr-2 py-0.5">
                          <span className={`text-[12px] font-extrabold transition-colors ${
                            isSelected ? 'text-[#1E40AF] dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'
                          }`}>
                            {utec.name}
                          </span>
                          <div className="flex flex-col items-start gap-1.5 mt-1.5">
                            <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-sans leading-none">
                              Sede: {utec.rpaSede || getUtecPhysicalRpa(utec.id)}
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 font-sans truncate leading-none">
                              Atendimento: {utec.dynamicRegionals.join(', ')} {utec.dynamicRpas.length > 0 && `(RPAs ${utec.dynamicRpas.join(', ')})`}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-300 dark:text-slate-500 transition-transform group-hover:translate-x-0.5 ${
                          isSelected ? 'text-[#1E40AF] dark:text-blue-400 translate-x-0.5' : ''
                        }`} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2 dark:text-slate-600" />
                  <p className="text-xs font-bold">Nenhum Centro Cadastrado</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Refine ou limpe os termos de busca.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Column (2/3 Width) - Rich read-only profile dashboard */}
        <div className={utecsToUse.length > 1 ? 'lg:col-span-2' : 'col-span-1'}>
          {selectedUtec ? (
            <div className="bg-white dark:bg-[#111827] rounded-xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden">
              
              {/* Profile header with location context and regional architecture */}
              <div className="bg-[#EBF3FF] dark:bg-slate-800/40 p-5 px-6 border-b border-blue-200/60 dark:border-slate-800 relative">
                <div className="absolute top-0 right-0 w-36 h-36 bg-blue-100/45 dark:bg-slate-700/10 rounded-full -translate-y-10 translate-x-10 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 text-[9px] font-black text-[#1E40AF] dark:text-blue-300 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-800 rounded uppercase tracking-wider">
                        UTEC Sede Sênior
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-black bg-[#10B981]/10 text-emerald-800 dark:text-emerald-400 rounded uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                        Sincronizado
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1.5">{selectedUtec.name}</h2>
                    
                    {/* Compact representation of Sede Physical RPA and Dynamic Regionals & RPAs */}
                    <div className="flex flex-wrap gap-2.5 mt-3 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800/85 shadow-2xs">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <div>
                          <span className="text-[7.5px] font-black text-slate-400 uppercase block leading-none">RPA Sede</span>
                          <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200">{selectedUtec.rpaSede || getUtecPhysicalRpa(selectedUtec.id)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800/85 shadow-2xs">
                        <Building className="w-3.5 h-3.5 text-[#1E40AF] flex-shrink-0" />
                        <div>
                          <span className="text-[7.5px] font-black text-slate-400 uppercase block leading-none">Atendimento Administrativo</span>
                          <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200">
                            {selectedUtecDynamicScope.regionals.join(', ')}
                            {selectedUtecDynamicScope.rpas.length > 0 && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold ml-1.5">
                                (RPAs: {selectedUtecDynamicScope.rpas.join(', ')})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Read-Only Profile Details */}
              <div className="p-5 space-y-6">
                
                {/* 1. Bento-style Indicators Grid (Uncramped, highly scannable, visually premium) */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 animate-pulse" />
                    Indicadores de Impacto e Recursos
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                    {/* Schools served */}
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/15 border border-blue-100/70 dark:border-blue-900/40 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/35 text-blue-700 dark:text-blue-300 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block tracking-wider leading-none">Escolas Atendidas</span>
                        <span className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono mt-1 block leading-none">{selectedUtec.unidades}</span>
                        <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-medium font-sans mt-0.5 block">Unidades ativas</span>
                      </div>
                    </div>

                    {/* Students served */}
                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100/70 dark:border-indigo-900/40 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/35 text-indigo-700 dark:text-indigo-300 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block tracking-wider leading-none">Estudantes</span>
                        <span className="text-lg font-black text-[#1E40AF] dark:text-blue-400 font-mono mt-1 block leading-none">{selectedUtec.estudantes.toLocaleString('pt-BR')}</span>
                        <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-medium font-sans mt-0.5 block">Capacidade total</span>
                      </div>
                    </div>

                    {/* LCT Labs */}
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100/70 dark:border-emerald-900/40 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/35 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block tracking-wider leading-none">Laboratórios LCT</span>
                        <span className="text-lg font-black text-emerald-700 dark:text-emerald-450 font-mono mt-1 block leading-none">{selectedUtec.lct}</span>
                        <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-medium font-sans mt-0.5 block">Espaços ativos</span>
                      </div>
                    </div>

                    {/* Robotics Clubs */}
                    <div className="p-4 bg-amber-50/50 dark:bg-amber-950/15 border border-amber-100/70 dark:border-amber-900/40 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/35 text-amber-700 dark:text-amber-350 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block tracking-wider leading-none">Robótica</span>
                        <span className="text-lg font-black text-amber-700 dark:text-amber-450 font-mono mt-1 block leading-none">{selectedUtec.rob}</span>
                        <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-medium font-sans mt-0.5 block">Clubes ativos</span>
                      </div>
                    </div>

                    {/* Cineclubs */}
                    <div className="p-4 bg-pink-50/50 dark:bg-pink-950/15 border border-pink-100/70 dark:border-pink-900/40 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/35 text-pink-700 dark:text-pink-300 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <Film className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block tracking-wider leading-none">Cineclube</span>
                        <span className="text-lg font-black text-pink-700 dark:text-pink-450 font-mono mt-1 block leading-none">{selectedUtec.cine}</span>
                        <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-medium font-sans mt-0.5 block">Clubes ativos</span>
                      </div>
                    </div>

                    {/* FCD Courses */}
                    <div className="p-4 bg-teal-50/50 dark:bg-teal-950/15 border border-teal-100/70 dark:border-teal-900/40 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/35 text-teal-700 dark:text-teal-300 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block tracking-wider leading-none">Formação Cidadã</span>
                        <span className="text-lg font-black text-teal-700 dark:text-teal-450 font-mono mt-1 block leading-none">{selectedUtec.fcd}</span>
                        <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-medium font-sans mt-0.5 block">Cursos ativos</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Team, leadership and individual contacts (Groomed, robust layout with clickable links) */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#1E40AF] dark:text-blue-400 flex-shrink-0" />
                      Equipe de Gestão e Contatos Diretos
                    </h3>
                    <button
                      onClick={() => {
                        setStaffSearchQuery('');
                        setIsStaffModalOpen(true);
                      }}
                      className="text-[11px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#1E40AF] to-[#4B39EF] hover:from-[#1d3bb3] hover:to-[#4332e6] hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 px-4 py-2 rounded-xl cursor-pointer shadow-xs border border-transparent"
                    >
                      <Users className="w-4 h-4 text-white" />
                      Quadro de Funcionários ({selectedUtec.staff?.length || 0})
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 1. UTEC Geral Card (First) */}
                    <div 
                      onClick={() => {
                        setStaffSearchQuery('');
                        setIsStaffModalOpen(true);
                      }}
                      className="p-4 bg-slate-50 dark:bg-slate-900/45 border-t-4 border-t-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md hover:border-slate-400/40 cursor-pointer transition-all duration-200 group"
                    >
                      <div>
                        <span className="px-2 py-0.5 text-[8px] font-black text-slate-700 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-800/60 rounded uppercase tracking-wider inline-block">
                          UTEC Geral
                        </span>
                        <h4 className="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-tight mt-2.5 truncate" title={selectedUtec.name}>
                          {selectedUtec.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-sans mt-0.5">Contato Institucional</p>
                      </div>

                      <div className="space-y-1.5 border-t border-slate-200/50 dark:border-slate-800 pt-2.5 text-[11px] font-medium font-sans text-slate-600 dark:text-slate-400">
                        {selectedUtec.email ? (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate text-[10.5px]" title={selectedUtec.email}>{selectedUtec.email}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 italic">
                            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-[10.5px]">E-mail não cadastrado</span>
                          </div>
                        )}

                        {selectedUtec.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-[10.5px]">{selectedUtec.phone}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 italic">
                            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-[10.5px]">Telefone não cadastrado</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity border-t border-slate-200/50 dark:border-slate-800 pt-2 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" /> Ver Quadro Funcional
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>

                    {/* 2. Gestor Geral Card (Second) */}
                    {(() => {
                      const allStaff = selectedUtec.staff || [];
                      const dbGestor = allStaff.find(s => {
                        const r = s.role.toLowerCase();
                        return (r.includes("gestor") || r.includes("diretor") || r.includes("coordenador geral")) && !r.includes("vice");
                      });

                      const name = dbGestor?.name || selectedUtec.coordinator;
                      const role = dbGestor?.role || "Gestor(a) Geral";
                      const email = dbGestor?.email || selectedUtec.managerEmail;
                      const phone = dbGestor?.phone || selectedUtec.managerPhone;
                      const status = dbGestor?.status || "Ativo";
                      const isAfastado = status.toLowerCase() === "afastado";
                      const matricula = dbGestor?.matricula;
                      const situacao = dbGestor?.situacao;
                      const turno = dbGestor?.turno;
                      const cargaHoraria = dbGestor?.cargaHoraria;
                      const observacao = dbGestor?.observacao;

                      return (
                        <div 
                          onClick={() => {
                            setStaffSearchQuery('');
                            setIsStaffModalOpen(true);
                          }}
                          className="p-4 bg-slate-50 dark:bg-slate-900/45 border-t-4 border-t-blue-600 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md hover:border-blue-400/40 cursor-pointer transition-all duration-200 group relative"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-1">
                              <span className="px-2 py-0.5 text-[8px] font-black text-blue-700 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-950/40 rounded uppercase tracking-wider inline-block">
                                {role}
                              </span>
                              <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${isAfastado ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'}`}>
                                {status}
                              </span>
                            </div>
                            <h4 className="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-tight mt-2.5 truncate" title={name}>
                              {name}
                            </h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-sans mt-0.5">Coordenador(a) Principal</p>

                            {(matricula || situacao || turno || cargaHoraria) && (
                              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] font-semibold text-slate-400 dark:text-slate-500 font-sans mt-2">
                                {matricula && (
                                  <div>Matrícula: <span className="text-slate-700 dark:text-slate-400 font-bold">{matricula}</span></div>
                                )}
                                {situacao && (
                                  <div>Vínculo: <span className="text-slate-700 dark:text-slate-400 font-bold">{situacao}</span></div>
                                )}
                                {turno && (
                                  <div>Turno: <span className="text-slate-700 dark:text-slate-400 font-bold">{turno}</span></div>
                                )}
                                {cargaHoraria && (
                                  <div>Carga: <span className="text-slate-700 dark:text-slate-400 font-bold">{cargaHoraria}</span></div>
                                )}
                              </div>
                            )}

                            {observacao && (
                              <p className="text-[9.5px] italic text-slate-500 dark:text-slate-400 border-l-2 border-slate-200 dark:border-slate-800 pl-2 mt-1.5 line-clamp-2" title={observacao}>
                                {observacao}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1 border-t border-slate-200/50 dark:border-slate-800 pt-2.5 text-[11px] font-medium font-sans text-slate-600 dark:text-slate-400 mt-1">
                            {email ? (
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span className="truncate text-[10.5px]" title={email}>{email}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-slate-400 italic">
                                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span className="text-[10.5px]">E-mail não cadastrado</span>
                              </div>
                            )}

                            {phone ? (
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span className="text-[10.5px]">{phone}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-slate-400 italic">
                                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span className="text-[10.5px]">Telefone não cadastrado</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-[#1E40AF] dark:text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity border-t border-slate-200/50 dark:border-slate-800 pt-2 mt-1">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-blue-500" /> Ver Quadro Funcional
                            </span>
                            <ChevronRight className="w-3 h-3 text-blue-500" />
                          </div>
                        </div>
                      );
                    })()}

                    {/* 3. Vice-Gestor(a) Card (Third) */}
                    {(() => {
                      const allStaff = selectedUtec.staff || [];
                      const dbVice = allStaff.find(s => {
                        const r = s.role.toLowerCase();
                        return r.includes("vice") || r.includes("subgestor") || r.includes("adjunto");
                      });

                      const name = dbVice?.name || selectedUtec.viceName || getUtecViceCoordinator(selectedUtec.id);
                      const role = dbVice?.role || "Vice-Gestor(a)";
                      const email = dbVice?.email || selectedUtec.viceEmail;
                      const phone = dbVice?.phone || selectedUtec.vicePhone;
                      const status = dbVice?.status || "Ativo";
                      const isAfastado = status.toLowerCase() === "afastado";
                      const matricula = dbVice?.matricula;
                      const situacao = dbVice?.situacao;
                      const turno = dbVice?.turno;
                      const cargaHoraria = dbVice?.cargaHoraria;
                      const observacao = dbVice?.observacao;

                      return (
                        <div 
                          onClick={() => {
                            setStaffSearchQuery('');
                            setIsStaffModalOpen(true);
                          }}
                          className="p-4 bg-slate-50 dark:bg-slate-900/45 border-t-4 border-t-indigo-600 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md hover:border-indigo-400/40 cursor-pointer transition-all duration-200 group relative"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-1">
                              <span className="px-2 py-0.5 text-[8px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-950/40 rounded uppercase tracking-wider inline-block">
                                {role}
                              </span>
                              <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${isAfastado ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'}`}>
                                {status}
                              </span>
                            </div>
                            <h4 className="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-tight mt-2.5 truncate" title={name}>
                              {name}
                            </h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-sans mt-0.5">Suporte Pedagógico</p>

                            {(matricula || situacao || turno || cargaHoraria) && (
                              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] font-semibold text-slate-400 dark:text-slate-500 font-sans mt-2">
                                {matricula && (
                                  <div>Matrícula: <span className="text-slate-700 dark:text-slate-400 font-bold">{matricula}</span></div>
                                )}
                                {situacao && (
                                  <div>Vínculo: <span className="text-slate-700 dark:text-slate-400 font-bold">{situacao}</span></div>
                                )}
                                {turno && (
                                  <div>Turno: <span className="text-slate-700 dark:text-slate-400 font-bold">{turno}</span></div>
                                )}
                                {cargaHoraria && (
                                  <div>Carga: <span className="text-slate-700 dark:text-slate-400 font-bold">{cargaHoraria}</span></div>
                                )}
                              </div>
                            )}

                            {observacao && (
                              <p className="text-[9.5px] italic text-slate-500 dark:text-slate-400 border-l-2 border-slate-200 dark:border-slate-800 pl-2 mt-1.5 line-clamp-2" title={observacao}>
                                {observacao}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1 border-t border-slate-200/50 dark:border-slate-800 pt-2.5 text-[11px] font-medium font-sans text-slate-600 dark:text-slate-400 mt-1">
                            {email ? (
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span className="truncate text-[10.5px]" title={email}>{email}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-slate-400 italic">
                                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span className="text-[10.5px]">E-mail não cadastrado</span>
                              </div>
                            )}

                            {phone ? (
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span className="text-[10.5px]">{phone}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-slate-400 italic">
                                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span className="text-[10.5px]">Telefone não cadastrado</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-indigo-600 dark:text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity border-t border-slate-200/50 dark:border-slate-800 pt-2 mt-1">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-indigo-500" /> Ver Quadro Funcional
                            </span>
                            <ChevronRight className="w-3 h-3 text-indigo-500" />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Section header for linked Educational school units - CONSOLIDATED METRIC VIEW */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Unidades de Ensino em Atendimento ({schoolsToDisplay.length})
                      </h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-sans">
                        Escolas e creches municipais suportadas por esta UTEC e seus indicadores em tempo real
                      </p>
                    </div>
                  </div>

                  {/* Micro search bar for filtering school units list */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 animate-pulse" />
                    <input
                      type="text"
                      placeholder={`Procurar nas escolas vinculadas a ${selectedUtec.name} (ex: Inep, Nome)...`}
                      value={schoolSearchQuery}
                      onChange={(e) => setSchoolSearchQuery(e.target.value)}
                      className="w-full text-xs font-bold pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-hidden transition-all text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  {/* School collection cards grid layout */}
                  {filteredSchools.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {filteredSchools.map((unit) => {
                        return (
                          <div 
                            key={unit.inep_escola}
                            onClick={() => setSelectedUnit(unit)}
                            className="bg-slate-50/50 dark:bg-slate-900/35 border border-slate-200 dark:border-slate-800 p-4.5 rounded-xl shadow-2xs hover:border-[#1E40AF] dark:hover:border-blue-500/50 hover:bg-slate-100/50 dark:hover:bg-slate-900/60 cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden active:scale-[0.98]"
                          >
                            <span className="absolute top-0 left-0 h-1 w-0 group-hover:w-full bg-[#1E40AF] dark:bg-blue-500 transition-all duration-300" />
                            
                            <div className="space-y-2.5">
                              {/* school header row */}
                              <div className="flex items-center justify-between gap-1.5 border-b border-slate-200 dark:border-slate-800/80 pb-2 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <span className="text-[8px] font-black bg-blue-50 dark:bg-blue-950/50 text-[#1E40AF] dark:text-blue-400 px-1.5 py-0.5 rounded font-mono">
                                    {unit.rpa_escola}
                                  </span>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 font-mono">INEP {unit.inep_escola}</span>
                              </div>

                              {/* school info */}
                              <div className="pt-0.5">
                                <div className="flex items-center justify-between gap-1.5 min-w-0">
                                  <h4 className="text-[12.5px] font-black text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors min-w-0" title={unit.nome_unidade}>
                                    {unit.nome_unidade}
                                  </h4>
                                  {unit.premiado && unit.premiado.toUpperCase().includes("DESTAQUE") && (
                                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded text-[7.5px] font-black tracking-wider uppercase flex-shrink-0 animate-pulse">
                                      <Trophy className="w-2 h-2 flex-shrink-0" />
                                      Destaque
                                    </span>
                                  )}
                                </div>
                                <p className="text-[9.5px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed block truncate mt-0.5">
                                  {unit.tipo_unidade} • {unit.modalidade_ensino}
                                </p>
                              </div>

                              {/* Capacity breakdown */}
                              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold border-t border-slate-200 dark:border-slate-800/80 pt-2.5">
                                <span>Capacidade: <strong className="text-slate-700 dark:text-slate-300 font-extrabold">{unit.qtd_estudantes} Alunos</strong></span>
                                <span className="text-[9px] text-[#1E40AF] dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded font-semibold">Demanda: {unit.por_demanda}</span>
                              </div>
                            </div>

                            {/* Resource indicators inside the card */}
                            <div className="grid grid-cols-3 gap-1.5 mt-3.5 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 text-center text-[9px] font-black">
                              <div className={`py-1 rounded-md border ${unit.qtd_lct > 0 ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'}`}>
                                LCT: {unit.qtd_lct}
                              </div>
                              <div className={`py-1 rounded-md border ${unit.qtd_cineclube > 0 ? 'bg-pink-50/40 dark:bg-pink-950/10 border-pink-200/40 text-pink-600 dark:text-pink-400' : 'bg-slate-100/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'}`}>
                                Cine: {unit.qtd_cineclube}
                              </div>
                              <div className={`py-1 rounded-md border ${unit.qtd_robotica > 0 ? 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-200/40 text-amber-600 dark:text-amber-450' : 'bg-slate-100/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'}`}>
                                Rob: {unit.qtd_robotica}
                              </div>
                            </div>

                            <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center text-[10px] text-blue-600 dark:text-blue-400 font-extrabold tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                              Ficha Detalhada <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      <HelpCircle className="w-6 h-6 mx-auto mb-1.5 text-slate-400 animate-bounce" />
                      <p className="text-xs font-bold">Nenhuma Unidade Encontrada</p>
                      <p className="text-[10px] text-slate-400">Tente buscar por outro termo.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#111827] rounded-xl p-8 shadow-xs border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center py-16">
              <Building className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum Centro Selecionado</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm font-sans leading-relaxed">
                Utilize o menu à esquerda para selecionar uma UTEC e exibir todos os seus dados estruturais, contatos oficiais e escolas em atendimento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* 3. Beautiful Modal for Educational Unit Details */}
    <AnimatePresence>
      {selectedUnit && (
        <div id="school-detail-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with fade transition */}
          <motion.div
            id="school-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0F172A]/75 backdrop-blur-xs"
            onClick={() => setSelectedUnit(null)}
          />

          {/* Modal Card with slide-up zoom transition */}
          <motion.div
            id="school-modal-card"
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[85vh] z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-3 px-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Building className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-wider">{selectedUnit.tipo_unidade}</h3>
                  <span className="text-[8px] text-blue-200 font-bold tracking-wide block leading-none">Código Inep: {selectedUnit.inep_escola}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
                title="Fechar Detalhes"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Scrollable Content Container - Compact padding */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
              <div>
                <span className="text-[8px] font-black text-indigo-600 dark:text-blue-400 uppercase tracking-widest block font-sans">Nome da Unidade</span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 leading-snug">{selectedUnit.nome_unidade}</h4>
              </div>

              {/* Grid with key characteristics - Compacted */}
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800 col-span-2">
                  <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase block">Endereço Completo</span>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-normal block">{selectedUnit.endereco}</span>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase block">Modalidade de Ensino</span>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">{selectedUnit.modalidade_ensino}</span>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase block">RPA Unidade</span>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">{selectedUnit.rpa_escola}</span>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase block">UTEC de Suporte</span>
                  <span className="text-[11px] font-black text-[#1E40AF] dark:text-blue-400 uppercase block">
                    {utecLookup.get(selectedUnit.id_utec_suporte)?.name || selectedUnit.id_utec_suporte.toUpperCase()}
                  </span>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase block">Código Inep</span>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block font-mono">{selectedUnit.inep_escola}</span>
                </div>
              </div>

              {/* Attendance capacity details */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h5 className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Capacidade e Governança Local</h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-center">
                    <span className="text-[8px] font-bold text-blue-700 dark:text-blue-400 uppercase">Qtd Estudantes</span>
                    <span className="text-base font-black text-[#1E40AF] dark:text-blue-300 block font-mono">{selectedUnit.qtd_estudantes.toLocaleString('pt-BR')}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 text-center flex flex-col justify-center">
                    <span className="text-[8px] font-bold text-orange-700 dark:text-orange-400 uppercase leading-none">Por Demanda</span>
                    <span className={`text-[9px] font-black block mt-1 px-1.5 py-0.5 rounded uppercase tracking-wide inline-block mx-auto ${
                      selectedUnit.por_demanda === 'Sim' ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {selectedUnit.por_demanda}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-center flex flex-col justify-center">
                    <span className="text-[8px] font-bold text-indigo-700 dark:text-indigo-400 uppercase block truncate leading-none">Status Monitor</span>
                    <span className="text-[9px] font-black text-indigo-900 dark:text-indigo-300 block mt-1 uppercase tracking-wider">Ativo</span>
                  </div>
                </div>

                {/* Recursos Tecnológicos Activos */}
                <h5 className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block pt-1">Recursos Tecnológicos Ativos</h5>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[8px] font-black text-[#1E40AF] dark:text-blue-400 uppercase block">LCT</span>
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5 block font-mono">
                      {selectedUnit.qtd_lct}
                    </span>
                    <span className="text-[7.5px] text-slate-400 dark:text-slate-500 block font-semibold leading-none">Laboratório</span>
                  </div>

                  <div className="p-2 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[8px] font-black text-pink-600 dark:text-pink-400 uppercase block">Cineclube</span>
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5 block font-mono">
                      {selectedUnit.qtd_cineclube}
                    </span>
                    <span className="text-[7.5px] text-slate-400 dark:text-slate-500 block font-semibold leading-none">Ativos</span>
                  </div>

                  <div className="p-2 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[8px] font-black text-teal-600 dark:text-teal-450 uppercase block">Robótica</span>
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5 block font-mono">
                      {selectedUnit.qtd_robotica}
                    </span>
                    <span className="text-[7.5px] text-slate-400 dark:text-slate-500 block font-semibold leading-none">Clubes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-slate-50 dark:bg-slate-900/30 p-2.5 px-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUnit(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 hover:bg-slate-200 bg-slate-100 rounded-lg transition-all cursor-pointer"
              >
                Voltar ao Painel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      {/* Quadro Funcional Completo Modal */}
      <AnimatePresence>
        {isStaffModalOpen && selectedUtec && (
          <div id="staff-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with fade transition */}
            <motion.div
              id="staff-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#0F172A]/75 backdrop-blur-xs"
              onClick={() => setIsStaffModalOpen(false)}
            />

            {/* Modal Card with slide-up zoom transition */}
            <motion.div
              id="staff-modal-card"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] p-6 shadow-2xl flex flex-col overflow-hidden z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#4B39EF] dark:text-blue-400" />
                    <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                      Quadro de Funcionários
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" /> {selectedUtec.name}
                  </p>
                </div>
                <button
                  onClick={() => setIsStaffModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search & Metrics Header */}
              <div className="py-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Search box */}
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    </span>
                    <input
                      type="text"
                      placeholder="Pesquisar por nome, cargo, matrícula ou turno..."
                      value={staffSearchQuery}
                      onChange={(e) => setStaffSearchQuery(e.target.value)}
                      className="w-full text-xs font-semibold pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#4B39EF] dark:focus:border-blue-500 focus:outline-hidden transition-all text-slate-700 dark:text-slate-200"
                    />
                    {staffSearchQuery && (
                      <button
                        onClick={() => setStaffSearchQuery('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Quick counts */}
                  <div className="flex items-center gap-2 flex-wrap text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    <span className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 rounded-lg flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      Total: <span className="font-mono text-xs font-semibold text-[#4B39EF] dark:text-blue-400">{selectedUtec.staff?.length || 0}</span>
                    </span>
                    <span className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-lg flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      Ativos: <span className="font-mono text-xs font-semibold">{(selectedUtec.staff || []).filter(s => s.status?.toLowerCase() !== 'afastado').length}</span>
                    </span>
                    <span className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 rounded-lg flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                      Afastados: <span className="font-mono text-xs font-semibold">{(selectedUtec.staff || []).filter(s => s.status?.toLowerCase() === 'afastado').length}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Staff List Scroll Container */}
              <div className="flex-1 overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {(() => {
                  const staffList = selectedUtec.staff || [];
                  const filtered = staffList.filter(s => {
                    if (!staffSearchQuery) return true;
                    const query = staffSearchQuery.toLowerCase();
                    return (
                      (s.name || '').toLowerCase().includes(query) ||
                      (s.role || '').toLowerCase().includes(query) ||
                      (s.matricula || '').toLowerCase().includes(query) ||
                      (s.turno || '').toLowerCase().includes(query) ||
                      (s.situacao || '').toLowerCase().includes(query)
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20">
                        <Users className="w-10 h-10 text-slate-300 dark:text-slate-650 mb-2" />
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wide">
                          Nenhum funcionário encontrado
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-sans mt-1">
                          Experimente usar outros termos na busca ou limpe o filtro.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                      {filtered.map((person, idx) => {
                        const isAfastado = person.status?.toLowerCase() === 'afastado';
                        const isGestao = person.role.toLowerCase().includes('gestor') || person.role.toLowerCase().includes('coordenador') || person.role.toLowerCase().includes('coord');
                        
                        return (
                          <div
                            key={idx}
                            className={`p-4 bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between gap-3 shadow-3xs hover:shadow-xs transition-all relative overflow-hidden group ${
                              isGestao ? 'border-l-4 border-l-[#4B39EF]' : ''
                            }`}
                          >
                            <div className="space-y-2.5">
                              {/* Top Role and Status badge row */}
                              <div className="flex items-start justify-between gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 text-[8.5px] font-semibold rounded uppercase tracking-wider inline-block ${
                                  isGestao 
                                    ? 'text-[#4B39EF] dark:text-blue-300 bg-blue-100/50 dark:bg-blue-950/40' 
                                    : 'text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/70'
                                }`}>
                                  {person.role || 'Funcionário'}
                                </span>
                                
                                <span className={`px-2 py-0.5 text-[8px] font-semibold rounded uppercase tracking-wider ${
                                  isAfastado 
                                    ? 'bg-rose-100/70 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' 
                                    : 'bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                }`}>
                                  {person.status || 'Ativo'}
                                </span>
                              </div>

                              {/* Name */}
                              <div>
                                <h4 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                                  {person.name || 'Sem nome'}
                                </h4>
                              </div>

                              {/* Grid metrics details */}
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9.5px] font-semibold text-slate-400 dark:text-slate-500 font-sans border-t border-slate-100 dark:border-slate-850 pt-2.5">
                                {person.matricula && (
                                  <div className="flex flex-col">
                                    <span className="text-[7.5px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Matrícula</span>
                                    <span className="text-slate-750 dark:text-slate-350 font-bold font-mono">{person.matricula}</span>
                                  </div>
                                )}
                                {person.situacao && (
                                  <div className="flex flex-col">
                                    <span className="text-[7.5px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Vínculo</span>
                                    <span className="text-slate-750 dark:text-slate-350 font-bold">{person.situacao}</span>
                                  </div>
                                )}
                                {person.turno && (
                                  <div className="flex flex-col">
                                    <span className="text-[7.5px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Turno / Horário</span>
                                    <span className="text-slate-750 dark:text-slate-350 font-bold flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" /> {person.turno}
                                    </span>
                                  </div>
                                )}
                                {person.cargaHoraria && (
                                  <div className="flex flex-col">
                                    <span className="text-[7.5px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Carga Semanal</span>
                                    <span className="text-slate-750 dark:text-slate-350 font-bold flex items-center gap-1">
                                      <Briefcase className="w-3 h-3 text-slate-400 flex-shrink-0" /> {person.cargaHoraria}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Observations if any */}
                              {person.observacao && (
                                <div className="bg-slate-100/50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/40 dark:border-slate-850 mt-1">
                                  <span className="text-[7.5px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider block mb-0.5">Observações</span>
                                  <p className="text-[9.5px] italic text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                                    {person.observacao}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Contact Section footer */}
                            {(person.email || person.phone) && (
                              <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-850 pt-3 text-[11px] font-medium font-sans text-slate-600 dark:text-slate-400 mt-1">
                                {person.email && (
                                  <div className="flex items-center gap-2 py-0.5">
                                    <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#4B39EF] dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                                    <span className="truncate text-[10.5px] font-semibold text-slate-600 dark:text-slate-400" title={person.email}>{person.email}</span>
                                  </div>
                                )}

                                {person.phone && (
                                  <div className="flex items-center gap-2 py-0.5">
                                    <Phone className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#4B39EF] dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                                    <span className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-400">{person.phone}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 hover:bg-slate-200 bg-slate-100 rounded-xl transition-all cursor-pointer shadow-3xs"
                >
                  Fechar Quadro
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
