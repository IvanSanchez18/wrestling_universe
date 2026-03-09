import { useState, useEffect } from "react";
import SongCard from "../../components/jukebox/SongCard";
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import { getEnabledTracksForUser, updateTrackEnabledForUser } from "../../services/apiService";
import "./jukebox.scss";
import { supabase } from "../../services/supabaseClient";
import { useOutletContext } from "react-router-dom";

const Jukebox = () => {
  const { playSongExternally } = useOutletContext();
  const [songs, setSongs] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const tracks = await getEnabledTracksForUser(user.id);
        tracks.sort((a, b) => a.title.localeCompare(b.title));

        setSongs(tracks);
        setPlaylist(tracks.filter((t) => t.enabled).map((t) => t.id));
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const toggleSong = async (id) => {
    const isSelected = playlist.includes(id);

    if (isSelected && playlist.length === 1) {
      return;
    }

    setPlaylist((prev) =>
      isSelected ? prev.filter((songId) => songId !== id) : [...prev, id]
    );

    await updateTrackEnabledForUser(id, !isSelected);
  };

  return (
    <>
      <LoadingScreen active={loading} />

      {!loading && (
        <div className="jukebox">
          {songs.map((song) => {
            const isSelected = playlist.includes(song.id);
            const isLastSelected = isSelected && playlist.length === 1;

            return (
              <SongCard
                key={song.id}
                song={song}
                selected={isSelected}
                disabled={isLastSelected}
                onToggle={toggleSong}
                onPlay={() => playSongExternally(song)}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export default Jukebox;