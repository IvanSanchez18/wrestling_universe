import { Outlet, useLocation } from "react-router-dom";
import { useUserPlaylist } from "../../hooks/useUserPlaylist";
import { useRef, useState, useEffect } from "react";
import { ThemeProvider } from "../../context/ThemeContext";
import { AudioPlayer } from "../audio/AudioPlayer";

const ProtectedLayout = () => {
  const { playlist, loading } = useUserPlaylist();
  const audioRef = useRef(null);
  const location = useLocation();
  const showSongCard = ["/jukebox", "/options"].includes(location.pathname);

  const [currentTrackId, setCurrentTrackId] = useState(
    () => localStorage.getItem("player:trackId")
  );

  const [temporaryTrack, setTemporaryTrack] = useState(null);
  const [resumeIndex, setResumeIndex] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!currentTrackId && playlist.length > 0) {
      setCurrentTrackId(playlist[0].id);
    }
  }, [playlist, currentTrackId]);

  useEffect(() => {
    if (currentTrackId) {
      localStorage.setItem("player:trackId", currentTrackId);
    }
  }, [currentTrackId]);

  const indexFromId = playlist.findIndex((t) => t.id === currentTrackId);
  const safeIndex = indexFromId >= 0 ? indexFromId : 0;
  const currentPlaylistSong = playlist[safeIndex];
  const currentSong = temporaryTrack ?? currentPlaylistSong;

  const playNext = () => {
    if (temporaryTrack) {
      setTemporaryTrack(null);
      const nextIndex = (resumeIndex + 1) % playlist.length;
      setCurrentTrackId(playlist[nextIndex].id);
      return;
    }

    if (playlist.length === 0) return;
    const nextIndex = (safeIndex + 1) % playlist.length;
    setCurrentTrackId(playlist[nextIndex].id);
  };

  const playPrevious = () => {
    if (temporaryTrack) {
      setTemporaryTrack(null);
      setCurrentTrackId(playlist[resumeIndex].id);
      return;
    }

    if (playlist.length === 0) return;
    const prevIndex = safeIndex === 0 ? playlist.length - 1 : safeIndex - 1;
    setCurrentTrackId(playlist[prevIndex].id);
  };

  useEffect(() => {
    if (!hasInteracted) {
      const handleInteraction = () => {
        setHasInteracted(true);
        audioRef.current?.play().catch(() => { });
        window.removeEventListener("click", handleInteraction);
        window.removeEventListener("keydown", handleInteraction);
      };

      window.addEventListener("click", handleInteraction);
      window.addEventListener("keydown", handleInteraction);

      return () => {
        window.removeEventListener("click", handleInteraction);
        window.removeEventListener("keydown", handleInteraction);
      };
    } else {
      audioRef.current?.play().catch(() => { });
    }
  }, [hasInteracted, currentSong]);

  const playSongExternally = (song) => {
    if (song.enabled) {
      const index = playlist.findIndex((t) => t.id === song.id);
      if (index !== -1) {
        setCurrentTrackId(song.id);
      }
      return;
    }

    setResumeIndex(safeIndex);
    setTemporaryTrack(song);
  };

  if (loading || playlist.length === 0) return null;

  return (
    <ThemeProvider>
      <Outlet context={{ playSongExternally }} />

      {currentSong && (
        <AudioPlayer
          ref={audioRef}
          src={currentSong.audio_url}
          title={currentSong.title}
          artist={currentSong.artist}
          coverUrl={currentSong.cover_url}
          onNext={playNext}
          onPrev={playPrevious}
          showMeta={showSongCard}
        />
      )}
    </ThemeProvider>
  );
};

export default ProtectedLayout;