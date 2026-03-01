import { useState } from 'react';
import { Professor, Substituicao, Turma, Disciplina, HorarioAula } from '../types';
import { cn } from '../utils/cn';

interface HistoricoTabProps {
  professores: Professor[];
  substituicoes: Substituicao[];
  turmas: Turma[];
  disciplinas: Disciplina[];
  horarios: HorarioAula[];
}

export default function HistoricoTab({
  professores,
  substituicoes,
  turmas,
  disciplinas,
  horarios
}: HistoricoTabProps) {
  const [filtro, setFiltro] = useState<string>('todos');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'faltou' | 'substituto'>('todos');

  // Agrupar substituições por data
  const substituicoesPorData = substituicoes.reduce((acc, sub) => {
    if (!acc[sub.data]) {
      acc[sub.data] = [];
    }
    acc[sub.data].push(sub);
    return acc;
  }, {} as Record<string, Substituicao[]>);

  // Ordenar datas (mais recentes primeiro)
  const datasOrdenadas = Object.keys(substituicoesPorData).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Filtrar substituições
  const substituicoesFiltradas = substituicoes.filter(sub => {
    if (filtro === 'todos') return true;
    if (tipoFiltro === 'faltou') return sub.professorFaltouId === filtro;
    if (tipoFiltro === 'substituto') return sub.professorSubstitutoId === filtro;
    return sub.professorFaltouId === filtro || sub.professorSubstitutoId === filtro;
  });

  // Estatísticas
  const estatisticas = professores.map(prof => {
    const vezesFaltou = substituicoes.filter(s => s.professorFaltouId === prof.id).length;
    const vezesSubstituiu = substituicoes.filter(s => s.professorSubstitutoId === prof.id).length;
    return {
      professor: prof,
      vezesFaltou,
      vezesSubstituiu
    };
  }).sort((a, b) => b.vezesSubstituiu - a.vezesSubstituiu);

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr + 'T00:00:00');
    return data.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long',
      year: 'numeric'
    });
  };

  if (substituicoes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-500 text-lg">
            📋 Nenhuma substituição registrada ainda.
          </p>
          <p className="text-gray-400 mt-2">
            Use a aba "Substituição" para registrar faltas e gerar escalas.
          </p>
        </div>

        {/* Estatísticas mesmo sem substituições */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Estatísticas dos Professores</h3>
          <p className="text-gray-500 text-center py-4">
            As estatísticas aparecerão aqui quando houver substituições registradas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por professor</label>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="todos">Todos</option>
            {professores.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        {filtro !== 'todos' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTipoFiltro('todos')}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm',
                  tipoFiltro === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                )}
              >
                Todos
              </button>
              <button
                onClick={() => setTipoFiltro('faltou')}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm',
                  tipoFiltro === 'faltou' ? 'bg-red-600 text-white' : 'bg-gray-100'
                )}
              >
                Faltou
              </button>
              <button
                onClick={() => setTipoFiltro('substituto')}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm',
                  tipoFiltro === 'substituto' ? 'bg-green-600 text-white' : 'bg-gray-100'
                )}
              >
                Substituiu
              </button>
            </div>
          </div>
        )}

        <div className="ml-auto text-sm text-gray-600">
          Total: {substituicoesFiltradas.length} substituição(ões)
        </div>
      </div>

      {/* Lista de substituições por data */}
      <div className="space-y-4">
        {datasOrdenadas.map(data => {
          const subsNaData = substituicoesPorData[data].filter(sub => {
            if (filtro === 'todos') return true;
            if (tipoFiltro === 'faltou') return sub.professorFaltouId === filtro;
            if (tipoFiltro === 'substituto') return sub.professorSubstitutoId === filtro;
            return sub.professorFaltouId === filtro || sub.professorSubstitutoId === filtro;
          });

          if (subsNaData.length === 0) return null;

          return (
            <div key={data} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-blue-600 text-white px-4 py-2 font-medium">
                📅 {formatarData(data)}
              </div>
              <div className="divide-y">
                {subsNaData.map(sub => {
                  const profFaltou = professores.find(p => p.id === sub.professorFaltouId);
                  const profSubstituto = professores.find(p => p.id === sub.professorSubstitutoId);
                  const turma = turmas.find(t => t.id === sub.turmaId);
                  const disciplina = disciplinas.find(d => d.id === sub.disciplinaId);
                  const horario = horarios.find(h => h.aula === sub.horario);

                  return (
                    <div key={sub.id} className="p-4 hover:bg-gray-50">
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold">
                          {sub.horario}ª aula
                        </div>
                        {horario && (
                          <span className="text-sm text-gray-500">
                            {horario.inicio} - {horario.fim}
                          </span>
                        )}
                        <div className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-sm">
                          {turma?.nome}
                        </div>
                        <div className="font-medium">{disciplina?.nome}</div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="text-red-600">
                          ❌ {profFaltou?.nome || 'Professor removido'} faltou
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="text-green-600">
                          ✅ {profSubstituto?.nome || 'Professor removido'} substituiu
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estatísticas */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Estatísticas dos Professores</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2">Professor</th>
                <th className="px-4 py-2 text-center">Vezes que faltou</th>
                <th className="px-4 py-2 text-center">Vezes que substituiu</th>
                <th className="px-4 py-2 text-center">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {estatisticas.map(({ professor, vezesFaltou, vezesSubstituiu }) => {
                const saldo = vezesSubstituiu - vezesFaltou;
                return (
                  <tr key={professor.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{professor.nome}</td>
                    <td className="px-4 py-2 text-center">
                      {vezesFaltou > 0 ? (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          {vezesFaltou}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {vezesSubstituiu > 0 ? (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          {vezesSubstituiu}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={cn(
                        'px-2 py-0.5 rounded font-bold',
                        saldo > 0 ? 'bg-green-100 text-green-700' :
                        saldo < 0 ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      )}>
                        {saldo > 0 ? '+' : ''}{saldo}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          * Saldo = Vezes que substituiu - Vezes que faltou (positivo indica mais substituições)
        </p>
      </div>
    </div>
  );
}
