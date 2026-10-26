import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { AuthUser } from '../types/insurance';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUser = usuario.trim().toLowerCase();
    if (!cleanUser || !contrasena) {
      setErrorMsg('usuario o contraseña incorrectos');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ usuario: cleanUser, contrasena }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Display clear messages as required:
        // "usuario o contraseña incorrectos" or "usuario suspendido, contacte al administrador"
        if (data.error) {
          setErrorMsg(data.error);
        } else {
          setErrorMsg('usuario o contraseña incorrectos');
        }
        return;
      }

      if (data.success && data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg('Error de conexión con el servidor. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#0a1e36] via-[#0d284c] to-[#123663] px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 mb-4 shadow-inner">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="inline-block px-3 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-2">
            BN Corredora de Seguros
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Comparador de Propuestas BN
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-sm mx-auto">
            Acceso exclusivo para asesores y personal autorizado
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-6 sm:p-8">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Iniciar sesión</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ingresa tus credenciales institucionales para acceder al comparador.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs sm:text-sm text-red-800"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-semibold">
                {errorMsg}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuario */}
            <div>
              <label
                htmlFor="usuario"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="usuario"
                  type="text"
                  required
                  autoComplete="username"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="ej. admin"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f2e56] focus:bg-white text-slate-900 transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="contrasena"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="contrasena"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f2e56] focus:bg-white text-slate-900 transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0d223f] via-[#0f2e56] to-[#123868] hover:from-[#0a1b32] hover:to-[#0f2e56] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    <span>Entrar</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick initial helper hint */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Credenciales iniciales: usuario <span className="font-mono text-slate-600 bg-slate-100 px-1 py-0.5 rounded">admin</span> y contraseña temporal <span className="font-mono text-slate-600 bg-slate-100 px-1 py-0.5 rounded">Fundepos2026*</span>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-blue-200/60 mt-6">
          Sesión segura cifrada con bcrypt · Válida por 8 horas · Acceso restringido
        </p>
      </div>
    </div>
  );
};
