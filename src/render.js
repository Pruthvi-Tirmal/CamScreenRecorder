// Client actions
const videoElement = document.querySelector('video')
const startBtn = document.querySelector('#startBtn')
const stopBtn = document.querySelector('#stopBtn')
const videoSelectBtn = document.querySelector('#videoSelectBtn');
const playSound = document.querySelector('#play_sound');
const stopSound = document.querySelector('#stop_sound');
const toggleIcon = document.querySelector('#toggle__icon');
const onLoad__msg = document.querySelector('.onLoad__msg');
const onLoad__video = document.querySelector('.onLoad__video');
const reloadBtn = document.querySelector('#reloadBtn');
const reload_sound = document.querySelector('#reload_sound');

// to reload the window
reloadBtn.addEventListener('click', () => {
    reload_sound.play();
    setTimeout(() => {
        location.reload();
    }, 350)
})

// desktop capturer 
const { desktopCapturer, ipcRenderer } = require('electron');

// Get the available video sources
const getVideoSources = async () => {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });
    ipcRenderer.send('open-menu', inputSources);
}
// select the video source
videoSelectBtn.onclick = () => {
    onLoad__video.style.display = "block";
    onLoad__msg.style.display = "none";
    getVideoSources();
};

// mediaRecorder instance to capture footage
let mediaRecorder;
const recordedChunks = [];

// Captures all recorded chunks
const handleDataAvailable = (e) => {
    console.log('video data available');
    recordedChunks.push(e.data);
}

// Saves the video file onstop
const handleStop = async (e) => {
    try {
        const blob = new Blob(recordedChunks, {
            type: 'video/webm;codecs=vp9'
        })
        const buffer = Buffer.from(await blob.arrayBuffer());
        ipcRenderer.send('open-dialog', buffer);
    } catch (error) {
        console.log(error);
    }
}
// change the videoSource window to record
let selectSource = async (source) => {
    videoSelectBtn.innerText = source.name;
    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };

    // create a stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints);


    // Preview The Source in a Video Element
    videoElement.srcObject = stream;
    videoElement.play();


    // create the media recorder
    const options = { mimeType: 'video/webm;codecs=vp9' };
    mediaRecorder = new MediaRecorder(stream, options);
    // client action to start the recording 
    startBtn.addEventListener('click', () => {
        videoSelectBtn.disable = "true";
        videoSelectBtn.style.cursor = 'not-allowed';
        toggleIcon.classList.remove('fa-play')
        toggleIcon.classList.add('fa-video');
        startBtn.style.backgroundColor = "#e91e63";
        startBtn.title = "Recording"
        videoSelectBtn.disable = true;
        playSound.play(); //playing the start sound
        mediaRecorder.start();  // to start the recording
        console.log("Recorder Started")
    })

    // when data is available
    mediaRecorder.ondataavailable = handleDataAvailable;

    // client action to stop the recording
    stopBtn.addEventListener('click', () => {
        videoSelectBtn.disable = "false";
        videoSelectBtn.style.cursor = 'pointer';
        stopSound.play(); //playing the stop sound
        toggleIcon.classList.add('fa-play')
        toggleIcon.classList.remove('fa-video');
        videoSelectBtn.disable = false;
        startBtn.style.backgroundColor = "#0dcaf0";
        startBtn.title = "Recording"
        mediaRecorder.stop();
    })
    // save the file 
    mediaRecorder.onstop = handleStop;
}

// catch the source
ipcRenderer.on('caught-source', (event, source) => {
    selectSource(source);
})




