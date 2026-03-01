import { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseConfigurado } from '../lib/supabase';
import {
  Professor, Aula, Substituicao, Turma,
  Disciplina, Configuracoes, AreaConhecimento,
} from '../types';
import { horariosIniciais } from '../data/initialData';

type GradeSlot = { professorId: string; disciplinaId: string; turmaId: string };
type Grade = Record<string, Record<number, GradeSlot[]>>;

export type StatusSync =
  | 'local'       // Sem Supabase configurado
  | 'conectando'  // Tentando conectar
  | 'sincronizado'// OK
  | 'salvando'    // Enviando dados
  | 'erro';       // Falha na conexão

export interface DadosApp {
  turmas: Turma[];
  disciplinas: Disciplina[];
  professores: Professor[];
  aulas: Aula[];
  substituicoes: Substituicao[];
  areas: AreaConhecimento[];
  gradeData: Grade;
  configuracoes: Configuracoes;
}

const ESCOLA_ID = 'escola_principal'; // chave única — pode virar multi-escola futuramente

// ─── Helpers localStorage ─────────────────────────────────────────────────────
function ls<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

const configPadrao: Configuracoes = { limiteAulasSemanais: 32, horarios: horariosIniciais };

function carregarLocal(): DadosApp {
  return {
    turmas:       ls<Turma[]>('turmas', []),
    disciplinas:  ls<Disciplina[]>('disciplinas', []),
    professores:  ls<Professor[]>('professores', []),
    aulas:        ls<Aula[]>('aulas', []),
    substituicoes:ls<Substituicao[]>('substituicoes', []),
    areas:        ls<AreaConhecimento[]>('areas', []),
    gradeData:    ls<Grade>('gradeHoraria', {}),
    configuracoes:ls<Configuracoes>('configuracoes', configPadrao),
  };
}

function salvarLocal(dados: DadosApp) {
  lsSet('turmas',       dados.turmas);
  lsSet('disciplinas',  dados.disciplinas);
  lsSet('professores',  dados.professores);
  lsSet('aulas',        dados.aulas);
  lsSet('substituicoes',dados.substituicoes);
  lsSet('areas',        dados.areas);
  lsSet('gradeHoraria', dados.gradeData);
  lsSet('configuracoes',dados.configuracoes);
}

// ─── Hook principal ───────────────────────────────────────────────────────────
export function useSupabase() {
  const [dados, setDadosInterno] = useState<DadosApp>(carregarLocal);
  const [status, setStatus]      = useState<StatusSync>(supabaseConfigurado ? 'conectando' : 'local');
  const [ultimoSync, setUltimoSync] = useState<string>('');
  const [erroMsg, setErroMsg]    = useState<string>('');

  // ── Salvar no Supabase ──────────────────────────────────────────────────────
  const syncSupabase = useCallback(async (payload: DadosApp) => {
    if (!supabase || !supabaseConfigurado) return;
    setStatus('salvando');
    try {
      const { error } = await supabase
        .from('escola_dados')
        .upsert({
          id: ESCOLA_ID,
          dados: payload,
          atualizado_em: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) throw error;
      const agora = new Date().toLocaleString('pt-BR');
      setUltimoSync(agora);
      lsSet('ultimoSync', agora);
      setStatus('sincronizado');
      setErroMsg('');
    } catch (err) {
      console.error('[Supabase] Erro ao salvar:', err);
      setStatus('erro');
      setErroMsg(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, []);

  // ── Carregar do Supabase ────────────────────────────────────────────────────
  const carregarSupabase = useCallback(async () => {
    if (!supabase || !supabaseConfigurado) { setStatus('local'); return; }
    setStatus('conectando');
    try {
      const { data, error } = await supabase
        .from('escola_dados')
        .select('dados, atualizado_em')
        .eq('id', ESCOLA_ID)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found (primeira vez)

      if (data?.dados) {
        const remoto = data.dados as DadosApp;
        setDadosInterno(remoto);
        salvarLocal(remoto);
        const agora = new Date(data.atualizado_em).toLocaleString('pt-BR');
        setUltimoSync(agora);
        lsSet('ultimoSync', agora);
      }
      setStatus('sincronizado');
      setErroMsg('');
    } catch (err) {
      console.error('[Supabase] Erro ao carregar:', err);
      setStatus('erro');
      setErroMsg(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, []);

  // ── Carregar na montagem ────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('ultimoSync');
    if (saved) setUltimoSync(saved);
    if (supabaseConfigurado) carregarSupabase();
  }, [carregarSupabase]);

  // ── Debounce para não spammar o Supabase ─────────────────────────────────--
  useEffect(() => {
    const timer = setTimeout(() => {
      if (supabaseConfigurado) syncSupabase(dados);
    }, 1500);
    return () => clearTimeout(timer);
  }, [dados, syncSupabase]);

  // ── Setter principal — atualiza estado + localStorage + Supabase ────────────
  const setDados = useCallback((updater: DadosApp | ((prev: DadosApp) => DadosApp)) => {
    setDadosInterno(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      salvarLocal(next);
      return next;
    });
  }, []);

  // ── Helpers para cada entidade ──────────────────────────────────────────────
  const setTurmas        = (v: Turma[]           | ((p: Turma[])           => Turma[]))           => setDados(p => ({ ...p, turmas:        typeof v === 'function' ? v(p.turmas)        : v }));
  const setDisciplinas   = (v: Disciplina[]      | ((p: Disciplina[])      => Disciplina[]))      => setDados(p => ({ ...p, disciplinas:   typeof v === 'function' ? v(p.disciplinas)   : v }));
  const setProfessores   = (v: Professor[]       | ((p: Professor[])       => Professor[]))       => setDados(p => ({ ...p, professores:   typeof v === 'function' ? v(p.professores)   : v }));
  const setAulas         = (v: Aula[]            | ((p: Aula[])            => Aula[]))            => setDados(p => ({ ...p, aulas:         typeof v === 'function' ? v(p.aulas)         : v }));
  const setSubstituicoes = (v: Substituicao[]    | ((p: Substituicao[])    => Substituicao[]))    => setDados(p => ({ ...p, substituicoes: typeof v === 'function' ? v(p.substituicoes) : v }));
  const setAreas         = (v: AreaConhecimento[] | ((p: AreaConhecimento[]) => AreaConhecimento[])) => setDados(p => ({ ...p, areas:         typeof v === 'function' ? v(p.areas)         : v }));
  const setGradeData     = (v: Grade             | ((p: Grade)             => Grade))             => setDados(p => ({ ...p, gradeData:     typeof v === 'function' ? v(p.gradeData)     : v }));
  const setConfiguracoes = (v: Configuracoes     | ((p: Configuracoes)     => Configuracoes))     => setDados(p => ({ ...p, configuracoes: typeof v === 'function' ? v(p.configuracoes) : v }));

  // ── Importar backup completo ────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const importarDados = (raw: any) => {
    const novo: DadosApp = {
      turmas:        raw.turmas        ?? [],
      disciplinas:   raw.disciplinas   ?? [],
      professores:   raw.professores   ?? [],
      aulas:         raw.aulas         ?? [],
      substituicoes: raw.substituicoes ?? [],
      areas:         raw.areas         ?? [],
      gradeData:     raw.gradeData     ?? {},
      configuracoes: raw.configuracoes ?? configPadrao,
    };
    setDados(novo);
  };

  // ── Limpar tudo ─────────────────────────────────────────────────────────────
  const limparTudo = async () => {
    const vazio: DadosApp = {
      turmas: [], disciplinas: [], professores: [], aulas: [],
      substituicoes: [], areas: [], gradeData: {},
      configuracoes: configPadrao,
    };
    setDados(vazio);
    if (supabase && supabaseConfigurado) await syncSupabase(vazio);
  };

  // ── Forçar sync manual ──────────────────────────────────────────────────────
  const forcarSync = () => {
    if (supabaseConfigurado) carregarSupabase();
  };

  return {
    // dados
    turmas:        dados.turmas,
    disciplinas:   dados.disciplinas,
    professores:   dados.professores,
    aulas:         dados.aulas,
    substituicoes: dados.substituicoes,
    areas:         dados.areas,
    gradeData:     dados.gradeData,
    configuracoes: dados.configuracoes,
    // setters
    setTurmas, setDisciplinas, setProfessores, setAulas,
    setSubstituicoes, setAreas, setGradeData, setConfiguracoes,
    // ações
    importarDados, limparTudo, forcarSync,
    dadosAtuais: dados,
    // status
    status, ultimoSync, erroMsg,
    supabaseAtivo: supabaseConfigurado,
  };
}
