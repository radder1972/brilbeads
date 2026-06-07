/**
 * BRIL BEADS - CUSTOMIZER LOGIC & STATE
 */

// --- Audio Synthesizer (Web Audio API) for Pop/Click sounds ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    // Check state of audio context
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'pop') {
        // Soft slide-in bubble pop sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.16);
    } else if (type === 'click') {
        // High crisp plastic clip-on sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(400, now + 0.03);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.09);
    } else if (type === 'delete') {
        // Whoosh slide out sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
    } else if (type === 'save') {
        // Double chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.45);
    }
}

// --- Beads Database ---
const BEADS_DATABASE = {
    kids: [
        {
            id: 'k-kitty',
            name: 'Hello Kitty',
            price: 2.95,
            color: '#e63946',
            svgContent: `
                <!-- Silicone Ring Backing -->
                <ellipse cx="0" cy="0" rx="3" ry="8" fill="rgba(255,255,255,0.7)" stroke="#aaa" stroke-width="0.5" class="silicone-backing-ring" />
                <!-- Kitty Head shape -->
                <ellipse cx="0" cy="0" rx="13" ry="10" fill="#fff" stroke="#3a261c" stroke-width="1.5" />
                <!-- Ears -->
                <path d="M -9 -7 L -12 -15 L -3 -10 Z" fill="#fff" stroke="#3a261c" stroke-width="1.5" stroke-linejoin="round" />
                <path d="M 9 -7 L 12 -15 L 3 -10 Z" fill="#fff" stroke="#3a261c" stroke-width="1.5" stroke-linejoin="round" />
                <!-- Eyes -->
                <ellipse cx="-5" cy="0" rx="1.2" ry="1.8" fill="#3a261c" />
                <ellipse cx="5" cy="0" rx="1.2" ry="1.8" fill="#3a261c" />
                <!-- Nose -->
                <ellipse cx="0" cy="2" rx="1.8" ry="1.2" fill="#ffd000" stroke="#3a261c" stroke-width="0.8" />
                <!-- Whiskers -->
                <line x1="-9" y1="0" x2="-14" y2="-1" stroke="#3a261c" stroke-width="1" />
                <line x1="-9" y1="2" x2="-15" y2="2" stroke="#3a261c" stroke-width="1" />
                <line x1="-9" y1="4" x2="-14" y2="5" stroke="#3a261c" stroke-width="1" />
                <line x1="9" y1="0" x2="14" y2="-1" stroke="#3a261c" stroke-width="1" />
                <line x1="9" y1="2" x2="15" y2="2" stroke="#3a261c" stroke-width="1" />
                <line x1="9" y1="4" x2="14" y2="5" stroke="#3a261c" stroke-width="1" />
                <!-- Red Bow on Left Ear -->
                <ellipse cx="-12" cy="-10" rx="3.5" ry="2.5" fill="#e63946" stroke="#3a261c" stroke-width="1.2" transform="rotate(-30, -12, -10)" />
                <ellipse cx="-5" cy="-6" rx="3.5" ry="2.5" fill="#e63946" stroke="#3a261c" stroke-width="1.2" transform="rotate(30, -5, -6)" />
                <circle cx="-8" cy="-8" r="2.5" fill="#e63946" stroke="#3a261c" stroke-width="1.2" />
            `
        },
        {
            id: 'k-star',
            name: 'Vrolijke Ster',
            price: 2.50,
            color: 'var(--pink)',
            svgContent: `
                <!-- Silicone Ring Backing -->
                <ellipse cx="0" cy="0" rx="3" ry="8" fill="rgba(255,255,255,0.7)" stroke="#aaa" stroke-width="0.5" class="silicone-backing-ring" />
                <!-- Star shape -->
                <path d="M 0 -15 L 4.5 -4.5 L 15 -4.5 L 6.5 2.5 L 9.5 13 L 0 6.5 L -9.5 13 L -6.5 2.5 L -15 -4.5 L -4.5 -4.5 Z" fill="var(--pink)" stroke="#fff" stroke-width="1.5" />
                <!-- Smile detail -->
                <circle cx="-3" cy="-1" r="1" fill="#fff" />
                <circle cx="3" cy="-1" r="1" fill="#fff" />
                <path d="M -2 2 Q 0 4 2 2" stroke="#fff" stroke-width="1" stroke-linecap="round" fill="none" />
            `
        },
        {
            id: 'k-panda',
            name: 'Panda Vriend',
            price: 2.75,
            color: '#ffffff',
            svgContent: `
                <ellipse cx="0" cy="0" rx="3" ry="8" fill="rgba(255,255,255,0.7)" stroke="#aaa" stroke-width="0.5" class="silicone-backing-ring" />
                <!-- Ears -->
                <circle cx="-10" cy="-10" r="4.5" fill="#222" />
                <circle cx="10" cy="-10" r="4.5" fill="#222" />
                <!-- Face -->
                <circle cx="0" cy="0" r="13" fill="#ffffff" stroke="#222" stroke-width="1.5" />
                <!-- Eyes patches -->
                <ellipse cx="-4.5" cy="-2" rx="3" ry="4.5" fill="#222" transform="rotate(-10, -4.5, -2)" />
                <ellipse cx="4.5" cy="-2" rx="3" ry="4.5" fill="#222" transform="rotate(10, 4.5, -2)" />
                <!-- Eyes pupils -->
                <circle cx="-4" cy="-2" r="1" fill="#fff" />
                <circle cx="4" cy="-2" r="1" fill="#fff" />
                <!-- Snout -->
                <ellipse cx="0" cy="4" rx="2.5" ry="1.5" fill="#222" />
                <!-- Cheeks -->
                <circle cx="-8" cy="4" r="1.5" fill="var(--pink)" opacity="0.6" />
                <circle cx="8" cy="4" r="1.5" fill="var(--pink)" opacity="0.6" />
            `
        },
        {
            id: 'k-dino',
            name: 'Dino Groen',
            price: 2.50,
            color: '#4caf50',
            svgContent: `
                <ellipse cx="0" cy="0" rx="3" ry="8" fill="rgba(255,255,255,0.7)" stroke="#aaa" stroke-width="0.5" class="silicone-backing-ring" />
                <!-- Dino body -->
                <path d="M -12 8 C -12 8, -12 -12, 0 -12 C 10 -12, 12 -5, 12 0 C 12 5, 8 12, -2 12 C -8 12, -12 8, -12 8 Z" fill="#4caf50" stroke="#2e7d32" stroke-width="1.5" />
                <!-- Dino Spikes -->
                <path d="M -10 -8 L -14 -6 L -10 -4 M -6 -12 L -8 -16 L -2 -12 M 2 -12 L 4 -16 L 8 -10" stroke="#2e7d32" stroke-width="2" stroke-linecap="round" fill="none" />
                <!-- Dino Eye -->
                <circle cx="4" cy="-5" r="1.5" fill="#fff" />
                <circle cx="4.5" cy="-5" r="0.7" fill="#000" />
                <!-- Cheek -->
                <circle cx="1" cy="-2" r="1.5" fill="#ff7043" opacity="0.7" />
            `
        },
        {
            id: 'k-hero',
            name: 'Hero Masker',
            price: 2.95,
            color: '#e63946',
            svgContent: `
                <ellipse cx="0" cy="0" rx="3" ry="8" fill="rgba(255,255,255,0.7)" stroke="#aaa" stroke-width="0.5" class="silicone-backing-ring" />
                <!-- Mask shape -->
                <path d="M -15 -8 Q -10 -15 0 -8 Q 10 -15 15 -8 Q 17 0 10 10 Q 0 14 -10 10 Q -17 0 -15 -8 Z" fill="#e63946" stroke="#b70918" stroke-width="1.5" />
                <!-- Eyes holes -->
                <path d="M -9 -2 Q -5 -8 -1 -3 Q -4 1 -9 -2 Z" fill="#fff" />
                <path d="M 9 -2 Q 5 -8 1 -3 Q 4 1 9 -2 Z" fill="#fff" />
            `
        },
        {
            id: 'k-smile',
            name: 'Smile Blij',
            price: 2.25,
            color: '#ffb703',
            svgContent: `
                <ellipse cx="0" cy="0" rx="3" ry="8" fill="rgba(255,255,255,0.7)" stroke="#aaa" stroke-width="0.5" class="silicone-backing-ring" />
                <circle cx="0" cy="0" r="13" fill="#ffb703" stroke="#e09f00" stroke-width="1.5" />
                <!-- Smile Eyes -->
                <circle cx="-4" cy="-3" r="1.8" fill="#333" />
                <circle cx="4" cy="-3" r="1.8" fill="#333" />
                <!-- Smile mouth -->
                <path d="M -6 2 Q 0 8 6 2" stroke="#333" stroke-width="1.8" stroke-linecap="round" fill="none" />
            `
        },
        {
            id: 'k-flower',
            name: 'Madeliefje',
            price: 2.50,
            color: '#ffffff',
            svgContent: `
                <ellipse cx="0" cy="0" rx="3" ry="8" fill="rgba(255,255,255,0.7)" stroke="#aaa" stroke-width="0.5" class="silicone-backing-ring" />
                <!-- Petals -->
                <g fill="#ffffff" stroke="#e2e8f0" stroke-width="1">
                    <circle cx="0" cy="-9" r="5" />
                    <circle cx="8" cy="-5" r="5" />
                    <circle cx="8" cy="5" r="5" />
                    <circle cx="0" cy="9" r="5" />
                    <circle cx="-8" cy="5" r="5" />
                    <circle cx="-8" cy="-5" r="5" />
                </g>
                <!-- Center -->
                <circle cx="0" cy="0" r="5.5" fill="#ffd166" stroke="#f4a261" stroke-width="1" />
            `
        },
        {
            id: 'k-superman',
            name: 'Superman',
            price: 3.50,
            color: '#0077b6',
            svgContent: `
                <!-- Silicone Ring Backing -->
                <ellipse cx="0" cy="0" rx="3" ry="8" fill="rgba(255,255,255,0.7)" stroke="#aaa" stroke-width="0.5" class="silicone-backing-ring" />
                <!-- Red Cape -->
                <path d="M -5 -7 C -12 -4, -14 7, -14 13 C -6 15.5, 6 15.5, 12 13 C 16 10, 17 5, 15 0 C 12 -5, 6 -7, 5 -7 Z" fill="#d90429" stroke="#900c3f" stroke-width="1.2" />
                <!-- Suit Torso -->
                <path d="M -5 -7 L 5 -7 L 4 3 L -4 3 Z" fill="#0077b6" stroke="#005f73" stroke-width="1" />
                <!-- Suit Legs -->
                <path d="M -4 3 L -1.5 3 L -1.5 12 L -4 12 Z" fill="#0077b6" stroke="#005f73" stroke-width="1" />
                <path d="M 1.5 3 L 4 3 L 4 12 L 1.5 12 Z" fill="#0077b6" stroke="#005f73" stroke-width="1" />
                <!-- Briefs (red) -->
                <path d="M -4 3 L 4 3 L 3 6 L -3 6 Z" fill="#d90429" stroke="#900c3f" stroke-width="1" />
                <!-- Yellow Belt -->
                <rect x="-3.5" y="2" width="7" height="1.5" fill="#ffb703" stroke="#e09f00" stroke-width="0.5" />
                <rect x="-0.8" y="1.8" width="1.6" height="1.9" fill="#d90429" stroke="#900c3f" stroke-width="0.3" />
                <!-- Boots (red) -->
                <path d="M -4 12 L -1.5 12 L -1.5 16 L -5 16 Z" fill="#d90429" stroke="#900c3f" stroke-width="1" />
                <path d="M 1.5 12 L 4 12 L 5 16 L 1.5 16 Z" fill="#d90429" stroke="#900c3f" stroke-width="1" />
                <!-- Arms (hands on hips) -->
                <path d="M -5 -6 Q -9 -4 -8 -1 Q -7 0 -4 3" fill="none" stroke="#0077b6" stroke-width="3" stroke-linecap="round" />
                <circle cx="-4" cy="3" r="1.2" fill="#ffdbac" />
                <path d="M 5 -6 Q 9 -4 8 -1 Q 7 0 4 3" fill="none" stroke="#0077b6" stroke-width="3" stroke-linecap="round" />
                <circle cx="4" cy="3" r="1.2" fill="#ffdbac" />
                <!-- Neck -->
                <rect x="-1.5" y="-9" width="3" height="3" fill="#ffdbac" />
                <!-- Face -->
                <circle cx="0" cy="-11" r="4.5" fill="#ffdbac" stroke="#d4a373" stroke-width="0.8" />
                <!-- Hair -->
                <path d="M -4.8 -11.5 C -4.8 -15.5, 4.8 -15.5, 4.8 -11.5 C 4.8 -10.5, 3 -10.5, 3.5 -11.5 C 2 -12.5, -2 -12.5, -3.5 -11.5 C -3 -10.5, -4.8 -10.5, -4.8 -11.5 Z" fill="#111" />
                <path d="M -0.5 -12 Q 1 -10.5 0 -9.5" fill="none" stroke="#111" stroke-width="1.2" stroke-linecap="round" />
                <!-- Eyes -->
                <circle cx="-1.5" cy="-11.2" r="0.6" fill="#111" />
                <circle cx="1.5" cy="-11.2" r="0.6" fill="#111" />
                <!-- Smile -->
                <path d="M -1 -9.2 Q 0 -8.2 1 -9.2" fill="none" stroke="#111" stroke-width="0.6" stroke-linecap="round" />
                <!-- Pentagon Shield -->
                <polygon points="0,-5.5 2.5,-3.5 1.8,0 0,1.5 -1.8,0 -2.5,-3.5" fill="#ffb703" stroke="#d90429" stroke-width="0.5" />
                <!-- S shape inside shield -->
                <path d="M -1 -3 C -0.8 -3.5, 0.8 -3.5, 1 -2.8 C 0.8 -2.2, -0.8 -2.4, -1 -1.8 C -1.2 -0.8, 1 -0.8, 0.8 0.2 C 0.6 0.7, -0.8 0.7, -1 0.2" fill="none" stroke="#d90429" stroke-width="0.5" stroke-linecap="round" />
            `
        }
    ]
};

// --- Snap Targets Configuration (Clip Mode) ---
const CLIP_SNAP_TARGETS = [
    { x: 280, y: 120, id: 'target-temple-1', label: 'Pootje Links' },
    { x: 340, y: 120, id: 'target-temple-2', label: 'Pootje Midden-Links' },
    { x: 400, y: 120, id: 'target-temple-3', label: 'Pootje Midden-Rechts' },
    { x: 460, y: 120, id: 'target-temple-4', label: 'Pootje Rechts' },
    { x: 185, y: 70, id: 'target-front-1', label: 'Montuur Boven' }
];

// --- Customizer State ---
let customizerState = {
    targetAudience: 'kids',
    attachmentMethod: 'slide', // 'slide' | 'clip'
    frameColor: 'dark', // 'dark' | 'teal' | 'yellow' | 'pink' | 'crystal'
    placedBeads: [] // Array of { id: string, uniqueId: number, x: number, y: number }
};

// Unique key counter for placed beads
let beadUniqueIdCounter = 0;

// Local Storage Helper Functions
function saveStateToLocalStorage() {
    localStorage.setItem('bril_beads_customizer_state', JSON.stringify(customizerState));
}

function loadStateFromLocalStorage() {
    const saved = localStorage.getItem('bril_beads_customizer_state');
    if (saved) {
        try {
            customizerState = JSON.parse(saved);
            // Sync counter to prevent ID conflicts
            if (customizerState.placedBeads.length > 0) {
                const maxId = Math.max(...customizerState.placedBeads.map(b => b.uniqueId || 0));
                beadUniqueIdCounter = maxId;
            }
        } catch (e) {
            console.error("Failed to load state", e);
        }
    }
}

// --- Initialize Page & Event Handlers ---
document.addEventListener('DOMContentLoaded', () => {
    // Load state from local storage first (common to all pages)
    loadStateFromLocalStorage();
    
    // Carousel logic for index.html hero image
    const img1 = document.getElementById('hero-carousel-1');
    const img2 = document.getElementById('hero-carousel-2');
    if (img1 && img2) {
        setInterval(() => {
            if (img2.classList.contains('hidden')) {
                // Fade in girl (img2) on top of boy (img1)
                img2.classList.remove('hidden');
                img2.classList.add('visible');
                img2.style.opacity = '1';
            } else {
                // Fade out girl (img2) to reveal boy (img1)
                img2.classList.remove('visible');
                img2.classList.add('hidden');
                img2.style.opacity = '0';
            }
        }, 4000);
    }
    
    const isCustomizerPage = document.getElementById('interactive-glasses-svg') !== null;
    
    if (isCustomizerPage) {
        // Populate Initial Beads Tray
        renderBeadsTray();
        
        // Set frame color initial state
        updateFrameColorInSVG();
        
        // Force preview elements visibility based on method
        updateAttachmentUI();
        
        // Render placed beads
        renderPlacedBeads();
        updateActiveBeadsListUI();

        // Attach drag & drop handler elements
        const svgCanvas = document.getElementById('interactive-glasses-svg');
        
        // Support mouse drag
        svgCanvas.addEventListener('mousedown', handleDragStart);
        svgCanvas.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);

        // Support touch drag
        svgCanvas.addEventListener('touchstart', handleDragStart, { passive: false });
        svgCanvas.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('touchend', handleDragEnd);
    }
});

// --- UI Toggle Controls ---

function setAttachmentMethod(method) {
    if (customizerState.attachmentMethod === method) return;
    
    customizerState.attachmentMethod = method;
    
    // Update active tab styling
    document.getElementById('btn-attach-slide').classList.toggle('active', method === 'slide');
    document.getElementById('btn-attach-clip').classList.toggle('active', method === 'clip');
    
    // Update labels and SVG helper layers
    updateAttachmentUI();
    
    // Reset placed beads to suit the new system mapping
    clearBeads();
    
    saveStateToLocalStorage();
    playSound('click');
}

function setFrameColor(color) {
    customizerState.frameColor = color;
    
    // Update button states
    const dots = document.querySelectorAll('.color-dot');
    dots.forEach(dot => {
        dot.classList.toggle('active', dot.getAttribute('data-color') === color);
    });
    
    updateFrameColorInSVG();
    saveStateToLocalStorage();
    playSound('click');
}

// Update SVG Rim, Bridge and Temple fills dynamically
function updateFrameColorInSVG() {
    const rim = document.getElementById('main-frame-rim');
    const bridge = document.getElementById('main-frame-bridge');
    const temple = document.getElementById('temple-path-main');
    
    let fillStr = 'url(#frame-dark)';
    switch (customizerState.frameColor) {
        case 'dark': fillStr = 'url(#frame-dark)'; break;
        case 'teal': fillStr = 'url(#frame-teal)'; break;
        case 'yellow': fillStr = 'url(#frame-yellow)'; break;
        case 'pink': fillStr = 'url(#frame-pink)'; break;
        case 'crystal': fillStr = 'url(#frame-crystal)'; break;
        case 'dots': fillStr = 'url(#frame-dots)'; break;
    }
    
    rim.setAttribute('stroke', fillStr);
    bridge.setAttribute('stroke', fillStr);
    temple.setAttribute('stroke', fillStr);
}

// Show/hide helper guidelines in the interactive preview
function updateAttachmentUI() {
    const guideline = document.getElementById('slide-guideline');
    const snapTargetsLayer = document.getElementById('clip-snap-targets');
    const systemLabel = document.getElementById('preview-system-label');
    
    if (customizerState.attachmentMethod === 'slide') {
        guideline.style.opacity = '0.8';
        snapTargetsLayer.style.opacity = '0';
        systemLabel.textContent = 'Siliconen Ring';
        systemLabel.style.background = 'var(--teal-glow)';
        systemLabel.style.color = 'var(--teal)';
        systemLabel.style.borderColor = 'rgba(0, 180, 216, 0.3)';
    } else {
        guideline.style.opacity = '0';
        snapTargetsLayer.style.opacity = '1';
        systemLabel.textContent = 'Zachte Klik Clips';
        systemLabel.style.background = 'var(--pink-glow)';
        systemLabel.style.color = 'var(--pink)';
        systemLabel.style.borderColor = 'rgba(255, 92, 138, 0.3)';
    }
}

// --- Beads Tray Rendering ---

function renderBeadsTray() {
    const tray = document.getElementById('beads-tray-grid');
    tray.innerHTML = '';
    
    const activeBeads = BEADS_DATABASE[customizerState.targetAudience];
    
    activeBeads.forEach(bead => {
        const card = document.createElement('div');
        card.className = 'bead-item-card';
        card.title = `${bead.name} - €${bead.price.toFixed(2)}`;
        card.onclick = () => addBeadToGlasses(bead.id);
        
        card.innerHTML = `
            <svg class="bead-item-svg" viewBox="-16 -16 32 32" fill="none">
                <!-- Clean representation without backings in catalog -->
                ${cleanSvgForCatalog(bead.svgContent)}
            </svg>
            <span class="bead-item-name">${bead.name}</span>
        `;
        
        tray.appendChild(card);
    });
}

// Strip out the backing silicone ring elements for the tray icons
function cleanSvgForCatalog(svgContent) {
    return svgContent.replace(/<ellipse.*class="silicone-backing-ring".*?\/>/g, '');
}

// --- Placed Beads Management ---

function addBeadToGlasses(beadId) {
    const beadDef = BEADS_DATABASE[customizerState.targetAudience].find(b => b.id === beadId);
    if (!beadDef) return;
    
    // Max capacity check
    if (customizerState.placedBeads.length >= 6) {
        alert('Je kunt maximaal 6 Beads tegelijkertijd toevoegen!');
        return;
    }

    beadUniqueIdCounter++;
    const newBead = {
        id: beadId,
        uniqueId: beadUniqueIdCounter,
        price: beadDef.price,
        name: beadDef.name
    };

    if (customizerState.attachmentMethod === 'slide') {
        // Find best X coordinate
        // Sliding range: 270 to 470
        // We pack them from left to right, starting at 280
        const step = 28;
        const currentCount = customizerState.placedBeads.length;
        newBead.x = 280 + (currentCount * step);
        newBead.y = 120; // Locks horizontally on temple
    } else {
        // Clip mode: Find first unoccupied snap target
        const occupiedTargets = customizerState.placedBeads.map(b => getSnappedTargetIndex(b.x, b.y));
        let targetIndex = -1;
        
        for (let i = 0; i < CLIP_SNAP_TARGETS.length; i++) {
            if (!occupiedTargets.includes(i)) {
                targetIndex = i;
                break;
            }
        }
        
        // If all targets filled, clip on top of the first one
        if (targetIndex === -1) {
            targetIndex = 0;
        }
        
        newBead.x = CLIP_SNAP_TARGETS[targetIndex].x;
        newBead.y = CLIP_SNAP_TARGETS[targetIndex].y;
    }

    customizerState.placedBeads.push(newBead);
    
    // Sound & Render
    saveStateToLocalStorage();
    playSound(customizerState.attachmentMethod === 'clip' ? 'click' : 'pop');
    renderPlacedBeads();
    updateActiveBeadsListUI();
}

function removeBead(uniqueId) {
    customizerState.placedBeads = customizerState.placedBeads.filter(b => b.uniqueId !== uniqueId);
    saveStateToLocalStorage();
    playSound('delete');
    renderPlacedBeads();
    updateActiveBeadsListUI();
}

function clearBeads() {
    if (customizerState.placedBeads.length > 0) {
        customizerState.placedBeads = [];
        saveStateToLocalStorage();
        playSound('delete');
        renderPlacedBeads();
        updateActiveBeadsListUI();
    }
}

function randomizeBeads() {
    clearBeads();
    
    const count = Math.floor(Math.random() * 3) + 2; // 2 to 4 beads
    const activeBeads = BEADS_DATABASE[customizerState.targetAudience];
    
    for (let i = 0; i < count; i++) {
        const randBead = activeBeads[Math.floor(Math.random() * activeBeads.length)];
        addBeadToGlasses(randBead.id);
    }
}

// --- Render SVG Beads Layer ---

function renderPlacedBeads() {
    const layer = document.getElementById('placed-beads-layer');
    layer.innerHTML = '';
    
    const dbList = BEADS_DATABASE[customizerState.targetAudience];

    customizerState.placedBeads.forEach(bead => {
        const beadDef = dbList.find(b => b.id === bead.id);
        if (!beadDef) return;

        // Group container for individual bead
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('transform', `translate(${bead.x}, ${bead.y})`);
        group.setAttribute('class', 'interactive-placed-bead');
        group.setAttribute('data-unique-id', bead.uniqueId);

        // Adjust backing depending on the system
        let rawSvg = beadDef.svgContent;
        if (customizerState.attachmentMethod === 'clip') {
            // Replace silicone ring backing with a plastic clip backing
            const clipBacking = `
                <!-- Clip Backing -->
                <rect x="-3" y="-8" width="6" height="16" fill="rgba(0,0,0,0.6)" rx="1" />
                <path d="M -6 -6 L -3 -6 M -6 6 L -3 6" stroke="#222" stroke-width="2" />
            `;
            rawSvg = rawSvg.replace(/<ellipse.*class="silicone-backing-ring".*?\/>/g, clipBacking);
        }

        group.innerHTML = rawSvg;
        layer.appendChild(group);
    });
}

// --- Render Active Beads List UI & Prices ---

function updateActiveBeadsListUI() {
    const list = document.getElementById('active-beads-container');
    const emptyText = list.querySelector('.empty-list-text');
    const overlay = document.getElementById('canvas-overlay');
    
    // Hide instructions overlay if we have beads
    overlay.style.opacity = customizerState.placedBeads.length > 0 ? '0' : '0.8';
    
    // Clear dynamic children
    const tags = list.querySelectorAll('.list-bead-tag');
    tags.forEach(tag => tag.remove());

    if (customizerState.placedBeads.length === 0) {
        if (emptyText) emptyText.style.display = 'block';
    } else {
        if (emptyText) emptyText.style.display = 'none';
        
        customizerState.placedBeads.forEach(bead => {
            const tag = document.createElement('div');
            tag.className = 'list-bead-tag';
            tag.innerHTML = `
                <span>${bead.name} (€${bead.price.toFixed(2)})</span>
                <button type="button" class="btn-remove-bead" onclick="removeBead(${bead.uniqueId})" title="Verwijderen"><i class="fa-solid fa-circle-xmark"></i></button>
            `;
            list.appendChild(tag);
        });
    }

    // Update totals
    const totalCount = customizerState.placedBeads.length;
    const totalVal = customizerState.placedBeads.reduce((acc, curr) => acc + curr.price, 0);

    document.getElementById('summary-count-beads').textContent = `${totalCount} Bead${totalCount !== 1 ? 's' : ''}`;
    document.getElementById('summary-price-total').textContent = `€ ${totalVal.toFixed(2).replace('.', ',')}`;
}

// --- Drag and Drop Engine (Sliding / Snapping) ---

let dragElement = null;
let dragBeadStateRef = null;
let dragStartX = 0;
let dragStartY = 0;
let dragOffset = { x: 0, y: 0 };

function getEventCoords(e) {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

function handleDragStart(e) {
    const target = e.target.closest('.interactive-placed-bead');
    if (!target) return;

    e.preventDefault();
    
    dragElement = target;
    const uniqueId = parseInt(target.getAttribute('data-unique-id'));
    dragBeadStateRef = customizerState.placedBeads.find(b => b.uniqueId === uniqueId);
    
    if (!dragBeadStateRef) return;

    // Convert mouse/touch coordinates relative to SVG coordinate space
    const svg = document.getElementById('interactive-glasses-svg');
    const point = svg.createSVGPoint();
    const coords = getEventCoords(e);
    point.x = coords.x;
    point.y = coords.y;
    
    // Apply CTN inverse transformation to map screen to SVG space
    const transformedPoint = point.matrixTransform(svg.getScreenCTM().inverse());
    
    dragOffset.x = transformedPoint.x - dragBeadStateRef.x;
    dragOffset.y = transformedPoint.y - dragBeadStateRef.y;
}

function handleDragMove(e) {
    if (!dragElement || !dragBeadStateRef) return;
    
    e.preventDefault();

    const svg = document.getElementById('interactive-glasses-svg');
    const point = svg.createSVGPoint();
    const coords = getEventCoords(e);
    point.x = coords.x;
    point.y = coords.y;
    
    const transformedPoint = point.matrixTransform(svg.getScreenCTM().inverse());
    
    let targetX = transformedPoint.x - dragOffset.x;
    let targetY = transformedPoint.y - dragOffset.y;

    if (customizerState.attachmentMethod === 'slide') {
        // Enforce horizontal bounds on temple slide: 260 to 480
        targetX = Math.max(260, Math.min(480, targetX));
        targetY = 120; // Lock vertically to temple line
    } else {
        // Clip mode: Free dragging before drop-snap
        targetX = Math.max(120, Math.min(580, targetX));
        targetY = Math.max(30, Math.min(300, targetY));
    }

    // Update state & SVG element transform
    dragBeadStateRef.x = targetX;
    dragBeadStateRef.y = targetY;
    dragElement.setAttribute('transform', `translate(${targetX}, ${targetY})`);
    saveStateToLocalStorage();
}

function handleDragEnd(e) {
    if (!dragElement || !dragBeadStateRef) return;

    if (customizerState.attachmentMethod === 'clip') {
        // Find nearest snap target
        const targetIndex = getSnappedTargetIndex(dragBeadStateRef.x, dragBeadStateRef.y);
        const targetCoords = CLIP_SNAP_TARGETS[targetIndex];
        
        // Update to exact snapped coordinates
        dragBeadStateRef.x = targetCoords.x;
        dragBeadStateRef.y = targetCoords.y;
        dragElement.setAttribute('transform', `translate(${targetCoords.x}, ${targetCoords.y})`);
        
        playSound('click');
    } else {
        playSound('pop');
    }

    dragElement = null;
    dragBeadStateRef = null;
}

// Find closest snap target index based on euclidean distance
function getSnappedTargetIndex(x, y) {
    let minDistance = Infinity;
    let index = 0;
    
    CLIP_SNAP_TARGETS.forEach((target, i) => {
        const dist = Math.sqrt((x - target.x)**2 + (y - target.y)**2);
        if (dist < minDistance) {
            minDistance = dist;
            index = i;
        }
    });
    
    return index;
}

// --- Save Design Trigger ---

function saveDesign() {
    if (customizerState.placedBeads.length === 0) {
        alert('Voeg eerst wat beads toe aan je bril om je ontwerp op te slaan!');
        return;
    }
    
    playSound('save');
    
    // Save to list of designs in localStorage
    const savedDesigns = JSON.parse(localStorage.getItem('bril_beads_saved_designs') || '[]');
    const newDesign = {
        id: 'design_' + Date.now(),
        date: new Date().toLocaleDateString('nl-NL'),
        state: JSON.parse(JSON.stringify(customizerState))
    };
    savedDesigns.push(newDesign);
    localStorage.setItem('bril_beads_saved_designs', JSON.stringify(savedDesigns));
    
    const count = customizerState.placedBeads.length;
    const beadsStr = customizerState.placedBeads.map(b => b.name).join(', ');
    const system = customizerState.attachmentMethod === 'slide' ? 'Siliconen Ring' : 'Zachte Klik Clip';
    const color = customizerState.frameColor;
    
    alert(`🎉 Concept Opgeslagen!\n\nJe hebt een ontwerp gemaakt met:\n- Aantal beads: ${count}\n- Beads: ${beadsStr}\n- Bevestiging: ${system}\n- Montuur: ${color}\n\nJe kunt dit ontwerp nu bekijken en laden op de Account-pagina!`);
}

// --- Dynamic Template Loading (Inspiratie Stijlen) ---
function loadTemplate(templateName) {
    const onCustomizerPage = document.getElementById('placed-beads-layer') !== null;
    
    if (!onCustomizerPage) {
        // We are on index.html, load template state into memory and redirect
        customizerState.placedBeads = [];
        
        if (templateName === 'hero') {
            customizerState.frameColor = 'dots';
            customizerState.attachmentMethod = 'clip';
            beadUniqueIdCounter = 1;
            customizerState.placedBeads.push({
                id: 'k-superman',
                uniqueId: beadUniqueIdCounter,
                price: 3.50,
                name: 'Superman',
                x: 185,
                y: 70
            });
        } else if (templateName === 'kitty') {
            customizerState.frameColor = 'pink';
            customizerState.attachmentMethod = 'slide';
            
            const b1 = BEADS_DATABASE.kids.find(b => b.id === 'k-kitty');
            const b2 = BEADS_DATABASE.kids.find(b => b.id === 'k-flower');
            const b3 = BEADS_DATABASE.kids.find(b => b.id === 'k-smile');
            
            customizerState.placedBeads.push({
                id: 'k-kitty',
                uniqueId: 1,
                price: b1.price,
                name: b1.name,
                x: 280,
                y: 120
            });
            customizerState.placedBeads.push({
                id: 'k-flower',
                uniqueId: 2,
                price: b2.price,
                name: b2.name,
                x: 308,
                y: 120
            });
            customizerState.placedBeads.push({
                id: 'k-smile',
                uniqueId: 3,
                price: b3.price,
                name: b3.name,
                x: 336,
                y: 120
            });
            beadUniqueIdCounter = 3;
        } else if (templateName === 'rainbow') {
            customizerState.frameColor = 'pink';
            customizerState.attachmentMethod = 'slide';
            
            const b1 = BEADS_DATABASE.kids.find(b => b.id === 'k-kitty');
            const b2 = BEADS_DATABASE.kids.find(b => b.id === 'k-star');
            const b3 = BEADS_DATABASE.kids.find(b => b.id === 'k-panda');
            
            customizerState.placedBeads.push({
                id: 'k-kitty',
                uniqueId: 1,
                price: b1.price,
                name: b1.name,
                x: 280,
                y: 120
            });
            customizerState.placedBeads.push({
                id: 'k-star',
                uniqueId: 2,
                price: b2.price,
                name: b2.name,
                x: 308,
                y: 120
            });
            customizerState.placedBeads.push({
                id: 'k-panda',
                uniqueId: 3,
                price: b3.price,
                name: b3.name,
                x: 336,
                y: 120
            });
            beadUniqueIdCounter = 3;
        }
        
        saveStateToLocalStorage();
        window.location.href = 'ontwerpen.html';
        return;
    }

    // Standard flow (on customizer page)
    clearBeads();
    
    if (templateName === 'hero') {
        setFrameColor('dots');
        setAttachmentMethod('clip');
        
        beadUniqueIdCounter++;
        customizerState.placedBeads.push({
            id: 'k-superman',
            uniqueId: beadUniqueIdCounter,
            price: 3.50,
            name: 'Superman',
            x: 185,
            y: 70
        });
    } else if (templateName === 'kitty') {
        setFrameColor('pink');
        setAttachmentMethod('slide');
        
        addBeadToGlasses('k-kitty');
        addBeadToGlasses('k-flower');
        addBeadToGlasses('k-smile');
    } else if (templateName === 'rainbow') {
        setFrameColor('pink');
        setAttachmentMethod('slide');
        
        addBeadToGlasses('k-kitty');
        addBeadToGlasses('k-star');
        addBeadToGlasses('k-panda');
    }
    
    renderPlacedBeads();
    updateActiveBeadsListUI();
    saveStateToLocalStorage();
    
    const customizerEl = document.getElementById('customizer');
    if (customizerEl) {
        customizerEl.scrollIntoView({ behavior: 'smooth' });
    }
}

// --- Contact Form Submission Handler ---
function handleContactSubmit(e) {
    e.preventDefault();
    playSound('save');
    const name = document.getElementById('contact-name').value;
    alert(`🎉 Bedankt voor je bericht, ${name}!\n\nWe hebben je bericht ontvangen en nemen zo snel mogelijk contact met je op!`);
    e.target.reset();
}

// --- Header Navigation Click Handlers ---
function openCart(e) {
    e.preventDefault();
    playSound('click');
    if (customizerState.placedBeads.length === 0) {
        alert('Je winkelwagen is nog leeg! Voeg eerst wat Beads toe aan je bril.');
        return;
    }
    const count = customizerState.placedBeads.length;
    const price = customizerState.placedBeads.reduce((acc, curr) => acc + curr.price, 0).toFixed(2);
    alert(`🛒 Winkelwagen Inhoud:\n\nJe hebt momenteel ${count} Bead(s) op je bril.\nTotaalbedrag: € ${price.replace('.', ',')}\n\nGa naar 'Bestellen' om je ontwerp af te ronden!`);
}

function triggerOrder(e) {
    e.preventDefault();
    saveDesign();
}
