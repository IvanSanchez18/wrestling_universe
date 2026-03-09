import { useTranslation } from "react-i18next";
import "../../pages/jukebox/jukebox.scss";

const SongCard = ({ song, selected, disabled, onToggle, onPlay }) => {
  const { t } = useTranslation("jukebox");

  return (
    <div className="song-card">
      <div className="song-image">
        <img src={song.cover_url} alt={song.title} />
        <label className={`corner-triangle ${disabled ? "disabled" : ""}`}>
          <input
            type="checkbox"
            checked={selected}
            disabled={disabled}
            onChange={() => onToggle(song.id)}
          />
          <i className="fas fa-check"></i>
        </label>
      </div>

      <div className="song-info">
        <h3>{song.title}</h3>
        <p>{song.artist}</p>
      </div>

      <div className="song-actions">
        <button onClick={onPlay}>
          <i className="fas fa-play"></i> {t("playNow")}
        </button>
      </div>
    </div>
  );
};

export default SongCard;