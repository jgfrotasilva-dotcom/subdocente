import { useState, useEffect } from 'react';

interface Props {
  onClose: () => void;
  onConectado?: () => void;
}

type Passo = 'intro' | 'passo1' | 'passo2' | 'passo3' | 'passo4' | 'passo5' | 'conectar' | 'sucesso';

const SQL_SCRIPT = `-- 1. Criar a tabela principal
CREATE TABLE IF NOT EXISTS escola_dados (
  id TEXT PRIMARY KEY,
  dados JSONB NOT NULL DEFAULT '{}',
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ativar segurança por linha
ALTER TABLE escola_dados ENABLE ROW LEVEL SECURITY;

-- 3. Permitir acesso público (leitura e escrita)
CREATE POLICY "acesso_publico" ON escola_dados
  FOR ALL USING (true) WITH CHECK (true);

-- 4. Inserir o registro inicial
INSERT INTO escola_dados (id, dados)
VALUES ('escola_principal', '{}')
ON CONFLICT (id) DO NOTHING;`;

// Componente de "print simulado" de tela
function TelaMock({ children, titulo, cor = 'blue' }: { children: React.ReactNode; titulo: string; cor?: string }) {
  const cores: Record<string, string> = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    slate: 'bg-slate-700',
  };
  return (
    <div className="border-2 border-slate-300 rounded-xl overflow-hidden shadow-md">
      <div className={`${cores[cor] ?? cores.blue} px-4 py-2 flex items-center gap-2`}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <span className="text-white text-xs font-medium ml-1">{titulo}</span>
      </div>
      <div className="bg-slate-50 p-4">{children}</div>
    </div>
  );
}

// Seta indicadora
function Seta({ texto }: { texto: string }) {
  return (
    <div className="flex items-center gap-2 my-2">
      <div className="text-red-500 text-xl font-bold">👆</div>
      <div className="bg-red-100 border border-red-300 rounded-lg px-3 py-1.5 text-red-700 text-xs font-semibold">
        {texto}
      </div>
    </div>
  );
}

// Caixa de dica
function Dica({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex gap-2">
      <span className="text-xl shrink-0">💡</span>
      <p className="text-yellow-800 text-sm">{children}</p>
    </div>
  );
}

// Caixa de aviso
function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex gap-2">
      <span className="text-xl shrink-0">⚠️</span>
      <p className="text-red-700 text-sm">{children}</p>
    </div>
  );
}

// Passo numerado
function PassoItem({ num, titulo, children }: { num: number; titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5">
        {num}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-800 text-sm mb-1">{titulo}</p>
        <div className="text-slate-600 text-sm">{children}</div>
      </div>
    </div>
  );
}

export default function SupabaseConfigModal({ onClose, onConectado }: Props) {
  const [passo, setPasso] = useState<Passo>('intro');
  const [url, setUrl] = useState('');
  const [chave, setChave] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [testando, setTestando] = useState(false);
  const [erroTeste, setErroTeste] = useState('');

  useEffect(() => {
    const urlSalva = localStorage.getItem('sb_url') ?? '';
    const chaveSalva = localStorage.getItem('sb_key') ?? '';
    if (urlSalva) setUrl(urlSalva);
    if (chaveSalva) setChave(chaveSalva);
    if (urlSalva && chaveSalva) setPasso('conectar');
  }, []);

  const copiarSQL = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const testarConexao = async () => {
    if (!url.trim() || !chave.trim()) {
      setErroTeste('Preencha a URL e a Chave antes de testar.');
      return;
    }
    setTestando(true);
    setErroTeste('');
    try {
      const resp = await fetch(
        `${url.trim()}/rest/v1/escola_dados?id=eq.escola_principal&select=id`,
        {
          headers: {
            apikey: chave.trim(),
            Authorization: `Bearer ${chave.trim()}`,
          },
        }
      );
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Erro ${resp.status}: ${txt}`);
      }
      localStorage.setItem('sb_url', url.trim());
      localStorage.setItem('sb_key', chave.trim());
      setPasso('sucesso');
      onConectado?.();
    } catch (err) {
      setErroTeste(err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setTestando(false);
    }
  };

  const totalPassos = 5;
  const passoAtual: Record<Passo, number> = {
    intro: 0, passo1: 1, passo2: 2, passo3: 3, passo4: 4, passo5: 5, conectar: 6, sucesso: 7,
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto border border-slate-200 flex flex-col">

        {/* Header fixo */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl">☁️</div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Configurar Banco de Dados</h2>
              <p className="text-xs text-slate-500">Guia passo a passo — Supabase</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-xl">×</button>
        </div>

        {/* Barra de progresso geral */}
        {passo !== 'intro' && passo !== 'sucesso' && (
          <div className="px-5 py-2 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-medium">Progresso</span>
              <span className="text-xs text-blue-600 font-semibold">{passoAtual[passo]} de {totalPassos}</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${(passoAtual[passo] / totalPassos) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="p-5 flex-1 space-y-5">

          {/* ══════════════════════════════════════════════
              INTRO
          ══════════════════════════════════════════════ */}
          {passo === 'intro' && (
            <div className="space-y-5">
              <div className="text-center py-4">
                <div className="text-6xl mb-3">☁️</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Banco de Dados na Nuvem</h3>
                <p className="text-slate-500 text-sm">
                  Vamos conectar o sistema ao <strong>Supabase</strong> — um banco de dados gratuito que guarda seus dados na internet.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                <p className="text-blue-800 font-semibold text-sm">🎯 Para que serve?</p>
                <div className="space-y-2">
                  {[
                    ['☁️', 'Seus dados ficam salvos na internet — não só no seu computador'],
                    ['🔄', 'Se trocar de computador, os dados continuam lá'],
                    ['👥', 'Outros responsáveis da escola acessam os mesmos dados'],
                    ['📴', 'Se a internet cair, continua funcionando normalmente'],
                    ['🆓', 'Completamente gratuito para o tamanho da sua escola'],
                  ].map(([icon, txt]) => (
                    <div key={txt} className="flex items-start gap-2">
                      <span className="text-sm shrink-0">{icon}</span>
                      <span className="text-blue-700 text-sm">{txt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-slate-700 font-semibold text-sm mb-3">📋 O que vamos fazer:</p>
                <div className="space-y-2">
                  {[
                    ['1', 'Criar uma conta gratuita no Supabase'],
                    ['2', 'Criar um projeto (como se fosse uma pasta)'],
                    ['3', 'Criar a tabela (onde os dados ficam guardados)'],
                    ['4', 'Copiar as chaves de acesso'],
                    ['5', 'Colar as chaves aqui no sistema'],
                  ].map(([num, txt]) => (
                    <div key={num} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">{num}</div>
                      <span className="text-slate-600 text-sm">{txt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Dica>Tempo estimado: <strong>10 a 15 minutos</strong>. Se já tem conta no Supabase, muito menos!</Dica>

              <button
                onClick={() => setPasso('passo1')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Vamos começar! →
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              PASSO 1 — CRIAR CONTA
          ══════════════════════════════════════════════ */}
          {passo === 'passo1' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">1</div>
                <div>
                  <h3 className="font-bold text-slate-800">Criar conta no Supabase</h3>
                  <p className="text-slate-500 text-xs">Rápido e gratuito</p>
                </div>
              </div>

              <div className="space-y-4">
                <PassoItem num={1} titulo='Abra o site do Supabase'>
                  <p>Abra uma nova aba no navegador e acesse:</p>
                  <a href="https://supabase.com" target="_blank" rel="noreferrer"
                    className="inline-block mt-1 bg-blue-100 text-blue-700 font-mono text-xs px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-200 transition-colors">
                    🔗 https://supabase.com
                  </a>
                </PassoItem>

                <PassoItem num={2} titulo='Clique em "Start your project"'>
                  <TelaMock titulo="supabase.com" cor="emerald">
                    <div className="space-y-3">
                      <div className="bg-emerald-600 text-white text-xs px-4 py-2 rounded-lg text-center font-semibold w-fit mx-auto">
                        Start your project
                      </div>
                    </div>
                  </TelaMock>
                  <Seta texto="Clique neste botão verde" />
                </PassoItem>

                <PassoItem num={3} titulo='Escolha como se cadastrar'>
                  <TelaMock titulo="supabase.com — Criar conta">
                    <div className="space-y-2">
                      <div className="border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2">
                        <span>🐙</span> Continue with GitHub
                      </div>
                      <div className="text-center text-slate-400 text-xs">— ou —</div>
                      <div className="border border-slate-300 rounded-lg px-4 py-2 space-y-2">
                        <input className="w-full border border-slate-200 rounded px-2 py-1 text-xs" placeholder="seu@email.com" readOnly />
                        <input className="w-full border border-slate-200 rounded px-2 py-1 text-xs" placeholder="senha" type="password" readOnly />
                        <div className="bg-slate-800 text-white text-xs px-4 py-1.5 rounded text-center">Sign Up</div>
                      </div>
                    </div>
                  </TelaMock>
                  <Dica>Recomendo usar o <strong>GitHub</strong> se já tiver conta — é mais rápido. Senão, use e-mail e senha normais.</Dica>
                </PassoItem>

                <PassoItem num={4} titulo='Confirme o e-mail (se usar e-mail/senha)'>
                  <p>O Supabase vai enviar um e-mail de confirmação. Abra o e-mail e clique no link de confirmação.</p>
                  <Dica>Verifique a caixa de spam se não aparecer na caixa de entrada.</Dica>
                </PassoItem>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setPasso('intro')} className="flex-1 border border-slate-300 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50">← Voltar</button>
                <button onClick={() => setPasso('passo2')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl">Próximo →</button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              PASSO 2 — CRIAR PROJETO
          ══════════════════════════════════════════════ */}
          {passo === 'passo2' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">2</div>
                <div>
                  <h3 className="font-bold text-slate-800">Criar um novo projeto</h3>
                  <p className="text-slate-500 text-xs">O "projeto" é onde seus dados ficam guardados</p>
                </div>
              </div>

              <div className="space-y-4">
                <PassoItem num={1} titulo='Clique em "New project"'>
                  <TelaMock titulo="Supabase — Dashboard" cor="emerald">
                    <div className="space-y-2">
                      <p className="text-slate-500 text-xs">All projects</p>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 flex items-center gap-2 text-slate-500 text-xs">
                        <span className="text-lg">＋</span>
                        <span className="font-medium">New project</span>
                      </div>
                    </div>
                  </TelaMock>
                  <Seta texto='Clique em "New project"' />
                </PassoItem>

                <PassoItem num={2} titulo='Preencha os dados do projeto'>
                  <TelaMock titulo="Supabase — Novo Projeto">
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-slate-500 mb-1 font-medium">Name</p>
                        <div className="border border-blue-400 rounded px-2 py-1.5 bg-white font-mono text-blue-700">substituicao-docente</div>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1 font-medium">Database Password</p>
                        <div className="border border-slate-300 rounded px-2 py-1.5 bg-white text-slate-400">••••••••••••</div>
                        <p className="text-red-500 text-xs mt-1">⚠️ Guarde essa senha! Você vai precisar depois.</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1 font-medium">Region</p>
                        <div className="border border-emerald-400 rounded px-2 py-1.5 bg-white text-emerald-700 font-medium">🇧🇷 South America (São Paulo)</div>
                      </div>
                    </div>
                  </TelaMock>
                  <div className="space-y-2 mt-2">
                    <Seta texto='No campo "Name": digite substituicao-docente' />
                    <div className="flex items-center gap-2">
                      <div className="text-red-500 text-xl font-bold">👆</div>
                      <div className="bg-red-100 border border-red-300 rounded-lg px-3 py-1.5 text-red-700 text-xs font-semibold">
                        Em "Region": escolha South America (São Paulo)
                      </div>
                    </div>
                  </div>
                </PassoItem>

                <PassoItem num={3} titulo='Clique em "Create new project"'>
                  <TelaMock titulo="Supabase — Confirmar">
                    <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 rounded-lg text-center font-semibold">
                      Create new project
                    </div>
                  </TelaMock>
                  <Seta texto='Clique no botão verde "Create new project"' />
                </PassoItem>

                <PassoItem num={4} titulo='Aguarde o projeto ser criado'>
                  <TelaMock titulo="Supabase — Criando projeto...">
                    <div className="text-center py-3">
                      <div className="text-3xl mb-2">⏳</div>
                      <p className="text-slate-500 text-xs">Setting up your project...</p>
                      <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-2/3 animate-pulse" />
                      </div>
                    </div>
                  </TelaMock>
                  <Dica>Aguarde <strong>1 a 2 minutos</strong>. Quando terminar, você verá o painel do projeto.</Dica>
                </PassoItem>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setPasso('passo1')} className="flex-1 border border-slate-300 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50">← Voltar</button>
                <button onClick={() => setPasso('passo3')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl">Próximo →</button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              PASSO 3 — SQL EDITOR
          ══════════════════════════════════════════════ */}
          {passo === 'passo3' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">3</div>
                <div>
                  <h3 className="font-bold text-slate-800">Criar a tabela de dados</h3>
                  <p className="text-slate-500 text-xs">Vamos "dizer" ao banco como guardar as informações</p>
                </div>
              </div>

              <div className="space-y-4">
                <PassoItem num={1} titulo='Abra o "SQL Editor" no menu lateral'>
                  <TelaMock titulo="Supabase — Painel do Projeto" cor="slate">
                    <div className="flex gap-3">
                      <div className="space-y-1 w-28">
                        <div className="bg-slate-200 rounded px-2 py-1.5 text-slate-500 text-xs">🏠 Home</div>
                        <div className="bg-slate-200 rounded px-2 py-1.5 text-slate-500 text-xs">📋 Table Editor</div>
                        <div className="bg-blue-600 rounded px-2 py-1.5 text-white text-xs font-bold ring-2 ring-blue-300">
                          &lt;/&gt; SQL Editor
                        </div>
                        <div className="bg-slate-200 rounded px-2 py-1.5 text-slate-500 text-xs">🔐 Auth</div>
                        <div className="bg-slate-200 rounded px-2 py-1.5 text-slate-500 text-xs">⚙️ Settings</div>
                      </div>
                      <div className="flex-1 bg-white rounded border border-slate-200 p-2">
                        <p className="text-slate-400 text-xs text-center mt-4">SQL Editor</p>
                      </div>
                    </div>
                  </TelaMock>
                  <Seta texto='No menu da ESQUERDA, clique em "SQL Editor"' />
                </PassoItem>

                <PassoItem num={2} titulo='Clique em "New query"'>
                  <TelaMock titulo="Supabase — SQL Editor">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="bg-slate-900 text-emerald-400 rounded px-3 py-1.5 text-xs font-medium flex items-center gap-1">
                          ＋ New query
                        </div>
                      </div>
                      <div className="bg-slate-900 rounded h-12 flex items-center justify-center">
                        <span className="text-slate-500 text-xs">Editor de SQL</span>
                      </div>
                    </div>
                  </TelaMock>
                  <Seta texto='Clique em "+ New query"' />
                </PassoItem>

                <PassoItem num={3} titulo='Copie o código abaixo e cole no editor'>
                  <div className="bg-slate-900 rounded-xl p-3 font-mono text-xs text-emerald-400 relative max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap leading-relaxed">{SQL_SCRIPT}</pre>
                    <button
                      onClick={copiarSQL}
                      className={`sticky bottom-1 left-full translate-x-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${copiado ? 'bg-emerald-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
                    >
                      {copiado ? '✅ Copiado!' : '📋 Copiar código'}
                    </button>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-2">
                      <span className="text-blue-500 text-sm">1.</span>
                      <p className="text-blue-700 text-xs">Clique em <strong>"📋 Copiar código"</strong> acima</p>
                    </div>
                    <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-2">
                      <span className="text-blue-500 text-sm">2.</span>
                      <p className="text-blue-700 text-xs">Clique dentro do editor do SQL Editor no Supabase</p>
                    </div>
                    <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-2">
                      <span className="text-blue-500 text-sm">3.</span>
                      <p className="text-blue-700 text-xs">Pressione <kbd className="bg-slate-200 px-1 rounded">Ctrl+A</kbd> para selecionar tudo, depois <kbd className="bg-slate-200 px-1 rounded">Ctrl+V</kbd> para colar</p>
                    </div>
                  </div>
                </PassoItem>

                <PassoItem num={4} titulo='Clique em "Run" para executar'>
                  <TelaMock titulo="Supabase — SQL Editor">
                    <div className="space-y-2">
                      <div className="bg-slate-900 rounded p-2 h-16 flex items-center">
                        <span className="text-emerald-400 font-mono text-xs">-- código colado aqui...</span>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-emerald-600 text-white text-xs px-4 py-1.5 rounded-lg font-bold flex items-center gap-1 ring-2 ring-emerald-300">
                          ▶ Run
                        </div>
                      </div>
                    </div>
                  </TelaMock>
                  <Seta texto='Clique no botão verde "Run" (ou pressione Ctrl+Enter)' />
                </PassoItem>

                <PassoItem num={5} titulo='Verifique se deu certo'>
                  <TelaMock titulo="Supabase — Resultado">
                    <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-center">
                      <span className="text-emerald-700 text-xs font-semibold">✅ Success. No rows returned</span>
                    </div>
                  </TelaMock>
                  <Dica>Se aparecer <strong>"Success"</strong>, deu certo! Se aparecer uma mensagem em vermelho, volte ao passo 3 e verifique se copiou o código completo.</Dica>
                </PassoItem>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setPasso('passo2')} className="flex-1 border border-slate-300 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50">← Voltar</button>
                <button onClick={() => setPasso('passo4')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl">Próximo →</button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              PASSO 4 — PEGAR CREDENCIAIS
          ══════════════════════════════════════════════ */}
          {passo === 'passo4' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">4</div>
                <div>
                  <h3 className="font-bold text-slate-800">Pegar as chaves de acesso</h3>
                  <p className="text-slate-500 text-xs">Precisamos de 2 informações do Supabase</p>
                </div>
              </div>

              <div className="space-y-4">
                <PassoItem num={1} titulo='Vá em "Project Settings"'>
                  <TelaMock titulo="Supabase — Painel do Projeto" cor="slate">
                    <div className="flex gap-3">
                      <div className="space-y-1 w-28">
                        <div className="bg-slate-200 rounded px-2 py-1.5 text-slate-500 text-xs">🏠 Home</div>
                        <div className="bg-slate-200 rounded px-2 py-1.5 text-slate-500 text-xs">📋 Table Editor</div>
                        <div className="bg-slate-200 rounded px-2 py-1.5 text-slate-500 text-xs">&lt;/&gt; SQL Editor</div>
                        <div className="bg-slate-200 rounded px-2 py-1.5 text-slate-500 text-xs">🔐 Auth</div>
                        <div className="mt-2 border-t border-slate-300 pt-1">
                          <div className="bg-blue-600 rounded px-2 py-1.5 text-white text-xs font-bold ring-2 ring-blue-300">
                            ⚙️ Project Settings
                          </div>
                        </div>
                      </div>
                    </div>
                  </TelaMock>
                  <Seta texto='No menu da ESQUERDA, clique em "Project Settings" (ícone de engrenagem ⚙️ geralmente no final do menu)' />
                </PassoItem>

                <PassoItem num={2} titulo='Clique em "API"'>
                  <TelaMock titulo="Supabase — Project Settings">
                    <div className="flex gap-2">
                      <div className="space-y-1">
                        <div className="bg-slate-200 rounded px-3 py-1.5 text-slate-500 text-xs">General</div>
                        <div className="bg-blue-600 rounded px-3 py-1.5 text-white text-xs font-bold ring-2 ring-blue-300">API</div>
                        <div className="bg-slate-200 rounded px-3 py-1.5 text-slate-500 text-xs">Database</div>
                        <div className="bg-slate-200 rounded px-3 py-1.5 text-slate-500 text-xs">Auth</div>
                      </div>
                    </div>
                  </TelaMock>
                  <Seta texto='No submenu, clique em "API"' />
                </PassoItem>

                <PassoItem num={3} titulo='Copie a "Project URL"'>
                  <TelaMock titulo="Supabase — API Settings">
                    <div className="space-y-2">
                      <div className="border border-slate-200 rounded-lg p-2 bg-white">
                        <p className="text-xs font-bold text-slate-500 mb-1">Project URL</p>
                        <div className="bg-slate-100 rounded px-2 py-1.5 font-mono text-xs text-blue-600 flex items-center justify-between">
                          <span>https://abcxyz123.supabase.co</span>
                          <div className="bg-slate-300 rounded px-2 py-0.5 text-slate-600 text-xs ml-2">Copy</div>
                        </div>
                      </div>
                    </div>
                  </TelaMock>
                  <Seta texto='Clique em "Copy" ao lado da URL e guarde em um bloco de notas' />
                </PassoItem>

                <PassoItem num={4} titulo='Copie a chave "anon / public"'>
                  <TelaMock titulo="Supabase — API Keys">
                    <div className="space-y-2">
                      <div className="border-2 border-emerald-400 rounded-lg p-2 bg-white">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-emerald-700">anon</p>
                          <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">public</span>
                        </div>
                        <div className="bg-slate-100 rounded px-2 py-1.5 font-mono text-xs text-slate-600 flex items-center justify-between">
                          <span>eyJhbGciOiJIUzI1...</span>
                          <div className="bg-slate-300 rounded px-2 py-0.5 text-slate-600 text-xs ml-2">Copy</div>
                        </div>
                      </div>
                      <Aviso>NÃO copie a "service_role" — use APENAS a "anon / public"!</Aviso>
                    </div>
                  </TelaMock>
                  <Seta texto='Clique em "Copy" ao lado da chave anon/public e guarde junto com a URL' />
                </PassoItem>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-blue-800 text-sm font-semibold mb-1">📝 Agora você deve ter em mãos:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">1</div>
                    <span className="text-blue-700 font-mono text-xs">https://xxxxxxxxxx.supabase.co</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">2</div>
                    <span className="text-blue-700 font-mono text-xs">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setPasso('passo3')} className="flex-1 border border-slate-300 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50">← Voltar</button>
                <button onClick={() => setPasso('passo5')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl">Próximo →</button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              PASSO 5 — VERCEL
          ══════════════════════════════════════════════ */}
          {passo === 'passo5' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">5</div>
                <div>
                  <h3 className="font-bold text-slate-800">Configurar na Vercel</h3>
                  <p className="text-slate-500 text-xs">Para funcionar para todos os usuários do sistema</p>
                </div>
              </div>

              <Dica>Este passo é para que <strong>qualquer pessoa</strong> que abrir o link do sistema já conecte automaticamente ao banco. Se for só você usando, pode pular para o próximo passo.</Dica>

              <div className="space-y-4">
                <PassoItem num={1} titulo='Acesse seu projeto na Vercel'>
                  <a href="https://vercel.com" target="_blank" rel="noreferrer"
                    className="inline-block mt-1 bg-slate-100 text-slate-700 font-mono text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200">
                    🔗 https://vercel.com
                  </a>
                </PassoItem>

                <PassoItem num={2} titulo='Vá em Settings do projeto'>
                  <TelaMock titulo="Vercel — Seu Projeto" cor="slate">
                    <div className="flex gap-2 border-b border-slate-200 pb-2 mb-2">
                      {['Overview', 'Deployments', 'Analytics'].map(t => (
                        <div key={t} className="text-xs text-slate-400 px-2">{t}</div>
                      ))}
                      <div className="text-xs text-slate-900 font-bold px-2 border-b-2 border-slate-900">Settings</div>
                    </div>
                  </TelaMock>
                  <Seta texto='Clique na aba "Settings"' />
                </PassoItem>

                <PassoItem num={3} titulo='Clique em "Environment Variables"'>
                  <TelaMock titulo="Vercel — Settings" cor="slate">
                    <div className="space-y-1">
                      {['General', 'Domains', 'Integrations'].map(t => (
                        <div key={t} className="text-xs text-slate-400 px-2 py-1">{t}</div>
                      ))}
                      <div className="bg-slate-800 text-white text-xs px-2 py-1.5 rounded font-bold">Environment Variables</div>
                    </div>
                  </TelaMock>
                  <Seta texto='No menu lateral, clique em "Environment Variables"' />
                </PassoItem>

                <PassoItem num={4} titulo='Adicione as duas variáveis'>
                  <div className="space-y-2">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-semibold text-slate-600 mb-2">Variável 1:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-slate-400 mb-1">Name</p>
                          <div className="bg-white border border-slate-300 rounded px-2 py-1 font-mono text-blue-600">VITE_SUPABASE_URL</div>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-1">Value</p>
                          <div className="bg-white border border-slate-300 rounded px-2 py-1 font-mono text-slate-500">https://xxx.supabase.co</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-semibold text-slate-600 mb-2">Variável 2:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-slate-400 mb-1">Name</p>
                          <div className="bg-white border border-slate-300 rounded px-2 py-1 font-mono text-blue-600">VITE_SUPABASE_ANON_KEY</div>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-1">Value</p>
                          <div className="bg-white border border-slate-300 rounded px-2 py-1 font-mono text-slate-500">eyJhbGci...</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Dica>Copie os nomes <strong>exatamente</strong> como estão (com VITE_ na frente) — maiúsculas e underscore incluídos!</Dica>
                </PassoItem>

                <PassoItem num={5} titulo='Salve e faça o redeploy'>
                  <div className="space-y-2">
                    <TelaMock titulo="Vercel — Salvar">
                      <div className="bg-slate-900 text-white text-xs px-4 py-2 rounded text-center font-semibold">Save</div>
                    </TelaMock>
                    <p className="text-slate-500 text-sm">Depois vá em <strong>Deployments</strong>, clique nos <strong>três pontinhos (...)</strong> do último deploy e clique em <strong>"Redeploy"</strong>.</p>
                  </div>
                </PassoItem>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setPasso('passo4')} className="flex-1 border border-slate-300 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50">← Voltar</button>
                <button onClick={() => setPasso('conectar')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl">Próximo →</button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              CONECTAR — COLAR CREDENCIAIS
          ══════════════════════════════════════════════ */}
          {passo === 'conectar' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">🔑</div>
                <div>
                  <h3 className="font-bold text-slate-800">Cole as credenciais aqui</h3>
                  <p className="text-slate-500 text-xs">Último passo! Cole o que você copiou do Supabase</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-700 text-sm">
                  Cole abaixo as duas informações que você copiou do Supabase no <strong>Passo 4</strong>.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    1️⃣ &nbsp;Project URL
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://abcdefghijklm.supabase.co"
                    className="w-full border-2 border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-slate-400 mt-1">Começa com <strong>https://</strong> e termina com <strong>.supabase.co</strong></p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    2️⃣ &nbsp;anon / public key
                  </label>
                  <textarea
                    value={chave}
                    onChange={e => setChave(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    rows={3}
                    className="w-full border-2 border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none transition-colors resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">Chave longa que começa com <strong>"eyJ"</strong></p>
                </div>
              </div>

              {erroTeste && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 font-semibold text-sm mb-2">❌ Erro ao conectar</p>
                  <p className="text-red-600 text-xs font-mono break-all bg-red-100 rounded p-2">{erroTeste}</p>
                  <div className="mt-3 text-xs text-red-600 space-y-1">
                    <p className="font-semibold">Verifique:</p>
                    <p>✗ A URL tem espaço antes ou depois?</p>
                    <p>✗ A chave é a <strong>anon/public</strong> (não service_role)?</p>
                    <p>✗ O SQL foi executado com sucesso (Passo 3)?</p>
                    <p>✗ O projeto do Supabase está ativo?</p>
                  </div>
                </div>
              )}

              <button
                onClick={testarConexao}
                disabled={testando || !url.trim() || !chave.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {testando ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Testando conexão...
                  </>
                ) : (
                  '☁️ Testar e Conectar'
                )}
              </button>

              <button onClick={() => setPasso('passo5')} className="w-full border border-slate-300 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50">
                ← Voltar
              </button>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-slate-500 text-xs">🔒 Suas credenciais ficam salvas <strong>apenas no seu navegador</strong>. Não são enviadas para nenhum outro lugar.</p>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              SUCESSO
          ══════════════════════════════════════════════ */}
          {passo === 'sucesso' && (
            <div className="space-y-6 text-center">
              <div className="py-4">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-5xl mb-4">
                  🎉
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Tudo pronto!</h3>
                <p className="text-slate-500 text-sm">
                  O sistema está conectado ao Supabase com sucesso!
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left space-y-2">
                <p className="text-emerald-700 font-semibold text-sm">✅ O que acontece agora:</p>
                {[
                  ['☁️', 'Seus dados são salvos na nuvem automaticamente'],
                  ['🔄', 'Sincroniza após cada alteração (aprox. 2 segundos)'],
                  ['👥', 'Outros responsáveis acessam os mesmos dados pelo link'],
                  ['📴', 'Se a internet cair, continua funcionando offline'],
                  ['🔋', 'Ao reconectar, sincroniza tudo automaticamente'],
                ].map(([icon, txt]) => (
                  <div key={txt} className="flex items-center gap-2">
                    <span className="text-sm">{icon}</span>
                    <span className="text-emerald-600 text-sm">{txt}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                <p className="text-amber-700 font-semibold text-sm mb-2">⚠️ Lembre-se: Configure na Vercel!</p>
                <p className="text-amber-600 text-xs mb-2">
                  Para outros usuários conectarem automaticamente, adicione as variáveis na Vercel (Passo 5) e faça um novo deploy.
                </p>
                <div className="bg-slate-900 rounded-lg p-2 font-mono text-xs text-emerald-400 space-y-1">
                  <p>VITE_SUPABASE_URL</p>
                  <p>VITE_SUPABASE_ANON_KEY</p>
                </div>
              </div>

              <button
                onClick={() => { onClose(); window.location.reload(); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
              >
                ✅ Concluir e Recarregar o Sistema
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
