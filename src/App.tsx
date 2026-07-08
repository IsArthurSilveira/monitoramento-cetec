/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, 
  Plus, 
  MapPin, 
  Users, 
  Cpu, 
  BookOpen, 
  RefreshCw, 
  Database,
  TrendingUp, 
  Sliders, 
  Layers, 
  Printer, 
  FileDown, 
  HelpCircle,
  Building,
  Info,
  SlidersHorizontal,
  LogOut,
  Sparkles,
  Sun,
  Moon,
  Code2
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import KpiRow from './components/KpiRow';
import UtecCharts from './components/UtecCharts';
import UtecTable from './components/UtecTable';
import UtecInfoPage from './components/UtecInfoPage';
import EducationalUnitsDashboard from './components/EducationalUnitsDashboard';
import MultiplierDiary from './components/MultiplierDiary';
import { UtecMetric, ActiveTab, EducationalUnit } from './types';
import { INITIAL_UTECS, INITIAL_EDUCATIONAL_UNITS } from './data';

// Helper to map spreadsheet groups to our supported UTEC IDs & Names dynamically
const mapGroupToUtec = (grupoStr: string) => {
  const clean = (s: string) => {
    return String(s || "")
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^A-Z0-9]/g, " ")      // replace symbols with spaces
      .replace(/\s+/g, " ")             // squash spaces
      .trim();
  };

  const cleanGrp = clean(grupoStr);
  if (!cleanGrp) {
    return { id: "utec-1", name: "UTEC BOA VIAGEM" };
  }

  // 1. Precise keyword rules for mapping
  if (cleanGrp.includes("BOTANICO") || cleanGrp.includes("JARDIM")) {
    return { id: "utec-2", name: "UTEC JARDIM BOTANICO" };
  }
  if (cleanGrp.includes("BOA VIAGEM") || cleanGrp.includes("VIAGEM")) {
    return { id: "utec-1", name: "UTEC BOA VIAGEM" };
  }
  if (cleanGrp.includes("SITIO") || cleanGrp.includes("TRINDADE")) {
    return { id: "utec-3", name: "UTEC SITIO TRINDADE" };
  }
  if (cleanGrp.includes("SANTO AMARO") || cleanGrp.includes("AMARO")) {
    return { id: "utec-4", name: "UTEC SANTO AMARO" };
  }
  if (cleanGrp.includes("GREGORIO") || cleanGrp.includes("BEZERRA")) {
    return { id: "utec-5", name: "UTEC GREGORIO BEZERRA" };
  }
  if (cleanGrp.includes("IBURA")) {
    return { id: "utec-6", name: "UTEC IBURA" };
  }
  if (cleanGrp.includes("ALTO SANTA") || cleanGrp.includes("ALTO STA") || cleanGrp.includes("TEREZINHA") || cleanGrp.includes("SANTA TEREZINHA")) {
    return { id: "utec-7", name: "UTEC ALTO STA TEREZINHA" };
  }
  if (cleanGrp.includes("CAXANGA")) {
    return { id: "utec-8", name: "UTEC CAXANGÁ" };
  }
  if (cleanGrp.includes("COQUE")) {
    return { id: "utec-9", name: "UTEC COQUE" };
  }
  if (cleanGrp.includes("CORDEIRO")) {
    return { id: "utec-10", name: "UTEC CORDEIRO" };
  }
  if (cleanGrp.includes("CRISTIANO") || cleanGrp.includes("DONATO")) {
    return { id: "utec-11", name: "UTEC CRISTIANO DONATO" };
  }
  if (cleanGrp.includes("LARGO") || cleanGrp.includes("DOM LUIS") || cleanGrp.includes("DOM LUIZ") || cleanGrp.includes("LUIS") || cleanGrp.includes("LUIZ")) {
    return { id: "utec-12", name: "UTEC LARGO DOM LUIS" };
  }
  if (cleanGrp.includes("NOVA DESCOBERTA") || cleanGrp.includes("DESCOBERTA")) {
    return { id: "utec-13", name: "UTEC NOVA DESCOBERTA" };
  }
  if (cleanGrp.includes("PINA")) {
    return { id: "utec-14", name: "UTEC PINA" };
  }

  // 2. Dynamic lookup fallback against INITIAL_UTECS
  const areUtecsMatching = (uName1: string, uName2: string) => {
    const n1 = clean(uName1);
    const n2 = clean(uName2);
    if (!n1 || !n2) return false;
    if (n1 === n2 || n1.includes(n2) || n2.includes(n1)) return true;
    
    const keywords = [
      { keys: ["BOTANICO", "JARDIM"], matches: ["BOTANICO", "JARDIM"] },
      { keys: ["BOA VIAGEM", "VIAGEM"], matches: ["BOA VIAGEM", "VIAGEM"] },
      { keys: ["TRINDADE", "SITIO"], matches: ["TRINDADE", "SITIO"] },
      { keys: ["SANTO AMARO", "AMARO"], matches: ["SANTO AMARO", "AMARO"] },
      { keys: ["GREGORIO", "BEZERRA"], matches: ["GREGORIO", "BEZERRA"] },
      { keys: ["IBURA"], matches: ["IBURA"] },
      { keys: ["TEREZINHA", "ALTO SANTA", "ALTO STA"], matches: ["TEREZINHA", "ALTO SANTA", "ALTO STA"] },
      { keys: ["CAXANGA"], matches: ["CAXANGA"] },
      { keys: ["COQUE"], matches: ["COQUE"] },
      { keys: ["CORDEIRO"], matches: ["CORDEIRO"] },
      { keys: ["CRISTIANO", "DONATO"], matches: ["CRISTIANO", "DONATO"] },
      { keys: ["LARGO", "DOM LUIS", "LUIS"], matches: ["LARGO", "DOM LUIS", "LUIS", "LUIZ"] },
      { keys: ["NOVA DESCOBERTA", "DESCOBERTA"], matches: ["NOVA DESCOBERTA", "DESCOBERTA"] },
      { keys: ["PINA"], matches: ["PINA"] }
    ];

    for (const kw of keywords) {
      const anyKey1 = kw.keys.some(k => n1.includes(k));
      const anyKey2 = kw.matches.some(m => n2.includes(m));
      if (anyKey1 && anyKey2) return true;
    }
    return false;
  };

  for (const utec of INITIAL_UTECS) {
    if (areUtecsMatching(utec.name, cleanGrp) || areUtecsMatching(cleanGrp, utec.name)) {
      return { id: utec.id, name: utec.name };
    }
  }

  return { id: "utec-1", name: "UTEC BOA VIAGEM" }; // Absolute fallback
};

const normalizeUtecId = (id: string | number): string => {
  const str = String(id || "").trim();
  if (!str) return "";
  
  // 1. If it contains a number (e.g., "utec-1", "UTEC 1", "1"), extract and normalize to "utec-X"
  const numMatch = str.match(/\d+/);
  if (numMatch) {
    return `utec-${parseInt(numMatch[0], 10)}`;
  }
  
  // 2. Clean name mapping for textual identifiers
  const cleanStr = str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, ""); // remove non-alphanumeric

  const standardUtecs = [
    { id: 'utec-1', name: 'boa viagem' },
    { id: 'utec-2', name: 'jardim botanico' },
    { id: 'utec-3', name: 'sitio trindade' },
    { id: 'utec-4', name: 'santo amaro' },
    { id: 'utec-5', name: 'gregorio bezerra' },
    { id: 'utec-6', name: 'ibura' },
    { id: 'utec-7', name: 'alto sta terezinha' },
    { id: 'utec-7', name: 'alto santa terezinha' },
    { id: 'utec-7', name: 'terezinha' },
    { id: 'utec-8', name: 'caxanga' },
    { id: 'utec-9', name: 'coque' },
    { id: 'utec-10', name: 'cordeiro' },
    { id: 'utec-11', name: 'cristiano donato' },
    { id: 'utec-12', name: 'largo dom luis' },
    { id: 'utec-12', name: 'dom luis' },
    { id: 'utec-12', name: 'largo dom luiz' },
    { id: 'utec-13', name: 'nova descoberta' },
    { id: 'utec-14', name: 'pina' }
  ];

  const found = standardUtecs.find(u => {
    const cleanUName = u.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    return cleanStr.includes(cleanUName) || cleanUName.includes(cleanStr);
  });
  if (found) return found.id;

  return str.toLowerCase();
};

const matchUtecRobustly = (groupStr: string, rowUtecIdRaw: any, dynamicUtecLookup: { id: string, name: string }[]) => {
  if (rowUtecIdRaw !== undefined && rowUtecIdRaw !== null && String(rowUtecIdRaw).trim() !== "") {
    const normId = normalizeUtecId(rowUtecIdRaw);
    const matchedUtec = dynamicUtecLookup.find(u => normalizeUtecId(u.id) === normId);
    if (matchedUtec) {
      return { id: matchedUtec.id, name: matchedUtec.name };
    }
    const idNum = parseInt(String(rowUtecIdRaw).replace(/\D/g, ""), 10);
    if (!isNaN(idNum)) {
      const foundByIndex = dynamicUtecLookup.find(u => {
        const uNum = parseInt(String(u.id).replace(/\D/g, ""), 10);
        return uNum === idNum;
      });
      if (foundByIndex) {
        return { id: foundByIndex.id, name: foundByIndex.name };
      }
    }
  }

  const clean = (s: string) => {
    return String(s || "")
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const cleanGrp = clean(groupStr);
  if (!cleanGrp) {
    return { id: "utec-1", name: "UTEC BOA VIAGEM" };
  }

  const areUtecsMatching = (uName1: string, uName2: string) => {
    const n1 = clean(uName1);
    const n2 = clean(uName2);
    if (!n1 || !n2) return false;
    
    if (n1 === n2 || n1.includes(n2) || n2.includes(n1)) return true;
    
    const keywords = [
      { keys: ["BOTANICO", "JARDIM"], matches: ["BOTANICO", "JARDIM"] },
      { keys: ["BOA VIAGEM", "VIAGEM"], matches: ["BOA VIAGEM", "VIAGEM"] },
      { keys: ["TRINDADE", "SITIO"], matches: ["TRINDADE", "SITIO"] },
      { keys: ["SANTO AMARO", "AMARO"], matches: ["SANTO AMARO", "AMARO"] },
      { keys: ["GREGORIO", "BEZERRA"], matches: ["GREGORIO", "BEZERRA"] },
      { keys: ["IBURA"], matches: ["IBURA"] },
      { keys: ["TEREZINHA", "ALTO SANTA", "ALTO STA"], matches: ["TEREZINHA", "ALTO SANTA", "ALTO STA"] },
      { keys: ["CAXANGA"], matches: ["CAXANGA"] },
      { keys: ["COQUE"], matches: ["COQUE"] },
      { keys: ["CORDEIRO"], matches: ["CORDEIRO"] },
      { keys: ["CRISTIANO", "DONATO"], matches: ["CRISTIANO", "DONATO"] },
      { keys: ["LARGO", "DOM LUIS", "LUIS"], matches: ["LARGO", "DOM LUIS", "LUIS", "LUIZ"] },
      { keys: ["NOVA DESCOBERTA", "DESCOBERTA"], matches: ["NOVA DESCOBERTA", "DESCOBERTA"] },
      { keys: ["PINA"], matches: ["PINA"] }
    ];

    for (const kw of keywords) {
      const anyKey1 = kw.keys.some(k => n1.includes(k));
      const anyKey2 = kw.matches.some(m => n2.includes(m));
      if (anyKey1 && anyKey2) return true;
    }

    return false;
  };

  for (const utec of dynamicUtecLookup) {
    if (areUtecsMatching(utec.name, cleanGrp) || areUtecsMatching(cleanGrp, utec.name)) {
      return { id: utec.id, name: utec.name };
    }
  }

  return mapGroupToUtec(groupStr);
};

const normalizeCategory = (catStr: string): string => {
  const s = String(catStr || "").toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .trim();

  if (s.includes("EXPEDIENTE") || s.includes("INTERNO") || s.includes("SEDE") || s.includes("ADMINISTRATIVO")) {
    return "Diário - Expediente na UTEC";
  }
  if (s.includes("EVENTO") || s.includes("EXTERNO") || s.includes("PALESTRA") || s.includes("FORA")) {
    return "Diário - Eventos Externos";
  }
  if (s.includes("CLUBE") || s.includes("PROJETO") || s.includes("ROBOTICA") || s.includes("OFICINA")) {
    return "Diário - Clubes e Projetos";
  }
  if (s.includes("REDS") || s.includes("ORIENTACAO") || s.includes("SUPORTE") || s.includes("ESCOLA") || s.includes("ATENDIMENTO") || s.includes("ASSISTENCIA")) {
    return "Diário - Orientação REDS";
  }

  // Fallback
  return "Diário - Orientação REDS";
};

const determineMonth = (dateStr: string): string => {
  const str = String(dateStr || "").trim();
  if (!str) return "mar. de 2026"; // Fallback

  // 1. Try to match ISO format like YYYY-MM-DD (e.g. 2026-03-17 or 2026-3-17)
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const monthNum = parseInt(isoMatch[2], 10);
    const months = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
    if (monthNum >= 1 && monthNum <= 12) {
      return `${months[monthNum - 1]} de 2026`;
    }
  }

  // 2. Try to match Brazilian format like DD/MM/YYYY or D/M/YYYY (e.g. 17/03/2026 or 17/3/2026)
  const brMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (brMatch) {
    const monthNum = parseInt(brMatch[2], 10);
    const months = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
    if (monthNum >= 1 && monthNum <= 12) {
      return `${months[monthNum - 1]} de 2026`;
    }
  }

  // 3. Fallback substrings
  const lowerStr = str.toLowerCase();
  if (lowerStr.includes("/01/") || lowerStr.includes("-01-") || lowerStr.includes("/1/") || lowerStr.includes("-1-")) return "jan. de 2026";
  if (lowerStr.includes("/02/") || lowerStr.includes("-02-") || lowerStr.includes("/2/") || lowerStr.includes("-2-")) return "fev. de 2026";
  if (lowerStr.includes("/03/") || lowerStr.includes("-03-") || lowerStr.includes("/3/") || lowerStr.includes("-3-")) return "mar. de 2026";
  if (lowerStr.includes("/04/") || lowerStr.includes("-04-") || lowerStr.includes("/4/") || lowerStr.includes("-4-")) return "abr. de 2026";
  if (lowerStr.includes("/05/") || lowerStr.includes("-05-") || lowerStr.includes("/5/") || lowerStr.includes("-5-")) return "mai. de 2026";
  if (lowerStr.includes("/06/") || lowerStr.includes("-06-") || lowerStr.includes("/6/") || lowerStr.includes("-6-")) return "jun. de 2026";
  if (lowerStr.includes("/07/") || lowerStr.includes("-07-") || lowerStr.includes("/7/") || lowerStr.includes("-7-")) return "jul. de 2026";
  if (lowerStr.includes("/08/") || lowerStr.includes("-08-") || lowerStr.includes("/8/") || lowerStr.includes("-8-")) return "ago. de 2026";
  if (lowerStr.includes("/09/") || lowerStr.includes("-09-") || lowerStr.includes("/9/") || lowerStr.includes("-9-")) return "set. de 2026";
  if (lowerStr.includes("/10/") || lowerStr.includes("-10-")) return "out. de 2026";
  if (lowerStr.includes("/11/") || lowerStr.includes("-11-")) return "nov. de 2026";
  if (lowerStr.includes("/12/") || lowerStr.includes("-12-")) return "dez. de 2026";

  return "mar. de 2026"; // Standard fallback
};

export default function App() {
  const [localUtecs, setLocalUtecs] = useState<UtecMetric[]>(INITIAL_UTECS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('Dashboards');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // NEW: State to store the dynamic relational database containing all 13 sheet entities/tabs
  const [sheetsDatabase, setSheetsDatabase] = useState<Record<string, any[]>>({});
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [diaryRecords, setDiaryRecords] = useState<any[]>([]);

  // Dashboard-level regional & RPA filters for the KPIs and charts
  const [dashboardRegional, setDashboardRegional] = useState('Todas');
  const [dashboardRpa, setDashboardRpa] = useState('Todas');

  // Authors / Developers info panel state
  const [showDevs, setShowDevs] = useState(false);

  const API_FEED_URL = '/api/diary';

  // Helper to retrieve spreadsheet table dynamically
  const getTable = (db: Record<string, any[]>, names: string[]): any[] => {
    if (!db || typeof db !== 'object') return [];
    const keys = Object.keys(db);
    
    // 1. Try exact matches first
    for (const name of names) {
      const matchedKey = keys.find(k => {
        const normalizedK = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
        const normalizedN = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
        return normalizedK === normalizedN;
      });
      if (matchedKey && Array.isArray(db[matchedKey])) {
        return db[matchedKey];
      }
    }
    
    // 2. Try substring/fuzzy matches as fallback
    for (const name of names) {
      const matchedKey = keys.find(k => {
        const normalizedK = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
        const normalizedN = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
        return normalizedK.includes(normalizedN) || normalizedN.includes(normalizedK);
      });
      if (matchedKey && Array.isArray(db[matchedKey])) {
        return db[matchedKey];
      }
    }
    return [];
  };

  // Helper to retrieve value from a spreadsheet row using multiple synonym column names
  const getRowVal = (row: any, aliases: string[], fallback: any = ""): any => {
    if (!row || typeof row !== 'object') return fallback;
    const rowKeys = Object.keys(row);
    for (const alias of aliases) {
      const matchedKey = rowKeys.find(k => {
        const normalizedK = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
        const normalizedA = alias.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
        return normalizedK === normalizedA;
      });
      if (matchedKey !== undefined && row[matchedKey] !== undefined && row[matchedKey] !== null && row[matchedKey] !== "") {
        return row[matchedKey];
      }
    }
    return fallback;
  };

  // Dynamic selector for UTECs and educational units derived from Sheets Database
  const [dynamicUtecs, dynamicEducationalUnits] = useMemo(() => {
    const rawRegional = getTable(sheetsDatabase, ["regional", "regionais"]);
    const rawRpa = getTable(sheetsDatabase, ["rpa", "rpas"]);
    const rawUtecs = getTable(sheetsDatabase, ["utecs", "utec", "cadastro_utecs"]);
    const rawUnidadesAtendidas = getTable(sheetsDatabase, ["unidades_atendidas", "escolas", "unidades"]);
    const rawEnderecoUtecs = getTable(sheetsDatabase, ["endereco_utecs", "endereco_utec"]);
    const rawEnderecoUnidades = getTable(sheetsDatabase, ["endereco_unidades", "endereco_unidade"]);
    const rawOfertasCursos = getTable(sheetsDatabase, ["ofertas_cursos", "ofertas", "cursos"]);
    const rawClubesRobotica = getTable(sheetsDatabase, ["clubes_robotica", "robotica"]);
    const rawClubesCinema = getTable(sheetsDatabase, ["clubes_cinema", "cinema"]);
    const rawLaboratoriosLct = getTable(sheetsDatabase, ["laboratorios_lct", "lct", "laboratorios"]);
    const rawQuadroFuncional = getTable(sheetsDatabase, ["funcao_funcionario_utecs", "quadro_funcional_utecs", "quadro_funcional"]);
    const rawFuncionarioUnidades = getTable(sheetsDatabase, ["funcionario_unidades", "funcionarios_escolas"]);

    if (rawUtecs.length === 0) {
      return [[], []];
    }

    const regionalMap = new Map<string, string>();
    rawRegional.forEach(reg => {
      const idReg = String(getRowVal(reg, ["id_regional", "id"])).trim();
      const nomeReg = String(getRowVal(reg, ["nome_regional", "nome"])).trim();
      if (idReg) regionalMap.set(idReg, nomeReg);
    });

    const rpaMap = new Map<string, { id: string; name: string; regionalId: string; regionalName: string }>();
    rawRpa.forEach(rpa => {
      const idRpa = String(getRowVal(rpa, ["id_rpa", "id"])).trim();
      const nameRpa = String(getRowVal(rpa, ["nome_rpa", "nome"])).trim();
      const idReg = String(getRowVal(rpa, ["id_regional", "regional_id"])).trim();
      const regName = regionalMap.get(idReg) || `Regional ${idReg}`;
      if (idRpa) {
        rpaMap.set(idRpa, {
          id: idRpa,
          name: nameRpa,
          regionalId: idReg,
          regionalName: regName
        });
      }
    });

    const utecAddressMap = new Map<string, string>();
    rawEnderecoUtecs.forEach(addr => {
      const idUtec = String(getRowVal(addr, ["id_utecs", "id_utec", "utec_id", "id_endereco"])).trim();
      const text = String(getRowVal(addr, ["endereco_utecs", "endereco", "endereco_utec"])).trim();
      const bairro = String(getRowVal(addr, ["bairro_utecs", "bairro"])).trim();
      const cep = String(getRowVal(addr, ["cep_utecs", "cep"])).trim();
      const fullText = [text, bairro, cep].filter(Boolean).join(", ");
      if (idUtec) utecAddressMap.set(idUtec, fullText);
    });

    const schoolAddressMap = new Map<string, string>();
    rawEnderecoUnidades.forEach(addr => {
      const idUnidade = String(getRowVal(addr, ["id_unidade", "unidade_id", "id_endereco"])).trim();
      const text = String(getRowVal(addr, ["endereco_unidade", "endereco", "endereco_unid"])).trim();
      const bairro = String(getRowVal(addr, ["bairro_unidade", "bairro"])).trim();
      const cep = String(getRowVal(addr, ["cep_unidade", "cep"])).trim();
      const fullText = [text, bairro, cep].filter(Boolean).join(", ");
      if (idUnidade) schoolAddressMap.set(idUnidade, fullText);
    });

    const schoolLabs = new Map<string, number>();
    const utecLabs = new Map<string, number>();
    rawLaboratoriosLct.forEach(lab => {
      const schoolId = String(getRowVal(lab, ["id_unidade", "unidade_id"])).trim();
      const utecId = normalizeUtecId(getRowVal(lab, ["id_utec", "utec_id"]));
      if (schoolId) schoolLabs.set(schoolId, (schoolLabs.get(schoolId) || 0) + 1);
      if (utecId) utecLabs.set(utecId, (utecLabs.get(utecId) || 0) + 1);
    });

    const schoolRob = new Map<string, number>();
    const utecRob = new Map<string, number>();
    rawClubesRobotica.forEach(clube => {
      const schoolId = String(getRowVal(clube, ["id_unidade", "unidade_id"])).trim();
      const utecId = normalizeUtecId(getRowVal(clube, ["id_utec", "utec_id"]));
      const status = String(getRowVal(clube, ["status", "situacao"])).toLowerCase();
      const isActive = !status || status.includes("ativ") || status.includes("funcionando") || status === "sim" || status === "ok";
      if (isActive) {
        if (schoolId) schoolRob.set(schoolId, (schoolRob.get(schoolId) || 0) + 1);
        if (utecId) utecRob.set(utecId, (utecRob.get(utecId) || 0) + 1);
      }
    });

    const schoolCinema = new Map<string, number>();
    const utecCinema = new Map<string, number>();
    rawClubesCinema.forEach(clube => {
      const schoolId = String(getRowVal(clube, ["id_unidade", "unidade_id"])).trim();
      const utecId = normalizeUtecId(getRowVal(clube, ["id_utec", "utec_id"]));
      const status = String(getRowVal(clube, ["status_clube_cinema", "status", "situacao"])).toLowerCase();
      const isActive = !status || status.includes("ativ") || status.includes("funcionando") || status === "sim" || status === "ok";
      if (isActive) {
        if (schoolId) schoolCinema.set(schoolId, (schoolCinema.get(schoolId) || 0) + 1);
        if (utecId) utecCinema.set(utecId, (utecCinema.get(utecId) || 0) + 1);
      }
    });

    const utecCursos = new Map<string, number>();
    rawOfertasCursos.forEach(curso => {
      const utecId = normalizeUtecId(getRowVal(curso, ["id_utec", "utec_id"]));
      if (utecId) utecCursos.set(utecId, (utecCursos.get(utecId) || 0) + 1);
    });

    const utecCoordinators = new Map<string, string>();
    rawQuadroFuncional.forEach(func => {
      const utecId = normalizeUtecId(getRowVal(func, ["utec_id", "id_utec"]));
      const role = String(getRowVal(func, ["funcao_funcionario_utecs", "funcao", "cargo"])).toLowerCase();
      const name = String(getRowVal(func, ["nome_funcionario_utecs", "nome"])).trim();
      if (utecId && name && (role.includes("coordenador") || role.includes("coord") || role.includes("gestor"))) {
        utecCoordinators.set(utecId, name);
      }
    });

    const schoolGestores = new Map<string, string>();
    rawFuncionarioUnidades.forEach(func => {
      const schoolId = String(getRowVal(func, ["id_unidade", "unidade_id"])).trim();
      const name = String(getRowVal(func, ["nome_funcionario_unidade", "nome"])).trim();
      if (schoolId && name) {
        schoolGestores.set(schoolId, name);
      }
    });

    const rawMappedEducationalUnits: EducationalUnit[] = rawUnidadesAtendidas
      .filter(unit => {
        const schoolId = String(getRowVal(unit, ["id_unidade", "id"])).trim();
        const inep = String(getRowVal(unit, ["codigo_inep_unidade", "codigo_inep", "inep"])).trim();
        const nome = String(getRowVal(unit, ["nome_unidade", "nome"])).trim();
        if (!schoolId && !inep && !nome) return false;
        if (schoolId.toLowerCase() === "undefined" && inep.toLowerCase() === "undefined" && nome.toLowerCase() === "undefined") return false;
        return true;
      })
      .map((unit, idx) => {
      const schoolId = String(getRowVal(unit, ["id_unidade", "id"])).trim();
      const inep = String(getRowVal(unit, ["codigo_inep_unidade", "codigo_inep", "inep"])).trim();
      const utecIdRaw = String(getRowVal(unit, ["id_utec", "utec_id"])).trim();
      const utecId = utecIdRaw ? normalizeUtecId(utecIdRaw) : "utec-1";
      const rpaId = String(getRowVal(unit, ["id_rpa", "rpa_id"])).trim();
      
      const rpaObj = rpaMap.get(rpaId);
      const rpaName = rpaObj ? rpaObj.name : `RPA ${rpaId || "1"}`;
      
      const address = schoolAddressMap.get(schoolId) || String(getRowVal(unit, ["endereco", "rua"])).trim() || "Endereço não cadastrado";
      
      const labLctVal = String(getRowVal(unit, ["lab_lct_unidade", "lab_lct", "lct"])).trim().toUpperCase();
      const hasLct = labLctVal === "SIM" || labLctVal === "OK" || labLctVal === "1";
      const qtdLct = hasLct ? 1 : 0;

      const premiadoVal = String(getRowVal(unit, ["premiado_unidade", "premiado", "destaque_unidade", "destaque"])).trim();

      const rawInep = inep || schoolId;
      const invalidIneps = ["não encontrado", "não informado", "não se aplica", "n/a", "-", "null", "undefined", ""];
      const cleanInep = (!rawInep || invalidIneps.includes(rawInep.toLowerCase()))
        ? `inep-fake-${idx}`
        : rawInep;

      return {
        inep_escola: cleanInep,
        id_utec_suporte: utecId,
        rpa_escola: rpaName,
        endereco: address,
        modalidade_ensino: String(getRowVal(unit, ["atendimento_unidade", "atendimento", "modalidade"])).trim() || "Anos Iniciais",
        nome_unidade: String(getRowVal(unit, ["nome_unidade", "nome"])).trim().toUpperCase() || "Escola Municipal",
        tipo_unidade: String(getRowVal(unit, ["tipo_unidade", "tipo"])).trim() || "Escola",
        qtd_estudantes: parseInt(getRowVal(unit, ["qnt_estudantes_unidade", "quantidade_estudantes", "estudantes", "qnt_estudantes"]), 10) || 0,
        por_demanda: String(getRowVal(unit, ["por_demanda_unidade", "por_demanda"])).trim() || "Não",
        qtd_lct: qtdLct,
        qtd_cineclube: schoolCinema.get(schoolId) || 0,
        qtd_robotica: schoolRob.get(schoolId) || 0,
        gestor: schoolGestores.get(schoolId) || "Gestor Escolar",
        premiado: premiadoVal,
      };
    });

    // Deduplicate by INEP code to ensure uniqueness and prevent key warnings
    const uniqueUnitsMap = new Map<string, EducationalUnit>();
    rawMappedEducationalUnits.forEach(unit => {
      const existing = uniqueUnitsMap.get(unit.inep_escola);
      if (!existing) {
        uniqueUnitsMap.set(unit.inep_escola, unit);
      } else {
        // Merge attributes to prevent any data loss
        existing.qtd_lct = Math.max(existing.qtd_lct, unit.qtd_lct);
        existing.qtd_cineclube = Math.max(existing.qtd_cineclube, unit.qtd_cineclube);
        existing.qtd_robotica = Math.max(existing.qtd_robotica, unit.qtd_robotica);
        if (unit.por_demanda === 'Sim') {
          existing.por_demanda = 'Sim';
        }
        if (unit.premiado && !existing.premiado) {
          existing.premiado = unit.premiado;
        }
        if (unit.qtd_estudantes > existing.qtd_estudantes) {
          existing.qtd_estudantes = unit.qtd_estudantes;
        }
      }
    });
    const mappedEducationalUnits = Array.from(uniqueUnitsMap.values());

    const utecStaffMap = new Map<string, any[]>();
    rawQuadroFuncional.forEach(func => {
      const utecIdRaw = String(getRowVal(func, ["utec_id", "id_utec"])).trim();
      const utecId = normalizeUtecId(utecIdRaw);
      if (!utecId) return;
      const name = String(getRowVal(func, ["nome_funcionario_utecs", "nome"])).trim();
      const role = String(getRowVal(func, ["funcao_funcionario_utecs", "funcao", "cargo"])).trim();
      const email = String(getRowVal(func, ["email_funcionario_utecs", "email", "email_corporativo", "email_pessoal"])).trim();
      const phone = String(getRowVal(func, ["contato_funcionario_utecs", "telefone_funcionario_utecs", "telefone", "contato", "celular", "whatsapp"])).trim();
      
      const matricula = String(getRowVal(func, ["matricula_funcionario_utecs", "matricula"])).trim();
      const situacao = String(getRowVal(func, ["situacao_funcionario_utecs", "situacao"])).trim();
      const status = String(getRowVal(func, ["status_funcionario_utecs", "status"])).trim();
      const turno = String(getRowVal(func, ["turno_funcionario_utecs", "turno"])).trim();
      const cargaHoraria = String(getRowVal(func, ["carga_horaria"])).trim();
      const observacao = String(getRowVal(func, ["observacao_funcionario_utecs", "observacao"])).trim();

      if (name) {
        const current = utecStaffMap.get(utecId) || [];
        current.push({ 
          name, 
          role, 
          email, 
          phone,
          matricula: matricula || undefined,
          situacao: situacao || undefined,
          status: status || undefined,
          turno: turno || undefined,
          cargaHoraria: cargaHoraria || undefined,
          observacao: observacao || undefined
        });
        utecStaffMap.set(utecId, current);
      }
    });

    const mappedUtecs: UtecMetric[] = rawUtecs.map((utec, idx) => {
      const utecIdRaw = String(getRowVal(utec, ["id_utec", "id"])).trim();
      const utecId = utecIdRaw ? normalizeUtecId(utecIdRaw) : `utec-${idx + 1}`;
      const name = String(getRowVal(utec, ["nome_utecs", "nome", "nome_utec"])).trim().toUpperCase() || `UTEC ${idx + 1}`;
      const rpaId = String(getRowVal(utec, ["id_rpa", "rpa_id"])).trim();
      
      const rpaObj = rpaMap.get(rpaId);
      const regionalName = rpaObj ? rpaObj.regionalName : "Regional 1";
      
      const supportedSchools = mappedEducationalUnits.filter(u => u.id_utec_suporte === utecId);
      const totalSchools = supportedSchools.length;
      const totalStudents = supportedSchools.reduce((sum, u) => sum + u.qtd_estudantes, 0);
      
      const email = String(getRowVal(utec, ["email_utecs", "email"])).trim();
      const phone = String(getRowVal(utec, ["telefone_utecs", "telefone_institucional", "telefone"])).trim();
      
      const staffList = utecStaffMap.get(utecId) || [];
      const manager = staffList.find(s => {
        const roleLower = s.role.toLowerCase();
        return (roleLower.includes("gestor") || roleLower.includes("coordenador") || roleLower.includes("coord")) && !roleLower.includes("vice");
      });
      const vice = staffList.find(s => {
        const roleLower = s.role.toLowerCase();
        return roleLower.includes("vice");
      });

      const managerName = manager ? manager.name : (utecCoordinators.get(utecId) || String(getRowVal(utec, ["coordenador", "responsavel"])).trim() || "Coordenador Geral");
      const managerEmail = manager?.email || "";
      const managerPhone = manager?.phone || "";

      const viceName = vice ? vice.name : "Não cadastrado";
      const viceEmail = vice?.email || "";
      const vicePhone = vice?.phone || "";

      const totalLct = supportedSchools.reduce((sum, u) => sum + (u.qtd_lct || 0), 0);
      const totalPremiados = supportedSchools.filter(u => u.premiado && u.premiado.toUpperCase().includes("DESTAQUE")).length;

      return {
        id: utecId || `utec-${idx + 1}`,
        name,
        regional: regionalName,
        unidades: totalSchools || parseInt(getRowVal(utec, ["unidades_atendidas", "unidades"], 0), 10) || 0,
        estudantes: parseInt(getRowVal(utec, ["quantidade_aproximada_estudantes_utecs", "quantidade_aproximada_estudantes", "quantidade_estudantes_utecs", "quantidade_estudantes", "estudantes_utecs", "estudantes", "alunos"], 0), 10) || totalStudents || 0,
        lct: totalLct,
        rob: utecRob.get(utecId) || 0,
        cine: utecCinema.get(utecId) || 0,
        fcd: utecCursos.get(utecId) || 0,
        rev: totalPremiados,
        coordinator: managerName,
        email: email || "utec@recife.pe.gov.br",
        phone: phone || "(81) 3355-0000",
        status: 'Ativa',
        creationDate: '2023-01-01',
        rpaSede: rpaObj ? rpaObj.name : `RPA ${rpaId || "1"}`,
        managerName,
        managerEmail,
        managerPhone,
        viceName,
        viceEmail,
        vicePhone,
        staff: staffList,
      };
    });

    return [mappedUtecs, mappedEducationalUnits];
  }, [sheetsDatabase]);

  // Synchronize with the live spreadsheet database strictly, with no mock fallbacks
  const utecs = useMemo(() => {
    return dynamicUtecs && dynamicUtecs.length > 0 ? dynamicUtecs : [];
  }, [dynamicUtecs]);

  const educationalUnits = useMemo(() => {
    return dynamicEducationalUnits && dynamicEducationalUnits.length > 0 ? dynamicEducationalUnits : [];
  }, [dynamicEducationalUnits]);

  const setUtecs = setLocalUtecs;

  // Shared robust parsing of diary records
  const parseDiaryRecords = (rawRecords: any[], dynamicUtecLookup: any[]) => {
    return rawRecords.map((r: any, idx: number) => {
      const grp = getRowVal(r, [
        "grupo", "utec", "utecname", "utec_nome", "qualaasuaute", "qualaute", "qualaasuautec", "grupo_nome",
        "qualasuautec", "qualasuautecdeapoio", "suautec", "utecapoio", "utec_responsavel", "utec_solicitante", "selectutec", "grupo_impacto"
      ]) || "";
      const rowUtecIdRaw = getRowVal(r, ["id_utec", "utec_id", "idutec"]);
      const uInfo = matchUtecRobustly(grp, rowUtecIdRaw, dynamicUtecLookup);
      
      const rawId = String(getRowVal(r, ["protocolo", "id"]) || "").trim();
      const invalidIds = ["não encontrado", "não informado", "não se aplica", "n/a", "-", "null", "undefined", ""];
      const cleanId = (!rawId || invalidIds.includes(rawId.toLowerCase()))
        ? `rec-${idx}`
        : `${rawId}-${idx}`;

      const dataOcorrencia = getRowVal(r, ["data_ocorrencia", "data", "dataocorrencia"]) || "";
      const rawCategoria = getRowVal(r, ["categoria", "categoriadeatendimento", "tipodeatendimento", "setor", "tipo_atendimento", "area_setor_categoria", "area"]) || "";
      const categoria = normalizeCategory(rawCategoria);
      const atendimentoTipo = (categoria.includes("Expediente") || categoria.includes("Externo") || categoria === 'Diário - Expediente na UTEC') ? 'Externo/UTEC' : 'Escola';
      const mes = determineMonth(dataOcorrencia);
      const solicitante = getRowVal(r, ["nome_solicitante", "solicitante", "nome", "multiplicador"]) || "";

      const rawEstudantes = getRowVal(r, ["estudantes", "qtd_estudantes", "estudantes_atendidos"]) || 0;
      const rawProfessores = getRowVal(r, ["professores", "qtd_professores", "professores_atendidos"]) || 0;
      const parseCount = (val: any): number => {
        if (typeof val === 'number') return Math.floor(val);
        const str = String(val).trim();
        if (!str || str === "" || str === "-") return 0;
        const parsed = parseInt(str, 10);
        return isNaN(parsed) ? 0 : parsed;
      };

      const numEstudantes = parseCount(rawEstudantes);
      const numProfessores = parseCount(rawProfessores);

      return {
        id: cleanId,
        utecId: normalizeUtecId(uInfo.id),
        utecName: uInfo.name,
        escolaInep: getRowVal(r, ["codigo_inep_unidade", "unidade_de_ensino", "escola_inep", "inep", "codigo_inep"]) || "",
        escolaNome: getRowVal(r, ["unidade_de_ensino", "escola", "escola_nome", "unidade"]) || "",
        dataOcorrencia,
        solicitante,
        qtdProfessores: numProfessores > 0 ? numProfessores : '-',
        qtdEstudantes: numEstudantes > 0 ? numEstudantes : '-',
        categoria,
        atendimentoTipo,
        mes,
        turno1: getRowVal(r, ["turno_1", "turno1"]),
        turno2: getRowVal(r, ["turno_2", "turno2"]),
        turno3: getRowVal(r, ["turno_3", "turno3"]),
        participacao: getRowVal(r, ["participacao"]),
        local: getRowVal(r, ["local"]),
        observacoes: getRowVal(r, ["observacoes", "observacao"]),
        usuExterno: getRowVal(r, ["usu_externo", "usuexterno"]),
        atividadesDesenvolvidas: getRowVal(r, ["atividades_desenvolvidas", "atividadesdesenvolvidas"]),
        observacao: getRowVal(r, ["observacoes", "observacao"]),
        demanda: getRowVal(r, ["demanda"]),
        anfitriaoNaUe: getRowVal(r, ["anfitriao_na_ue", "anfitriaonaue"]),
        ocorrencia: getRowVal(r, ["ocorrencia"]),
        planejamento: getRowVal(r, ["planejamento"]),
        temaDaAtividade: getRowVal(r, ["tema_da_atividade", "temadaatividade"]),
        outros: getRowVal(r, ["outros"]),
        grupoImpacto: getRowVal(r, ["grupo_impacto", "grupoimpacto"]),
        modalidade: getRowVal(r, ["modalidade"]),
        estudantes: numEstudantes,
        engajamentoEstudantes: getRowVal(r, ["engajamento_estudantes", "engajamentoestudantes"]),
        professores: numProfessores,
        engajamentoProfessores: getRowVal(r, ["engajamento_professores", "engajamentoprofessores"]),
        redsFisicos: getRowVal(r, ["reds_fisicos", "redsfisicos"]),
        softwares: getRowVal(r, ["softwares"]),
        dataCarimbo: getRowVal(r, ["data_carimbo", "datacarimbo"]),
        matriculaSolicitante: getRowVal(r, ["matricula_solicitante", "matriculasolicitante"]),
        nomeSolicitante: solicitante,
        unidadeDeEnsino: getRowVal(r, ["unidade_de_ensino", "unidadedeensino", "escola", "unidade"]) || "",
        area: getRowVal(r, ["area"]),
        setor: getRowVal(r, ["setor"]),
        status: getRowVal(r, ["status"]),
        protocolo: getRowVal(r, ["protocolo"]),
        grupo: grp,
      };
    });
  };

  // Function to fetch the relational database with all sheets (?tabela=todas) in real time
  const fetchDiaryData = async (manual = false) => {
    if (manual) {
      setIsRefreshing(true);
    } else {
      setSyncStatus('loading');
    }
    setSyncError(null);

    try {
      const targetUrl = manual 
        ? `${API_FEED_URL}?tabela=todas&nocache=true` 
        : `${API_FEED_URL}?tabela=todas`;
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result && result.status === 'success') {
        if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
          setSheetsDatabase(result.data);
          
          // Load diary records for the diary tab
          const keys = Object.keys(result.data);
          let diaryKey = keys.find(k => k.toLowerCase() === 'diario_multiplicador' || k.toLowerCase().includes('diario_multiplicador'));
          if (!diaryKey) {
            diaryKey = keys.find(k => k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('diario'));
          }
          if (!diaryKey) {
            diaryKey = keys[0];
          }
          
          if (diaryKey && Array.isArray(result.data[diaryKey])) {
            const rawUtecs = getTable(result.data, ["utecs", "utec", "cadastro_utecs"]);
            const dynamicUtecLookup = rawUtecs.map((u, uIdx) => {
              const utecId = String(getRowVal(u, ["id_utec", "id"])).trim();
              const utecName = String(getRowVal(u, ["nome_utecs", "nome", "nome_utec"])).trim().toUpperCase();
              return {
                id: utecId || `utec-${uIdx + 1}`,
                name: utecName || `UTEC ${uIdx + 1}`
              };
            }).filter(u => u.name);

            const formatted = parseDiaryRecords(result.data[diaryKey], dynamicUtecLookup);
            setDiaryRecords(formatted);
          }
          setSyncStatus('success');
        } else if (Array.isArray(result.data)) {
          setSheetsDatabase({ 'diario_multiplicador': result.data });
          setSyncStatus('success');
        }
      } else {
        throw new Error(result?.message || 'Formato inválido.');
      }
    } catch (err: any) {
      console.warn("Erro ao carregar banco de dados do Google Sheets:", err);
      setSyncStatus('error');
      setSyncError('Não foi possível sincronizar o banco de dados do Google Sheets.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDiaryData();
  }, []);

  // Current dynamic datetime state updating in real-time
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem('portal-user-cpf');
  });
  const [cpfValue, setCpfValue] = useState('000.000.000-00');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Find current user in sheetsDatabase ["acesso", "acessos"]
  const currentUser = useMemo(() => {
    if (!isLoggedIn) return null;
    const cpf = localStorage.getItem('portal-user-cpf');
    if (!cpf) return null;
    const rawAccess = getTable(sheetsDatabase, ["acesso", "acessos"]);
    const matched = rawAccess.find(row => {
      const rowCpf = String(getRowVal(row, ["cpf", "cpf_acesso"])).replace(/\D/g, "");
      const cleanCpf = cpf.replace(/\D/g, "");
      return rowCpf === cleanCpf;
    });
    
    if (matched) {
      return {
        id_acesso: getRowVal(matched, ["id_acesso"]),
        id_utec: String(getRowVal(matched, ["id_utec"]) || getRowVal(matched, ["utec_id"])).trim(),
        nome: getRowVal(matched, ["nome"]),
        cpf: getRowVal(matched, ["cpf"]),
        nivel_acesso: String(getRowVal(matched, ["nivel_acesso"])).trim().toLowerCase() // "gestor" or "administrador"
      };
    }
    
    // Fallback if sheetsDatabase is not loaded or user not found yet
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf === "22222222222") {
      return { nome: "adm", cpf, nivel_acesso: "administrador", id_utec: "" };
    } else if (cleanCpf === "11111111111") {
      return { nome: "teste1", cpf, nivel_acesso: "gestor", id_utec: "1" };
    }
    
    return { nome: "Usuário", cpf, nivel_acesso: "gestor", id_utec: "" };
  }, [sheetsDatabase, isLoggedIn]);

  const isGestor = currentUser?.nivel_acesso === 'gestor';
  const userUtecId = currentUser?.id_utec ? normalizeUtecId(currentUser.id_utec) : '';

  const visibleUtecs = useMemo(() => {
    if (isGestor && userUtecId) {
      return utecs.filter(u => normalizeUtecId(u.id) === userUtecId);
    }
    return utecs;
  }, [utecs, isGestor, userUtecId]);

  const visibleEducationalUnits = useMemo(() => {
    if (isGestor && userUtecId) {
      return educationalUnits.filter(e => normalizeUtecId(e.id_utec_suporte) === userUtecId);
    }
    return educationalUnits;
  }, [educationalUnits, isGestor, userUtecId]);

  const visibleDiaryRecords = useMemo(() => {
    if (isGestor && userUtecId) {
      return diaryRecords.filter(r => normalizeUtecId(r.utecId) === userUtecId);
    }
    return diaryRecords;
  }, [diaryRecords, isGestor, userUtecId]);

  const dashboardFilteredUtecs = useMemo(() => {
    return visibleUtecs.filter(u => {
      const matchesRegional = dashboardRegional === 'Todas' || u.regional === dashboardRegional;
      // Robust check for RPA code matching: "RPA 1" or "1"
      const utecRpa = u.rpaSede || "";
      const matchesRpa = dashboardRpa === 'Todas' || 
        utecRpa === dashboardRpa || 
        `RPA ${utecRpa}` === dashboardRpa || 
        utecRpa.toUpperCase() === dashboardRpa.toUpperCase();
      return matchesRegional && matchesRpa;
    });
  }, [visibleUtecs, dashboardRegional, dashboardRpa]);

  const dashboardFilteredEducationalUnits = useMemo(() => {
    return visibleEducationalUnits.filter(e => {
      const parentUtec = visibleUtecs.find(u => normalizeUtecId(u.id) === normalizeUtecId(e.id_utec_suporte));
      if (!parentUtec) return false;
      const matchesRegional = dashboardRegional === 'Todas' || parentUtec.regional === dashboardRegional;
      const utecRpa = parentUtec.rpaSede || "";
      const matchesRpa = dashboardRpa === 'Todas' || 
        utecRpa === dashboardRpa || 
        `RPA ${utecRpa}` === dashboardRpa || 
        utecRpa.toUpperCase() === dashboardRpa.toUpperCase();
      return matchesRegional && matchesRpa;
    });
  }, [visibleEducationalUnits, visibleUtecs, dashboardRegional, dashboardRpa]);

  useEffect(() => {
    if (isLoggedIn && isGestor && activeTab === 'Dashboards') {
      setActiveTab('Informações');
    }
  }, [isLoggedIn, isGestor, activeTab]);

  // Theme states for light/dark layout overrides
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('utec-theme');
    return saved === 'dark';
  });

  const handleToggleTheme = (dark: boolean) => {
    setIsDarkMode(dark);
    localStorage.setItem('utec-theme', dark ? 'dark' : 'light');
  };

  // Statistics for UTEC indexing
  const nextUtecNum = utecs.length + 1;

  // Handlers for data persistence and syncing
  const handleAddUtec = (newUtec: UtecMetric) => {
    setUtecs((prev) => [...prev, newUtec]);
  };

  const handleEditUtec = (updated: UtecMetric) => {
    setUtecs((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleDeleteUtec = (id: string) => {
    setUtecs((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only numbers allow
    const cleanNum = e.target.value.replace(/\D/g, '').slice(0, 11);
    
    // Format to 000.000.000-00
    let formatted = '';
    if (cleanNum.length <= 3) {
      formatted = cleanNum;
    } else if (cleanNum.length <= 6) {
      formatted = `${cleanNum.slice(0, 3)}.${cleanNum.slice(3)}`;
    } else if (cleanNum.length <= 9) {
      formatted = `${cleanNum.slice(0, 3)}.${cleanNum.slice(3, 6)}.${cleanNum.slice(6)}`;
    } else {
      formatted = `${cleanNum.slice(0, 3)}.${cleanNum.slice(3, 6)}.${cleanNum.slice(6, 9)}-${cleanNum.slice(9, 11)}`;
    }
    
    setCpfValue(formatted);
    if (loginError) setLoginError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = cpfValue.replace(/\D/g, '');
    if (cleanNum.length !== 11) {
      setLoginError('O CPF deve conter exatamente 11 dígitos.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      // 1. Try to find in the currently loaded state database first
      let rawAccess = getTable(sheetsDatabase, ["acesso", "acessos"]);
      let matched = rawAccess.find(row => {
        const rowCpf = String(getRowVal(row, ["cpf", "cpf_acesso"])).replace(/\D/g, "");
        return rowCpf === cleanNum;
      });

      // 2. If not found, bypass browser and server caches to check the live spreadsheet
      if (!matched && cleanNum !== "11111111111" && cleanNum !== "22222222222") {
        const targetUrl = `${API_FEED_URL}?tabela=todas&nocache=true`;
        const response = await fetch(targetUrl);
        if (response.ok) {
          const result = await response.json();
          if (result && result.status === 'success' && result.data) {
            setSheetsDatabase(result.data);
            
            // Re-load the diary records as well
            const keys = Object.keys(result.data);
            let diaryKey = keys.find(k => k.toLowerCase() === 'diario_multiplicador' || k.toLowerCase().includes('diario_multiplicador'));
            if (!diaryKey) {
              diaryKey = keys.find(k => k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('diario'));
            }
            if (!diaryKey) {
              diaryKey = keys[0];
            }
            if (diaryKey && Array.isArray(result.data[diaryKey])) {
              const rawUtecs = getTable(result.data, ["utecs", "utec", "cadastro_utecs"]);
              const dynamicUtecLookup = rawUtecs.map((u, uIdx) => {
                const utecId = String(getRowVal(u, ["id_utec", "id"])).trim();
                const utecName = String(getRowVal(u, ["nome_utecs", "nome", "nome_utec"])).trim().toUpperCase();
                return {
                  id: utecId || `utec-${uIdx + 1}`,
                  name: utecName || `UTEC ${uIdx + 1}`
                };
              }).filter(u => u.name);

              const formatted = parseDiaryRecords(result.data[diaryKey], dynamicUtecLookup);
              setDiaryRecords(formatted);
            }

            rawAccess = getTable(result.data, ["acesso", "acessos"]);
            matched = rawAccess.find(row => {
              const rowCpf = String(getRowVal(row, ["cpf", "cpf_acesso"])).replace(/\D/g, "");
              return rowCpf === cleanNum;
            });
          }
        }
      }

      if (!matched && cleanNum !== "11111111111" && cleanNum !== "22222222222") {
        setLoginError('CPF não cadastrado na aba "acesso" da Planilha.');
        return;
      }

      localStorage.setItem('portal-user-cpf', cpfValue);
      setIsLoggedIn(true);
    } catch (err) {
      console.warn(err);
      setLoginError('Erro ao validar o CPF com a Planilha. Tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('portal-user-cpf');
    setIsLoggedIn(false);
    setCpfValue('000.000.000-00');
  };

  // Render descriptive tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Dashboards':
        if (syncStatus === 'error' && utecs.length === 0) {
          return (
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-8 border border-red-100 dark:border-red-950/40 text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm animate-fade-in">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Erro ao Sincronizar Banco de Dados</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium">
                  {syncError || "Não foi possível estabelecer conexão com o Google Sheets."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchDiaryData(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E40AF] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tentar Sincronizar Novamente
              </button>
            </div>
          );
        }

        if (syncStatus === 'loading' || syncStatus === 'idle' || utecs.length === 0) {
          return (
            <div className="space-y-6 animate-pulse">
              {/* 1. KPI Cards Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-[#111827] rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-14" />
                      <div className="w-7 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800/80 rounded-md w-20" />
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. Charts Layout Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                <div className="col-span-1 lg:col-span-5 bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-100 dark:border-slate-800 h-80 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-32" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800/80 rounded-md w-48" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-12" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-12" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-12" />
                    </div>
                  </div>
                  <div className="flex items-end justify-between h-48 px-2 pt-4 border-b border-slate-100 dark:border-slate-800">
                    {[35, 65, 45, 80, 55, 90, 40, 75, 60, 85, 30, 50, 70, 45].map((h, i) => (
                      <div key={i} className="w-4 bg-slate-100 dark:bg-slate-800/60 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                <div className="col-span-1 lg:col-span-2 bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-100 dark:border-slate-800 h-80 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-28" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800/80 rounded-md w-36" />
                  </div>
                  <div className="flex items-center justify-center py-4">
                    <div className="relative w-28 h-28 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-[#1E40AF] animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800/80 rounded-md w-5/6" />
                  </div>
                </div>
              </div>

              {/* 3. Table Skeleton */}
              <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-40" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-md w-32" />
                </div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/6" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/12" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/6" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        return (
          <>
            {/* Dashboard-level Regional and RPA Filters */}
            <div id="dashboard-filters-bar" className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-2xl px-4 py-3 mb-4 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1E40AF] animate-pulse" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                  Filtros dos Gráficos e KPIs:
                </span>
                {(dashboardRegional !== 'Todas' || dashboardRpa !== 'Todas') && (
                  <button
                    onClick={() => {
                      setDashboardRegional('Todas');
                      setDashboardRpa('Todas');
                    }}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold ml-2 cursor-pointer"
                  >
                    (Limpar Filtros)
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                {/* Regional Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Regional:</span>
                  <select
                    id="dashboard-regional-select"
                    value={dashboardRegional}
                    onChange={(e) => setDashboardRegional(e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-[#1E40AF] focus:outline-hidden text-slate-600 dark:text-slate-300 cursor-pointer min-w-[110px]"
                  >
                    <option value="Todas">Todas</option>
                    <option value="Regional 1">Regional 1</option>
                    <option value="Regional 2">Regional 2</option>
                    <option value="Regional 3">Regional 3</option>
                    <option value="Regional 4">Regional 4</option>
                    <option value="Regional 5">Regional 5</option>
                  </select>
                </div>

                {/* RPA Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">RPA:</span>
                  <select
                    id="dashboard-rpa-select"
                    value={dashboardRpa}
                    onChange={(e) => setDashboardRpa(e.target.value)}
                    className="text-xs font-bold px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-[#1E40AF] focus:outline-hidden text-slate-600 dark:text-slate-300 cursor-pointer min-w-[100px]"
                  >
                    <option value="Todas">Todas</option>
                    <option value="RPA 1">RPA 1</option>
                    <option value="RPA 2">RPA 2</option>
                    <option value="RPA 3">RPA 3</option>
                    <option value="RPA 4">RPA 4</option>
                    <option value="RPA 5">RPA 5</option>
                    <option value="RPA 6">RPA 6</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 1. Dynamic KPI Metrics Grid */}
            <KpiRow utecs={dashboardFilteredUtecs} />

            {/* 2. Recharts Analytics Visualizer Panel */}
            <UtecCharts utecs={dashboardFilteredUtecs} educationalUnits={dashboardFilteredEducationalUnits} isDarkMode={isDarkMode} />

            {/* 3. Interactive Data List & Detailed UTEC Profiles card columns */}
            <UtecTable 
              utecs={utecs} 
              educationalUnits={educationalUnits}
              diaryRecords={diaryRecords}
            />
          </>
        );

      case 'Diário':
        return (
          <MultiplierDiary 
            utecs={visibleUtecs}
            sheetsDatabase={sheetsDatabase}
            diaryRecords={visibleDiaryRecords}
            syncStatus={syncStatus}
            syncError={syncError}
            isRefreshing={isRefreshing}
            fetchDiaryData={fetchDiaryData}
          />
        );

      case 'Informações':
        return (
          <UtecInfoPage 
            utecs={visibleUtecs}
            educationalUnits={visibleEducationalUnits}
            isRefreshing={isRefreshing}
            onRefresh={() => fetchDiaryData(true)}
          />
        );

      case 'Config':
        return (
          <div id="config-tab-view" className="bg-white dark:bg-[#111827] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 max-w-xl">
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Aparência e Configurações</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium font-sans">Escolha o tema visual de exibição do portal de monitoramento UTEC.</p>
            </div>

            {/* Tema Switcher Visual Selection */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pl-0.5">
                <Sparkles className="w-4 h-4 text-[#1E40AF]" /> Tema do Sistema
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Light Theme Option Card */}
                <button
                  type="button"
                  onClick={() => handleToggleTheme(false)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    !isDarkMode 
                      ? 'border-[#1E40AF] bg-blue-50/40 ring-1 ring-blue-100/30' 
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-orange-55/10 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 rounded-lg">
                      <Sun className="w-4 h-4 animate-spin-slow" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tema Claro</h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 leading-none">Original do Recife</p>
                    </div>
                  </div>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    !isDarkMode 
                      ? 'border-[#1E40AF] bg-[#1E40AF]' 
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {!isDarkMode && <span className="w-1.2 h-1.2 rounded-full bg-white" />}
                  </span>
                </button>

                {/* Dark Theme Option Card */}
                <button
                  type="button"
                  onClick={() => handleToggleTheme(true)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isDarkMode 
                      ? 'border-[#1E40AF] bg-blue-950/20 ring-1 ring-blue-900/40 dark:bg-slate-800/40 dark:border-blue-500' 
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-50 text-[#1E40AF] dark:bg-slate-950 dark:text-blue-400 rounded-lg">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tema Escuro</h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 leading-none">Agradável para leitura</p>
                    </div>
                  </div>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    isDarkMode 
                      ? 'border-[#1E40AF] bg-[#1E40AF]' 
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {isDarkMode && <span className="w-1.2 h-1.2 rounded-full bg-white" />}
                  </span>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex flex-col justify-between bg-[#F8FAFC] dark:bg-[#090D1A] overflow-y-auto font-sans text-slate-800 dark:text-slate-100 transition-all ${isDarkMode ? 'dark' : ''}`}>
        {/* Quick Top Bar */}
        <div className="w-full max-w-7xl mx-auto flex items-center justify-end p-5">
          <button
            type="button"
            onClick={() => handleToggleTheme(!isDarkMode)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-500 dark:text-slate-400"
            title="Alternar Tema"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Centered Login Card */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] max-w-md w-full rounded-3xl p-8 border border-slate-100/80 dark:border-slate-800/80 shadow-2xl space-y-6 relative overflow-hidden transition-all duration-300">
            {/* Tech Aesthetic Accent Lines */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E40AF] via-[#4B39EF] to-pink-500" />
            
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#1E40AF] dark:text-blue-400 mb-2">
                <SlidersHorizontal className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Sistema de Monitoramento</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Insira o seu CPF de acesso para visualizar o painel operacional de monitoramento tecnológico.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest block pl-1">CPF de Acesso</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cpfValue}
                    onChange={handleCpfChange}
                    disabled={isLoggingIn}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`w-full text-sm font-medium tracking-widest text-center px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border ${
                      loginError 
                        ? 'border-red-500 ring-1 ring-red-150/40' 
                        : 'border-slate-200 dark:border-slate-800 focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100/50 dark:focus:ring-blue-900/40'
                    } rounded-2xl focus:outline-hidden transition-all text-slate-800 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-700 disabled:opacity-60`}
                    id="cpf-login-input"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                    <span className="text-xs font-mono select-none">CPF</span>
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center pl-1 font-semibold leading-normal">
                  Insira apenas números. Mascaramento e formatação são aplicados automaticamente sobre a digitação.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl text-center">
                  <span className="text-[11px] font-bold text-red-600 dark:text-red-400 block">{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                id="btn-submit-login"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#1E40AF] hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verificando na Planilha...
                  </>
                ) : (
                  "Acessar Portal"
                )}
              </button>
            </form>

          </div>
        </div>

        {/* Footer info lockups */}
        <div className="p-6 text-center text-[10px] text-slate-450 dark:text-slate-600 font-bold tracking-wide">
          <span>&copy; Prefeitura do Recife - PE</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-slate-100 dark:bg-[#070A13] overflow-hidden font-sans ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar (left-side columns panel) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Main content viewport block */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Dynamic header row (visible on mobile / desktop context) */}
        <header id="app-workspace-header" className="bg-white dark:bg-[#111827] border-b border-[#1E40AF] dark:border-slate-800 px-5 h-[72px] flex-shrink-0 flex items-center justify-between z-30 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Hamburger mobile menu triggers sidebar */}
            <button
              id="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Menu className="w-5 h-5 flex-shrink-0" />
            </button>
            
            <div className="flex flex-col">
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-0.5">Portal Executivo</span>
              <h1 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                {activeTab === 'Dashboards' ? 'Visão Geral' : activeTab === 'Config' ? 'Configurações' : activeTab === 'Diário' ? 'Diário do Multiplicador' : activeTab}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Real-time Google Sheets database sync button and state */}
            <button
              onClick={() => fetchDiaryData(true)}
              disabled={isRefreshing || syncStatus === 'loading'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold tracking-wide transition-all duration-300 ${
                syncStatus === 'success'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400'
                  : syncStatus === 'loading' || isRefreshing
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/10 border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-400 shadow-sm shadow-indigo-100 dark:shadow-none'
                  : syncStatus === 'error'
                  ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
              }`}
              title="Sincronizar com o Sheets"
            >
              {syncStatus === 'loading' || isRefreshing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
              ) : (
                <Database className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span>
                {syncStatus === 'success'
                  ? 'Sheets Conectado'
                  : syncStatus === 'loading' || isRefreshing
                  ? 'Sincronizando...'
                  : syncStatus === 'error'
                  ? 'Erro ao Sincronizar'
                  : 'Sincronizar Sheets'}
              </span>
            </button>

            {/* Authors/Developers Popover */}
            <div className="relative">
              <button
                type="button"
                id="devs-info-trigger-btn"
                onClick={() => setShowDevs(!showDevs)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold tracking-wide transition-all ${
                  showDevs
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 ring-2 ring-blue-100 dark:ring-blue-900/20'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                }`}
                title="Desenvolvedores do Projeto"
              >
                <Code2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Desenvolvedores</span>
              </button>

              {showDevs && (
                <>
                  {/* Backdrop overlay to close when clicking outside */}
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setShowDevs(false)} 
                  />
                  
                  {/* Floating credits card */}
                  <div 
                    id="devs-credits-popover" 
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="p-1 bg-blue-50 dark:bg-blue-950 text-[#1E40AF] dark:text-blue-400 rounded-lg">
                        <Code2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Desenvolvedores</h4>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold leading-none mt-0.5">Equipe Técnica</p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Arthur Silveira</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Desenvolvedor do Projeto</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Matheus Oliveira</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Desenvolvedor do Projeto</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
                      <span className="text-[8px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                        Prefeitura do Recife
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Current formatted UTC date */}
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide flex items-center gap-1.5 shadow-2xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse flex-shrink-0" />
              <span>
                {currentDateTime.toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }).replace(/^\w/, (c) => c.toUpperCase())}
              </span>
              <span className="text-slate-200 dark:text-slate-800 flex-shrink-0">|</span>
              <span className="text-[#1E40AF] dark:text-blue-400 font-semibold flex-shrink-0">
                {currentDateTime.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable main workspace block container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
