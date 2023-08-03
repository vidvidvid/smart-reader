import { createClient } from '@supabase/supabase-js';
import { createContext, useContext, useState, useEffect } from 'react';

// Create a context
const SupabaseContext = createContext();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

function SupabaseProvider({ children }) {
  const [token, setToken] = useState(null);
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  // Update headers whenever the token changes
  useEffect(() => {
    console.log('New token', token);
    if (token) {
      supabase.realtime.accessToken = token;
    }
  }, [token]);

  return (
    <SupabaseContext.Provider value={{ supabase, setToken }}>
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
