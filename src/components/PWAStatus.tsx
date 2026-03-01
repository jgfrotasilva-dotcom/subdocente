import { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';

export function PWAStatus() {
  const { isOnline, isInstalled, isInstallable, hasUpdate, installApp, updateApp, dismissUpdate } = usePWA();
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [prevOnline, setPrevOnline] = useState(isOnline);

  // Detectar mudanças de conexão
  useEffect(() => {
    if (prevOnline && !isOnline) {
      // Ficou offline
      setShowOfflineBanner(true);
      setShowOnlineToast(false);
    } else if (!prevOnline && isOnline) {
      // Voltou online
      setShowOfflineBanner(false);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 4000);
    }
    setPrevOnline(isOnline);
  }, [isOnline, prevOnline]);

  // Mostrar banner de instalação após 30 segundos
  useEffect(() => {
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => setShowInstallBanner(true), 30000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  return (
    <>
      {/* ===== BANNER OFFLINE ===== */}
      {showOfflineBanner && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📡</span>
              </div>
              <div>
                <p className="font-bold text-sm">Você está offline</p>
                <p className="text-xs text-white/80">
                  O sistema continua funcionando normalmente. Todos os dados estão salvos localmente no dispositivo.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-white/90">💾 Dados salvos localmente</p>
                <p className="text-xs text-white/70">Sincroniza ao reconectar</p>
              </div>
              <button
                onClick={() => setShowOfflineBanner(false)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                title="Fechar"
              >
                ✕
              </button>
            </div>
          </div>
          {/* Barra animada */}
          <div className="h-1 bg-white/20">
            <div className="h-full bg-white/60 animate-pulse w-full"></div>
          </div>
        </div>
      )}

      {/* ===== TOAST VOLTOU ONLINE ===== */}
      {showOnlineToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] animate-bounce-once">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-64">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
            <div>
              <p className="font-bold text-sm">Conexão restaurada!</p>
              <p className="text-xs text-white/80">Sistema funcionando normalmente</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== BANNER DE ATUALIZAÇÃO ===== */}
      {hasUpdate && (
        <div className="fixed bottom-16 left-0 right-0 z-[9998] px-4 pb-2">
          <div className="max-w-lg mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🔄</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Nova versão disponível!</p>
                <p className="text-xs text-white/80">Atualize para obter as últimas melhorias</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={dismissUpdate}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs transition-colors"
                >
                  Depois
                </button>
                <button
                  onClick={updateApp}
                  className="px-3 py-1.5 bg-white hover:bg-white/90 text-indigo-700 font-bold rounded-lg text-xs transition-colors"
                >
                  Atualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== BANNER DE INSTALAÇÃO ===== */}
      {showInstallBanner && !isInstalled && (
        <div className="fixed bottom-16 left-0 right-0 z-[9997] px-4 pb-2">
          <div className="max-w-lg mx-auto bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
                🏫
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Instalar o Sistema</p>
                <p className="text-xs text-white/80">
                  Use como app no desktop ou celular, mesmo sem internet!
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs transition-colors"
                >
                  Não
                </button>
                <button
                  onClick={async () => {
                    await installApp();
                    setShowInstallBanner(false);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-white/90 text-blue-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  📲 Instalar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== INDICADOR PERMANENTE NO CANTO (pequeno) ===== */}
      <div className="fixed bottom-2 right-2 z-[9996]">
        {!isOnline ? (
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg opacity-80">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Offline
          </div>
        ) : (
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg opacity-60 hover:opacity-100 transition-opacity">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Online
          </div>
        )}
      </div>
    </>
  );
}

// Componente de ícone de status para usar no Header
export function OnlineStatusIcon() {
  const { isOnline, isInstalled, isInstallable, installApp } = usePWA();

  return (
    <div className="flex items-center gap-2">
      {/* Status de conexão */}
      <div
        title={isOnline ? 'Conectado à internet' : 'Offline — funcionando localmente'}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all ${
          isOnline
            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
            : 'bg-orange-500/20 text-orange-300 border border-orange-500/30 animate-pulse'
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-orange-400 animate-pulse'}`}></span>
        <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      {/* Botão de instalar (se disponível e não instalado) */}
      {isInstallable && !isInstalled && (
        <button
          onClick={installApp}
          title="Instalar como app — funciona offline!"
          className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-full text-xs font-medium transition-all"
        >
          📲 <span className="hidden sm:inline">Instalar</span>
        </button>
      )}

      {/* Indicador de instalado */}
      {isInstalled && (
        <div
          title="App instalado — disponível offline"
          className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs"
        >
          ✓ <span className="hidden sm:inline">App</span>
        </div>
      )}
    </div>
  );
}
