export interface Turma {
  id: string;
  nome: string; // Ex: "6º A", "7º B"
  ano: number;  // 6, 7, 8 ou 9
}

export interface Disciplina {
  id: string;
  nome: string;
  abreviacao: string;
  multiplosDocentes?: boolean; // true para disciplinas como Eletiva (2+ professores simultâneos)
}

// Atribuição específica: Professor + Disciplina + Turma + Quantidade de aulas
export interface Atribuicao {
  disciplinaId: string;
  turmaId: string;
  aulasAtribuidas: number; // Quantidade de aulas dessa disciplina nessa turma
}

export interface Professor {
  id: string;
  nome: string;
  disciplinas: string[]; // IDs das disciplinas (mantido para compatibilidade)
  turmas: string[]; // IDs das turmas (mantido para compatibilidade)
  atribuicoes: Atribuicao[]; // Atribuições específicas com quantidade de aulas
  aulasSemanais: number; // Total de aulas fixas na grade (calculado das atribuições)
  aulasExtras: number; // Aulas de substituição na semana
}

export interface Aula {
  id: string;
  professorId: string;
  turmaId: string;
  disciplinaId: string;
  diaSemana: number; // 1-5 (segunda a sexta)
  horario: number;   // 1-9 (número da aula)
  compartilhada?: boolean; // true quando a disciplina tem múltiplos professores no mesmo slot
}

export interface Substituicao {
  id: string;
  data: string;
  aulaId: string;
  professorFaltouId: string;
  professorSubstitutoId: string;
  horario: number;
  turmaId: string;
  disciplinaId: string;
  confirmada: boolean;
}

export interface HorarioAula {
  aula: number;
  inicio: string;
  fim: string;
}

export interface AreaConhecimento {
  id: string;
  nome: string;
  cor: string;         // classe de cor Tailwind (ex: 'indigo', 'emerald')
  icone: string;       // emoji
  disciplinaIds: string[];   // disciplinas pertencentes à área
  professorIds: string[];    // professores alocados na área
  articuladorId: string | null; // professor articulador responsável
  descricao?: string;
}

export interface Configuracoes {
  limiteAulasSemanais: number;
  horarios: HorarioAula[];
}

export const DIAS_SEMANA = [
  { valor: 1, nome: 'Segunda-feira' },
  { valor: 2, nome: 'Terça-feira' },
  { valor: 3, nome: 'Quarta-feira' },
  { valor: 4, nome: 'Quinta-feira' },
  { valor: 5, nome: 'Sexta-feira' },
];
