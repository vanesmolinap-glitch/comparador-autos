import React, { useState } from 'react';
import { Copy, Check, MessageSquare, Award, RefreshCw, FileText } from 'lucide-react';

interface RecommendationCardsProps {
  recommendation: string;
  whatsappMessage: string;
  onNewComparison: () => void;
}

export const RecommendationCards: React.FC<RecommendationCardsProps> = ({
  recommendation,
  whatsappMessage,
  onNewComparison,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cuadro 1: Recomendación preliminar (borrador) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#0f2e56]/10 text-[#0f2e56] rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Recomendación preliminar (borrador)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Criterio técnico de asegurabilidad y prioridades
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                Uso interno asesor
              </span>
            </div>

            <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-4 font-normal text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {recommendation || 'Procesando recomendación técnica...'}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 italic flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Justificación basada en montos reales y coberturas obligatorias.
          </p>
        </div>

        {/* Cuadro 2: Mensaje sugerido para el cliente (WhatsApp) */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-200/90 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Mensaje sugerido para el cliente (WhatsApp)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Redacción cordial y sin tecnicismos (máx. 8 líneas)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyMessage}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                }`}
                title="Copiar texto para enviar por WhatsApp"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar mensaje
                  </>
                )}
              </button>
            </div>

            {/* WhatsApp bubble style display */}
            <div className="bg-[#f0f7f4] border border-emerald-200/80 rounded-xl p-4 text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line shadow-2xs relative">
              <div className="text-[10px] uppercase font-bold text-emerald-800/80 tracking-wider mb-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Plantilla WhatsApp
              </div>
              {whatsappMessage || 'Generando redacción sugerida...'}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2">
            <span className="text-[11px] text-slate-400">
              Sin tecnicismos · Listo para enviar al cliente
            </span>
            <button
              type="button"
              onClick={handleCopyMessage}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" /> {copied ? 'Copiado al portapapeles' : 'Copiar al portapapeles'}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons: Copiar mensaje y Nueva comparación */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleCopyMessage}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Mensaje copiado' : 'Copiar mensaje de WhatsApp'}
        </button>

        <button
          type="button"
          onClick={onNewComparison}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-300 shadow-2xs transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          Nueva comparación
        </button>
      </div>
    </div>
  );
};
