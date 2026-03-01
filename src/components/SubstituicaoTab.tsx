import { useState } from 'react';
import { Professor, Aula, Substituicao, Turma, Disciplina, HorarioAula, AreaConhecimento, DIAS_SEMANA } from '../types';
import { cn } from '../utils/cn';

interface SubstituicaoTabProps {
  professores: Professor[];
  setProfessores: (professores: Professor[]) => void;
  aulas: Aula[];
  substituicoes: Substituicao[];
  setSubstituicoes: (substituicoes: Substituicao[]) => void;
  turmas: Turma[];
  disciplinas: Disciplina[];
  horarios: HorarioAula[];
  limiteAulas: number;
  areas: AreaConhecimento[];
}

interface AulaParaSubstituir {
  aula: Aula;
  horario: HorarioAula;
  substitutoSelecionado: string;
}

// Prioridade de substituição conforme regras
type PrioridadeLabel =
  | 'A) Mesma Área — Menor Carga'
  | 'B) Área Diversa — Menor Carga'
  | 'C) Articulador — Mesma Área'
  | 'D) Articulador — Menor Carga';

interface ProfessorDisponivel {
  professor: Professor;
  prioridade: 1 | 2 | 3 | 4;
  label: PrioridadeLabel;
  totalAulas: number;
  saldo: number;
  mesmArea: boolean;
  isArticulador: boolean;
  areaNome: string;
}

const PRIORIDADE_COR: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  2: 'bg-blue-100 text-blue-800 border-blue-300',
  3: 'bg-amber-100 text-amber-800 border-amber-300',
  4: 'bg-purple-100 text-purple-800 border-purple-300',
};

const PRIORIDADE_BADGE: Record<number, string> = {
  1: 'bg-emerald-500',
  2: 'bg-blue-500',
  3: 'bg-amber-500',
  4: 'bg-purple-500',
};

const PRIORIDADE_ICONE: Record<number, string> = {
  1: '🟢',
  2: '🔵',
  3: '🟡',
  4: '🟣',
};

export default function SubstituicaoTab({
  professores,
  setProfessores,
  aulas,
  substituicoes,
  setSubstituicoes,
  turmas,
  disciplinas,
  horarios,
  limiteAulas,
  areas,
}: SubstituicaoTabProps) {
  const [professorFaltou, setProfessorFaltou] = useState<string>('');
  const [diaSemana, setDiaSemana] = useState<number>(new Date().getDay() || 1);
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [aulasParaSubstituir, setAulasParaSubstituir] = useState<AulaParaSubstituir[]>([]);
  const [escalaGerada, setEscalaGerada] = useState(false);
  const [expandirRegras, setExpandirRegras] = useState(false);

  // Retorna a área do professor
  const getAreaDoProfessor = (professorId: string): AreaConhecimento | null => {
    return areas.find(a => a.professorIds.includes(professorId)) || null;
  };

  // (getAreaDaDisciplina removida — a prioridade compara área do substituto com área do professor ausente)

  // Verifica se um professor é articulador de alguma área
  const isArticulador = (professorId: string): boolean => {
    return areas.some(a => a.articuladorId === professorId);
  };

  // Calcula total de aulas do professor (fixas + extras)
  const getTotalAulas = (prof: Professor): number => {
    const fixas = aulas.filter(a => a.professorId === prof.id).length;
    return fixas + prof.aulasExtras;
  };

  // ===== LÓGICA CENTRAL DE PRIORIDADE =====
  // A comparação de área é feita entre o SUBSTITUTO e o PROFESSOR QUE FALTOU
  // (não pela disciplina), pois a regra é de área do docente, não da matéria.
  const getProfessoresDisponiveis = (horarioAula: number, _disciplinaId: string): ProfessorDisponivel[] => {
    // Área do professor que faltou — é o ponto de referência das regras A, B, C, D
    const areaDoProfFaltou = professorFaltouObj ? getAreaDoProfessor(professorFaltouObj.id) : null;

    const candidatos = professores.filter(prof => {
      // Não pode ser o próprio professor que faltou
      if (prof.id === professorFaltou) return false;

      // Verificar limite semanal
      const total = getTotalAulas(prof);
      if (total >= limiteAulas) return false;

      // Verificar se está livre no horário (não tem aula naquele dia/horário)
      const ocupado = aulas.some(
        a => a.professorId === prof.id && a.diaSemana === diaSemana && a.horario === horarioAula
      );
      if (ocupado) return false;

      return true;
    });

    // Classificar por prioridade
    const classificados: ProfessorDisponivel[] = candidatos.map(prof => {
      const totalAulas = getTotalAulas(prof);
      const saldo = limiteAulas - totalAulas;
      const areaDoProfSubstituto = getAreaDoProfessor(prof.id);
      const articulador = isArticulador(prof.id);
      const areaNome = areaDoProfSubstituto?.nome || '—';

      // Mesma área = área do substituto é igual à área do professor que FALTOU
      const mesmArea =
        areaDoProfFaltou !== null &&
        areaDoProfSubstituto !== null &&
        areaDoProfSubstituto.id === areaDoProfFaltou.id;

      // REGRA A: mesma área + menor carga (não articulador)
      if (mesmArea && !articulador) {
        return {
          professor: prof, prioridade: 1,
          label: 'A) Mesma Área — Menor Carga',
          totalAulas, saldo, mesmArea, isArticulador: false, areaNome,
        };
      }

      // REGRA C: articulador da mesma área
      if (mesmArea && articulador) {
        return {
          professor: prof, prioridade: 3,
          label: 'C) Articulador — Mesma Área',
          totalAulas, saldo, mesmArea, isArticulador: true, areaNome,
        };
      }

      // REGRA D: articulador de área diversa com menor carga
      if (!mesmArea && articulador) {
        return {
          professor: prof, prioridade: 4,
          label: 'D) Articulador — Menor Carga',
          totalAulas, saldo, mesmArea: false, isArticulador: true, areaNome,
        };
      }

      // REGRA B: área diversa + menor carga
      return {
        professor: prof, prioridade: 2,
        label: 'B) Área Diversa — Menor Carga',
        totalAulas, saldo, mesmArea: false, isArticulador: false, areaNome,
      };
    });

    // Ordenar: primeiro por prioridade (1→4), depois por menor totalAulas dentro de cada grupo
    return classificados.sort((a, b) => {
      if (a.prioridade !== b.prioridade) return a.prioridade - b.prioridade;
      return a.totalAulas - b.totalAulas;
    });
  };

  const buscarAulas = () => {
    if (!professorFaltou) return;

    const aulasDoDia = aulas.filter(
      a => a.professorId === professorFaltou && a.diaSemana === diaSemana
    );

    const aulasComHorario = aulasDoDia.map(aula => {
      const horario = horarios.find(h => h.aula === aula.horario);
      return {
        aula,
        horario: horario || { aula: aula.horario, inicio: '', fim: '' },
        substitutoSelecionado: '',
      };
    }).sort((a, b) => a.aula.horario - b.aula.horario);

    setAulasParaSubstituir(aulasComHorario);
    setEscalaGerada(false);
  };

  const selecionarSubstituto = (index: number, professorId: string) => {
    const novasAulas = [...aulasParaSubstituir];
    novasAulas[index].substitutoSelecionado = professorId;
    setAulasParaSubstituir(novasAulas);
  };

  const confirmarEscala = () => {
    const aulasComSubstituto = aulasParaSubstituir.filter(a => a.substitutoSelecionado);
    if (aulasComSubstituto.length === 0) {
      alert('Selecione pelo menos um substituto para confirmar a escala.');
      return;
    }

    const novasSubstituicoes: Substituicao[] = aulasComSubstituto.map(item => ({
      id: `sub_${Date.now()}_${item.aula.id}`,
      data,
      aulaId: item.aula.id,
      professorFaltouId: professorFaltou,
      professorSubstitutoId: item.substitutoSelecionado,
      horario: item.aula.horario,
      turmaId: item.aula.turmaId,
      disciplinaId: item.aula.disciplinaId,
      confirmada: true,
    }));

    const professoresAtualizados = professores.map(prof => {
      const count = novasSubstituicoes.filter(s => s.professorSubstitutoId === prof.id).length;
      return { ...prof, aulasExtras: prof.aulasExtras + count };
    });

    setSubstituicoes([...substituicoes, ...novasSubstituicoes]);
    setProfessores(professoresAtualizados);
    setEscalaGerada(true);
  };

  const limparEscala = () => {
    setProfessorFaltou('');
    setAulasParaSubstituir([]);
    setEscalaGerada(false);
  };

  const professorFaltouObj = professores.find(p => p.id === professorFaltou);
  const areaProfFaltou = professorFaltouObj ? getAreaDoProfessor(professorFaltouObj.id) : null;

  if (professores.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
        <div className="text-5xl mb-4">📋</div>
        <p className="text-gray-500 text-lg">Cadastre professores na aba Configurações para gerenciar substituições.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* === CARD DE REGRAS === */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl shadow-lg overflow-hidden">
        <button
          onClick={() => setExpandirRegras(!expandirRegras)}
          className="w-full flex items-center justify-between px-6 py-4 text-white hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📜</span>
            <div className="text-left">
              <p className="font-bold text-lg">Regras de Prioridade para Substituição</p>
              <p className="text-slate-300 text-sm">Clique para {expandirRegras ? 'recolher' : 'ver as 4 regras aplicadas automaticamente'}</p>
            </div>
          </div>
          <span className="text-2xl transition-transform duration-300" style={{ transform: expandirRegras ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
        </button>

        {expandirRegras && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-slate-600">
            {[
              {
                letra: 'A', cor: 'from-emerald-500 to-emerald-600', icone: '🟢',
                titulo: 'Mesma Área — Menor Carga',
                desc: 'Docentes com menor carga horária da mesma Área de Conhecimento da disciplina ausente.',
                prioridade: '1ª Prioridade',
              },
              {
                letra: 'B', cor: 'from-blue-500 to-blue-600', icone: '🔵',
                titulo: 'Área Diversa — Menor Carga',
                desc: 'Docentes com menor carga horária de Área de Conhecimento diferente.',
                prioridade: '2ª Prioridade',
              },
              {
                letra: 'C', cor: 'from-amber-500 to-amber-600', icone: '🟡',
                titulo: 'Articulador — Mesma Área',
                desc: 'Professor Articulador da mesma Área de Conhecimento.',
                prioridade: '3ª Prioridade',
              },
              {
                letra: 'D', cor: 'from-purple-500 to-purple-600', icone: '🟣',
                titulo: 'Articulador — Menor Carga',
                desc: 'Professor Articulador de Área de Conhecimento com menor carga horária.',
                prioridade: '4ª Prioridade',
              },
            ].map(r => (
              <div key={r.letra} className="p-5 border-r border-slate-600 last:border-r-0">
                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${r.cor} text-white text-xs font-bold px-3 py-1 rounded-full mb-3`}>
                  {r.icone} {r.prioridade}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white/20 text-white font-black text-xl w-8 h-8 rounded-lg flex items-center justify-center">{r.letra}</span>
                  <span className="text-white font-semibold text-sm">{r.titulo}</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === FORMULÁRIO === */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-rose-500 px-6 py-4">
          <h2 className="text-white font-bold text-xl">🔄 Registrar Ausência e Gerar Escala</h2>
          <p className="text-red-100 text-sm">Selecione o professor, o dia e busque as aulas para substituição</p>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">👨‍🏫 Professor Ausente</label>
              <select
                value={professorFaltou}
                onChange={(e) => { setProfessorFaltou(e.target.value); setAulasParaSubstituir([]); setEscalaGerada(false); }}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white"
              >
                <option value="">Selecione o professor</option>
                {professores.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>

            {/* Info da área do professor que faltou */}
            {professorFaltouObj && (
              <div className="flex items-end">
                <div className={cn(
                  'w-full px-4 py-2.5 rounded-xl border-2 text-sm font-medium',
                  areaProfFaltou
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                )}>
                  {areaProfFaltou
                    ? <><span className="text-lg">{areaProfFaltou.icone}</span> {areaProfFaltou.nome}</>
                    : '⚠️ Sem Área definida'
                  }
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Dia da Semana</label>
              <select
                value={diaSemana}
                onChange={(e) => { setDiaSemana(parseInt(e.target.value)); setAulasParaSubstituir([]); setEscalaGerada(false); }}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white"
              >
                {DIAS_SEMANA.map(dia => (
                  <option key={dia.valor} value={dia.valor}>{dia.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🗓️ Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={buscarAulas}
              disabled={!professorFaltou}
              className={cn(
                'px-8 py-3 rounded-xl font-bold text-white transition-all shadow-md',
                professorFaltou
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 hover:shadow-lg'
                  : 'bg-gray-300 cursor-not-allowed'
              )}
            >
              🔍 Buscar Aulas para Substituição
            </button>
          </div>
        </div>
      </div>

      {/* === AULAS PARA SUBSTITUIR === */}
      {aulasParaSubstituir.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="text-white font-bold text-lg">
                📚 Aulas de {professorFaltouObj?.nome}
              </h3>
              <p className="text-slate-300 text-sm">
                {DIAS_SEMANA.find(d => d.valor === diaSemana)?.nome} · {aulasParaSubstituir.length} aula(s) · {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex gap-2 text-sm text-slate-300">
              <span className="bg-white/10 px-3 py-1 rounded-full">
                ✅ {aulasParaSubstituir.filter(a => a.substitutoSelecionado).length} alocadas
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-full">
                ⏳ {aulasParaSubstituir.filter(a => !a.substitutoSelecionado).length} pendentes
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {aulasParaSubstituir.map((item, index) => {
              const turma = turmas.find(t => t.id === item.aula.turmaId);
              const disciplina = disciplinas.find(d => d.id === item.aula.disciplinaId);
              const disponiveis = getProfessoresDisponiveis(item.aula.horario, item.aula.disciplinaId);
              const substitutoObj = disponiveis.find(d => d.professor.id === item.substitutoSelecionado);
              // Área exibida no badge é a do PROFESSOR QUE FALTOU (referência das regras)
              const areaDisciplina = areaProfFaltou;

              // Agrupar disponíveis por prioridade
              const grupos: Record<number, ProfessorDisponivel[]> = { 1: [], 2: [], 3: [], 4: [] };
              disponiveis.forEach(d => grupos[d.prioridade].push(d));

              return (
                <div
                  key={item.aula.id}
                  className={cn(
                    'rounded-2xl border-2 overflow-hidden transition-all',
                    item.substitutoSelecionado
                      ? 'border-emerald-300 shadow-emerald-100 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  {/* Header da aula */}
                  <div className={cn(
                    'px-5 py-3 flex flex-wrap gap-3 items-center',
                    item.substitutoSelecionado ? 'bg-emerald-50' : 'bg-gray-50'
                  )}>
                    <div className="bg-slate-700 text-white font-black text-lg w-12 h-12 rounded-xl flex items-center justify-center shadow">
                      {item.horario.aula}ª
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{item.horario.inicio} – {item.horario.fim}</p>
                      <p className="font-bold text-gray-800">{disciplina?.nome || '—'}</p>
                    </div>
                    <div className="bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full">
                      {turma?.nome}
                    </div>
                    {areaDisciplina && (
                      <div className="bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                        <span>{areaDisciplina.icone}</span>
                        <span>{areaDisciplina.nome}</span>
                      </div>
                    )}
                    {item.substitutoSelecionado && substitutoObj && (
                      <div className="ml-auto flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-sm font-semibold">
                        ✅ {substitutoObj.professor.nome}
                        <span className={cn('text-xs px-2 py-0.5 rounded-full text-white', PRIORIDADE_BADGE[substitutoObj.prioridade])}>
                          {PRIORIDADE_ICONE[substitutoObj.prioridade]} {substitutoObj.label.split(')')[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Seleção de substituto */}
                  {!escalaGerada && (
                    <div className="px-5 py-4">
                      {disponiveis.length === 0 ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                          <p className="text-red-700 font-semibold">⚠️ Nenhum professor disponível para este horário</p>
                          <p className="text-red-500 text-sm mt-1">Todos estão ocupados ou atingiram o limite de {limiteAulas} aulas semanais.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-gray-600 mb-2">
                            👇 Selecione o substituto ({disponiveis.length} disponível{disponiveis.length !== 1 ? 'is' : ''})
                          </p>

                          {/* Grupos por prioridade */}
                          {([1, 2, 3, 4] as const).map(prioridade => {
                            const grupo = grupos[prioridade];
                            if (grupo.length === 0) return null;

                            const labels: Record<number, string> = {
                              1: 'A) Mesma Área — Menor Carga',
                              2: 'B) Área Diversa — Menor Carga',
                              3: 'C) Articulador — Mesma Área',
                              4: 'D) Articulador — Menor Carga',
                            };

                            return (
                              <div key={prioridade} className={cn('rounded-xl border p-3', PRIORIDADE_COR[prioridade])}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={cn('text-white text-xs font-bold px-2 py-0.5 rounded-full', PRIORIDADE_BADGE[prioridade])}>
                                    {PRIORIDADE_ICONE[prioridade]} {prioridade}ª Prioridade
                                  </span>
                                  <span className="text-xs font-semibold opacity-80">{labels[prioridade]}</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {grupo.map(d => {
                                    const selecionado = item.substitutoSelecionado === d.professor.id;
                                    return (
                                      <button
                                        key={d.professor.id}
                                        onClick={() => selecionarSubstituto(index, selecionado ? '' : d.professor.id)}
                                        className={cn(
                                          'flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left',
                                          selecionado
                                            ? 'border-emerald-500 bg-emerald-50 shadow-md'
                                            : 'border-white bg-white hover:border-gray-300 hover:shadow'
                                        )}
                                      >
                                        {/* Avatar */}
                                        <div className={cn(
                                          'w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0',
                                          PRIORIDADE_BADGE[prioridade]
                                        )}>
                                          {d.professor.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-semibold text-gray-800 text-sm truncate">{d.professor.nome}</p>
                                          <div className="flex items-center gap-1 mt-0.5">
                                            <span className="text-xs text-gray-500">{d.totalAulas}/{limiteAulas} aulas</span>
                                            <span className="text-xs text-green-600 font-medium">· saldo: {d.saldo}</span>
                                          </div>
                                          <p className="text-xs text-gray-400 truncate">{d.areaNome}</p>
                                        </div>
                                        {d.isArticulador && (
                                          <span title="Articulador de Área" className="text-amber-500 text-lg flex-shrink-0">⭐</span>
                                        )}
                                        {selecionado && (
                                          <span className="text-emerald-600 text-lg flex-shrink-0">✅</span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resultado confirmado */}
                  {escalaGerada && item.substitutoSelecionado && substitutoObj && (
                    <div className="px-5 pb-4">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
                          {substitutoObj.professor.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-emerald-800">{substitutoObj.professor.nome}</p>
                          <p className="text-emerald-600 text-sm">{substitutoObj.label} · {substitutoObj.totalAulas}/{limiteAulas} aulas</p>
                        </div>
                        <span className="ml-auto text-2xl">✅</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Botões de ação */}
          <div className="px-6 pb-6 flex flex-wrap gap-3">
            {!escalaGerada ? (
              <>
                <button
                  onClick={confirmarEscala}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-green-600 shadow-md hover:shadow-lg transition-all"
                >
                  ✅ Confirmar Escala de Substituição
                </button>
                <button
                  onClick={limparEscala}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600"
                >
                  🗑️ Limpar
                </button>
              </>
            ) : (
              <div className="w-full flex flex-wrap items-center gap-4">
                <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-emerald-800 font-bold text-lg">✅ Escala confirmada e registrada no histórico!</p>
                  <p className="text-emerald-600 text-sm mt-1">
                    {aulasParaSubstituir.filter(a => a.substitutoSelecionado).length} substituição(ões) registrada(s) em {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={limparEscala}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-600 shadow-md"
                >
                  ➕ Nova Substituição
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensagem sem aulas */}
      {professorFaltou && aulasParaSubstituir.length === 0 && !escalaGerada && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🗓️</div>
          <p className="text-yellow-800 font-semibold text-lg">
            {professorFaltouObj?.nome} não tem aulas cadastradas na grade para {DIAS_SEMANA.find(d => d.valor === diaSemana)?.nome}.
          </p>
          <p className="text-yellow-600 text-sm mt-2">Verifique a Grade Horária e adicione as aulas deste professor.</p>
        </div>
      )}

      {/* === PAINEL DE DISPONIBILIDADE GERAL === */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4">
          <h3 className="text-white font-bold text-lg">📊 Disponibilidade Geral dos Docentes</h3>
          <p className="text-indigo-100 text-sm">Limite: {limiteAulas} aulas/semana · Ordenado por saldo disponível</p>
        </div>

        <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...professores]
            .map(prof => ({ prof, total: getTotalAulas(prof), saldo: limiteAulas - getTotalAulas(prof), area: getAreaDoProfessor(prof.id) }))
            .sort((a, b) => b.saldo - a.saldo)
            .map(({ prof, total, saldo, area }) => {
              const percentual = (total / limiteAulas) * 100;
              const articulador = isArticulador(prof.id);

              return (
                <div
                  key={prof.id}
                  className={cn(
                    'border-2 rounded-xl p-3 transition-all',
                    saldo <= 0 ? 'border-red-200 bg-red-50' :
                    saldo <= 3 ? 'border-amber-200 bg-amber-50' :
                    'border-emerald-200 bg-emerald-50'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0',
                      saldo <= 0 ? 'bg-red-500' : saldo <= 3 ? 'bg-amber-500' : 'bg-emerald-500'
                    )}>
                      {prof.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-gray-800 text-sm truncate">{prof.nome}</p>
                        {articulador && <span title="Articulador" className="text-amber-500">⭐</span>}
                      </div>
                      {area && (
                        <p className="text-xs text-gray-500">{area.icone} {area.nome}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={cn(
                        'font-black text-lg',
                        saldo <= 0 ? 'text-red-600' : saldo <= 3 ? 'text-amber-600' : 'text-emerald-600'
                      )}>
                        {total}/{limiteAulas}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all',
                        percentual >= 100 ? 'bg-red-500' :
                        percentual >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      )}
                      style={{ width: `${Math.min(percentual, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-500">{aulas.filter(a => a.professorId === prof.id).length} fixas · +{prof.aulasExtras} extras</span>
                    <span className={cn(
                      'font-semibold',
                      saldo <= 0 ? 'text-red-600' : saldo <= 3 ? 'text-amber-600' : 'text-emerald-700'
                    )}>
                      {saldo <= 0 ? '🚫 Limite atingido' : `saldo: ${saldo}`}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
