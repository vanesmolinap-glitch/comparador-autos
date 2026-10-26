import React from 'react';
import { ProposalComparison } from '../types/insurance';
import { Check, X, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';

interface ComparisonTableProps {
  proposals: ProposalComparison[];
  clientBudget: number;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  proposals,
  clientBudget,
}) => {
  if (!proposals || proposals.length === 0) return null;

  // Exact 14 rows requested by user prompt
  const rows = [
    {
      id: 'primaAnual',
      label: 'Prima anual',
      sublabel: 'Total con impuestos',
      render: (p: ProposalComparison) => (
        <div>
          <span className="text-base font-extrabold text-slate-900">
            {p.primaAnual || 'no indicado'}
          </span>
          {p.numeroCotizacion && p.numeroCotizacion !== 'no indicado' && (
            <span className="block text-[11px] text-slate-400 mt-0.5">
              Cot. {p.numeroCotizacion}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'cabeEnPresupuesto',
      label: 'Cabe en presupuesto',
      sublabel: `Máx: ₡ ${clientBudget.toLocaleString('es-CR')}`,
      render: (p: ProposalComparison) => {
        const fits = p.cabeEnPresupuesto;
        const diff = p.primaAnualMonto - clientBudget;
        return (
          <div className="flex flex-col items-start gap-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                fits
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {fits ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              {fits ? 'Sí cabe' : 'No cabe'}
            </span>
            <span className="text-[11px] text-slate-500">
              {fits
                ? diff === 0
                  ? 'Exacto al límite'
                  : `₡ ${Math.abs(diff).toLocaleString('es-CR')} bajo presupuesto`
                : `Excede por ₡ ${diff.toLocaleString('es-CR')}`}
            </span>
          </div>
        );
      },
    },
    {
      id: 'deducibleColision',
      label: 'Deducible colisión',
      sublabel: 'Daños propios y vuelco',
      render: (p: ProposalComparison) => (
        <span className="text-xs font-medium text-slate-800">
          {p.deducibleColision || 'no indicado'}
        </span>
      ),
    },
    {
      id: 'deducibleRobo',
      label: 'Deducible robo',
      sublabel: 'Robo total o parcial',
      render: (p: ProposalComparison) => (
        <span className="text-xs font-medium text-slate-800">
          {p.deducibleRobo || 'no indicado'}
        </span>
      ),
    },
    {
      id: 'rcDanosTerceros',
      label: 'RC daños a terceros',
      sublabel: 'Bienes materiales',
      render: (p: ProposalComparison) => (
        <span className="text-xs font-semibold text-slate-800">
          {p.rcDanosTerceros || 'no indicado'}
        </span>
      ),
    },
    {
      id: 'rcLesiones',
      label: 'RC lesiones',
      sublabel: 'Lesiones o muerte terceros',
      render: (p: ProposalComparison) => (
        <span className="text-xs font-semibold text-slate-800">
          {p.rcLesiones || 'no indicado'}
        </span>
      ),
    },
    {
      id: 'asistenciaVial247',
      label: 'Asistencia vial 24/7',
      sublabel: 'Batería, llanta, cerrajería',
      render: (p: ProposalComparison) => (
        <span className="text-xs text-slate-800">
          {p.asistenciaVial247 || 'no indicado'}
        </span>
      ),
    },
    {
      id: 'grua',
      label: 'Grúa',
      sublabel: 'Límites y eventos',
      render: (p: ProposalComparison) => (
        <span className="text-xs text-slate-800">
          {p.grua || 'no indicado'}
        </span>
      ),
    },
    {
      id: 'vehiculoSustituto',
      label: 'Vehículo sustituto',
      sublabel: 'Días por siniestro',
      render: (p: ProposalComparison) => {
        const hasIt =
          p.vehiculoSustituto &&
          !p.vehiculoSustituto.toLowerCase().includes('no') &&
          p.vehiculoSustituto !== 'no indicado';
        return (
          <span
            className={`text-xs ${
              hasIt ? 'font-semibold text-emerald-800' : 'text-slate-600'
            }`}
          >
            {p.vehiculoSustituto || 'no indicado'}
          </span>
        );
      },
    },
    {
      id: 'fenomenosNaturales',
      label: 'Fenómenos naturales',
      sublabel: 'Inundación, deslizamiento, etc.',
      render: (p: ProposalComparison) => {
        const hasIt =
          p.fenomenosNaturales &&
          !p.fenomenosNaturales.toLowerCase().includes('no') &&
          p.fenomenosNaturales !== 'no indicado';
        return (
          <span
            className={`text-xs ${
              hasIt ? 'font-semibold text-emerald-800' : 'text-slate-600'
            }`}
          >
            {p.fenomenosNaturales || 'no indicado'}
          </span>
        );
      },
    },
    {
      id: 'roturaCristales',
      label: 'Rotura de cristales',
      sublabel: 'Parabrisas y ventanas',
      render: (p: ProposalComparison) => (
        <span className="text-xs text-slate-800">
          {p.roturaCristales || 'no indicado'}
        </span>
      ),
    },
    {
      id: 'exclusionesDestacadas',
      label: 'Exclusiones destacadas',
      sublabel: 'Restricciones clave',
      render: (p: ProposalComparison) => (
        <p className="text-xs text-slate-600 line-clamp-4 hover:line-clamp-none transition-all leading-relaxed">
          {p.exclusionesDestacadas || 'no indicado'}
        </p>
      ),
    },
    {
      id: 'cumpleObligatorias',
      label: 'Cumple obligatorias',
      sublabel: 'Sin costo adicional',
      render: (p: ProposalComparison) => {
        const complies = p.cumpleObligatorias;
        const missing = p.coberturasFaltantes || [];
        return (
          <div className="flex flex-col items-start gap-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                complies
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {complies ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              {complies ? 'Sí cumple' : 'No cumple'}
            </span>
            {!complies && missing.length > 0 && (
              <span className="text-[11px] text-rose-700 font-medium">
                Falta: {missing.join(', ')}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'semaforo',
      label: 'Semáforo',
      sublabel: 'Evaluación integral',
      render: (p: ProposalComparison) => {
        const color = p.semaforo;
        let badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
        let circleColor = 'bg-rose-500 shadow-rose-300';
        let label = 'Rojo: No cumple obligatorias';

        if (color === 'verde') {
          badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
          circleColor = 'bg-emerald-500 shadow-emerald-300';
          label = 'Verde: Cabe y cumple';
        } else if (color === 'amarillo') {
          badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
          circleColor = 'bg-amber-500 shadow-amber-300';
          label = 'Amarillo: Cumple, pero no cabe';
        }

        return (
          <div className="flex flex-col gap-1.5 py-1">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-xs ${badgeColor} shadow-2xs`}
            >
              <span className={`w-3.5 h-3.5 rounded-full ${circleColor} shadow-xs shrink-0 animate-pulse`} />
              <span>{label}</span>
            </div>
            {p.justificacionSemaforo && (
              <p className="text-[11px] text-slate-500 leading-tight">
                {p.justificacionSemaforo}
              </p>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
      <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0f2e56]" />
            Tabla Comparativa de Propuestas
          </h3>
          <p className="text-xs text-slate-500">
            Comparativa estructurada de coberturas y primas extraídas de las cotizaciones.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600 bg-white px-3 py-1.5 rounded-md border border-slate-200 self-start sm:self-auto">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Verde: Cabe & cumple
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Amarillo: Cumple pero excede
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Rojo: No cumple
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#0d223f] text-white">
              <th className="py-3.5 px-4 text-xs font-bold tracking-wider uppercase w-1/4 min-w-[200px] border-r border-blue-900/50">
                Parámetro / Cobertura
              </th>
              {proposals.map((p, idx) => (
                <th
                  key={idx}
                  className="py-3.5 px-4 text-xs font-bold tracking-wider uppercase border-r border-blue-900/50 last:border-r-0"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-extrabold text-white leading-tight">
                        {p.aseguradora}
                      </p>
                      <p className="text-[10px] text-blue-200 font-normal truncate max-w-[220px]" title={p.archivoOrigen}>
                        {p.archivoOrigen}
                      </p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, index) => {
              const isEven = index % 2 === 0;
              const isHighlightRow = row.id === 'semaforo' || row.id === 'primaAnual';
              return (
                <tr
                  key={row.id}
                  className={`transition-colors hover:bg-blue-50/40 ${
                    isHighlightRow
                      ? 'bg-blue-50/30 font-semibold'
                      : isEven
                      ? 'bg-white'
                      : 'bg-slate-50/70'
                  }`}
                >
                  {/* Parameter Label Column */}
                  <td className="py-3 px-4 border-r border-slate-200/80 align-top">
                    <span className="text-xs font-bold text-slate-900 block">
                      {row.label}
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      {row.sublabel}
                    </span>
                  </td>

                  {/* Insurer Values Columns */}
                  {proposals.map((p, pIdx) => (
                    <td
                      key={pIdx}
                      className="py-3 px-4 border-r border-slate-200/80 last:border-r-0 align-top"
                    >
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
