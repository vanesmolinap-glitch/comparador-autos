/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ProposalUploader } from './components/ProposalUploader';
import { ClientProfileForm } from './components/ClientProfileForm';
import { ComparisonTable } from './components/ComparisonTable';
import { RecommendationCards } from './components/RecommendationCards';
import { AnalyzingOverlay } from './components/AnalyzingOverlay';
import { FooterDisclaimer } from './components/FooterDisclaimer';
import { LoginScreen } from './components/LoginScreen';
import { ForceChangePasswordModal } from './components/ForceChangePasswordModal';
import { UploadedProposal, ClientProfile, ComparisonResult, AuthUser } from './types/insurance';
import { Sparkles, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const initialProfile: ClientProfile = {
  name: 'Laura Solís Vargas',
  vehicleAndUse: 'Toyota Corolla XEi 2022, uso particular',
  maxBudget: 400000,
  mandatoryCoverages: {
    colision: true,
    robo: true,
    asistencia_24_7: true,
    fenomenos_naturales: true,
    vehiculo_sustituto: true,
  },
  priorities:
    'Requiere cobertura de fenómenos naturales por vivir en zona con riesgo de inundación, además de vehículo sustituto y asistencia vial 24/7 sin pagos adicionales.',
  paymentMethod: 'Cuotas mensuales',
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  const [proposals, setProposals] = useState<UploadedProposal[]>([]);
  const [clientProfile, setClientProfile] = useState<ClientProfile>(initialProfile);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resultSectionRef = useRef<HTMLDivElement>(null);

  // Check initial session with GET /api/yo
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/yo', { credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (err) {
        console.error('Error verifying session:', err);
      } finally {
        setAuthChecking(false);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setCurrentUser(null);
      setComparisonResult(null);
    }
  };

  const handleAddProposal = (proposal: UploadedProposal) => {
    if (proposals.length >= 3) return;
    setProposals((prev) => [...prev, proposal]);
    setErrorMessage(null);
  };

  const handleRemoveProposal = (id: string) => {
    setProposals((prev) => prev.filter((p) => p.id !== id));
  };

  const handleLoadSamples = async () => {
    setIsLoadingSamples(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/sample-proposals', { credentials: 'same-origin' });
      if (response.status === 401) {
        setCurrentUser(null);
        return;
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.samples)) {
        const sampleProposals: UploadedProposal[] = data.samples.map((s: any) => ({
          id: `sample_${s.id}_${Date.now()}`,
          name: s.filename,
          sizeBytes: s.sizeBytes || 150000,
          dataBase64: s.dataBase64,
          source: 'sample' as const,
        }));
        setProposals(sampleProposals);
      } else {
        throw new Error(data.error || 'No se pudieron cargar las propuestas de ejemplo.');
      }
    } catch (err: any) {
      console.error('Error al cargar propuestas de ejemplo:', err);
      setErrorMessage(err.message || 'Error al cargar las propuestas de ejemplo.');
    } finally {
      setIsLoadingSamples(false);
    }
  };

  const handleLoadSampleProfile = () => {
    setClientProfile(initialProfile);
  };

  const handleCompare = async () => {
    if (proposals.length === 0) {
      setErrorMessage('Debes subir al menos 1 propuesta en PDF para comparar.');
      return;
    }
    if (!clientProfile.name.trim()) {
      setErrorMessage('Por favor ingresa el nombre del cliente en la Sección 2.');
      return;
    }
    if (!clientProfile.maxBudget || clientProfile.maxBudget <= 0) {
      setErrorMessage('Por favor define un presupuesto máximo anual en colones mayor a 0.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      const payload = {
        proposals: proposals.map((p) => ({
          name: p.name,
          dataBase64: p.dataBase64,
        })),
        clientProfile,
      };

      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        setCurrentUser(null);
        throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ocurrió un error al procesar las propuestas.');
      }

      setComparisonResult(data.result);

      // Scroll to results smoothly
      setTimeout(() => {
        resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error('Error during comparison:', err);
      setErrorMessage(
        err.message || 'Error al comunicarse con el servicio de análisis de Gemini.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewComparison = () => {
    setComparisonResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state while checking active session
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0a1e36] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
        <p className="text-sm font-semibold text-white tracking-wide">
          Verificando sesión institucional...
        </p>
      </div>
    );
  }

  // If not logged in, render the Login Screen (Rule 6)
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 font-sans">
      {/* Header with user info and Logout Button (Rule 8) */}
      <Header user={currentUser} onLogout={handleLogout} />

      {/* Force Change Password Modal if debeCambiarClave is true (Rule 7) */}
      {currentUser.debeCambiarClave && (
        <ForceChangePasswordModal
          user={currentUser}
          onPasswordChanged={(updatedUser) => setCurrentUser(updatedUser)}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-xl flex items-start gap-3 text-sm text-red-800 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Aviso del sistema:</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-red-600 hover:text-red-900 font-semibold underline cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Section 1: Proposals Uploader */}
        <section id="seccion-propuestas">
          <ProposalUploader
            proposals={proposals}
            onAddProposal={handleAddProposal}
            onRemoveProposal={handleRemoveProposal}
            onLoadSamples={handleLoadSamples}
            isLoadingSamples={isLoadingSamples}
          />
        </section>

        {/* Section 2: Client Profile Form */}
        <section id="seccion-perfil">
          <ClientProfileForm
            profile={clientProfile}
            onChange={setClientProfile}
            onLoadSampleProfile={handleLoadSampleProfile}
          />
        </section>

        {/* Big Compare Button */}
        <div className="flex flex-col items-center justify-center pt-2">
          <button
            type="button"
            onClick={handleCompare}
            disabled={isAnalyzing || proposals.length === 0}
            className={`group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base sm:text-lg font-extrabold rounded-2xl shadow-lg transition-all cursor-pointer ${
              proposals.length === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-[#0d223f] via-[#0f2e56] to-[#143a6d] hover:from-[#0a1b32] hover:to-[#0f2e56] text-white hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            <Sparkles className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>Comparar propuestas</span>
            <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </button>
          {proposals.length === 0 && (
            <p className="text-xs text-slate-500 mt-2 text-center">
              Sube al menos un archivo PDF de cotización o haz clic en "Cargar 3 propuestas de ejemplo" para habilitar el botón.
            </p>
          )}
        </div>

        {/* Section 3: Results */}
        {comparisonResult && (
          <section
            ref={resultSectionRef}
            id="seccion-resultado"
            className="space-y-6 pt-4 scroll-mt-6 animate-in fade-in duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">
                  3
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Resultado: Comparativa Técnica
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
                {comparisonResult.propuestas.length} propuestas evaluadas para {clientProfile.name}
              </span>
            </div>

            {/* Table */}
            <ComparisonTable
              proposals={comparisonResult.propuestas}
              clientBudget={clientProfile.maxBudget}
            />

            {/* 2 Boxes: Recomendación preliminar y Mensaje WhatsApp + Buttons */}
            <RecommendationCards
              recommendation={comparisonResult.recomendacionPreliminar}
              whatsappMessage={comparisonResult.mensajeWhatsApp}
              onNewComparison={handleNewComparison}
            />
          </section>
        )}
      </main>

      {/* Analyzing modal */}
      {isAnalyzing && <AnalyzingOverlay proposalCount={proposals.length} />}

      {/* Fixed footer disclaimer */}
      <FooterDisclaimer />
    </div>
  );
}
