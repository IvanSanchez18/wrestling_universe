import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) return null;

    return session ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;