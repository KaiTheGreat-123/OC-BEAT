const bgCanvas = document.getElementById('bgCanvas'); 
const bgCtx = bgCanvas.getContext('2d'); 

let bars = []; 
const barWidth = 30; 
const gap = 5; 

class StatBar {     
    constructor(x, maxHeight) {         
        this.x = x;         
        this.maxHeight = maxHeight;         
        this.height = Math.random() * maxHeight;         
        this.targetHeight = Math.random() * maxHeight;         
        this.speed = 0.02 + Math.random() * 0.05;      
    }     
    update() {         
        this.height += (this.targetHeight - this.height) * this.speed;         
        if (Math.abs(this.targetHeight - this.height) < 2) {             
            this.targetHeight = Math.random() * this.maxHeight;         
        }     
    }     
    draw(ctx, canvasHeight) {         
        const ratio = this.height / this.maxHeight;         
        const r = Math.floor(255 * ratio);         
        const g = Math.floor(255 * (1 - ratio));                  
        ctx.fillStyle = `rgba(${r}, ${g}, 0, 0.4)`;         
        ctx.fillRect(this.x, canvasHeight - this.height, barWidth, this.height);     
    } 
}

function initBg() {     
    bgCanvas.width = window.innerWidth;     
    bgCanvas.height = window.innerHeight;          
    bars = [];     
    const numBars = Math.floor(window.innerWidth / (barWidth + gap));     
    for (let i = 0; i < numBars; i++) {         
        bars.push(new StatBar(i * (barWidth + gap), bgCanvas.height * 0.7));     
    } 
}

window.addEventListener('resize', initBg); 
initBg();  

function animateBg() {     
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);          
    bgCtx.strokeStyle = 'rgba(0, 255, 0, 0.15)';     
    for(let i = 0; i < bgCanvas.height; i += 40) {         
        bgCtx.beginPath();         
        bgCtx.moveTo(0, i);         
        bgCtx.lineTo(bgCanvas.width, i);         
        bgCtx.stroke();     
    }     
    bars.forEach(bar => {         
        bar.update();         
        bar.draw(bgCtx, bgCanvas.height);     
    });     
    requestAnimationFrame(animateBg); 
}
animateBg(); 

const titleScreen = document.getElementById('title-screen'); 
const gameScreen = document.getElementById('game-screen'); 
const helpScreen = document.getElementById('help-screen'); 
const settingsScreen = document.getElementById('settings-screen'); 
const trackScreen = document.getElementById('track-screen'); 

const btnPlay = document.getElementById('btn-play'); 
const btnHelp = document.getElementById('btn-help'); 
const btnCloseHelp = document.getElementById('btn-close-help'); 
const btnSettings = document.getElementById('btn-settings'); 
const btnCloseSettings = document.getElementById('btn-close-settings'); 
const btnCloseTrack = document.getElementById('btn-close-track'); 
const trackButtons = document.querySelectorAll('.track-btn'); 

btnHelp.addEventListener('click', () => {     
    helpScreen.classList.remove('hidden', 'glitch-out');     
    helpScreen.classList.add('glitch-in'); 
});

btnCloseHelp.addEventListener('click', () => {     
    helpScreen.classList.remove('glitch-in');     
    helpScreen.classList.add('glitch-out');     
    setTimeout(() => helpScreen.classList.add('hidden'), 300); 
});

btnSettings.addEventListener('click', () => {     
    settingsScreen.classList.remove('hidden', 'glitch-out');     
    settingsScreen.classList.add('glitch-in'); 
});

btnCloseSettings.addEventListener('click', () => {     
    settingsScreen.classList.remove('glitch-in');     
    settingsScreen.classList.add('glitch-out');     
    setTimeout(() => settingsScreen.classList.add('hidden'), 300); 
});

btnPlay.addEventListener('click', () => {     
    trackScreen.classList.remove('hidden', 'glitch-out');     
    trackScreen.classList.add('glitch-in'); 
});

btnCloseTrack.addEventListener('click', () => {     
    trackScreen.classList.remove('glitch-in');     
    trackScreen.classList.add('glitch-out');     
    setTimeout(() => trackScreen.classList.add('hidden'), 300); 
});

const difficultySelect = document.querySelector('.terminal-select');
let currentAudio = null; 
let selectedTrackName = ""; 

trackButtons.forEach(button => {     
    button.addEventListener('click', (e) => {         
        selectedTrackName = e.target.getAttribute('data-track');                  
        
        const difficulty = difficultySelect.selectedIndex;

        generateBeatmap(selectedTrackName, difficulty);

        trackScreen.classList.add('hidden');         
        titleScreen.classList.add('hidden');         
        gameScreen.classList.remove('hidden');                  
        
        currentAudio = new Audio(selectedTrackName);         
        currentAudio.play();                  
        
        gameLoop();     
    }); 
});
const canvas = document.getElementById('gameCanvas'); 
const ctx = canvas.getContext('2d'); 
const GAME_WIDTH = canvas.width; 
const GAME_HEIGHT = canvas.height; 
const NUM_LANES = 4; 
const LANE_WIDTH = GAME_WIDTH / NUM_LANES; 
const HIT_ZONE_Y = GAME_HEIGHT - 120;  

const activeKeys = { 'd': false, 'f': false, 'j': false, 'k': false }; 
const laneKeys = ['d', 'f', 'j', 'k']; 

const RECORD_MODE = false;  

let testBeatmap = []; 
let AUDIO_OFFSET = 0;
const SCROLL_SPEED = 500; 

let popups = [];

function createPopup(text, color, lane) {
    popups.push({
        text: text,
        color: color,
        x: (lane * LANE_WIDTH) + (LANE_WIDTH / 2),
        y: HIT_ZONE_Y - 40,
        life: 1.0
    });
}

function generateBeatmap(trackName, difficulty) {
    testBeatmap = []; 
    let BPM = 120; 
    if (trackName.includes('breakdown.ogg')) {
        BPM = 87;
        AUDIO_OFFSET = 0.15;
    } else if (trackName.includes('decimeter.ogg')) {
        BPM = 74;
        AUDIO_OFFSET = 0.20;
    }

    const BEAT = 60 / BPM;

    function addNote(lane, beatNumber) {     
        testBeatmap.push({ lane: lane, time: beatNumber * BEAT, hit: false }); 
    }
    function addDouble(laneA, laneB, beatNumber) {     
        addNote(laneA, beatNumber);     
        addNote(laneB, beatNumber); 
    }

    if (difficulty === 0) {
        for (let i = 4; i < 128; i++) {     
            addNote(i % 4, i); 
        }
    } 
    else if (difficulty === 1) {
        for (let i = 4; i < 64; i++) {     
            addNote(i % 4, i); 
        }
        for (let i = 64; i < 128; i += 0.5) {     
            if (i % 2 === 0 || i % 2 === 0.5) {
                addNote(Math.floor(Math.random() * 4), i); 
            }
        }
    } 
    else if (difficulty === 2) {
        for (let i = 4; i < 32; i++) {     
            addNote(i % 4, i); 
        }
        for (let i = 32; i < 64; i += 0.5) {     
            addNote(Math.floor(Math.random() * 4), i); 
        }
        for (let i = 64; i < 128; i++) {     
            addDouble(0, 3, i);         
            addNote(1, i + 0.33);       
            addNote(2, i + 0.66);       
        }
    }
}

window.addEventListener('keydown', (e) => {     
    const key = e.key.toLowerCase();          
    
    if (activeKeys.hasOwnProperty(key)) {         
        if (!activeKeys[key]) {             
            activeKeys[key] = true;                          
            const laneIndex = laneKeys.indexOf(key);                          
            
            if (RECORD_MODE && currentAudio) {                 
                let recordedBeatmap = [];
                const recordedTime = parseFloat((currentAudio.currentTime + 0.1).toFixed(2));                 
                recordedBeatmap.push({ lane: laneIndex, time: recordedTime, hit: false });                 
                console.log(JSON.stringify(recordedBeatmap, null, 2));                              
            
            } else if (!RECORD_MODE && currentAudio) {                 
                const currentTime = currentAudio.currentTime - AUDIO_OFFSET;                 
                const note = testBeatmap.find(n => n.lane === laneIndex && !n.hit);                                  
                
                if (note) {                     
                    const timeDiff = Math.abs(note.time - currentTime);                                          
                    if (timeDiff <= 0.08) {                         
                        note.hit = true;                         
                        note.hitStatus = 'perfect';                      
                    } else if (timeDiff <= 0.18) {                         
                        note.hit = true;                         
                        note.hitStatus = 'okay';                      
                    } else if (timeDiff <= 0.25) {                         
                        note.hit = true;                         
                        note.hitStatus = 'miss';                      
                    }                 
                }             
            }
        }
    }
}); 

window.addEventListener('keyup', (e) => {     
    const key = e.key.toLowerCase();     
    if (activeKeys.hasOwnProperty(key)) activeKeys[key] = false; 
});


function drawHighway() {     
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);     
    
    for (let i = 0; i < NUM_LANES; i++) {         
        if (activeKeys[laneKeys[i]]) {             
            ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';             
            ctx.fillRect(i * LANE_WIDTH, 0, LANE_WIDTH, GAME_HEIGHT);         
        }     
    }     
    
    ctx.strokeStyle = '#333';     
    ctx.lineWidth = 2;     
    for (let i = 1; i < NUM_LANES; i++) {         
        ctx.beginPath();         
        ctx.moveTo(i * LANE_WIDTH, 0);         
        ctx.lineTo(i * LANE_WIDTH, GAME_HEIGHT);         
        ctx.stroke();     
    }     
    
    ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';     
    ctx.fillRect(0, HIT_ZONE_Y - 10, GAME_WIDTH, 20);          
    
    ctx.strokeStyle = '#00ff00';     
    ctx.lineWidth = 4;     
    ctx.beginPath();     
    ctx.moveTo(0, HIT_ZONE_Y);     
    ctx.lineTo(GAME_WIDTH, HIT_ZONE_Y);     
    ctx.stroke(); 
}

function drawNotes() {     
    if (!currentAudio) return;     
    
    const currentTime = currentAudio.currentTime - AUDIO_OFFSET;     
    
    testBeatmap.forEach(note => {         
        const timeDifference = note.time - currentTime;         
        
        if (timeDifference > 2.0) return;         
        
        if (timeDifference < -0.15 && !note.hit) {             
            note.hit = true;             
            note.hitStatus = 'miss';         
        }         
        
        if (timeDifference < -0.5) return;          
        
        const y = HIT_ZONE_Y - (timeDifference * SCROLL_SPEED);         
        const x = note.lane * LANE_WIDTH;         
        
        if (note.hitStatus === 'perfect') {             
            ctx.fillStyle = '#00aeff';             
            ctx.shadowColor = '#00aeff';         
        } else if (note.hitStatus === 'okay') {             
            ctx.fillStyle = '#ff9900';              
            ctx.shadowColor = '#ff9900';         
        } else if (note.hitStatus === 'miss') {             
            ctx.fillStyle = '#ff0000';              
            ctx.shadowColor = '#ff0000';         
        } else {             
            ctx.fillStyle = '#00ff00';              
            ctx.shadowColor = '#00ff00';         
        }         
        
        ctx.shadowBlur = 15;         
        ctx.fillRect(x + 10, y - 10, LANE_WIDTH - 20, 20);     
    });     
    
    ctx.shadowBlur = 0;  
}

function gameLoop() {     
    drawHighway();     
    drawNotes();     
    requestAnimationFrame(gameLoop); 
}