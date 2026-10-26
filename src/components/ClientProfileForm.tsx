import React from 'react';
import { User, Car, DollarSign, CheckSquare, ListOrdered, CreditCard, Wand2 } from 'lucide-react';
import { ClientProfile } from '../types/insurance';

interface ClientProfileFormProps {
  profile: ClientProfile;
  onChange: (updated: ClientProfile) => void;
  onLoadSampleProfile: () => void;
}

export const ClientProfileForm: React.FC<ClientProfileFormProps> = ({
  profile,
  onChange,
  onLoadSampleProfile,
}) => {
  const handleTextChange = (field: keyof ClientProfile, value: any) => {
    onChange({
      ...profile,
      [field]: value,
    });
  };

  const handleCheckboxToggle = (
    coverageKey: keyof ClientProfile['mandatoryCoverages']
  ) => {
    onChange({
      ...profile,
      mandatoryCoverages: {
        ...profile.mandatoryCoverages,
        [coverageKey]: !profile.mandatoryCoverages[coverageKey],
      },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0d223f] text-white text-xs font-bold">
              2
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Perfil del Cliente
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 ml-8">
            Define las restricciones presupuestarias y necesidades particulares del asegurado.
          </p>
        </div>

        <button
          type="button"
          onClick={onLoadSampleProfile}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer self-start sm:self-auto"
          title="Autocompletar con el perfil del caso académico (Laura Solís Vargas)"
        >
          <Wand2 className="w-3.5 h-3.5 text-blue-600" />
          Rellenar perfil de ejemplo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Nombre */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Nombre del cliente <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleTextChange('name', e.target.value)}
              placeholder="Ej. Laura Solís Vargas"
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f2e56] focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Vehículo y uso */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Vehículo y uso <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Car className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={profile.vehicleAndUse}
              onChange={(e) => handleTextChange('vehicleAndUse', e.target.value)}
              placeholder="Ej. Toyota Corolla XEi 2022, Particular"
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f2e56] focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Presupuesto máximo anual */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Presupuesto máximo anual (colones) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
              ₡
            </div>
            <input
              type="number"
              min={0}
              step={5000}
              value={profile.maxBudget || ''}
              onChange={(e) => handleTextChange('maxBudget', parseFloat(e.target.value) || 0)}
              placeholder="400000"
              className="w-full pl-9 pr-28 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f2e56] focus:bg-white text-slate-900 font-semibold transition-all placeholder:text-slate-400"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-slate-500">
              ₡ {Number(profile.maxBudget || 0).toLocaleString('es-CR')}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Límite anual con impuestos para validar "Cabe en presupuesto".
          </p>
        </div>

        {/* Forma de pago preferida */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Forma de pago preferida
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <select
              value={profile.paymentMethod}
              onChange={(e) => handleTextChange('paymentMethod', e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f2e56] focus:bg-white text-slate-900 transition-all appearance-none cursor-pointer"
            >
              <option value="Cuotas mensuales">Cuotas mensuales</option>
              <option value="Anual de contado">Anual de contado</option>
              <option value="Semestral">Semestral</option>
              <option value="Indiferente / La más conveniente">Indiferente / La más conveniente</option>
            </select>
          </div>
        </div>

        {/* Coberturas obligatorias (Casillas) */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Coberturas obligatorias requeridas por el cliente
          </label>
          <p className="text-xs text-slate-500 mb-2.5">
            Marca las coberturas que deben estar incluidas en la prima base sin cobro adicional. Si falta alguna o requiere paquete opcional de pago extra, no cumplirá obligatorias.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {[
              {
                id: 'colision',
                label: 'Colisión y vuelco',
                desc: 'Daños propios al vehículo',
              },
              {
                id: 'robo',
                label: 'Robo',
                desc: 'Robo total o parcial',
              },
              {
                id: 'asistencia_24_7',
                label: 'Asistencia vial 24/7',
                desc: 'Mecánica, batería, llanta',
              },
              {
                id: 'fenomenos_naturales',
                label: 'Fenómenos naturales',
                desc: 'Inundación, árboles, deslizamiento',
              },
              {
                id: 'vehiculo_sustituto',
                label: 'Vehículo sustituto',
                desc: 'Auto de reemplazo temporal',
              },
            ].map((item) => {
              const isChecked = profile.mandatoryCoverages[item.id as keyof ClientProfile['mandatoryCoverages']];
              return (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-blue-50/80 border-[#0f2e56] shadow-2xs'
                      : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() =>
                      handleCheckboxToggle(item.id as keyof ClientProfile['mandatoryCoverages'])
                    }
                    className="mt-0.5 h-4 w-4 rounded text-[#0f2e56] focus:ring-[#0f2e56] border-slate-300 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-slate-500 block leading-tight">
                      {item.desc}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Prioridades (Área de texto) */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Prioridades del cliente
          </label>
          <textarea
            rows={2}
            value={profile.priorities}
            onChange={(e) => handleTextChange('priorities', e.target.value)}
            placeholder="Ej. Vive cerca de un río propenso a crecidas por lo que exige cobertura de inundación; requiere grúa sin límites y no desea deducibles muy elevados."
            className="w-full px-3.5 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f2e56] focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>
    </div>
  );
};
