import { createClient } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';

// Create a context
const SupabaseContext = createContext();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Create the client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function SupabaseProvider({ children }) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}

export { SupabaseProvider, useSupabase };
