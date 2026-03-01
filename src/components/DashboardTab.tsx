import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Professor, Substituicao, AreaConhecimento, HorarioAula, Turma, Disciplina } from '../types/index';

// Grade: dia -> horarioIdx -> slots
type GradeSlot = { professorId: string; disciplinaId: string; turmaId: string };
type Grade = Record<string, Record<number, GradeSlot[]>>;

interface Props {
  professores: Professor[];
  substituicoes: Substituicao[];
  grade: Grade;
  areas: AreaConhecimento[];
  horarios: HorarioAula[];
  turmas: Turma[];
  disciplinas: Disciplina[];
  limiteAulas: number;
  darkMode: boolean;
}

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const CORES = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

export default function DashboardTab({ professores, substituicoes, grade, areas, horarios, limiteAulas, darkMode }: Props) {
  const hoje = new Date();
  const diaSemanaHoje = hoje.getDay();
  const diaAtual = diaSemanaHoje >= 1 && diaSemanaHoje <= 5 ? DIAS[diaSemanaHoje - 1] : null;

  // Calcula total de aulas atribuídas (via planilha/cadastro) — campo correto: aulasAtribuidas
  const calcAulasAtribuidas = (prof: Professor): number => {
    if (prof.atribuicoes && prof.atribuicoes.length > 0) {
      return prof.atribuicoes.reduce((acc, a) => acc + (a.aulasAtribuidas || 0), 0);
    }
    // fallback: contar na grade horária (para professores sem atribuições cadastradas)
    let total = 0;
    Object.values(grade).forEach(diaGrade => {
      Object.values(diaGrade).forEach((slots: GradeSlot[]) => {
        total += slots.filter((s: GradeSlot) => s.professorId === prof.id).length;
      });
    });
    return total;
  };

  // Total real = atribuídas fixas + extras (substituições da semana)
  const calcTotalAulas = (prof: Professor): number => {
    return calcAulasAtribuidas(prof) + (prof.aulasExtras || 0);
  };

  // Professores no limite (saldo ≤ 4) — inclui quem tem 32 aulas atribuídas fixas
  const professoresAlerta = professores
    .map(p => {
      const aulasAtribuidas = calcAulasAtribuidas(p);
      const totalAulas = calcTotalAulas(p);
      const saldo = limiteAulas - totalAulas;
      return { ...p, aulasAtribuidas, totalAulas, saldo };
    })
    .filter(p => p.saldo <= 4)
    .sort((a, b) => a.saldo - b.saldo);

  // Substituições do dia atual
  const hojeStr = hoje.toISOString().split('T')[0];
  const substituicoesHoje = substituicoes.filter(s => s.data === hojeStr);

  // Substituições da semana
  const agora = new Date();
  const diaSemana = agora.getDay();
  const inicioSemana = new Date(agora);
  inicioSemana.setDate(agora.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 4);
  const substituicoesSemana = substituicoes.filter(s => {
    const data = new Date(s.data + 'T12:00:00');
    return data >= inicioSemana && data <= fimSemana;
  });

  // Ranking faltas
  const contFaltas: Record<string, number> = {};
  substituicoes.forEach(s => {
    contFaltas[s.professorFaltouId] = (contFaltas[s.professorFaltouId] || 0) + 1;
  });
  const rankingFaltas = Object.entries(contFaltas)
    .map(([id, total]) => ({ nome: professores.find(p => p.id === id)?.nome?.split(' ')[0] || 'N/A', total }))
    .sort((a, b) => b.total - a.total).slice(0, 6);

  // Ranking substituições
  const contSubs: Record<string, number> = {};
  substituicoes.forEach(s => {
    if (s.professorSubstitutoId) {
      contSubs[s.professorSubstitutoId] = (contSubs[s.professorSubstitutoId] || 0) + 1;
    }
  });
  const rankingSubs = Object.entries(contSubs)
    .map(([id, total]) => ({ nome: professores.find(p => p.id === id)?.nome?.split(' ')[0] || 'N/A', total }))
    .sort((a, b) => b.total - a.total).slice(0, 6);

  // Distribuição carga horária
  const distribuicaoCarga = professores.map(p => {
    const aulasFixas = calcAulasAtribuidas(p);
    const extras = p.aulasExtras || 0;
    return {
      nome: p.nome.split(' ')[0],
      aulas: aulasFixas,
      extras,
      total: aulasFixas + extras,
    };
  }).sort((a, b) => b.total - a.total).slice(0, 10);

  // Substituições por dia da semana
  const subsPorDia = DIAS.map(dia => {
    const total = substituicoes.filter(s => {
      const d = new Date(s.data + 'T12:00:00');
      const nomeDia = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][d.getDay()];
      return nomeDia === dia;
    }).length;
    return { dia: dia.substring(0, 3), total };
  });

  // Carga por área
  const cargaPorArea = areas.map((area, i) => {
    const profsDaArea = professores.filter(p => area.professorIds.includes(p.id));
    const totalAulas = profsDaArea.reduce((acc, p) => acc + calcAulasAtribuidas(p) + (p.aulasExtras || 0), 0);
    return { name: area.nome.split(' ')[0], value: totalAulas, color: CORES[i % CORES.length] };
  }).filter(a => a.value > 0);

  // Evolução últimos 30 dias
  const evolucao30dias = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dStr = d.toISOString().split('T')[0];
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    const total = substituicoes.filter(s => s.data === dStr).length;
    return { dia: label, total };
  });

  const card = `rounded-2xl p-5 shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`;
  const text = darkMode ? 'text-gray-100' : 'text-gray-800';
  const subtext = darkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = darkMode ? 'bg-gray-700' : 'bg-gray-50';
  const tooltipStyle = { backgroundColor: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' };

  return (
    <div className={`space-y-6 ${text}`}>

      {/* Header saudação */}
      <div className="rounded-2xl p-6 shadow-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              {diaSemanaHoje === 0 || diaSemanaHoje === 6 ? '🏖️ Bom final de semana!' :
                diaSemanaHoje === 1 ? '☀️ Boa semana!' : '👋 Bom dia!'}
            </h2>
            <p className="opacity-90 mt-1">
              {hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Professores', value: professores.length, color: 'bg-white/20' },
              { label: 'Faltas hoje', value: substituicoesHoje.length, color: 'bg-white/20' },
              { label: 'Faltas semana', value: substituicoesSemana.length, color: 'bg-white/20' },
              { label: '🚫 Bloqueados', value: professores.filter(p => (calcAulasAtribuidas(p) + (p.aulasExtras || 0)) >= limiteAulas).length, color: 'bg-red-400/40' },
            ].map((item, i) => (
              <div key={i} className={`text-center ${item.color} rounded-xl px-4 py-2`}>
                <div className="text-3xl font-bold">{item.value}</div>
                <div className="text-xs opacity-80">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Linha 1: Alertas + Substituições hoje */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Alertas de carga */}
        <div className={card}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">⚠️</span> Professores no Limite de Aulas
          </h3>
          {professoresAlerta.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">✅</div>
              <p className={subtext}>Nenhum professor próximo do limite!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {/* Legenda rápida */}
              <div className="flex gap-2 flex-wrap text-xs mb-1">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"/>🚫 No limite — não pode substituir</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"/>⚠️ Quase no limite</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"/>Atenção</span>
              </div>
              {professoresAlerta.map(p => (
                <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border-l-4 ${
                  p.saldo <= 0
                    ? darkMode ? 'bg-red-950 border-red-500' : 'bg-red-50 border-red-500'
                    : p.saldo <= 2
                    ? darkMode ? 'bg-orange-950 border-orange-500' : 'bg-orange-50 border-orange-500'
                    : darkMode ? 'bg-yellow-950 border-yellow-500' : 'bg-yellow-50 border-yellow-500'
                }`}>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0
                    ${p.saldo <= 0 ? 'bg-red-500' : p.saldo <= 2 ? 'bg-orange-500' : 'bg-yellow-500'}`}>
                    {p.nome.split(' ').filter(Boolean).map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{p.nome}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${p.saldo <= 0 ? 'bg-red-500' : p.saldo <= 2 ? 'bg-orange-500' : 'bg-yellow-400'}`}
                          style={{ width: `${Math.min(100, (p.totalAulas / limiteAulas) * 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold tabular-nums ${p.saldo <= 0 ? 'text-red-600' : 'text-orange-600'}`}>
                        {p.totalAulas}/{limiteAulas}
                      </span>
                    </div>
                    {/* Linha descritiva */}
                    <div className={`text-xs mt-0.5 ${p.saldo <= 0 ? 'text-red-600 font-semibold' : 'text-orange-600'}`}>
                      {p.saldo <= 0
                        ? '🚫 Atingiu o limite — não pode receber substituições'
                        : p.saldo === 1
                        ? `⚠️ Só pode receber mais 1 aula de substituição`
                        : `⚠️ Pode receber até mais ${p.saldo} aulas de substituição`}
                    </div>
                  </div>

                  {/* Badge status */}
                  <div className={`text-xs font-bold px-2 py-1.5 rounded-lg whitespace-nowrap text-center ${
                    p.saldo <= 0
                      ? 'bg-red-500 text-white'
                      : p.saldo <= 2
                      ? 'bg-orange-500 text-white'
                      : 'bg-yellow-400 text-gray-900'
                  }`}>
                    {p.saldo <= 0 ? '🚫 LIMITE' : `+${p.saldo} livres`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Substituições hoje */}
        <div className={card}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span> Faltas Registradas Hoje
            {diaAtual && (
              <span className={`text-sm font-normal px-2 py-0.5 rounded-full ${darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                {diaAtual}
              </span>
            )}
          </h3>
          {substituicoesHoje.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🎉</div>
              <p className={subtext}>Nenhuma falta registrada hoje!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {substituicoesHoje.map(s => {
                const ausente = professores.find(p => p.id === s.professorFaltouId);
                const substituto = professores.find(p => p.id === s.professorSubstitutoId);
                const horario = horarios[s.horario - 1];
                return (
                  <div key={s.id} className={`p-3 rounded-xl border-l-4 ${darkMode ? 'bg-gray-700 border-red-500' : 'bg-red-50 border-red-400'}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">Ausente: {ausente?.nome}</div>
                        <div className={`text-xs mt-0.5 ${subtext}`}>
                          {horario ? `${horario.inicio} – ${horario.fim}` : `${s.horario}ª aula`}
                        </div>
                      </div>
                      <div className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap
                        ${s.confirmada ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {s.confirmada ? '✓ Confirmado' : '⏳ Pendente'}
                      </div>
                    </div>
                    {substituto && (
                      <div className="mt-1 text-xs text-green-600 font-semibold">
                        ↳ Substituto: {substituto.nome}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Linha 2: Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Carga horária dos professores */}
        <div className={`${card} lg:col-span-2`}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span> Carga Horária — Top Professores
          </h3>
          {distribuicaoCarga.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Importe a planilha de atribuições para ver os dados</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={distribuicaoCarga} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f0f0f0'} />
                <XAxis dataKey="nome" tick={{ fontSize: 11, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: darkMode ? '#f9fafb' : '#111827', fontWeight: 'bold' }} />
                <Legend />
                <Bar dataKey="aulas" name="Aulas Fixas" stackId="a" fill="#6366f1" />
                <Bar dataKey="extras" name="Substituições" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Carga por área */}
        <div className={card}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">🧩</span> Aulas por Área
          </h3>
          {cargaPorArea.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Configure as Áreas de Conhecimento</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={cargaPorArea} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {cargaPorArea.map((_, index) => (
                      <Cell key={index} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} aulas`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {cargaPorArea.map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
                      <span className="truncate">{a.name}</span>
                    </span>
                    <span className="font-bold ml-2">{a.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Linha 3: Rankings + Subs por dia */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Substituições por dia da semana */}
        <div className={card}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">📅</span> Substituições por Dia
          </h3>
          {subsPorDia.every(d => d.total === 0) ? (
            <div className="text-center py-8 text-gray-400 text-sm">Sem histórico ainda</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={subsPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f0f0f0'} />
                <XAxis dataKey="dia" tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="total" name="Substituições" radius={[6, 6, 0, 0]}>
                  {subsPorDia.map((_, index) => (
                    <Cell key={index} fill={CORES[index % CORES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Ranking faltas */}
        <div className={card}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">🏆</span> Mais Ausências
          </h3>
          {rankingFaltas.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Sem histórico ainda</div>
          ) : (
            <div className="space-y-2">
              {rankingFaltas.map((p, i) => (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl ${cardBg}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                    ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-400' : i === 2 ? 'bg-yellow-400' : 'bg-gray-400'}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">{p.nome}</span>
                  <span className="text-sm font-bold text-red-500">{p.total}x</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ranking substituições */}
        <div className={card}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">🦸</span> Mais Substituiu
          </h3>
          {rankingSubs.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Sem histórico ainda</div>
          ) : (
            <div className="space-y-2">
              {rankingSubs.map((p, i) => (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl ${cardBg}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                    ${i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-blue-400' : i === 2 ? 'bg-cyan-400' : 'bg-gray-400'}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">{p.nome}</span>
                  <span className="text-sm font-bold text-indigo-500">{p.total}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Linha 4: Evolução 30 dias */}
      <div className={card}>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span className="text-2xl">📈</span> Evolução de Faltas — Últimos 30 dias
        </h3>
        {evolucao30dias.every(d => d.total === 0) ? (
          <div className="text-center py-8 text-gray-400">Sem histórico de faltas nos últimos 30 dias</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={evolucao30dias} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f0f0f0'} />
              <XAxis dataKey="dia" tick={{ fontSize: 10, fill: darkMode ? '#9ca3af' : '#6b7280' }} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: darkMode ? '#9ca3af' : '#6b7280' }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="total" name="Faltas" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Resumo Geral */}
      {/* Resumo Geral */}
      {(() => {
        const noLimite = professores.filter(p => {
          const total = calcAulasAtribuidas(p) + (p.aulasExtras || 0);
          return total >= limiteAulas;
        });
        const proximos = professoresAlerta.filter(p => p.saldo > 0);
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '👨‍🏫', label: 'Total de Professores', value: professores.length, color: 'from-indigo-500 to-indigo-600', sub: null },
              { icon: '📚', label: 'Total de Substituições', value: substituicoes.length, color: 'from-purple-500 to-purple-600', sub: null },
              { icon: '🚫', label: 'Bloqueados p/ Substituir', value: noLimite.length, color: 'from-red-500 to-red-600', sub: 'Atingiram 32 aulas' },
              { icon: '⚠️', label: 'Próximos do Limite', value: proximos.length, color: 'from-amber-500 to-orange-500', sub: 'Saldo ≤ 4 aulas' },
            ].map((item, i) => (
              <div key={i} className={`rounded-2xl p-5 bg-gradient-to-br ${item.color} text-white shadow-lg`}>
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-3xl font-bold">{item.value}</div>
                <div className="text-sm opacity-90 mt-1 font-semibold">{item.label}</div>
                {item.sub && <div className="text-xs opacity-70 mt-0.5">{item.sub}</div>}
              </div>
            ))}
          </div>
        );
      })()}

    </div>
  );
}
