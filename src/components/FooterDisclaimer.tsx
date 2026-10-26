import React from 'react';
import { AlertCircle } from 'lucide-react';

export const FooterDisclaimer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-slate-200/90 bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2.5 text-center text-xs text-slate-500 max-w-3xl mx-auto">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="font-medium text-slate-600">
            Borrador generado con IA. Debe ser validado por un asesor contra las condiciones reales de la póliza. No suba datos reales de clientes.
          </p>
        </div>
      </div>
    </footer>
  );
};
