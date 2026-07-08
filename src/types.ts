/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UtecMetric {
  id: string;
  name: string;
  regional: string;
  unidades: number;
  estudantes: number;
  lct: number; // Laboratório LCT
  rob: number; // Robótica
  cine: number; // Cineclube
  fcd: number; // Formação Cidadã Digital
  rev: number; // Relevância / Premiados
  coordinator: string;
  email: string;
  phone: string;
  status: 'Ativa' | 'Inativa';
  creationDate: string;
  rpaSede?: string;
  managerName?: string;
  managerEmail?: string;
  managerPhone?: string;
  viceName?: string;
  viceEmail?: string;
  vicePhone?: string;
  staff?: Array<{
    name: string;
    role: string;
    email: string;
    phone: string;
    matricula?: string;
    situacao?: string;
    status?: string;
    turno?: string;
    cargaHoraria?: string;
    observacao?: string;
  }>;
}

export interface EducationalUnit {
  inep_escola: string;
  id_utec_suporte: string;
  rpa_escola: string;
  endereco: string;
  modalidade_ensino: string;
  nome_unidade: string;
  tipo_unidade: string;
  qtd_estudantes: number;
  por_demanda: string; // 'Sim' | 'Não'
  qtd_lct: number;
  qtd_cineclube: number;
  qtd_robotica: number;
  gestor?: string;
  vice_gestor?: string;
  premiado?: string;
}

export interface KpiCard {
  title: string;
  value: string;
  subtext: string;
  color: string;
  borderColor: string;
}

export type ActiveTab = 'Dashboards' | 'Diário' | 'Informações' | 'Config';
export type TableTab = 'Todas Unidades' | 'Lista Detalhada';

// Struct of record/registro in Multiplier's Diary
export interface DiaryRecord {
  id: string;
  utecId: string;
  utecName: string;
  escolaInep: string;
  escolaNome: string;
  dataOcorrencia: string;
  solicitante: string;
  qtdProfessores: number | string;
  qtdEstudantes: number | string;
  categoria: string;
  atendimentoTipo: 'Escola' | 'Externo/UTEC';
  mes: string;
  
  // Specific spreadsheet extended fields to handle full fidelity
  turno1?: string;
  turno2?: string;
  turno3?: string;
  participacao?: string;
  local?: string;
  observacoes?: string;
  usuExterno?: string;
  atividadesDesenvolvidas?: string;
  observacao?: string;
  demanda?: string;
  anfitriaoNaUe?: string;
  ocorrencia?: string;
  planejamento?: string;
  temaDaAtividade?: string;
  outros?: string;
  grupoImpacto?: string;
  modalidade?: string;
  estudantes?: number;
  engajamentoEstudantes?: string;
  professores?: number;
  engajamentoProfessores?: string;
  redsFisicos?: string;
  softwares?: string;
  dataCarimbo?: string;
  matriculaSolicitante?: string;
  nomeSolicitante?: string;
  unidadeDeEnsino?: string;
  area?: string;
  setor?: string;
  status?: string;
  protocolo?: string;
  grupo?: string;
}
