import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Professor, Substituicao, AreaConhecimento, HorarioAula, Turma, Disciplina } from '../types/index';

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
const CHART_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#65a30d', '#9333ea'];

// Componente de card padrão
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

// Componente de header de seção
const SectionHeader = ({ icon, title, badge }: { icon: string; title: string; badge?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
    <div className="flex items-center gap-2.5">
      <span className="text-lg">{icon}</span>
      <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
    </div>
    {badge}
  </div>
);

export default function DashboardTab({ professores, substituicoes, grade, areas, horarios, limiteAulas }: Props) {
  const hoje = new Date();
  const diaSemanaHoje = hoje.getDay();
  const diaAtual = diaSemanaHoje >= 1 && diaSemanaHoje <= 5 ? DIAS[diaSemanaHoje - 1] : null;

  const calcAulasAtribuidas = (prof: Professor): number => {
    if (prof.atribuicoes && prof.atribuicoes.length > 0) {
      return prof.atribuicoes.reduce((acc, a) => acc + (a.aulasAtribuidas || 0), 0);
    }
    let total = 0;
    Object.values(grade).forEach(diaGrade => {
      Object.values(diaGrade).forEach((slots: GradeSlot[]) => {
        total += slots.filter((s: GradeSlot) => s.professorId === prof.id).length;
      });
    });
    return total;
  };

  const calcTotalAulas = (prof: Professor): number =>
    calcAulasAtribuidas(prof) + (prof.aulasExtras || 0);

  const professoresAlerta = professores
    .map(p => {
      const aulasAtribuidas = calcAulasAtribuidas(p);
      const totalAulas = calcTotalAulas(p);
      const saldo = limiteAulas - totalAulas;
      return { ...p, aulasAtribuidas, totalAulas, saldo };
    })
    .filter(p => p.saldo <= 4)
    .sort((a, b) => a.saldo - b.saldo);

  const hojeStr = hoje.toISOString().split('T')[0];
  const substituicoesHoje = substituicoes.filter(s => s.data === hojeStr);

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

  const contFaltas: Record<string, number> = {};
  substituicoes.forEach(s => {
    contFaltas[s.professorFaltouId] = (contFaltas[s.professorFaltouId] || 0) + 1;
  });
  const rankingFaltas = Object.entries(contFaltas)
    .map(([id, total]) => ({ nome: professores.find(p => p.id === id)?.nome?.split(' ')[0] || 'N/A', total }))
    .sort((a, b) => b.total - a.total).slice(0, 6);

  const contSubs: Record<string, number> = {};
  substituicoes.forEach(s => {
    if (s.professorSubstitutoId) {
      contSubs[s.professorSubstitutoId] = (contSubs[s.professorSubstitutoId] || 0) + 1;
    }
  });
  const rankingSubs = Object.entries(contSubs)
    .map(([id, total]) => ({ nome: professores.find(p => p.id === id)?.nome?.split(' ')[0] || 'N/A', total }))
    .sort((a, b) => b.total - a.total).slice(0, 6);

  const distribuicaoCarga = professores.map(p => ({
    nome: p.nome.split(' ')[0],
    aulas: calcAulasAtribuidas(p),
    extras: p.aulasExtras || 0,
    total: calcTotalAulas(p),
  })).sort((a, b) => b.total - a.total).slice(0, 10);

  const subsPorDia = DIAS.map(dia => {
    const total = substituicoes.filter(s => {
      const d = new Date(s.data + 'T12:00:00');
      const nomeDia = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][d.getDay()];
      return nomeDia === dia;
    }).length;
    return { dia: dia.substring(0, 3), total };
  });

  const cargaPorArea = areas.map((area, i) => {
    const profsDaArea = professores.filter(p => area.professorIds.includes(p.id));
    const totalAulas = profsDaArea.reduce((acc, p) => acc + calcAulasAtribuidas(p) + (p.aulasExtras || 0), 0);
    return { name: area.nome.split(' ')[0], value: totalAulas, color: CHART_COLORS[i % CHART_COLORS.length] };
  }).filter(a => a.value > 0);

  const evolucao30dias = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dStr = d.toISOString().split('T')[0];
    return {
      dia: `${d.getDate()}/${d.getMonth() + 1}`,
      total: substituicoes.filter(s => s.data === dStr).length,
    };
  });

  const noLimite = professores.filter(p => calcTotalAulas(p) >= limiteAulas);
  const proximos = professoresAlerta.filter(p => p.saldo > 0);

  const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    fontSize: '13px',
  };

  const saudacao = diaSemanaHoje === 0 || diaSemanaHoje === 6
    ? 'Bom final de semana'
    : diaSemanaHoje === 1 ? 'Boa semana' : 'Bom dia';

  return (
    <div className="space-y-6 fade-in">

      {/* ── Header institucional ─────────────────────────────────────── */}
      <div className="bg-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">
              {hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            <h2 className="text-2xl font-bold tracking-tight">{saudacao}!</h2>
            <p className="text-blue-100 text-sm mt-1">Painel de Controle — Sistema de Substituição Docente</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Professores',   value: professores.length,          bg: 'bg-white/10' },
              { label: 'Faltas hoje',   value: substituicoesHoje.length,    bg: 'bg-white/10' },
              { label: 'Esta semana',   value: substituicoesSemana.length,  bg: 'bg-white/10' },
              { label: 'Bloqueados',    value: noLimite.length,             bg: noLimite.length > 0 ? 'bg-red-500/40' : 'bg-white/10' },
            ].map((item, i) => (
              <div key={i} className={`${item.bg} rounded-lg px-4 py-3 text-center min-w-[80px]`}>
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-xs text-blue-100 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPIs resumo ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            ),
            label: 'Professores', value: professores.length, sub: 'cadastrados', color: 'text-blue-600', bg: 'bg-blue-50',
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            ),
            label: 'Substituições', value: substituicoes.length, sub: 'registradas', color: 'text-violet-600', bg: 'bg-violet-50',
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            ),
            label: 'Bloqueados', value: noLimite.length, sub: 'no limite de 32 aulas', color: 'text-red-600', bg: 'bg-red-50',
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            ),
            label: 'Atenção', value: proximos.length, sub: 'próximos do limite', color: 'text-amber-600', bg: 'bg-amber-50',
          },
        ].map((item, i) => (
          <Card key={i} className="p-5">
            <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-lg flex items-center justify-center mb-3`}>
              {item.icon}
            </div>
            <div className="text-2xl font-bold text-slate-800">{item.value}</div>
            <div className="text-sm font-semibold text-slate-600 mt-0.5">{item.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{item.sub}</div>
          </Card>
        ))}
      </div>

      {/* ── Alertas + Hoje ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Professores no Limite */}
        <Card className="p-5">
          <SectionHeader
            icon="⚠"
            title="Professores no Limite"
            badge={
              professoresAlerta.length > 0 ? (
                <span className="text-xs font-semibold bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full">
                  {professoresAlerta.length} professor{professoresAlerta.length > 1 ? 'es' : ''}
                </span>
              ) : null
            }
          />
          {professoresAlerta.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="text-slate-500 text-sm font-medium">Todos dentro do limite!</p>
              <p className="text-slate-400 text-xs mt-1">Nenhum professor próximo do limite de {limiteAulas} aulas</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {professoresAlerta.map(p => (
                <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                  p.saldo <= 0
                    ? 'bg-red-50 border-red-200'
                    : p.saldo <= 2
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${
                    p.saldo <= 0 ? 'bg-red-500' : p.saldo <= 2 ? 'bg-orange-500' : 'bg-amber-500'
                  }`}>
                    {p.nome.split(' ').filter(Boolean).map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-800 truncate">{p.nome}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${p.saldo <= 0 ? 'bg-red-500' : p.saldo <= 2 ? 'bg-orange-500' : 'bg-amber-400'}`}
                          style={{ width: `${Math.min(100, (p.totalAulas / limiteAulas) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 tabular-nums whitespace-nowrap">
                        {p.totalAulas}/{limiteAulas}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 font-medium ${p.saldo <= 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {p.saldo <= 0
                        ? 'Não pode receber substituições'
                        : `Pode receber até mais ${p.saldo} aula${p.saldo > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap ${
                    p.saldo <= 0 ? 'bg-red-500 text-white' : p.saldo <= 2 ? 'bg-orange-500 text-white' : 'bg-amber-400 text-slate-800'
                  }`}>
                    {p.saldo <= 0 ? 'Bloqueado' : `+${p.saldo}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Faltas hoje */}
        <Card className="p-5">
          <SectionHeader
            icon="📋"
            title="Faltas Registradas Hoje"
            badge={
              diaAtual ? (
                <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                  {diaAtual}
                </span>
              ) : undefined
            }
          />
          {substituicoesHoje.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <p className="text-slate-500 text-sm font-medium">Nenhuma falta hoje!</p>
              <p className="text-slate-400 text-xs mt-1">Todas as aulas estão cobertas</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {substituicoesHoje.map(s => {
                const ausente = professores.find(p => p.id === s.professorFaltouId);
                const substituto = professores.find(p => p.id === s.professorSubstitutoId);
                const horario = horarios[s.horario - 1];
                return (
                  <div key={s.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-800 truncate">{ausente?.nome}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {horario ? `${horario.inicio} – ${horario.fim}` : `${s.horario}ª aula`}
                      </div>
                      {substituto && (
                        <div className="text-xs text-emerald-600 font-medium mt-1">
                          Substituto: {substituto.nome}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md whitespace-nowrap ${
                      s.confirmada
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {s.confirmada ? 'Confirmado' : 'Pendente'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Gráficos principais ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Carga horária */}
        <Card className="p-5 lg:col-span-2">
          <SectionHeader icon="📊" title="Carga Horária dos Professores" />
          {distribuicaoCarga.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              Importe a planilha de atribuições para visualizar
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={distribuicaoCarga} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="nome" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                <Bar dataKey="aulas" name="Aulas Fixas" stackId="a" fill="#2563eb" />
                <Bar dataKey="extras" name="Substituições" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Aulas por área */}
        <Card className="p-5">
          <SectionHeader icon="🧩" title="Aulas por Área" />
          {cargaPorArea.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              Configure as Áreas de Conhecimento
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={cargaPorArea} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                    {cargaPorArea.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} aulas`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3 border-t border-slate-100 pt-3">
                {cargaPorArea.map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
                      <span className="text-slate-600 truncate">{a.name}</span>
                    </span>
                    <span className="font-semibold text-slate-700 ml-2">{a.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* ── Rankings + Subs por dia ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Substituições por dia */}
        <Card className="p-5">
          <SectionHeader icon="📅" title="Substituições por Dia" />
          {subsPorDia.every(d => d.total === 0) ? (
            <div className="text-center py-8 text-slate-400 text-sm">Sem histórico ainda</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={subsPorDia} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="total" name="Substituições" radius={[6, 6, 0, 0]}>
                  {subsPorDia.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Ranking Ausências */}
        <Card className="p-5">
          <SectionHeader icon="📉" title="Mais Ausências" />
          {rankingFaltas.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">Sem histórico ainda</div>
          ) : (
            <div className="space-y-2">
              {rankingFaltas.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                    i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-400' : i === 2 ? 'bg-amber-400' : 'bg-slate-300'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-slate-700 font-medium truncate">{p.nome}</span>
                  <span className="text-sm font-bold text-red-500">{p.total}×</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Ranking Substitutos */}
        <Card className="p-5">
          <SectionHeader icon="📈" title="Mais Substituiu" />
          {rankingSubs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">Sem histórico ainda</div>
          ) : (
            <div className="space-y-2">
              {rankingSubs.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                    i === 0 ? 'bg-blue-600' : i === 1 ? 'bg-blue-400' : i === 2 ? 'bg-blue-300' : 'bg-slate-300'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-slate-700 font-medium truncate">{p.nome}</span>
                  <span className="text-sm font-bold text-blue-600">{p.total}×</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Evolução 30 dias ─────────────────────────────────────────── */}
      <Card className="p-5">
        <SectionHeader icon="📈" title="Evolução de Faltas — Últimos 30 dias" />
        {evolucao30dias.every(d => d.total === 0) ? (
          <div className="text-center py-8 text-slate-400 text-sm">Sem registros nos últimos 30 dias</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={evolucao30dias} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dia" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="total" name="Faltas" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#2563eb' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

    </div>
  );
}
