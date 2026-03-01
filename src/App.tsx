import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Professor, Aula, Substituicao, Turma, Disciplina, Configuracoes, AreaConhecimento } from './types';
import { horariosIniciais } from './data/initialData';
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

type Aba = 'dashboard' | 'configuracao' | 'areas' | 'grade' | 'disponibilidade' | 'substituicao' | 'historico' | 'ajuda';

// Grade: dia -> horarioIdx -> slots
type GradeSlot = { professorId: string; disciplinaId: string; turmaId: string };
type Grade = Record<string, Record<number, GradeSlot[]>>;

function App() {
  const [abaAtiva, setAbaAtiva] = useState<Aba>('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [salvandoFlash, setSalvandoFlash] = useState(false);
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('darkMode', false);

  // ─── Persistência local (localStorage) ───────────────────
  const [turmas, setTurmas]               = useLocalStorage<Turma[]>('turmas', []);
  const [disciplinas, setDisciplinas]     = useLocalStorage<Disciplina[]>('disciplinas', []);
  const [professores, setProfessores]     = useLocalStorage<Professor[]>('professores', []);
  const [aulas, setAulas]                 = useLocalStorage<Aula[]>('aulas', []);
  const [substituicoes, setSubstituicoes] = useLocalStorage<Substituicao[]>('substituicoes', []);
  const [areas, setAreas]                 = useLocalStorage<AreaConhecimento[]>('areas', []);
  const [gradeData, setGradeData]         = useLocalStorage<Grade>('gradeHoraria', {});
  const [configuracoes, setConfiguracoes] = useLocalStorage<Configuracoes>('configuracoes', {
    limiteAulasSemanais: 32,
    horarios: horariosIniciais,
  });
  const [ultimoSalvamento, setUltimoSalvamento] = useLocalStorage<string>('ultimoSalvamento', '');

  // ─── Aplicar dark mode no <html> ─────────────────────────
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // ─── Dados consolidados para export/import ────────────────
  const dadosAtuais = { turmas, disciplinas, professores, aulas, substituicoes, areas, configuracoes, gradeData };

  // ─── Exportar como backup rápido ─────────────────────────
  const salvarBackupRapido = () => {
    const payload = {
      ...dadosAtuais,
      exportadoEm: new Date().toLocaleString('pt-BR'),
      versao: '2.0',
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const data = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    a.href = url;
    a.download = `substituicao-docente-${data}.json`;
    a.click();
    URL.revokeObjectURL(url);
    const agora = new Date().toLocaleString('pt-BR');
    setUltimoSalvamento(agora);
    setSalvandoFlash(true);
    setTimeout(() => setSalvandoFlash(false), 2000);
  };

  // ─── Importar ─────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleImportar = (dados: any) => {
    setTurmas(dados.turmas ?? []);
    setDisciplinas(dados.disciplinas ?? []);
    setProfessores(dados.professores ?? []);
    setAulas(dados.aulas ?? []);
    setSubstituicoes(dados.substituicoes ?? []);
    setAreas(dados.areas ?? []);
    if (dados.gradeData) setGradeData(dados.gradeData);
    if (dados.configuracoes) setConfiguracoes(dados.configuracoes);
    setUltimoSalvamento(new Date().toLocaleString('pt-BR') + ' (importado)');
  };

  // ─── Limpar tudo ─────────────────────────────────────────
  const limparTodosDados = () => {
    if (confirm('Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita.')) {
      setTurmas([]);
      setDisciplinas([]);
      setProfessores([]);
      setAulas([]);
      setSubstituicoes([]);
      setAreas([]);
      setGradeData({});
      setConfiguracoes({ limiteAulasSemanais: 32, horarios: horariosIniciais });
      setUltimoSalvamento('');
    }
  };

  const resetarSemana = () => {
    if (confirm('Isso vai zerar as aulas extras de todos os professores. Confirma?')) {
      setProfessores(professores.map(p => ({ ...p, aulasExtras: 0 })));
    }
  };

  const totalProfessores = professores.length;
  const totalSubst       = substituicoes.length;
  const totalAulasGrade  = aulas.length;

  const bg = darkMode
    ? 'min-h-screen bg-gray-900 text-gray-100'
    : 'min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 text-gray-900';

  return (
    <div className={bg}>
      <Header
        abaAtiva={abaAtiva}
        setAbaAtiva={(aba) => setAbaAtiva(aba as Aba)}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <main className="container mx-auto px-4 py-6 max-w-screen-xl">

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
            areas={areas}           setAreas={setAreas}
            professores={professores}
            disciplinas={disciplinas}
          />
        )}

        {abaAtiva === 'grade' && (
          <GradeTab
            professores={professores}
            aulas={aulas}           setAulas={setAulas}
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

        {abaAtiva === 'ajuda' && (
          <AjudaTab />
        )}

      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className={`${darkMode ? 'bg-gray-950 border-t border-gray-800' : 'bg-gray-900'} text-white py-4 mt-10`}>
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">

            {/* Identidade */}
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏫</div>
              <div>
                <div className="text-sm font-bold">Sistema de Substituição Docente</div>
                <div className="text-xs text-gray-400">Ensino Fundamental — 6º ao 9º ano | Período Integral</div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={salvarBackupRapido}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  salvandoFlash ? 'bg-emerald-500 text-white scale-95' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {salvandoFlash ? '✅ Salvo!' : '💾 Salvar Backup'}
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
              >
                🔄 Compartilhar / Importar
              </button>
              <button
                onClick={resetarSemana}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
              >
                📅 Nova Semana
              </button>
            </div>

            {/* Estatísticas */}
            <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
              <span>👨‍🏫 <strong className="text-white">{totalProfessores}</strong> prof.</span>
              <span>📅 <strong className="text-white">{totalAulasGrade}</strong> aulas</span>
              <span>🔄 <strong className="text-white">{totalSubst}</strong> subst.</span>
              <span>⏱️ Limite: <strong className="text-white">{configuracoes.limiteAulasSemanais}</strong>/sem.</span>
            </div>
          </div>

          {ultimoSalvamento ? (
            <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-500 flex items-center gap-2">
              <span className="text-emerald-400">✔</span>
              Último backup: <span className="text-gray-300">{ultimoSalvamento}</span>
            </div>
          ) : (
            <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-500">
              💡 Dados salvos automaticamente no navegador. Clique em <strong className="text-gray-300">Salvar Backup</strong> para gerar arquivo compartilhável.
            </div>
          )}
        </div>
      </footer>

      {showModal && (
        <CompartilhamentoModal
          onClose={() => setShowModal(false)}
          dados={dadosAtuais}
          onImportar={(dados) => {
            handleImportar(dados);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
