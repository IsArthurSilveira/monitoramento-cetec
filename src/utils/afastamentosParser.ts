import { AfastamentoRecord, UtecMetric } from '../types';

// Helper to retrieve value from a spreadsheet row using multiple synonym column names
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
  if (!id) return '';
  const str = String(id).trim().toLowerCase();
  if (str.startsWith('utec-') || str.startsWith('utec_')) return str.replace('_', '-');
  if (/^\d+$/.test(str)) return `utec-${str}`;
  return str;
}

export function parseAfastamentosRecords(
  rawAfastamentos: any[],
  rawQuadroFuncional: any[],
  utecs: UtecMetric[]
): AfastamentoRecord[] {
  const staffList: Array<{
    nameNormalized: string;
    rawName: string;
    cargo: string;
    matricula: string;
    utecId: string;
    utecName: string;
    regional: string;
    rpa: string;
  }> = [];

  const normalizeStr = (s: string) => 
    s ? String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim() : "";

  // 1. Map staff from utecs
  utecs.forEach(u => {
    (u.staff || []).forEach(st => {
      if (st.name) {
        staffList.push({
          nameNormalized: normalizeStr(st.name),
          rawName: st.name,
          cargo: st.role || 'Profissional UTEC',
          matricula: st.matricula || 'N/A',
          utecId: u.id,
          utecName: u.name,
          regional: u.regional || 'Regional 1',
          rpa: u.rpaSede || 'RPA 1'
        });
      }
    });
  });

  // 2. Map staff from rawQuadroFuncional
  rawQuadroFuncional.forEach(q => {
    const qName = String(getRowVal(q, ["nome_funcionario_utecs", "nome_funcionario", "nome"])).trim();
    if (!qName) return;
    const norm = normalizeStr(qName);
    const existing = staffList.find(s => s.nameNormalized === norm);
    if (!existing) {
      const qUtecIdRaw = String(getRowVal(q, ["utec_id", "id_utec"])).trim();
      const qUtecId = qUtecIdRaw ? normalizeUtecId(qUtecIdRaw) : "";
      const parentUtec = utecs.find(u => normalizeUtecId(u.id) === qUtecId) || utecs[0];
      staffList.push({
        nameNormalized: norm,
        rawName: qName,
        cargo: String(getRowVal(q, ["funcao_funcionario_utecs", "funcao", "cargo"])).trim() || 'Profissional UTEC',
        matricula: String(getRowVal(q, ["matricula_funcionario_utecs", "matricula"])).trim() || 'N/A',
        utecId: parentUtec ? parentUtec.id : 'utec-1',
        utecName: parentUtec ? parentUtec.name : 'UTEC GERAL',
        regional: parentUtec ? parentUtec.regional : 'Regional 1',
        rpa: parentUtec ? parentUtec.rpaSede : 'RPA 1'
      });
    }
  });

  // Current system date reference (e.g. today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNamesMap: { [m: string]: number } = {
    'janeiro': 1, 'fevereiro': 2, 'marco': 3, 'abril': 4,
    'maio': 5, 'junho': 6, 'julho': 7, 'agosto': 8,
    'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12
  };

  const parseDateStr = (raw: string, mesCtx?: string): { formatted: string; dateObj: Date | null } => {
    if (!raw) return { formatted: '', dateObj: null };
    let cleaned = String(raw).replace(/\/\//g, '/').trim();
    
    // ISO YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
      const parts = cleaned.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return { formatted: `${parts[2]}/${parts[1]}/${parts[0]}`, dateObj: d };
    }

    const match = cleaned.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    if (!match) return { formatted: cleaned, dateObj: null };

    let p1 = parseInt(match[1], 10);
    let p2 = parseInt(match[2], 10);
    let year = parseInt(match[3], 10);
    if (year < 100) year += 2000;
    if (year < 2020) year = 2026; // Auto fix year typos e.g. 2016 -> 2026

    let month = p1;
    let day = p2;

    const ctxNorm = mesCtx ? normalizeStr(mesCtx) : "";
    const ctxMonthNum = monthNamesMap[ctxNorm];

    if (p1 > 12) {
      day = p1;
      month = p2;
    } else if (p2 > 12) {
      day = p2;
      month = p1;
    } else if (ctxMonthNum) {
      if (p1 === ctxMonthNum) {
        month = p1;
        day = p2;
      } else if (p2 === ctxMonthNum) {
        month = p2;
        day = p1;
      }
    }

    const d = new Date(year, month - 1, day);
    return { formatted: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`, dateObj: d };
  };

  return rawAfastamentos
    .filter(row => {
      const nome = String(getRowVal(row, ["nome_funcionario_afastamento", "nome_funcionario", "nome"])).trim();
      const inicio = String(getRowVal(row, ["data_inicio_afastamento", "data_inicio"])).trim();
      const tipo = String(getRowVal(row, ["tipo_afastamento", "tipo"])).trim();
      return Boolean(nome || inicio || tipo);
    })
    .map((row, idx) => {
      const idAfast = String(getRowVal(row, ["id_afastamento", "id"])).trim() || `afast-${idx + 1}`;
      const nomeFunc = String(getRowVal(row, ["nome_funcionario_afastamento", "nome_funcionario", "nome"])).trim() || "Servidor / Colaborador";
      const mesAfast = String(getRowVal(row, ["mes_afastamento", "mes"])).trim();
      const rawStart = String(getRowVal(row, ["data_inicio_afastamento", "data_inicio"])).trim();
      const rawEnd = String(getRowVal(row, ["previsao_retorno_afastamento", "previsao_retorno", "data_fim"])).trim();
      const tipoAfastRaw = String(getRowVal(row, ["tipo_afastamento", "tipo"])).trim();
      const diasRaw = String(getRowVal(row, ["perido_dias_afastamento", "periodo_dias_afastamento", "dias_afastado", "dias"])).trim();
      const obsRaw = String(getRowVal(row, ["observacao_afastamento", "observacao"])).trim();

      // Normalize tipo afastamento
      let tipoAfast: AfastamentoRecord['tipoAfastamento'] = 'Outros';
      const tNorm = normalizeStr(tipoAfastRaw);
      if (tNorm.includes('medica') || tNorm.includes('atestado') || tNorm.includes('saude')) {
        tipoAfast = 'Licença Médica';
      } else if (tNorm.includes('maternidade') || tNorm.includes('paternidade')) {
        tipoAfast = 'Licença Maternidade/Paternidade';
      } else if (tNorm.includes('ferias')) {
        tipoAfast = 'Férias';
      } else if (tNorm.includes('premio')) {
        tipoAfast = 'Licença Prêmio';
      } else if (tNorm.includes('preventivo')) {
        tipoAfast = 'Afastamento Preventivo';
      } else {
        tipoAfast = 'Outros';
      }

      // Match staff member by name in quadro_funcional / utecs
      const normName = normalizeStr(nomeFunc);
      let matchedStaff = staffList.find(s => s.nameNormalized === normName);
      if (!matchedStaff && normName.length > 5) {
        matchedStaff = staffList.find(s => 
          s.nameNormalized.includes(normName) || normName.includes(s.nameNormalized)
        );
      }

      const defaultUtec = utecs[0] || { id: 'utec-1', name: 'UTEC BOA VIAGEM', regional: 'Regional 1', rpaSede: 'RPA 6' };

      const utecId = matchedStaff ? matchedStaff.utecId : defaultUtec.id;
      const utecName = matchedStaff ? matchedStaff.utecName : defaultUtec.name;
      const regional = matchedStaff ? matchedStaff.regional : defaultUtec.regional;
      const rpa = matchedStaff ? matchedStaff.rpa : defaultUtec.rpaSede;
      const matricula = matchedStaff ? matchedStaff.matricula : `${100 + idx}.${Math.floor(100 + Math.random() * 899)}-1`;

      let cargo = matchedStaff ? matchedStaff.cargo : 'Servidor / Colaborador';
      if (obsRaw && (obsRaw.toUpperCase().includes('PROFESSOR') || obsRaw.toUpperCase().includes('MULTIPLICADOR') || obsRaw.toUpperCase().includes('GESTOR') || obsRaw.toUpperCase().includes('COORDENADOR') || obsRaw.toUpperCase().includes('VICE'))) {
        cargo = obsRaw;
      }

      const parsedStart = parseDateStr(rawStart, mesAfast);
      const parsedEnd = parseDateStr(rawEnd, mesAfast);

      const startDateObj = parsedStart.dateObj;
      const endDateObj = parsedEnd.dateObj;

      let diasNum = parseInt(diasRaw.replace(/\D/g, ''), 10);
      if (isNaN(diasNum) || diasNum <= 0) {
        if (startDateObj && endDateObj) {
          const diffMs = Math.abs(endDateObj.getTime() - startDateObj.getTime());
          diasNum = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        } else {
          diasNum = 1;
        }
      }

      // Status calculation based on reference system date (today)
      let status: AfastamentoRecord['status'] = 'Ativo';
      if (endDateObj) {
        if (endDateObj < today) {
          status = 'Concluído';
        } else {
          const diffDaysToReturn = Math.ceil((endDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDaysToReturn >= 0 && diffDaysToReturn <= 15) {
            status = 'Próximo do Retorno';
          } else {
            status = 'Ativo';
          }
        }
      } else if (startDateObj && startDateObj < today) {
        status = 'Concluído';
      }

      const formattedDataInicio = startDateObj 
        ? `${startDateObj.getFullYear()}-${String(startDateObj.getMonth() + 1).padStart(2, '0')}-${String(startDateObj.getDate()).padStart(2, '0')}`
        : rawStart;
      const formattedDataFim = endDateObj 
        ? `${endDateObj.getFullYear()}-${String(endDateObj.getMonth() + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`
        : rawEnd;

      return {
        id: idAfast,
        nomeProfissional: nomeFunc,
        matricula,
        cargo,
        utecId,
        utecName,
        regional,
        rpa,
        tipoAfastamento: tipoAfast,
        dataInicio: formattedDataInicio,
        dataFim: formattedDataFim,
        diasAfastado: diasNum,
        status,
        observacao: obsRaw || (mesAfast ? `Mês de referência: ${mesAfast}` : undefined)
      };
    });
}
