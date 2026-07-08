import React from 'react';
import { X, FileText, Calendar, Landmark, Info, Sparkles, BookOpen, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DiaryRecord } from '../types';

interface DiaryDetailModalProps {
  isOpen: boolean;
  record: DiaryRecord | null;
  onClose: () => void;
}

export default function DiaryDetailModal({ isOpen, record, onClose }: DiaryDetailModalProps) {
  return (
    <AnimatePresence>
      {isOpen && record && (
        <div 
          id="diary-detail-modal-overlay" 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop with fade transition */}
          <motion.div
            id="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0F172A]/75 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Card with spring slide-up zoom transition */}
          <motion.div
            id="diary-detail-modal-card"
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col z-10"
            onClick={(e) => e.stopPropagation()}
          >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider">
                Ficha de Atendimento do Multiplicador
              </h3>
              <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                Protocolo: {record.protocolo || 'N/A'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-semibold scrollbar-thin flex-1">
          
          {/* Identificação */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest border-b pb-1 border-slate-200 dark:border-slate-800 flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5" /> Identificação & Localização
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <div>
                <span className="block text-[9px] text-slate-400 uppercase font-semibold">Multiplicador Solicitante</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{record.solicitante}</span>
                {record.matriculaSolicitante && (
                  <span className="block text-[10px] text-slate-400 font-mono font-medium">Matrícula: {record.matriculaSolicitante}</span>
                )}
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 uppercase font-semibold">Data de Ocorrência</span>
                <span className="text-slate-800 dark:text-slate-300 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {record.dataOcorrencia}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="block text-[9px] text-slate-400 uppercase font-semibold">Unidade de Ensino Atendida</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{record.escolaNome}</span>
                {record.escolaInep && (
                  <span className="block text-[10px] text-slate-400 font-mono font-medium">Código INEP: {record.escolaInep}</span>
                )}
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 uppercase font-semibold">UTEC de Apoio / Responsável</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{record.utecName}</span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 uppercase font-semibold">Categoria de Atendimento</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{record.categoria}</span>
              </div>
            </div>
          </div>

          {/* Atividade */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b pb-1 border-slate-200 dark:border-slate-800 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Detalhamento da Atividade
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              {record.temaDaAtividade && (
                <div className="sm:col-span-2">
                  <span className="block text-[9px] text-slate-400 uppercase font-semibold">Tema da Atividade</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{record.temaDaAtividade}</span>
                </div>
              )}
              <div>
                <span className="block text-[9px] text-slate-400 uppercase font-semibold">Turnos de Atendimento</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">
                  {[record.turno1, record.turno2, record.turno3].filter(Boolean).join(', ') || 'Não especificado'}
                </span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 uppercase font-semibold">Local</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{record.local || 'Não especificado'}</span>
              </div>
              {record.atividadesDesenvolvidas && (
                <div className="sm:col-span-2">
                  <span className="block text-[9px] text-slate-400 uppercase font-semibold">Atividades Desenvolvidas</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap leading-relaxed mt-1 bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                    {record.atividadesDesenvolvidas}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Impacto */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border-b pb-1 border-slate-200 dark:border-slate-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Impacto e Engajamento
            </h4>
            <div className="grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <div>
                <span className="block text-[9px] text-slate-400 uppercase font-semibold">Professores Impactados</span>
                <span className="text-slate-800 dark:text-slate-100 font-semibold text-sm">{record.qtdProfessores}</span>
                {record.engajamentoProfessores && record.engajamentoProfessores !== 'Não se aplica' && (
                  <span className="block text-[10px] text-slate-500 font-medium">Engajamento: {record.engajamentoProfessores}</span>
                )}
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 uppercase font-semibold">Estudantes Impactados</span>
                <span className="text-slate-800 dark:text-slate-100 font-semibold text-sm">{record.qtdEstudantes}</span>
                {record.engajamentoEstudantes && record.engajamentoEstudantes !== 'Não se aplica' && (
                  <span className="block text-[10px] text-slate-500 font-medium">Engajamento: {record.engajamentoEstudantes}</span>
                )}
              </div>
              {record.grupoImpacto && (
                <div className="col-span-2">
                  <span className="block text-[9px] text-slate-400 uppercase font-semibold">Grupo Impactado</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{record.grupoImpacto}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recursos */}
          {(record.redsFisicos || record.softwares) && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold text-amber-600 dark:text-amber-450 uppercase tracking-widest border-b pb-1 border-slate-200 dark:border-slate-800 flex items-center gap-1">
                <PenTool className="w-3.5 h-3.5" /> Recursos & Tecnologias
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                {record.redsFisicos && (
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase font-semibold">Recursos Físicos / Hardware</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{record.redsFisicos}</span>
                  </div>
                )}
                {record.softwares && (
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase font-semibold">Mídias & Softwares</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{record.softwares}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Observações e Ocorrências */}
          {(record.observacao || record.observacoes || record.ocorrencia) && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-widest border-b pb-1 border-slate-200 dark:border-slate-800 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Observações & Intercorrências
              </h4>
              <div className="bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2.5">
                {(record.observacao || record.observacoes) && (
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase font-semibold">Observação Técnica</span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {record.observacao || record.observacoes}
                    </p>
                  </div>
                )}
                {record.ocorrencia && (
                  <div>
                    <span className="block text-[9px] text-rose-500 uppercase font-semibold">Descrição da Ocorrência</span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-rose-50/40 dark:bg-rose-950/10 p-2.5 rounded border border-rose-100 dark:border-rose-950/30 text-rose-800 dark:text-rose-300">
                      {record.ocorrencia}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400">
          <span>Sincronizado: {record.dataCarimbo || record.dataOcorrencia}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-semibold tracking-wide uppercase transition-all cursor-pointer"
          >
            Fechar Ficha
          </button>
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
