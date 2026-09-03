// AuthGate.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import LoginPage from '../../views/auth/SchoolLogin';
import LoadingScreen from '../../components/LoadingScreen';

export default function AuthGate({ children }) {
    const [session, setSession] = useState(null);
    const [school, setSchool] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
            setSession(sess);
        });
        return () => listener.subscription.unsubscribe();
    }, []);

    useEffect(() => {
        console.log('session', session)
        if (!session) { setSchool(null); return; }
        const fetchSchool = async () => {
            const { data: school, error } = await supabase
                .from("schools")
                .select("*")
                .eq("user_id", session.user.id)
                .single();
            if (error || !school) return;
            setSchool(school);
        };
        fetchSchool();
    }, [session]);

    if (loading) return <LoadingScreen />;
    if (!session) return <LoginPage onLoggedIn={setSession} />;
    if (!school) return <LoadingScreen customTitle="Loading school profile..." />;

    return children({ session, school });
}