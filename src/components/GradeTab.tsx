import { useState, useMemo } from 'react';
import { Professor, Aula, Turma, Disciplina, HorarioAula, DIAS_SEMANA } from '../types';
import { cn } from '../utils/cn';

interface GradeTabProps {
  professores: Professor[];
  aulas: Aula[];
  setAulas: (aulas: Aula[]) => void;
  turmas: Turma[];
  disciplinas: Disciplina[];
  horarios: HorarioAula[];
}

interface AtribuicaoTurma {
  professorId: string;
  professorNome: string;
  disciplinaId: string;
  disciplinaNome: string;
  multiplosDocentes: boolean;
  aulasAtribuidas: number;
  aulasAlocadas: number;
  aulasFaltando: number;
  cor: string;
  corBg: string;
  corBorder: string;
  corText: string;
}

// Paleta de cores moderna por índice de disciplina
const PALETA = [
  { cor: 'indigo',  bg: 'bg-indigo-100',  border: 'border-indigo-400', text: 'text-indigo-800',  badge: 'bg-indigo-500',  pill: 'bg-indigo-50 border-indigo-200'  },
  { cor: 'rose',    bg: 'bg-rose-100',    border: 'border-rose-400',   text: 'text-rose-800',    badge: 'bg-rose-500',    pill: 'bg-rose-50 border-rose-200'      },
  { cor: 'amber',   bg: 'bg-amber-100',   border: 'border-amber-400',  text: 'text-amber-800',   badge: 'bg-amber-500',   pill: 'bg-amber-50 border-amber-200'    },
  { cor: 'emerald', bg: 'bg-emerald-100', border: 'border-emerald-400',text: 'text-emerald-800', badge: 'bg-emerald-500', pill: 'bg-emerald-50 border-emerald-200'},
  { cor: 'sky',     bg: 'bg-sky-100',     border: 'border-sky-400',    text: 'text-sky-800',     badge: 'bg-sky-500',     pill: 'bg-sky-50 border-sky-200'        },
  { cor: 'violet',  bg: 'bg-violet-100',  border: 'border-violet-400', text: 'text-violet-800',  badge: 'bg-violet-500',  pill: 'bg-violet-50 border-violet-200'  },
  { cor: 'orange',  bg: 'bg-orange-100',  border: 'border-orange-400', text: 'text-orange-800',  badge: 'bg-orange-500',  pill: 'bg-orange-50 border-orange-200'  },
  { cor: 'teal',    bg: 'bg-teal-100',    border: 'border-teal-400',   text: 'text-teal-800',    badge: 'bg-teal-500',    pill: 'bg-teal-50 border-teal-200'      },
  { cor: 'pink',    bg: 'bg-pink-100',    border: 'border-pink-400',   text: 'text-pink-800',    badge: 'bg-pink-500',    pill: 'bg-pink-50 border-pink-200'      },
  { cor: 'cyan',    bg: 'bg-cyan-100',    border: 'border-cyan-400',   text: 'text-cyan-800',    badge: 'bg-cyan-500',    pill: 'bg-cyan-50 border-cyan-200'      },
  { cor: 'lime',    bg: 'bg-lime-100',    border: 'border-lime-400',   text: 'text-lime-800',    badge: 'bg-lime-500',    pill: 'bg-lime-50 border-lime-200'      },
  { cor: 'fuchsia', bg: 'bg-fuchsia-100', border: 'border-fuchsia-400',text: 'text-fuchsia-800', badge: 'bg-fuchsia-500', pill: 'bg-fuchsia-50 border-fuchsia-200'},
];

export default function GradeTab({
  professores,
  aulas,
  setAulas,
  turmas,
  disciplinas,
  horarios,
}: GradeTabProps) {
  const [turmaSelecionada, setTurmaSelecionada] = useState<string>('');
  const [adicionando, setAdicionando] = useState<{
    dia: number;
    horario: number;
    modo: 'novo' | 'compartilhado';
    disciplinaId?: string;
  } | null>(null);
  const [atribuicaoSelecionada, setAtribuicaoSelecionada] = useState<string>('');

  // Mapa: disciplinaId → paleta de cor (estável por disciplina)
  const corPorDisciplina = useMemo(() => {
    const mapa: Record<string, typeof PALETA[0]> = {};
    disciplinas.forEach((d, i) => {
      mapa[d.id] = PALETA[i % PALETA.length];
    });
    return mapa;
  }, [disciplinas]);

  // ─── Atribuições da turma selecionada ───────────────────────────────────────
  const atribuicoesTurma = useMemo<AtribuicaoTurma[]>(() => {
    if (!turmaSelecionada) return [];
    const resultado: AtribuicaoTurma[] = [];
    professores.forEach(professor => {
      const atribs = professor.atribuicoes?.filter(a => a.turmaId === turmaSelecionada) || [];
      atribs.forEach(atrib => {
        const disciplina = disciplinas.find(d => d.id === atrib.disciplinaId);
        if (!disciplina) return;
        const paleta = corPorDisciplina[atrib.disciplinaId] || PALETA[0];
        const aulasAlocadas = aulas.filter(
          a =>
            a.turmaId === turmaSelecionada &&
            a.professorId === professor.id &&
            a.disciplinaId === atrib.disciplinaId
        ).length;
        resultado.push({
          professorId: professor.id,
          professorNome: professor.nome,
          disciplinaId: atrib.disciplinaId,
          disciplinaNome: disciplina.nome,
          multiplosDocentes: !!disciplina.multiplosDocentes,
          aulasAtribuidas: atrib.aulasAtribuidas,
          aulasAlocadas,
          aulasFaltando: Math.max(0, atrib.aulasAtribuidas - aulasAlocadas),
          cor: paleta.cor,
          corBg: paleta.bg,
          corBorder: paleta.border,
          corText: paleta.text,
        });
      });
    });
    return resultado;
  }, [turmaSelecionada, professores, disciplinas, aulas, corPorDisciplina]);

  const resumoTurma = useMemo(() => {
    const totalAtribuidas = atribuicoesTurma.reduce((s, a) => s + a.aulasAtribuidas, 0);
    const totalAlocadas = atribuicoesTurma.reduce((s, a) => s + a.aulasAlocadas, 0);
    const totalFaltando = atribuicoesTurma.reduce((s, a) => s + a.aulasFaltando, 0);
    const totalSlots = horarios.length * 5;
    const pct = totalAtribuidas > 0 ? Math.round((totalAlocadas / totalAtribuidas) * 100) : 0;
    return { totalAtribuidas, totalAlocadas, totalFaltando, totalSlots, pct };
  }, [atribuicoesTurma, horarios]);

  const getAulasSlot = (dia: number, horario: number): Aula[] =>
    aulas.filter(a => a.diaSemana === dia && a.horario === horario && a.turmaId === turmaSelecionada);

  const abrirNovoSlot = (dia: number, horario: number) => {
    setAdicionando({ dia, horario, modo: 'novo' });
    setAtribuicaoSelecionada('');
  };

  const abrirCompartilhado = (dia: number, horario: number, disciplinaId: string) => {
    setAdicionando({ dia, horario, modo: 'compartilhado', disciplinaId });
    setAtribuicaoSelecionada('');
  };

  const adicionarAula = () => {
    if (!adicionando || !atribuicaoSelecionada || !turmaSelecionada) return;
    const [professorId, disciplinaId] = atribuicaoSelecionada.split('|');
    const professorOcupado = aulas.find(
      a => a.professorId === professorId && a.diaSemana === adicionando.dia && a.horario === adicionando.horario
    );
    if (professorOcupado) {
      const turmaOcupada = turmas.find(t => t.id === professorOcupado.turmaId);
      alert(`Professor já está ocupado neste horário na turma ${turmaOcupada?.nome}!`);
      return;
    }
    const novaAula: Aula = {
      id: `aula_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      professorId,
      disciplinaId,
      turmaId: turmaSelecionada,
      diaSemana: adicionando.dia,
      horario: adicionando.horario,
      compartilhada: adicionando.modo === 'compartilhado',
    };
    const aulasAtualizadas = aulas.map(a =>
      a.diaSemana === adicionando.dia &&
      a.horario === adicionando.horario &&
      a.turmaId === turmaSelecionada &&
      a.disciplinaId === disciplinaId
        ? { ...a, compartilhada: true }
        : a
    );
    setAulas([...aulasAtualizadas, novaAula]);
    setAdicionando(null);
    setAtribuicaoSelecionada('');
  };

  const removerAula = (aulaId: string) => {
    if (!confirm('Remover esta aula da grade?')) return;
    const novas = aulas.filter(a => a.id !== aulaId);
    const aulaRemovida = aulas.find(a => a.id === aulaId);
    if (aulaRemovida) {
      const restantes = novas.filter(
        a =>
          a.diaSemana === aulaRemovida.diaSemana &&
          a.horario === aulaRemovida.horario &&
          a.turmaId === aulaRemovida.turmaId &&
          a.disciplinaId === aulaRemovida.disciplinaId
      );
      if (restantes.length === 1) {
        setAulas(novas.map(a => (a.id === restantes[0].id ? { ...a, compartilhada: false } : a)));
        return;
      }
    }
    setAulas(novas);
  };

  const atribuicoesDisponiveis = useMemo(() => {
    if (!adicionando) return [];
    return atribuicoesTurma.filter(attr => {
      if (adicionando.modo === 'compartilhado' && attr.disciplinaId !== adicionando.disciplinaId) return false;
      const ocupado = aulas.find(
        a => a.professorId === attr.professorId && a.diaSemana === adicionando.dia && a.horario === adicionando.horario
      );
      return !ocupado;
    });
  }, [adicionando, atribuicoesTurma, aulas]);

  if (turmas.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhuma turma cadastrada</h3>
          <p className="text-gray-400">Cadastre turmas e professores na aba Configurações para montar a grade.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Seletor de Turma ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-lg">🏫</div>
            <label className="font-bold text-gray-700 text-base">Grade Horária</label>
          </div>
          <select
            value={turmaSelecionada}
            onChange={e => setTurmaSelecionada(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-base font-semibold text-gray-700 focus:outline-none focus:border-indigo-400 bg-gray-50 min-w-[180px]"
          >
            <option value="">— Selecione a Turma —</option>
            {turmas.map(t => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
          {turmaSelecionada && (
            <span className="text-sm text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full font-medium">
              💡 Clique em um slot vazio para adicionar aula
            </span>
          )}
        </div>
      </div>

      {!turmaSelecionada && (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-3">👆</div>
            <p className="text-gray-400 font-medium">Selecione uma turma para ver as atribuições e montar a grade.</p>
          </div>
        </div>
      )}

      {turmaSelecionada && (
        <>
          {/* ── Cards de Resumo ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Atribuídas', val: resumoTurma.totalAtribuidas, icon: '📚', bg: 'from-indigo-500 to-indigo-600' },
              { label: 'Alocadas', val: resumoTurma.totalAlocadas, icon: '✅', bg: 'from-emerald-500 to-emerald-600' },
              { label: 'Faltam', val: resumoTurma.totalFaltando, icon: '⏳', bg: resumoTurma.totalFaltando > 0 ? 'from-amber-500 to-orange-500' : 'from-gray-400 to-gray-500' },
              { label: 'Slots Livres', val: resumoTurma.totalSlots - resumoTurma.totalAlocadas, icon: '🔲', bg: 'from-slate-500 to-slate-600' },
            ].map(({ label, val, icon, bg }) => (
              <div key={label} className={`bg-gradient-to-br ${bg} rounded-2xl p-4 text-white shadow-md`}>
                <div className="text-3xl mb-1">{icon}</div>
                <div className="text-3xl font-black">{val}</div>
                <div className="text-sm font-medium opacity-90">{label}</div>
              </div>
            ))}
          </div>

          {/* ── Barra de Progresso Geral ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-700">Progresso de Alocação</span>
              <span className={cn(
                'text-sm font-bold px-3 py-1 rounded-full',
                resumoTurma.pct === 100 ? 'bg-emerald-100 text-emerald-700' :
                resumoTurma.pct > 60 ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-600'
              )}>
                {resumoTurma.pct}% concluído
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  resumoTurma.pct === 100 ? 'bg-emerald-500' :
                  resumoTurma.pct > 60 ? 'bg-amber-500' : 'bg-indigo-500'
                )}
                style={{ width: `${resumoTurma.pct}%` }}
              />
            </div>
          </div>

          {/* ── Painel de Atribuições ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <span className="text-xl">👨‍🏫</span>
              <h3 className="font-bold text-gray-800 text-base">
                Atribuições — <span className="text-indigo-600">{turmas.find(t => t.id === turmaSelecionada)?.nome}</span>
              </h3>
            </div>

            {atribuicoesTurma.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                Nenhum professor atribuído a esta turma. Configure na aba Configurações.
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {atribuicoesTurma.map((attr, idx) => {
                  const pct = attr.aulasAtribuidas > 0
                    ? Math.round((attr.aulasAlocadas / attr.aulasAtribuidas) * 100) : 0;
                  const completo = attr.aulasFaltando === 0 && attr.aulasAtribuidas > 0;
                  const paleta = corPorDisciplina[attr.disciplinaId] || PALETA[0];

                  return (
                    <div key={idx} className={cn('flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors', completo && 'bg-emerald-50/50')}>
                      {/* Cor da disciplina */}
                      <div className={cn('w-3 h-10 rounded-full flex-shrink-0', paleta.badge)} />

                      {/* Nome */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-sm truncate">{attr.professorNome}</div>
                        <div className={cn('text-xs font-medium flex items-center gap-1', paleta.text)}>
                          {attr.disciplinaNome}
                          {attr.multiplosDocentes && (
                            <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">👥 Multi</span>
                          )}
                        </div>
                      </div>

                      {/* Contadores */}
                      <div className="flex items-center gap-3 text-center flex-shrink-0">
                        <div className="text-center">
                          <div className="text-lg font-black text-gray-700">{attr.aulasAtribuidas}</div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Atrib.</div>
                        </div>
                        <div className="text-gray-200 text-lg">│</div>
                        <div className="text-center">
                          <div className={cn('text-lg font-black', attr.aulasAlocadas > 0 ? 'text-emerald-600' : 'text-gray-300')}>{attr.aulasAlocadas}</div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Aloc.</div>
                        </div>
                        <div className="text-gray-200 text-lg">│</div>
                        <div className="text-center">
                          <div className={cn('text-lg font-black', attr.aulasFaltando > 0 ? 'text-amber-600' : 'text-emerald-600')}>
                            {attr.aulasFaltando > 0 ? attr.aulasFaltando : '✓'}
                          </div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Faltam</div>
                        </div>
                      </div>

                      {/* Mini barra */}
                      <div className="w-24 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full transition-all', paleta.badge)}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-gray-500 w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Grade de Horários ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <span className="text-xl">📅</span>
              <h3 className="font-bold text-gray-800 text-base">
                Horários — <span className="text-indigo-600">{turmas.find(t => t.id === turmaSelecionada)?.nome}</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 780 }}>
                <thead>
                  <tr>
                    <th className="w-28 p-0">
                      <div className="bg-gray-800 text-white text-xs font-bold uppercase tracking-wider py-3 px-3 text-center">
                        Horário
                      </div>
                    </th>
                    {DIAS_SEMANA.map((dia, i) => (
                      <th key={dia.valor} className="p-0" style={{ minWidth: 160 }}>
                        <div className={cn(
                          'py-3 px-3 text-center text-white text-xs font-bold uppercase tracking-wider',
                          i === 0 ? 'bg-indigo-500' :
                          i === 1 ? 'bg-violet-500' :
                          i === 2 ? 'bg-sky-500' :
                          i === 3 ? 'bg-emerald-500' :
                          'bg-rose-500'
                        )}>
                          {dia.nome}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {horarios.map((h, rowIdx) => (
                    <tr key={h.aula} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      {/* Horário */}
                      <td className="border-r border-b border-gray-100 p-3 text-center bg-gray-800/5">
                        <div className="font-black text-gray-700 text-base">{h.aula}ª</div>
                        <div className="text-[11px] text-gray-400 font-medium mt-0.5">{h.inicio}</div>
                        <div className="text-[11px] text-gray-300">↓</div>
                        <div className="text-[11px] text-gray-400 font-medium">{h.fim}</div>
                      </td>

                      {DIAS_SEMANA.map((dia, colIdx) => {
                        const aulasSlot = getAulasSlot(dia.valor, h.aula);
                        const vazio = aulasSlot.length === 0;
                        const disciplinaSlot = aulasSlot.length > 0
                          ? disciplinas.find(d => d.id === aulasSlot[0].disciplinaId)
                          : null;
                        const podeAdicionarProf = !vazio && !!disciplinaSlot?.multiplosDocentes;
                        const paleta = disciplinaSlot ? corPorDisciplina[disciplinaSlot.id] : null;

                        // Cor do header do dia
                        const diaColors = ['border-indigo-300', 'border-violet-300', 'border-sky-300', 'border-emerald-300', 'border-rose-300'];

                        return (
                          <td
                            key={dia.valor}
                            className={cn(
                              'border-r border-b border-gray-100 p-1.5 align-top transition-all',
                              vazio && 'cursor-pointer hover:bg-indigo-50/60',
                              !vazio && paleta && paleta.bg,
                              !vazio && !paleta && 'bg-blue-50',
                              'border-l-2',
                              vazio ? diaColors[colIdx] : paleta ? paleta.border : 'border-blue-300'
                            )}
                            onClick={() => { if (vazio) abrirNovoSlot(dia.valor, h.aula); }}
                          >
                            {vazio ? (
                              <div className="flex flex-col items-center justify-center py-4 opacity-30 hover:opacity-60 transition-opacity">
                                <div className="text-gray-400 text-xl leading-none">＋</div>
                                <div className="text-gray-400 text-[10px] mt-1 font-medium">Adicionar</div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {/* Tag da disciplina */}
                                <div className={cn(
                                  'text-[11px] font-black px-2 py-1 rounded-lg text-center tracking-wide',
                                  paleta ? cn(paleta.badge, 'text-white') : 'bg-blue-500 text-white'
                                )}>
                                  {disciplinaSlot?.nome}
                                  {podeAdicionarProf && (
                                    <span className="ml-1 bg-white/30 px-1 rounded text-[9px]">👥</span>
                                  )}
                                </div>

                                {/* Professores */}
                                {aulasSlot.map(aula => {
                                  const prof = professores.find(p => p.id === aula.professorId);
                                  return (
                                    <div
                                      key={aula.id}
                                      className="group relative flex items-center gap-1 bg-white/80 backdrop-blur-sm border border-white rounded-lg px-2 py-1.5 shadow-sm"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold text-gray-800 leading-tight truncate">
                                          {prof?.nome ?? '—'}
                                        </div>
                                      </div>
                                      <button
                                        onClick={e => { e.stopPropagation(); removerAula(aula.id); }}
                                        className="opacity-0 group-hover:opacity-100 transition-all bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center flex-shrink-0 shadow-sm"
                                        title="Remover"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  );
                                })}

                                {/* Botão adicionar professor (multi-docente) */}
                                {podeAdicionarProf && (
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      abrirCompartilhado(dia.valor, h.aula, aulasSlot[0].disciplinaId);
                                    }}
                                    className="w-full text-[11px] bg-white/60 hover:bg-white border border-dashed border-current text-purple-700 font-semibold rounded-lg px-2 py-1 flex items-center justify-center gap-1 transition-all"
                                  >
                                    ＋ Prof
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legenda de Cores */}
            {atribuicoesTurma.length > 0 && (
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Legenda de Disciplinas</div>
                <div className="flex flex-wrap gap-2">
                  {[...new Map(atribuicoesTurma.map(a => [a.disciplinaId, a])).values()].map(attr => {
                    const paleta = corPorDisciplina[attr.disciplinaId] || PALETA[0];
                    return (
                      <div key={attr.disciplinaId} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold', paleta.pill, paleta.text)}>
                        <div className={cn('w-2.5 h-2.5 rounded-full', paleta.badge)} />
                        {attr.disciplinaNome}
                        {attr.multiplosDocentes && <span className="text-[9px] ml-0.5">👥</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Modal ── */}
      {adicionando && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

            {/* Header do Modal */}
            <div className={cn(
              'px-6 py-4 text-white',
              adicionando.modo === 'compartilhado'
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600'
            )}>
              <h3 className="text-lg font-bold flex items-center gap-2">
                {adicionando.modo === 'compartilhado' ? '👥 Adicionar Professor à Eletiva' : '📌 Alocar Aula na Grade'}
              </h3>
              <p className="text-white/70 text-sm mt-0.5">
                {DIAS_SEMANA.find(d => d.valor === adicionando.dia)?.nome} — {adicionando.horario}ª Aula
                {' '}({horarios.find(h => h.aula === adicionando.horario)?.inicio} – {horarios.find(h => h.aula === adicionando.horario)?.fim})
              </p>
              {adicionando.modo === 'compartilhado' && adicionando.disciplinaId && (
                <p className="text-white/80 text-xs mt-1">
                  Disciplina: <strong>{disciplinas.find(d => d.id === adicionando.disciplinaId)?.nome}</strong>
                </p>
              )}
            </div>

            <div className="p-6 space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                {adicionando.modo === 'compartilhado'
                  ? 'Selecione o professor a adicionar:'
                  : 'Selecione Professor e Disciplina:'}
              </label>

              {atribuicoesDisponiveis.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <div className="font-semibold mb-1">Nenhum professor disponível</div>
                    <div className="text-xs text-amber-600">
                      {adicionando.modo === 'compartilhado'
                        ? 'Todos os professores desta disciplina já estão ocupados neste horário.'
                        : 'Todos os professores desta turma estão ocupados neste horário.'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {atribuicoesDisponiveis.map((attr, idx) => {
                    const key = `${attr.professorId}|${attr.disciplinaId}`;
                    const sel = atribuicaoSelecionada === key;
                    const paleta = corPorDisciplina[attr.disciplinaId] || PALETA[0];
                    return (
                      <label
                        key={idx}
                        className={cn(
                          'flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all',
                          sel ? cn('border-indigo-500 bg-indigo-50 shadow-md') : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                        )}
                      >
                        <input
                          type="radio"
                          name="atribuicao"
                          value={key}
                          checked={sel}
                          onChange={e => setAtribuicaoSelecionada(e.target.value)}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <div className={cn('w-2 h-10 rounded-full flex-shrink-0', paleta.badge)} />
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 text-sm">{attr.professorNome}</div>
                          <div className={cn('text-xs font-medium', paleta.text)}>{attr.disciplinaNome}</div>
                        </div>
                        <div className={cn(
                          'text-xs px-2.5 py-1 rounded-full font-bold',
                          attr.aulasFaltando > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        )}>
                          {attr.aulasAlocadas}/{attr.aulasAtribuidas}
                          {attr.aulasFaltando > 0 && <span className="ml-1">−{attr.aulasFaltando}</span>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={adicionarAula}
                  disabled={!atribuicaoSelecionada}
                  className={cn(
                    'flex-1 py-3 rounded-xl font-bold transition-all',
                    atribuicaoSelecionada
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  )}
                >
                  ✓ Confirmar
                </button>
                <button
                  onClick={() => { setAdicionando(null); setAtribuicaoSelecionada(''); }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
