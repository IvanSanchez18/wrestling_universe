import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { getOnlyEnabledTracksForUser } from "../services/apiService";
import { shuffleArray } from "../utils/shuffle";

export const useUserPlaylist = () => {
    const [playlist, setPlaylist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initPlaylist = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.user) {
                setPlaylist([]);
                setLoading(false);
                return;
            }

            const tracks = await getOnlyEnabledTracksForUser(session.user.id);
            const shuffled = shuffleArray(tracks);

            setPlaylist(shuffled);
            setLoading(false);
        };

        initPlaylist();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
            initPlaylist();
        });

        return () => subscription.unsubscribe();
    }, []);

    return { playlist, loading };
};