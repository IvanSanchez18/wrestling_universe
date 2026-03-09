import { useState, useRef, useEffect } from "react";
import Swal from 'sweetalert2';
import { uploadFileToStorage, getTrackById, saveTrack, deleteTrack, saveWrestler, deleteWrestler } from "../../services/apiService";
import "./AdminWrestlerForm.scss";

export default function AdminWrestlerForm({ wrestler, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "", brand: "", gender: "male",
    power: 50, technique: 50, charisma: 50, speed: 50, durability: 50, ring_iq: 50
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [trackData, setTrackData] = useState({ id: null, title: "", artist: "", audio_url: "", duration: 0 });
  const [audioFile, setAudioFile] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [trackToDelete, setTrackToDelete] = useState(null);

  const currentOverall = Math.round(
    (Number(formData.power) + Number(formData.technique) + Number(formData.charisma) +
      Number(formData.speed) + Number(formData.durability) + Number(formData.ring_iq)) / 6
  ) || 0;

  useEffect(() => {
    if (wrestler) {
      setFormData({
        name: wrestler.name || "",
        brand: wrestler.brand || "",
        gender: wrestler.gender || "male",
        power: wrestler.power || 50, technique: wrestler.technique || 50,
        charisma: wrestler.charisma || 50, speed: wrestler.speed || 50,
        durability: wrestler.durability || 50, ring_iq: wrestler.ring_iq || 50
      });
      setImagePreview(wrestler.image_url || "");

      if (wrestler.theme_track_id) {
        getTrackById(wrestler.theme_track_id)
          .then(track => {
            if (track) setTrackData(track);
          })
          .catch(console.error);
      }
    }
  }, [wrestler]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageSelection(file);
    }
  };

  const handleImageSelection = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAudioSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => setAudioDuration(Math.round(audio.duration));
    }
  };

  const handleDeleteTrack = () => {
    if (trackData.id) {
      setTrackToDelete(trackData.id);
    }
    setTrackData({ id: null, title: "", artist: "", audio_url: "", duration: 0 });
    setAudioFile(null);
    setAudioDuration(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = imagePreview;
      let finalTrackId = trackData.id;

      if (!trackToDelete && (audioFile || trackData.audio_url || trackData.title)) {
        if (!trackData.title || trackData.title.trim() === "") {
          throw new Error("Has añadido una canción. Por favor, escribe el título.");
        }
      }

      if (imageFile) {
        finalImageUrl = await uploadFileToStorage('wrestlers', imageFile);
      }
      if (!finalImageUrl) {
        throw new Error("El luchador necesita una imagen obligatoriamente.");
      }

      if (trackToDelete) {
        await deleteTrack(trackToDelete);
        finalTrackId = null;
      }

      if (audioFile || trackData.title) {
        let finalAudioUrl = trackData.audio_url;

        if (audioFile) {
          finalAudioUrl = await uploadFileToStorage('music', audioFile);
        }

        if (!finalAudioUrl) {
          throw new Error("Falta subir el archivo de audio (.mp3).");
        }

        const trackPayload = {
          ...(trackData.id && !trackToDelete ? { id: trackData.id } : {}),
          title: trackData.title.trim(),
          artist: trackData.artist || "Desconocido",
          audio_url: finalAudioUrl,
          cover_url: finalImageUrl,
          duration: audioDuration || trackData.duration || 0
        };

        const savedTrack = await saveTrack(trackPayload);
        finalTrackId = savedTrack.id;
      }

      const wrestlerPayload = {
        ...(wrestler?.id ? { id: wrestler.id } : {}),
        ...formData,
        image_url: finalImageUrl,
        theme_track_id: finalTrackId
      };

      await saveWrestler(wrestlerPayload);

      Swal.fire({
        title: '¡Luchador Guardado!',
        text: 'Todos los datos se han actualizado correctamente.',
        icon: 'success',
        background: 'var(--bg-card)',
        color: 'var(--text-main)',
        confirmButtonColor: 'var(--accent)'
      }).then(() => {
        onClose(true);
      });

    } catch (error) {
      console.error("Error en handleSubmit:", error);
      Swal.fire({
        title: 'Error al guardar',
        text: error.message,
        icon: 'error',
        background: 'var(--bg-card)',
        color: 'var(--text-main)',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWrestler = async () => {
    const result = await Swal.fire({
      title: '¿Estás completamente seguro?',
      text: "¡Vas a borrar a este luchador de forma permanente! Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      background: 'var(--bg-card)',
      color: 'var(--text-main)',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: 'var(--text-muted)',
      confirmButtonText: 'Sí, borrar luchador',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setIsSubmitting(true);
      try {
        await deleteWrestler(wrestler.id, wrestler.theme_track_id);

        await Swal.fire({
          title: '¡Eliminado!',
          text: 'El luchador y su canción han sido borrados del sistema.',
          icon: 'success',
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          confirmButtonColor: 'var(--accent)'
        });

        onClose(true);
      } catch (error) {
        console.error("Error al borrar:", error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo borrar al luchador.',
          icon: 'error',
          background: 'var(--bg-card)',
          color: 'var(--text-main)'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="wrestler-form-view">
      <div className="admin-header">
        <button className="btn-back" onClick={onClose}><i className="fas fa-arrow-left"></i> Volver</button>
        <h2>{wrestler ? `Editar: ${wrestler.name}` : "Nuevo Luchador"}</h2>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="left-column">
          <div
            className={`image-drop-zone ${isDragging ? "dragging" : ""} ${imagePreview ? "has-image" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="preview-img" />
            ) : (
              <div className="drop-placeholder">
                <i className="fas fa-cloud-upload-alt"></i>
                <p>Arrastra una imagen o haz clic para explorar</p>
              </div>
            )}
            <input
              type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }}
              onChange={(e) => e.target.files[0] && handleImageSelection(e.target.files[0])}
            />
          </div>
        </div>

        <div className="right-column">
          <div className="form-section">
            <h3>Datos Generales</h3>
            <div className="input-group">
              <input type="text" placeholder="Nombre" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} maxLength={22} required />
              <select value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })}>
                <option value="">Agente Libre</option>
                <option value="RAW">RAW</option>
                <option value="SmackDown">SmackDown</option>
                <option value="NXT">NXT</option>
              </select>
              <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header-flex">
              <h3>Atributos (0-100)</h3>
              <div className="overall-badge">
                <span className="ovr-label">OVR</span>
                <span className="ovr-value">{currentOverall}</span>
              </div>
            </div>

            <div className="stats-grid">
              {['power', 'technique', 'charisma', 'speed', 'durability', 'ring_iq'].map(stat => (
                <div className="stat-input" key={stat}>
                  <label>{stat.toUpperCase()}</label>
                  <input
                    type="number" min="0" max="100"
                    value={formData[stat]}
                    onChange={e => {
                      let val = Number(e.target.value);
                      if (val > 100) val = 100;
                      if (val < 0) val = 0;
                      setFormData({ ...formData, [stat]: val });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-section theme-section">
            <h3>Tema Musical</h3>
            <div className="input-group">
              <input type="text" placeholder="Título de la canción" value={trackData.title} onChange={e => setTrackData({ ...trackData, title: e.target.value })} maxLength={50} />
              <input type="text" placeholder="Artista" value={trackData.artist} onChange={e => setTrackData({ ...trackData, artist: e.target.value })} maxLength={22} />
            </div>

            <div className="audio-upload-row">
              <input type="file" accept="audio/mp3, audio/wav" onChange={handleAudioSelection} />
              {audioFile && <span className="duration-badge">{audioDuration}s</span>}
              {(trackData.title || audioFile || wrestler?.theme_track_id) && (
                <button type="button" className="btn-delete-track" onClick={handleDeleteTrack}>
                  <i className="fas fa-trash"></i> Quitar Canción
                </button>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Luchador"}
            </button>

            {wrestler?.id && (
              <button
                type="button"
                className="btn-delete-wrestler"
                onClick={handleDeleteWrestler}
                disabled={isSubmitting}
              >
                <i className="fas fa-trash-alt"></i> Borrar Definitivamente
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}