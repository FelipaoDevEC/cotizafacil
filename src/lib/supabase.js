
import { createClient } from "@supabase/supabase-js";

// Variables públicas configuradas en .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Comprobamos que existan las variables necesarias.
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Faltan las variables de entorno de Supabase. Revisa .env.local."
  );
}

// Cliente reutilizable para toda la aplicación.
export const supabase = createClient(supabaseUrl, supabaseKey);
