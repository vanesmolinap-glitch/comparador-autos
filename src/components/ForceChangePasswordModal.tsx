import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { AuthUser } from '../types/insurance';

interface ForceChangePasswordModalProps {
  user: AuthUser;
  onPasswordChanged: (updatedUser: AuthUser) => void;
  onLogout: () => void;
}

export const ForceChangePasswordModal: React.FC<ForceChangePasswordModalProps> = ({
  user,
  onPasswordChanged,
  onLogout,
}) => {
  const [nuevaClave, setNuevaClave] = useState('');
  const [confirmacionClave, setConfirmacionClave] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasMinLength = nuevaClave.length >= 8;
  const hasNumber = /\d/.test(nuevaClave);
  const passwordsMatch = nuevaClave.length > 0 && nuevaClave === confirmacionClave;
  const isValid = hasMinLength && hasNumber && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isValid) {
      if (!hasMinLength || !hasNumber) {
        setErrorMsg('La contraseña debe tener al menos 8 caracteres y contener al menos un número.');
      } else if (!passwordsMatch) {
        setErrorMsg('Las contraseñas no coinciden.');
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/cambiar-clave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ contrasenaNueva: nuevaClave }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo actualizar la contraseña.');
      }

      onPasswordChanged(data.user);
    } catch (err: any) {
      console.error('Error changing password:', err);
      setErrorMsg(err.message || 'Error al actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a1e36]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 mx-auto flex items-center justify-center mb-3 shadow-inner">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Cambio de contraseña obligatorio
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
            Hola <span className="font-bold text-slate-900">{user.nombre}</span>. Por política de seguridad institucional, debes cambiar tu contraseña temporal antes de continuar.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Nueva contraseña
            </label>
            <input
              type="password"
              required
              value={nuevaClave}
              onChange={(e) => setNuevaClave(e.target.value)}
              placeholder="Mínimo 8 caracteres con un número"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f2e56] focus:bg-white text-slate-900 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              required
              value={confirmacionClave}
              onChange={(e) => setConfirmacionClave(e.target.value)}
              placeholder="Repite la nueva contraseña"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f2e56] focus:bg-white text-slate-900 transition-all font-medium"
            />
          </div>

          {/* Requirements checklist */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              {hasMinLength ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className={hasMinLength ? 'text-emerald-700 font-medium' : ''}>
                Mínimo 8 caracteres
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasNumber ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className={hasNumber ? 'text-emerald-700 font-medium' : ''}>
                Al menos un número (0-9)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {passwordsMatch ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className={passwordsMatch ? 'text-emerald-700 font-medium' : ''}>
                Las contraseñas coinciden
              </span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0d223f] to-[#123868] hover:from-[#0a1b32] hover:to-[#0f2e56] text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Guardando contraseña...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Guardar y continuar</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full text-xs text-slate-500 hover:text-slate-800 py-1.5 transition-colors cursor-pointer text-center block"
            >
              Cancelar y cerrar sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
