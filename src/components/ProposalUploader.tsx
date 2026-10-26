import React, { useRef, useState } from 'react';
import { Upload, FileText, Trash2, Plus, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UploadedProposal } from '../types/insurance';

interface ProposalUploaderProps {
  proposals: UploadedProposal[];
  onAddProposal: (proposal: UploadedProposal) => void;
  onRemoveProposal: (id: string) => void;
  onLoadSamples: () => void;
  isLoadingSamples: boolean;
}

export const ProposalUploader: React.FC<ProposalUploaderProps> = ({
  proposals,
  onAddProposal,
  onRemoveProposal,
  onLoadSamples,
  isLoadingSamples,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);

    const availableSlots = 3 - proposals.length;
    if (availableSlots <= 0) {
      setErrorMsg('Ya se ha alcanzado el límite máximo de 3 propuestas.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);

    filesToProcess.forEach((file) => {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMsg(`"${file.name}" no es un archivo PDF válido.`);
        return;
      }

      // Read file as Base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onAddProposal({
            id: `up_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            sizeBytes: file.size,
            dataBase64: result,
            source: 'upload',
          });
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0d223f] text-white text-xs font-bold">
              1
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Propuestas de Aseguradoras
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 ml-8">
            Sube de 1 a 3 cotizaciones en PDF emitidas por distintas aseguradoras para cotejarlas.
          </p>
        </div>

        <button
          type="button"
          onClick={onLoadSamples}
          disabled={isLoadingSamples}
          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
          title="Cargar las 3 propuestas del caso: Cordillera, Alborada y Protectora del Valle"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          {isLoadingSamples ? 'Cargando ejemplos...' : 'Cargar 3 propuestas de ejemplo'}
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Zone */}
      {proposals.length < 3 && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-blue-600 bg-blue-50/50'
              : 'border-slate-300 hover:border-[#0f2e56] hover:bg-slate-50/70 bg-slate-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple={proposals.length < 2}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 mb-3 rounded-full bg-blue-50 text-[#0f2e56] flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Haz clic para seleccionar o arrastra archivos PDF aquí
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Documentos de propuestas oficiales (1 a 3 aseguradoras). Tamaño máximo recomendado 10 MB.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#0f2e56] bg-blue-50 px-3 py-1 rounded-md">
              <Plus className="w-3.5 h-3.5" /> Agregar cotización PDF ({proposals.length}/3)
            </div>
          </div>
        </div>
      )}

      {/* Proposal Cards List */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2.5">
          <span>Archivos cargados ({proposals.length} de 3):</span>
          {proposals.length > 0 && (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Listo para análisis
            </span>
          )}
        </div>

        {proposals.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs bg-slate-50/50">
            Ningún archivo cargado aún. Sube de 1 a 3 PDFs o usa el botón de "Cargar 3 propuestas de ejemplo".
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {proposals.map((item, index) => (
              <div
                key={item.id}
                className="relative flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/90 rounded-lg hover:border-slate-300 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                    PDF
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Propuesta #{index + 1}
                      </span>
                      {item.source === 'sample' && (
                        <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-medium">
                          Ejemplo
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 truncate" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {formatFileSize(item.sizeBytes)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveProposal(item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer shrink-0"
                  title="Eliminar archivo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
