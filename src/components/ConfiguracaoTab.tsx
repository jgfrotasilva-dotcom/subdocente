import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Professor, Aula, Turma, Disciplina, Configuracoes, Atribuicao } from '../types';
import { cn } from '../utils/cn';

interface ConfiguracaoTabProps {
  turmas: Turma[];
  setTurmas: (turmas: Turma[]) => void;
  disciplinas: Disciplina[];
  setDisciplinas: (disciplinas: Disciplina[]) => void;
  professores: Professor[];
  setProfessores: (professores: Professor[]) => void;
  aulas: Aula[];
  setAulas: (aulas: Aula[]) => void;
  configuracoes: Configuracoes;
  setConfiguracoes: (config: Configuracoes) => void;
  limparTodosDados: () => void;
}

type SubAba = 'upload' | 'turmas' | 'disciplinas' | 'professores' | 'horarios';

// Paleta de cores para os cards de professores
const CORES_CARDS = [
  { bg: 'from-blue-500 to-blue-700', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  { bg: 'from-emerald-500 to-emerald-700', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
  { bg: 'from-violet-500 to-violet-700', light: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-800' },
  { bg: 'from-rose-500 to-rose-700', light: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-800' },
  { bg: 'from-amber-500 to-amber-700', light: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  { bg: 'from-cyan-500 to-cyan-700', light: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-800' },
  { bg: 'from-pink-500 to-pink-700', light: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-800' },
  { bg: 'from-teal-500 to-teal-700', light: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-100 text-teal-800' },
  { bg: 'from-indigo-500 to-indigo-700', light: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-800' },
  { bg: 'from-orange-500 to-orange-700', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800' },
];

// Função para obter iniciais do nome
function getIniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

export default function ConfiguracaoTab({
  turmas,
  setTurmas,
  disciplinas,
  setDisciplinas,
  professores,
  setProfessores,
  aulas,
  setAulas,
  configuracoes,
  setConfiguracoes,
  limparTodosDados
}: ConfiguracaoTabProps) {
  const [subAba, setSubAba] = useState<SubAba>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para formulários
  const [novaTurma, setNovaTurma] = useState({ nome: '', ano: 6 });
  const [novaDisciplina, setNovaDisciplina] = useState({ nome: '', abreviacao: '' });
  const [novoProfessor, setNovoProfessor] = useState({ nome: '' });
  const [professoresAbertos, setProfessoresAbertos] = useState<Set<string>>(new Set());
  const [novaAtribuicao, setNovaAtribuicao] = useState({ disciplinaId: '', turmaId: '', aulasAtribuidas: 2 });
  const [buscaProfessor, setBuscaProfessor] = useState('');

  // Estado para upload
  const [dadosPreview, setDadosPreview] = useState<{
    professores: Professor[];
    aulas: Aula[];
    turmas: Turma[];
    disciplinas: Disciplina[];
  } | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ tipo: 'sucesso' | 'erro' | 'processando' | ''; msg: string }>({ tipo: '', msg: '' });

  // Toggle abrir/fechar card professor
  const toggleProfessor = (id: string) => {
    setProfessoresAbertos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ============ FUNÇÕES DE TURMAS ============
  const adicionarTurma = () => {
    if (!novaTurma.nome.trim()) return;
    const turma: Turma = {
      id: `turma_${Date.now()}`,
      nome: novaTurma.nome.trim(),
      ano: novaTurma.ano
    };
    setTurmas([...turmas, turma]);
    setNovaTurma({ nome: '', ano: 6 });
  };

  const removerTurma = (id: string) => {
    if (confirm('Remover esta turma? As aulas e atribuições associadas também serão removidas.')) {
      setTurmas(turmas.filter(t => t.id !== id));
      setAulas(aulas.filter(a => a.turmaId !== id));
      setProfessores(professores.map(p => ({
        ...p,
        turmas: p.turmas.filter(t => t !== id),
        atribuicoes: p.atribuicoes.filter(a => a.turmaId !== id),
        aulasSemanais: p.atribuicoes.filter(a => a.turmaId !== id).reduce((sum, a) => sum + a.aulasAtribuidas, 0)
      })));
    }
  };

  // ============ FUNÇÕES DE DISCIPLINAS ============
  const adicionarDisciplina = () => {
    if (!novaDisciplina.nome.trim()) return;
    const disciplina: Disciplina = {
      id: `disc_${Date.now()}`,
      nome: novaDisciplina.nome.trim(),
      abreviacao: novaDisciplina.abreviacao.trim() || novaDisciplina.nome.substring(0, 3).toUpperCase(),
      multiplosDocentes: false
    };
    setDisciplinas([...disciplinas, disciplina]);
    setNovaDisciplina({ nome: '', abreviacao: '' });
  };

  const toggleMultiplosDocentes = (id: string) => {
    setDisciplinas(disciplinas.map(d =>
      d.id === id ? { ...d, multiplosDocentes: !d.multiplosDocentes } : d
    ));
  };

  const removerDisciplina = (id: string) => {
    if (confirm('Remover esta disciplina?')) {
      setDisciplinas(disciplinas.filter(d => d.id !== id));
      setAulas(aulas.filter(a => a.disciplinaId !== id));
      setProfessores(professores.map(p => ({
        ...p,
        disciplinas: p.disciplinas.filter(d => d !== id),
        atribuicoes: p.atribuicoes.filter(a => a.disciplinaId !== id),
        aulasSemanais: p.atribuicoes.filter(a => a.disciplinaId !== id).reduce((sum, at) => sum + at.aulasAtribuidas, 0)
      })));
    }
  };

  // ============ FUNÇÕES DE PROFESSORES ============
  const adicionarProfessor = () => {
    if (!novoProfessor.nome.trim()) return;
    const professor: Professor = {
      id: `prof_${Date.now()}`,
      nome: novoProfessor.nome.trim(),
      disciplinas: [],
      turmas: [],
      atribuicoes: [],
      aulasSemanais: 0,
      aulasExtras: 0
    };
    setProfessores([...professores, professor]);
    setNovoProfessor({ nome: '' });
    setProfessoresAbertos(prev => new Set([...prev, professor.id]));
  };

  const removerProfessor = (id: string) => {
    if (confirm('Remover este professor?')) {
      setProfessores(professores.filter(p => p.id !== id));
      setAulas(aulas.filter(a => a.professorId !== id));
    }
  };

  const adicionarAtribuicao = (professorId: string) => {
    if (!novaAtribuicao.disciplinaId || !novaAtribuicao.turmaId || novaAtribuicao.aulasAtribuidas < 1) return;
    setProfessores(professores.map(p => {
      if (p.id !== professorId) return p;
      const existente = p.atribuicoes.find(
        a => a.disciplinaId === novaAtribuicao.disciplinaId && a.turmaId === novaAtribuicao.turmaId
      );
      if (existente) { alert('Esta atribuição já existe para este professor!'); return p; }
      const novasAtribuicoes: Atribuicao[] = [...p.atribuicoes, { ...novaAtribuicao }];
      return {
        ...p,
        atribuicoes: novasAtribuicoes,
        disciplinas: [...new Set([...p.disciplinas, novaAtribuicao.disciplinaId])],
        turmas: [...new Set([...p.turmas, novaAtribuicao.turmaId])],
        aulasSemanais: novasAtribuicoes.reduce((sum, a) => sum + a.aulasAtribuidas, 0)
      };
    }));
    setNovaAtribuicao({ disciplinaId: '', turmaId: '', aulasAtribuidas: 2 });
  };

  const removerAtribuicao = (professorId: string, disciplinaId: string, turmaId: string) => {
    setProfessores(professores.map(p => {
      if (p.id !== professorId) return p;
      const novasAtribuicoes = p.atribuicoes.filter(
        a => !(a.disciplinaId === disciplinaId && a.turmaId === turmaId)
      );
      return {
        ...p,
        atribuicoes: novasAtribuicoes,
        disciplinas: [...new Set(novasAtribuicoes.map(a => a.disciplinaId))],
        turmas: [...new Set(novasAtribuicoes.map(a => a.turmaId))],
        aulasSemanais: novasAtribuicoes.reduce((sum, a) => sum + a.aulasAtribuidas, 0)
      };
    }));
  };

  const atualizarQuantidadeAulas = (professorId: string, disciplinaId: string, turmaId: string, quantidade: number) => {
    setProfessores(professores.map(p => {
      if (p.id !== professorId) return p;
      const novasAtribuicoes = p.atribuicoes.map(a =>
        a.disciplinaId === disciplinaId && a.turmaId === turmaId
          ? { ...a, aulasAtribuidas: Math.max(1, quantidade) }
          : a
      );
      return { ...p, atribuicoes: novasAtribuicoes, aulasSemanais: novasAtribuicoes.reduce((sum, a) => sum + a.aulasAtribuidas, 0) };
    }));
  };

  // ============ FUNÇÕES DE HORÁRIOS ============
  const atualizarHorario = (index: number, campo: 'inicio' | 'fim', valor: string) => {
    const novosHorarios = [...configuracoes.horarios];
    novosHorarios[index] = { ...novosHorarios[index], [campo]: valor };
    setConfiguracoes({ ...configuracoes, horarios: novosHorarios });
  };

  // ============ FUNÇÕES DE UPLOAD EXCEL ============
  const normalizarChave = (str: string) => str.toLowerCase().replace(/[\s.\-_]/g, '');

  const buscarValorColuna = (row: Record<string, unknown>, nomes: string[]): string => {
    const normalizados = nomes.map(normalizarChave);
    for (const key of Object.keys(row)) {
      if (normalizados.includes(normalizarChave(key))) {
        const val = row[key];
        if (val !== null && val !== undefined) return String(val).trim();
      }
    }
    return '';
  };

  const buscarNumeroColuna = (row: Record<string, unknown>, nomes: string[]): number => {
    const normalizados = nomes.map(normalizarChave);
    for (const key of Object.keys(row)) {
      if (normalizados.includes(normalizarChave(key))) {
        const val = Number(row[key]);
        if (!isNaN(val)) return val;
      }
    }
    return 0;
  };

  const processarExcel = (file: File) => {
    setUploadStatus({ tipo: 'processando', msg: '⏳ Processando arquivo...' });
    setDadosPreview(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: '' }) as Record<string, unknown>[];

        if (jsonData.length === 0) {
          setUploadStatus({ tipo: 'erro', msg: '❌ Planilha vazia ou sem dados reconhecíveis.' });
          return;
        }

        console.log('Cabeçalhos:', Object.keys(jsonData[0]));
        console.log('Primeiras 3 linhas:', jsonData.slice(0, 3));

        const turmasMap = new Map<string, Turma>();
        const disciplinasMap = new Map<string, Disciplina>();
        const professoresMap = new Map<string, Professor>();
        const atribuicoesMap = new Map<string, { professorNome: string; disciplinaNome: string; turmaNome: string; quantidade: number }>();

        let linhasProcessadas = 0;
        let linhasIgnoradas = 0;

        jsonData.forEach((row, index) => {
          const professorNome = buscarValorColuna(row, ['Professor', 'Prof', 'Nome']);
          const turmaNome = buscarValorColuna(row, ['Turma', 'Classe', 'Sala']);
          const disciplinaNome = buscarValorColuna(row, ['Disciplina', 'dis', 'Disc', 'Materia', 'Matéria']);
          const qtdeAulas = buscarNumeroColuna(row, [
            'Qde.Aulas', 'Qtde.Aulas', 'QdeAulas', 'QtdeAulas',
            'Qde Aulas', 'Qtde Aulas', 'Quantidade', 'Aulas', 'Qtde', 'Qde', 'Qt'
          ]);

          if (index < 5) {
            console.log(`L${index + 1} → Prof:"${professorNome}" Turma:"${turmaNome}" Qtde:${qtdeAulas} Disc:"${disciplinaNome}"`);
          }

          if (!professorNome || !turmaNome) { linhasIgnoradas++; return; }
          linhasProcessadas++;

          // Turma
          if (!turmasMap.has(turmaNome)) {
            const anoMatch = turmaNome.match(/(\d+)/);
            const ano = anoMatch ? Math.min(Math.max(parseInt(anoMatch[1]), 6), 9) : 6;
            turmasMap.set(turmaNome, {
              id: `turma_${turmaNome.replace(/\s/g, '_').replace(/[^\w]/g, '')}`,
              nome: turmaNome, ano
            });
          }

          // Disciplina
          const discKey = disciplinaNome || 'Sem Disciplina';
          if (!disciplinasMap.has(discKey)) {
            disciplinasMap.set(discKey, {
              id: `disc_${discKey.replace(/\s/g, '_').replace(/[^\w]/g, '')}`,
              nome: discKey,
              abreviacao: discKey.substring(0, 4).toUpperCase()
            });
          }

          // Professor
          if (!professoresMap.has(professorNome)) {
            professoresMap.set(professorNome, {
              id: `prof_${professorNome.replace(/\s/g, '_').replace(/[^\w]/g, '')}`,
              nome: professorNome,
              disciplinas: [], turmas: [], atribuicoes: [],
              aulasSemanais: 0, aulasExtras: 0
            });
          }

          const professor = professoresMap.get(professorNome)!;
          const turma = turmasMap.get(turmaNome)!;
          const disciplina = disciplinasMap.get(discKey)!;

          if (!professor.turmas.includes(turma.id)) professor.turmas.push(turma.id);
          if (!professor.disciplinas.includes(disciplina.id)) professor.disciplinas.push(disciplina.id);

          const atribKey = `${professorNome}||${discKey}||${turmaNome}`;
          const qtdeFinal = qtdeAulas > 0 ? qtdeAulas : 1;

          if (atribuicoesMap.has(atribKey)) {
            atribuicoesMap.get(atribKey)!.quantidade += qtdeFinal;
          } else {
            atribuicoesMap.set(atribKey, { professorNome, disciplinaNome: discKey, turmaNome, quantidade: qtdeFinal });
          }
        });

        // Montar atribuições
        atribuicoesMap.forEach((atrib) => {
          const professor = professoresMap.get(atrib.professorNome);
          const turma = turmasMap.get(atrib.turmaNome);
          const disciplina = disciplinasMap.get(atrib.disciplinaNome);
          if (!professor || !turma || !disciplina) return;
          professor.atribuicoes.push({
            disciplinaId: disciplina.id,
            turmaId: turma.id,
            aulasAtribuidas: atrib.quantidade
          });
        });

        professoresMap.forEach(p => {
          p.aulasSemanais = p.atribuicoes.reduce((s, a) => s + a.aulasAtribuidas, 0);
        });

        const novasTurmas = Array.from(turmasMap.values()).sort((a, b) => a.nome.localeCompare(b.nome));
        const novasDisciplinas = Array.from(disciplinasMap.values()).sort((a, b) => a.nome.localeCompare(b.nome));
        const novosProfessores = Array.from(professoresMap.values()).sort((a, b) => a.nome.localeCompare(b.nome));
        const totalAulas = novosProfessores.reduce((s, p) => s + p.aulasSemanais, 0);

        setDadosPreview({ turmas: novasTurmas, disciplinas: novasDisciplinas, professores: novosProfessores, aulas: [] });
        setUploadStatus({
          tipo: 'sucesso',
          msg: `✅ Arquivo processado! ${linhasProcessadas} linhas lidas${linhasIgnoradas > 0 ? ` (${linhasIgnoradas} ignoradas)` : ''} → ${novosProfessores.length} professores · ${novasDisciplinas.length} disciplinas · ${novasTurmas.length} turmas · ${totalAulas} aulas`
        });
      } catch (err) {
        console.error(err);
        setUploadStatus({ tipo: 'erro', msg: '❌ Erro ao processar o arquivo. Verifique se é um Excel válido (.xlsx ou .xls).' });
      }
    };
    reader.readAsBinaryString(file);
  };

  const confirmarImportacao = () => {
    if (!dadosPreview) return;
    if (confirm('Isso vai SUBSTITUIR todos os dados atuais. Confirma?')) {
      setTurmas(dadosPreview.turmas);
      setDisciplinas(dadosPreview.disciplinas);
      setProfessores(dadosPreview.professores);
      setAulas([]);
      setDadosPreview(null);
      setUploadStatus({ tipo: 'sucesso', msg: '✅ Dados importados com sucesso!' });
      setSubAba('professores');
    }
  };

  const adicionarImportacao = () => {
    if (!dadosPreview) return;
    const turmasExistentes = new Set(turmas.map(t => t.nome));
    const discExistentes = new Set(disciplinas.map(d => d.nome));
    const profExistentes = new Set(professores.map(p => p.nome));
    setTurmas([...turmas, ...dadosPreview.turmas.filter(t => !turmasExistentes.has(t.nome))]);
    setDisciplinas([...disciplinas, ...dadosPreview.disciplinas.filter(d => !discExistentes.has(d.nome))]);
    setProfessores([...professores, ...dadosPreview.professores.filter(p => !profExistentes.has(p.nome))]);
    setDadosPreview(null);
    setUploadStatus({ tipo: 'sucesso', msg: `✅ Dados adicionados com sucesso!` });
    setSubAba('professores');
  };

  // Professores filtrados
  const professoresFiltrados = professores.filter(p =>
    p.nome.toLowerCase().includes(buscaProfessor.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Sub-abas */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
        {[
          { id: 'upload' as SubAba, label: 'Upload Excel', icon: '📤' },
          { id: 'turmas' as SubAba, label: 'Turmas', icon: '🏫', count: turmas.length },
          { id: 'disciplinas' as SubAba, label: 'Disciplinas', icon: '📚', count: disciplinas.length },
          { id: 'professores' as SubAba, label: 'Professores', icon: '👨‍🏫', count: professores.length },
          { id: 'horarios' as SubAba, label: 'Horários', icon: '🕐' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setSubAba(item.id)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm',
              subAba === item.id
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
            )}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-xs font-bold',
                subAba === item.id ? 'bg-white/30 text-white' : 'bg-blue-100 text-blue-700'
              )}>
                {item.count}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={limparTodosDados}
          className="ml-auto px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium border border-red-200 text-sm flex items-center gap-1"
        >
          🗑️ Limpar Tudo
        </button>
      </div>

      {/* ============ ABA UPLOAD ============ */}
      {subAba === 'upload' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xl">📤</div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Importar Planilha Excel</h2>
              <p className="text-sm text-gray-500">Carregue suas atribuições de aulas automaticamente</p>
            </div>
          </div>

          {/* Formato esperado */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-blue-800 flex items-center gap-2">📋 Formato esperado da planilha:</h3>
            <div className="overflow-x-auto rounded-lg shadow-sm">
              <table className="text-sm border-collapse w-full">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    {['Professor', 'Turma', 'Qde.Aulas', 'Disciplina'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Maria Silva', '6º A', '5', 'Matemática'],
                    ['Maria Silva', '7º B', '4', 'Matemática'],
                    ['João Santos', '6º A', '6', 'Português'],
                    ['João Santos', '6º B', '6', 'Português'],
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50/50'}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-1.5 border-b border-blue-100 text-gray-700">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
              <div className="bg-white/70 rounded-lg p-2">
                <p className="font-semibold mb-1">Colunas aceitas:</p>
                <p>• <b>Professor:</b> Professor, Prof, Nome</p>
                <p>• <b>Turma:</b> Turma, Classe, Sala</p>
                <p>• <b>Qtde:</b> Qde.Aulas, Qtde.Aulas, Quantidade</p>
                <p>• <b>Disciplina:</b> Disciplina, dis, Disc</p>
              </div>
              <div className="bg-white/70 rounded-lg p-2">
                <p className="font-semibold mb-1">⚠️ Atenção:</p>
                <p>Não diferencia maiúsculas/minúsculas.</p>
                <p>Se a quantidade não for encontrada, o sistema atribui <b>1 aula</b> por linha.</p>
              </div>
            </div>
          </div>

          {/* Área de upload */}
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-10 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) processarExcel(f); e.target.value = ''; }}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform">
              📁
            </div>
            <p className="text-lg font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
              Clique para selecionar o arquivo Excel
            </p>
            <p className="text-sm text-gray-400 mt-1">Formatos aceitos: .xlsx, .xls, .csv</p>
          </div>

          {/* Status do upload */}
          {uploadStatus.msg && (
            <div className={cn(
              'p-4 rounded-xl border font-medium',
              uploadStatus.tipo === 'sucesso' ? 'bg-green-50 border-green-200 text-green-800' :
              uploadStatus.tipo === 'erro' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-yellow-50 border-yellow-200 text-yellow-800'
            )}>
              {uploadStatus.msg}
            </div>
          )}

          {/* Prévia dos dados */}
          {dadosPreview && (
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-3 text-white font-semibold flex items-center gap-2">
                📊 Prévia dos dados — confirme antes de importar
              </div>

              {/* Contadores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-gray-200">
                {[
                  { label: 'Professores', value: dadosPreview.professores.length, color: 'bg-blue-50 text-blue-700' },
                  { label: 'Disciplinas', value: dadosPreview.disciplinas.length, color: 'bg-green-50 text-green-700' },
                  { label: 'Turmas', value: dadosPreview.turmas.length, color: 'bg-purple-50 text-purple-700' },
                  { label: 'Total de Aulas', value: dadosPreview.professores.reduce((s, p) => s + p.aulasSemanais, 0), color: 'bg-orange-50 text-orange-700' },
                ].map((item, i) => (
                  <div key={i} className={cn('p-4 text-center border-r border-gray-200 last:border-r-0', item.color)}>
                    <p className="text-3xl font-bold">{item.value}</p>
                    <p className="text-sm font-medium mt-1">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Cards dos professores na prévia */}
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto bg-gray-50">
                <p className="text-sm font-semibold text-gray-600 mb-2">👨‍🏫 Professores e atribuições encontrados:</p>
                {dadosPreview.professores.map((prof, profIdx) => {
                  const cor = CORES_CARDS[profIdx % CORES_CARDS.length];
                  return (
                    <div key={prof.id} className={cn('rounded-xl border overflow-hidden', cor.border)}>
                      {/* Header do card */}
                      <div className={cn('px-4 py-2 flex items-center gap-3', cor.light)}>
                        <div className={cn('w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold', cor.bg)}>
                          {getIniciais(prof.nome)}
                        </div>
                        <span className={cn('font-semibold text-sm', cor.text)}>{prof.nome}</span>
                        <span className={cn('ml-auto px-2 py-0.5 rounded-full text-xs font-bold', cor.badge)}>
                          {prof.aulasSemanais} aulas
                        </span>
                      </div>
                      {/* Atribuições */}
                      <div className="px-4 py-2 bg-white grid grid-cols-1 md:grid-cols-2 gap-1">
                        {prof.atribuicoes.map((attr, i) => {
                          const disc = dadosPreview.disciplinas.find(d => d.id === attr.disciplinaId);
                          const turma = dadosPreview.turmas.find(t => t.id === attr.turmaId);
                          return (
                            <div key={i} className="flex items-center gap-2 text-xs py-0.5">
                              <span className={cn('px-1.5 py-0.5 rounded font-bold', cor.badge)}>{attr.aulasAtribuidas}x</span>
                              <span className="text-gray-700 font-medium">{disc?.nome}</span>
                              <span className="text-gray-400">—</span>
                              <span className="text-gray-500">{turma?.nome}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 p-4 border-t border-gray-200 bg-white">
                <button
                  onClick={confirmarImportacao}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold transition-all shadow-md"
                >
                  ✅ Substituir todos os dados
                </button>
                <button
                  onClick={adicionarImportacao}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold transition-all shadow-md"
                >
                  ➕ Adicionar aos existentes
                </button>
                <button
                  onClick={() => { setDadosPreview(null); setUploadStatus({ tipo: '', msg: '' }); }}
                  className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-medium transition-all"
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ ABA TURMAS ============ */}
      {subAba === 'turmas' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xl">🏫</div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Turmas</h2>
              <p className="text-sm text-gray-500">{turmas.length} turma{turmas.length !== 1 ? 's' : ''} cadastrada{turmas.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="flex gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Nome da Turma</label>
              <input
                type="text"
                value={novaTurma.nome}
                onChange={(e) => setNovaTurma({ ...novaTurma, nome: e.target.value })}
                placeholder="Ex: 6º A"
                onKeyDown={(e) => e.key === 'Enter' && adicionarTurma()}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Ano</label>
              <select
                value={novaTurma.ano}
                onChange={(e) => setNovaTurma({ ...novaTurma, ano: parseInt(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
              >
                {[6, 7, 8, 9].map(a => <option key={a} value={a}>{a}º ano</option>)}
              </select>
            </div>
            <button onClick={adicionarTurma} className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-semibold shadow-md transition-all">
              ➕ Adicionar
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {turmas
              .sort((a, b) => a.nome.localeCompare(b.nome))
              .map((turma, idx) => {
                const cores = ['from-purple-500 to-purple-700', 'from-blue-500 to-blue-700', 'from-emerald-500 to-emerald-700', 'from-rose-500 to-rose-700'];
                const cor = cores[idx % cores.length];
                return (
                  <div key={turma.id} className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-shadow group relative">
                    <div className={cn('w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg', cor)}>
                      {turma.ano}º
                    </div>
                    <p className="font-semibold text-gray-800 text-sm text-center">{turma.nome}</p>
                    <button
                      onClick={() => removerTurma(turma.id)}
                      className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-500 hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-all"
                    >✕</button>
                  </div>
                );
              })}
          </div>
          {turmas.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🏫</p>
              <p>Nenhuma turma cadastrada ainda.</p>
            </div>
          )}
        </div>
      )}

      {/* ============ ABA DISCIPLINAS ============ */}
      {subAba === 'disciplinas' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xl">📚</div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Disciplinas</h2>
              <p className="text-sm text-gray-500">{disciplinas.length} disciplina{disciplinas.length !== 1 ? 's' : ''} cadastrada{disciplinas.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="flex gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Nome da Disciplina</label>
              <input
                type="text"
                value={novaDisciplina.nome}
                onChange={(e) => setNovaDisciplina({ ...novaDisciplina, nome: e.target.value })}
                placeholder="Ex: Matemática"
                onKeyDown={(e) => e.key === 'Enter' && adicionarDisciplina()}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Abreviação</label>
              <input
                type="text"
                value={novaDisciplina.abreviacao}
                onChange={(e) => setNovaDisciplina({ ...novaDisciplina, abreviacao: e.target.value })}
                placeholder="Ex: MAT"
                maxLength={4}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 w-24 outline-none"
              />
            </div>
            <button onClick={adicionarDisciplina} className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-semibold shadow-md transition-all">
              ➕ Adicionar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {disciplinas
              .sort((a, b) => a.nome.localeCompare(b.nome))
              .map((disc, idx) => {
                const cores = [
                  'from-blue-500 to-blue-600', 'from-emerald-500 to-emerald-600',
                  'from-violet-500 to-violet-600', 'from-rose-500 to-rose-600',
                  'from-amber-500 to-amber-600', 'from-cyan-500 to-cyan-600',
                ];
                const cor = cores[idx % cores.length];
                return (
                  <div key={disc.id} className={cn(
                    'border rounded-xl p-4 flex items-start justify-between gap-3 shadow-sm hover:shadow-md transition-shadow',
                    disc.multiplosDocentes ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-white'
                  )}>
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold flex-shrink-0', cor)}>
                        {disc.abreviacao}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{disc.nome}</p>
                        <button
                          onClick={() => toggleMultiplosDocentes(disc.id)}
                          className={cn(
                            'mt-1.5 text-xs px-2 py-1 rounded-full border font-medium transition-all',
                            disc.multiplosDocentes
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-500 border-gray-300 hover:border-purple-400'
                          )}
                        >
                          👥 {disc.multiplosDocentes ? 'Múltiplos Docentes ✓' : 'Único Docente'}
                        </button>
                      </div>
                    </div>
                    <button onClick={() => removerDisciplina(disc.id)} className="text-red-400 hover:text-red-600 text-lg flex-shrink-0" title="Remover">✕</button>
                  </div>
                );
              })}
          </div>
          {disciplinas.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📚</p>
              <p>Nenhuma disciplina cadastrada ainda.</p>
            </div>
          )}
        </div>
      )}

      {/* ============ ABA PROFESSORES — CARDS COM ACCORDION ============ */}
      {subAba === 'professores' && (
        <div className="space-y-4">
          {/* Cabeçalho e formulário de novo professor */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl">👨‍🏫</div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Professores</h2>
                <p className="text-sm text-gray-500">{professores.length} professor{professores.length !== 1 ? 'es' : ''} cadastrado{professores.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={novoProfessor.nome}
                onChange={(e) => setNovoProfessor({ nome: e.target.value })}
                placeholder="Nome completo do professor"
                onKeyDown={(e) => e.key === 'Enter' && adicionarProfessor()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              />
              <button
                onClick={adicionarProfessor}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-md transition-all whitespace-nowrap"
              >
                ➕ Adicionar
              </button>
            </div>

            {/* Barra de busca */}
            {professores.length > 3 && (
              <div className="mt-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  value={buscaProfessor}
                  onChange={(e) => setBuscaProfessor(e.target.value)}
                  placeholder="Buscar professor..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-300 outline-none text-sm"
                />
              </div>
            )}
          </div>

          {/* Resumo geral */}
          {professores.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total de Professores', value: professores.length, icon: '👨‍🏫', color: 'from-blue-500 to-blue-600' },
                { label: 'Total de Aulas Atribuídas', value: professores.reduce((s, p) => s + p.aulasSemanais, 0), icon: '📊', color: 'from-emerald-500 to-emerald-600' },
                { label: 'Média por Professor', value: professores.length ? Math.round(professores.reduce((s, p) => s + p.aulasSemanais, 0) / professores.length) : 0, icon: '📈', color: 'from-amber-500 to-amber-600' },
                { label: 'Acima do Limite', value: professores.filter(p => p.aulasSemanais > configuracoes.limiteAulasSemanais).length, icon: '⚠️', color: 'from-red-500 to-red-600' },
              ].map((item, i) => (
                <div key={i} className={cn('rounded-xl p-4 text-white bg-gradient-to-br shadow-md', item.color)}>
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="text-xs opacity-90 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Cards de professores com accordion */}
          <div className="space-y-3">
            {professoresFiltrados
              .sort((a, b) => a.nome.localeCompare(b.nome))
              .map((prof, profIdx) => {
                const isAberto = professoresAbertos.has(prof.id);
                const cor = CORES_CARDS[profIdx % CORES_CARDS.length];
                const aulasNaGrade = aulas.filter(a => a.professorId === prof.id).length;
                const _totalAulas = aulasNaGrade + prof.aulasExtras; void _totalAulas;
                const percentual = Math.min(100, Math.round((prof.aulasSemanais / configuracoes.limiteAulasSemanais) * 100));
                const acimaDolimite = prof.aulasSemanais > configuracoes.limiteAulasSemanais;

                return (
                  <div
                    key={prof.id}
                    className={cn(
                      'rounded-xl overflow-hidden shadow-sm transition-all duration-200',
                      isAberto ? 'shadow-lg ring-2 ring-blue-200' : 'hover:shadow-md',
                      'border',
                      isAberto ? cor.border : 'border-gray-200'
                    )}
                  >
                    {/* CABEÇALHO DO CARD — clicável */}
                    <div
                      className={cn(
                        'flex items-center gap-4 p-4 cursor-pointer transition-all select-none',
                        isAberto
                          ? `bg-gradient-to-r ${cor.bg} text-white`
                          : 'bg-white hover:bg-gray-50'
                      )}
                      onClick={() => toggleProfessor(prof.id)}
                    >
                      {/* Avatar com iniciais */}
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md',
                        isAberto
                          ? 'bg-white/20 text-white'
                          : `bg-gradient-to-br ${cor.bg} text-white`
                      )}>
                        {getIniciais(prof.nome)}
                      </div>

                      {/* Nome e info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={cn('font-bold text-base truncate', isAberto ? 'text-white' : 'text-gray-800')}>
                          {prof.nome}
                        </h3>
                        <div className={cn('flex items-center gap-3 text-xs mt-0.5', isAberto ? 'text-white/80' : 'text-gray-500')}>
                          <span>📚 {prof.atribuicoes.length} atribuições</span>
                          <span>•</span>
                          <span>🏫 {[...new Set(prof.atribuicoes.map(a => a.turmaId))].length} turmas</span>
                          <span>•</span>
                          <span>{prof.disciplinas.length} disciplinas</span>
                        </div>

                        {/* Barra de progresso de aulas */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className={cn('flex-1 h-1.5 rounded-full', isAberto ? 'bg-white/30' : 'bg-gray-200')}>
                            <div
                              className={cn('h-full rounded-full transition-all', acimaDolimite ? 'bg-red-500' : isAberto ? 'bg-white' : `bg-gradient-to-r ${cor.bg}`)}
                              style={{ width: `${percentual}%` }}
                            />
                          </div>
                          <span className={cn('text-xs font-semibold whitespace-nowrap', isAberto ? 'text-white' : acimaDolimite ? 'text-red-600' : cor.text)}>
                            {prof.aulasSemanais}/{configuracoes.limiteAulasSemanais} aulas
                          </span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {acimaDolimite && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                            ⚠️ Acima
                          </span>
                        )}
                        <span className={cn(
                          'px-3 py-1 rounded-full text-sm font-bold',
                          isAberto ? 'bg-white/20 text-white' : cor.badge
                        )}>
                          {prof.aulasSemanais}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); removerProfessor(prof.id); }}
                          className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all',
                            isAberto ? 'bg-white/20 text-white hover:bg-red-500' : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
                          )}
                          title="Remover professor"
                        >
                          ✕
                        </button>
                        <span className={cn('text-lg transition-transform duration-200', isAberto ? 'text-white rotate-180' : 'text-gray-400')}>
                          ▾
                        </span>
                      </div>
                    </div>

                    {/* CONTEÚDO EXPANDIDO */}
                    {isAberto && (
                      <div className={cn('border-t', cor.border)}>
                        {/* Tabela de atribuições */}
                        {prof.atribuicoes.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className={cn('text-xs uppercase tracking-wide', cor.light)}>
                                  <th className={cn('px-4 py-2 text-left font-semibold', cor.text)}>Disciplina</th>
                                  <th className={cn('px-4 py-2 text-left font-semibold', cor.text)}>Turma</th>
                                  <th className={cn('px-4 py-2 text-center font-semibold', cor.text)}>Atribuídas</th>
                                  <th className={cn('px-4 py-2 text-center font-semibold', cor.text)}>Na Grade</th>
                                  <th className={cn('px-4 py-2 text-center font-semibold', cor.text)}>Faltam</th>
                                  <th className="px-4 py-2 text-center w-16"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {prof.atribuicoes.map((attr, idx) => {
                                  const disc = disciplinas.find(d => d.id === attr.disciplinaId);
                                  const turma = turmas.find(t => t.id === attr.turmaId);
                                  const aulasNaGradeAttr = aulas.filter(a =>
                                    a.professorId === prof.id &&
                                    a.disciplinaId === attr.disciplinaId &&
                                    a.turmaId === attr.turmaId
                                  ).length;
                                  const faltam = attr.aulasAtribuidas - aulasNaGradeAttr;

                                  return (
                                    <tr key={idx} className="bg-white hover:bg-gray-50 transition-colors">
                                      <td className="px-4 py-2.5">
                                        <span className={cn('font-medium', cor.text)}>{disc?.nome || '—'}</span>
                                      </td>
                                      <td className="px-4 py-2.5 text-gray-600">{turma?.nome || '—'}</td>
                                      <td className="px-4 py-2.5 text-center">
                                        <input
                                          type="number"
                                          value={attr.aulasAtribuidas}
                                          onChange={(e) => atualizarQuantidadeAulas(prof.id, attr.disciplinaId, attr.turmaId, parseInt(e.target.value) || 1)}
                                          min={1} max={20}
                                          className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                                        />
                                      </td>
                                      <td className="px-4 py-2.5 text-center">
                                        <span className={cn('font-bold text-sm', aulasNaGradeAttr > 0 ? 'text-green-600' : 'text-gray-300')}>
                                          {aulasNaGradeAttr}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2.5 text-center">
                                        {faltam > 0
                                          ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">{faltam}</span>
                                          : <span className="text-green-500 font-bold text-sm">✓</span>
                                        }
                                      </td>
                                      <td className="px-4 py-2.5 text-center">
                                        <button
                                          onClick={() => removerAtribuicao(prof.id, attr.disciplinaId, attr.turmaId)}
                                          className="w-6 h-6 rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white text-xs transition-all"
                                          title="Remover"
                                        >✕</button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              {/* Rodapé com totais */}
                              <tfoot>
                                <tr className={cn('text-sm font-bold border-t-2', cor.light, cor.border)}>
                                  <td colSpan={2} className={cn('px-4 py-2 text-right', cor.text)}>TOTAL</td>
                                  <td className={cn('px-4 py-2 text-center', cor.text)}>{prof.aulasSemanais}</td>
                                  <td className="px-4 py-2 text-center text-green-600">{aulasNaGrade}</td>
                                  <td className="px-4 py-2 text-center text-orange-600">{Math.max(0, prof.aulasSemanais - aulasNaGrade)}</td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}

                        {/* Formulário para adicionar nova atribuição */}
                        <div className={cn('p-4 border-t', cor.border, cor.light)}>
                          <p className={cn('text-xs font-semibold uppercase tracking-wide mb-3', cor.text)}>➕ Adicionar nova atribuição</p>
                          <div className="flex flex-wrap gap-2 items-end">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Disciplina</label>
                              <select
                                value={novaAtribuicao.disciplinaId}
                                onChange={(e) => setNovaAtribuicao({ ...novaAtribuicao, disciplinaId: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[140px] outline-none focus:ring-2 focus:ring-blue-300"
                              >
                                <option value="">Selecione...</option>
                                {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Turma</label>
                              <select
                                value={novaAtribuicao.turmaId}
                                onChange={(e) => setNovaAtribuicao({ ...novaAtribuicao, turmaId: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[110px] outline-none focus:ring-2 focus:ring-blue-300"
                              >
                                <option value="">Selecione...</option>
                                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Qtd. Aulas</label>
                              <input
                                type="number"
                                value={novaAtribuicao.aulasAtribuidas}
                                onChange={(e) => setNovaAtribuicao({ ...novaAtribuicao, aulasAtribuidas: parseInt(e.target.value) || 1 })}
                                min={1} max={20}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center text-sm outline-none focus:ring-2 focus:ring-blue-300"
                              />
                            </div>
                            <button
                              onClick={() => adicionarAtribuicao(prof.id)}
                              disabled={!novaAtribuicao.disciplinaId || !novaAtribuicao.turmaId}
                              className={cn(
                                'px-4 py-2 rounded-lg font-semibold text-sm transition-all',
                                novaAtribuicao.disciplinaId && novaAtribuicao.turmaId
                                  ? `bg-gradient-to-r ${cor.bg} text-white shadow-md hover:opacity-90`
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              )}
                            >
                              ➕ Adicionar
                            </button>
                          </div>
                          {(disciplinas.length === 0 || turmas.length === 0) && (
                            <p className="text-xs text-amber-600 mt-2">⚠️ Cadastre disciplinas e turmas antes de adicionar atribuições.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {professores.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <p className="text-5xl mb-3">👨‍🏫</p>
              <p className="font-medium">Nenhum professor cadastrado ainda.</p>
              <p className="text-sm mt-1">Adicione manualmente acima ou importe do Excel.</p>
            </div>
          )}

          {buscaProfessor && professoresFiltrados.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">🔍</p>
              <p>Nenhum professor encontrado para "{buscaProfessor}"</p>
            </div>
          )}
        </div>
      )}

      {/* ============ ABA HORÁRIOS ============ */}
      {subAba === 'horarios' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl">🕐</div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Horários das Aulas</h2>
              <p className="text-sm text-gray-500">Configure os horários e o limite semanal</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="text-amber-600 text-2xl">⚙️</div>
            <label className="font-semibold text-gray-700">Limite de aulas semanais por professor:</label>
            <input
              type="number"
              value={configuracoes.limiteAulasSemanais}
              onChange={(e) => setConfiguracoes({ ...configuracoes, limiteAulasSemanais: parseInt(e.target.value) || 32 })}
              min={1} max={50}
              className="w-20 px-3 py-2 border border-amber-300 rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-amber-400 outline-none"
            />
            <span className="text-gray-500 font-medium">aulas/semana</span>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span>Aula</span><span>Início</span><span>Término</span><span>Duração</span>
            </div>
            {configuracoes.horarios.map((horario, index) => {
              const [hi, mi] = horario.inicio.split(':').map(Number);
              const [hf, mf] = horario.fim.split(':').map(Number);
              const duracao = (hf * 60 + mf) - (hi * 60 + mi);
              const ok = duracao === 50;
              return (
                <div key={horario.aula} className={cn(
                  'grid grid-cols-4 gap-3 items-center p-3 rounded-xl border transition-all',
                  ok ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
                )}>
                  <div className={cn('flex items-center gap-2 font-semibold', ok ? 'text-green-700' : 'text-orange-700')}>
                    <span className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs text-white', ok ? 'bg-green-500' : 'bg-orange-500')}>
                      {horario.aula}
                    </span>
                    <span className="text-sm">{horario.aula}ª aula</span>
                  </div>
                  <input
                    type="time"
                    value={horario.inicio}
                    onChange={(e) => atualizarHorario(index, 'inicio', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                  <input
                    type="time"
                    value={horario.fim}
                    onChange={(e) => atualizarHorario(index, 'fim', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                  <span className={cn('text-sm font-semibold', ok ? 'text-green-600' : 'text-orange-600')}>
                    {duracao} min {ok ? '✓' : '⚠️'}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400">* Cada aula deve ter 50 minutos de duração.</p>
        </div>
      )}
    </div>
  );
}
