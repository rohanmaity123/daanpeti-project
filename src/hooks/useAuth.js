import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';


export function useAuth() {
  const [state, setState] = useState({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    /* get initial session */
    supabase.auth.getSession().then(({ data }) => {
      setState({
        user: data.session?.user ?? null,
        session: data.session ?? null,
        loading: false,
      });
    });

    /* listen for auth changes */
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}

/* sign in with Google */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}`,
    },
  });
  if (error) throw error;
}

/* sign out */
export async function signOut() {
  await supabase.auth.signOut();
}
