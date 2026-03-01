import { useState, useMemo } from 'react';
import { Professor, Aula, Turma, Disciplina, HorarioAula, Substituicao } from '../types';
import { DIAS_SEMANA } from '../types';

interface DisponibilidadeTabProps {
  professores: Professor[];
  aulas: Aula[];
  turmas: Turma[];
  disciplinas: Disciplina[];
  horarios: HorarioAula[];
  substituicoes: Substituicao[];
  limiteAulas: number;
}

const CORES_DIAS = [
  { bg: 'bg-sky-500',    light: 'bg-sky-50',    border: 'border-sky-200',    text: 'text-sky-700',    badge: 'bg-sky-100 text-sky-800'    },
  { bg: 'bg-violet-500', light: 'bg-violet-50',  border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-800' },
  { bg: 'bg-emerald-500',light: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700',badge: 'bg-emerald-100 text-emerald-800'},
  { bg: 'bg-amber-500',  light: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-800'  },
  { bg: 'bg-rose-500',   light: 'bg-rose-50',    border: 'border-rose-200',   text: 'text-rose-700',   badge: 'bg-rose-100 text-rose-800'    },
];

const PALETA_DISCIPLINAS = [
  'bg-indigo-500','bg-pink-500','bg-amber-500','bg-emerald-500',
  'bg-sky-500','bg-violet-500','bg-orange-500','bg-teal-500',
  'bg-rose-500','bg-cyan-500','bg-lime-500','bg-fuchsia-500',
];

function getCorDisciplina(disciplinaId: string, disciplinas: Disciplina[]): string {
  const idx = disciplinas.findIndex(d => d.id === disciplinaId);
  return PALETA_DISCIPLINAS[idx % PALETA_DISCIPLINAS.length] ?? 'bg-gray-400';
}

function getIniciais(nome: string): string {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

/**
 * Extrai apenas o ano e turma do nome completo.
 * Ex: "7º ANO B INTEGRAL 9H ANUAL" → "7º B"
 *     "6º ANO A INTEGRAL 9H ANUAL" → "6º A"
 *     "9º ANO C"                   → "9º C"
 */
function extrairAnoTurma(nomeCompleto: string): string {
  if (!nomeCompleto) return '—';
  // Tenta capturar padrão: dígito + º/o + ANO? + letra de turma
  const match = nomeCompleto.match(/(\d+\s*[ºo°])\s*(?:ANO)?\s*([A-Z])/i);
  if (match) {
    const ano = match[1].trim().replace(/o$/i, 'º');
    const turma = match[2].toUpperCase();
    return `${ano} ${turma}`;
  }
  // Fallback: retorna as 2 primeiras palavras
  return nomeCompleto.split(' ').slice(0, 2).join(' ');
}

const AVATAR_CORES = [
  'from-indigo-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-sky-500 to-cyan-600',
  'from-fuchsia-500 to-purple-600',
];

export default function DisponibilidadeTab({
  professores,
  aulas,
  turmas,
  disciplinas,
  horarios,
  substituicoes,
  limiteAulas,
}: DisponibilidadeTabProps) {
  const [professorSelecionado, setProfessorSelecionado] = useState<string>('');
  const [busca, setBusca] = useState('');
  const [modoVista, setModoVista] = useState<'grade' | 'lista'>('grade');

  const professoresFiltrados = useMemo(() =>
    professores.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
  , [professores, busca]);

  const professor = useMemo(() =>
    professores.find(p => p.id === professorSelecionado)
  , [professores, professorSelecionado]);

  // Monta mapa de aulas do professor selecionado: dia -> horario -> aula
  const mapaAulas = useMemo(() => {
    if (!professor) return {};
    const mapa: Record<number, Record<number, Aula>> = {};
    DIAS_SEMANA.forEach(d => { mapa[d.valor] = {}; });
    aulas
      .filter(a => a.professorId === professor.id)
      .forEach(a => {
        if (!mapa[a.diaSemana]) mapa[a.diaSemana] = {};
        mapa[a.diaSemana][a.horario] = a;
      });
    return mapa;
  }, [professor, aulas]);

  // Estatísticas do professor
  const stats = useMemo(() => {
    if (!professor) return null;
    let aulasOcupadas = 0;
    let aulasLivres = 0;
    const totalSlots = horarios.length * DIAS_SEMANA.length;

    DIAS_SEMANA.forEach(d => {
      horarios.forEach(h => {
        if (mapaAulas[d.valor]?.[h.aula]) aulasOcupadas++;
        else aulasLivres++;
      });
    });

    const aulasExtras = professor.aulasExtras ?? 0;
    const totalSemana = professor.aulasSemanais + aulasExtras;
    const saldoDisponivel = Math.max(0, limiteAulas - totalSemana);
    const percentual = Math.min(100, Math.round((totalSemana / limiteAulas) * 100));

    // Dias mais carregados
    const aulasPorDia = DIAS_SEMANA.map(d => ({
      dia: d,
      count: horarios.filter(h => mapaAulas[d.valor]?.[h.aula]).length,
    }));

    // Substituições feitas no histórico
    const substFeitas = substituicoes.filter(s => s.professorSubstitutoId === professor.id).length;
    const substRecebidas = substituicoes.filter(s => s.professorFaltouId === professor.id).length;

    return {
      aulasOcupadas,
      aulasLivres,
      totalSlots,
      totalSemana,
      saldoDisponivel,
      percentual,
      aulasPorDia,
      substFeitas,
      substRecebidas,
    };
  }, [professor, mapaAulas, horarios, limiteAulas, substituicoes]);

  // Slots livres por dia
  const slotLivresPorDia = useMemo(() => {
    if (!professor) return {};
    const resultado: Record<number, number[]> = {};
    DIAS_SEMANA.forEach(d => {
      resultado[d.valor] = horarios
        .filter(h => !mapaAulas[d.valor]?.[h.aula])
        .map(h => h.aula);
    });
    return resultado;
  }, [professor, mapaAulas, horarios]);

  const avatarCor = professor
    ? AVATAR_CORES[professores.indexOf(professor) % AVATAR_CORES.length]
    : AVATAR_CORES[0];

  return (
    <div className="space-y-6">

      {/* ── Título da aba ───────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-2xl shadow-lg">
          🗓️
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800">Disponibilidade Docente</h2>
          <p className="text-gray-500 text-sm">Selecione um professor para visualizar seu horário e disponibilidade semanal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* ── Coluna esquerda: lista de professores ───── */}
        <div className="xl:col-span-1 space-y-4">

          {/* Busca */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Buscar professor..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
            />
          </div>

          {/* Cards dos professores */}
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {professoresFiltrados.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">👨‍🏫</div>
                <p className="text-sm">Nenhum professor encontrado</p>
              </div>
            )}
            {professoresFiltrados.map((prof, idx) => {
              const cor = AVATAR_CORES[idx % AVATAR_CORES.length];
              const totalProf = prof.aulasSemanais + (prof.aulasExtras ?? 0);
              const pct = Math.min(100, Math.round((totalProf / limiteAulas) * 100));
              const selecionado = prof.id === professorSelecionado;
              const acimaDolimite = totalProf > limiteAulas;

              return (
                <button
                  key={prof.id}
                  onClick={() => setProfessorSelecionado(prof.id)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                    selecionado
                      ? 'border-teal-400 bg-teal-50 shadow-md'
                      : 'border-gray-100 bg-white hover:border-teal-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cor} flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0`}>
                      {getIniciais(prof.nome)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{prof.nome}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              acimaDolimite ? 'bg-red-500' : pct > 75 ? 'bg-amber-500' : 'bg-teal-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${acimaDolimite ? 'text-red-600' : 'text-gray-500'}`}>
                          {totalProf}/{limiteAulas}
                        </span>
                      </div>
                    </div>
                    {selecionado && (
                      <span className="text-teal-500 text-lg">▶</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Coluna direita: detalhes ─────────────────── */}
        <div className="xl:col-span-3 space-y-5">

          {/* Estado vazio */}
          {!professor && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="text-6xl mb-4">👈</div>
              <p className="text-lg font-semibold">Selecione um professor</p>
              <p className="text-sm mt-1">O horário semanal e a disponibilidade serão exibidos aqui</p>
            </div>
          )}

          {professor && stats && (
            <>
              {/* ── Header do professor ─────────────────── */}
              <div className={`bg-gradient-to-r ${avatarCor} rounded-2xl p-5 text-white shadow-lg`}>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-black shadow-inner">
                    {getIniciais(professor.nome)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black">{professor.nome}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {professor.atribuicoes?.map((atr, i) => {
                        const disc = disciplinas.find(d => d.id === atr.disciplinaId);
                        const turma = turmas.find(t => t.id === atr.turmaId);
                        return disc && turma ? (
                          <span key={i} className="bg-white/20 backdrop-blur px-2 py-0.5 rounded-full text-xs font-medium">
                            {disc.nome} • {extrairAnoTurma(turma.nome)}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  {/* Saldo */}
                  <div className="text-right">
                    <div className="text-3xl font-black">{stats.saldoDisponivel}</div>
                    <div className="text-white/80 text-xs">aulas disponíveis</div>
                    <div className="text-white/60 text-xs mt-0.5">{stats.totalSemana}/{limiteAulas} usadas</div>
                  </div>
                </div>

                {/* Barra de carga semanal */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/70 mb-1">
                    <span>Carga semanal</span>
                    <span>{stats.percentual}% do limite</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stats.percentual > 100 ? 'bg-red-400' :
                        stats.percentual > 75 ? 'bg-amber-300' : 'bg-white'
                      }`}
                      style={{ width: `${Math.min(100, stats.percentual)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* ── Cards de estatísticas ───────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    icon: '📚', label: 'Aulas na Grade', value: stats.aulasOcupadas,
                    color: 'from-indigo-50 to-indigo-100 border-indigo-200', text: 'text-indigo-700',
                  },
                  {
                    icon: '✅', label: 'Horários Livres', value: stats.aulasLivres,
                    color: 'from-emerald-50 to-emerald-100 border-emerald-200', text: 'text-emerald-700',
                  },
                  {
                    icon: '🔄', label: 'Substituiu', value: stats.substFeitas,
                    color: 'from-violet-50 to-violet-100 border-violet-200', text: 'text-violet-700',
                  },
                  {
                    icon: '🚨', label: 'Faltou', value: stats.substRecebidas,
                    color: 'from-rose-50 to-rose-100 border-rose-200', text: 'text-rose-700',
                  },
                ].map((card, i) => (
                  <div key={i} className={`bg-gradient-to-br ${card.color} border rounded-2xl p-4 text-center shadow-sm`}>
                    <div className="text-2xl mb-1">{card.icon}</div>
                    <div className={`text-3xl font-black ${card.text}`}>{card.value}</div>
                    <div className="text-gray-500 text-xs mt-1">{card.label}</div>
                  </div>
                ))}
              </div>

              {/* ── Carga por dia ───────────────────────── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span>📊</span> Distribuição por Dia da Semana
                </h4>
                <div className="grid grid-cols-5 gap-3">
                  {stats.aulasPorDia.map((item, idx) => {
                    const cor = CORES_DIAS[idx];
                    const pct = Math.round((item.count / horarios.length) * 100);
                    const livres = horarios.length - item.count;
                    return (
                      <div key={idx} className={`${cor.light} ${cor.border} border rounded-xl p-3 text-center`}>
                        <div className={`text-xs font-bold ${cor.text} mb-2`}>
                          {item.dia.nome.split('-')[0]}
                        </div>
                        {/* Barras verticais representando os horários */}
                        <div className="flex gap-0.5 justify-center mb-2">
                          {horarios.map(h => {
                            const ocupado = !!mapaAulas[item.dia.valor]?.[h.aula];
                            return (
                              <div
                                key={h.aula}
                                title={`${h.aula}ª aula: ${ocupado ? 'Ocupado' : 'Livre'}`}
                                className={`w-2 rounded-full transition-all ${
                                  ocupado ? `${cor.bg}` : 'bg-white border border-gray-200'
                                }`}
                                style={{ height: '20px' }}
                              />
                            );
                          })}
                        </div>
                        <div className={`text-xl font-black ${cor.text}`}>{item.count}</div>
                        <div className="text-gray-400 text-xs">{livres} livres</div>
                        <div className={`text-xs font-semibold ${cor.text} mt-1`}>{pct}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Alternador de vista ─────────────────── */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">Visualizar como:</span>
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setModoVista('grade')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      modoVista === 'grade'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📅 Grade
                  </button>
                  <button
                    onClick={() => setModoVista('lista')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      modoVista === 'lista'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📋 Lista
                  </button>
                </div>
              </div>

              {/* ── GRADE HORÁRIA ───────────────────────── */}
              {modoVista === 'grade' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h4 className="font-bold text-gray-700 flex items-center gap-2">
                      <span>📅</span> Grade Horária Semanal
                    </h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr>
                          <th className="bg-gray-50 border border-gray-100 px-3 py-3 text-gray-500 font-bold text-xs w-20 text-left">
                            Horário
                          </th>
                          {DIAS_SEMANA.map((dia, idx) => {
                            const cor = CORES_DIAS[idx];
                            return (
                              <th key={dia.valor} className={`border border-gray-100 px-3 py-3`}>
                                <div className={`${cor.bg} text-white rounded-xl px-3 py-1.5 text-xs font-bold text-center`}>
                                  <div>{dia.nome.split('-')[0]}</div>
                                  <div className="opacity-75 font-normal">
                                    {slotLivresPorDia[dia.valor]?.length ?? 0} livres
                                  </div>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {horarios.map(h => (
                          <tr key={h.aula} className="hover:bg-gray-50/50 transition-colors">
                            {/* Horário */}
                            <td className="border border-gray-100 px-3 py-2 bg-gray-50">
                              <div className="text-xs font-bold text-gray-700">{h.aula}ª</div>
                              <div className="text-xs text-gray-400">{h.inicio}</div>
                              <div className="text-xs text-gray-400">{h.fim}</div>
                            </td>

                            {/* Células de cada dia */}
                            {DIAS_SEMANA.map((dia, idx) => {
                              const cor = CORES_DIAS[idx];
                              const aula = mapaAulas[dia.valor]?.[h.aula];

                              if (aula) {
                                const disc = disciplinas.find(d => d.id === aula.disciplinaId);
                                const turma = turmas.find(t => t.id === aula.turmaId);
                                const corDisc = getCorDisciplina(aula.disciplinaId, disciplinas);
                                return (
                                  <td key={dia.valor} className="border border-gray-100 p-1.5">
                                    <div className={`rounded-lg p-2 h-full min-h-[60px] ${corDisc} bg-opacity-10`}>
                                      <div className="flex flex-col gap-1">
                                        <span className={`text-xs font-black text-white px-1.5 py-0.5 rounded-md ${corDisc} inline-block w-fit leading-tight`}>
                                          {extrairAnoTurma(turma?.nome ?? '')}
                                        </span>
                                        <span className="text-xs text-gray-800 font-semibold leading-tight">
                                          {disc?.nome ?? '—'}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                );
                              }

                              // Slot livre
                              return (
                                <td key={dia.valor} className="border border-gray-100 p-1.5">
                                  <div className={`${cor.light} ${cor.border} border rounded-lg min-h-[60px] flex items-center justify-center`}>
                                    <div className="text-center">
                                      <div className={`text-lg ${cor.text}`}>✓</div>
                                      <div className={`text-xs font-semibold ${cor.text}`}>Livre</div>
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Legenda */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-indigo-500"></div>
                        <span className="text-gray-600">Aula alocada (cor = disciplina)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 text-xs">✓</div>
                        <span className="text-gray-600">Horário livre (disponível para substituição)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── VISTA EM LISTA ──────────────────────── */}
              {modoVista === 'lista' && (
                <div className="space-y-4">
                  {DIAS_SEMANA.map((dia, idx) => {
                    const cor = CORES_DIAS[idx];
                    const aulasNoDia = horarios.filter(h => mapaAulas[dia.valor]?.[h.aula]);
                    const livresNoDia = horarios.filter(h => !mapaAulas[dia.valor]?.[h.aula]);

                    return (
                      <div key={dia.valor} className={`bg-white rounded-2xl border ${cor.border} shadow-sm overflow-hidden`}>
                        {/* Header do dia */}
                        <div className={`${cor.bg} px-5 py-3 flex items-center justify-between`}>
                          <h5 className="font-bold text-white text-sm">{dia.nome}</h5>
                          <div className="flex gap-2">
                            <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                              {aulasNoDia.length} aulas
                            </span>
                            <span className="bg-white/30 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                              {livresNoDia.length} livres
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="grid gap-2">
                            {horarios.map(h => {
                              const aula = mapaAulas[dia.valor]?.[h.aula];
                              const disc = aula ? disciplinas.find(d => d.id === aula.disciplinaId) : null;
                              const turma = aula ? turmas.find(t => t.id === aula.turmaId) : null;
                              const corDisc = aula ? getCorDisciplina(aula.disciplinaId, disciplinas) : '';

                              return (
                                <div
                                  key={h.aula}
                                  className={`flex items-center gap-3 rounded-xl p-3 ${
                                    aula
                                      ? 'bg-gray-50 border border-gray-100'
                                      : `${cor.light} border ${cor.border}`
                                  }`}
                                >
                                  {/* Número da aula */}
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                                    aula ? 'bg-gray-200 text-gray-700' : `${cor.bg} text-white`
                                  }`}>
                                    {h.aula}ª
                                  </div>

                                  {/* Horário */}
                                  <div className="text-xs text-gray-400 w-20 flex-shrink-0">
                                    <div>{h.inicio}</div>
                                    <div>{h.fim}</div>
                                  </div>

                                  {/* Conteúdo */}
                                  {aula ? (
                                    <div className="flex items-center gap-2 flex-1 flex-wrap">
                                      <span className={`text-xs font-bold text-white px-2 py-1 rounded-lg ${corDisc} flex-shrink-0`}>
                                        {extrairAnoTurma(turma?.nome ?? '')}
                                      </span>
                                      <span className="text-sm font-semibold text-gray-700">{disc?.nome ?? '—'}</span>
                                    </div>
                                  ) : (
                                    <div className={`flex items-center gap-2 flex-1 ${cor.text}`}>
                                      <span className="text-sm font-bold">✓ LIVRE</span>
                                      <span className="text-xs opacity-70">Disponível para substituição</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Horários livres resumidos ─────────────── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span>✅</span> Resumo de Disponibilidade para Substituição
                </h4>
                {Object.values(slotLivresPorDia).every(s => s.length === 0) ? (
                  <div className="text-center py-6 text-gray-400">
                    <div className="text-3xl mb-2">😰</div>
                    <p className="text-sm font-semibold">Professor sem horários livres na semana</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {DIAS_SEMANA.map((dia, idx) => {
                      const cor = CORES_DIAS[idx];
                      const livres = slotLivresPorDia[dia.valor] ?? [];
                      return (
                        <div key={dia.valor} className={`${cor.light} ${cor.border} border rounded-xl p-3`}>
                          <div className={`text-xs font-black ${cor.text} mb-2`}>
                            {dia.nome.split('-')[0]}
                          </div>
                          {livres.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Sem horários livres</p>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {livres.map(h => {
                                const hor = horarios.find(hr => hr.aula === h);
                                return (
                                  <span
                                    key={h}
                                    title={hor ? `${hor.inicio} - ${hor.fim}` : ''}
                                    className={`${cor.badge} text-xs font-bold px-2 py-0.5 rounded-lg cursor-help`}
                                  >
                                    {h}ª
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          {livres.length > 0 && (
                            <div className={`text-xs ${cor.text} font-semibold mt-2`}>
                              {livres.length} horário{livres.length > 1 ? 's' : ''} livre{livres.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Aviso de saldo */}
                {stats.saldoDisponivel === 0 && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-2xl">🚫</span>
                    <div>
                      <p className="text-red-700 font-bold text-sm">Professor no limite semanal</p>
                      <p className="text-red-500 text-xs">Atingiu {stats.totalSemana} de {limiteAulas} aulas. Não pode realizar mais substituições esta semana.</p>
                    </div>
                  </div>
                )}
                {stats.saldoDisponivel > 0 && stats.saldoDisponivel <= 3 && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="text-amber-700 font-bold text-sm">Saldo reduzido</p>
                      <p className="text-amber-500 text-xs">Restam apenas {stats.saldoDisponivel} aula{stats.saldoDisponivel > 1 ? 's' : ''} disponível{stats.saldoDisponivel > 1 ? 'is' : ''} para substituição.</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
