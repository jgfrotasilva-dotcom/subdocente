interface Props {
  onClose: () => void;
}

export default function SupabaseConfigModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-xl">☁️</div>
            <div>
              <h2 className="text-lg font-bold text-white">Configurar Supabase</h2>
              <p className="text-xs text-gray-400">Banco de dados em nuvem — gratuito e sem limite</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">✕</button>
        </div>

        <div className="p-6 space-y-6">

          {/* Intro */}
          <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4">
            <p className="text-emerald-300 text-sm font-medium mb-1">✅ Por que usar o Supabase?</p>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>☁️ Dados na nuvem — acesse de qualquer computador</li>
              <li>🔄 Sincronização automática em tempo real</li>
              <li>👥 Vários usuários acessando os mesmos dados</li>
              <li>💾 Backup automático</li>
              <li>🆓 Plano gratuito suficiente para uso escolar</li>
            </ul>
          </div>

          {/* Passo 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">1</div>
              <h3 className="text-white font-semibold">Criar conta no Supabase</h3>
            </div>
            <div className="ml-11 space-y-2">
              <p className="text-gray-300 text-sm">Acesse <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">supabase.com</a> e clique em <strong className="text-white">Start your project</strong></p>
              <p className="text-gray-300 text-sm">Crie uma conta com seu e-mail ou conta GitHub.</p>
              <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-400">
                💡 Se já tem conta, pule para o passo 2.
              </div>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">2</div>
              <h3 className="text-white font-semibold">Criar um novo projeto</h3>
            </div>
            <div className="ml-11 space-y-2 text-sm text-gray-300">
              <p>No painel do Supabase, clique em <strong className="text-white">New project</strong></p>
              <ul className="space-y-1 list-disc list-inside text-gray-400">
                <li>Dê um nome: <code className="bg-gray-800 text-emerald-400 px-1 rounded">substituicao-docente</code></li>
                <li>Escolha a região: <strong className="text-white">South America (São Paulo)</strong></li>
                <li>Crie uma senha segura e guarde-a</li>
                <li>Clique em <strong className="text-white">Create new project</strong></li>
              </ul>
              <p className="text-gray-400 text-xs">⏳ Aguarde cerca de 1 minuto enquanto o projeto é criado.</p>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">3</div>
              <h3 className="text-white font-semibold">Criar a tabela no banco de dados</h3>
            </div>
            <div className="ml-11 space-y-2 text-sm text-gray-300">
              <p>No menu lateral, clique em <strong className="text-white">SQL Editor</strong> e cole o código abaixo:</p>
              <div className="bg-gray-950 border border-gray-700 rounded-xl p-4 font-mono text-xs text-emerald-300 relative">
                <pre className="whitespace-pre-wrap">{`-- Tabela principal do sistema
CREATE TABLE IF NOT EXISTS escola_dados (
  id TEXT PRIMARY KEY DEFAULT 'escola_principal',
  dados JSONB NOT NULL DEFAULT '{}',
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Permite acesso público (leitura e escrita)
ALTER TABLE escola_dados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acesso_publico" ON escola_dados
  FOR ALL USING (true) WITH CHECK (true);

-- Inserir registro inicial
INSERT INTO escola_dados (id, dados)
VALUES ('escola_principal', '{}')
ON CONFLICT (id) DO NOTHING;`}</pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS escola_dados (
  id TEXT PRIMARY KEY DEFAULT 'escola_principal',
  dados JSONB NOT NULL DEFAULT '{}',
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE escola_dados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso_publico" ON escola_dados
  FOR ALL USING (true) WITH CHECK (true);
INSERT INTO escola_dados (id, dados)
VALUES ('escola_principal', '{}')
ON CONFLICT (id) DO NOTHING;`);
                    alert('✅ SQL copiado! Cole no SQL Editor do Supabase.');
                  }}
                  className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs px-2 py-1 rounded-lg"
                >
                  📋 Copiar
                </button>
              </div>
              <p>Clique em <strong className="text-white">▶ Run</strong> para executar.</p>
            </div>
          </div>

          {/* Passo 4 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">4</div>
              <h3 className="text-white font-semibold">Copiar as credenciais do projeto</h3>
            </div>
            <div className="ml-11 space-y-2 text-sm text-gray-300">
              <p>No menu lateral, vá em <strong className="text-white">Project Settings → API</strong></p>
              <div className="space-y-3">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Project URL:</p>
                  <p className="font-mono text-emerald-400 text-xs">https://xxxxxxxxxxxx.supabase.co</p>
                  <p className="text-xs text-gray-500 mt-1">→ Este é o valor de <code className="text-yellow-400">VITE_SUPABASE_URL</code></p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">anon / public key:</p>
                  <p className="font-mono text-emerald-400 text-xs">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</p>
                  <p className="text-xs text-gray-500 mt-1">→ Este é o valor de <code className="text-yellow-400">VITE_SUPABASE_ANON_KEY</code></p>
                </div>
              </div>
            </div>
          </div>

          {/* Passo 5 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">5</div>
              <h3 className="text-white font-semibold">Configurar as variáveis na Vercel</h3>
            </div>
            <div className="ml-11 space-y-2 text-sm text-gray-300">
              <p>No painel da sua aplicação na Vercel:</p>
              <ul className="space-y-1 list-disc list-inside text-gray-400">
                <li>Vá em <strong className="text-white">Settings → Environment Variables</strong></li>
                <li>Adicione as duas variáveis:</li>
              </ul>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 font-mono text-xs space-y-2">
                <div>
                  <span className="text-yellow-400">VITE_SUPABASE_URL</span>
                  <span className="text-gray-500"> = </span>
                  <span className="text-emerald-400">https://xxxx.supabase.co</span>
                </div>
                <div>
                  <span className="text-yellow-400">VITE_SUPABASE_ANON_KEY</span>
                  <span className="text-gray-500"> = </span>
                  <span className="text-emerald-400">eyJhbG...</span>
                </div>
              </div>
              <p>Marque todas as opções: <strong className="text-white">Production, Preview e Development</strong></p>
              <p>Clique em <strong className="text-white">Save</strong> e depois em <strong className="text-white">Redeploy</strong>.</p>
            </div>
          </div>

          {/* Passo 6 — Desenvolvimento local */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">6</div>
              <h3 className="text-white font-semibold">Desenvolvimento local (opcional)</h3>
            </div>
            <div className="ml-11 space-y-2 text-sm text-gray-300">
              <p>Crie um arquivo <code className="bg-gray-800 text-emerald-400 px-1.5 py-0.5 rounded">.env.local</code> na raiz do projeto:</p>
              <div className="bg-gray-950 border border-gray-700 rounded-lg p-3 font-mono text-xs text-emerald-300">
                <p>VITE_SUPABASE_URL=https://xxxx.supabase.co</p>
                <p>VITE_SUPABASE_ANON_KEY=eyJhbG...</p>
              </div>
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 text-xs text-amber-300">
                ⚠️ Nunca suba o arquivo <code>.env.local</code> para o GitHub! Adicione-o ao <code>.gitignore</code>
              </div>
            </div>
          </div>

          {/* Resultado esperado */}
          <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-4">
            <p className="text-indigo-300 text-sm font-medium mb-2">🎯 Resultado após configurar:</p>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>☁️ O indicador no rodapé mostrará <strong className="text-emerald-400">Sincronizado</strong></li>
              <li>🔄 Qualquer alteração salva automaticamente em até 1,5 segundo</li>
              <li>👥 Outros usuários acessando o mesmo link verão os dados atualizados</li>
              <li>📴 Offline: os dados ficam no localStorage e sincronizam ao reconectar</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              ✅ Entendi!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
