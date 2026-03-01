import { useState } from 'react';
import { StatusSync } from '../hooks/useSupabase';

interface Props {
  status: StatusSync;
  ultimoSync: string;
  erroMsg: string;
  supabaseAtivo: boolean;
  onForcarSync: () => void;
  darkMode?: boolean;
}

const statusConfig: Record<StatusSync, { cor: string; icone: string; texto: string; animate?: boolean }> = {
  local:        { cor: 'text-gray-400',   icone: '💾', texto: 'Somente local'    },
  conectando:   { cor: 'text-blue-400',   icone: '🔄', texto: 'Conectando...',   animate: true },
  sincronizado: { cor: 'text-emerald-400',icone: '☁️', texto: 'Sincronizado'     },
  salvando:     { cor: 'text-amber-400',  icone: '⬆️', texto: 'Salvando...',     animate: true },
  erro:         { cor: 'text-red-400',    icone: '⚠️', texto: 'Erro de conexão'  },
};

export default function SupabaseStatus({ status, ultimoSync, erroMsg, supabaseAtivo, onForcarSync }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const cfg = statusConfig[status];

  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={() => setShowTooltip(v => !v)}
        onBlur={() => setTimeout(() => setShowTooltip(false), 150)}
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all
          ${status === 'erro'        ? 'border-red-500/40 bg-red-950/30' :
            status === 'sincronizado'? 'border-emerald-500/30 bg-emerald-950/20' :
            status === 'local'       ? 'border-gray-600/40 bg-gray-800/30' :
                                       'border-amber-500/30 bg-amber-950/20'}
          hover:opacity-80 cursor-pointer`}
      >
        <span className={cfg.animate ? 'animate-spin' : ''}>{cfg.icone}</span>
        <span className={cfg.cor}>{cfg.texto}</span>
        {status === 'erro' && (
          <span className="ml-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4 z-50 text-left">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{supabaseAtivo ? '☁️' : '💾'}</span>
            <span className="font-bold text-white text-sm">
              {supabaseAtivo ? 'Supabase Conectado' : 'Armazenamento Local'}
            </span>
          </div>

          {supabaseAtivo ? (
            <div className="space-y-2 text-xs text-gray-300">
              <div className={`flex items-center gap-2 py-1.5 px-2 rounded-lg ${
                status === 'sincronizado' ? 'bg-emerald-900/40' :
                status === 'erro'         ? 'bg-red-900/40' : 'bg-gray-800'
              }`}>
                <span>{cfg.icone}</span>
                <span className={cfg.cor}>{cfg.texto}</span>
              </div>

              {ultimoSync && (
                <p className="text-gray-400">
                  🕐 Última sincronização: <span className="text-gray-200">{ultimoSync}</span>
                </p>
              )}

              {erroMsg && (
                <div className="bg-red-900/30 border border-red-700/40 rounded-lg p-2">
                  <p className="text-red-300 font-medium">Detalhes do erro:</p>
                  <p className="text-red-400 mt-1 break-all">{erroMsg}</p>
                </div>
              )}

              <div className="pt-2 border-t border-gray-700 flex gap-2">
                <button
                  onClick={() => { onForcarSync(); setShowTooltip(false); }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-1.5 px-3 rounded-lg font-medium transition-colors"
                >
                  🔄 Sincronizar agora
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs text-gray-300">
              <p>Os dados estão salvos <strong className="text-white">apenas neste dispositivo</strong>.</p>
              <p>Para habilitar a sincronização em nuvem com o Supabase, adicione as variáveis de ambiente:</p>
              <div className="bg-gray-800 rounded-lg p-2 font-mono text-gray-300 space-y-1">
                <p className="text-emerald-400">VITE_SUPABASE_URL</p>
                <p className="text-emerald-400">VITE_SUPABASE_ANON_KEY</p>
              </div>
              <p className="text-gray-400">Configure no painel da Vercel ou arquivo <code className="bg-gray-800 px-1 rounded">.env.local</code></p>
            </div>
          )}

          {/* Setinha */}
          <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-gray-900 border-r border-b border-gray-700 rotate-45" />
        </div>
      )}
    </div>
  );
}
