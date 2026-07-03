import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Users, 
  AlertCircle, 
  FileText,
  RefreshCw,
  Loader2,
  X,
  Info
} from 'lucide-react';

import DiaryKPIs from './DiaryKPIs';
import DiaryFilters from './DiaryFilters';
import DiaryDetailModal from './DiaryDetailModal';
import DiaryCharts from './DiaryCharts';
import { UtecMetric, DiaryRecord } from '../types';
import { INITIAL_EDUCATIONAL_UNITS } from '../data';

interface MultiplierDiaryProps {
  utecs: UtecMetric[];
  sheetsDatabase?: Record<string, any[]>;
  diaryRecords?: DiaryRecord[];
  syncStatus?: 'idle' | 'loading' | 'success' | 'error';
  syncError?: string | null;
  isRefreshing?: boolean;
  fetchDiaryData?: (manual?: boolean) => Promise<void>;
}

// Map spreadsheet groups to our supported UTEC IDs & Names dynamically
const mapGroupToUtec = (grupoStr: string) => {
  const normalized = String(grupoStr || "").toUpperCase();
  if (normalized.includes("BOTANICO") || normalized.includes("JARDIM")) {
    return { id: "utec-2", name: "UTEC JARDIM BOTANICO" };
  }
  if (normalized.includes("BOA VIAGEM")) {
    return { id: "utec-1", name: "UTEC BOA VIAGEM" };
  }
  if (normalized.includes("SITIO") || normalized.includes("TRINDADE")) {
    return { id: "utec-3", name: "UTEC SITIO TRINDADE" };
  }
  if (normalized.includes("SANTO AMARO")) {
    return { id: "utec-4", name: "UTEC SANTO AMARO" };
  }
  if (normalized.includes("GREGORIO") || normalized.includes("BEZERRA")) {
    return { id: "utec-5", name: "UTEC GREGORIO BEZERRA" };
  }
  if (normalized.includes("IBURA")) {
    return { id: "utec-6", name: "UTEC IBURA" };
  }
  if (normalized.includes("ALTO SANTA") || normalized.includes("ALTO STA") || normalized.includes("TEREZINHA")) {
    return { id: "utec-7", name: "UTEC ALTO STA TEREZINHA" };
  }
  if (normalized.includes("CAXANGÁ") || normalized.includes("CAXANGA")) {
    return { id: "utec-8", name: "UTEC CAXANGÁ" };
  }
  if (normalized.includes("COQUE")) {
    return { id: "utec-9", name: "UTEC COQUE" };
  }
  if (normalized.includes("CORDEIRO")) {
    return { id: "utec-10", name: "UTEC CORDEIRO" };
  }
  if (normalized.includes("CRISTIANO") || normalized.includes("DONATO")) {
    return { id: "utec-11", name: "UTEC CRISTIANO DONATO" };
  }
  if (normalized.includes("LARGO") || normalized.includes("DOM LUIS") || normalized.includes("LUIS")) {
    return { id: "utec-12", name: "UTEC LARGO DOM LUIS" };
  }
  if (normalized.includes("NOVA DESCOBERTA")) {
    return { id: "utec-13", name: "UTEC NOVA DESCOBERTA" };
  }
  if (normalized.includes("PINA")) {
    return { id: "utec-14", name: "UTEC PINA" };
  }
  return { id: "utec-1", name: "UTEC BOA VIAGEM" }; // Standard fallback
};

// Find matching school INEP code from internal catalog
const findInep = (schoolName: string): string => {
  const normS = String(schoolName || "").toUpperCase();
  if (normS.includes("UTEC")) return "";
  const match = INITIAL_EDUCATIONAL_UNITS.find(u => 
    normS.includes(u.nome_unidade.toUpperCase()) || 
    u.nome_unidade.toUpperCase().includes(normS)
  );
  return match ? match.inep_escola : "";
};

// Parse Month Name for filter consistency
const determineMonth = (dateStr: string): string => {
  if (String(dateStr).includes("/02/")) return "fev. de 2026";
  return "mar. de 2026";
};

// Smart, robust value finder that tolerates accents, case, spaces, and underscores
const findVal = (row: any, aliases: string[]): any => {
  if (!row || typeof row !== "object") return undefined;
  const keys = Object.keys(row);
  for (const alias of aliases) {
    const normAlias = alias.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    for (const key of keys) {
      const normKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
      if (normKey === normAlias) {
        return row[key];
      }
    }
  }
  return undefined;
};

// Ultimate flexible mapper for raw JSON attributes (supporting both Apps Script properties and CSV exports)
const mapSpreadsheetRowToDiaryRecord = (r: any, idx: number): DiaryRecord => {
  const getVal = (aliases: string[], fallback = "") => {
    const v = findVal(r, aliases);
    return v !== undefined && v !== null ? v : fallback;
  };

  // Encontrar o grupo de forma inteligente nas colunas da planilha
  let group = "";
  const foundGroup = getVal([
    "grupo", "utec", "utecname", "utec_nome", "qualaasuaute", "qualaute", "qualaasuautec", "grupo_nome",
    "qualasuautec", "qualasuautecdeapoio", "suautec", "utecapoio", "utec_responsavel", "utec_solicitante", "selectutec"
  ]);

  if (foundGroup !== undefined && foundGroup !== null && foundGroup !== "") {
    group = String(foundGroup);
  } else {
    // Escaneia todas as chaves e valores no registro bruto em busca de qualquer valor que contenha "UTEC"
    const keys = Object.keys(r);
    for (const key of keys) {
      const valStr = String(r[key] || "");
      if (valStr.toUpperCase().includes("UTEC")) {
        group = valStr;
        break;
      }
    }
  }

  // Se ainda estiver em branco, vamos ver se a gente encontra pelo nome da unidade (escola ou própria UTEC)
  if (!group) {
    const unidadeVal = String(getVal(["unidadedeensino", "nomedaunidadedeensino", "escolanome", "escola_nome", "escola", "unidade", "unidade_ensino"], ""));
    if (unidadeVal.toUpperCase().includes("UTEC")) {
      group = unidadeVal;
    }
  }

  // Se realmente não encontrou nenhum grupo/UTEC no registro, vamos usar uma UTEC padrão,
  // mas distribuindo de forma rotativa baseada no índice para evitar empilhar artificialmente tudo em uma só
  if (!group) {
    const utecKeys = ["UTEC BOA VIAGEM", "UTEC JARDIM BOTANICO", "UTEC SITIO TRINDADE", "UTEC SANTO AMARO", "UTEC GREGORIO BEZERRA", "UTEC IBURA", "UTEC ALTO STA TEREZINHA"];
    group = utecKeys[idx % utecKeys.length];
  }

  const utecMapped = mapGroupToUtec(group);
  const dataOcorrencia = String(getVal(["dataocorrencia", "datadaocorrencia", "data", "carimbodedatahora", "carimbo", "data_ocorrencia"], "17/03/2026"));
  
  const rawEstudantes = getVal(["estudantes", "estudantesatendidos", "quantidadedeestudantes", "alunos", "qtdestudantes", "outros", "quantidade_estudantes"], "0");
  const rawProfessores = getVal(["professores", "professoresatendidos", "quantidadedeprofessores", "docentes", "qtdprofessores", "quantidade_professores"], "0");
  
  const parseCount = (val: any): number => {
    if (typeof val === 'number') {
      return Math.floor(val);
    }
    const str = String(val).trim();
    if (!str || str === "" || str === "-") return 0;
    if (str.includes("/") || str.includes("-")) return 0;
    const parsed = parseInt(str, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const numEstudantes = parseCount(rawEstudantes);
  const numProfessores = parseCount(rawProfessores);
  
  const categoria = String(getVal(["categoria", "categoriadeatendimento", "tipodeatendimento", "setor", "tipo_atendimento"], "Diário - Expediente na UTEC"));
  const unidade = String(getVal(["unidadedeensino", "nomedaunidadedeensino", "escolanome", "escola_nome", "escola", "unidade", "unidade_ensino"], "UTEC JARDIM BOTANICO"));
  const solicitante = String(getVal(["solicitante", "nomesolicitante", "nomedosolicitante", "nome", "multiplicador", "nome_solicitante"], "Renata Tavares da Silva"));
  const atendimentoTipo: 'Escola' | 'Externo/UTEC' = (categoria.includes("Expediente") || categoria.includes("Externo") || categoria === 'Diário - Expediente na UTEC') ? 'Externo/UTEC' : 'Escola';

  return {
    id: String(getVal(["id", "protocolo", "id_registro", "key"]) || `rec-idx-${idx}`),
    dataOcorrencia,
    turno1: String(getVal(["turno1", "turno", "turnos"], "")),
    turno2: String(getVal(["turno2"], "")),
    turno3: String(getVal(["turno3"], "")),
    participacao: String(getVal(["participacao"], "")),
    local: String(getVal(["local"], "")),
    observacoes: String(getVal(["observacoes"], "")),
    usuExterno: String(getVal(["usuexterno", "usuarioexterno"], "")),
    atividadesDesenvolvidas: String(getVal(["atividadesdesenvolvidas", "atividades", "atividades_desenvolvidas"], "")),
    observacao: String(getVal(["observacao", "observacoesservidor"], "")),
    demanda: String(getVal(["demanda"], "")),
    anfitriaoNaUe: String(getVal(["anfitriaonaue", "anfitriao"], "")),
    ocorrencia: String(getVal(["ocorrencia", "ocorrencias"], "")),
    planejamento: String(getVal(["planejamento"], "")),
    temaDaAtividade: String(getVal(["temadaatividade", "tema", "tema_atividade"], "")),
    outros: String(getVal(["outros"], "")),
    grupoImpacto: String(getVal(["grupoimpacto"], "")),
    modalidade: String(getVal(["modalidade"], "")),
    estudantes: numEstudantes,
    engajamentoEstudantes: String(getVal(["engajamentoestudantes"], "Não se aplica")),
    professores: numProfessores,
    engajamentoProfessores: String(getVal(["engajamentoprofessores"], "Não se aplica")),
    redsFisicos: String(getVal(["redsfisicos", "reds_fisicos"], "")),
    softwares: String(getVal(["softwares", "software"], "")),
    dataCarimbo: String(getVal(["datacarimbo", "carimbo"], "")),
    matriculaSolicitante: String(getVal(["matriculasolicitante", "matricula"], "")),
    nomeSolicitante: solicitante,
    unidadeDeEnsino: unidade,
    area: String(getVal(["area"], "UTEC")),
    setor: String(getVal(["setor"], "Outros Diários")),
    categoria,
    status: String(getVal(["status"], "Não Lida")),
    protocolo: String(getVal(["protocolo", "id", "registro"], `901201${idx}`)),
    grupo: group,
    
    // Derived compatibility variables
    utecId: utecMapped.id,
    utecName: utecMapped.name,
    escolaInep: findInep(unidade),
    escolaNome: unidade,
    qtdProfessores: numProfessores > 0 ? numProfessores : '-',
    qtdEstudantes: numEstudantes > 0 ? numEstudantes : '-',
    solicitante: solicitante,
    atendimentoTipo,
    mes: determineMonth(dataOcorrencia)
  };
};

export default function MultiplierDiary({ 
  utecs,
  sheetsDatabase: propSheetsDatabase,
  diaryRecords: propDiaryRecords,
  syncStatus: propSyncStatus,
  syncError: propSyncError,
  isRefreshing: propIsRefreshing,
  fetchDiaryData: propFetchDiaryData
}: MultiplierDiaryProps) {
  // Local state fallbacks if props are not provided
  const [localDiaryRecords, setLocalDiaryRecords] = useState<DiaryRecord[]>([]);
  const [localSheetsDatabase, setLocalSheetsDatabase] = useState<Record<string, any[]>>({});
  const [localSyncStatus, setLocalSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [localSyncError, setLocalSyncError] = useState<string | null>(null);
  const [localIsRefreshing, setLocalIsRefreshing] = useState(false);

  // Use props if supplied, otherwise local state
  const diaryRecords = propDiaryRecords !== undefined ? propDiaryRecords : localDiaryRecords;
  const sheetsDatabase = propSheetsDatabase !== undefined ? propSheetsDatabase : localSheetsDatabase;
  const syncStatus = propSyncStatus !== undefined ? propSyncStatus : localSyncStatus;
  const syncError = propSyncError !== undefined ? propSyncError : localSyncError;
  const isRefreshing = propIsRefreshing !== undefined ? propIsRefreshing : localIsRefreshing;

  const setDiaryRecords = propDiaryRecords !== undefined ? () => {} : setLocalDiaryRecords;
  const setSheetsDatabase = propSheetsDatabase !== undefined ? () => {} : setLocalSheetsDatabase;
  const setSyncStatus = propSyncStatus !== undefined ? () => {} : setLocalSyncStatus;
  const setSyncError = propSyncError !== undefined ? () => {} : setLocalSyncError;
  const setIsRefreshing = propIsRefreshing !== undefined ? () => {} : setLocalIsRefreshing;

  const [showIntegrationPanel, setShowIntegrationPanel] = useState(false);

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxOe9MujeLIGxM3L5QJVd28NhAgljTnoKGS_jMAjM5K8k7wnlKjtlJkBrmWyPW-0ht2/exec';
  const API_FEED_URL = '/api/diary';

  // Function to fetch the relational database with all 13 sheets (?tabela=todas) in real time
  const fetchDiaryData = async (manual = false) => {
    if (propFetchDiaryData) {
      await propFetchDiaryData(manual);
      return;
    }
    if (manual) {
      setIsRefreshing(true);
    } else {
      setSyncStatus('loading');
    }
    setSyncError(null);

    try {
      const targetUrl = `${API_FEED_URL}?tabela=todas`;
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result && result.status === 'success') {
        let rawRecords: any[] = [];
        
        if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
          setSheetsDatabase(result.data);
          
          const keys = Object.keys(result.data);
          let diaryKey = keys.find(k => k.toLowerCase() === 'diario_multiplicador' || k.toLowerCase().includes('diario_multiplicador'));
          if (!diaryKey) {
            diaryKey = keys.find(k => k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('diario'));
          }
          if (!diaryKey) {
            diaryKey = keys[0];
          }
          
          if (diaryKey && Array.isArray(result.data[diaryKey])) {
            rawRecords = result.data[diaryKey];
          }
        } else if (Array.isArray(result.data)) {
          rawRecords = result.data;
          setSheetsDatabase({ 'diario_multiplicador': result.data });
        }
        
        if (rawRecords.length > 0) {
          const formattedData = rawRecords.map((r: any, idx: number) => mapSpreadsheetRowToDiaryRecord(r, idx));
          setDiaryRecords(formattedData);
          setSyncStatus('success');
        } else {
          setSyncStatus('idle');
        }
      } else {
        throw new Error(result?.message || 'Formato de resposta inválido obtido do Apps Script.');
      }
    } catch (err: any) {
      console.warn("Error fetching spreadsheet records:", err);
      setSyncStatus('error');
      setSyncError('Erro: Não foi possível obter os registros da Planilha Google.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDiaryData();
  }, []);

  // Filter selections in UI
  const [filterUtecId, setFilterUtecId] = useState<string>('Todas');
  const [filterEscolaInep, setFilterEscolaInep] = useState<string>('Todas');
  const [filterCategory, setFilterCategory] = useState<string>('Todas');
  const [filterMonth, setFilterMonth] = useState<string>('Todas');
  const [filterSolicitante, setFilterSolicitante] = useState<string>('Todas');

  // Search and Pagination for raw logs table
  const [tableSearch, setTableSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Selected diary record for detailed overlay modal
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<DiaryRecord | null>(null);

  // Unique lists derived from records
  const uniqueMultipliers = useMemo(() => {
    const list = Array.from(new Set(diaryRecords.map(r => r.solicitante).filter(Boolean)));
    return list.sort();
  }, [diaryRecords]);

  const uniqueSchools = useMemo(() => {
    const map = new Map<string, string>();
    diaryRecords.forEach(r => {
      if (r.escolaInep) {
        map.set(r.escolaInep, r.escolaNome);
      }
    });
    return Array.from(map.entries()).map(([inep, name]) => ({ inep, name }));
  }, [diaryRecords]);

  // Derived filtered records for analysis
  const filteredRecords = useMemo(() => {
    return diaryRecords.filter(record => {
      if (filterUtecId !== 'Todas' && record.utecId !== filterUtecId) return false;
      if (filterEscolaInep !== 'Todas' && record.escolaInep !== filterEscolaInep) return false;
      if (filterCategory !== 'Todas' && record.categoria !== filterCategory) return false;
      if (filterMonth !== 'Todas' && record.mes !== filterMonth) return false;
      if (filterSolicitante !== 'Todas' && record.solicitante !== filterSolicitante) return false;
      return true;
    });
  }, [diaryRecords, filterUtecId, filterEscolaInep, filterCategory, filterMonth, filterSolicitante]);

  // Table search filtering
  const tableFilteredRecords = useMemo(() => {
    return filteredRecords.filter(record => {
      const q = tableSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        record.solicitante.toLowerCase().includes(q) ||
        record.escolaNome.toLowerCase().includes(q) ||
        record.categoria.toLowerCase().includes(q) ||
        (record.temaDaAtividade && record.temaDaAtividade.toLowerCase().includes(q)) ||
        (record.atividadesDesenvolvidas && record.atividadesDesenvolvidas.toLowerCase().includes(q))
      );
    });
  }, [filteredRecords, tableSearch]);

  // Paginated records
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return tableFilteredRecords.slice(start, start + rowsPerPage);
  }, [tableFilteredRecords, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(tableFilteredRecords.length / rowsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [tableSearch, filterUtecId, filterEscolaInep, filterCategory, filterMonth, filterSolicitante, rowsPerPage]);

  // Active schools list in filter dropdown (scoped to selected UTEC if applicable)
  const scopedFilterSchools = useMemo(() => {
    if (filterUtecId === 'Todas') {
      return uniqueSchools;
    }
    return uniqueSchools.filter(school => {
      const parentUnit = INITIAL_EDUCATIONAL_UNITS.find(u => u.inep_escola === school.inep);
      return parentUnit ? parentUnit.id_utec_suporte === filterUtecId : true;
    });
  }, [filterUtecId, uniqueSchools]);

  // KPIs Calculations
  const kpis = useMemo(() => {
    const totalRegistros = filteredRecords.length;

    const estudantesImpactados = filteredRecords.reduce((sum, r) => {
      const val = typeof r.qtdEstudantes === 'number' 
        ? r.qtdEstudantes 
        : parseInt(String(r.qtdEstudantes), 10);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const multiplicadoresCount = new Set(
      filteredRecords
        .filter(r => r.solicitante && r.solicitante.trim() !== '')
        .map(r => r.solicitante)
    ).size;

    const professoresImpactados = filteredRecords.reduce((sum, r) => {
      const val = typeof r.qtdProfessores === 'number' 
        ? r.qtdProfessores 
        : parseInt(String(r.qtdProfessores), 10);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return {
      totalRegistros,
      estudantesImpactados: Math.round(estudantesImpactados),
      multiplicadoresCount,
      professoresImpactados: Math.round(professoresImpactados)
    };
  }, [filteredRecords]);

  // --- CHARTS CALCULATIONS ---
  const chartPlanejamentosPorUtec = useMemo(() => {
    const countMap: { [key: string]: number } = {};
    filteredRecords.forEach(r => {
      const name = r.utecName;
      countMap[name] = (countMap[name] || 0) + 1;
    });

    return utecs.map(u => ({
      name: u.name.replace("UTEC ", ""),
      value: countMap[u.name] || 0
    })).sort((a, b) => b.value - a.value);
  }, [filteredRecords, utecs]);

  const chartPreenchimentoPorEscola = useMemo(() => {
    const counts: { [key: string]: number } = {};
    filteredRecords.forEach(r => {
      if (r.escolaNome) {
        counts[r.escolaNome] = (counts[r.escolaNome] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({
      name: name
        .replace('Escola Municipal ', 'EM ')
        .replace('Creche Escola Municipal ', 'CEM ')
        .replace('Unidade de Tecnologia na Educação e Cidadania', 'UTEC'),
      value
    })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [filteredRecords]);

  const chartTopProfessores = useMemo(() => {
    const counts: { [key: string]: number } = {};
    filteredRecords.forEach(r => {
      if (r.solicitante) {
        counts[r.solicitante] = (counts[r.solicitante] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({
      name: name.split(' ')[0] + ' ' + (name.split(' ')[1] || ''),
      value
    })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [filteredRecords]);

  const chartCategoriasPie = useMemo(() => {
    const map: { [key: string]: number } = {};
    filteredRecords.forEach(r => {
      map[r.categoria] = (map[r.categoria] || 0) + 1;
    });

    return [
      { name: 'Expediente UTEC', value: map['Diário - Expediente na UTEC'] || 0, color: '#2563EB' },
      { name: 'Eventos Externos', value: map['Diário - Eventos Externos'] || 0, color: '#D97706' },
      { name: 'Clubes e Projetos', value: map['Diário - Clubes e Projetos'] || 0, color: '#DB2777' },
      { name: 'Orientação REDS', value: map['Diário - Orientação REDS'] || 0, color: '#059669' }
    ].filter(item => item.value > 0);
  }, [filteredRecords]);

  const totalCategoriasCount = useMemo(() => {
    return chartCategoriasPie.reduce((sum, item) => sum + item.value, 0);
  }, [chartCategoriasPie]);

  const anyFilterActive = 
    filterUtecId !== 'Todas' || 
    filterEscolaInep !== 'Todas' || 
    filterCategory !== 'Todas' || 
    filterMonth !== 'Todas' || 
    filterSolicitante !== 'Todas';

  const resetAllFilters = () => {
    setFilterUtecId('Todas');
    setFilterEscolaInep('Todas');
    setFilterCategory('Todas');
    setFilterMonth('Todas');
    setFilterSolicitante('Todas');
    setTableSearch('');
  };

  return (
    <div className="space-y-6" id="multiplier-diary-dashboard">
      


      {/* 2. Integration Info Panel */}
      {showIntegrationPanel && (
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3" id="diary-integration-panel">
          <div>
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-2">
              Status Técnico da Conexão
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Os dados deste dashboard são lidos dinamicamente de uma API intermediária conectada ao Google Sheets da Prefeitura de Recife.
            </p>
          </div>
          <div className="bg-white dark:bg-[#111827] p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-400 space-y-1.5 break-all">
            <p><span className="font-bold text-slate-400">ENDPOINT DA API:</span> {API_FEED_URL}</p>
            <p><span className="font-bold text-slate-400">APPS SCRIPT:</span> {APPS_SCRIPT_URL}</p>
          </div>
        </div>
      )}

      {/* 4. Beautifully Redesigned Metrics Grid */}
      <DiaryKPIs
        totalRegistros={kpis.totalRegistros}
        multiplicadoresCount={kpis.multiplicadoresCount}
        professoresImpactados={kpis.professoresImpactados}
        estudantesImpactados={kpis.estudantesImpactados}
      />

      {/* 3. Operational Filters Bar */}
      <DiaryFilters
        filterUtecId={filterUtecId}
        setFilterUtecId={(id) => {
          setFilterUtecId(id);
          setFilterEscolaInep('Todas');
        }}
        filterEscolaInep={filterEscolaInep}
        setFilterEscolaInep={setFilterEscolaInep}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
        filterSolicitante={filterSolicitante}
        setFilterSolicitante={setFilterSolicitante}
        utecs={utecs}
        scopedFilterSchools={scopedFilterSchools}
        uniqueMultipliers={uniqueMultipliers}
        resetAllFilters={resetAllFilters}
        anyFilterActive={anyFilterActive}
      />

      {/* 5. Bento Grid Charts Section */}
      <DiaryCharts
        chartPlanejamentosPorUtec={chartPlanejamentosPorUtec}
        chartCategoriasPie={chartCategoriasPie}
        totalCategoriasCount={totalCategoriasCount}
        chartPreenchimentoPorEscola={chartPreenchimentoPorEscola}
        chartTopProfessores={chartTopProfessores}
      />

      {/* 6. Live Records Table Grid */}
      <div className="bg-white dark:bg-[#111827] rounded-xl shadow-3xs border border-slate-200 dark:border-slate-800 overflow-hidden" id="diary-raw-logs-table">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              Diários de Bordo & Ocorrências Registradas
            </h4>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
              Clique em qualquer registro para visualizar a ficha de atendimento completa do servidor.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Procurar na tabela..."
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                className="w-full sm:w-[220px] pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-bold placeholder-slate-400"
              />
              {tableSearch && (
                <button onClick={() => setTableSearch('')} className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            
            <select
              value={rowsPerPage}
              onChange={e => setRowsPerPage(Number(e.target.value))}
              className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-black text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              <option value={10}>10 linhas</option>
              <option value={20}>20 linhas</option>
              <option value={50}>50 linhas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-3 font-black text-[10px] uppercase tracking-wider">Data</th>
                <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider">Multiplicador</th>
                <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider">Unidade Escolar</th>
                <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider text-center">Docentes</th>
                <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider text-center">Alunos</th>
                <th className="px-5 py-3 font-black text-[10px] uppercase tracking-wider">Ação / Categoria</th>
                <th className="px-4 py-3 font-black text-[10px] uppercase tracking-wider text-center">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {syncStatus === 'loading' ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-blue-600 dark:text-blue-400">
                    <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-600" />
                    <p className="font-black text-xs uppercase tracking-wider">Sincronizando diários...</p>
                  </td>
                </tr>
              ) : paginatedRecords.length > 0 ? (
                paginatedRecords.map((rec) => (
                  <tr 
                    key={rec.id} 
                    onClick={() => setSelectedRecordForModal(rec)}
                    className="hover:bg-blue-50/30 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 font-mono text-[10.5px] text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">{rec.dataOcorrencia}</td>
                    <td className="px-4 py-3.5 font-black text-slate-800 dark:text-slate-200">{rec.solicitante}</td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 truncate max-w-[220px]" title={rec.escolaNome}>
                      {rec.escolaNome}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-black text-slate-500 dark:text-slate-400">{rec.qtdProfessores}</td>
                    <td className="px-4 py-3.5 text-center font-mono font-black text-slate-500 dark:text-slate-400">{rec.qtdEstudantes}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-black inline-block ${
                        rec.categoria === 'Diário - Expediente na UTEC'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/40'
                          : rec.categoria === 'Diário - Eventos Externos'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100/40'
                          : rec.categoria === 'Diário - Clubes e Projetos'
                          ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-100/40'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/40'
                      }`}>
                        {rec.categoria.replace('Diário - ', '')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center p-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition-colors border border-slate-200 dark:border-slate-800">
                        <Info className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold">Nenhum registro encontrado</p>
                    <p className="text-[10px] mt-1 text-slate-400">Verifique os filtros selecionados ou digite outra palavra chave.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              Exibindo {Math.min(tableFilteredRecords.length, (currentPage - 1) * rowsPerPage + 1)}-{Math.min(tableFilteredRecords.length, currentPage * rowsPerPage)} de {tableFilteredRecords.length} registros
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1 text-[11px] font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Anterior
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  const isCurrent = page === currentPage;
                  if (totalPages > 6 && Math.abs(page - currentPage) > 1 && page !== 1 && page !== totalPages) {
                    if (page === 2 || page === totalPages - 1) {
                      return <span key={page} className="text-[10px] text-slate-400 px-0.5">...</span>;
                    }
                    return null;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-6 h-6 flex items-center justify-center text-[10px] font-black rounded-md transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-3xs'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1 text-[11px] font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7. Detailed Protocol Dialog Drawer Overlay */}
      <DiaryDetailModal
        isOpen={!!selectedRecordForModal}
        record={selectedRecordForModal}
        onClose={() => setSelectedRecordForModal(null)}
      />
    </div>
  );
}
