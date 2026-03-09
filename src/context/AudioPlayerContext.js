import { createContext, useContext } from "react";

export const AudioPlayerContext = createContext(null);

export const useAudioPlayer = () => {
    const context = useContext(AudioPlayerContext);
    if (!context) {
        throw new Error("useAudioPlayer debe usarse dentro de AudioPlayer");
    }
    return context;
};