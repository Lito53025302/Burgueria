import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    setIsStandalone(isInStandaloneMode || isIOSStandalone);

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado com sucesso:', registration);
        })
        .catch((error) => {
          console.log('Falha ao registrar Service Worker:', error);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  // Não mostrar se já está instalado
  if (isStandalone) return null;

  return (
    <>
      {showInstallButton && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-20 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50"
          title="Instalar App"
        >
          <Download size={24} />
        </button>
      )}
      
      {/* Banner para iOS (já que iOS não suporta beforeinstallprompt) */}
      {!isStandalone && /iPad|iPhone|iPod/.test(navigator.userAgent) && !showInstallButton && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-50">
          <p className="text-sm mb-2">
            Para instalar este app no seu iPhone: toque em <strong>Compartilhar</strong> e depois <strong>"Adicionar à Tela de Início"</strong>
          </p>
          <button
            onClick={() => setShowInstallButton(false)}
            className="text-white underline text-sm"
          >
            Dispensar
          </button>
        </div>
      )}
    </>
  );
}
