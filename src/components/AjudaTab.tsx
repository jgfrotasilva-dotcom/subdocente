import { useState } from 'react';

type Secao = 'visao-geral' | 'fluxo' | 'regras' | 'passo-a-passo' | 'exemplos' | 'duvidas' | 'offline';

const secoes = [
  { id: 'visao-geral', icon: '🏫', label: 'Visão Geral' },
  { id: 'fluxo', icon: '🔄', label: 'Fluxo do Sistema' },
  { id: 'regras', icon: '📋', label: 'Regras' },
  { id: 'passo-a-passo', icon: '👣', label: 'Passo a Passo' },
  { id: 'exemplos', icon: '💡', label: 'Exemplos Práticos' },
  { id: 'duvidas', icon: '❓', label: 'Dúvidas Frequentes' },
  { id: 'offline', icon: '📲', label: 'Uso Offline / Instalar' },
];

export default function AjudaTab() {
  const [secaoAtiva, setSecaoAtiva] = useState<Secao>('visao-geral');
  const [exemploAtivo, setExemploAtivo] = useState(0);

  return (
    <div className="space-y-6">

      {/* Header da Ajuda */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-3">
          <div className="text-5xl">📖</div>
          <div>
            <h1 className="text-3xl font-bold">Central de Ajuda</h1>
            <p className="text-blue-200 text-lg">Entenda como funciona a lógica de substituições</p>
          </div>
        </div>
        <p className="text-blue-100 text-sm max-w-3xl">
          Este guia explica detalhadamente como o sistema gerencia as substituições de professores,
          as regras aplicadas e como utilizar cada funcionalidade.
        </p>
      </div>

      {/* Navegação interna */}
      <div className="flex flex-wrap gap-2">
        {secoes.map(s => (
          <button
            key={s.id}
            onClick={() => setSecaoAtiva(s.id as Secao)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              secaoAtiva === s.id
                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200'
            }`}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* ── VISÃO GERAL ─────────────────────────────────────── */}
      {secaoAtiva === 'visao-geral' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              🏫 Como a Escola Funciona
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { icon: '📚', title: 'Ensino Fundamental', desc: 'Atende alunos do 6º ao 9º ano do Ensino Fundamental de 9 anos', color: 'blue' },
                { icon: '⏰', title: 'Período Integral', desc: '9 horas de atividades diárias com 9 aulas de 50 minutos cada', color: 'emerald' },
                { icon: '🔄', title: 'Substituição por Pares', desc: 'Quando um professor falta, seus colegas o substituem — sem professor eventual', color: 'purple' },
              ].map(card => (
                <div key={card.title} className={`bg-${card.color}-50 border border-${card.color}-200 rounded-xl p-6 text-center`}>
                  <div className="text-4xl mb-3">{card.icon}</div>
                  <h3 className={`font-bold text-${card.color}-800 text-lg mb-2`}>{card.title}</h3>
                  <p className={`text-${card.color}-700 text-sm`}>{card.desc}</p>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4">📅 Grade de Horários (50 min cada aula)</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 mb-8">
              {[
                { n: '1ª', h: '07:00–07:50' },
                { n: '2ª', h: '07:50–08:40' },
                { n: '3ª', h: '08:40–09:30' },
                { n: '4ª', h: '09:50–10:40', intervalo: true },
                { n: '5ª', h: '10:40–11:30' },
                { n: '6ª', h: '11:30–12:20' },
                { n: '7ª', h: '13:20–14:10', almoco: true },
                { n: '8ª', h: '14:10–15:00' },
                { n: '9ª', h: '15:00–15:50' },
              ].map((aula, i) => (
                <div key={i} className="text-center">
                  {aula.intervalo && (
                    <div className="text-xs text-orange-600 font-bold mb-1">Intervalo⬇</div>
                  )}
                  {aula.almoco && (
                    <div className="text-xs text-orange-600 font-bold mb-1">Almoço⬇</div>
                  )}
                  <div className="bg-indigo-600 text-white rounded-lg p-2">
                    <div className="font-bold">{aula.n}</div>
                    <div className="text-xs text-indigo-200">{aula.h.split('–')[0]}</div>
                    <div className="text-xs text-indigo-200">{aula.h.split('–')[1]}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-5">
              <h4 className="font-bold text-amber-800 text-lg mb-2">⚠️ Regra Principal</h4>
              <p className="text-amber-700">
                Cada professor tem um <strong>limite de 32 aulas semanais</strong>. Ao substituir um colega,
                essas aulas extras são somadas às suas aulas fixas. Quando o limite é atingido,
                o professor não aparece mais como disponível para substituições.
              </p>
            </div>
          </div>

          {/* Abas do sistema */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🖥️ As 4 Abas do Sistema</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  icon: '⚙️', cor: 'bg-slate-600', aba: 'CONFIGURAÇÕES',
                  desc: 'Ponto de partida do sistema.',
                  itens: ['Upload da planilha de atribuições (.xlsx)', 'Cadastro de turmas (6º ao 9º ano)', 'Cadastro de disciplinas', 'Cards dos professores com suas turmas e disciplinas', 'Configuração de horários e limite de aulas']
                },
                {
                  icon: '📅', cor: 'bg-indigo-600', aba: 'GRADE HORÁRIA',
                  desc: 'Montagem visual da grade de horários.',
                  itens: ['Selecione a turma para ver a grade', 'Painel mostra aulas atribuídas vs. alocadas', 'Clique nos slots para alocar professor + disciplina', 'Cores diferentes para cada disciplina', 'Suporte a múltiplos professores (ex: Eletiva)']
                },
                {
                  icon: '🔄', cor: 'bg-emerald-600', aba: 'SUBSTITUIÇÃO',
                  desc: 'Coração do sistema — gerencia as faltas.',
                  itens: ['Selecione o professor que faltou', 'Escolha o dia da semana e a data', 'Sistema busca automaticamente as aulas do dia', 'Para cada aula, mostra quem está disponível', 'Confirme a escala — sistema registra e debita as aulas']
                },
                {
                  icon: '📊', cor: 'bg-purple-600', aba: 'HISTÓRICO',
                  desc: 'Registro e estatísticas de todas as substituições.',
                  itens: ['Todas as substituições registradas', 'Filtro por professor ou data', 'Estatísticas: quem mais faltou, quem mais substituiu', 'Relatório semanal/mensal']
                },
              ].map(item => (
                <div key={item.aba} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className={`${item.cor} text-white p-4 flex items-center gap-3`}>
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <div className="font-bold text-lg">{item.aba}</div>
                      <div className="text-white/80 text-sm">{item.desc}</div>
                    </div>
                  </div>
                  <ul className="p-4 space-y-2">
                    {item.itens.map((it, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5">✓</span>
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FLUXO DO SISTEMA ────────────────────────────────── */}
      {secaoAtiva === 'fluxo' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              🔄 Fluxo Completo do Sistema
            </h2>

            {/* Fluxo de configuração */}
            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-slate-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">1</span>
              Configuração Inicial (feita uma vez)
            </h3>
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {[
                { icon: '📤', label: 'Upload da planilha Excel', cor: 'bg-blue-100 text-blue-800 border-blue-300' },
                { icon: '→', label: '', cor: 'bg-transparent text-gray-400 border-transparent text-xl font-bold' },
                { icon: '👨‍🏫', label: 'Professores criados automaticamente', cor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                { icon: '→', label: '', cor: 'bg-transparent text-gray-400 border-transparent text-xl font-bold' },
                { icon: '📋', label: 'Disciplinas e turmas cadastradas', cor: 'bg-purple-100 text-purple-800 border-purple-300' },
                { icon: '→', label: '', cor: 'bg-transparent text-gray-400 border-transparent text-xl font-bold' },
                { icon: '📅', label: 'Grade horária montada', cor: 'bg-amber-100 text-amber-800 border-amber-300' },
              ].map((step, i) => (
                step.label ? (
                  <div key={i} className={`border rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2 ${step.cor}`}>
                    <span>{step.icon}</span>
                    <span>{step.label}</span>
                  </div>
                ) : (
                  <div key={i} className="text-gray-400 text-2xl font-bold">→</div>
                )
              ))}
            </div>

            {/* Fluxo de substituição */}
            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-emerald-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">2</span>
              Fluxo de Substituição (cada falta)
            </h3>

            <div className="relative">
              {/* Linha vertical */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-400 via-amber-400 via-blue-400 to-emerald-400"></div>

              <div className="space-y-4 pl-20">
                {[
                  {
                    cor: 'bg-red-500', icone: '🚨', titulo: 'Professor não comparece',
                    desc: 'A coordenação é informada de que o professor X não veio trabalhar naquele dia.',
                    detalhe: 'Isso pode ocorrer por doença, licença, atividade externa, etc.'
                  },
                  {
                    cor: 'bg-amber-500', icone: '🔍', titulo: 'Sistema busca as aulas do dia',
                    desc: 'Na aba SUBSTITUIÇÃO, selecione o professor e o dia. O sistema busca automaticamente todas as aulas que ele teria naquele dia.',
                    detalhe: 'As aulas são buscadas diretamente da Grade Horária cadastrada.'
                  },
                  {
                    cor: 'bg-blue-500', icone: '📊', titulo: 'Verificação de disponibilidade',
                    desc: 'Para cada aula, o sistema verifica TODOS os outros professores e filtra quem pode substituir.',
                    detalhe: 'Dois critérios são verificados simultaneamente (veja na aba Regras).'
                  },
                  {
                    cor: 'bg-indigo-500', icone: '👆', titulo: 'Coordenação escolhe os substitutos',
                    desc: 'Para cada horário, aparece uma lista de professores disponíveis. A coordenação seleciona quem vai substituir em cada aula.',
                    detalhe: 'O sistema mostra o saldo atual de cada professor (ex: 28/32 aulas).'
                  },
                  {
                    cor: 'bg-emerald-500', icone: '✅', titulo: 'Escala confirmada e registrada',
                    desc: 'Ao confirmar, o sistema registra as substituições no histórico e debita automaticamente as aulas extras de cada substituto.',
                    detalhe: 'O saldo de aulas é atualizado em tempo real para os próximos registros.'
                  },
                ].map((step, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-12 w-8 h-8 ${step.cor} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                      {i + 1}
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{step.icone}</span>
                        <h4 className="font-bold text-gray-800 text-lg">{step.titulo}</h4>
                      </div>
                      <p className="text-gray-700 mb-2">{step.desc}</p>
                      <p className="text-gray-500 text-sm italic">💡 {step.detalhe}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Diagrama da lógica de verificação */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🧠 Lógica de Verificação de Disponibilidade</h2>
            <p className="text-gray-600 mb-6">Para cada professor, o sistema faz duas perguntas simultaneamente:</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="font-bold text-blue-800 text-lg mb-3">Pergunta 1: Está livre no horário?</h3>
                <p className="text-blue-700 text-sm mb-4">
                  O sistema verifica se o professor já tem uma aula na Grade Horária para aquele mesmo
                  dia e horário (em qualquer turma).
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-blue-200">
                    <span className="text-green-500 text-lg">✅</span>
                    <span className="text-sm text-gray-700"><strong>Livre:</strong> não tem aula nesse horário → pode substituir</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-blue-200">
                    <span className="text-red-500 text-lg">❌</span>
                    <span className="text-sm text-gray-700"><strong>Ocupado:</strong> já tem aula nesse horário → não pode substituir</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-amber-800 text-lg mb-3">Pergunta 2: Tem saldo de aulas?</h3>
                <p className="text-amber-700 text-sm mb-4">
                  O sistema verifica se o total de aulas do professor (fixas + extras de substituição)
                  ainda está abaixo do limite de 32 por semana.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-amber-200">
                    <span className="text-green-500 text-lg">✅</span>
                    <span className="text-sm text-gray-700"><strong>Com saldo:</strong> total &lt; 32 aulas → pode substituir</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-amber-200">
                    <span className="text-red-500 text-lg">❌</span>
                    <span className="text-sm text-gray-700"><strong>Sem saldo:</strong> total = 32 aulas → não pode substituir</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-emerald-50 border-2 border-emerald-300 rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="font-bold text-emerald-800 text-xl mb-2">Professor DISPONÍVEL para substituir</h3>
              <p className="text-emerald-700">
                <strong>Pergunta 1 = SIM</strong> (está livre) <strong>E Pergunta 2 = SIM</strong> (tem saldo)
              </p>
              <p className="text-emerald-600 text-sm mt-2">
                Ambas as condições precisam ser verdadeiras ao mesmo tempo
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── REGRAS ──────────────────────────────────────────── */}
      {secaoAtiva === 'regras' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Regras do Sistema</h2>

            <div className="space-y-6">
              {[
                {
                  num: '01', cor: 'red', titulo: 'Limite de 32 aulas semanais',
                  regra: 'Nenhum professor pode ter mais de 32 aulas em uma semana, somando aulas fixas e de substituição.',
                  formula: 'Aulas Fixas + Aulas de Substituição ≤ 32',
                  exemplo: 'Prof. Ana tem 28 aulas fixas. Pode pegar até 4 substituições na semana.',
                  impacto: 'Professor não aparece na lista de disponíveis quando o limite é atingido.'
                },
                {
                  num: '02', cor: 'blue', titulo: 'Sem conflito de horários',
                  regra: 'O professor substituto precisa estar livre no horário da aula que vai cobrir. Não pode estar em duas turmas ao mesmo tempo.',
                  formula: 'Horário do substituto ≠ Horário de nenhuma de suas aulas fixas',
                  exemplo: 'Prof. Carlos tem aula na 3ª hora às segundas. Não pode substituir nesse horário em outra turma.',
                  impacto: 'Professor não aparece na lista de disponíveis para aquele horário específico.'
                },
                {
                  num: '03', cor: 'purple', titulo: 'Sem auto-substituição',
                  regra: 'O professor que faltou não pode ser listado como substituto de si mesmo.',
                  formula: 'Substituto ≠ Professor que faltou',
                  exemplo: 'Óbvio: se o Prof. João faltou, ele não pode substituir o próprio Prof. João.',
                  impacto: 'O professor faltante é automaticamente excluído da lista de disponíveis.'
                },
                {
                  num: '04', cor: 'emerald', titulo: 'Contagem semanal resetável',
                  regra: 'As aulas extras (de substituição) são zeradas a cada semana pelo coordenador.',
                  formula: 'Nova semana → Aulas Extras = 0 para todos',
                  exemplo: 'Na segunda-feira, o coordenador clica em "Nova Semana" e todos os saldos voltam ao normal.',
                  impacto: 'O botão "Nova Semana" no rodapé do sistema realiza essa operação.'
                },
                {
                  num: '05', cor: 'amber', titulo: 'Múltiplos docentes por aula (Eletiva)',
                  regra: 'Disciplinas como Eletiva podem ter 2 ou mais professores no mesmo horário. A verificação de disponibilidade se aplica a cada um.',
                  formula: 'Um slot pode ter [Prof. A + Prof. B] na mesma turma/horário',
                  exemplo: 'Eletiva de 7º A na 5ª hora pode ter Prof. Maria E Prof. Carlos ao mesmo tempo.',
                  impacto: 'Configurado na aba Configurações → Disciplinas → "Múltiplos Docentes".'
                },
              ].map(item => (
                <div key={item.num} className={`border-l-4 border-${item.cor}-500 bg-${item.cor}-50 rounded-xl p-6`}>
                  <div className="flex items-start gap-4">
                    <div className={`bg-${item.cor}-500 text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                      {item.num}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-${item.cor}-800 text-xl mb-2`}>{item.titulo}</h3>
                      <p className={`text-${item.cor}-700 mb-3`}>{item.regra}</p>
                      <div className={`bg-${item.cor}-100 border border-${item.cor}-300 rounded-lg p-3 font-mono text-sm text-${item.cor}-800 mb-3`}>
                        📐 {item.formula}
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs font-bold text-gray-500 mb-1">💡 EXEMPLO</div>
                          <div className="text-sm text-gray-700">{item.exemplo}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs font-bold text-gray-500 mb-1">⚙️ IMPACTO NO SISTEMA</div>
                          <div className="text-sm text-gray-700">{item.impacto}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PASSO A PASSO ───────────────────────────────────── */}
      {secaoAtiva === 'passo-a-passo' && (
        <div className="space-y-6">
          {[
            {
              fase: 'FASE 1', titulo: 'Configuração Inicial', cor: 'slate', icon: '⚙️',
              desc: 'Faça isso apenas uma vez no início do ano ou semestre.',
              passos: [
                { n: 1, titulo: 'Faça o upload da planilha', desc: 'Vá em Configurações → clique no botão de Upload. Selecione seu arquivo .xlsx com as colunas: Professor, Turma, Qde.Aulas, Disciplina. O sistema cria tudo automaticamente.' },
                { n: 2, titulo: 'Revise os professores', desc: 'Na aba Configurações → Professores, os cards dos professores mostram todas as atribuições importadas. Verifique se os dados estão corretos.' },
                { n: 3, titulo: 'Ajuste os horários (se necessário)', desc: 'Em Configurações → Horários, verifique se os horários das 9 aulas estão corretos (padrão: 07:00 às 15:50, com intervalos).' },
                { n: 4, titulo: 'Configure disciplinas especiais', desc: 'Em Configurações → Disciplinas, marque "Múltiplos Docentes" para disciplinas como Eletiva que precisam de 2+ professores.' },
              ]
            },
            {
              fase: 'FASE 2', titulo: 'Montar a Grade Horária', cor: 'indigo', icon: '📅',
              desc: 'Monte a grade de cada turma com os professores e disciplinas.',
              passos: [
                { n: 1, titulo: 'Selecione a turma', desc: 'Na aba Grade Horária, escolha a turma (ex: 6º A). O painel lateral mostra todos os professores atribuídos e quantas aulas cada um precisa alocar.' },
                { n: 2, titulo: 'Clique nos slots vazios', desc: 'Clique em um slot vazio da grade (cruzamento de dia + horário). Um modal abre mostrando os professores disponíveis para aquela turma.' },
                { n: 3, titulo: 'Selecione professor e disciplina', desc: 'Escolha o professor e a disciplina. O slot é preenchido com uma cor única para aquela disciplina.' },
                { n: 4, titulo: 'Acompanhe o progresso', desc: 'O painel de atribuições mostra em tempo real: Atribuídas, Alocadas e Faltam. Continue até todas as aulas estarem 100% alocadas.' },
              ]
            },
            {
              fase: 'FASE 3', titulo: 'Registrar Substituição', cor: 'emerald', icon: '🔄',
              desc: 'Faça isso toda vez que um professor faltar.',
              passos: [
                { n: 1, titulo: 'Acesse a aba Substituição', desc: 'Clique na aba "Substituição" no menu superior.' },
                { n: 2, titulo: 'Selecione o professor e o dia', desc: 'Escolha o professor que faltou, o dia da semana e a data exata. Clique em "Buscar Aulas".' },
                { n: 3, titulo: 'Atribua os substitutos', desc: 'Para cada aula do professor faltante, selecione um professor disponível. O sistema mostra automaticamente quem pode substituir em cada horário, com o saldo atual de aulas.' },
                { n: 4, titulo: 'Confirme a escala', desc: 'Clique em "Confirmar Escala". O sistema registra tudo no histórico e atualiza o saldo de aulas de cada substituto.' },
              ]
            },
            {
              fase: 'FASE 4', titulo: 'Início de Nova Semana', cor: 'amber', icon: '📆',
              desc: 'Faça isso toda segunda-feira (ou início da semana letiva).',
              passos: [
                { n: 1, titulo: 'Clique em "Nova Semana"', desc: 'No rodapé do sistema, clique no botão "📅 Nova Semana".' },
                { n: 2, titulo: 'Confirme a operação', desc: 'Um aviso aparece pedindo confirmação. Isso zerará as aulas extras de todos os professores.' },
                { n: 3, titulo: 'Pronto!', desc: 'Todos os professores voltam ao saldo inicial (apenas aulas fixas contam). O histórico é mantido — apenas as aulas extras são zeradas.' },
              ]
            },
          ].map(fase => (
            <div key={fase.fase} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className={`bg-${fase.cor}-600 text-white p-6`}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{fase.icon}</span>
                  <div>
                    <div className={`text-${fase.cor}-200 text-sm font-bold`}>{fase.fase}</div>
                    <div className="text-2xl font-bold">{fase.titulo}</div>
                    <div className={`text-${fase.cor}-200 text-sm mt-1`}>{fase.desc}</div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {fase.passos.map(passo => (
                    <div key={passo.n} className="flex gap-4">
                      <div className={`bg-${fase.cor}-100 text-${fase.cor}-700 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0 border-2 border-${fase.cor}-300`}>
                        {passo.n}
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className="font-bold text-gray-800 mb-1">{passo.titulo}</h4>
                        <p className="text-gray-600 text-sm">{passo.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── EXEMPLOS PRÁTICOS ───────────────────────────────── */}
      {secaoAtiva === 'exemplos' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">💡 Exemplos Práticos</h2>
            <p className="text-gray-500 mb-6">Clique em cada cenário para ver o exemplo detalhado.</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {[
                'Prof. falta com saldo disponível',
                'Prof. no limite de aulas',
                'Nenhum professor disponível',
                'Disciplina Eletiva'
              ].map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setExemploAtivo(i)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    exemploAtivo === i
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
                  }`}
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* Exemplo 1 */}
            {exemploAtivo === 0 && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <h3 className="font-bold text-red-800 text-xl mb-1">🚨 Situação</h3>
                  <p className="text-red-700">Prof. <strong>Ricardo (Matemática)</strong> faltou numa <strong>segunda-feira</strong>.</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h3 className="font-bold text-blue-800 mb-3">📅 Aulas do Ricardo na Segunda</h3>
                  <div className="space-y-2">
                    {[
                      { hora: '1ª', turma: '6º A', disc: 'Matemática' },
                      { hora: '3ª', turma: '7º B', disc: 'Matemática' },
                      { hora: '7ª', turma: '8º C', disc: 'Matemática' },
                    ].map((a, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 border border-blue-200 flex items-center gap-4">
                        <span className="bg-blue-600 text-white rounded-lg px-3 py-1 font-bold text-sm">{a.hora} aula</span>
                        <span className="text-gray-700">{a.turma}</span>
                        <span className="text-blue-700 font-medium">{a.disc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                  <h3 className="font-bold text-emerald-800 mb-3">✅ Professores Disponíveis (sistema encontrou)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-emerald-100">
                          <th className="p-2 text-left text-emerald-800">Professor</th>
                          <th className="p-2 text-center text-emerald-800">Aulas Fixas</th>
                          <th className="p-2 text-center text-emerald-800">Extras</th>
                          <th className="p-2 text-center text-emerald-800">Total</th>
                          <th className="p-2 text-center text-emerald-800">1ª hora livre?</th>
                          <th className="p-2 text-center text-emerald-800">3ª hora livre?</th>
                          <th className="p-2 text-center text-emerald-800">7ª hora livre?</th>
                          <th className="p-2 text-center text-emerald-800">Disponível</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { nome: 'Ana (Ciências)', fixas: 25, extras: 2, h1: true, h3: true, h7: false },
                          { nome: 'Carlos (Ed.Física)', fixas: 20, extras: 0, h1: true, h3: false, h7: true },
                          { nome: 'Maria (Português)', fixas: 30, extras: 1, h1: false, h3: true, h7: true },
                          { nome: 'João (História)', fixas: 31, extras: 1, h1: true, h3: true, h7: true },
                        ].map((p, i) => {
                          const total = p.fixas + p.extras;
                          const semSaldo = total >= 32;
                          return (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="p-2 font-medium">{p.nome}</td>
                              <td className="p-2 text-center">{p.fixas}</td>
                              <td className="p-2 text-center">{p.extras}</td>
                              <td className={`p-2 text-center font-bold ${semSaldo ? 'text-red-600' : 'text-emerald-600'}`}>{total}/32</td>
                              <td className="p-2 text-center">{!semSaldo && p.h1 ? '✅' : '❌'}</td>
                              <td className="p-2 text-center">{!semSaldo && p.h3 ? '✅' : '❌'}</td>
                              <td className="p-2 text-center">{!semSaldo && p.h7 ? '✅' : '❌'}</td>
                              <td className="p-2 text-center">
                                {semSaldo
                                  ? <span className="text-red-600 text-xs font-bold">Sem saldo</span>
                                  : <span className="text-emerald-600 text-xs font-bold">Parcial</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Exemplo 2 */}
            {exemploAtivo === 1 && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <h3 className="font-bold text-amber-800 text-xl mb-1">⚠️ Situação</h3>
                  <p className="text-amber-700">Prof. <strong>João (História)</strong> já tem <strong>31 aulas fixas</strong> e fez <strong>1 substituição</strong> essa semana. Total: 32/32.</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <h3 className="font-bold text-red-800 mb-3">❌ O que acontece</h3>
                  <p className="text-red-700 mb-3">O sistema <strong>não mostra o Prof. João</strong> na lista de disponíveis, mesmo que ele esteja livre no horário.</p>
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-red-500 text-white rounded-lg px-3 py-1 text-sm font-bold">João</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div className="bg-red-500 h-3 rounded-full w-full"></div>
                      </div>
                      <span className="text-red-700 font-bold text-sm">32/32 ⚠️</span>
                    </div>
                    <p className="text-gray-500 text-sm">Limite atingido — não aparece nas opções de substituição</p>
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                  <h3 className="font-bold text-emerald-800 mb-2">✅ Solução</h3>
                  <p className="text-emerald-700">O coordenador deve escolher outro professor que ainda tenha saldo disponível. O sistema já filtra isso automaticamente.</p>
                </div>
              </div>
            )}

            {/* Exemplo 3 */}
            {exemploAtivo === 2 && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <h3 className="font-bold text-red-800 text-xl mb-1">🆘 Situação Crítica</h3>
                  <p className="text-red-700">Para a <strong>5ª aula de quarta-feira</strong>, <strong>todos</strong> os outros professores estão ocupados ou no limite.</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-800 mb-3">O que o sistema mostra</h3>
                  <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 text-center">
                    <div className="text-4xl mb-2">⚠️</div>
                    <p className="text-red-800 font-bold text-lg">Nenhum professor disponível</p>
                    <p className="text-red-700 text-sm">para este horário</p>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <h3 className="font-bold text-amber-800 mb-3">💡 O que fazer nesse caso</h3>
                  <ul className="space-y-2">
                    {[
                      'Verificar se algum professor pode sair mais cedo de outra aula',
                      'Unificar duas turmas (juntar 6ºA e 6ºB com um professor)',
                      'Acionar a coordenação pedagógica para cobrir o horário',
                      'Registrar como "janela" (aula sem professor — necessita de ação manual)',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-amber-700 text-sm">
                        <span className="text-amber-500 mt-0.5">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Exemplo 4 */}
            {exemploAtivo === 3 && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                  <h3 className="font-bold text-purple-800 text-xl mb-1">👥 Situação — Eletiva</h3>
                  <p className="text-purple-700">A disciplina <strong>Eletiva do 8º A</strong> tem <strong>2 professores simultâneos</strong>: Prof. Ana e Prof. Carlos. Prof. Ana faltou.</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h3 className="font-bold text-blue-800 mb-3">📋 Como fica na Grade</h3>
                  <div className="bg-purple-100 border-2 border-purple-300 rounded-xl p-4">
                    <div className="text-xs font-bold text-purple-600 mb-2">🎨 ELETIVA — 8º A — 3ª hora</div>
                    <div className="space-y-2">
                      <div className="bg-white rounded-lg p-2 border border-purple-200 flex items-center gap-2">
                        <span className="text-red-500">❌</span>
                        <span className="line-through text-gray-400">Prof. Ana</span>
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Faltou</span>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-purple-200 flex items-center gap-2">
                        <span className="text-green-500">✅</span>
                        <span className="text-gray-700">Prof. Carlos</span>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Presente</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                  <h3 className="font-bold text-emerald-800 mb-2">✅ O que o sistema faz</h3>
                  <p className="text-emerald-700">Busca a substituição apenas para o slot da <strong>Prof. Ana</strong>. O Prof. Carlos continua normalmente. O sistema encontra um terceiro professor para fazer par com Carlos nesta aula.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DÚVIDAS FREQUENTES ──────────────────────────────── */}
      {secaoAtiva === 'duvidas' && (
        <div className="space-y-4">
          {[
            {
              q: 'O sistema substitui o professor por alguém da mesma disciplina?',
              a: 'Não. O sistema não exige que o substituto seja da mesma disciplina. Qualquer professor disponível e com saldo pode substituir. A lógica é de cobertura de horário, não de especialidade — seguindo a política de substituição por pares da escola.'
            },
            {
              q: 'O que acontece se eu montar a grade errada?',
              a: 'Você pode editar a grade a qualquer momento. Clique no slot que deseja alterar na Grade Horária para remover ou trocar o professor. As substituições já confirmadas no histórico não são alteradas.'
            },
            {
              q: 'Posso usar o sistema em vários computadores ao mesmo tempo?',
              a: 'Sim! Use a função "Salvar Backup" (botão no rodapé) para gerar um arquivo .json. Envie esse arquivo pelo WhatsApp ou e-mail para seus colegas. Eles importam o arquivo no sistema deles usando "Compartilhar / Importar". O último a salvar tem a versão mais atual.'
            },
            {
              q: 'O que é o botão "Nova Semana"?',
              a: 'Ele zera apenas as "aulas extras" (de substituição) de todos os professores. As aulas fixas, a grade horária, o histórico e todos os cadastros são mantidos. Use todo início de semana letiva.'
            },
            {
              q: 'Como faço para configurar a disciplina Eletiva com 2 professores?',
              a: 'Vá em Configurações → Disciplinas → clique no botão "👤 Único Docente" ao lado da disciplina Eletiva para alternar para "👥 Múltiplos Docentes". Na grade, ao clicar em um slot de Eletiva, você poderá adicionar um segundo professor.'
            },
            {
              q: 'E se o professor tiver aulas em turmas diferentes no mesmo horário?',
              a: 'Isso não deveria acontecer! A grade horária não permite que o mesmo professor seja alocado em dois lugares ao mesmo tempo. Se isso ocorreu por erro, remova a aula incorreta na Grade Horária e realoque corretamente.'
            },
            {
              q: 'O sistema salva os dados automaticamente?',
              a: 'Sim! Todos os dados são salvos automaticamente no navegador (localStorage) a cada alteração. Mesmo se fechar o navegador, os dados continuam salvos. Para garantir, use "Salvar Backup" para ter uma cópia em arquivo.'
            },
            {
              q: 'Posso importar a planilha de novo sem perder os dados da grade?',
              a: 'Ao importar uma planilha, você escolhe se quer substituir tudo ou adicionar. Se substituir tudo, a grade é apagada. Se a planilha já foi importada e você só quer atualizar um professor, é melhor editar manualmente no card do professor em Configurações.'
            },
            {
              q: 'Como funciona o limite de 32 aulas? É por semana mesmo?',
              a: 'Sim, o limite é semanal. Cada semana começa com o professor tendo apenas suas aulas fixas contadas. Cada substituição que ele faz adiciona +1 aula ao seu saldo semanal. Ao clicar em "Nova Semana", as extras voltam a zero. O limite pode ser ajustado em Configurações → Horários.'
            },
            {
              q: 'O que fazer se dois professores foram cadastrados com nomes ligeiramente diferentes na planilha?',
              a: 'Exemplo: "Maria Silva" e "Maria Silva " (com espaço). O sistema os trataria como professores diferentes. Vá em Configurações → Professores, identifique os duplicados e exclua o incorreto. Ou corrija diretamente na planilha Excel e reimporte.'
            },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="p-5">
                <h3 className="font-bold text-gray-800 text-lg mb-3 flex items-start gap-3">
                  <span className="bg-indigo-100 text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {item.q}
                </h3>
                <p className="text-gray-600 pl-11">{item.a}</p>
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center">
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-bold text-xl mb-2">Ainda tem dúvidas?</h3>
            <p className="text-indigo-200">
              Navegue pelas outras seções desta ajuda: <strong>Visão Geral</strong>, <strong>Fluxo do Sistema</strong>,
              <strong> Regras</strong>, <strong>Passo a Passo</strong> e <strong>Exemplos Práticos</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ── USO OFFLINE / PWA ───────────────────────────────── */}
      {secaoAtiva === 'offline' && (
        <div className="space-y-6">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-4 mb-3">
              <div className="text-5xl">📲</div>
              <div>
                <h1 className="text-3xl font-bold">Uso Offline & Instalação</h1>
                <p className="text-blue-200 text-lg">O sistema funciona mesmo sem internet!</p>
              </div>
            </div>
            <p className="text-blue-100 text-sm max-w-3xl">
              O SubstDoc é um <strong>PWA (Progressive Web App)</strong> — isso significa que pode ser instalado
              como um aplicativo no seu computador, tablet ou celular e funcionar completamente offline,
              sem depender de internet.
            </p>
          </div>

          {/* O que é PWA */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              🤔 O que é um PWA?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {[
                { icon: '💻', title: 'Funciona como App', desc: 'Aparece no menu Iniciar (Windows) ou na área de trabalho como qualquer outro programa. Abre sem precisar do navegador.' },
                { icon: '📡', title: 'Funciona Offline', desc: 'Todos os dados ficam salvos no dispositivo. Sem internet? Tudo continua funcionando normalmente.' },
                { icon: '🔄', title: 'Sincroniza ao Conectar', desc: 'Quando a internet voltar, o indicador muda de laranja para verde. Use Salvar Backup para compartilhar.' },
              ].map(c => (
                <div key={c.title} className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                  <div className="text-4xl mb-3">{c.icon}</div>
                  <h3 className="font-bold text-blue-800 mb-2">{c.title}</h3>
                  <p className="text-blue-700 text-sm">{c.desc}</p>
                </div>
              ))}
            </div>

            {/* Indicadores */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3">📊 Indicadores de Status (canto superior do sistema)</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-700 border border-green-500/30 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                    Online
                  </div>
                  <p className="text-gray-600 text-sm">Conectado à internet — tudo funcionando normalmente</p>
                </div>
                <div className="flex items-center gap-4 bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 text-orange-700 border border-orange-500/30 rounded-full text-sm font-medium animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
                    Offline
                  </div>
                  <p className="text-gray-600 text-sm">Sem internet — sistema funcionando localmente, dados salvos no dispositivo</p>
                </div>
                <div className="flex items-center gap-4 bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-700 border border-purple-500/30 rounded-full text-sm font-medium">
                    ✓ App
                  </div>
                  <p className="text-gray-600 text-sm">Sistema instalado como PWA no dispositivo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Como instalar */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              🔧 Como Instalar no seu Dispositivo
            </h2>

            <div className="space-y-6">

              {/* Windows/Chrome */}
              <div className="border border-blue-200 rounded-xl overflow-hidden">
                <div className="bg-blue-600 text-white p-4 flex items-center gap-3">
                  <span className="text-2xl">🖥️</span>
                  <div>
                    <div className="font-bold">Windows — Google Chrome ou Edge</div>
                    <div className="text-blue-200 text-sm">Método mais comum para computadores</div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { n: 1, txt: 'Abra o sistema no navegador Chrome ou Edge (acesse o link do Vercel/GitHub Pages)' },
                    { n: 2, txt: 'Aguarde alguns segundos — um botão 📲 "Instalar" aparece no canto superior direito do sistema' },
                    { n: 3, txt: 'Clique em 📲 Instalar. Uma janela de confirmação aparecerá.' },
                    { n: 4, txt: 'Clique em "Instalar" na janela de confirmação.' },
                    { n: 5, txt: 'Pronto! O sistema abre como um app separado. Um ícone é criado no menu Iniciar e na área de trabalho.' },
                  ].map(p => (
                    <div key={p.n} className="flex items-start gap-3">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm flex-shrink-0">{p.n}</span>
                      <p className="text-gray-700 text-sm pt-1">{p.txt}</p>
                    </div>
                  ))}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <p className="text-blue-700 text-sm">
                      <strong>Alternativa:</strong> No Chrome, clique nos 3 pontinhos (⋮) no canto superior direito do navegador → "Salvar e compartilhar" → "Criar atalho" → marque "Abrir como janela" → Criar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Android */}
              <div className="border border-green-200 rounded-xl overflow-hidden">
                <div className="bg-green-600 text-white p-4 flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <div className="font-bold">Android — Chrome</div>
                    <div className="text-green-200 text-sm">Para tablets e celulares Android</div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { n: 1, txt: 'Abra o Chrome no Android e acesse o link do sistema' },
                    { n: 2, txt: 'Toque nos 3 pontinhos (⋮) no canto superior direito' },
                    { n: 3, txt: 'Toque em "Adicionar à tela inicial" ou "Instalar app"' },
                    { n: 4, txt: 'Confirme tocando em "Adicionar" ou "Instalar"' },
                    { n: 5, txt: 'Um ícone do SubstDoc aparece na tela inicial. Pronto!' },
                  ].map(p => (
                    <div key={p.n} className="flex items-start gap-3">
                      <span className="bg-green-100 text-green-700 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm flex-shrink-0">{p.n}</span>
                      <p className="text-gray-700 text-sm pt-1">{p.txt}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* iPhone/iPad */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-800 text-white p-4 flex items-center gap-3">
                  <span className="text-2xl">🍎</span>
                  <div>
                    <div className="font-bold">iPhone / iPad — Safari</div>
                    <div className="text-gray-300 text-sm">Use o Safari (não o Chrome) no iOS</div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { n: 1, txt: 'Abra o Safari (não Chrome) no iPhone/iPad e acesse o link do sistema' },
                    { n: 2, txt: 'Toque no ícone de compartilhar (caixa com seta para cima ↑) na barra inferior' },
                    { n: 3, txt: 'Role para baixo e toque em "Adicionar à Tela de Início"' },
                    { n: 4, txt: 'Digite um nome (ex: SubstDoc) e toque em "Adicionar"' },
                    { n: 5, txt: 'O ícone aparece na tela inicial. Abra por lá para funcionar como app.' },
                  ].map(p => (
                    <div key={p.n} className="flex items-start gap-3">
                      <span className="bg-gray-100 text-gray-700 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm flex-shrink-0">{p.n}</span>
                      <p className="text-gray-700 text-sm pt-1">{p.txt}</p>
                    </div>
                  ))}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-amber-700 text-sm">
                      ⚠️ No iPhone, use sempre o <strong>Safari</strong> para instalar. O Chrome no iOS não suporta instalação de PWA.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compartilhamento */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              🔄 Compartilhando com Outros Computadores
            </h2>
            <p className="text-gray-600 mb-6">
              Como o sistema não usa um servidor central, o compartilhamento é feito por <strong>arquivo</strong>.
              É simples e seguro — os dados ficam só com vocês.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                <h3 className="font-bold text-emerald-800 text-lg mb-4 flex items-center gap-2">
                  📤 Para Enviar (exportar)
                </h3>
                <div className="space-y-3">
                  {[
                    'Clique em "💾 Salvar Backup" no rodapé do sistema',
                    'Um arquivo .json é baixado (ex: substituicao-docente-15-01-2025.json)',
                    'Envie esse arquivo por WhatsApp, e-mail ou coloque no Google Drive',
                    'Seus colegas recebem e importam no sistema deles',
                  ].map((p, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i+1}</span>
                      <p className="text-emerald-700 text-sm">{p}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-blue-800 text-lg mb-4 flex items-center gap-2">
                  📥 Para Receber (importar)
                </h3>
                <div className="space-y-3">
                  {[
                    'Clique em "🔄 Compartilhar / Importar" no rodapé',
                    'Selecione a aba "📥 Importar / Carregar"',
                    'Clique em "Selecionar arquivo" e escolha o .json recebido',
                    'Verifique a prévia e clique em "Confirmar Importação"',
                  ].map((p, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i+1}</span>
                      <p className="text-blue-700 text-sm">{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="font-bold text-amber-800 mb-2">💡 Dica: Fluxo de trabalho recomendado</h3>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {[
                  { label: 'Coordenação faz alterações', cor: 'bg-blue-100 text-blue-800' },
                  { label: '→', cor: 'text-gray-400 font-bold text-lg bg-transparent' },
                  { label: 'Salva Backup', cor: 'bg-emerald-100 text-emerald-800' },
                  { label: '→', cor: 'text-gray-400 font-bold text-lg bg-transparent' },
                  { label: 'Envia por WhatsApp/Drive', cor: 'bg-amber-100 text-amber-800' },
                  { label: '→', cor: 'text-gray-400 font-bold text-lg bg-transparent' },
                  { label: 'Colega importa', cor: 'bg-purple-100 text-purple-800' },
                  { label: '→', cor: 'text-gray-400 font-bold text-lg bg-transparent' },
                  { label: 'Todos sincronizados ✅', cor: 'bg-green-100 text-green-800' },
                ].map((s, i) => (
                  s.label === '→'
                    ? <span key={i} className="text-gray-400 font-bold text-xl">→</span>
                    : <span key={i} className={`${s.cor} px-3 py-1.5 rounded-lg font-medium`}>{s.label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Comparativo */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Com Internet vs. Sem Internet</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left text-gray-700">Funcionalidade</th>
                    <th className="p-3 text-center text-green-700">🌐 Com Internet</th>
                    <th className="p-3 text-center text-orange-700">📡 Sem Internet</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Usar o sistema normalmente', '✅', '✅'],
                    ['Ver grade horária', '✅', '✅'],
                    ['Registrar substituições', '✅', '✅'],
                    ['Consultar histórico', '✅', '✅'],
                    ['Salvar dados localmente', '✅', '✅'],
                    ['Exportar backup (.json)', '✅', '✅'],
                    ['Importar arquivo de colega', '✅', '✅'],
                    ['Acessar pelo link do Vercel', '✅', '❌ (precisa estar instalado)'],
                    ['Receber atualizações do sistema', '✅', '❌ (atualiza ao reconectar)'],
                  ].map(([func, com, sem], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 text-gray-700">{func}</td>
                      <td className="p-3 text-center">{com}</td>
                      <td className="p-3 text-center">{sem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-indigo-700 text-sm">
                <strong>💡 Conclusão:</strong> Para uso offline, instale o sistema como PWA (veja instruções acima).
                Uma vez instalado, funciona completamente sem internet. Para usar em outro computador sem instalação,
                é necessário acesso à internet para carregar o sistema pelo Vercel.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
