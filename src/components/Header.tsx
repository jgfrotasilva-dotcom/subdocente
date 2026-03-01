interface HeaderProps {
  abaAtiva: string;
  setAbaAtiva: (aba: 'dashboard' | 'configuracao' | 'areas' | 'grade' | 'disponibilidade' | 'substituicao' | 'historico' | 'ajuda') => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ABAS = [
  { id: 'dashboard',      label: 'Dashboard',            icon: '🏠', cor: 'sky' },
  { id: 'configuracao',   label: 'Configurações',        icon: '⚙️',  cor: '' },
  { id: 'areas',          label: 'Áreas',                icon: '🧩', cor: 'violet' },
  { id: 'grade',          label: 'Grade Horária',        icon: '📅',  cor: '' },
  { id: 'disponibilidade',label: 'Disponibilidade',      icon: '🗓️',  cor: 'teal' },
  { id: 'substituicao',   label: 'Substituição',         icon: '🔄',  cor: 'green' },
  { id: 'historico',      label: 'Histórico',            icon: '📊',  cor: '' },
  { id: 'ajuda',          label: 'Ajuda',                icon: '❓',  cor: 'amber' },
] as const;

const corAtiva: Record<string, string> = {
  sky:    'bg-sky-300 text-sky-900 shadow-md',
  violet: 'bg-violet-200 text-violet-900 shadow-md',
  teal:   'bg-teal-200 text-teal-900 shadow-md',
  green:  'bg-green-200 text-green-900 shadow-md',
  amber:  'bg-amber-300 text-amber-900 shadow-md',
  '':     'bg-white text-indigo-700 shadow-md',
};

const corInativa: Record<string, string> = {
  sky:    'text-sky-200 hover:bg-sky-400/20 hover:text-sky-100',
  violet: 'text-violet-200 hover:bg-violet-400/20 hover:text-violet-100',
  teal:   'text-teal-200 hover:bg-teal-400/20 hover:text-teal-100',
  green:  'text-green-200 hover:bg-green-400/20 hover:text-green-100',
  amber:  'text-amber-200 hover:bg-amber-400/20 hover:text-amber-100',
  '':     'text-indigo-100 hover:bg-white/20 hover:text-white',
};

export default function Header({ abaAtiva, setAbaAtiva, darkMode, toggleDarkMode }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 shadow-xl sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-screen-xl">

        {/* Topo */}
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl shadow-inner">
              🏫
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-tight tracking-tight">
                SubstDoc
              </h1>
              <p className="text-indigo-200 text-xs font-medium">
                Escala de Substituição Docente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-indigo-200 bg-white/10 px-3 py-1.5 rounded-full">
              <span>📚</span>
              <span>6º ao 9º Ano · Período Integral · 9 horas</span>
            </div>

            {/* Toggle Modo Escuro */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center text-xl"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Abas */}
        <nav className="flex gap-1 py-2 overflow-x-auto scrollbar-hide">
          {ABAS.map(aba => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0
                ${abaAtiva === aba.id ? corAtiva[aba.cor] : corInativa[aba.cor]}
              `}
            >
              <span>{aba.icon}</span>
              <span className="hidden sm:inline">{aba.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
