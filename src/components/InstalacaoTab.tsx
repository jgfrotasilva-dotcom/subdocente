import { useState } from 'react';

type Dispositivo = 'windows' | 'android' | 'iphone' | 'tablet';

export default function InstalacaoTab() {
  const [dispositivoAtivo, setDispositivoAtivo] = useState<Dispositivo>('windows');
  const [passoAtivo, setPassoAtivo] = useState(0);

  const dispositivos = [
    { id: 'windows', icon: '🖥️', label: 'Windows', sub: 'Chrome ou Edge', cor: 'blue' },
    { id: 'android', icon: '📱', label: 'Android', sub: 'Google Chrome', cor: 'green' },
    { id: 'iphone', icon: '🍎', label: 'iPhone / iPad', sub: 'Safari (obrigatório)', cor: 'gray' },
    { id: 'tablet', icon: '📟', label: 'Tablet Android', sub: 'Google Chrome', cor: 'purple' },
  ];

  const passosPorDispositivo: Record<Dispositivo, { titulo: string; desc: string; dica?: string; img: string }[]> = {
    windows: [
      {
        titulo: 'Acesse o sistema pelo navegador',
        desc: 'Abra o Google Chrome ou Microsoft Edge e acesse o link do sistema (ex: https://substdoc.vercel.app). Aguarde carregar completamente.',
        dica: 'Funciona melhor no Chrome ou Edge. Não use Firefox para instalar.',
        img: '🌐'
      },
      {
        titulo: 'Localize o botão de instalar',
        desc: 'Na barra de endereços do navegador, no canto direito, aparecerá um ícone de computador com uma seta ⊕ ou um botão "Instalar SubstDoc". Clique nele.',
        dica: 'Se não aparecer, aguarde alguns segundos e recarregue a página (F5).',
        img: '📥'
      },
      {
        titulo: 'Confirme a instalação',
        desc: 'Uma janela de confirmação aparecerá perguntando se deseja instalar o SubstDoc. Clique no botão "Instalar" (azul).',
        img: '✅'
      },
      {
        titulo: 'App instalado!',
        desc: 'O sistema abrirá automaticamente como um aplicativo separado, sem a barra do navegador. Um ícone do SubstDoc é criado no menu Iniciar e na área de trabalho.',
        dica: 'Daqui em diante, abra sempre pelo ícone na área de trabalho — funciona offline!',
        img: '🎉'
      },
    ],
    android: [
      {
        titulo: 'Abra o Chrome no Android',
        desc: 'No seu celular ou tablet Android, abra o aplicativo Google Chrome e acesse o link do sistema.',
        dica: 'Certifique-se de que é o Chrome (ícone colorido em círculo). Não use o Samsung Internet ou outro navegador.',
        img: '🌐'
      },
      {
        titulo: 'Toque nos 3 pontinhos',
        desc: 'No canto superior direito da tela, toque nos três pontos verticais (⋮) para abrir o menu do Chrome.',
        img: '⋮'
      },
      {
        titulo: 'Toque em "Adicionar à tela inicial"',
        desc: 'No menu que abrir, procure e toque na opção "Adicionar à tela inicial" ou "Instalar app". Pode estar em posições diferentes conforme a versão do Chrome.',
        dica: 'Em versões mais recentes do Chrome, pode aparecer um banner no rodapé da tela dizendo "Adicionar SubstDoc à tela inicial".',
        img: '📲'
      },
      {
        titulo: 'Confirme e adicione',
        desc: 'Uma janela aparecerá com o nome do app. Toque em "Adicionar" ou "Instalar" para confirmar.',
        img: '✅'
      },
      {
        titulo: 'Pronto! App na tela inicial',
        desc: 'O ícone do SubstDoc aparecerá na tela inicial do seu Android, igual a qualquer outro aplicativo. Toque nele para abrir.',
        dica: 'Funciona offline! Mesmo sem Wi-Fi ou dados móveis, o sistema continua funcionando.',
        img: '🎉'
      },
    ],
    iphone: [
      {
        titulo: 'Abra o Safari (IMPORTANTE!)',
        desc: 'No iPhone ou iPad, você DEVE usar o Safari para instalar. O Chrome no iOS não permite instalação de PWA. Procure o ícone do Safari (bússola azul) e abra o link do sistema.',
        dica: '⚠️ ATENÇÃO: Use o Safari, não o Chrome. Essa é a regra da Apple.',
        img: '🧭'
      },
      {
        titulo: 'Toque no botão Compartilhar',
        desc: 'Na barra inferior do Safari, toque no ícone de compartilhamento — é um quadrado com uma seta apontando para cima (↑). Pode estar na barra inferior ou superior dependendo do seu iOS.',
        img: '⬆️'
      },
      {
        titulo: 'Role e toque em "Adicionar à Tela de Início"',
        desc: 'Na lista de opções que aparecer, role para baixo até encontrar "Adicionar à Tela de Início" (com ícone de grade). Toque nessa opção.',
        dica: 'Se não encontrar, role mais para baixo — a opção pode estar escondida na lista.',
        img: '📱'
      },
      {
        titulo: 'Defina o nome e confirme',
        desc: 'Uma tela aparecerá com o nome "SubstDoc" (ou similar). Você pode alterar o nome se quiser. Toque em "Adicionar" no canto superior direito.',
        img: '✏️'
      },
      {
        titulo: 'App na tela de início!',
        desc: 'O ícone do SubstDoc aparece na sua tela de início do iPhone/iPad. Toque nele para abrir como um app completo, sem a barra do Safari.',
        dica: 'O app funciona offline normalmente. Ao abrir pelo ícone, ele ocupa a tela cheia.',
        img: '🎉'
      },
    ],
    tablet: [
      {
        titulo: 'Abra o Chrome no Tablet',
        desc: 'No tablet Android, abra o Google Chrome e acesse o link do sistema. A tela maior facilita o uso do SubstDoc!',
        img: '🌐'
      },
      {
        titulo: 'Toque nos 3 pontinhos',
        desc: 'No canto superior direito, toque nos três pontos (⋮) para abrir o menu do Chrome.',
        img: '⋮'
      },
      {
        titulo: 'Selecione "Instalar app"',
        desc: 'No menu, toque em "Instalar app" ou "Adicionar à tela inicial". Em tablets, é comum aparecer um banner na parte superior da tela com a opção de instalar.',
        dica: 'O SubstDoc é otimizado para telas grandes — em tablets fica excelente!',
        img: '📲'
      },
      {
        titulo: 'Confirme a instalação',
        desc: 'Toque em "Instalar" na janela de confirmação. O app será adicionado à tela inicial e ao menu de aplicativos do tablet.',
        img: '✅'
      },
      {
        titulo: 'Pronto!',
        desc: 'O SubstDoc está instalado no tablet e funciona offline. Perfeito para usar na coordenação pedagógica!',
        dica: 'Ótimo para apresentar a grade horária em reuniões usando o tablet.',
        img: '🎉'
      },
    ],
  };

  const passos = passosPorDispositivo[dispositivoAtivo];
  const dispositivoInfo = dispositivos.find(d => d.id === dispositivoAtivo)!;

  const coresDispositivo: Record<string, { bg: string; border: string; text: string; badge: string; step: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-600', step: 'bg-blue-100 text-blue-700' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', badge: 'bg-green-600', step: 'bg-green-100 text-green-700' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', badge: 'bg-gray-700', step: 'bg-gray-100 text-gray-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', badge: 'bg-purple-600', step: 'bg-purple-100 text-purple-700' },
  };

  const cores = coresDispositivo[dispositivoInfo.cor];

  return (
    <div className="space-y-6">

      {/* Header principal */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 rounded-2xl p-4 text-5xl">📲</div>
          <div>
            <h1 className="text-3xl font-bold">Como Instalar o SubstDoc</h1>
            <p className="text-blue-200 text-lg mt-1">Guia visual passo a passo para cada dispositivo</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { icon: '⚡', label: 'Rápido', desc: 'Menos de 1 minuto' },
            { icon: '📡', label: 'Offline', desc: 'Funciona sem internet' },
            { icon: '🆓', label: 'Gratuito', desc: 'Sem custo algum' },
          ].map(b => (
            <div key={b.label} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="font-bold text-sm">{b.label}</div>
              <div className="text-blue-200 text-xs">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* O que é PWA — explicação simples */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          🤔 O que significa "instalar"?
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="font-bold text-red-800 mb-2">❌ Sem instalar</div>
            <ul className="space-y-1 text-red-700 text-sm">
              <li>• Precisa abrir o navegador toda vez</li>
              <li>• Digitar o endereço (link) toda vez</li>
              <li>• <strong>Não funciona sem internet</strong></li>
              <li>• Barra do navegador fica na tela</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="font-bold text-green-800 mb-2">✅ Com o app instalado</div>
            <ul className="space-y-1 text-green-700 text-sm">
              <li>• Ícone na área de trabalho / tela inicial</li>
              <li>• Abre com 1 clique, igual qualquer app</li>
              <li>• <strong>Funciona 100% sem internet</strong></li>
              <li>• Tela cheia, sem barra do navegador</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <p className="text-amber-800 text-sm">
            <strong>Tecnicamente:</strong> O SubstDoc é um <strong>PWA (Progressive Web App)</strong> — um site que se comporta como um aplicativo nativo. Não precisa de loja de aplicativos (App Store ou Google Play). A instalação é feita diretamente pelo navegador.
          </p>
        </div>
      </div>

      {/* Seletor de dispositivo */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📱 Selecione seu dispositivo:</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {dispositivos.map(d => (
            <button
              key={d.id}
              onClick={() => { setDispositivoAtivo(d.id as Dispositivo); setPassoAtivo(0); }}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                dispositivoAtivo === d.id
                  ? `border-indigo-500 bg-indigo-50 shadow-lg scale-105`
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-4xl mb-2">{d.icon}</div>
              <div className={`font-bold text-sm ${dispositivoAtivo === d.id ? 'text-indigo-700' : 'text-gray-700'}`}>{d.label}</div>
              <div className="text-xs text-gray-500 mt-1">{d.sub}</div>
              {dispositivoAtivo === d.id && (
                <div className="mt-2 text-xs bg-indigo-600 text-white rounded-full px-2 py-0.5">Selecionado</div>
              )}
            </button>
          ))}
        </div>

        {/* Header do dispositivo selecionado */}
        <div className={`${cores.bg} border ${cores.border} rounded-xl p-5 mb-6`}>
          <div className="flex items-center gap-3">
            <div className={`${cores.badge} text-white rounded-xl p-3 text-3xl`}>{dispositivoInfo.icon}</div>
            <div>
              <div className={`font-bold text-xl ${cores.text}`}>{dispositivoInfo.label}</div>
              <div className="text-gray-600 text-sm">{dispositivoInfo.sub}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-gray-500">{passos.length} passos simples</div>
              <div className="text-xs text-gray-400">~1 minuto</div>
            </div>
          </div>
        </div>

        {/* Navegação dos passos */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {passos.map((p, i) => (
            <button
              key={i}
              onClick={() => setPassoAtivo(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap text-sm transition-all flex-shrink-0 ${
                passoAtivo === i
                  ? `${cores.badge} text-white shadow-lg`
                  : i < passoAtivo
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {i < passoAtivo ? (
                <span>✓</span>
              ) : (
                <span className="font-bold">{i + 1}</span>
              )}
              <span className="hidden md:inline">{p.titulo.split(' ').slice(0, 3).join(' ')}...</span>
              <span className="md:hidden">{i + 1}</span>
            </button>
          ))}
        </div>

        {/* Card do passo atual */}
        <div className={`${cores.bg} border-2 ${cores.border} rounded-2xl overflow-hidden`}>
          {/* Header do passo */}
          <div className={`${cores.badge} text-white p-6`}>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-2xl p-4 text-5xl text-center w-20 h-20 flex items-center justify-center">
                {passos[passoAtivo].img}
              </div>
              <div>
                <div className="text-white/70 text-sm font-semibold">
                  PASSO {passoAtivo + 1} DE {passos.length}
                </div>
                <h3 className="text-2xl font-bold mt-1">{passos[passoAtivo].titulo}</h3>
              </div>
            </div>
          </div>

          {/* Conteúdo do passo */}
          <div className="p-6">
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              {passos[passoAtivo].desc}
            </p>
            {passos[passoAtivo].dica && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">💡</span>
                <p className="text-amber-800 text-sm">{passos[passoAtivo].dica}</p>
              </div>
            )}
          </div>

          {/* Navegação entre passos */}
          <div className="p-6 pt-0 flex items-center gap-3">
            <button
              onClick={() => setPassoAtivo(Math.max(0, passoAtivo - 1))}
              disabled={passoAtivo === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← Anterior
            </button>

            <div className="flex gap-2 flex-1 justify-center">
              {passos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPassoAtivo(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === passoAtivo ? `${cores.badge} scale-125` : i < passoAtivo ? 'bg-green-400' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {passoAtivo < passos.length - 1 ? (
              <button
                onClick={() => setPassoAtivo(Math.min(passos.length - 1, passoAtivo + 1))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${cores.badge} text-white hover:opacity-90 transition-all`}
              >
                Próximo →
              </button>
            ) : (
              <button
                onClick={() => setPassoAtivo(0)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all"
              >
                🎉 Recomeçar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visão geral de todos os passos */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          📋 Resumo — Todos os passos de uma vez ({dispositivoInfo.icon} {dispositivoInfo.label})
        </h2>
        <div className="space-y-3">
          {passos.map((p, i) => (
            <div
              key={i}
              onClick={() => setPassoAtivo(i)}
              className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                passoAtivo === i
                  ? `${cores.bg} ${cores.border} shadow-md`
                  : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                passoAtivo === i ? `${cores.badge} text-white` : `${cores.step}`
              }`}>
                {i + 1}
              </div>
              <div className="flex-1">
                <div className={`font-semibold ${passoAtivo === i ? cores.text : 'text-gray-800'}`}>{p.titulo}</div>
                <div className="text-gray-500 text-sm mt-0.5 line-clamp-1">{p.desc}</div>
              </div>
              <div className="text-2xl">{p.img}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Problemas comuns */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🆘 Problemas comuns e soluções</h2>
        <div className="space-y-3">
          {[
            {
              prob: 'Não aparece o botão de instalar no Chrome/Edge',
              sol: 'Aguarde 30 segundos com a página aberta. Se não aparecer, tente: Menu (⋮) → "Salvar e compartilhar" → "Criar atalho" → marque "Abrir como janela" → Criar.',
              cor: 'blue'
            },
            {
              prob: 'No iPhone, não encontro "Adicionar à Tela de Início"',
              sol: 'Certifique-se de usar o Safari (não Chrome). Toque no ícone de compartilhar (↑) na barra INFERIOR da tela. Role a lista de opções até o final.',
              cor: 'gray'
            },
            {
              prob: 'O app instalado não abre (tela em branco)',
              sol: 'Conecte à internet uma vez para o app atualizar o cache. Depois pode usar offline. Se persistir, desinstale e reinstale o app.',
              cor: 'red'
            },
            {
              prob: 'Os dados sumiram depois de instalar',
              sol: 'Os dados ficam no navegador onde você usou o sistema. Exporte um backup (.json) antes de instalar em outro dispositivo e importe no app instalado.',
              cor: 'amber'
            },
            {
              prob: 'Quero desinstalar o app',
              sol: 'Windows: Clique com botão direito no ícone do app → Desinstalar. Android: Segure o ícone → Desinstalar. iPhone: Segure o ícone → Remover App.',
              cor: 'purple'
            },
          ].map((item, i) => (
            <div key={i} className={`border border-${item.cor}-200 bg-${item.cor}-50 rounded-xl p-4`}>
              <div className={`font-bold text-${item.cor}-800 mb-2 flex items-center gap-2`}>
                <span>❓</span> {item.prob}
              </div>
              <div className={`text-${item.cor}-700 text-sm flex items-start gap-2`}>
                <span className="flex-shrink-0">→</span> {item.sol}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Uso offline */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          📡 Como funciona offline?
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {[
              { icon: '💾', text: 'Todos os dados ficam salvos no dispositivo automaticamente' },
              { icon: '⚡', text: 'O app abre instantaneamente, sem precisar carregar da internet' },
              { icon: '🔄', text: 'Qualquer alteração feita offline fica salva localmente' },
              { icon: '📤', text: 'Quando voltar a internet, compartilhe o backup com os colegas' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm text-white/90">{item.text}</span>
              </div>
            ))}
          </div>
          <div className="bg-white/10 rounded-xl p-5">
            <h3 className="font-bold mb-3 text-lg">🔴 Indicador de status</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-2">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm">Online — conectado à internet</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-2">
                <div className="w-3 h-3 rounded-full bg-orange-400 animate-pulse"></div>
                <span className="text-sm">Offline — funcionando localmente</span>
              </div>
              <p className="text-white/70 text-xs mt-2">
                O indicador aparece no canto superior direito do Header do sistema.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
