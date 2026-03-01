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
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [msgBusca, setMsgBusca] = useState<string>('');

  // Retorna a área do professor
  const getAreaDoProfessor = (professorId: string): AreaConhecimento | null => {
    return areas.find(a => a.professorIds.includes(professorId)) || null;
  };

  // Verifica se um professor é articulador de alguma área
  const isArticulador = (professorId: string): boolean => {
    return areas.some(a => a.articuladorId === professorId);
  };

  // Calcula total de aulas do professor (atribuições + extras)
  const getTotalAulas = (prof: Professor): number => {
    const fixasPlanilha = prof.atribuicoes.reduce((sum, a) => sum + a.aulasAtribuidas, 0);
    const fixasGrade = aulas.filter(a => a.professorId === prof.id).length;
    const fixas = fixasPlanilha > 0 ? fixasPlanilha : fixasGrade;
    return fixas + prof.aulasExtras;
  };

  // Classificação de disponíveis por prioridade
  const getProfessoresDisponiveis = (horarioAula: number): ProfessorDisponivel[] => {
    const areaDoProfFaltou = professorFaltouObj ? getAreaDoProfessor(professorFaltouObj.id) : null;

    const candidatos = professores.filter(prof => {
      if (prof.id === professorFaltou) return false;
      const total = getTotalAulas(prof);
      if (total >= limiteAulas) return false;
      // Verifica conflito de horário na grade
      const ocupado = aulas.some(
        a =>
          String(a.professorId).trim() === String(prof.id).trim() &&
          Number(a.diaSemana) === Number(diaSemana) &&
          Number(a.horario) === Number(horarioAula)
      );
      if (ocupado) return false;
      return true;
    });

    const classificados: ProfessorDisponivel[] = candidatos.map(prof => {
      const totalAulas = getTotalAulas(prof);
      const saldo = limiteAulas - totalAulas;
      const areaDoProfSubstituto = getAreaDoProfessor(prof.id);
      const articulador = isArticulador(prof.id);
      const areaNome = areaDoProfSubstituto?.nome || '—';

      const mesmArea =
        areaDoProfFaltou !== null &&
        areaDoProfSubstituto !== null &&
        areaDoProfSubstituto.id === areaDoProfFaltou.id;

      if (mesmArea && !articulador) {
        return { professor: prof, prioridade: 1, label: 'A) Mesma Área — Menor Carga', totalAulas, saldo, mesmArea, isArticulador: false, areaNome };
      }
      if (mesmArea && articulador) {
        return { professor: prof, prioridade: 3, label: 'C) Articulador — Mesma Área', totalAulas, saldo, mesmArea, isArticulador: true, areaNome };
      }
      if (!mesmArea && articulador) {
        return { professor: prof, prioridade: 4, label: 'D) Articulador — Menor Carga', totalAulas, saldo, mesmArea: false, isArticulador: true, areaNome };
      }
      return { professor: prof, prioridade: 2, label: 'B) Área Diversa — Menor Carga', totalAulas, saldo, mesmArea: false, isArticulador: false, areaNome };
    });

    return classificados.sort((a, b) => {
      if (a.prioridade !== b.prioridade) return a.prioridade - b.prioridade;
      return a.totalAulas - b.totalAulas;
    });
  };

  // ── BUSCA MANUAL ──
  const buscarAulas = () => {
    if (!professorFaltou || !professorFaltouObj) return;

    setBuscaRealizada(true);
    setMsgBusca('');
    setEscalaGerada(false);

    const diaSemanaNum = Number(diaSemana);

    // Busca na grade montada
    const aulasDoProfessor = aulas.filter(
      a => String(a.professorId).trim() === String(professorFaltou).trim()
    );

    const aulasDoDia = aulasDoProfessor.filter(
      a => Number(a.diaSemana) === diaSemanaNum
    );

    if (aulasDoDia.length > 0) {
      // ✅ Encontrou aulas na grade para este dia
      const aulasComHorario = aulasDoDia
        .map(aula => ({
          aula,
          horario: horarios.find(h => Number(h.aula) === Number(aula.horario))
            || { aula: Number(aula.horario), inicio: '--', fim: '--' },
          substitutoSelecionado: '',
        }))
        .sort((a, b) => Number(a.aula.horario) - Number(b.aula.horario));

      setAulasParaSubstituir(aulasComHorario);
      return;
    }

    // Sem aulas na grade — tenta pelas atribuições da planilha
    if (professorFaltouObj.atribuicoes.length > 0) {
      const horariosDoDia = horarios.slice(0, 9);
      const aulasVirtuais: AulaParaSubstituir[] = [];
      let idx = 0;

      for (const atrib of professorFaltouObj.atribuicoes) {
        const qtdNoDia = Math.max(1, Math.round(atrib.aulasAtribuidas / 5));
        for (let i = 0; i < qtdNoDia && idx < horariosDoDia.length; i++, idx++) {
          const horario = horariosDoDia[idx];
          aulasVirtuais.push({
            aula: {
              id: `virt_${professorFaltou}_${atrib.turmaId}_${atrib.disciplinaId}_h${horario.aula}`,
              professorId: professorFaltou,
              turmaId: atrib.turmaId,
              disciplinaId: atrib.disciplinaId,
              diaSemana: diaSemanaNum,
              horario: horario.aula,
            },
            horario,
            substitutoSelecionado: '',
          });
        }
      }

      if (aulasVirtuais.length > 0) {
        setAulasParaSubstituir(aulasVirtuais);
        setMsgBusca('grade-vazia');
        return;
      }
    }

    // Nada encontrado
    setAulasParaSubstituir([]);
    setMsgBusca('sem-dados');
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
    setBuscaRealizada(false);
    setMsgBusca('');
  };

  // Gera link WhatsApp para avisar o substituto
  const gerarLinkWhatsApp = (item: AulaParaSubstituir): string => {
    const substituto = professores.find(p => p.id === item.substitutoSelecionado);
    if (!substituto?.telefone) return '';

    const turma = turmas.find(t => t.id === item.aula.turmaId);
    const disciplina = disciplinas.find(d => d.id === item.aula.disciplinaId);
    const diaNome = DIAS_SEMANA.find(d => d.valor === diaSemana)?.nome || '';
    const dataFormatada = new Date(data + 'T12:00:00').toLocaleDateString('pt-BR');
    const nomeSubstituto = substituto.nome.split(' ')[0]; // Primeiro nome

    const mensagem =
      `Olá, Prof. ${nomeSubstituto}! 👋\n\n` +
      `Você foi escalado(a) como *substituto(a)* hoje:\n\n` +
      `📅 *Data:* ${diaNome}, ${dataFormatada}\n` +
      `⏰ *Aula:* ${item.horario.aula}ª aula (${item.horario.inicio} – ${item.horario.fim})\n` +
      `🏫 *Turma:* ${turma?.nome || '—'}\n` +
      `📚 *Disciplina:* ${disciplina?.nome || '—'}\n` +
      `👤 *Substituindo:* Prof(a). ${professorFaltouObj?.nome || '—'}\n\n` +
      `Por favor, confirme o recebimento. 🙏\n\n` +
      `_Coordenação Pedagógica_ 🏫`;

    const telefone = substituto.telefone.replace(/\D/g, '');
    const numeroCompleto = telefone.startsWith('55') ? telefone : `55${telefone}`;
    return `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(mensagem)}`;
  };

  // Gera mensagem consolidada com todas as substituições (para envio em massa)
  const gerarMensagemConsolidada = (professorSubstitutoId: string): string => {
    const substituto = professores.find(p => p.id === professorSubstitutoId);
    if (!substituto?.telefone) return '';

    const aulasDoSubstituto = aulasParaSubstituir.filter(
      a => a.substitutoSelecionado === professorSubstitutoId
    );
    if (aulasDoSubstituto.length === 0) return '';

    const nomeSubstituto = substituto.nome.split(' ')[0];
    const diaNome = DIAS_SEMANA.find(d => d.valor === diaSemana)?.nome || '';
    const dataFormatada = new Date(data + 'T12:00:00').toLocaleDateString('pt-BR');

    let detalheAulas = '';
    aulasDoSubstituto.forEach(item => {
      const turma = turmas.find(t => t.id === item.aula.turmaId);
      const disciplina = disciplinas.find(d => d.id === item.aula.disciplinaId);
      detalheAulas +=
        `  • ${item.horario.aula}ª aula (${item.horario.inicio}–${item.horario.fim}) — ${disciplina?.nome || '—'} | ${turma?.nome || '—'}\n`;
    });

    const mensagem =
      `Olá, Prof. ${nomeSubstituto}! 👋\n\n` +
      `Você foi escalado(a) como *substituto(a)*:\n\n` +
      `📅 *Data:* ${diaNome}, ${dataFormatada}\n` +
      `👤 *Substituindo:* Prof(a). ${professorFaltouObj?.nome || '—'}\n\n` +
      `*Suas aulas de substituição:*\n${detalheAulas}\n` +
      `Por favor, confirme o recebimento. 🙏\n\n` +
      `_Coordenação Pedagógica_ 🏫`;

    const telefone = substituto.telefone.replace(/\D/g, '');
    const numeroCompleto = telefone.startsWith('55') ? telefone : `55${telefone}`;
    return `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(mensagem)}`;
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
              { letra: 'A', cor: 'from-emerald-500 to-emerald-600', icone: '🟢', titulo: 'Mesma Área — Menor Carga', desc: 'Docentes com menor carga horária da mesma Área de Conhecimento.', prioridade: '1ª Prioridade' },
              { letra: 'B', cor: 'from-blue-500 to-blue-600', icone: '🔵', titulo: 'Área Diversa — Menor Carga', desc: 'Docentes com menor carga horária de Área de Conhecimento diferente.', prioridade: '2ª Prioridade' },
              { letra: 'C', cor: 'from-amber-500 to-amber-600', icone: '🟡', titulo: 'Articulador — Mesma Área', desc: 'Professor Articulador da mesma Área de Conhecimento.', prioridade: '3ª Prioridade' },
              { letra: 'D', cor: 'from-purple-500 to-purple-600', icone: '🟣', titulo: 'Articulador — Menor Carga', desc: 'Professor Articulador de Área de Conhecimento com menor carga horária.', prioridade: '4ª Prioridade' },
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
          <p className="text-red-100 text-sm">Selecione o professor e o dia, depois clique em "Buscar Aulas"</p>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-4 gap-4 items-end">
            {/* Professor ausente */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">👨‍🏫 Professor Ausente</label>
              <select
                value={professorFaltou}
                onChange={(e) => {
                  setProfessorFaltou(e.target.value);
                  setAulasParaSubstituir([]);
                  setEscalaGerada(false);
                  setBuscaRealizada(false);
                  setMsgBusca('');
                }}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white"
              >
                <option value="">Selecione o professor</option>
                {professores.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>

            {/* Área do professor */}
            {professorFaltouObj && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🧩 Área de Conhecimento</label>
                <div className={cn(
                  'w-full px-4 py-2.5 rounded-xl border-2 text-sm font-medium',
                  areaProfFaltou
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                )}>
                  {areaProfFaltou
                    ? <><span className="text-lg mr-1">{areaProfFaltou.icone}</span>{areaProfFaltou.nome}</>
                    : '⚠️ Sem Área definida'
                  }
                </div>
              </div>
            )}

            {/* Dia da semana */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Dia da Semana</label>
              <select
                value={diaSemana}
                onChange={(e) => {
                  setDiaSemana(parseInt(e.target.value));
                  setAulasParaSubstituir([]);
                  setEscalaGerada(false);
                  setBuscaRealizada(false);
                  setMsgBusca('');
                }}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white"
              >
                {DIAS_SEMANA.map(dia => (
                  <option key={dia.valor} value={dia.valor}>{dia.nome}</option>
                ))}
              </select>
            </div>

            {/* Data */}
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

          {/* Botão buscar — MANUAL */}
          <div className="mt-5">
            <button
              onClick={buscarAulas}
              disabled={!professorFaltou}
              className={cn(
                'px-8 py-3 rounded-xl font-bold text-white transition-all shadow-md text-base',
                professorFaltou
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 hover:shadow-lg active:scale-95'
                  : 'bg-gray-300 cursor-not-allowed'
              )}
            >
              🔍 Buscar Aulas para Substituição
            </button>
          </div>
        </div>
      </div>

      {/* === AVISO: grade não montada, aulas geradas pelas atribuições === */}
      {msgBusca === 'grade-vazia' && aulasParaSubstituir.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl mt-0.5">ℹ️</span>
          <div>
            <p className="text-blue-800 font-semibold text-sm">
              Grade Horária não montada — horários estimados pelas atribuições da planilha
            </p>
            <p className="text-blue-600 text-sm mt-0.5">
              Para horários precisos, monte a grade na aba <strong>Grade Horária</strong>.
            </p>
          </div>
        </div>
      )}

      {/* === AVISO: nenhuma aula encontrada após busca === */}
      {buscaRealizada && msgBusca === 'sem-dados' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-amber-800 font-bold text-lg mb-1">
            Nenhuma aula encontrada para {professorFaltouObj?.nome}
          </p>
          <p className="text-amber-700 text-sm mb-4">
            Não há aulas na Grade Horária nem atribuições cadastradas para este professor.
          </p>
          <div className="text-left bg-white border border-amber-200 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-amber-800 font-semibold text-sm mb-2">O que fazer:</p>
            <ul className="text-amber-700 text-sm space-y-1 list-disc list-inside">
              <li>Acesse a aba <strong>Grade Horária</strong> e monte os horários</li>
              <li>Ou reimporte a planilha na aba <strong>Configurações</strong></li>
              <li>Verifique se o professor correto foi selecionado</li>
            </ul>
          </div>
        </div>
      )}

      {/* === AULAS PARA SUBSTITUIR === */}
      {aulasParaSubstituir.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-4 flex justify-between items-center flex-wrap gap-3">
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
              const disponiveis = getProfessoresDisponiveis(item.aula.horario);
              const substitutoObj = disponiveis.find(d => d.professor.id === item.substitutoSelecionado);

              // Agrupa por prioridade
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
                    {areaProfFaltou && (
                      <div className="bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                        <span>{areaProfFaltou.icone}</span>
                        <span>{areaProfFaltou.nome}</span>
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
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-wrap items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                          {substitutoObj.professor.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-emerald-800">{substitutoObj.professor.nome}</p>
                          <p className="text-emerald-600 text-sm">{substitutoObj.label} · {substitutoObj.totalAulas}/{limiteAulas} aulas</p>
                          {!substitutoObj.professor.telefone && (
                            <p className="text-amber-600 text-xs mt-0.5">⚠️ Telefone não cadastrado — cadastre em Configurações</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {substitutoObj.professor.telefone ? (
                            <a
                              href={gerarLinkWhatsApp(item)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow hover:shadow-md"
                            >
                              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              Avisar pelo WhatsApp
                            </a>
                          ) : (
                            <span className="bg-gray-200 text-gray-500 px-4 py-2 rounded-xl text-sm">
                              📵 Sem telefone
                            </span>
                          )}
                          <span className="text-2xl">✅</span>
                        </div>
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
              <div className="w-full space-y-4">
                {/* Resumo */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-emerald-800 font-bold text-lg">✅ Escala confirmada e registrada no histórico!</p>
                  <p className="text-emerald-600 text-sm mt-1">
                    {aulasParaSubstituir.filter(a => a.substitutoSelecionado).length} substituição(ões) registrada(s) em {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* Painel WhatsApp — aviso consolidado por substituto */}
                {(() => {
                  // Agrupa por substituto
                  const substitutosUnicos = [
                    ...new Set(
                      aulasParaSubstituir
                        .filter(a => a.substitutoSelecionado)
                        .map(a => a.substitutoSelecionado)
                    ),
                  ];
                  if (substitutosUnicos.length === 0) return null;

                  return (
                    <div className="bg-white border-2 border-green-200 rounded-xl overflow-hidden">
                      <div className="bg-green-500 px-5 py-3 flex items-center gap-3">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        <div>
                          <p className="text-white font-bold">Notificar Substitutos pelo WhatsApp</p>
                          <p className="text-green-100 text-xs">Clique no botão de cada professor para enviar a mensagem</p>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        {substitutosUnicos.map(subsId => {
                          const subsProf = professores.find(p => p.id === subsId);
                          if (!subsProf) return null;
                          const aulasDesteSubstituto = aulasParaSubstituir.filter(a => a.substitutoSelecionado === subsId);
                          const link = gerarMensagemConsolidada(subsId);
                          const temTelefone = !!subsProf.telefone;

                          return (
                            <div key={subsId} className="flex flex-wrap items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
                              {/* Avatar */}
                              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {subsProf.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-800 text-sm">{subsProf.nome}</p>
                                <p className="text-gray-500 text-xs">
                                  {aulasDesteSubstituto.length} aula(s) de substituição:
                                  {' '}
                                  {aulasDesteSubstituto.map(a => `${a.horario.aula}ª`).join(', ')}
                                </p>
                                {temTelefone && (
                                  <p className="text-green-600 text-xs">📱 {subsProf.telefone}</p>
                                )}
                              </div>

                              {/* Botão */}
                              {temTelefone ? (
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow hover:shadow-md flex-shrink-0"
                                >
                                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                  </svg>
                                  Enviar WhatsApp
                                </a>
                              ) : (
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                  <span className="bg-amber-100 text-amber-700 border border-amber-300 px-3 py-2 rounded-xl text-xs font-semibold">
                                    ⚠️ Sem telefone cadastrado
                                  </span>
                                  <span className="text-gray-400 text-xs">Cadastre em Configurações → Professores</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Botão Nova Substituição */}
                <div className="flex justify-end">
                  <button
                    onClick={limparEscala}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-600 shadow-md"
                  >
                    ➕ Nova Substituição
                  </button>
                </div>
              </div>
            )}
          </div>
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
                    'border-slate-100 bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0',
                      saldo <= 0 ? 'bg-red-500' : saldo <= 3 ? 'bg-amber-500' : 'bg-blue-500'
                    )}>
                      {prof.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-gray-800 text-sm truncate">{prof.nome}</p>
                        {articulador && <span title="Articulador" className="text-amber-500">⭐</span>}
                      </div>
                      {area && <p className="text-xs text-gray-500">{area.icone} {area.nome}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={cn(
                        'font-black text-lg',
                        saldo <= 0 ? 'text-red-600' : saldo <= 3 ? 'text-amber-600' : 'text-blue-600'
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
                        percentual >= 80 ? 'bg-amber-500' : 'bg-blue-500'
                      )}
                      style={{ width: `${Math.min(percentual, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-500">{aulas.filter(a => a.professorId === prof.id).length} fixas · +{prof.aulasExtras} extras</span>
                    <span className={cn(
                      'font-semibold',
                      saldo <= 0 ? 'text-red-600' : saldo <= 3 ? 'text-amber-600' : 'text-blue-600'
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
