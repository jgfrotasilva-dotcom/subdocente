import { useState, useRef } from 'react';
import { Professor, Aula, Substituicao, Turma, Disciplina, Configuracoes } from '../types';

interface AppData {
  turmas: Turma[];
  disciplinas: Disciplina[];
  professores: Professor[];
  aulas: Aula[];
  substituicoes: Substituicao[];
  configuracoes: Configuracoes;
  exportadoEm?: string;
  versao?: string;
}

interface Props {
  onClose: () => void;
  dados: AppData;
  onImportar: (dados: AppData) => void;
}

type Tela = 'menu' | 'exportar' | 'importar' | 'sucesso';

export default function CompartilhamentoModal({ onClose, dados, onImportar }: Props) {
  const [tela, setTela] = useState<Tela>('menu');
  const [erro, setErro] = useState('');
  const [previa, setPrevia] = useState<AppData | null>(null);
  const [nomeArquivo, setNomeArquivo] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── Exportar ───────────────────────────────────────────
  const handleExportar = () => {
    const payload: AppData = {
      ...dados,
      exportadoEm: new Date().toLocaleString('pt-BR'),
      versao: '1.0',
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const data = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    a.href = url;
    a.download = `substituicao-docente-${data}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Importar ───────────────────────────────────────────
  const handleArquivoSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro('');
    setNomeArquivo(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as AppData;
        // Validação básica
        if (!parsed.professores || !parsed.turmas || !parsed.disciplinas) {
          throw new Error('Arquivo inválido ou corrompido.');
        }
        setPrevia(parsed);
      } catch {
        setErro('❌ Arquivo inválido. Selecione um arquivo .json exportado por este sistema.');
        setPrevia(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmarImport = () => {
    if (!previa) return;
    onImportar(previa);
    setTela('sucesso');
  };

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
              💾
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Salvar & Compartilhar</h2>
              <p className="text-indigo-200 text-xs">Exporte ou importe os dados do sistema</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
        </div>

        {/* ── MENU ── */}
        {tela === 'menu' && (
          <div className="p-6 space-y-4">
            <p className="text-gray-600 text-sm text-center">
              Salve seu trabalho em um arquivo e compartilhe com outros responsáveis.<br />
              <strong>Sem cadastro, sem internet, sem configuração.</strong>
            </p>

            {/* Card Exportar */}
            <button
              onClick={() => setTela('exportar')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all group text-left"
            >
              <div className="w-14 h-14 bg-indigo-100 group-hover:bg-indigo-200 rounded-xl flex items-center justify-center text-2xl transition-colors shrink-0">
                📤
              </div>
              <div>
                <div className="font-bold text-gray-800 text-base">Exportar / Salvar</div>
                <div className="text-gray-500 text-sm">Baixa um arquivo .json com todos os dados atuais. Envie por WhatsApp, e-mail ou Google Drive.</div>
              </div>
              <div className="ml-auto text-indigo-400 group-hover:text-indigo-600 text-xl">›</div>
            </button>

            {/* Card Importar */}
            <button
              onClick={() => setTela('importar')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-emerald-100 hover:border-emerald-400 hover:bg-emerald-50 transition-all group text-left"
            >
              <div className="w-14 h-14 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl flex items-center justify-center text-2xl transition-colors shrink-0">
                📥
              </div>
              <div>
                <div className="font-bold text-gray-800 text-base">Importar / Carregar</div>
                <div className="text-gray-500 text-sm">Carrega um arquivo .json enviado por um colega. Os dados atuais serão substituídos.</div>
              </div>
              <div className="ml-auto text-emerald-400 group-hover:text-emerald-600 text-xl">›</div>
            </button>

            {/* Dica */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
              <span className="text-lg shrink-0">💡</span>
              <p className="text-amber-800 text-xs">
                <strong>Como compartilhar:</strong> Exporte o arquivo → envie pelo WhatsApp ou salve no Google Drive → o colega abre o sistema e clica em Importar.
              </p>
            </div>

            {/* Resumo dos dados atuais */}
            <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-indigo-600">{dados.professores.length}</div>
                <div className="text-xs text-gray-500">Professores</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-600">{dados.aulas.length}</div>
                <div className="text-xs text-gray-500">Aulas na Grade</div>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-600">{dados.substituicoes.length}</div>
                <div className="text-xs text-gray-500">Substituições</div>
              </div>
            </div>
          </div>
        )}

        {/* ── EXPORTAR ── */}
        {tela === 'exportar' && (
          <div className="p-6 space-y-5">
            <button onClick={() => setTela('menu')} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              ‹ Voltar
            </button>

            <div className="text-center">
              <div className="text-5xl mb-3">📤</div>
              <h3 className="text-lg font-bold text-gray-800">Exportar Dados</h3>
              <p className="text-gray-500 text-sm mt-1">Um arquivo .json será baixado com todos os dados do sistema.</p>
            </div>

            {/* Resumo */}
            <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
              <div className="text-sm font-semibold text-indigo-800 mb-2">📋 O arquivo conterá:</div>
              {[
                { label: 'Turmas cadastradas', valor: dados.turmas.length, icon: '🏫' },
                { label: 'Disciplinas cadastradas', valor: dados.disciplinas.length, icon: '📚' },
                { label: 'Professores e atribuições', valor: dados.professores.length, icon: '👨‍🏫' },
                { label: 'Aulas na grade horária', valor: dados.aulas.length, icon: '📅' },
                { label: 'Substituições registradas', valor: dados.substituicoes.length, icon: '🔄' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{item.icon} {item.label}</span>
                  <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-lg">{item.valor}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleExportar}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-base"
            >
              ⬇️ Baixar Arquivo de Backup
            </button>

            <p className="text-xs text-gray-400 text-center">
              Salve o arquivo em um local seguro ou envie diretamente pelo WhatsApp/e-mail.
            </p>
          </div>
        )}

        {/* ── IMPORTAR ── */}
        {tela === 'importar' && (
          <div className="p-6 space-y-4">
            <button onClick={() => { setTela('menu'); setPrevia(null); setErro(''); setNomeArquivo(''); }} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              ‹ Voltar
            </button>

            <div className="text-center">
              <div className="text-5xl mb-3">📥</div>
              <h3 className="text-lg font-bold text-gray-800">Importar Dados</h3>
              <p className="text-gray-500 text-sm mt-1">Selecione o arquivo .json enviado por um colega.</p>
            </div>

            {/* Área de upload */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer hover:bg-indigo-50 transition-all"
            >
              <div className="text-3xl mb-2">{nomeArquivo ? '✅' : '📁'}</div>
              <div className="text-sm font-medium text-gray-700">
                {nomeArquivo || 'Clique para selecionar o arquivo'}
              </div>
              {!nomeArquivo && <div className="text-xs text-gray-400 mt-1">Formato: .json</div>}
            </div>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleArquivoSelecionado} />

            {/* Erro */}
            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{erro}</div>
            )}

            {/* Prévia */}
            {previa && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <div className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                  ✅ Arquivo válido — prévia dos dados:
                </div>
                {previa.exportadoEm && (
                  <div className="text-xs text-emerald-600">📅 Exportado em: {previa.exportadoEm}</div>
                )}
                {[
                  { label: 'Turmas', valor: previa.turmas?.length ?? 0, icon: '🏫' },
                  { label: 'Disciplinas', valor: previa.disciplinas?.length ?? 0, icon: '📚' },
                  { label: 'Professores', valor: previa.professores?.length ?? 0, icon: '👨‍🏫' },
                  { label: 'Aulas na grade', valor: previa.aulas?.length ?? 0, icon: '📅' },
                  { label: 'Substituições', valor: previa.substituicoes?.length ?? 0, icon: '🔄' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.icon} {item.label}</span>
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">{item.valor}</span>
                  </div>
                ))}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
                  <p className="text-amber-700 text-xs">
                    ⚠️ <strong>Atenção:</strong> Os dados atuais serão substituídos pelos dados do arquivo.
                  </p>
                </div>

                <button
                  onClick={handleConfirmarImport}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  ✅ Confirmar Importação
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── SUCESSO ── */}
        {tela === 'sucesso' && (
          <div className="p-8 text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h3 className="text-xl font-bold text-gray-800">Dados importados com sucesso!</h3>
            <p className="text-gray-500 text-sm">Todos os dados foram carregados. Você pode fechar esta janela.</p>
            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl transition-all"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
