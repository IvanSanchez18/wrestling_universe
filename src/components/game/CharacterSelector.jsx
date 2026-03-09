import { useState, useRef, useEffect } from "react";

// PROFILE
import takerProfile from "../../assets/Taker/Taker-profile.png";
import rockProfile from "../../assets/Rock/Rock-profile.png";
import cenaProfile from "../../assets/Cena/Cena-profile.png";
import hoganProfile from "../../assets/Hogan/Hogan-profile.png";
import reyProfile from "../../assets/Rey/Rey-profile.png";
import stonecoldProfile from "../../assets/StoneCold/StoneCold-profile.png";
import romanProfile from "../../assets/Roman/Roman-profile.png";
import vaquerProfile from "../../assets/Vaquer/Vaquer-profile.png";
import pentaProfile from "../../assets/Penta/Penta-profile.png";
import livProfile from "../../assets/Liv/Liv-profile.png";
import rheaProfile from "../../assets/Rhea/Rhea-profile.png";
import lyraProfile from "../../assets/Lyra/Lyra-profile.png";

// IDLE
import takerIdle from "../../assets/Taker/Taker-idle-1.png";
import rockIdle from "../../assets/Rock/Rock-idle-1.png";
import cenaIdle from "../../assets/Cena/Cena-idle-1.png";
import hoganIdle from "../../assets/Hogan/Hogan-idle-1.png";
import reyIdle from "../../assets/Rey/Rey-idle-1.png";
import stonecoldIdle from "../../assets/StoneCold/StoneCold-idle-1.png";
import romanIdle from "../../assets/Roman/Roman-idle-1.png";
import vaquerIdle from "../../assets/Vaquer/Vaquer-idle-1.png";
import pentaIdle from "../../assets/Penta/Penta-idle-1.png";
import livIdle from "../../assets/Liv/Liv-idle-1.png";
import rheaIdle from "../../assets/Rhea/Rhea-idle-1.png";
import lyraIdle from "../../assets/Lyra/Lyra-idle-1.png";

// SOUNDS
import takerSound from "../../assets/Taker/taker.mp3";
import stonecoldSound from "../../assets/StoneCold/stonecold.mp3";
import rockSound from "../../assets/Rock/rock.mp3";
import cenaSound from "../../assets/Cena/cena.mp3";
import hoganSound from "../../assets/Hogan/hogan.mp3";
import reySound from "../../assets/Rey/rey.mp3";
import romanSound from "../../assets/Roman/roman.mp3";
import vaquerSound from "../../assets/Vaquer/vaquer.mp3";
import pentaSound from "../../assets/Penta/penta.mp3";
import livSound from "../../assets/Liv/liv.mp3";
import rheaSound from "../../assets/Rhea/rhea.mp3";
import lyraSound from "../../assets/Lyra/Lyra.mp3";

import changeSound from "../../assets/sounds/change-character.mp3";

const baseCharacters = [
  { name: "Cena", profile: cenaProfile, idle: cenaIdle, sound: cenaSound },
  { name: "Hogan", profile: hoganProfile, idle: hoganIdle, sound: hoganSound },
  { name: "Liv", profile: livProfile, idle: livIdle, sound: livSound },
  { name: "Lyra", profile: lyraProfile, idle: lyraIdle, sound: lyraSound },
  { name: "Penta", profile: pentaProfile, idle: pentaIdle, sound: pentaSound },
  { name: "Rey", profile: reyProfile, idle: reyIdle, sound: reySound },
  { name: "Rhea", profile: rheaProfile, idle: rheaIdle, sound: rheaSound },
  { name: "Rock", profile: rockProfile, idle: rockIdle, sound: rockSound },
  { name: "Roman", profile: romanProfile, idle: romanIdle, sound: romanSound },
  { name: "StoneCold", profile: stonecoldProfile, idle: stonecoldIdle, sound: stonecoldSound },
  { name: "Taker", profile: takerProfile, idle: takerIdle, sound: takerSound },
  { name: "Vaquer", profile: vaquerProfile, idle: vaquerIdle, sound: vaquerSound },
];

const characters = [...baseCharacters, ...baseCharacters, ...baseCharacters].slice(0, 12);

const CharacterSelector = ({ onSelect, defeatedCharacters = [], lockedPlayer = null }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [introPlaying, setIntroPlaying] = useState(false);
  const [playerLocked, setPlayerLocked] = useState(false);
  const [rivalIndex, setRivalIndex] = useState(null);
  const [rivalSelecting, setRivalSelecting] = useState(false);
  const [showVS, setShowVS] = useState(false);
  const inputLockedRef = useRef(false);

  const gridRef = useRef(null);

  const changeAudioRef = useRef(new Audio(changeSound));

  const handleAccept = () => {
    const selectedCharacter = characters[selectedIndex];

    if (lockedPlayer && selectedCharacter.name !== lockedPlayer.name) return;
    if (defeatedCharacters.includes(selectedCharacter.name)) return;

    inputLockedRef.current = true;
    setPlayerLocked(true);
    setIntroPlaying(true);

    const acceptAudio = new Audio(selectedCharacter.sound);
    acceptAudio.volume = 0.9;
    acceptAudio.play();

    acceptAudio.onended = () => {
      startRivalSelection(selectedCharacter);
    };
  };

  const startRivalSelection = (playerCharacter) => {
    setRivalSelecting(true);

    const availableIndexes = characters
      .map((c, i) => ({ name: c.name, index: i }))
      .filter(
        c =>
          c.name !== playerCharacter.name &&
          !defeatedCharacters.includes(c.name)
      );

    if (availableIndexes.length === 0) {
      console.warn("No quedan rivales disponibles");
      return;
    }

    const finalPick =
      availableIndexes[
        Math.floor(Math.random() * availableIndexes.length)
      ].index;

    let current = 0;
    let speed = 40;
    let loops = 0;

    const minLoops = 2;

    const changeSound = changeAudioRef.current;
    changeSound.currentTime = 0;
    changeSound.loop = true;
    changeSound.play();

    const spin = () => {
      if (characters[current].name === playerCharacter.name) {
        current++;
        if (current >= characters.length) {
          current = 0;
          loops++;
        }
      }

      setRivalIndex(current);

      if (loops >= minLoops && current === finalPick) {
        changeSound.pause();
        setRivalSelecting(false);

        const rivalAudio = new Audio(characters[finalPick].sound);
        rivalAudio.volume = 0.9;
        rivalAudio.play();

        rivalAudio.onended = () => {
          setShowVS(true);

          setTimeout(() => {
            onSelect({
              player: playerCharacter,
              rival: characters[finalPick],
            });

            setShowVS(false);
            setRivalIndex(null);
            setRivalSelecting(false);
            setIntroPlaying(false);
          }, 2200);
        };

        return;
      }

      current++;

      if (current >= characters.length) {
        current = 0;
        loops++;
      }

      if (loops >= 1) {
        speed += 5;
      }

      setTimeout(spin, speed);
    };

    spin();
  };

  useEffect(() => {
    if (!lockedPlayer) return;

    const index = characters.findIndex(
      c => c.name === lockedPlayer.name
    );

    if (index !== -1) {
      setSelectedIndex(index);
      setPlayerLocked(true);
      inputLockedRef.current = true;
    }
  }, [lockedPlayer]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (inputLockedRef.current || playerLocked || lockedPlayer) return;

      const grid = gridRef.current;
      if (!grid) return;

      const cards = Array.from(grid.children);
      const currentCard = cards[selectedIndex];
      if (!currentCard) return;

      const currentRect = currentCard.getBoundingClientRect();
      let targetIndex = selectedIndex;

      if (e.key === "ArrowRight") {
        targetIndex = (selectedIndex + 1) % characters.length;
      }

      if (e.key === "ArrowLeft") {
        targetIndex =
          (selectedIndex - 1 + characters.length) % characters.length;
      }

      if (e.key === "ArrowDown") {
        const belowCards = cards.filter(card => {
          const rect = card.getBoundingClientRect();
          return rect.top > currentRect.top + 5;
        });

        if (belowCards.length > 0) {
          const closestRowTop = Math.min(
            ...belowCards.map(card => card.getBoundingClientRect().top)
          );

          const sameRowCards = cards.filter(card => {
            const rect = card.getBoundingClientRect();
            return Math.abs(rect.top - closestRowTop) < 5;
          });

          let closest = sameRowCards[0];
          let minDistance = Infinity;

          sameRowCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const distance = Math.abs(rect.left - currentRect.left);
            if (distance < minDistance) {
              minDistance = distance;
              closest = card;
            }
          });

          targetIndex = cards.indexOf(closest);
        }
      }

      if (e.key === "ArrowUp") {
        const aboveCards = cards.filter(card => {
          const rect = card.getBoundingClientRect();
          return rect.top < currentRect.top - 5;
        });

        if (aboveCards.length > 0) {
          const closestRowTop = Math.max(
            ...aboveCards.map(card => card.getBoundingClientRect().top)
          );

          const sameRowCards = cards.filter(card => {
            const rect = card.getBoundingClientRect();
            return Math.abs(rect.top - closestRowTop) < 5;
          });

          let closest = sameRowCards[0];
          let minDistance = Infinity;

          sameRowCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const distance = Math.abs(rect.left - currentRect.left);
            if (distance < minDistance) {
              minDistance = distance;
              closest = card;
            }
          });

          targetIndex = cards.indexOf(closest);
        }
      }

      if (e.key === "Enter") {
        handleAccept();
        return;
      }
      if (lockedPlayer && characters[targetIndex].name !== lockedPlayer.name) {
        return;
      }

      if (targetIndex !== selectedIndex) {
        const changeSound = changeAudioRef.current;
        changeSound.currentTime = 0;
        changeSound.volume = 0.6;
        changeSound.play().catch(() => { });
      }

      setSelectedIndex(targetIndex);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>SELECT YOUR WRESTLER</h1>

      <div style={styles.grid} ref={gridRef}>
        {characters.map((char, index) => {
          const isDefeated = defeatedCharacters.includes(char.name);
          const isLockedPlayer = lockedPlayer?.name === char.name;

          return (
            <div
              key={index}
              onClick={() => {
                if (introPlaying) return;
                if (isDefeated) return;
                if (playerLocked || lockedPlayer) return;

                setSelectedIndex(index);
              }}

              style={{
                ...styles.card,
                cursor: isDefeated ? "not-allowed" : "pointer",
                border:
                  index === selectedIndex && playerLocked
                    ? "4px solid red"
                    : index === rivalIndex
                      ? "4px solid #00BFFF"
                      : index === selectedIndex
                        ? "4px solid red"
                        : "2px solid #222",
                boxShadow:
                  index === rivalIndex
                    ? "0 0 15px #00BFFF"
                    : index === selectedIndex && playerLocked
                      ? "0 0 15px red"
                      : "none",
              }}
            >
              <img
                src={char.profile}
                alt={char.name}
                style={{
                  ...styles.thumbnail,
                  filter:
                    isDefeated && !isLockedPlayer
                      ? "grayscale(100%) brightness(0.7)"
                      : "none",
                  opacity: isDefeated && !isLockedPlayer ? 0.7 : 1,
                }}
              />
              <span style={styles.name}>{char.name}</span>
            </div>
          );
        })}

      </div>

      <div style={styles.preview}>
        <img
          src={characters[selectedIndex].idle}
          alt={characters[selectedIndex].name}
          style={styles.sprite}
        />
      </div>

      {showVS && (
        <div style={styles.vsOverlay}>
          <div style={styles.vsContainer}>
            <div style={styles.vsPlayer}>
              <img src={characters[selectedIndex].idle} style={styles.vsImage} />
              <h2>{characters[selectedIndex].name}</h2>
            </div>

            <div style={styles.vsText}>VS</div>

            <div style={styles.vsRival}>
              <img src={characters[rivalIndex].idle} style={styles.vsImage} />
              <h2>{characters[rivalIndex].name}</h2>
            </div>
          </div>
        </div>
      )}

      <button style={styles.button} onClick={handleAccept} disabled={introPlaying}>
        ACCEPT
      </button>
    </div>
  );
};

export default CharacterSelector;

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    background: "black",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1vh 1vw",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "clamp(16px, 3.5vw, 28px)",
    letterSpacing: "3px",
    margin: "1vh 0",
    color: "#ffd700",
    textAlign: "center",
    flexShrink: 0,
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    gap: "min(1vh, 1.5vw)",
    width: "100%",
    maxWidth: "95vw",
    flexGrow: 1,
    overflow: "hidden",
  },
  card: {
    width: "clamp(60px, 18vw, 120px)",
    height: "clamp(65px, 14vh, 100px)",
    backgroundColor: "#111",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "clamp(2px, 0.5vh, 6px)",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  thumbnail: {
    width: "100%",
    height: "70%",
    objectFit: "contain",
  },
  name: {
    fontSize: "clamp(9px, 1.5vw, 14px)",
    letterSpacing: "1px",
    textAlign: "center",
    width: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  preview: {
    margin: "1vh 0",
    height: "18vh",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
  },
  sprite: {
    height: "100%",
    width: "auto",
    objectFit: "contain",
  },
  button: {
    padding: "1.5vh 6vw",
    fontSize: "clamp(14px, 3vw, 18px)",
    backgroundColor: "red",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    letterSpacing: "2px",
    marginBottom: "2vh",
    borderRadius: "5px",
    flexShrink: 0,
  },
  vsOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "black",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    animation: "fadeIn 0.3s ease-in-out",
  },
  vsContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "clamp(10px, 4vw, 40px)",
    color: "white",
    textAlign: "center",
    width: "90%",
  },
  vsText: {
    fontSize: "clamp(30px, 8vw, 80px)",
    color: "red",
    textShadow: "0 0 20px red",
    margin: "0 2vw",
  },
  vsPlayer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  vsRival: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  vsImage: {
    height: "clamp(100px, 25vh, 300px)",
    width: "auto",
  },
};