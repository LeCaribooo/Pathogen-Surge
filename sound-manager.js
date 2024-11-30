import * as THREE from "three";

export class SoundManager {
  constructor(camera, getPausedState) {
    this.camera = camera;
    this.getPausedState = getPausedState;
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);
    this.ambientSound = new THREE.Audio(this.listener);
    this.intervalSoundId = null;

    this.playingSounds = [
      (import.meta.env.DEV ? 'Pathogen-Surge/' : '') + 'assets/sounds/water_09.mp3',
      (import.meta.env.DEV ? 'Pathogen-Surge/' : '') + 'assets/sounds/water_10.mp3',
      (import.meta.env.DEV ? 'Pathogen-Surge/' : '') + 'assets/sounds/water_11.mp3',
      (import.meta.env.DEV ? 'Pathogen-Surge/' : '') + 'assets/sounds/water_12.mp3'
    ];

    this.currentSoundIndex = -1;
    this.setupSoundControls();
  }

  setupSoundControls() {
    this.soundIcon = document.getElementById("sound_icone");
    this.noSoundIcon = document.getElementById("no_sound_icone");

    this.soundIcon.addEventListener("click", () => {
      this.ambientSound.stop();
      this.soundIcon.style.display = "none";
      this.noSoundIcon.style.display = "";
    });

    this.noSoundIcon.addEventListener("click", () => {
      this.ambientSound.play();
      this.noSoundIcon.style.display = "none";
      this.soundIcon.style.display = "";
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearInterval(this.intervalSoundId);
        this.ambientSound.pause();
      } else {
        if (!this.getPausedState())
          this.intervalSoundId = setInterval(() => this.checkSoundEnd(), 100);
      }
    });
  }

  randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  playRandomSound() {
    if (!this.getPausedState()) {
      this.currentSoundIndex = this.randomIntFromInterval(
        0,
        this.playingSounds.length - 1
      );
      const audioLoader = new THREE.AudioLoader();

      audioLoader.load(
        (import.meta.env.DEV ? "Pathogen-Surge/" : "") +
        this.playingSounds[this.currentSoundIndex],
        (buffer) => {
          this.ambientSound.setBuffer(buffer);
          this.ambientSound.setLoop(false);
          this.ambientSound.setVolume(0.1);
          this.ambientSound.play();
        }
      );
    }
  }

  checkSoundEnd() {
    if (
      !this.ambientSound.isPlaying &&
      this.noSoundIcon.style.display === "none"
    ) {
      this.playRandomSound();
    }
  }

  playAmbientSound() {
    if (!this.getPausedState()) {
      this.playRandomSound();
      this.intervalSoundId = setInterval(() => this.checkSoundEnd(), 100);
    }
  }

  playDestroySound() {
    if (this.noSoundIcon.style.display === "none") {
      const destroySound = new THREE.Audio(this.listener);
      const audioLoader = new THREE.AudioLoader();

      audioLoader.load(
        (import.meta.env.DEV ? "Pathogen-Surge/" : "") +
        "assets/sounds/pop.mp3",
        (buffer) => {
          destroySound.setBuffer(buffer);
          destroySound.setLoop(false);
          destroySound.setVolume(0.5);
          destroySound.play();
        }
      );
    }
  }

  playGameOverSound() {
    if (this.noSoundIcon.style.display === "none") {
      const gameOverSound = new THREE.Audio(this.listener);
      const audioLoader = new THREE.AudioLoader();

      audioLoader.load((import.meta.env.DEV ? 'Pathogen-Surge/' : '') + 'assets/sounds/game-over.mp3', (buffer) => {
        gameOverSound.setBuffer(buffer);
        gameOverSound.setLoop(false);
        gameOverSound.setVolume(0.3);
        gameOverSound.play();
      });
    }
  }

  playMainMenuSound() {
    if (this.noSoundIcon.style.display === "none") {
      const audioLoader = new THREE.AudioLoader();
      audioLoader.load((import.meta.env.DEV ? 'Pathogen-Surge/' : '') + 'assets/sounds/main-menu-creepy.mp3', (buffer) => {
        this.ambientSound.setBuffer(buffer);
        this.ambientSound.setLoop(true);
        this.ambientSound.setVolume(0.5);
        this.ambientSound.play();
      });
    }
  }

  handlePause() {
    this.ambientSound.pause();
  }

  handleResume() {
    if (this.noSoundIcon.style.display === "none") {
      this.ambientSound.play();
    }
  }

  cleanup() {
    clearInterval(this.intervalSoundId);
    this.soundIcon.removeEventListener("click", () => { });
    this.noSoundIcon.removeEventListener("click", () => { });
    this.camera.remove(this.listener);
  }
}
