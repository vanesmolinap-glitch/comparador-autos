export interface AuthUser {
  id: string;
  usuario: string;
  nombre: string;
  nombreCompleto: string;
  rol: 'administrador' | 'asesor';
  estado: 'activo' | 'suspendido';
  debeCambiarClave: boolean;
  fechaCreacion: string;
  ultimoAcceso: string | null;
}

export interface UploadedProposal {
  id: string;
  name: string;
  sizeBytes: number;
  dataBase64: string;
  source: 'upload' | 'sample';
}

export interface ClientProfile {
  name: string;
  vehicleAndUse: string;
  maxBudget: number;
  mandatoryCoverages: {
    colision: boolean;
    robo: boolean;
    asistencia_24_7: boolean;
    fenomenos_naturales: boolean;
    vehiculo_sustituto: boolean;
  };
  priorities: string;
  paymentMethod: string;
}

export interface ProposalComparison {
  aseguradora: string;
  archivoOrigen: string;
  numeroCotizacion?: string;
  primaAnual: string;
  primaAnualMonto: number;
  cabeEnPresupuesto: boolean;
  cabeEnPresupuestoDetalle?: string;
  deducibleColision: string;
  deducibleRobo: string;
  rcDanosTerceros: string;
  rcLesiones: string;
  asistenciaVial247: string;
  asistenciaVial247Incluida?: boolean;
  grua: string;
  vehiculoSustituto: string;
  vehiculoSustitutoIncluido?: boolean;
  fenomenosNaturales: string;
  fenomenosNaturalesIncluido?: boolean;
  roturaCristales: string;
  exclusionesDestacadas: string;
  coberturasFaltantes?: string[];
  cumpleObligatorias: boolean;
  semaforo: 'verde' | 'amarillo' | 'rojo';
  justificacionSemaforo?: string;
}

export interface ComparisonResult {
  propuestas: ProposalComparison[];
  recomendacionPreliminar: string;
  mensajeWhatsApp: string;
}
