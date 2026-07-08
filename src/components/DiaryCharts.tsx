import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, CheckCircle2, Building2, Users, AlertCircle } from 'lucide-react';

interface DiaryChartsProps {
  chartPlanejamentosPorUtec: { name: string; value: number }[];
  chartCategoriasPie: { name: string; value: number; color: string }[];
  totalCategoriasCount: number;
  chartPreenchimentoPorEscola: { name: string; value: number }[];
  chartTopProfessores: { name: string; value: number }[];
}

export default function DiaryCharts({
  chartPlanejamentosPorUtec,
  chartCategoriasPie,
  totalCategoriasCount,
  chartPreenchimentoPorEscola,
  chartTopProfessores,
}: DiaryChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="diary-bento-charts-grid">
      {/* Chart 1: Distribuição de Planejamentos por UTEC */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5 uppercase">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Planejamentos por UTEC de Suporte
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
            Total acumulado de diários agrupados por UTEC • Arraste para o lado para ver todos
          </p>
        </div>

        <div className="w-full overflow-x-auto pb-2 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent" id="diary-utec-chart-scroll-wrapper">
          <div style={{ width: '1000px', height: '220px' }} id="diary-utec-chart-scroll-content">
            {chartPlanejamentosPorUtec.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartPlanejamentosPorUtec} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="opacity-40" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 9, fontWeight: '700', fill: '#64748B' }} 
                    axisLine={false} 
                    tickLine={false} 
                    interval={0}
                    tickFormatter={(val) => val.replace('UTEC ', '')}
                  />
                  <YAxis tick={{ fontSize: 9, fontWeight: '600', fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.04)' }} contentStyle={{ fontSize: '11px', background: '#0F172A', color: '#FFF', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    {chartPlanejamentosPorUtec.map((entry, index) => {
                      const colors = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[10px] font-semibold uppercase">Sem dados</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart 2: Categoria de Diário (Donut) */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5 uppercase">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            Atividades por Categorias
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
            Distribuição percentual dos tipos de diários preenchidos
          </p>
        </div>

        <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
          <div className="w-[140px] h-[140px] relative flex-shrink-0">
            {chartCategoriasPie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartCategoriasPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartCategoriasPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '10px', background: '#0F172A', color: '#FFF' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full border border-dashed border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase">Sem dados</div>
            )}

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-lg font-semibold text-slate-800 dark:text-slate-100 leading-none">{totalCategoriasCount}</span>
              <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">Ações</span>
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-[150px]">
            {chartCategoriasPie.map((item) => {
              const percentage = totalCategoriasCount > 0 ? ((item.value / totalCategoriasCount) * 100).toFixed(1) : '0';
              return (
                <div key={item.name} className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-400 truncate text-[10px]">{item.name}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[10px] font-semibold">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart 3: Top 8 Escolas em Preenchimento */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5 uppercase">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Unidades de Ensino Mais Atendidas (TOP 8)
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
            Ranking de escolas com maior volume de interações computadas
          </p>
        </div>

        <div className="h-[210px] w-full">
          {chartPreenchimentoPorEscola.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartPreenchimentoPorEscola} margin={{ top: 10, right: 10, left: -25, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="opacity-40" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 8, fontWeight: '700', fill: '#64748B' }} 
                  angle={-15} 
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: '10px', background: '#0F172A', color: '#FFF' }} />
                <Bar dataKey="value" fill="#0D9488" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <AlertCircle className="w-6 h-6 mb-1 text-slate-300" />
              <span className="text-[10px] font-bold uppercase">Nenhum preenchimento registrado</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart 4: Top 5 Professores com Atividades */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5 uppercase">
            <Users className="w-4 h-4 text-pink-600" />
            Desempenho dos Multiplicadores (TOP 5)
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
            Total de diários cadastrados por profissional técnico
          </p>
        </div>

        <div className="h-[210px] w-full">
          {chartTopProfessores.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartTopProfessores} layout="vertical" margin={{ top: 5, right: 15, left: 45, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" className="opacity-40" />
                <XAxis type="number" tick={{ fontSize: 9, fontWeight: '600', fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fontWeight: '700', fill: '#64748B' }} width={90} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '10px', background: '#0F172A', color: '#FFF' }} />
                <Bar dataKey="value" fill="#EC4899" radius={[0, 4, 4, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-[10px] font-bold uppercase">Sem registros computados</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
