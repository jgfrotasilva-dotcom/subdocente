import { OnlineStatusIcon } from './PWAStatus';

interface HeaderProps {
  abaAtiva: string;
  setAbaAtiva: (aba: 'dashboard' | 'configuracao' | 'areas' | 'grade' | 'disponibilidade' | 'substituicao' | 'historico' | 'ajuda' | 'instalar') => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ABAS = [
  { id: 'dashboard',       label: 'Dashboard',       icon: '⊞',  },
  { id: 'configuracao',    label: 'Configurações',   icon: '⚙',  },
  { id: 'areas',           label: 'Áreas',           icon: '◈',  },
  { id: 'grade',           label: 'Grade Horária',   icon: '▦',  },
  { id: 'disponibilidade', label: 'Disponibilidade', icon: '◷',  },
  { id: 'substituicao',    label: 'Substituição',    icon: '⇄',  },
  { id: 'historico',       label: 'Histórico',       icon: '≡',  },
  { id: 'ajuda',           label: 'Ajuda',           icon: '?',  },
  { id: 'instalar',        label: 'Instalar App',    icon: '↓',  },
] as const;

export default function Header({ abaAtiva, setAbaAtiva, darkMode, toggleDarkMode }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-6 max-w-screen-xl">

        {/* Topo */}
        <div className="flex items-center justify-between h-16 border-b border-slate-100">

          {/* Logo + nome */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <h1 className="text-slate-900 font-bold text-base leading-tight tracking-tight">
                SubstDoc
              </h1>
              <p className="text-slate-400 text-xs font-medium">
                Sistema de Substituição Docente
              </p>
            </div>
          </div>

          {/* Info + ações */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <span className="text-blue-500">●</span>
              <span>6º ao 9º Ano · Período Integral · 9 horas</span>
            </div>

            <OnlineStatusIcon />

            <button
              onClick={toggleDarkMode}
              title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
              className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-medium transition-colors"
            >
              {darkMode ? '☀' : '☾'}
            </button>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide py-0">
          {ABAS.map(aba => {
            const isActive = abaAtiva === aba.id;
            return (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium
                  whitespace-nowrap flex-shrink-0 transition-all duration-150
                  ${isActive
                    ? 'text-blue-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }
                `}
              >
                <span className={`text-xs font-bold ${isActive ? 'text-blue-500' : 'text-slate-400'}`}>
                  {aba.icon}
                </span>
                <span className="hidden sm:inline">{aba.label}</span>

                {/* Indicador ativo */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
