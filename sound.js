import * as THREE from "three";
import { isPaused } from "./main";

export function ambiantSoundPlay(camera){
    if (!isPaused) {
        let sound_icon = document.getElementById("sound_icone");
        let no_sound_icon = document.getElementById("no_sound_icone");
        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        camera.add( listener );

        // create a global audio source
        const sound = new THREE.Audio( listener );

        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        const sounds = [
            'Pathogen-Surge/assets/sounds/water_09.mp3',
            'Pathogen-Surge/assets/sounds/water_10.mp3',
            'Pathogen-Surge/assets/sounds/water_11.mp3',
            'Pathogen-Surge/assets/sounds/water_12.mp3'
        ];
        let currentSoundIndex = -1; // Track the current sound index

        // Function to play a random sound
        function playRandomSound() {
            if (!isPaused) {
                currentSoundIndex = randomIntFromInterval(0, sounds.length - 1); // Pick a random sound
                audioLoader.load(sounds[currentSoundIndex], function (buffer) {
                    sound.setBuffer(buffer);
                    sound.setLoop(false);  // Disable looping so it plays one after another
                    sound.setVolume(0.1);
                    sound.play();
                    console.log(sound)
                });
            }
        }

        playRandomSound();

        // Monitor if the sound has ended
        function checkSoundEnd() {
            if (!sound.isPlaying && no_sound_icon.style.display == "none") {
                playRandomSound();  // Play the next random sound when this one finishes
            }
        }
        
        let intervalSoundId = setInterval(checkSoundEnd, 100);

        sound_icon.addEventListener("click", () => {
            sound.stop();
            sound_icon.style.display = "none";
            no_sound_icon.style.display = "";
        });
        no_sound_icon.addEventListener("click", () => {
            sound.play();
            no_sound_icon.style.display = "none";
            sound_icon.style.display = "";
        });
        window.addEventListener("keydown", (event) => {
            if (event.key === "p" && isPaused == false) {
                sound.pause();
            }
            if (event.key === "p" && isPaused == true) {
                sound.play();
            }
        });
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                // If the page is not visible, stop the interval
                clearInterval(intervalSoundId);
                sound.pause();
            } else {
                // If the page becomes visible again, start the interval
                intervalSoundId = setInterval(checkSoundEnd, 100);
            }
        });
    }
}

function randomIntFromInterval(min, max) { // min and max included 
return Math.floor(Math.random() * (max - min + 1) + min);
}

export function destroySound(camera) {
    let no_sound_icon = document.getElementById("no_sound_icone");
    let sound_icon = document.getElementById("sound_icone");
    if (no_sound_icon.style.display == "none") {
        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        camera.add( listener );

        // create a global audio source
        const sound = new THREE.Audio( listener );

        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();

        audioLoader.load('Pathogen-Surge/assets/sounds/pop.mp3', function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(false);  // Disable looping so it plays one after another
            sound.setVolume(0.5);
            sound.play();
            console.log(sound)
        });

        sound_icon.addEventListener("click", () => {
            sound.stop();
            sound_icon.style.display = "none";
            no_sound_icon.style.display = "";
        });
    }

}
