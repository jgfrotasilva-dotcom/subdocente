import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isOnline: boolean;
  isInstalled: boolean;
  isInstallable: boolean;
  hasUpdate: boolean;
  swVersion: string;
  lastSync: Date | null;
}

interface UsePWAReturn extends PWAState {
  installApp: () => Promise<void>;
  updateApp: () => void;
  dismissUpdate: () => void;
}

export function usePWA(): UsePWAReturn {
  const [state, setState] = useState<PWAState>({
    isOnline: navigator.onLine,
    isInstalled: window.matchMedia('(display-mode: standalone)').matches,
    isInstallable: false,
    hasUpdate: false,
    swVersion: '',
    lastSync: null,
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true, lastSync: new Date() }));
      console.log('[PWA] Conexão restaurada!');
    };
    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      console.log('[PWA] Sem conexão — modo offline ativado');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitorar prompt de instalação
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState(prev => ({ ...prev, isInstallable: true }));
      console.log('[PWA] Pronto para instalar!');
    };

    const handleAppInstalled = () => {
      setState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
      setDeferredPrompt(null);
      console.log('[PWA] App instalado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Registrar Service Worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service Worker não suportado');
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw-custom.js', {
          scope: '/',
        });
        setSwRegistration(registration);
        console.log('[PWA] Service Worker registrado:', registration.scope);

        // Verificar atualizações a cada 30 minutos
        const checkUpdate = setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);

        // Detectar nova versão disponível
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] Nova versão disponível!');
              setState(prev => ({ ...prev, hasUpdate: true }));
            }
          });
        });

        return () => clearInterval(checkUpdate);
      } catch (error) {
        console.error('[PWA] Falha ao registrar Service Worker:', error);
      }
    };

    registerSW();
  }, []);

  // Instalar o app
  const installApp = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Resultado da instalação:', outcome);
    if (outcome === 'accepted') {
      setState(prev => ({ ...prev, isInstallable: false }));
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  // Atualizar o app (recarregar com nova versão)
  const updateApp = useCallback(() => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  }, [swRegistration]);

  // Dispensar notificação de atualização
  const dismissUpdate = useCallback(() => {
    setState(prev => ({ ...prev, hasUpdate: false }));
  }, []);

  return {
    ...state,
    installApp,
    updateApp,
    dismissUpdate,
  };
}
