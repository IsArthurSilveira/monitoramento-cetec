import { OfertaCursoRecord, UtecMetric } from '../types';

function getRowVal(row: any, aliases: string[], fallback: any = ""): any {
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
}

function normalizeUtecId(id: string | number): string {
  if (!id) return 'utec-1';
  const str = String(id).trim().toLowerCase();
  if (str.startsWith('utec-') || str.startsWith('utec_')) return str.replace('_', '-');
  if (/^\d+$/.test(str)) return `utec-${str}`;
  return str;
}

export const INITIAL_OFERTAS_RAW = [
  { id_oferta: "1", id_utec: "1", ambiente: "SALA 2", turma_oferta: "1", status_oferta: "iniciado", titulo_de_oferta: "COMPETÊNCIAS DIGITAIS PARA IDOSOS (ANTIGO NAVEGAR É PRECISO)", eixo_tematico: "Cultura Digital", turno_oferta: "Manhã", dias_semana: "QUINTA", inicio_oferta: "05/03/2026", fim_oferta: "10/04/2026", ch_diaria_oferta: "2h", ch_total_oferta: "12H", professor_oferta: "EDSON", publico_oferta: "comunidade", vagas_oferta: "10", matriculados_oferta: "10" },
  { id_oferta: "2", id_utec: "1", ambiente: "SALA 1", turma_oferta: "2", status_oferta: "iniciado", titulo_de_oferta: "COMPETÊNCIAS DIGITAIS", eixo_tematico: "Cultura Digital", turno_oferta: "Noite", dias_semana: "QUINTA E SEXTA", inicio_oferta: "05/03/2026", fim_oferta: "10/04/2026", ch_diaria_oferta: "2h", ch_total_oferta: "20h", professor_oferta: "BIANCA MARTINS", publico_oferta: "comunidade", vagas_oferta: "20", matriculados_oferta: "20" },
  { id_oferta: "3", id_utec: "1", ambiente: "SALA 1", turma_oferta: "3", status_oferta: "iniciado", titulo_de_oferta: "FERRAMENTAS PARA ANÁLISE DE DADOS NO MUNDO DO TRABALHO E DA ECONOMIA", eixo_tematico: "Cultura Digital", turno_oferta: "Noite", dias_semana: "QUINTA E SEXTA", inicio_oferta: "05/03/2026", fim_oferta: "10/04/2026", ch_diaria_oferta: "2h", ch_total_oferta: "20h", professor_oferta: "PATRICIA SANTANA", publico_oferta: "comunidade", vagas_oferta: "10", matriculados_oferta: "10" },
  { id_oferta: "4", id_utec: "1", ambiente: "SALA 2", turma_oferta: "4", status_oferta: "iniciado", titulo_de_oferta: "CANVA", eixo_tematico: "Cultura Digital", turno_oferta: "Noite", dias_semana: "QUARTA", inicio_oferta: "04/03/2026", fim_oferta: "01/04/2026", ch_diaria_oferta: "2h", ch_total_oferta: "10h", professor_oferta: "BIANCA MARTINS", publico_oferta: "comunidade", vagas_oferta: "10", matriculados_oferta: "10" },
  { id_oferta: "5", id_utec: "1", ambiente: "SALA 1", turma_oferta: "5", status_oferta: "iniciado", titulo_de_oferta: "TRILHA 1º ANO B DA ESCOLA ALTO SANTA TEREZINHA", eixo_tematico: "Mundo Digital", turno_oferta: "Manhã", dias_semana: "TERÇA", inicio_oferta: "10/03/2026", fim_oferta: "31/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "EDSON", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "6", id_utec: "1", ambiente: "SALA 1", turma_oferta: "6", status_oferta: "iniciado", titulo_de_oferta: "TRILHA COMPETÊNCIAS DIGITAIS PARA O 4 ANO A DA ESCOLA ALTO SANTA TEREZINHA", eixo_tematico: "Mundo Digital, Cultura Digital, Pensamento Computacional", turno_oferta: "Manhã", dias_semana: "TERÇA", inicio_oferta: "10/03/2026", fim_oferta: "31/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "ANA PAULA ANDRADE", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "7", id_utec: "1", ambiente: "SALA 1", turma_oferta: "7", status_oferta: "iniciado", titulo_de_oferta: "BIBLIOTEC (PARCERIA COM A BIBLIOTECA)", eixo_tematico: "Cultura Digital", turno_oferta: "Manhã", dias_semana: "TERÇA", inicio_oferta: "10/03/2026", fim_oferta: "31/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "ANA PAULA ANDRADE", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "8", id_utec: "1", ambiente: "SALA 1", turma_oferta: "8", status_oferta: "iniciado", titulo_de_oferta: "TRILHA TECNOLOGIA - 5 ANO B- ESCOLA SÃO JOÃO BATISTA", eixo_tematico: "Mundo Digital, Cultura Digital, Pensamento Computacional", turno_oferta: "Tarde", dias_semana: "TERÇA", inicio_oferta: "10/03/2026", fim_oferta: "31/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "BRENDA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "9", id_utec: "1", ambiente: "SALA 1", turma_oferta: "9", status_oferta: "iniciado", titulo_de_oferta: "TRILHA TECNOLOGIA - 5 ANO B- ESCOLA ALTO SANTA TEREZINHA", eixo_tematico: "Mundo Digital, Cultura Digital, Pensamento Computacional", turno_oferta: "Tarde", dias_semana: "TERÇA", inicio_oferta: "10/03/2026", fim_oferta: "31/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "BRENDA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "10", id_utec: "1", ambiente: "SALA 1", turma_oferta: "10", status_oferta: "iniciado", titulo_de_oferta: "TRILHA TECNOLOGIA - 5 ANO C- ESCOLA ALTO SANTA TEREZINHA", eixo_tematico: "Mundo Digital, Cultura Digital, Pensamento Computacional", turno_oferta: "Tarde", dias_semana: "TERÇA", inicio_oferta: "10/03/2026", fim_oferta: "31/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "BRENDA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "11", id_utec: "1", ambiente: "SALA 1", turma_oferta: "11", status_oferta: "iniciado", titulo_de_oferta: "BIBLIOTEC (PARCERIA COM A BIBLIOTECA)", eixo_tematico: "Mundo Digital", turno_oferta: "Tarde", dias_semana: "TERÇA", inicio_oferta: "10/03/2026", fim_oferta: "31/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "PATRICIA SANTANA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "12", id_utec: "1", ambiente: "SALA 1", turma_oferta: "12", status_oferta: "iniciado", titulo_de_oferta: "TRILHA EJA - TURMA MODULADA ESCOLA ALTO SANTA TEREZINHA", eixo_tematico: "Mundo Digital", turno_oferta: "Noite", dias_semana: "TERÇA", inicio_oferta: "03/03/2026", fim_oferta: "01/12/2026", ch_diaria_oferta: "2h", ch_total_oferta: "N/A", professor_oferta: "PATRICIA SANTANA", publico_oferta: "estudantes da Rede", vagas_oferta: "20", matriculados_oferta: "20" },
  { id_oferta: "13", id_utec: "1", ambiente: "SALA 1", turma_oferta: "13", status_oferta: "iniciado", titulo_de_oferta: "TRILHA EJA - TURMA MODULO 3 ESCOLA ALTO SANTA TEREZINHA", eixo_tematico: "Mundo Digital", turno_oferta: "Noite", dias_semana: "TERÇA", inicio_oferta: "03/03/2026", fim_oferta: "01/12/2026", ch_diaria_oferta: "2h", ch_total_oferta: "N/A", professor_oferta: "BIANCA MARTINS", publico_oferta: "estudantes da Rede", vagas_oferta: "20", matriculados_oferta: "20" },
  { id_oferta: "14", id_utec: "1", ambiente: "SALA 2", turma_oferta: "14", status_oferta: "iniciado", titulo_de_oferta: "TRILHA EDUCAÇÃO INFANTIL - GRUPO 5A - ESCOLA ALTO SANTA TEREZINHA", eixo_tematico: "Mundo Digital", turno_oferta: "Manhã", dias_semana: "QUARTA", inicio_oferta: "04/03/2026", fim_oferta: "31/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "EDSON", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "15", id_utec: "1", ambiente: "SALA 1", turma_oferta: "15", status_oferta: "iniciado", titulo_de_oferta: "TRILHA EDUCAÇÃO INFANTIL - GRUPO 4 A - ESCOLA ALTO SANTA TEREZINHA", eixo_tematico: "Mundo Digital", turno_oferta: "Manhã", dias_semana: "QUARTA", inicio_oferta: "04/03/2026", fim_oferta: "31/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "EDSON", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "16", id_utec: "1", ambiente: "SALA 1", turma_oferta: "16", status_oferta: "iniciado", titulo_de_oferta: "TRILHA ACELERAÇÃO/ ALFABETIZAÇÃO", eixo_tematico: "Mundo Digital", turno_oferta: "Manhã", dias_semana: "QUARTA", inicio_oferta: "04/03/2026", fim_oferta: "31/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "EDSON", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "17", id_utec: "1", ambiente: "SALA 1", turma_oferta: "17", status_oferta: "iniciado", titulo_de_oferta: "TRILHA TECNOLOGIA - 4 ANO B- ESCOLA SÃO JOÃO BATISTA", eixo_tematico: "Mundo Digital, Cultura Digital, Pensamento Computacional", turno_oferta: "Tarde", dias_semana: "QUARTA", inicio_oferta: "04/03/2026", fim_oferta: "31/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "BRENDA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "18", id_utec: "1", ambiente: "SALA 1", turma_oferta: "18", status_oferta: "iniciado", titulo_de_oferta: "TRILHA EDUCAÇÃO INFANTIL - GRUPO 5B - ESCOLA ALTO SANTA TEREZINHA", eixo_tematico: "Mundo Digital", turno_oferta: "Manhã", dias_semana: "QUARTA", inicio_oferta: "04/03/2026", fim_oferta: "31/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "PATRICIA SANTANA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "19", id_utec: "1", ambiente: "SALA 1", turma_oferta: "19", status_oferta: "iniciado", titulo_de_oferta: "TRILHA TECNOLOGIA - 5 ANO A- ESCOLA SÃO JOÃO BATISTA", eixo_tematico: "Mundo Digital, Cultura Digital, Pensamento Computacional", turno_oferta: "Manhã", dias_semana: "QUINTA", inicio_oferta: "05/03/2026", fim_oferta: "26/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "ANA PAULA ANDRADE", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "20", id_utec: "1", ambiente: "SALA 1", turma_oferta: "20", status_oferta: "iniciado", titulo_de_oferta: "TRILHA TECNOLOGIA - 3 ANO A - ESCOLA SÃO JOÃO BATISTA", eixo_tematico: "Cultura Digital", turno_oferta: "Manhã", dias_semana: "QUINTA", inicio_oferta: "05/03/2026", fim_oferta: "26/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "ANA PAULA ANDRADE", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "21", id_utec: "1", ambiente: "SALA 1", turma_oferta: "21", status_oferta: "iniciado", titulo_de_oferta: "TRILHA TECNOLOGIA - 3 ANO B - ESCOLA SÃO JOÃO BATISTA", eixo_tematico: "Cultura Digital", turno_oferta: "Manhã", dias_semana: "QUINTA", inicio_oferta: "05/03/2026", fim_oferta: "26/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "ANA PAULA ANDRADE", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "22", id_utec: "1", ambiente: "SALA 1", turma_oferta: "22", status_oferta: "iniciado", titulo_de_oferta: "TRILHA TECNOLOGIA - 4 ANO C - ESCOLA SÃO JOÃO BATISTA", eixo_tematico: "Mundo Digital, Cultura Digital, Pensamento Computacional", turno_oferta: "Tarde", dias_semana: "QUINTA", inicio_oferta: "05/03/2026", fim_oferta: "26/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "BRENDA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "23", id_utec: "1", ambiente: "SALA 1", turma_oferta: "23", status_oferta: "iniciado", titulo_de_oferta: "TRILHA TECNOLOGIA - 1 ANO C- ESCOLA ALTO SANTA TEREZINHA", eixo_tematico: "Mundo Digital", turno_oferta: "Tarde", dias_semana: "QUINTA", inicio_oferta: "05/03/2026", fim_oferta: "26/03/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "BRENDA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "24", id_utec: "1", ambiente: "SALA 1", turma_oferta: "24", status_oferta: "iniciado", titulo_de_oferta: "TRILHA TECNOLOGIA - 3 ANO D - ESCOLA SÃO JOÃO BATISTA", eixo_tematico: "Cultura Digital", turno_oferta: "Tarde", dias_semana: "SEXTA", inicio_oferta: "06/03/2026", fim_oferta: "27/12/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "PATRICIA SANTANA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "25", id_utec: "1", ambiente: "SALA 1", turma_oferta: "25", status_oferta: "iniciado", titulo_de_oferta: "TRILHA TECNOLOGIA - 1 ANO A- ESCOLA SÃO JOÃO BATISTA", eixo_tematico: "Mundo Digital", turno_oferta: "Manhã", dias_semana: "SEXTA", inicio_oferta: "06/03/2026", fim_oferta: "27/12/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "EDSON", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "26", id_utec: "1", ambiente: "SALA 1", turma_oferta: "26", status_oferta: "iniciado", titulo_de_oferta: "TRILHA TECNOLOGIA - 2 ANO B- ESCOLA SÃO JOÃO BATISTA", eixo_tematico: "Mundo Digital", turno_oferta: "Manhã", dias_semana: "SEXTA", inicio_oferta: "06/03/2026", fim_oferta: "27/12/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "EDSON", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "27", id_utec: "1", ambiente: "SALA 1", turma_oferta: "27", status_oferta: "iniciado", titulo_de_oferta: "TRILHA TECNOLOGIA - 4 ANO A- ESCOLA SÃO JOÃO BATISTA", eixo_tematico: "Mundo Digital, Cultura Digital, Pensamento Computacional", turno_oferta: "Manhã", dias_semana: "SEXTA", inicio_oferta: "06/03/2026", fim_oferta: "27/12/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "EDSON", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "28", id_utec: "1", ambiente: "SALA 1", turma_oferta: "28", status_oferta: "iniciado", titulo_de_oferta: "TRILHA TECNOLOGIA - 2 ANO C- ESCOLA SÃO JOÃO BATISTA", eixo_tematico: "Mundo Digital", turno_oferta: "Tarde", dias_semana: "SEXTA", inicio_oferta: "06/03/2026", fim_oferta: "27/12/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "PATRICIA SANTANA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "29", id_utec: "1", ambiente: "SALA 1", turma_oferta: "29", status_oferta: "iniciado", titulo_de_oferta: "TRILHA TECNOLOGIA - 1 ANO D- ESCOLA ALTO SANTA TEREZINHA", eixo_tematico: "Mundo Digital", turno_oferta: "Tarde", dias_semana: "SEXTA", inicio_oferta: "06/03/2026", fim_oferta: "27/12/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "PATRICIA SANTANA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "30", id_utec: "1", ambiente: "SALA 1", turma_oferta: "30", status_oferta: "iniciado", titulo_de_oferta: "TRILHA TECNOLOGIA - 3 ANO C - ESCOLA SÃO JOÃO BATISTA", eixo_tematico: "Cultura Digital", turno_oferta: "Tarde", dias_semana: "SEXTA", inicio_oferta: "06/03/2026", fim_oferta: "27/12/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "BRENDA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "31", id_utec: "1", ambiente: "SALA 2", turma_oferta: "31", status_oferta: "a iniciar", titulo_de_oferta: "CLUBE DE ROBÓTICA - EMAST NA UTEC (TURMA DE CONTRATURNO)", eixo_tematico: "Pensamento Computacional", turno_oferta: "Tarde", dias_semana: "TERÇA", inicio_oferta: "07/04/2026", fim_oferta: "26/05/2026", ch_diaria_oferta: "2h", ch_total_oferta: "N/A", professor_oferta: "PATRICIA SANTANA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "32", id_utec: "1", ambiente: "SALA 2", turma_oferta: "32", status_oferta: "a iniciar", titulo_de_oferta: "CLUBE DE CINEMA - EMAST NA UTEC (TURMA DE CONTRATURNO)", eixo_tematico: "Cultura Digital", turno_oferta: "Tarde", dias_semana: "QUINTA", inicio_oferta: "02/04/2026", fim_oferta: "28/05/2026", ch_diaria_oferta: "2h", ch_total_oferta: "N/A", professor_oferta: "PATRICIA SANTANA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "33", id_utec: "1", ambiente: "SALA 2", turma_oferta: "33", status_oferta: "a iniciar", titulo_de_oferta: "CLUBE VIDEOCAST - EMAST NA UTEC (TURMA DE CONTRATURNO)", eixo_tematico: "Cultura Digital", turno_oferta: "Tarde", dias_semana: "SEXTA", inicio_oferta: "03/04/2026", fim_oferta: "29/03/2026", ch_diaria_oferta: "2h", ch_total_oferta: "N/A", professor_oferta: "PATRICIA SANTANA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "34", id_utec: "1", ambiente: "SALA 2", turma_oferta: "34", status_oferta: "a iniciar", titulo_de_oferta: "CLUBE VIDEOCAST - EMMAFRE NA UTEC (TURMA DE CONTRATURNO)", eixo_tematico: "Cultura Digital", turno_oferta: "Tarde", dias_semana: "QUINTA", inicio_oferta: "02/04/2026", fim_oferta: "28/05/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "BRENDA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "35", id_utec: "1", ambiente: "SALA 2", turma_oferta: "35", status_oferta: "a iniciar", titulo_de_oferta: "CLUBE DE CINEMA - ESJB NA UTEC (TURMA DE CONTRATURNO)", eixo_tematico: "Cultura Digital", turno_oferta: "Tarde", dias_semana: "QUARTA", inicio_oferta: "24/03/2026", fim_oferta: "27/05/2026", ch_diaria_oferta: "2h", ch_total_oferta: "N/A", professor_oferta: "BRENDA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "36", id_utec: "1", ambiente: "SALA 2", turma_oferta: "36", status_oferta: "a iniciar", titulo_de_oferta: "CLUBE DE VIDEOCAST - ESJB NA UTEC (TURMA DE CONTRATURNO)", eixo_tematico: "Cultura Digital", turno_oferta: "Tarde", dias_semana: "QUARTA", inicio_oferta: "24/03/2026", fim_oferta: "27/05/2026", ch_diaria_oferta: "1h", ch_total_oferta: "N/A", professor_oferta: "BRENDA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" },
  { id_oferta: "37", id_utec: "1", ambiente: "SALA 2", turma_oferta: "37", status_oferta: "a iniciar", titulo_de_oferta: "CLUBE DE ROBÓTICA- ESJB NA UTEC (TURMA DE CONTRATURNO)", eixo_tematico: "Cultura Digital", turno_oferta: "Tarde", dias_semana: "SEXTA", inicio_oferta: "26/03/2026", fim_oferta: "29/05/2026", ch_diaria_oferta: "2h", ch_total_oferta: "N/A", professor_oferta: "BRENDA", publico_oferta: "estudantes da Rede", vagas_oferta: "25", matriculados_oferta: "25" }
];

export function parseOfertasRecords(
  rawOfertas: any[],
  utecs: UtecMetric[]
): OfertaCursoRecord[] {
  const dataToParse = (rawOfertas && rawOfertas.length > 0) ? rawOfertas : INITIAL_OFERTAS_RAW;

  return dataToParse.map((row, idx) => {
    const id = String(getRowVal(row, ["id_oferta", "id", "id_curso"])).trim() || `${idx + 1}`;
    const rawUtecId = String(getRowVal(row, ["id_utec", "utec_id", "utec"])).trim();
    const utecIdNorm = normalizeUtecId(rawUtecId);

    // Find matching UTEC or fallback
    const parentUtec = utecs.find(u => normalizeUtecId(u.id) === utecIdNorm) || utecs[0] || {
      id: 'utec-1',
      name: 'UTEC ALTO SANTA TEREZINHA',
      regional: 'Regional 1',
      rpaSede: 'RPA 2'
    };

    const ambiente = String(getRowVal(row, ["ambiente", "sala"])).trim() || "SALA 1";
    const turma_oferta = String(getRowVal(row, ["turma_oferta", "turma"])).trim() || `${idx + 1}`;
    const status_oferta = String(getRowVal(row, ["status_oferta", "status"])).trim() || "iniciado";
    const titulo_de_oferta = String(getRowVal(row, ["titulo_de_oferta", "titulo_oferta", "titulo", "nome_curso"])).trim() || "OFERTA DE CURSO";
    const eixo_tematico = String(getRowVal(row, ["eixo_tematico", "eixo"])).trim() || "Cultura Digital";
    const turno_oferta = String(getRowVal(row, ["turno_oferta", "turno"])).trim() || "Manhã";
    const dias_semana = String(getRowVal(row, ["dias_semana", "dias"])).trim() || "SEGUNDA";
    const inicio_oferta = String(getRowVal(row, ["inicio_oferta", "data_inicio"])).trim() || "01/03/2026";
    const fim_oferta = String(getRowVal(row, ["fim_oferta", "data_fim"])).trim() || "30/04/2026";
    const ch_diaria_oferta = String(getRowVal(row, ["ch_diaria_oferta", "ch_diaria"])).trim() || "2h";
    const ch_total_oferta = String(getRowVal(row, ["ch_total_oferta", "ch_total"])).trim() || "20h";
    const professor_oferta = String(getRowVal(row, ["professor_oferta", "professor", "instrutor"])).trim() || "DOCENTE UTEC";
    const publico_oferta = String(getRowVal(row, ["publico_oferta", "publico"])).trim() || "Comunidade";
    
    const vagasRaw = getRowVal(row, ["vagas_oferta", "vagas"]);
    const vagas_oferta = typeof vagasRaw === 'number' ? vagasRaw : parseInt(String(vagasRaw).replace(/\D/g, ''), 10) || 20;

    const matRaw = getRowVal(row, ["matriculados_oferta", "matriculados"]);
    const matriculados_oferta = typeof matRaw === 'number' ? matRaw : parseInt(String(matRaw).replace(/\D/g, ''), 10) || vagas_oferta;

    const concRaw = getRowVal(row, ["concluintes_oferta", "concluintes"]);
    const concluintes_oferta = typeof concRaw === 'number' ? concRaw : parseInt(String(concRaw).replace(/\D/g, ''), 10) || 0;

    const observacao_ementa_oferta = String(getRowVal(row, ["observacao_ementa_oferta", "observacao", "ementa"])).trim();

    return {
      id,
      id_utec: parentUtec.id,
      utecName: parentUtec.name,
      regional: parentUtec.regional || 'Regional 1',
      rpa: parentUtec.rpaSede || 'RPA 1',
      ambiente,
      turma_oferta,
      status_oferta,
      titulo_de_oferta,
      eixo_tematico,
      turno_oferta,
      dias_semana,
      inicio_oferta,
      fim_oferta,
      ch_diaria_oferta,
      ch_total_oferta,
      professor_oferta,
      publico_oferta,
      vagas_oferta,
      matriculados_oferta,
      concluintes_oferta,
      observacao_ementa_oferta
    };
  });
}
