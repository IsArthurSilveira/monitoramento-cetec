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
  fcd: number; // Oferta Cidadã Digital
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
  id_unidade?: string;
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

export type ActiveTab = 'Dashboards' | 'Clubes Robótica' | 'Diário' | 'Informações' | 'Afastamentos' | 'Ofertas de Cursos' | 'Config';
export type TableTab = 'Todas Unidades' | 'Lista Detalhada';

export interface OfertaCursoRecord {
  id: string;
  id_utec: string;
  utecName?: string;
  regional?: string;
  rpa?: string;
  ambiente: string;
  turma_oferta: string;
  status_oferta: string;
  titulo_de_oferta: string;
  eixo_tematico: string;
  turno_oferta: string;
  dias_semana: string;
  inicio_oferta: string;
  fim_oferta: string;
  ch_diaria_oferta: string;
  ch_total_oferta: string;
  professor_oferta: string;
  publico_oferta: string;
  vagas_oferta: number;
  matriculados_oferta: number;
  concluintes_oferta: number;
  observacao_ementa_oferta: string;
}

export interface AfastamentoRecord {
  id: string;
  nomeProfissional: string;
  matricula: string;
  cargo: string;
  utecId: string;
  utecName: string;
  regional: string;
  rpa: string;
  tipoAfastamento: 'Licença Médica' | 'Licença Maternidade/Paternidade' | 'Férias' | 'Afastamento Preventivo' | 'Licença Prêmio' | 'Outros';
  dataInicio: string;
  dataFim: string;
  diasAfastado: number;
  status: 'Ativo' | 'Próximo do Retorno' | 'Concluído';
  observacao?: string;
}

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

export interface RoboticsClub {
  id_clube: string;
  id_utec: string;
  id_unidade: string;
  nome_clube: string;
  modalidade_clube: string;
  qnt_alunos_clube: number;
  qnt_alunos_masculino: number;
  qnt_alunos_feminino: number;
  multiplicador_clube: string;
  estagiario_clube: string;
  dias_clube: string;
  horario_clube: string;
}
