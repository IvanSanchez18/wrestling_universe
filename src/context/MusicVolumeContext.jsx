import { createContext, useContext, useState, useEffect } from "react";
import { UserSettings } from "../services/apiService";

const MusicVolumeContext = createContext();

export const MusicVolumeProvider = ({ children }) => {
    const [musicVolume, setMusicVolumeState] = useState(null);

    const setMusicVolume = (value) => {
        setMusicVolumeState(value);
    };

    useEffect(() => {
        const loadVolume = async () => {
            try {
                const data = await UserSettings.get();
                if (typeof data.music_volume === "number") {
                    setMusicVolumeState(data.music_volume);
                } else {
                    setMusicVolumeState(50);
                }
            } catch (err) {
                console.error("Error cargando music volume:", err);
                setMusicVolumeState(50);
            }
        };
        loadVolume();
    }, []);

    useEffect(() => {
        if (musicVolume == null) return;

        const timer = setTimeout(() => {
            UserSettings.updateMusicVolume(musicVolume)
                .catch(err => console.error("Error actualizando music volume:", err));
        }, 400);

        return () => clearTimeout(timer);
    }, [musicVolume]);

    return (
        <MusicVolumeContext.Provider value={{ musicVolume, setMusicVolume }}>
            {children}
        </MusicVolumeContext.Provider>
    );
};

export const useMusicVolume = () => useContext(MusicVolumeContext);