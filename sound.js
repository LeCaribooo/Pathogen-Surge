import * as THREE from "three";

export function ambiantSoundPlay(camera){
    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add( listener );

    // create a global audio source
    const sound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'Pathogen-Surge/assets/sounds/bloup_series.ogg', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop( true );
        sound.setVolume( 0.5 );
        sound.play();
    });
    let sound_icon = document.getElementById("sound_icone");
    let no_sound_icon = document.getElementById("no_sound_icone");
    sound_icon.addEventListener("click", () => {
        sound.stop();
        sound_icon.style.display = "none";
        no_sound_icon.style.display = "";
        //document.getElementById("no_sound_icone").position = "absolute";
    });
    no_sound_icon.addEventListener("click", () => {
        sound.play();
        no_sound_icon.style.display = "none";
        sound_icon.style.display = "";
    });
}

