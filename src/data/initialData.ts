import { Professor, Aula, Substituicao, Turma, Disciplina, HorarioAula } from '../types';

// Dados vazios - sem exemplos
export const turmasIniciais: Turma[] = [];

export const disciplinasIniciais: Disciplina[] = [];

export const professoresIniciais: Professor[] = [];

export const aulasIniciais: Aula[] = [];

export const substituicoesIniciais: Substituicao[] = [];

// Horários padrão para aulas de 50 minutos (período integral de 9 horas)
export const horariosIniciais: HorarioAula[] = [
  { aula: 1, inicio: '07:00', fim: '07:50' },
  { aula: 2, inicio: '07:50', fim: '08:40' },
  { aula: 3, inicio: '08:40', fim: '09:30' },
  { aula: 4, inicio: '09:50', fim: '10:40' },  // Intervalo de 20 min
  { aula: 5, inicio: '10:40', fim: '11:30' },
  { aula: 6, inicio: '11:30', fim: '12:20' },
  { aula: 7, inicio: '13:20', fim: '14:10' },  // Almoço de 1 hora
  { aula: 8, inicio: '14:10', fim: '15:00' },
  { aula: 9, inicio: '15:00', fim: '15:50' },
];
