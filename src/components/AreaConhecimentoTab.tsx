import { useState } from 'react';
import { AreaConhecimento, Professor, Disciplina } from '../types';

interface Props {
  areas: AreaConhecimento[];
  setAreas: (areas: AreaConhecimento[]) => void;
  professores: Professor[];
  disciplinas: Disciplina[];
}

const CORES_OPCOES = [
  { valor: 'indigo',   label: 'Índigo',    bg: 'bg-indigo-600',   light: 'bg-indigo-50',   border: 'border-indigo-300',   text: 'text-indigo-700',   badge: 'bg-indigo-100 text-indigo-800'   },
  { valor: 'emerald',  label: 'Verde',     bg: 'bg-emerald-600',  light: 'bg-emerald-50',  border: 'border-emerald-300',  text: 'text-emerald-700',  badge: 'bg-emerald-100 text-emerald-800'  },
  { valor: 'rose',     label: 'Rosa',      bg: 'bg-rose-600',     light: 'bg-rose-50',     border: 'border-rose-300',     text: 'text-rose-700',     badge: 'bg-rose-100 text-rose-800'     },
  { valor: 'amber',    label: 'Âmbar',     bg: 'bg-amber-500',    light: 'bg-amber-50',    border: 'border-amber-300',    text: 'text-amber-700',    badge: 'bg-amber-100 text-amber-800'    },
  { valor: 'violet',   label: 'Violeta',   bg: 'bg-violet-600',   light: 'bg-violet-50',   border: 'border-violet-300',   text: 'text-violet-700',   badge: 'bg-violet-100 text-violet-800'   },
  { valor: 'cyan',     label: 'Ciano',     bg: 'bg-cyan-600',     light: 'bg-cyan-50',     border: 'border-cyan-300',     text: 'text-cyan-700',     badge: 'bg-cyan-100 text-cyan-800'     },
  { valor: 'orange',   label: 'Laranja',   bg: 'bg-orange-500',   light: 'bg-orange-50',   border: 'border-orange-300',   text: 'text-orange-700',   badge: 'bg-orange-100 text-orange-800'   },
  { valor: 'teal',     label: 'Teal',      bg: 'bg-teal-600',     light: 'bg-teal-50',     border: 'border-teal-300',     text: 'text-teal-700',     badge: 'bg-teal-100 text-teal-800'     },
  { valor: 'pink',     label: 'Pink',      bg: 'bg-pink-600',     light: 'bg-pink-50',     border: 'border-pink-300',     text: 'text-pink-700',     badge: 'bg-pink-100 text-pink-800'     },
  { valor: 'sky',      label: 'Azul Céu',  bg: 'bg-sky-600',      light: 'bg-sky-50',      border: 'border-sky-300',      text: 'text-sky-700',      badge: 'bg-sky-100 text-sky-800'      },
];

const ICONES_OPCOES = ['📚','🔬','🧮','🎨','🌍','💻','🏃','🎵','🌱','📖','🔭','🧪','📐','🗺️','🎭','⚙️','🏛️','🧠'];

const AREAS_PADRAO: Omit<AreaConhecimento, 'id' | 'professorIds' | 'articuladorId' | 'disciplinaIds'>[] = [
  { nome: 'Linguagens',                     cor: 'indigo',  icone: '📖', descricao: 'Língua Portuguesa, Arte, Educação Física, Língua Inglesa'  },
  { nome: 'Matemática',                     cor: 'emerald', icone: '🧮', descricao: 'Matemática e suas aplicações'                              },
  { nome: 'Ciências da Natureza',           cor: 'cyan',    icone: '🔬', descricao: 'Ciências, Biologia, Física, Química'                       },
  { nome: 'Ciências Humanas',               cor: 'amber',   icone: '🌍', descricao: 'História, Geografia, Filosofia, Sociologia'                },
  { nome: 'Ensino Religioso',               cor: 'violet',  icone: '🕊️', descricao: 'Ensino Religioso'                                          },
  { nome: 'Itinerários Formativos / Eletivas', cor: 'rose', icone: '🎨', descricao: 'Projetos, Eletivas, Tutoria, Estudo Orientado'             },
];

function getCor(corValor: string) {
  return CORES_OPCOES.find(c => c.valor === corValor) ?? CORES_OPCOES[0];
}

function gerarId() {
  return Math.random().toString(36).slice(2, 10);
}

function getIniciais(nome: string) {
  return nome.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

export default function AreaConhecimentoTab({ areas, setAreas, professores, disciplinas }: Props) {
  const [areaExpandida, setAreaExpandida] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<AreaConhecimento | null>(null);
  const [secaoAtiva, setSecaoAtiva] = useState<'professores' | 'disciplinas'>('professores');

  // Form nova área
  const [form, setForm] = useState({
    nome: '', cor: 'indigo', icone: '📚', descricao: ''
  });

  // ── Criar áreas padrão ─────────────────────────────────────────────────
  const criarAreasPadrao = () => {
    if (!confirm('Isso vai adicionar as 6 Áreas de Conhecimento da BNCC. Confirma?')) return;
    const novas: AreaConhecimento[] = AREAS_PADRAO.map(a => ({
      ...a, id: gerarId(), professorIds: [], articuladorId: null, disciplinaIds: []
    }));
    setAreas([...areas, ...novas]);
  };

  // ── Abrir modal para nova área ─────────────────────────────────────────
  const abrirNovaArea = () => {
    setEditando(null);
    setForm({ nome: '', cor: 'indigo', icone: '📚', descricao: '' });
    setModalAberto(true);
  };

  // ── Abrir modal para editar ────────────────────────────────────────────
  const abrirEditar = (area: AreaConhecimento) => {
    setEditando(area);
    setForm({ nome: area.nome, cor: area.cor, icone: area.icone, descricao: area.descricao ?? '' });
    setModalAberto(true);
  };

  // ── Salvar área ────────────────────────────────────────────────────────
  const salvarArea = () => {
    if (!form.nome.trim()) return alert('Informe o nome da área!');
    if (editando) {
      setAreas(areas.map(a => a.id === editando.id ? { ...a, ...form } : a));
    } else {
      const nova: AreaConhecimento = {
        id: gerarId(), ...form,
        professorIds: [], articuladorId: null, disciplinaIds: []
      };
      setAreas([...areas, nova]);
    }
    setModalAberto(false);
  };

  // ── Excluir área ───────────────────────────────────────────────────────
  const excluirArea = (id: string) => {
    if (!confirm('Excluir esta área?')) return;
    setAreas(areas.filter(a => a.id !== id));
    if (areaExpandida === id) setAreaExpandida(null);
  };

  // ── Definir articulador ────────────────────────────────────────────────
  const definirArticulador = (areaId: string, profId: string) => {
    setAreas(areas.map(a => {
      if (a.id !== areaId) return a;
      // Garante que o articulador está na lista de professores da área
      const profIds = a.professorIds.includes(profId)
        ? a.professorIds
        : [...a.professorIds, profId];
      return { ...a, articuladorId: a.articuladorId === profId ? null : profId, professorIds: profIds };
    }));
  };

  // ── Adicionar/remover professor na área ───────────────────────────────
  const toggleProfessor = (areaId: string, profId: string) => {
    setAreas(areas.map(a => {
      if (a.id !== areaId) return a;
      const jaEsta = a.professorIds.includes(profId);
      const novosProfIds = jaEsta
        ? a.professorIds.filter(id => id !== profId)
        : [...a.professorIds, profId];
      // Se removendo o articulador, limpa articulador
      const novoArt = jaEsta && a.articuladorId === profId ? null : a.articuladorId;
      return { ...a, professorIds: novosProfIds, articuladorId: novoArt };
    }));
  };

  // ── Adicionar/remover disciplina na área ──────────────────────────────
  const toggleDisciplina = (areaId: string, discId: string) => {
    setAreas(areas.map(a => {
      if (a.id !== areaId) return a;
      const jaEsta = a.disciplinaIds.includes(discId);
      return {
        ...a,
        disciplinaIds: jaEsta
          ? a.disciplinaIds.filter(id => id !== discId)
          : [...a.disciplinaIds, discId]
      };
    }));
  };

  // ── Estatísticas gerais ────────────────────────────────────────────────
  const totalProfsAlocados = new Set(areas.flatMap(a => a.professorIds)).size;
  const totalArticuladores = areas.filter(a => a.articuladorId).length;
  const profsNaoAlocados = professores.filter(p => !areas.some(a => a.professorIds.includes(p.id)));

  return (
    <div className="space-y-6">

      {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-violet-700 via-indigo-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2">
              🧩 Áreas de Conhecimento
            </h2>
            <p className="text-indigo-200 text-sm mt-1">
              Organize os professores por área, defina o Articulador responsável e vincule as disciplinas.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {areas.length === 0 && (
              <button
                onClick={criarAreasPadrao}
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold px-4 py-2 rounded-xl text-sm transition-all shadow"
              >
                ⚡ Criar Áreas da BNCC
              </button>
            )}
            <button
              onClick={abrirNovaArea}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all"
            >
              ＋ Nova Área
            </button>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Áreas Cadastradas',  valor: areas.length,           icon: '🧩', cor: 'bg-white/20' },
            { label: 'Professores Alocados', valor: totalProfsAlocados,   icon: '👨‍🏫', cor: 'bg-white/20' },
            { label: 'Articuladores Definidos', valor: totalArticuladores, icon: '⭐', cor: 'bg-white/20' },
            { label: 'Sem Área Definida',  valor: profsNaoAlocados.length, icon: '⚠️', cor: 'bg-white/20' },
          ].map((s, i) => (
            <div key={i} className={`${s.cor} rounded-xl p-3 text-center`}>
              <div className="text-2xl">{s.icon}</div>
              <div className="text-2xl font-black">{s.valor}</div>
              <div className="text-xs text-indigo-200 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Alerta: professores sem área ──────────────────────────────── */}
      {profsNaoAlocados.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-wrap gap-2 items-center">
          <span className="text-amber-700 font-bold text-sm">⚠️ Professores sem área definida:</span>
          {profsNaoAlocados.map(p => (
            <span key={p.id} className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded-full">
              {p.nome}
            </span>
          ))}
        </div>
      )}

      {/* ── Lista de Áreas ────────────────────────────────────────────── */}
      {areas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">🧩</div>
          <p className="text-gray-500 text-lg font-semibold">Nenhuma área cadastrada</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Crie as áreas da BNCC automaticamente ou adicione manualmente</p>
          <div className="flex gap-3 justify-center">
            <button onClick={criarAreasPadrao} className="bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold px-6 py-3 rounded-xl transition-all">
              ⚡ Criar Áreas da BNCC
            </button>
            <button onClick={abrirNovaArea} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all">
              ＋ Nova Área Manual
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {areas.map(area => {
            const cor = getCor(area.cor);
            const articulador = professores.find(p => p.id === area.articuladorId);
            const profsArea = professores.filter(p => area.professorIds.includes(p.id));
            const discsArea = disciplinas.filter(d => area.disciplinaIds.includes(d.id));
            const expandida = areaExpandida === area.id;

            return (
              <div key={area.id} className={`bg-white rounded-2xl shadow-md border-2 transition-all duration-300 overflow-hidden ${expandida ? cor.border : 'border-gray-100 hover:border-gray-200'}`}>

                {/* ── Cabeçalho do card ──────────────────────────────── */}
                <div
                  className={`flex items-center gap-4 p-5 cursor-pointer transition-all ${expandida ? `${cor.light}` : 'hover:bg-gray-50'}`}
                  onClick={() => setAreaExpandida(expandida ? null : area.id)}
                >
                  {/* Ícone e cor */}
                  <div className={`w-14 h-14 ${cor.bg} rounded-2xl flex items-center justify-center text-3xl shadow-md flex-shrink-0`}>
                    {area.icone}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-black ${cor.text}`}>{area.nome}</h3>
                    {area.descricao && (
                      <p className="text-gray-500 text-xs mt-0.5 truncate">{area.descricao}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {/* Articulador badge */}
                      {articulador ? (
                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${cor.badge}`}>
                          ⭐ Articulador: {articulador.nome}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
                          ⚠️ Sem Articulador
                        </span>
                      )}
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">
                        👨‍🏫 {profsArea.length} professor{profsArea.length !== 1 ? 'es' : ''}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">
                        📚 {discsArea.length} disciplina{discsArea.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Avatares de professores */}
                  <div className="hidden md:flex items-center">
                    <div className="flex -space-x-2">
                      {profsArea.slice(0, 5).map((p, i) => (
                        <div key={p.id}
                          style={{ zIndex: 5 - i }}
                          className={`w-8 h-8 ${cor.bg} rounded-full flex items-center justify-center text-white text-xs font-black border-2 border-white shadow`}
                          title={p.nome}
                        >
                          {getIniciais(p.nome)}
                        </div>
                      ))}
                      {profsArea.length > 5 && (
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-black border-2 border-white">
                          +{profsArea.length - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => abrirEditar(area)}
                      className="w-8 h-8 bg-gray-100 hover:bg-indigo-100 text-gray-500 hover:text-indigo-700 rounded-lg flex items-center justify-center text-sm transition-all"
                      title="Editar área">✏️</button>
                    <button onClick={() => excluirArea(area.id)}
                      className="w-8 h-8 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-lg flex items-center justify-center text-sm transition-all"
                      title="Excluir área">🗑️</button>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${cor.text}`}>
                      {expandida ? '▲' : '▼'}
                    </div>
                  </div>
                </div>

                {/* ── Painel expandido ───────────────────────────────── */}
                {expandida && (
                  <div className="border-t border-gray-100">

                    {/* Abas internas */}
                    <div className="flex border-b border-gray-100 bg-gray-50">
                      <button
                        onClick={() => setSecaoAtiva('professores')}
                        className={`flex-1 py-3 text-sm font-bold transition-all ${secaoAtiva === 'professores' ? `${cor.text} border-b-2 ${cor.border.replace('border-', 'border-b-')} bg-white` : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        👨‍🏫 Professores da Área
                      </button>
                      <button
                        onClick={() => setSecaoAtiva('disciplinas')}
                        className={`flex-1 py-3 text-sm font-bold transition-all ${secaoAtiva === 'disciplinas' ? `${cor.text} border-b-2 ${cor.border.replace('border-', 'border-b-')} bg-white` : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        📚 Disciplinas da Área
                      </button>
                    </div>

                    <div className="p-5">
                      {/* ── SEÇÃO PROFESSORES ────────────────────────── */}
                      {secaoAtiva === 'professores' && (
                        <div className="space-y-4">

                          {/* Professores já alocados */}
                          {profsArea.length > 0 && (
                            <div>
                              <h4 className={`text-sm font-black ${cor.text} mb-3 uppercase tracking-wide`}>
                                Professores Alocados nesta Área
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {profsArea.map(prof => {
                                  const isArt = area.articuladorId === prof.id;
                                  return (
                                    <div key={prof.id}
                                      className={`relative rounded-xl border-2 p-4 transition-all ${isArt ? `${cor.light} ${cor.border}` : 'bg-gray-50 border-gray-200'}`}
                                    >
                                      {isArt && (
                                        <div className={`absolute -top-2 -right-2 ${cor.bg} text-white text-xs font-black px-2 py-0.5 rounded-full shadow`}>
                                          ⭐ Articulador
                                        </div>
                                      )}
                                      <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${isArt ? cor.bg : 'bg-gray-400'} rounded-xl flex items-center justify-center text-white font-black text-sm shadow`}>
                                          {getIniciais(prof.nome)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className={`font-bold text-sm truncate ${isArt ? cor.text : 'text-gray-700'}`}>{prof.nome}</p>
                                          <p className="text-gray-400 text-xs">{prof.aulasSemanais} aulas/sem.</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2 mt-3">
                                        <button
                                          onClick={() => definirArticulador(area.id, prof.id)}
                                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${isArt ? `${cor.bg} text-white` : `bg-gray-200 hover:${cor.light} text-gray-600 hover:${cor.text}`}`}
                                          title={isArt ? 'Remover como Articulador' : 'Definir como Articulador'}
                                        >
                                          {isArt ? '⭐ Articulador' : '☆ Definir Articulador'}
                                        </button>
                                        <button
                                          onClick={() => toggleProfessor(area.id, prof.id)}
                                          className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-500 rounded-lg flex items-center justify-center text-sm transition-all flex-shrink-0"
                                          title="Remover da área"
                                        >✕</button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Professores disponíveis para adicionar */}
                          {professores.filter(p => !area.professorIds.includes(p.id)).length > 0 && (
                            <div>
                              <h4 className="text-sm font-black text-gray-500 mb-3 uppercase tracking-wide">
                                ＋ Adicionar Professores
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {professores
                                  .filter(p => !area.professorIds.includes(p.id))
                                  .map(prof => (
                                    <button
                                      key={prof.id}
                                      onClick={() => toggleProfessor(area.id, prof.id)}
                                      className="flex items-center gap-3 p-3 bg-white border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl transition-all text-left group"
                                    >
                                      <div className="w-8 h-8 bg-gray-200 group-hover:bg-indigo-200 rounded-lg flex items-center justify-center text-gray-500 group-hover:text-indigo-700 font-black text-xs transition-all">
                                        {getIniciais(prof.nome)}
                                      </div>
                                      <span className="text-sm text-gray-600 group-hover:text-indigo-700 font-semibold transition-all truncate">
                                        {prof.nome}
                                      </span>
                                      <span className="ml-auto text-indigo-400 group-hover:text-indigo-600 text-lg">＋</span>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}

                          {professores.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                              <div className="text-4xl mb-2">👨‍🏫</div>
                              <p className="text-sm">Nenhum professor cadastrado ainda.</p>
                              <p className="text-xs mt-1">Cadastre professores na aba Configurações.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── SEÇÃO DISCIPLINAS ────────────────────────── */}
                      {secaoAtiva === 'disciplinas' && (
                        <div className="space-y-4">
                          {discsArea.length > 0 && (
                            <div>
                              <h4 className={`text-sm font-black ${cor.text} mb-3 uppercase tracking-wide`}>
                                Disciplinas desta Área
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {discsArea.map(disc => (
                                  <div key={disc.id}
                                    className={`flex items-center gap-2 ${cor.light} ${cor.border} border rounded-xl px-3 py-2`}
                                  >
                                    <span className={`text-sm font-bold ${cor.text}`}>{disc.nome}</span>
                                    {disc.multiplosDocentes && (
                                      <span className="bg-violet-100 text-violet-700 text-xs px-1.5 py-0.5 rounded-full font-bold">👥</span>
                                    )}
                                    <button
                                      onClick={() => toggleDisciplina(area.id, disc.id)}
                                      className="text-red-400 hover:text-red-600 ml-1 text-sm font-bold"
                                    >✕</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {disciplinas.filter(d => !area.disciplinaIds.includes(d.id)).length > 0 && (
                            <div>
                              <h4 className="text-sm font-black text-gray-500 mb-3 uppercase tracking-wide">
                                ＋ Adicionar Disciplinas
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {disciplinas
                                  .filter(d => !area.disciplinaIds.includes(d.id))
                                  .map(disc => (
                                    <button
                                      key={disc.id}
                                      onClick={() => toggleDisciplina(area.id, disc.id)}
                                      className="flex items-center gap-2 bg-white border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl px-3 py-2 transition-all group"
                                    >
                                      <span className="text-sm text-gray-600 group-hover:text-indigo-700 font-semibold">{disc.nome}</span>
                                      {disc.multiplosDocentes && (
                                        <span className="bg-violet-100 text-violet-700 text-xs px-1.5 py-0.5 rounded-full font-bold">👥</span>
                                      )}
                                      <span className="text-indigo-400 group-hover:text-indigo-600 text-lg">＋</span>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}

                          {disciplinas.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                              <div className="text-4xl mb-2">📚</div>
                              <p className="text-sm">Nenhuma disciplina cadastrada ainda.</p>
                              <p className="text-xs mt-1">Cadastre disciplinas na aba Configurações.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal Nova / Editar Área ──────────────────────────────────── */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

            {/* Header modal */}
            <div className="bg-gradient-to-r from-violet-700 to-indigo-700 p-5 rounded-t-2xl text-white">
              <h3 className="text-lg font-black">
                {editando ? '✏️ Editar Área de Conhecimento' : '🧩 Nova Área de Conhecimento'}
              </h3>
            </div>

            <div className="p-6 space-y-5">

              {/* Nome */}
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Nome da Área *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Linguagens, Matemática, Ciências da Natureza..."
                  className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Descrição (opcional)</label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: Língua Portuguesa, Arte, Educação Física..."
                  className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                />
              </div>

              {/* Ícone */}
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {ICONES_OPCOES.map(ic => (
                    <button
                      key={ic}
                      onClick={() => setForm({ ...form, icone: ic })}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${form.icone === ic ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cor */}
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {CORES_OPCOES.map(c => (
                    <button
                      key={c.valor}
                      onClick={() => setForm({ ...form, cor: c.valor })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 ${form.cor === c.valor ? `${c.light} ${c.border} ${c.text}` : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                    >
                      <div className={`w-4 h-4 rounded-full ${c.bg}`}></div>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-bold mb-2 uppercase">Prévia:</p>
                <div className={`flex items-center gap-3 ${getCor(form.cor).light} p-3 rounded-xl border-2 ${getCor(form.cor).border}`}>
                  <div className={`w-12 h-12 ${getCor(form.cor).bg} rounded-xl flex items-center justify-center text-2xl shadow`}>
                    {form.icone}
                  </div>
                  <div>
                    <p className={`font-black ${getCor(form.cor).text}`}>{form.nome || 'Nome da Área'}</p>
                    <p className="text-gray-500 text-xs">{form.descricao || 'Descrição da área'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 p-5 pt-0">
              <button onClick={() => setModalAberto(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all">
                Cancelar
              </button>
              <button onClick={salvarArea}
                className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg">
                {editando ? '✅ Salvar Alterações' : '✅ Criar Área'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
