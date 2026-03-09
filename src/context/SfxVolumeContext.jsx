import { createContext, useContext, useState, useEffect } from "react";
import { UserSettings } from "../services/apiService";

const SfxVolumeContext = createContext(null);

export const SfxVolumeProvider = ({ children }) => {
  const [sfxVolume, setSfxVolumeState] = useState(null);

  const setSfxVolume = (value) => {
    setSfxVolumeState(value);
  };

  useEffect(() => {
    const loadVolume = async () => {
      try {
        const data = await UserSettings.get();
        if (typeof data.sfx_volume === "number") {
          setSfxVolumeState(data.sfx_volume);
        } else {
          setSfxVolumeState(50);
        }
      } catch (err) {
        console.error("Error cargando SFX volume:", err);
        setSfxVolumeState(50);
      }
    };
    loadVolume();
  }, []);

  useEffect(() => {
    if (sfxVolume == null) return;

    const timer = setTimeout(() => {
      UserSettings.updateSfxVolume(sfxVolume)
        .catch(err => console.error("Error actualizando SFX volume:", err));
    }, 400);

    return () => clearTimeout(timer);
  }, [sfxVolume]);

  return (
    <SfxVolumeContext.Provider value={{ sfxVolume, setSfxVolume }}>
      {children}
    </SfxVolumeContext.Provider>
  );
};

export const useSfxVolume = () => {
  const context = useContext(SfxVolumeContext);
  if (!context) {
    throw new Error("useSfxVolume debe usarse dentro de SfxVolumeProvider");
  }
  return context;
};