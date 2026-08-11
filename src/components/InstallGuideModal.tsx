import React from 'react';
import { Watch, Download, CheckCircle, Wifi, Cpu, X, Smartphone, Globe } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDownloadManifest = () => {
    const manifest = {
      name: "Mareas & Tiempo - OnePlus Watch 3",
      short_name: "MareasWatch",
      description: "App de mareas, meteorología y GPS optimizada para OnePlus Watch 3",
      start_url: "/",
      display: "standalone",
      background_color: "#000000",
      theme_color: "#06b6d4",
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 space-y-6 text-white shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Instalación en OnePlus Watch 3</h2>
              <p className="text-xs text-slate-400">Guía de sincronización para Wear OS 4 / RTOS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Spec Badge */}
        <div className="bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/30 rounded-2xl p-4 flex items-center gap-3">
          <Cpu className="w-6 h-6 text-cyan-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-cyan-200">Arquitectura OnePlus Watch 3 Dual-Engine:</span>
            <p className="text-slate-300 mt-0.5">
              Pantalla AMOLED 1.43" (466x466 px) con Wear OS 4 y procesador Snapdragon W5. Esta aplicación está adaptada al dial circular y admite GPS integrado.
            </p>
          </div>
        </div>

        {/* Installation Steps */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Métodos de Instalación recomendados:</h3>

          {/* Method 1 */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Método 1: Aplicación Web PWA Standalone (Acceso Directo)</span>
            </div>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside pl-1">
              <li>Abre el navegador Chrome/Browser en tu OnePlus Watch 3 o en tu smartphone enlazado.</li>
              <li>Ingresa la URL de esta aplicación.</li>
              <li>Toca el menú del navegador y selecciona <strong className="text-white">"Añadir a pantalla de inicio"</strong> o <strong className="text-white">"Instalar Aplicación"</strong>.</li>
              <li>Se creará un icono independiente en el menú de aplicaciones de tu OnePlus Watch 3.</li>
            </ol>
          </div>

          {/* Method 2 */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <Wifi className="w-4 h-4 text-amber-400" />
              <span>Método 2: Depuración Inalámbrica ADB (Wear OS Wireless Debugging)</span>
            </div>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside pl-1">
              <li>En el reloj: Ajustes → Sistema → Información → Pulsa 7 veces en "Número de compilación".</li>
              <li>En Opciones de desarrollo: Activa <strong className="text-white">"Depuración por Wi-Fi"</strong> y anota la IP y Puerto.</li>
              <li>Conecta via ADB desde tu PC/Móvil (<code className="text-cyan-300 font-mono">adb connect IP:PUERTO</code>) e instala el paquete Wear OS.</li>
            </ol>
          </div>
        </div>

        {/* Export Button */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handleDownloadManifest}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Descargar Manifest PWA</span>
          </button>

          <button
            onClick={onClose}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
