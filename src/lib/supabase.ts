import { createClient } from '@supabase/supabase-js';

// Lê as variáveis de ambiente do Vite
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Cria o cliente só se as variáveis estiverem configuradas
export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export const supabaseConfigurado = !!supabaseUrl && !!supabaseKey;
