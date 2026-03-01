import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSupabase } from './hooks/useSupabase';
import Header from './components/Header';
import ConfiguracaoTab from './components/ConfiguracaoTab';
import GradeTab from './components/GradeTab';
import SubstituicaoTab from './components/SubstituicaoTab';
import HistoricoTab from './components/HistoricoTab';
import AjudaTab from './components/AjudaTab';
import AreaConhecimentoTab from './components/AreaConhecimentoTab';
import DisponibilidadeTab from './components/DisponibilidadeTab';
import CompartilhamentoModal from './components/CompartilhamentoModal';
import DashboardTab from './components/DashboardTab';
import { PWAStatus } from './components/PWAStatus';
import InstalacaoTab from './components/InstalacaoTab';
import SupabaseStatus from './components/SupabaseStatus';
import SupabaseConfigModal from './components/SupabaseConfigModal';

type Aba = 'dashboard' | 'configuracao' | 'areas' | 'grade' | 'disponibilidade' | 'substituicao' | 'historico' | 'ajuda' | 'instalar';

function App() {
  const [abaAtiva, setAbaAtiva]       = useState<Aba>('dashboard');
  const [showModal, setShowModal]     = useState(false);
  const [showSupaModal, setShowSupaModal] = useState(false);
  const [salvandoFlash, setSalvandoFlash] = useState(false);
  const [darkMode, setDarkMode]       = useLocalStorage<boolean>('darkMode', false);

  // ─── Todos os dados + sync Supabase ──────────────────────────────────────
  const {
    turmas,        setTurmas,
    disciplinas,   setDisciplinas,
    professores,   setProfessores,
    aulas,         setAulas,
    substituicoes, setSubstituicoes,
    areas,         setAreas,
    gradeData,
    configuracoes, setConfiguracoes,
    importarDados, limparTudo, forcarSync,
    dadosAtuais,
    status, ultimoSync, erroMsg, supabaseAtivo,
  } = useSupabase();

  // ─── Dark mode ────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // ─── Exportar backup ─────────────────────────────────────────────────────
  const salvarBackupRapido = () => {
    const payload = {
      ...dadosAtuais,
      exportadoEm: new Date().toLocaleString('pt-BR'),
      versao: '3.0',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `substituicao-docente-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSalvandoFlash(true);
    setTimeout(() => setSalvandoFlash(false), 2000);
  };

  // ─── Limpar tudo ─────────────────────────────────────────────────────────
  const limparTodosDados = () => {
    if (confirm('Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita.')) {
      limparTudo();
    }
  };

  const resetarSemana = () => {
    if (confirm('Isso vai zerar as aulas extras de todos os professores. Confirma?')) {
      setProfessores(professores.map(p => ({ ...p, aulasExtras: 0 })));
    }
  };

  const bg = darkMode
    ? 'min-h-screen bg-slate-950 text-slate-100'
    : 'min-h-screen bg-slate-50 text-slate-900';

  return (
    <div className={bg}>
      <PWAStatus />
      <Header
        abaAtiva={abaAtiva}
        setAbaAtiva={(aba) => setAbaAtiva(aba as Aba)}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <main className="container mx-auto px-6 py-8 max-w-screen-xl">

        {abaAtiva === 'dashboard' && (
          <DashboardTab
            professores={professores}
            substituicoes={substituicoes}
            grade={gradeData}
            areas={areas}
            horarios={configuracoes.horarios}
            turmas={turmas}
            disciplinas={disciplinas}
            limiteAulas={configuracoes.limiteAulasSemanais}
            darkMode={darkMode}
          />
        )}

        {abaAtiva === 'configuracao' && (
          <ConfiguracaoTab
            turmas={turmas}               setTurmas={setTurmas}
            disciplinas={disciplinas}     setDisciplinas={setDisciplinas}
            professores={professores}     setProfessores={setProfessores}
            aulas={aulas}                 setAulas={setAulas}
            configuracoes={configuracoes} setConfiguracoes={setConfiguracoes}
            limparTodosDados={limparTodosDados}
          />
        )}

        {abaAtiva === 'areas' && (
          <AreaConhecimentoTab
            areas={areas}             setAreas={setAreas}
            professores={professores}
            disciplinas={disciplinas}
          />
        )}

        {abaAtiva === 'grade' && (
          <GradeTab
            professores={professores}
            aulas={aulas}             setAulas={setAulas}
            turmas={turmas}
            disciplinas={disciplinas}
            horarios={configuracoes.horarios}
          />
        )}

        {abaAtiva === 'disponibilidade' && (
          <DisponibilidadeTab
            professores={professores}
            aulas={aulas}
            turmas={turmas}
            disciplinas={disciplinas}
            horarios={configuracoes.horarios}
            substituicoes={substituicoes}
            limiteAulas={configuracoes.limiteAulasSemanais}
          />
        )}

        {abaAtiva === 'substituicao' && (
          <SubstituicaoTab
            professores={professores}     setProfessores={setProfessores}
            aulas={aulas}
            substituicoes={substituicoes} setSubstituicoes={setSubstituicoes}
            turmas={turmas}
            disciplinas={disciplinas}
            horarios={configuracoes.horarios}
            limiteAulas={configuracoes.limiteAulasSemanais}
            areas={areas}
          />
        )}

        {abaAtiva === 'historico' && (
          <HistoricoTab
            professores={professores}
            substituicoes={substituicoes}
            turmas={turmas}
            disciplinas={disciplinas}
            horarios={configuracoes.horarios}
          />
        )}

        {abaAtiva === 'ajuda' && <AjudaTab />}

        {abaAtiva === 'instalar' && <InstalacaoTab />}

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="container mx-auto px-6 max-w-screen-xl py-5">

          {/* Linha principal */}
          <div className="flex flex-wrap items-center justify-between gap-4">

            {/* Identidade */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">SubstDoc</div>
                <div className="text-xs text-slate-400">6º ao 9º ano · Período Integral</div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={salvarBackupRapido}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${
                  salvandoFlash
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                {salvandoFlash ? 'Salvo!' : 'Salvar Backup'}
              </button>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9"/>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                  <polyline points="7 23 3 19 7 15"/>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                </svg>
                Compartilhar / Importar
              </button>

              <button
                onClick={resetarSemana}
                className="flex items-center gap-2 bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 hover:border-amber-300 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Nova Semana
              </button>
            </div>

            {/* Estatísticas */}
            <div className="flex items-center gap-5 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full inline-block"/>
                <strong className="text-slate-700 font-semibold">{professores.length}</strong> professores
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full inline-block"/>
                <strong className="text-slate-700 font-semibold">{aulas.length}</strong> aulas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block"/>
                <strong className="text-slate-700 font-semibold">{substituicoes.length}</strong> substituições
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full inline-block"/>
                Limite: <strong className="text-slate-700 font-semibold">{configuracoes.limiteAulasSemanais}</strong>/sem.
              </span>
            </div>
          </div>

          {/* Linha 2 — status e sync */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">

            <div className="flex items-center gap-4 flex-wrap">
              <SupabaseStatus
                status={status}
                ultimoSync={ultimoSync}
                erroMsg={erroMsg}
                supabaseAtivo={supabaseAtivo}
                onForcarSync={forcarSync}
                darkMode={darkMode}
              />
              {!supabaseAtivo && (
                <button
                  onClick={() => setShowSupaModal(true)}
                  className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                >
                  Configurar banco de dados →
                </button>
              )}
              {ultimoSync && supabaseAtivo && (
                <span className="text-xs text-slate-400">
                  Sincronizado: <span className="text-slate-600 font-medium">{ultimoSync}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <button
                onClick={() => setAbaAtiva('instalar')}
                className="text-blue-500 hover:text-blue-700 font-medium transition-colors"
              >
                Instalar App
              </button>
              <span className="text-slate-300">|</span>
              <span className="hidden sm:inline">
                {supabaseAtivo ? '☁ Supabase ativo' : '⬡ Dados locais'}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modais */}
      {showModal && (
        <CompartilhamentoModal
          onClose={() => setShowModal(false)}
          dados={dadosAtuais}
          onImportar={(dados) => { importarDados(dados); setShowModal(false); }}
        />
      )}

      {showSupaModal && (
        <SupabaseConfigModal onClose={() => setShowSupaModal(false)} />
      )}
    </div>
  );
}

export default App;
