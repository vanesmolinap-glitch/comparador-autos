import React from 'react';
import { Loader2, Sparkles, FileSearch, ShieldCheck } from 'lucide-react';

interface AnalyzingOverlayProps {
  proposalCount: number;
}

export const AnalyzingOverlay: React.FC<AnalyzingOverlayProps> = ({ proposalCount }) => {
  return (
    <div className="fixed inset-0 bg-[#0d223f]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-600 animate-pulse" />

        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0f2e56] mx-auto flex items-center justify-center mb-4 shadow-inner relative">
          <FileSearch className="w-8 h-8 text-[#0f2e56]" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-1">
          Analizando propuestas...
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mb-6">
          Gemini está extrayendo los términos contractuales de {proposalCount} {proposalCount === 1 ? 'cotización' : 'cotizaciones'} en PDF y cotejando contra el perfil del cliente.
        </p>

        <div className="space-y-2.5 text-left bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
          <div className="flex items-center gap-2.5 text-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Extracción estricta sin suposiciones de primas y deducibles</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping delay-100" />
            <span>Verificación de asistencias y coberturas obligatorias</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping delay-200" />
            <span>Cálculo de semáforos, recomendación y borrador WhatsApp</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-4 italic">
          BN Corredora de Seguros · Inteligencia Artificial al servicio del asesor
        </p>
      </div>
    </div>
  );
};
