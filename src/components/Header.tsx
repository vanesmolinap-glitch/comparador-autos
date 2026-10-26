import React from 'react';
import { ShieldCheck, FileSpreadsheet, Sparkles, User, LogOut } from 'lucide-react';
import { AuthUser } from '../types/insurance';

interface HeaderProps {
  user?: AuthUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-gradient-to-r from-[#0d223f] via-[#0f2e56] to-[#123868] text-white border-b border-blue-950/40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-400 shrink-0 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  BN Corredora de Seguros
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Asistente IA
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
                Comparador de Propuestas BN
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 font-normal mt-0.5 max-w-2xl">
                Compara propuestas de seguro de automóvil en minutos. La IA prepara, el asesor decide.
              </p>
            </div>
          </div>

          {/* Right section: User Status & Logout Button */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            {user ? (
              <div className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left pr-2">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white leading-tight">
                      {user.nombre}
                    </p>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 capitalize">
                      {user.rol}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-200/80 leading-tight">
                    @{user.usuario}
                  </p>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 hover:text-white border border-red-400/30 transition-all cursor-pointer ml-1"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-xs text-blue-200/80 bg-white/5 border border-white/10 rounded-lg px-3.5 py-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Análisis Multimodal de Pólizas</p>
                  <p className="text-[11px] text-blue-200/70">Lectura directa de condiciones PDF</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
