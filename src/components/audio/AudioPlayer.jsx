import { forwardRef, useEffect, useState } from "react";
import "./AudioPlayer.scss";
import { useMusicVolume } from "../../context/MusicVolumeContext";

export const AudioPlayer = forwardRef(
  (
    {
      src,
      title,
      artist,
      coverUrl,
      autoPlay = false,
      onPrev,
      onNext,
      showMeta = true,
    },
    ref
  ) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const { musicVolume } = useMusicVolume();

    useEffect(() => {
      const audio = ref?.current;
      if (!audio || musicVolume == null) return;
      audio.volume = Math.max(0, Math.min(1, musicVolume / 100));
    }, [musicVolume, ref]);

    useEffect(() => {
      const audio = ref?.current;
      if (!audio) return;

      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      const onTimeUpdate = () => {
        const percent = (audio.currentTime / (audio.duration || 1)) * 100;
        setProgress(percent);
      };

      audio.addEventListener("play", onPlay);
      audio.addEventListener("pause", onPause);
      audio.addEventListener("timeupdate", onTimeUpdate);

      return () => {
        audio.removeEventListener("play", onPlay);
        audio.removeEventListener("pause", onPause);
        audio.removeEventListener("timeupdate", onTimeUpdate);
      };
    }, [ref]);

    useEffect(() => {
      const audio = ref?.current;
      if (!audio) return;

      const handleEnded = () => onNext?.();
      audio.addEventListener("ended", handleEnded);

      return () => audio.removeEventListener("ended", handleEnded);
    }, [ref, onNext]);

    useEffect(() => {
      const audio = ref?.current;
      if (!audio) return;
      audio.play().catch(() => { });
    }, [src]);

    const togglePlay = () => {
      const audio = ref?.current;
      if (!audio) return;
      audio.paused ? audio.play() : audio.pause();
    };

    const seek = (e) => {
      const audio = ref?.current;
      if (!audio) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      audio.currentTime = (clickX / rect.width) * audio.duration;
    };

    if (!src) return null;

    return (
      <>
        <audio ref={ref} src={src} autoPlay={autoPlay} />

        <div
          className="audio-player"
          style={{ display: showMeta ? "flex" : "none" }}
        >
          <div className="audio-player__meta">
            {coverUrl && (
              <img src={coverUrl} alt="" className="audio-player__cover" />
            )}
            <div className="audio-player__text">
              <span className="audio-player__title">{title}</span>
              {artist && <span className="audio-player__artist">{artist}</span>}
            </div>
          </div>

          <div className="audio-player__controls">
            <button onClick={onPrev}>
              <i className="fas fa-backward"></i>
            </button>
            <button onClick={togglePlay}>
              {isPlaying ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
            </button>
            <button onClick={onNext}>
              <i className="fas fa-forward"></i>
            </button>
          </div>

          <div className="audio-player__progress" onClick={seek}>
            <div
              className="audio-player__progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </>
    );
  }
);

AudioPlayer.displayName = "AudioPlayer";