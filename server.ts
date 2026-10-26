import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const COOKIE_SECRET = process.env.SESSION_SECRET || 'bn_corredora_secret_fundepos_2026_seguro';

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser(COOKIE_SECRET));

// Shared Gemini client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Paths to data directory and files
const dataDir = path.resolve(__dirname, 'data');
const usuariosFile = path.join(dataDir, 'usuarios.json');
const comparacionesFile = path.join(dataDir, 'comparaciones.json');
const auditoriaFile = path.join(dataDir, 'auditoria.json');
const sesionesFile = path.join(dataDir, 'sesiones.json');

// Interface for User
interface UsuarioRecord {
  id: string;
  usuario: string; // nombre corto, sin espacios, en minúsculas
  nombre: string;
  nombreCompleto: string;
  rol: 'administrador' | 'asesor';
  estado: 'activo' | 'suspendido';
  debeCambiarClave: boolean;
  claveHash: string;
  fechaCreacion: string;
  ultimoAcceso: string | null;
}

// In-memory sessions map
interface SessionData {
  userId: string;
  expiresAt: number;
}
const sessions = new Map<string, SessionData>();

// Ensure data folder and initial files
function initDataStorage() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // data/usuarios.json
  if (!fs.existsSync(usuariosFile)) {
    const initialClave = 'Fundepos2026*';
    const hash = bcrypt.hashSync(initialClave, 10);
    const initialAdmin: UsuarioRecord = {
      id: 'usr_admin_01',
      usuario: 'admin',
      nombre: 'Administrador',
      nombreCompleto: 'Administrador',
      rol: 'administrador',
      estado: 'activo',
      debeCambiarClave: true,
      claveHash: hash,
      fechaCreacion: new Date().toISOString(),
      ultimoAcceso: null,
    };
    fs.writeFileSync(usuariosFile, JSON.stringify([initialAdmin], null, 2), 'utf-8');
    console.log('[Auth] data/usuarios.json creado con usuario admin inicial.');
  }

  // data/comparaciones.json
  if (!fs.existsSync(comparacionesFile)) {
    fs.writeFileSync(comparacionesFile, JSON.stringify([], null, 2), 'utf-8');
  }

  // data/auditoria.json
  if (!fs.existsSync(auditoriaFile)) {
    fs.writeFileSync(auditoriaFile, JSON.stringify([], null, 2), 'utf-8');
  }

  // Load existing sessions from data/sesiones.json if available
  if (fs.existsSync(sesionesFile)) {
    try {
      const raw = fs.readFileSync(sesionesFile, 'utf-8');
      const loaded: Record<string, SessionData> = JSON.parse(raw);
      const now = Date.now();
      for (const [sid, sdata] of Object.entries(loaded)) {
        if (sdata.expiresAt > now) {
          sessions.set(sid, sdata);
        }
      }
    } catch {
      // ignore
    }
  }
}

initDataStorage();

function persistSessions() {
  try {
    const obj: Record<string, SessionData> = {};
    const now = Date.now();
    for (const [sid, data] of sessions.entries()) {
      if (data.expiresAt > now) {
        obj[sid] = data;
      }
    }
    fs.writeFileSync(sesionesFile, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al persistir sesiones:', err);
  }
}

function loadUsers(): UsuarioRecord[] {
  try {
    if (!fs.existsSync(usuariosFile)) return [];
    const content = fs.readFileSync(usuariosFile, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error al leer usuarios:', err);
    return [];
  }
}

function saveUsers(users: UsuarioRecord[]) {
  try {
    fs.writeFileSync(usuariosFile, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar usuarios:', err);
  }
}

function sanitizeUser(user: UsuarioRecord) {
  const { claveHash, ...rest } = user;
  return rest;
}

function logAudit(entry: { tipo: string; usuarioId: string; usuario: string; detalles?: any }) {
  try {
    const audits = fs.existsSync(auditoriaFile)
      ? JSON.parse(fs.readFileSync(auditoriaFile, 'utf-8'))
      : [];
    audits.push({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fecha: new Date().toISOString(),
      ...entry,
    });
    fs.writeFileSync(auditoriaFile, JSON.stringify(audits, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al registrar auditoría:', err);
  }
}

function saveComparisonRecord(record: {
  usuarioId: string;
  usuario: string;
  perfilCliente: any;
  resultado: any;
}) {
  try {
    const comps = fs.existsSync(comparacionesFile)
      ? JSON.parse(fs.readFileSync(comparacionesFile, 'utf-8'))
      : [];
    comps.push({
      id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fecha: new Date().toISOString(),
      ...record,
    });
    fs.writeFileSync(comparacionesFile, JSON.stringify(comps, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar comparación:', err);
  }
}

// Authentication Middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.signedCookies?.bn_session;
  if (!sessionId) {
    return res.status(401).json({ error: 'No autenticado. Por favor inicie sesión.' });
  }

  const session = sessions.get(sessionId);
  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      sessions.delete(sessionId);
      persistSessions();
    }
    res.clearCookie('bn_session');
    return res.status(401).json({ error: 'Sesión expirada. Por favor inicie sesión de nuevo.' });
  }

  const users = loadUsers();
  const user = users.find((u) => u.id === session.userId);
  if (!user) {
    sessions.delete(sessionId);
    persistSessions();
    res.clearCookie('bn_session');
    return res.status(401).json({ error: 'Usuario no encontrado.' });
  }

  if (user.estado !== 'activo') {
    sessions.delete(sessionId);
    persistSessions();
    res.clearCookie('bn_session');
    return res.status(403).json({ error: 'usuario suspendido, contacte al administrador' });
  }

  (req as any).user = user;
  next();
}

// ================= AUTH ENDPOINTS =================

// POST /api/login (usuario y contraseña)
app.post('/api/login', (req: Request, res: Response) => {
  const { usuario, contrasena } = req.body || {};

  if (!usuario || typeof usuario !== 'string' || !contrasena || typeof contrasena !== 'string') {
    return res.status(401).json({ error: 'usuario o contraseña incorrectos' });
  }

  const cleanUser = usuario.trim().toLowerCase();
  const users = loadUsers();
  const user = users.find((u) => u.usuario.toLowerCase() === cleanUser);

  if (!user) {
    return res.status(401).json({ error: 'usuario o contraseña incorrectos' });
  }

  // Check password with bcrypt
  const validPassword = bcrypt.compareSync(contrasena, user.claveHash);
  if (!validPassword) {
    return res.status(401).json({ error: 'usuario o contraseña incorrectos' });
  }

  // Check user state
  if (user.estado === 'suspendido') {
    return res.status(403).json({ error: 'usuario suspendido, contacte al administrador' });
  }

  // Update ultimoAcceso
  user.ultimoAcceso = new Date().toISOString();
  saveUsers(users);

  // Create session (8 hours)
  const sessionId = crypto.randomBytes(32).toString('hex');
  const maxAgeMs = 8 * 60 * 60 * 1000;
  sessions.set(sessionId, {
    userId: user.id,
    expiresAt: Date.now() + maxAgeMs,
  });
  persistSessions();

  // Set signed httpOnly cookie
  res.cookie('bn_session', sessionId, {
    httpOnly: true,
    signed: true,
    maxAge: maxAgeMs,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  logAudit({
    tipo: 'login',
    usuarioId: user.id,
    usuario: user.usuario,
    detalles: { rol: user.rol },
  });

  return res.json({
    success: true,
    user: sanitizeUser(user),
  });
});

// POST /api/logout
app.post('/api/logout', (req: Request, res: Response) => {
  const sessionId = req.signedCookies?.bn_session;
  if (sessionId) {
    const session = sessions.get(sessionId);
    if (session) {
      const users = loadUsers();
      const user = users.find((u) => u.id === session.userId);
      if (user) {
        logAudit({
          tipo: 'logout',
          usuarioId: user.id,
          usuario: user.usuario,
        });
      }
    }
    sessions.delete(sessionId);
    persistSessions();
  }

  res.clearCookie('bn_session');
  return res.json({ success: true, message: 'Sesión cerrada correctamente.' });
});

// GET /api/yo
app.get('/api/yo', (req: Request, res: Response) => {
  const sessionId = req.signedCookies?.bn_session;
  if (!sessionId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const session = sessions.get(sessionId);
  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      sessions.delete(sessionId);
      persistSessions();
    }
    res.clearCookie('bn_session');
    return res.status(401).json({ error: 'Sesión expirada' });
  }

  const users = loadUsers();
  const user = users.find((u) => u.id === session.userId);
  if (!user || user.estado !== 'activo') {
    res.clearCookie('bn_session');
    return res.status(401).json({ error: 'Usuario no disponible' });
  }

  return res.json({
    success: true,
    user: sanitizeUser(user),
  });
});

// POST /api/cambiar-clave (mínimo 8 caracteres, al menos un número)
app.post('/api/cambiar-clave', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as UsuarioRecord;
  const { contrasenaNueva } = req.body || {};

  if (!contrasenaNueva || typeof contrasenaNueva !== 'string') {
    return res.status(400).json({ error: 'Debe ingresar una contraseña nueva válida.' });
  }

  // Validation: mínimo 8 caracteres, al menos un número
  const hasMinLength = contrasenaNueva.length >= 8;
  const hasNumber = /\d/.test(contrasenaNueva);

  if (!hasMinLength || !hasNumber) {
    return res.status(400).json({
      error: 'La nueva contraseña debe tener al menos 8 caracteres y contener al menos un número.',
    });
  }

  const users = loadUsers();
  const userToUpdate = users.find((u) => u.id === user.id);
  if (!userToUpdate) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  userToUpdate.claveHash = bcrypt.hashSync(contrasenaNueva, 10);
  userToUpdate.debeCambiarClave = false;
  saveUsers(users);

  logAudit({
    tipo: 'cambio_clave',
    usuarioId: userToUpdate.id,
    usuario: userToUpdate.usuario,
  });

  return res.json({
    success: true,
    message: 'Contraseña actualizada correctamente.',
    user: sanitizeUser(userToUpdate),
  });
});

// ================= COMPARATOR PROTECTED ENDPOINTS =================

// Endpoint to provide sample proposals info and base64 (Protected)
app.get('/api/sample-proposals', requireAuth, async (req: Request, res: Response) => {
  try {
    const assetsDir = path.resolve(__dirname, 'public/assets/aistudio');
    const samples = [
      {
        id: 'A',
        filename: 'Propuesta_A_Aseguradora_Cordillera_45e2b828.pdf',
        insurerName: 'Aseguradora Cordillera S.A.',
        planName: 'Seguro Voluntario de Automóvil',
      },
      {
        id: 'B',
        filename: 'Propuesta_B_Seguros_Alborada_26bdc3b0.pdf',
        insurerName: 'Seguros Alborada',
        planName: 'Oferta Plan Básico Auto',
      },
      {
        id: 'C',
        filename: 'Propuesta_C_Protectora_del_Valle_422f9421.pdf',
        insurerName: 'Protectora del Valle Seguros Generales',
        planName: 'Plan Todo Riesgo Premium',
      },
    ];

    const result = samples.map((sample) => {
      const filePath = path.join(assetsDir, sample.filename);
      let dataBase64 = '';
      let sizeBytes = 0;
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        dataBase64 = buffer.toString('base64');
        sizeBytes = buffer.length;
      }
      return {
        ...sample,
        sizeBytes,
        dataBase64,
      };
    });

    res.json({ success: true, samples: result });
  } catch (error: any) {
    console.error('Error fetching sample proposals:', error);
    res.status(500).json({ error: error.message || 'Error cargando propuestas de ejemplo' });
  }
});

// Endpoint for PDF Profile extraction if requested (Protected)
app.post('/api/extract-client-profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const { pdfBase64, filename } = req.body || {};
    if (!pdfBase64) {
      return res.status(400).json({ error: 'No se envió el archivo PDF.' });
    }

    let cleanBase64 = pdfBase64;
    if (cleanBase64.includes(';base64,')) {
      cleanBase64 = cleanBase64.split(';base64,')[1];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: cleanBase64,
            },
          },
          {
            text: `Extrae del documento PDF "${filename || 'cotizacion.pdf'}" los datos del cliente asegurado:
1. Nombre del cliente o asegurado. Si no aparece, "no indicado".
2. Marca, modelo y año del vehículo y uso (ej. "Toyota Corolla XEi 2022, Particular").
3. Suma o valor asegurado.
4. Prima anual estimada.
Devuelve únicamente JSON.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nombreCliente: { type: Type.STRING },
            vehiculoYUso: { type: Type.STRING },
            valorAsegurado: { type: Type.STRING },
            primaAnualEstimada: { type: Type.STRING },
          },
          required: ['nombreCliente', 'vehiculoYUso'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error en /api/extract-client-profile:', error);
    res.status(500).json({ error: error.message || 'Error al extraer perfil del documento.' });
  }
});

// Endpoint for comparison (Protected)
app.post('/api/compare', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UsuarioRecord;
    const { proposals, clientProfile } = req.body;

    if (!proposals || !Array.isArray(proposals) || proposals.length === 0) {
      return res.status(400).json({ error: 'Debe cargar al menos 1 propuesta en PDF (máximo 3).' });
    }
    if (proposals.length > 3) {
      return res.status(400).json({ error: 'El número máximo de propuestas permitidas es 3.' });
    }
    if (!clientProfile || !clientProfile.name) {
      return res.status(400).json({ error: 'El perfil del cliente está incompleto.' });
    }

    const mandatoryList: string[] = [];
    if (clientProfile.mandatoryCoverages.colision) mandatoryList.push('Colisión y vuelco');
    if (clientProfile.mandatoryCoverages.robo) mandatoryList.push('Robo total o parcial');
    if (clientProfile.mandatoryCoverages.asistencia_24_7) mandatoryList.push('Asistencia vial 24/7');
    if (clientProfile.mandatoryCoverages.fenomenos_naturales) mandatoryList.push('Fenómenos naturales (inundación, deslizamiento, etc.)');
    if (clientProfile.mandatoryCoverages.vehiculo_sustituto) mandatoryList.push('Vehículo sustituto');

    const promptText = `
Eres un analista experto senior de BN Corredora de Seguros en Costa Rica.
Tu tarea es analizar detalladamente de 1 a 3 propuestas en formato PDF para el siguiente perfil de cliente y generar la comparativa técnica estricta.

PERFIL DEL CLIENTE:
- Nombre: ${clientProfile.name}
- Vehículo y uso: ${clientProfile.vehicleAndUse || 'No especificado'}
- Presupuesto máximo anual (colones): ₡ ${Number(clientProfile.maxBudget || 0).toLocaleString('es-CR')}
- Coberturas obligatorias marcadas por el cliente:
${mandatoryList.length > 0 ? mandatoryList.map(c => `  * ${c}`).join('\n') : '  * Ninguna cobertura marcada como obligatoria'}
- Prioridades del cliente: "${clientProfile.priorities || 'Ninguna especificada'}"
- Forma de pago preferida: "${clientProfile.paymentMethod || 'No especificada'}"

REGLAS ESTRICTAS DE EXTRACCIÓN Y LÓGICA (DE OBLIGATORIO CUMPLIMIENTO):
1. Extraer de cada PDF SOLO lo que dice el documento; si un dato no aparece, escribir "no indicado". ¡NO INVENTES NADA!
2. CABE EN PRESUPUESTO: Es "Sí" (true) si la prima anual (incluyendo impuestos/IVA si se indica en el documento) es menor o igual al presupuesto máximo anual del cliente (₡ ${Number(clientProfile.maxBudget || 0).toLocaleString('es-CR')}). Si excede el presupuesto, es "No" (false).
3. CUMPLE OBLIGATORIAS: Es "Sí" (true) SOLO SI TODAS las coberturas marcadas como obligatorias están INCLUIDAS en la prima anual del documento.
   * IMPORTANTE: Un paquete opcional o asistencia con costo adicional (por ejemplo si un paquete se ofrece "opcional por ₡ X adicionales no incluido en la prima indicada") NO CUENTA como incluido en la prima base. Si una cobertura obligatoria requiere pago adicional o no se incluye o está excluida expresamente, la propuesta NO CUMPLE (false).
4. SEMÁFORO:
   - "verde": si CABE en presupuesto Y CUMPLE todas las coberturas obligatorias.
   - "amarillo": si CUMPLE todas las coberturas obligatorias pero NO CABE en presupuesto.
   - "rojo": si NO CUMPLE las coberturas obligatorias (incluso si cabe en presupuesto).
5. RECOMENDACIÓN PRELIMINAR (BORRADOR):
   - Recomienda EXACTAMENTE UNA SOLA propuesta.
   - Justifícala en MÁXIMO 5 LÍNEAS con los montos exactos, según las prioridades del cliente.
   - Si una propuesta amarilla (que excede el presupuesto) es mejor para satisfacer las prioridades y coberturas obligatorias del cliente frente a propuestas rojas que no cubren lo solicitado, dilo claramente y cuantifica la diferencia exacta de prima respecto al presupuesto del cliente.
6. MENSAJE SUGERIDO PARA EL CLIENTE (WHATSAPP):
   - Mensaje para enviar por WhatsApp, MÁXIMO 8 LÍNEAS.
   - Tono cordial, empático, sin tecnicismos complejos de seguros.
   - Debe contener: Saludo con el nombre del cliente, la propuesta recomendada, dos razones clave, la alternativa y un próximo paso claro (por ejemplo, coordinar llamada o revisar las opciones).
   - SIN prometer plazos ni tiempos de emisión.

Analiza cada uno de los ${proposals.length} documentos PDF adjuntos correspondientes a cada aseguradora.
`;

    // Prepare parts with each PDF and the prompt
    const parts: any[] = [];

    proposals.forEach((p: any, idx: number) => {
      let rawBase64 = p.dataBase64;
      if (rawBase64.includes(';base64,')) {
        rawBase64 = rawBase64.split(';base64,')[1];
      }
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: rawBase64,
        },
      });
      parts.push({
        text: `Documento #${idx + 1}: Archivo "${p.name}".`,
      });
    });

    parts.push({
      text: promptText,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts,
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            propuestas: {
              type: Type.ARRAY,
              description: 'Lista de propuestas analizadas, una por cada PDF recibido.',
              items: {
                type: Type.OBJECT,
                properties: {
                  aseguradora: {
                    type: Type.STRING,
                    description: 'Nombre de la aseguradora y del plan indicado en el documento.',
                  },
                  archivoOrigen: {
                    type: Type.STRING,
                    description: 'Nombre del archivo PDF correspondiente.',
                  },
                  numeroCotizacion: {
                    type: Type.STRING,
                    description: 'Número de cotización o propuesta si aparece, o "no indicado".',
                  },
                  primaAnual: {
                    type: Type.STRING,
                    description: 'Monto de la prima anual tal como aparece en el documento (ej. "₡ 395.000").',
                  },
                  primaAnualMonto: {
                    type: Type.NUMBER,
                    description: 'Monto numérico puro en colones de la prima anual.',
                  },
                  cabeEnPresupuesto: {
                    type: Type.BOOLEAN,
                    description: 'true si primaAnualMonto <= presupuesto máximo del cliente.',
                  },
                  cabeEnPresupuestoDetalle: {
                    type: Type.STRING,
                    description: 'Detalle de si cabe o por cuánto excede el presupuesto.',
                  },
                  deducibleColision: {
                    type: Type.STRING,
                    description: 'Deducible en caso de colisión y vuelco. Si no aparece, "no indicado".',
                  },
                  deducibleRobo: {
                    type: Type.STRING,
                    description: 'Deducible por robo. Si no aparece, "no indicado".',
                  },
                  rcDanosTerceros: {
                    type: Type.STRING,
                    description: 'Límite de Responsabilidad Civil daños a bienes de terceros.',
                  },
                  rcLesiones: {
                    type: Type.STRING,
                    description: 'Límite de Responsabilidad Civil lesiones o muerte de terceros.',
                  },
                  asistenciaVial247: {
                    type: Type.STRING,
                    description: 'Detalle de asistencia vial 24/7. Indicar si está incluida en la prima base o si es opcional con costo.',
                  },
                  asistenciaVial247Incluida: {
                    type: Type.BOOLEAN,
                    description: 'true únicamente si está incluida en la prima base sin cobro adicional.',
                  },
                  grua: {
                    type: Type.STRING,
                    description: 'Condiciones y kilometraje de la grúa según documento.',
                  },
                  vehiculoSustituto: {
                    type: Type.STRING,
                    description: 'Condición de vehículo sustituto según documento (ej. "Hasta 10 días por evento cubierto", "No incluido", "no indicado").',
                  },
                  vehiculoSustitutoIncluido: {
                    type: Type.BOOLEAN,
                    description: 'true si está incluido en la prima.',
                  },
                  fenomenosNaturales: {
                    type: Type.STRING,
                    description: 'Cobertura de fenómenos naturales (inundación, deslizamiento, caída de árboles, etc.). Indicar si aplica o si está excluida.',
                  },
                  fenomenosNaturalesIncluido: {
                    type: Type.BOOLEAN,
                    description: 'true si está cubierto en la prima.',
                  },
                  roturaCristales: {
                    type: Type.STRING,
                    description: 'Cobertura de rotura de cristales.',
                  },
                  exclusionesDestacadas: {
                    type: Type.STRING,
                    description: 'Exclusiones principales destacadas en el documento.',
                  },
                  coberturasFaltantes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Lista de coberturas obligatorias solicitadas que faltan o son de pago adicional.',
                  },
                  cumpleObligatorias: {
                    type: Type.BOOLEAN,
                    description: 'true solo si todas las coberturas obligatorias marcadas están incluidas en la prima base sin costo adicional.',
                  },
                  semaforo: {
                    type: Type.STRING,
                    description: 'Color del semáforo: "verde", "amarillo" o "rojo".',
                  },
                  justificacionSemaforo: {
                    type: Type.STRING,
                    description: 'Breve explicación de por qué obtuvo ese color de semáforo.',
                  },
                },
                required: [
                  'aseguradora',
                  'archivoOrigen',
                  'primaAnual',
                  'primaAnualMonto',
                  'cabeEnPresupuesto',
                  'deducibleColision',
                  'deducibleRobo',
                  'rcDanosTerceros',
                  'rcLesiones',
                  'asistenciaVial247',
                  'grua',
                  'vehiculoSustituto',
                  'fenomenosNaturales',
                  'roturaCristales',
                  'exclusionesDestacadas',
                  'cumpleObligatorias',
                  'semaforo',
                ],
              },
            },
            recomendacionPreliminar: {
              type: Type.STRING,
              description: 'Recomendación preliminar (borrador): una sola propuesta, justificada en máximo 5 líneas con los montos según las prioridades del cliente.',
            },
            mensajeWhatsApp: {
              type: Type.STRING,
              description: 'Mensaje sugerido para el cliente (WhatsApp): máximo 8 líneas, tono cordial, sin tecnicismos, con recomendación, 2 razones, alternativa y próximo paso. Sin plazos.',
            },
          },
          required: ['propuestas', 'recomendacionPreliminar', 'mensajeWhatsApp'],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('No se recibió respuesta estructurada del modelo.');
    }

    const parsedData = JSON.parse(textOutput);

    // Double check deterministically against client profile to ensure 100% adherence:
    const maxBudget = Number(clientProfile.maxBudget || 0);

    parsedData.propuestas = parsedData.propuestas.map((item: any) => {
      // Check budget
      const fitsBudget = item.primaAnualMonto <= maxBudget;
      item.cabeEnPresupuesto = fitsBudget;

      // Re-verify semáforo
      if (item.cumpleObligatorias && fitsBudget) {
        item.semaforo = 'verde';
      } else if (item.cumpleObligatorias && !fitsBudget) {
        item.semaforo = 'amarillo';
      } else {
        item.semaforo = 'rojo';
      }

      return item;
    });

    // Requirement 9: Save comparison to data/comparaciones.json and log to data/auditoria.json
    saveComparisonRecord({
      usuarioId: user.id,
      usuario: user.usuario,
      perfilCliente: clientProfile,
      resultado: parsedData,
    });

    logAudit({
      tipo: 'comparacion',
      usuarioId: user.id,
      usuario: user.usuario,
      detalles: {
        cliente: clientProfile.name,
        propuestasCount: proposals.length,
      },
    });

    res.json({
      success: true,
      result: parsedData,
    });
  } catch (error: any) {
    console.error('Error during comparison API call:', error);
    res.status(500).json({
      error: error.message || 'Ocurrió un error al procesar las propuestas con Gemini.',
    });
  }
});

// Mount Vite or serve static assets
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Comparador de Propuestas BN backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
