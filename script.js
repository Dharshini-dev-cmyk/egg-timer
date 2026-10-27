// ============================================================
// Egg Timer <3 - script.js
// SVG/PNG mascots: assets/image/teddy.png (used for sad + happy via CSS filter)
// Dog image: assets/image/Dog.png (transparent PNG)
// ============================================================

(function () {
    'use strict';

    // ------------------------------------------------------------
    // TIMER
    // ------------------------------------------------------------

    const FOCUS_DURATION = 25 * 60;
    const ALMOST_DONE_THRESHOLD = 60;

    let timerState = 'READY';
    let timeRemaining = FOCUS_DURATION;
    let timerInterval = null;
    let currentTheme = 'sunset';

    // Session length in milliseconds — drives the egg timeline summary
    // rendered in the completion message (see onTimerComplete).
    let focusDuration = FOCUS_DURATION * 1000;

    // ------------------------------------------------------------
    // ELEMENT HELPER
    // ------------------------------------------------------------

    const $ = (id) => document.getElementById(id);

    const timerDisplay = $('timerDisplay');
    const timerStatus = $('timerStatus');
    const startBtn = $('startBtn');
    const pauseBtn = $('pauseBtn');
    const resetBtn = $('resetBtn');

    const egg = $('egg');
    const eggCrack1 = $('eggCrack1');
    const eggCrack2 = $('eggCrack2');
    const eggCrack3 = $('eggCrack3');

    const chick = $('chick');
    const completionMessage = $('completionMessage');

    const dog = $('dog');
    const dogSpeech = $('dogSpeech');
    const dogTongue = $('dogTongue');
    const dogTail = document.querySelector('.dog-tail');

    const themeBtn = $('themeBtn');
    const breathBtn = $('breathBtn');

    const themeModal = $('themeModal');
    const breathModal = $('breathModal');
    const teddyModal = $('teddyModal');

    const closeThemeModal = $('closeThemeModal');
    const closeBreath = $('closeBreath');

    const teddyStay = $('teddyStay');
    const teddyBye = $('teddyBye');

    const teddyContainer = $('teddyContainer');
    const teddyImage = $('teddyImage');
    const teddyMessage = $('teddyMessage');
    const teddySubmessage = $('teddySubmessage');
    const welcomeTeddyImage = $('welcomeTeddyImage');

    // Welcome modal elements
    const welcomeModal = $('welcomeModal');
    const welcomeTeddyContainer = $('welcomeTeddyContainer');
    const welcomeMessage = $('welcomeMessage');
    const welcomeSubmessage = $('welcomeSubmessage');
    const welcomeClose = $('welcomeClose');

    const breathCircle = $('breathCircle');
    const breathText = $('breathText');

    const ambienceName = $('ambienceName');
    const footerCenter = $('footerCenter');

    const sessionsCount = $('sessionsCount');
    const focusMinutesEl = $('focusMinutes');
    const currentStreak = $('currentStreak');

        const confetti = $('confetti');

    // Theme decoration elements
    const moonEl = $('moon');
    const sunEl = $('sun');
    const birdsEl = $('birds');
    const starGlowEl = $('starGlow');

    // Greeting mascot elements (desk plushie companion)
    const greetingMascot = $('greetingMascot');
    const greetingMascotImg = $('greetingMascotImg');

    // ------------------------------------------------------------
    // FORCE CORRECT DOG IMAGE
    // ------------------------------------------------------------

        function setupDogImage() {

        if (!dog) return;

        /* Dog image uses transparent PNG: assets/image/Dog.png */

        if (dog.tagName === 'IMG') {

            dog.src = 'assets/image/Dog.png';
            dog.alt = 'Cute Egg Timer dog';

        } else {

            let dogImage = dog.querySelector('img');

            if (!dogImage) {

                dogImage = document.createElement('img');
                dog.appendChild(dogImage);
            }

            dogImage.src = 'assets/image/Dog.png';
            dogImage.alt = 'Cute Egg Timer dog';
            dogImage.style.display = 'block';
            dogImage.style.maxWidth = '100%';
            dogImage.style.height = 'auto';
            dogImage.style.objectFit = 'contain';
        }
    }

    // ------------------------------------------------------------
    // AUDIO MANAGER
    // ------------------------------------------------------------

    let audioCtx = null;
    let ambientNodes = null;

    const AudioManager = {

        init() {
            if (audioCtx) return;

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        },

        resume() {
            if (
                audioCtx &&
                audioCtx.state === 'suspended'
            ) {
                audioCtx.resume();
            }
        },

        playClick() {
            if (!audioCtx) return;

            this.resume();

            const oscillator = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            oscillator.connect(gain);
            gain.connect(audioCtx.destination);

            oscillator.frequency.setValueAtTime(
                800,
                audioCtx.currentTime
            );

            oscillator.frequency.exponentialRampToValueAtTime(
                600,
                audioCtx.currentTime + 0.1
            );

            gain.gain.setValueAtTime(
                0.3,
                audioCtx.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.01,
                audioCtx.currentTime + 0.1
            );

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
        },

        playHatch() {
            if (!audioCtx) return;

            this.resume();

            const oscillator = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            oscillator.connect(gain);
            gain.connect(audioCtx.destination);

            oscillator.type = 'sine';

            oscillator.frequency.setValueAtTime(
                400,
                audioCtx.currentTime
            );

            oscillator.frequency.exponentialRampToValueAtTime(
                800,
                audioCtx.currentTime + 0.3
            );

            oscillator.frequency.exponentialRampToValueAtTime(
                1200,
                audioCtx.currentTime + 0.5
            );

            gain.gain.setValueAtTime(
                0.3,
                audioCtx.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.01,
                audioCtx.currentTime + 0.6
            );

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.6);
        },

        playComplete() {
            if (!audioCtx) return;

            this.resume();

            const notes = [523, 659, 784, 1047];

            notes.forEach((frequency, index) => {

                const oscillator = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                const startTime =
                    audioCtx.currentTime + index * 0.15;

                oscillator.connect(gain);
                gain.connect(audioCtx.destination);

                oscillator.frequency.setValueAtTime(
                    frequency,
                    startTime
                );

                gain.gain.setValueAtTime(
                    0.2,
                    startTime
                );

                gain.gain.exponentialRampToValueAtTime(
                    0.01,
                    startTime + 0.4
                );

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.4);
            });
        },

        // Cute little "yay!" chime played when the completion popup
        // (happy teddy + message) is delivered to the user.
        playCutePop() {
            if (!audioCtx) return;

            this.resume();

            const notes = [659.25, 783.99, 987.77, 1318.51];

            notes.forEach((frequency, index) => {

                const oscillator = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                const startTime =
                    audioCtx.currentTime + index * 0.09;

                oscillator.type = 'triangle';

                oscillator.connect(gain);
                gain.connect(audioCtx.destination);

                oscillator.frequency.setValueAtTime(
                    frequency,
                    startTime
                );

                gain.gain.setValueAtTime(
                    0.0001,
                    startTime
                );

                gain.gain.exponentialRampToValueAtTime(
                    0.25,
                    startTime + 0.02
                );

                gain.gain.exponentialRampToValueAtTime(
                    0.0001,
                    startTime + 0.3
                );

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.32);
            });
        },

        playBreath() {
            if (!audioCtx) return;

            this.resume();

            const oscillator = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            oscillator.connect(gain);
            gain.connect(audioCtx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.value = 220;

            gain.gain.setValueAtTime(
                0.1,
                audioCtx.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.01,
                audioCtx.currentTime + 2
            );

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 2);
        },

        startAmbient(theme) {
            if (!audioCtx) return;

            this.resume();
            this.stopAmbient();

            if (theme === 'ocean') {
                this.startOcean();
            } else if (theme === 'forest') {
                this.startForest();
            } else if (theme === 'fireplace') {
                this.startFire();
            } else {
                this.startDefault();
            }
        },

        startOcean() {
            const bufferSize = 2 * audioCtx.sampleRate;

            const buffer = audioCtx.createBuffer(
                1,
                bufferSize,
                audioCtx.sampleRate
            );

            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;

            const filter =
                audioCtx.createBiquadFilter();

            filter.type = 'lowpass';
            filter.frequency.value = 400;

            const lfo =
                audioCtx.createOscillator();

            const lfoGain =
                audioCtx.createGain();

            lfo.frequency.value = 0.15;
            lfoGain.gain.value = 200;

            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);

            const gain =
                audioCtx.createGain();

            gain.gain.value = 0.08;

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            noise.start();
            lfo.start();

            ambientNodes = {
                noise: noise,
                lfo: lfo,
                gain: gain
            };
        },

        startForest() {
            const bufferSize = 2 * audioCtx.sampleRate;

            const buffer = audioCtx.createBuffer(
                1,
                bufferSize,
                audioCtx.sampleRate
            );

            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise =
                audioCtx.createBufferSource();

            noise.buffer = buffer;
            noise.loop = true;

            const filter =
                audioCtx.createBiquadFilter();

            filter.type = 'bandpass';
            filter.frequency.value = 800;
            filter.Q.value = 0.5;

            const lfo =
                audioCtx.createOscillator();

            const lfoGain =
                audioCtx.createGain();

            lfo.frequency.value = 0.1;
            lfoGain.gain.value = 300;

            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);

            const gain =
                audioCtx.createGain();

            gain.gain.value = 0.05;

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            noise.start();
            lfo.start();

            ambientNodes = {
                noise: noise,
                lfo: lfo,
                gain: gain
            };

            const bird = () => {

                if (!ambientNodes) return;

                const oscillator =
                    audioCtx.createOscillator();

                const birdGain =
                    audioCtx.createGain();

                oscillator.connect(birdGain);
                birdGain.connect(
                    audioCtx.destination
                );

                oscillator.type = 'sine';

                const frequency =
                    1200 + Math.random() * 800;

                oscillator.frequency.setValueAtTime(
                    frequency,
                    audioCtx.currentTime
                );

                oscillator.frequency.exponentialRampToValueAtTime(
                    frequency * 1.5,
                    audioCtx.currentTime + 0.1
                );

                birdGain.gain.setValueAtTime(
                    0.05,
                    audioCtx.currentTime
                );

                birdGain.gain.exponentialRampToValueAtTime(
                    0.01,
                    audioCtx.currentTime + 0.3
                );

                oscillator.start();
                oscillator.stop(
                    audioCtx.currentTime + 0.3
                );

                setTimeout(
                    bird,
                    3000 + Math.random() * 5000
                );
            };

            setTimeout(bird, 2000);
        },

        startFire() {
            const bufferSize = 2 * audioCtx.sampleRate;

            const buffer = audioCtx.createBuffer(
                1,
                bufferSize,
                audioCtx.sampleRate
            );

            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise =
                audioCtx.createBufferSource();

            noise.buffer = buffer;
            noise.loop = true;

            const filter =
                audioCtx.createBiquadFilter();

            filter.type = 'lowpass';
            filter.frequency.value = 200;

            const gain =
                audioCtx.createGain();

            gain.gain.value = 0.1;

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            noise.start();

            ambientNodes = {
                noise: noise,
                gain: gain
            };

            const crack = () => {

                if (!ambientNodes) return;

                const oscillator =
                    audioCtx.createOscillator();

                const crackGain =
                    audioCtx.createGain();

                oscillator.connect(crackGain);
                crackGain.connect(
                    audioCtx.destination
                );

                oscillator.type = 'square';

                oscillator.frequency.value =
                    100 + Math.random() * 200;

                crackGain.gain.setValueAtTime(
                    0.08,
                    audioCtx.currentTime
                );

                crackGain.gain.exponentialRampToValueAtTime(
                    0.01,
                    audioCtx.currentTime + 0.05
                );

                oscillator.start();
                oscillator.stop(
                    audioCtx.currentTime + 0.05
                );

                setTimeout(
                    crack,
                    500 + Math.random() * 2000
                );
            };

            setTimeout(crack, 500);
        },

        startDefault() {
            const oscillator =
                audioCtx.createOscillator();

            const gain =
                audioCtx.createGain();

            oscillator.connect(gain);
            gain.connect(audioCtx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.value = 110;
            gain.gain.value = 0.03;

            oscillator.start();

            ambientNodes = {
                osc: oscillator,
                gain: gain
            };
        },

        stopAmbient() {
            if (!ambientNodes) return;

            try {
                if (ambientNodes.noise) {
                    ambientNodes.noise.stop();
                }

                if (ambientNodes.osc) {
                    ambientNodes.osc.stop();
                }

                if (ambientNodes.lfo) {
                    ambientNodes.lfo.stop();
                }
            } catch (error) {
                // Already stopped
            }

            ambientNodes = null;
        }
    };

    // ------------------------------------------------------------
    // BACKGROUND ANIMATIONS
    // ------------------------------------------------------------

    function createStars() {

        const container = $('stars');

        if (!container) return;

        container.innerHTML = '';

        // ~240 stars, distributed naturally with varied size, brightness and speed
        const twinkleStyles = ['twinkle', 'twinkleFast', 'twinkleSlow'];

        for (let i = 0; i < 240; i++) {

            const star =
                document.createElement('div');

            star.className = 'star';

            star.style.left =
                Math.random() * 100 + '%';

            star.style.top =
                Math.random() * 100 + '%';

            // Mostly small stars with a few larger, brighter ones
            const roll = Math.random();

            let size;

            if (roll > 0.93) {
                size = 3.6 + Math.random() * 1.6;
            } else if (roll > 0.72) {
                size = 2.3 + Math.random() * 1.2;
            } else {
                size = 1.1 + Math.random() * 1.1;
            }

            star.style.width = size + 'px';
            star.style.height = size + 'px';

            // Varied opacity range so no two stars pulse identically
            const minOpacity =
                0.18 + Math.random() * 0.3;

            const maxOpacity =
                0.7 + Math.random() * 0.3;

            star.style.setProperty(
                '--star-min',
                minOpacity.toFixed(2)
            );

            star.style.setProperty(
                '--star-max',
                maxOpacity.toFixed(2)
            );

            // Varied twinkle speed + staggered delay
            star.style.animationName =
                twinkleStyles[i % twinkleStyles.length];

            star.style.animationDuration =
                (2 + Math.random() * 3.6).toFixed(2) + 's';

            star.style.animationDelay =
                (-Math.random() * 6).toFixed(2) + 's';

            // Bigger stars glow, plus a sprinkle of smaller ones
            if (size > 2.5 || roll > 0.86) {
                star.classList.add('glow-star');
            }

            container.appendChild(star);
        }
    }

    function createClouds() {

        const container = $('clouds');

        if (!container) return;

        container.innerHTML = '';

        for (let i = 0; i < 8; i++) {

            const cloud =
                document.createElement('div');

            cloud.className = 'cloud';

            cloud.style.top =
                5 + Math.random() * 30 + '%';

            cloud.style.width =
                80 + Math.random() * 120 + 'px';

            cloud.style.height =
                30 + Math.random() * 30 + 'px';

            cloud.style.setProperty(
                '--duration',
                30 + Math.random() * 40 + 's'
            );

            cloud.style.animationDelay =
                -Math.random() * 40 + 's';

            container.appendChild(cloud);
        }
    }

    function createBirds() {
        const container = $('birds');

        if (!container) return;

        // Respect the user's motion preference — skip ambient bird
        // animation entirely when reduced motion is requested.
        const prefersReducedMotion =
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches;

        if (prefersReducedMotion) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = '';

        // Fewer birds on narrow screens to keep the scene calm and
        // performant on mobile; more on wider screens for ambience.
        const width = window.innerWidth;
        const isMobile = width < 600;
        const birdCount = isMobile ? 3 : 6;

        // Day-like themes get a few extra birds for a lively sky.
        const isDay = currentTheme === 'sunset'
            || currentTheme === 'day'
            || currentTheme === 'ocean'
            || currentTheme === 'forest'
            || currentTheme === 'fireplace';
        const extraForDay = isDay && !isMobile ? 2 : 0;
        const total = birdCount + extraForDay;

        for (let i = 0; i < total; i++) {
            const bird =
                document.createElement('div');

            bird.className = 'bird';

            // Inline SVG gull silhouette — renders consistently across
            // platforms (unlike the plain emoji) and gives us a clean
            // shape we can flap via scaleY on the inner SVG.
            bird.innerHTML =
                '<svg class="bird-svg" viewBox="0 0 100 40" ' +
                'aria-hidden="true">' +
                '<path d="M4 26 C 22 8, 38 8, 50 22 C 62 8, 78 8, 96 26" ' +
                'stroke="currentColor" stroke-width="3" fill="none" ' +
                'stroke-linecap="round" stroke-linejoin="round"/>' +
                '</svg>';

            // Gentle vertical position across the upper sky.
            bird.style.top =
                8 + Math.random() * 32 + '%';

            // All birds start at the left edge; the birdFly keyframe
            // carries them across to the right and off-screen.
            bird.style.left = '0%';

            // Varied flight duration (14–26 s) so birds don't move in
            // lockstep — each has its own rhythm.
            const duration =
                14 + Math.random() * 12;
            bird.style.setProperty(
                '--duration',
                duration + 's'
            );

            // Stagger the start so the sky is always populated even when
            // every bird begins at left:0%.
            bird.style.animationDelay =
                -Math.random() * duration + 's';

            // Wing-flap speed varies per bird (0.3–0.6 s per flap) for
            // a natural, un-synchronized flapping feel.
            const flapSpeed =
                0.3 + Math.random() * 0.3;
            bird.style.setProperty(
                '--flap-speed',
                flapSpeed + 's'
            );

            // Slightly varied flap depth per bird.
            const flapDepth =
                0.3 + Math.random() * 0.2;
            bird.style.setProperty(
                '--flap-depth',
                flapDepth
            );

            // Bird size: clamp so it never gets too small on mobile or
            // too large on desktop. SVG scales with this font-size.
            bird.style.fontSize =
                14 + Math.random() * 8 + 'px';

            // Base opacity varies per bird for a sense of depth
            // (further birds are fainter). Driven by a custom property
            // so the birdFly keyframe can read it per-bird.
            const baseOpacity =
                0.4 + Math.random() * 0.4;
            bird.style.setProperty(
                '--bird-opacity',
                baseOpacity
            );

            // Alternate flight direction so birds traverse the full
            // viewport width in both directions.
            if (i % 2 === 0) {
                bird.style.animationDirection =
                    'normal';
                bird.style.setProperty(
                    '--bird-flip',
                    '1'
                );
            } else {
                bird.style.animationDirection =
                    'reverse';
                bird.style.setProperty(
                    '--bird-flip',
                    '-1'
                );
            }

            // Performance: tell the browser these properties will
            // change so it can promote the layer.
            bird.style.willChange =
                'transform, opacity';
            bird.style.backfaceVisibility =
                'hidden';

            container.appendChild(bird);
        }
    }

    function createFloatingHearts() {

        const container = $('floatingHearts');

        if (!container) return;

        container.innerHTML = '';

        for (let i = 0; i < 6; i++) {

            const heart =
                document.createElement('div');

            heart.className = 'fheart';
            heart.innerHTML = '♡';

            heart.style.left =
                10 + Math.random() * 80 + '%';

            heart.style.setProperty(
                '--duration',
                8 + Math.random() * 6 + 's'
            );

            heart.style.setProperty(
                '--delay',
                -Math.random() * 10 + 's'
            );

            heart.style.fontSize =
                12 + Math.random() * 10 + 'px';

            container.appendChild(heart);
        }
    }

    function createFireflies() {

        const container = $('fireflies');

        if (!container) return;

        container.innerHTML = '';

        for (let i = 0; i < 15; i++) {

            const firefly =
                document.createElement('div');

            firefly.className = 'firefly';

            firefly.style.left =
                Math.random() * 100 + '%';

            firefly.style.top =
                40 + Math.random() * 50 + '%';

            firefly.style.setProperty(
                '--duration',
                3 + Math.random() * 4 + 's'
            );

            firefly.style.setProperty(
                '--delay',
                -Math.random() * 5 + 's'
            );

            container.appendChild(firefly);
        }
    }

    function createEmbers() {

        const container = $('embers');

        if (!container) return;

        container.innerHTML = '';

        for (let i = 0; i < 20; i++) {

            const ember =
                document.createElement('div');

            ember.className = 'ember';

            ember.style.left =
                20 + Math.random() * 60 + '%';

            ember.style.bottom =
                5 + Math.random() * 20 + '%';

            ember.style.setProperty(
                '--duration',
                3 + Math.random() * 4 + 's'
            );

            ember.style.setProperty(
                '--delay',
                -Math.random() * 5 + 's'
            );

            container.appendChild(ember);
        }
    }

    function createEggSparkles() {

        const container = $('eggSparkles');

        if (!container) return;

        container.innerHTML = '';

        for (let i = 0; i < 5; i++) {

            const sparkle =
                document.createElement('div');

            sparkle.className =
                'egg-sparkle';

            sparkle.style.left =
                20 + Math.random() * 60 + '%';

            sparkle.style.top =
                10 + Math.random() * 80 + '%';

            sparkle.style.animationDelay =
                Math.random() * 2 + 's';

            container.appendChild(sparkle);
        }
    }

    // ------------------------------------------------------------
    // TIMER DISPLAY
    // ------------------------------------------------------------

    function formatTime(seconds) {

        const minutes =
            Math.floor(seconds / 60);

        const secs =
            seconds % 60;

        return (
            minutes.toString().padStart(2, '0') +
            ':' +
            secs.toString().padStart(2, '0')
        );
    }

    function updateTimerDisplay() {

        if (!timerDisplay) return;

        timerDisplay.textContent =
            formatTime(timeRemaining);

        document.title =
            formatTime(timeRemaining) +
            ' - Egg Timer <3';
    }

    // ------------------------------------------------------------
    // TIMER STATES
    // ------------------------------------------------------------

    function setTimerState(state) {

        timerState = state;

        updateUIForState();
    }

    function updateUIForState() {

        if (egg) {
            egg.classList.remove(
                'glow',
                'shake'
            );
        }

        if (chick) {
            chick.classList.remove('visible');
        }

        if (dog) {
            dog.classList.remove(
                'bounce',
                'celebrate',
                'sleeping'
            );
        }

        if (dogTail) {
            dogTail.classList.remove('fast-wag');
        }

        if (dogTongue) {
            dogTongue.classList.remove('visible');
        }

        switch (timerState) {

            case 'READY':

                if (timerStatus) {
                    timerStatus.textContent =
                        'Your egg is ready!';
                }

                if (completionMessage) {
                    completionMessage.textContent = '';
                }

                setDogState('idle');

                break;

            case 'FOCUS':

                if (timerStatus) {
                    timerStatus.textContent =
                        'Stay focused!';
                }

                setDogState('focus');

                if (egg) {
                    egg.classList.add('glow');
                }

                break;

            case 'PAUSED':

                if (timerStatus) {
                    timerStatus.textContent =
                        'Paused';
                }

                setDogState('pause');

                if (dog) {
                    dog.classList.add('sleeping');
                }

                break;

            case 'ALMOST_DONE':

                if (timerStatus) {
                    timerStatus.textContent =
                        'Almost there!';
                }

                setDogState('almost');

                if (egg) {
                    egg.classList.add(
                        'glow',
                        'shake'
                    );
                }

                if (dogTail) {
                    dogTail.classList.add('fast-wag');
                }

                break;

            case 'CRACKING':

                if (timerStatus) {
                    timerStatus.textContent =
                        'Cracking!';
                }

                if (egg) {
                    egg.classList.add(
                        'glow',
                        'shake'
                    );
                }

                showCracks();
                setDogState('almost');

                break;

            case 'HATCHING':

                if (timerStatus) {
                    timerStatus.textContent =
                        'Hatching!';
                }

                hideCracks();

                if (chick) {
                    chick.classList.add('visible');
                }

                setDogState('celebrate');

                break;

            case 'CHICK':
            case 'COMPLETE':

                if (timerStatus) {
                    timerStatus.textContent =
                        'Session Complete!';
                }

                if (chick) {
                    chick.classList.add('visible');
                }

                if (completionMessage) {
                    completionMessage.textContent =
                        'You did it! 🎉';
                }

                setDogState('celebrate');

                break;
        }
    }

    function showCracks() {
        // Crack opacity is now handled via CSS growth stages
        // Clear any inline opacity to let CSS classes take effect
        if (eggCrack1) {
            eggCrack1.style.opacity = '';
        }

        if (eggCrack2) {
            eggCrack2.style.opacity = '';
        }

        if (eggCrack3) {
            eggCrack3.style.opacity = '';
        }
    }

    function hideCracks() {
        // Crack opacity is now handled via CSS growth stages
        // Clear any inline opacity to let CSS classes take effect
        if (eggCrack1) {
            eggCrack1.style.opacity = '';
        }

        if (eggCrack2) {
            eggCrack2.style.opacity = '';
        }

        if (eggCrack3) {
            eggCrack3.style.opacity = '';
        }
    }

    // ------------------------------------------------------------
    // EGG GROWTH PROGRESSION
    // ------------------------------------------------------------

    function updateEggGrowth() {
        if (!egg) return;

        // Calculate progress: 0 at start, 1 at completion
        const elapsed = FOCUS_DURATION - timeRemaining;
        const progress = Math.min(elapsed / FOCUS_DURATION, 1);

        // Set CSS custom property for smooth visual progression
        egg.style.setProperty('--growth', progress.toFixed(3));

        // Remove all growth stage classes first
        egg.classList.remove(
            'developing',
            'crack-stage-1',
            'crack-stage-2',
            'crack-stage-3',
            'hatching'
        );

        // Remove chick animation classes. "peeking" is managed below (so its
        // bob animation is not restarted on every tick).
        if (chick) {
            chick.classList.remove('emerging', 'idle-bounce', 'flying-away');
        }

        // Timeline for a 25-min session (scales with any duration):
        //   25 → 20 min left … egg glows
        //   20 → 15 min left … realistic cracks appear around the shell
        //   15 → 10 min left … chick peeks out
        //   10 →  5 min left … cracks fill in, chick keeps peeking
        //    5 →  0 min left … chick jumps in joy
        //   completion ………… hatch, chick flies out, teddy celebrates
        if (progress < 0.2) {
            // 25 → 20 min left: intact egg, gentle warm glow
            egg.classList.add('developing');
        } else if (progress < 0.4) {
            // 20 → 15 min left: first realistic cracks around the shell
            egg.classList.add('developing', 'crack-stage-1');
        } else if (progress < 0.6) {
            // 15 → 10 min left: cracks spread further
            egg.classList.add('developing', 'crack-stage-2');
        } else {
            // 10 min → end: full cracks all around, ready to hatch
            egg.classList.add('developing', 'crack-stage-3');
        }

        // 15 min left → hatch: the chick peeks out; during the final 5
        // minutes it also jumps in joy. classList add/remove is idempotent,
        // so the animations keep running smoothly across ticks.
        if (chick) {
            const peeking = progress >= 0.4 && progress < 1;
            const joyful = progress >= 0.8 && progress < 1;

            if (peeking) {
                chick.classList.add('peeking');
            } else {
                chick.classList.remove('peeking');
            }

            if (joyful) {
                chick.classList.add('joy-jump');
            } else {
                chick.classList.remove('joy-jump');
            }
        }
    }

    // ------------------------------------------------------------
    // START TIMER
    // ------------------------------------------------------------

    // ------------------------------------------------------------
    // DOG TAIL WAG CONTROL
    // ------------------------------------------------------------

    function setDogTailState(state) {
        if (!dog) return;

        // Remove all tail animation classes
        dog.classList.remove('tail-wag', 'tail-wag-fast', 'celebrate');

        switch (state) {
            case 'wag':
                dog.classList.add('tail-wag');
                break;
            case 'fast':
                dog.classList.add('tail-wag-fast');
                break;
            case 'celebrate':
                dog.classList.add('celebrate');
                break;
            case 'idle':
            default:
                // No tail animation, just floating
                break;
        }
    }

    // ------------------------------------------------------------
    // START
    // ------------------------------------------------------------

    function startTimer() {

        if (
            timerState === 'FOCUS' ||
            timerState === 'ALMOST_DONE'
        ) {
            return;
        }

        AudioManager.init();
        AudioManager.resume();
        AudioManager.playClick();

        if (
            timerState === 'COMPLETE' ||
            timerState === 'CHICK'
        ) {
            resetTimer();
            return;
        }

        setTimerState('FOCUS');
        setDogTailState('wag');

        // Happy/excited Teddy reaction on start
        if (welcomeTeddyContainer) {
            welcomeTeddyContainer.className = 'teddy-container happy';
        }

        timerInterval = setInterval(() => {

            timeRemaining--;

            updateTimerDisplay();

            // Update egg growth based on timer progress
            updateEggGrowth();

            if (
                timeRemaining <=
                    ALMOST_DONE_THRESHOLD &&
                timeRemaining > 0
            ) {
                setTimerState('ALMOST_DONE');
                setDogTailState('fast');
            }

            if (timeRemaining <= 0) {

                clearInterval(timerInterval);
                timerInterval = null;

                onTimerComplete();
            }

        }, 1000);
    }

    // ------------------------------------------------------------
    // PAUSE
    // ------------------------------------------------------------

    function pauseTimer() {

        if (
            timerState !== 'FOCUS' &&
            timerState !== 'ALMOST_DONE'
        ) {
            return;
        }

        AudioManager.init();
        AudioManager.resume();
        AudioManager.playClick();

        if (timerInterval) {

            clearInterval(timerInterval);
            timerInterval = null;
        }

        setTimerState('PAUSED');
        setDogTailState('idle');
    }

    // ------------------------------------------------------------
    // RESET
    // ------------------------------------------------------------

    function resetTimer() {

        AudioManager.init();
        AudioManager.resume();
        AudioManager.playClick();

        if (timerInterval) {

            clearInterval(timerInterval);
            timerInterval = null;
        }

        timeRemaining =
            FOCUS_DURATION;

        updateTimerDisplay();

        hideCracks();

        // Reset egg growth state
        if (egg) {
            egg.classList.remove(
                'developing',
                'crack-stage-1',
                'crack-stage-2',
                'crack-stage-3',
                'hatching'
            );
            egg.style.setProperty('--growth', '0');
        }

        // Reset chick state
        if (chick) {
            chick.classList.remove(
                'visible',
                'emerging',
                'idle-bounce',
                'peeking',
                'joy-jump',
                'flying-away'
            );
            chick.style.setProperty('--growth', '0');
        }

        setTimerState('READY');
        setDogTailState('idle');
    }

    // ------------------------------------------------------------
    // TIMER COMPLETE
    // ------------------------------------------------------------

    function onTimerComplete() {

        setTimerState('CRACKING');

        // Start hatching animation
        if (egg) {
            egg.classList.add('hatching');
        }

        // Chick emerges during hatching (stop the peek/joy animations first)
        if (chick) {
            chick.classList.remove('peeking', 'joy-jump');
            chick.classList.add('emerging', 'visible');
            chick.style.setProperty('--growth', '1');
        }

        AudioManager.playHatch();

        // Once the chick has finished popping (~0.9 s), let it perch and
        // bounce on the shell until the session-complete celebration.
        setTimeout(() => {
            if (chick) {
                chick.classList.remove('emerging');
                chick.classList.add('idle-bounce');
            }
        }, 950);

        // ── Egg animation timing summary ──────────────────────────
        // Surface the egg-growth / crack / hatch timing in the UI so the
        // user can see how the egg animated during this session.
        if (completionMessage) {
            const sessionMinutes =
                focusDuration > 0
                    ? Math.round(focusDuration / 60000)
                    : 25;
            // Egg glow → cracks → peek → joy timeline (any duration)
            const glowFrom = sessionMinutes;
            const glowTo = Math.round(sessionMinutes * 0.8);
            const crackFrom = Math.round(sessionMinutes * 0.8);
            const crackTo = Math.round(sessionMinutes * 0.6);
            const peekFrom = Math.round(sessionMinutes * 0.6);
            const peekTo = Math.round(sessionMinutes * 0.4);
            const joyFrom = Math.round(sessionMinutes * 0.2);
            completionMessage.innerHTML =
                '<div class="completion-timing">' +
                '<span class="timing-label">✨ Egg glows</span> ' +
                '<span class="timing-value">' +
                glowFrom + ' → ' + glowTo + ' min left</span><br>' +
                '<span class="timing-label">💥 Cracks around</span> ' +
                '<span class="timing-value">' +
                crackFrom + ' → ' + crackTo + ' min left</span><br>' +
                '<span class="timing-label">🐥 Chick peeks</span> ' +
                '<span class="timing-value">' +
                peekFrom + ' → ' + peekTo + ' min left</span><br>' +
                '<span class="timing-label">🎉 Chick jumps in joy</span> ' +
                '<span class="timing-value">' +
                joyFrom + ' → 0 min left</span><br>' +
                '<span class="timing-label">🎊 Hatch + fly out</span> ' +
                '<span class="timing-value">at session end</span><br>' +
                '<span class="timing-label">💗 Teddy celebrates</span> ' +
                '<span class="timing-value">right after ✦</span>' +
                '</div>';
            completionMessage.style.display = 'block';
        }

        setTimeout(() => {

            setTimerState('HATCHING');

            setTimeout(() => {

                setTimerState('COMPLETE');

                AudioManager.playComplete();

                celebrateCompletion();

                updateStats();

                // Chick launches up and out of the screen…
                if (chick) {
                    chick.classList.remove(
                        'emerging',
                        'idle-bounce',
                        'peeking',
                        'joy-jump'
                    );
                    chick.classList.add('flying-away');
                }

                // …and the egg settles back into a gentle float
                // (full cracks stay visible via crack-stage-3).
                if (egg) {
                    egg.classList.remove('hatching', 'shake');
                }

                // Teddy joins the party: happy teddy pops up while the
                // confetti from celebrateCompletion() is still falling.
                setTimeout(() => {
                    showSessionCompleteModal();
                }, 1400);

            }, 1000);

        }, 1500);
    }

    // ------------------------------------------------------------
    // DOG STATES
    // ------------------------------------------------------------

    function setDogState(state) {

        if (!dog) return;

        dog.classList.remove(
            'bounce',
            'walking',
            'celebrate',
            'sleeping'
        );

        if (dogTail) {
            dogTail.classList.remove('fast-wag');
        }

        if (dogTongue) {
            dogTongue.classList.remove('visible');
        }

        switch (state) {

            case 'idle':

                if (dogSpeech) {
                    dogSpeech.textContent =
                        'Ready when you are ♥';
                }

                dog.classList.add('walking');

                break;

            case 'start':

                if (dogSpeech) {
                    dogSpeech.textContent =
                        "Let's do this! ✨";
                }

                dog.classList.add('bounce');

                spawnDogHearts();

                break;

            case 'focus':

                if (dogSpeech) {
                    dogSpeech.textContent =
                        'Stay focused ♥';
                }

                dog.classList.add('walking');

                break;

            case 'pause':

                if (dogSpeech) {
                    dogSpeech.textContent =
                        'Taking a little break?';
                }

                dog.classList.add('sleeping');

                break;

            case 'almost':

                if (dogSpeech) {
                    dogSpeech.textContent =
                        'Almost there! ✨';
                }

                dog.classList.add('bounce');

                if (dogTail) {
                    dogTail.classList.add('fast-wag');
                }

                spawnDogHearts();

                break;

            case 'celebrate':

                if (dogSpeech) {
                    dogSpeech.textContent =
                        'You did it! 🎉';
                }

                dog.classList.add('celebrate');

                if (dogTail) {
                    dogTail.classList.add('fast-wag');
                }

                if (dogTongue) {
                    dogTongue.classList.add('visible');
                }

                spawnDogHearts();

                break;
        }
    }

    // ------------------------------------------------------------
    // DOG HEARTS
    // ------------------------------------------------------------

    function spawnDogHearts() {

        const container =
            $('dogHearts');

        if (!container) return;

        for (let i = 0; i < 4; i++) {

            setTimeout(() => {

                const heart =
                    document.createElement('div');

                heart.className =
                    'dog-heart';

                heart.innerHTML = '♥';

                heart.style.left =
                    30 + Math.random() * 60 + '%';

                heart.style.top =
                    10 + Math.random() * 40 + '%';

                container.appendChild(heart);

                setTimeout(() => {
                    heart.remove();
                }, 1500);

            }, i * 200);
        }
    }

    // ------------------------------------------------------------
    // THEMES
    // ------------------------------------------------------------

    const themeData = {

        sunset: {
            name: 'Sunset Ambience',
            footer:
                "Take a deep breath. You've got this! ♥",
            icon: '🌅'
        },

        night: {
            name: 'Night Ambience',
            footer:
                'Peaceful night ahead ♥',
            icon: '💜'
        },

        ocean: {
            name: 'Ocean Waves',
            footer:
                '♪ Ocean Waves',
            icon: '🌊'
        },

        forest: {
            name: 'Forest Ambience',
            footer:
                '♪ Forest Ambience',
            icon: '🌲'
        },

        fireplace: {
            name: 'Fireplace',
            footer:
                '♪ Fireplace',
            icon: '🔥'
        }
    };

    function setTheme(theme) {

        if (!themeData[theme]) {
            theme = 'sunset';
        }

        currentTheme = theme;

        document.body.className =
            'theme-' + theme;

        if (ambienceName) {
            ambienceName.textContent =
                themeData[theme].name;
        }

        if (footerCenter) {
            footerCenter.textContent =
                themeData[theme].footer;
        }

        if (themeBtn) {
            themeBtn.textContent =
                themeData[theme].icon;
        }

        AudioManager.init();
        AudioManager.resume();
        AudioManager.playClick();
        AudioManager.startAmbient(theme);

        updateThemeDecorations(theme);
        generateOceanWavesIfOcean();

        localStorage.setItem(
            'egg-timer-theme',
            theme
        );
    }

    function updateThemeDecorations(theme) {
        // Night: moon + stars visible, sun + birds hidden
        // Day/Sunset: sun + birds visible, moon + stars hidden
        const isNight = theme === 'night';
        const isDay = theme === 'sunset' || theme === 'day' || theme === 'ocean' || theme === 'forest' || theme === 'fireplace';

        if (moonEl) {
            moonEl.style.opacity = isNight ? '1' : '0';
        }

        if (sunEl) {
            sunEl.style.opacity = isDay ? '1' : '0';
        }

        if (birdsEl) {
            birdsEl.style.opacity = isDay ? '1' : '0';
        }

        if (starGlowEl) {
            starGlowEl.style.opacity = isNight ? '0.6' : '0';
        }

        // Update star opacity for night/day
        // Stars are handled via CSS .theme-night .star vs .theme-sunset .star
        // Just clear inline styles to let CSS take over
        const stars = document.querySelectorAll('.star');
        stars.forEach((star) => {
            star.style.opacity = '';
        });

        // Update cloud visibility
        const clouds = document.querySelector('.clouds');
        if (clouds) {
            clouds.style.opacity = isDay ? '0.5' : '0.14';
        }
    }

    // ─── OCEAN WAVES ──────────────────────────────────────────
    // Pool-based wave layer generation. Called when the Ocean theme
    // is selected (via the theme modal "plain" open path).

    let oceanWavesEl = null;
    let wavePool = [];

    function getOceanWavesEl() {
        if (oceanWavesEl) return oceanWavesEl;
        oceanWavesEl = document.getElementById('oceanWaves');
        return oceanWavesEl;
    }

    function buildWaveLayer(index) {
        const layer = document.createElement('div');
        layer.className = 'wave wave-' + (index + 1);
        // Each wave is a wide soft ellipse that drifts horizontally.
        // The CSS `.wave` rule already provides the animation; we just
        // vary the delay per layer so the waves don't all sync up.
        const delays = [0, 1.4, 2.8, 4.1, 5.6];
        layer.style.setProperty('--wave-delay', delays[index % delays.length] + 's');
        layer.style.setProperty('--wave-amplitude', (6 + index * 2) + 'px');
        return layer;
    }

    function generateOceanWaves() {
        const container = getOceanWavesEl();
        if (!container) return;

        // Remove any previously generated wave layers.
        wavePool.forEach((layer) => layer.remove());
        wavePool = [];

        // Create 5 layered wave layers for depth.
        for (let i = 0; i < 5; i++) {
            const layer = buildWaveLayer(i);
            container.appendChild(layer);
            wavePool.push(layer);
        }

        // Fade the waves container in.
        container.classList.add('active');
    }

    function clearOceanWaves() {
        const container = getOceanWavesEl();
        if (!container) return;
        wavePool.forEach((layer) => layer.remove());
        wavePool = [];
        container.classList.remove('active');
    }

    function generateOceanWavesIfOcean() {
        // Only generate waves when the Ocean theme is the currently
        // active theme. If another theme is active, clear any existing
        // waves so they don't linger.
        const container = getOceanWavesEl();
        if (!container) return;

        if (currentTheme === 'ocean') {
            generateOceanWaves();
        } else {
            clearOceanWaves();
        }
    }

    // ─── COMPLETION REPORT ────────────────────────────────────

    // ------------------------------------------------------------
    // STATISTICS
    // ------------------------------------------------------------

    function loadStats() {

        let stats = {};

        try {

            stats = JSON.parse(
                localStorage.getItem(
                    'egg-timer-stats'
                ) || '{}'
            );

        } catch (error) {

            stats = {};
        }

        if (sessionsCount) {
            sessionsCount.textContent =
                stats.sessions || 0;
        }

        if (focusMinutesEl) {
            focusMinutesEl.textContent =
                stats.focusMinutes || 0;
        }

        if (currentStreak) {
            currentStreak.textContent =
                stats.streak || 0;
        }
    }

    function updateStats() {

        let stats = {};

        try {

            stats = JSON.parse(
                localStorage.getItem(
                    'egg-timer-stats'
                ) || '{}'
            );

        } catch (error) {

            stats = {};
        }

        stats.sessions =
            (stats.sessions || 0) + 1;

        stats.focusMinutes =
            (stats.focusMinutes || 0) + 25;

        stats.streak =
            (stats.streak || 0) + 1;

        localStorage.setItem(
            'egg-timer-stats',
            JSON.stringify(stats)
        );

        loadStats();
    }

    // ------------------------------------------------------------
    // COMPLETION CELEBRATION
    // ------------------------------------------------------------

    function celebrateCompletion() {

        if (!confetti) return;

        const colors = [
            '#ff6b9d',
            '#ffd700',
            '#ff4081',
            '#a855f7',
            '#4caf50',
            '#00bcd4'
        ];

        for (let i = 0; i < 50; i++) {

            setTimeout(() => {

                const piece =
                    document.createElement('div');

                piece.className =
                    'confetti-piece';

                piece.style.left =
                    Math.random() * 100 + '%';

                piece.style.backgroundColor =
                    colors[
                        Math.floor(
                            Math.random() *
                            colors.length
                        )
                    ];

                piece.style.setProperty(
                    '--duration',
                    2 + Math.random() * 2 + 's'
                );

                piece.style.borderRadius =
                    Math.random() > 0.5
                        ? '50%'
                        : '0';

                piece.style.width =
                    6 + Math.random() * 8 + 'px';

                piece.style.height =
                    6 + Math.random() * 8 + 'px';

                confetti.appendChild(piece);

                setTimeout(() => {
                    piece.remove();
                }, 4000);

            }, i * 50);
        }

        const sparkleContainer =
            $('sparkles');

        if (!sparkleContainer) return;

        for (let j = 0; j < 10; j++) {

            const sparkle =
                document.createElement('div');

            sparkle.className = 'sparkle';

            sparkle.style.left =
                30 + Math.random() * 40 + '%';

            sparkle.style.top =
                20 + Math.random() * 40 + '%';

            sparkle.style.animationDelay =
                Math.random() + 's';

            sparkleContainer.appendChild(
                sparkle
            );

            setTimeout(() => {
                sparkle.remove();
            }, 3000);
        }
    }

    // ------------------------------------------------------------
    // BREATHING EXERCISE
    // ------------------------------------------------------------

    let breathInterval = null;

    function startBreath() {

        AudioManager.init();
        AudioManager.resume();
        AudioManager.playBreath();

        if (breathModal) {
            breathModal.classList.add('active');
        }

        if (breathCircle) {
            breathCircle.classList.add('breathing');
        }

        let phase = 0;

        const phases = [
            'Breathe in...',
            'Hold...',
            'Breathe out...',
            'Hold...'
        ];

        function nextPhase() {

            if (breathText) {
                breathText.textContent =
                    phases[phase];
            }

            phase =
                (phase + 1) %
                phases.length;
        }

        nextPhase();

        if (breathInterval) {
            clearInterval(breathInterval);
        }

        breathInterval =
            setInterval(nextPhase, 3000);
    }

    function stopBreath() {

        if (breathModal) {
            breathModal.classList.remove(
                'active'
            );
        }

        if (breathCircle) {
            breathCircle.classList.remove(
                'breathing'
            );
        }

        if (breathInterval) {

            clearInterval(
                breathInterval
            );

            breathInterval = null;
        }
    }

    // ------------------------------------------------------------
    // TEDDY CLOSE CONFIRMATION
    // ------------------------------------------------------------

    function showTeddyModal() {

        if (
            timerState !== 'FOCUS' &&
            timerState !== 'ALMOST_DONE' &&
            timerState !== 'PAUSED'
        ) {

            if (
                window.electronAPI &&
                window.electronAPI.confirmClose
            ) {
                window.electronAPI.confirmClose();
            }

            return;
        }

        if (!teddyModal) return;

                if (teddyImage) {
            teddyImage.src = 'assets/image/teddy_crying.png';
        }

        teddyModal.classList.add('no-backdrop');
        teddyModal.classList.add('active');

        if (teddyContainer) {
            teddyContainer.className =
                'teddy-container sad';
        }

        if (teddyMessage) {
            teddyMessage.textContent =
                "Aww... stay a little longer? 🥺";
        }

        if (teddySubmessage) {
            teddySubmessage.textContent =
                'Your focus session is still running.';
        }

        if (teddyStay) {
            teddyStay.style.display = '';
        }

        if (teddyBye) {
            teddyBye.style.display = '';
        }
    }

        function onTeddyStay() {

                if (teddyImage) {
            teddyImage.src = 'assets/image/teddy.png';
        }

                if (teddyContainer) {
            teddyContainer.className = 'teddy-container happy';
        }

        if (teddyMessage) {
            teddyMessage.textContent =
                "Yay! Let's keep going! ♥";
        }

        if (teddySubmessage) {
            teddySubmessage.textContent = '';
        }

        setTimeout(() => {

            if (teddyModal) {
                teddyModal.classList.remove(
                    'active'
                );
            }

            if (
                window.electronAPI &&
                window.electronAPI.cancelClose
            ) {
                window.electronAPI.cancelClose();
            }

        }, 1000);
    }

    function onTeddyBye() {

        // Drop the dark veil so the "I'll miss you" moment feels lighter.
        if (teddyModal) {
            teddyModal.classList.add('no-backdrop');
        }

        if (teddyContainer) {
            teddyContainer.className =
                'teddy-container leaving';
        }

        if (teddyMessage) {
            teddyMessage.textContent =
                "Okay... I'll miss you. 🥺";
        }

        if (teddySubmessage) {
            teddySubmessage.textContent = '';
        }

        if (teddyStay) {
            teddyStay.style.display = 'none';
        }

        if (teddyBye) {
            teddyBye.style.display = 'none';
        }

        setTimeout(() => {

            if (teddyModal) {
                teddyModal.classList.remove(
                    'active'
                );
            }

            if (
                window.electronAPI &&
                window.electronAPI.confirmClose
            ) {
                window.electronAPI.confirmClose();
            }

        }, 1500);
    }

    // ------------------------------------------------------------
    // WELCOME MODAL
    // ------------------------------------------------------------

    function showWelcomeModal() {
        if (welcomeModal) {
            welcomeModal.classList.add('active');
        }
    }

    function hideWelcomeModal() {
        if (welcomeModal) {
            welcomeModal.classList.remove('active');
        }

        // Drop the session-complete jump so the teddy returns to
        // its normal gentle float next time the modal opens.
        if (welcomeTeddyContainer) {
            welcomeTeddyContainer.classList.remove('celebrate-jump');
        }
    }

    // Shown after a focus session completes: the happy teddy celebrates
    // with the confetti layer already raining (see celebrateCompletion).
    function showSessionCompleteModal() {
        if (!welcomeModal) return;

        // Teddy delivers the message with a happy jump (existing teddy.png).
        if (welcomeTeddyContainer) {
            welcomeTeddyContainer.className =
                'teddy-container happy celebrate-jump';
        }
        if (welcomeTeddyImage) {
            welcomeTeddyImage.src = 'assets/image/teddy.png';
        }
        if (welcomeMessage) {
            welcomeMessage.textContent = 'Session complete! 🎉';
        }
        if (welcomeSubmessage) {
            welcomeSubmessage.textContent =
                'You did it — the chick hatched! Proud of you. 💗';
        }

        welcomeModal.classList.add('active');

        // Cute popup chime, right as the teddy jumps in.
        AudioManager.init();
        AudioManager.resume();
        AudioManager.playCutePop();
    }

    // ------------------------------------------------------------
    // WINDOW CONTROLS (minimize / maximize-restore)
    // ------------------------------------------------------------

    function setMaximizeButtonState(isMaximized) {
        const maximizeBtn = $('maximizeBtn');

        if (!maximizeBtn) return;

        maximizeBtn.textContent = isMaximized ? '❐' : '□';
        maximizeBtn.title =
            isMaximized ? 'Restore window' : 'Maximize window';
        maximizeBtn.setAttribute(
            'aria-label',
            maximizeBtn.title
        );
    }

    function initWindowControls() {

        const minimizeBtn = $('minimizeBtn');
        const maximizeBtn = $('maximizeBtn');

        if (!minimizeBtn || !maximizeBtn) return;

        const api = window.electronAPI;

        // Desktop (Electron): real window minimize / maximize-restore.
        if (
            api &&
            api.minimizeWindow &&
            api.toggleMaximize
        ) {

            minimizeBtn.addEventListener('click', () => {
                api.minimizeWindow();
            });

            maximizeBtn.addEventListener('click', () => {
                api.toggleMaximize();
            });

            if (api.onMaximizeChange) {
                api.onMaximizeChange((_event, isMaximized) => {
                    setMaximizeButtonState(!!isMaximized);
                });
            }

            return;
        }

        // Web / PWA fallback: a browser tab can't be minimized, so that
        // button is hidden and maximize toggles the Fullscreen API instead.
        minimizeBtn.style.display = 'none';

        maximizeBtn.addEventListener('click', () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        });
    }

    // ------------------------------------------------------------
    // SUPER ZOOM — maximize / minimize the whole screen (50%–200%)
    // ------------------------------------------------------------

    const ZOOM_MIN = 0.5;
    const ZOOM_MAX = 2;
    const ZOOM_STEP = 0.1;

    let uiZoom = 1;

    function applyUiZoom(value) {

        // Round to whole percents, then clamp to the super-zoom range.
        let next = Math.round(Number(value) * 100) / 100;

        if (isNaN(next)) next = 1;

        uiZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));

        document.documentElement.style.setProperty(
            '--ui-zoom',
            String(uiZoom)
        );

        const label = $('zoomLevel');
        if (label) {
            label.textContent = Math.round(uiZoom * 100) + '%';
        }

        try {
            localStorage.setItem('egg-timer-zoom', String(uiZoom));
        } catch (e) { /* storage unavailable */ }
    }

    function initUiZoom() {

        // Saved zoom — default 100%.
        let saved = 1;
        try {
            saved = parseFloat(localStorage.getItem('egg-timer-zoom')) || 1;
        } catch (e) { /* storage unavailable */ }

        applyUiZoom(saved);

        const zoomInBtn = $('zoomInBtn');
        const zoomOutBtn = $('zoomOutBtn');
        const zoomResetBtn = $('zoomResetBtn');

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                applyUiZoom(uiZoom + ZOOM_STEP);
            });
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                applyUiZoom(uiZoom - ZOOM_STEP);
            });
        }

        if (zoomResetBtn) {
            zoomResetBtn.addEventListener('click', () => {
                applyUiZoom(1);
            });
        }

        // Keyboard: Ctrl/Cmd + "=" zoom in, "-" zoom out, "0" back to default.
        document.addEventListener('keydown', (e) => {
            if (!e.ctrlKey && !e.metaKey) return;

            if (e.key === '=' || e.key === '+') {
                e.preventDefault();
                applyUiZoom(uiZoom + ZOOM_STEP);
            } else if (e.key === '-') {
                e.preventDefault();
                applyUiZoom(uiZoom - ZOOM_STEP);
            } else if (e.key === '0') {
                e.preventDefault();
                applyUiZoom(1);
            }
        });
    }

    // ------------------------------------------------------------
    // TIMER BOX RESIZE — drag the edges / corner; the box stays square
    // ------------------------------------------------------------

    const TIMER_BOX_MIN = 360;
    const TIMER_BOX_MAX = 720;

    // Largest square that fits beside the hero without horizontal clipping.
    function timerBoxMaxSize() {

        const app = document.querySelector('.app');
        const hero = document.querySelector('.hero');
        const main = document.querySelector('.main-content');

        if (!app || !hero || !main) return TIMER_BOX_MAX;

        const appStyle = getComputedStyle(app);
        const inner = app.clientWidth
            - (parseFloat(appStyle.paddingLeft) || 0)
            - (parseFloat(appStyle.paddingRight) || 0);
        const gap = parseFloat(getComputedStyle(main).columnGap) || 0;

        return Math.max(
            TIMER_BOX_MIN,
            Math.min(TIMER_BOX_MAX, inner - hero.offsetWidth - gap)
        );
    }

    // Natural content height with the 1:1 ratio temporarily disabled —
    // the box can never be dragged shorter than everything inside it needs.
    function timerBoxNaturalHeight(box) {

        const prevRatio = box.style.aspectRatio;
        const prevHeight = box.style.height;

        box.style.aspectRatio = 'auto';
        box.style.height = 'auto';

        const height = box.offsetHeight;

        box.style.aspectRatio = prevRatio;
        box.style.height = prevHeight;

        return height;
    }

    function initTimerBoxResize() {

        const box = $('timerWindow');
        if (!box) return;

        // Saved size — re-clamped for this viewport on every load.
        let saved = 0;
        try {
            saved = parseInt(localStorage.getItem('egg-timer-box-size'), 10) || 0;
        } catch (e) { /* storage unavailable */ }

        if (saved) {
            const naturalAtLoad = timerBoxNaturalHeight(box);
            const minAtLoad = Math.max(TIMER_BOX_MIN, naturalAtLoad);
            const maxAtLoad = Math.max(minAtLoad, timerBoxMaxSize());
            const clamped = Math.max(
                minAtLoad,
                Math.min(maxAtLoad, saved)
            );
            box.style.setProperty('--timer-size', clamped + 'px');
        }

        const handles = box.querySelectorAll('.resize-handle');

        for (let i = 0; i < handles.length; i++) {

            handles[i].addEventListener('pointerdown', (e) => {

                e.preventDefault();

                const axis = handles[i].getAttribute('data-resize') || 'se';
                const z = uiZoom || 1;
                const rect = box.getBoundingClientRect();

                // All math happens in un-zoomed layout pixels.
                const startSize = rect.width / z;
                const startX = e.clientX;
                const startY = e.clientY;

                // Measured once per drag so pointermove stays reflow-free.
                const natural = timerBoxNaturalHeight(box);
                const min = Math.max(TIMER_BOX_MIN, natural);
                const max = Math.max(min, timerBoxMaxSize());

                document.body.classList.add('is-resizing');
                box.classList.add('resizing');

                const onMove = (ev) => {
                    const dx = (ev.clientX - startX) / z;
                    const dy = (ev.clientY - startY) / z;

                    let next = startSize;
                    if (axis === 'e') {
                        next = startSize + dx;
                    } else if (axis === 's') {
                        next = startSize + dy;
                    } else {
                        // Corner drag grows on the largest axis → stays square.
                        next = startSize + Math.max(dx, dy);
                    }

                    next = Math.min(max, Math.max(min, Math.round(next)));
                    box.style.setProperty('--timer-size', next + 'px');
                };

                const onEnd = () => {
                    window.removeEventListener('pointermove', onMove);
                    window.removeEventListener('pointerup', onEnd);
                    window.removeEventListener('pointercancel', onEnd);

                    document.body.classList.remove('is-resizing');
                    box.classList.remove('resizing');

                    const finalSize = Math.round(
                        box.getBoundingClientRect().width / (uiZoom || 1)
                    );

                    try {
                        localStorage.setItem(
                            'egg-timer-box-size',
                            String(finalSize)
                        );
                    } catch (err) { /* storage unavailable */ }
                };

                window.addEventListener('pointermove', onMove);
                window.addEventListener('pointerup', onEnd);
                window.addEventListener('pointercancel', onEnd);
            });
        }
    }

    // ------------------------------------------------------------
    // EVENT LISTENERS
    // ------------------------------------------------------------

    function initEventListeners() {

        if (startBtn) {

            startBtn.addEventListener(
                'click',
                () => {

                    if (
                        timerState === 'READY' ||
                        timerState === 'PAUSED'
                    ) {

                        setDogState('start');

                        setTimeout(() => {
                            startTimer();
                        }, 300);

                    } else {

                        startTimer();
                    }
                }
            );
        }

        if (pauseBtn) {
            pauseBtn.addEventListener(
                'click',
                pauseTimer
            );
        }

        if (resetBtn) {
            resetBtn.addEventListener(
                'click',
                resetTimer
            );
        }

        // Theme button

        if (themeBtn) {

            themeBtn.addEventListener(
                'click',
                () => {

                    AudioManager.init();
                    AudioManager.resume();

                    if (themeModal) {
                        themeModal.classList.add('theme-plain');
                        themeModal.classList.add(
                            'active'
                        );
                        generateOceanWavesIfOcean();
                    }
                }
            );
        }

        if (closeThemeModal) {

            closeThemeModal.addEventListener(
                'click',
                () => {

                    if (themeModal) {
                        themeModal.classList.remove('theme-plain');
                        themeModal.classList.remove(
                            'active'
                        );
                    }
                }
            );
        }

        // Theme choices

        const themeOptions =
            document.querySelectorAll(
                '.theme-option'
            );

        themeOptions.forEach((button) => {

            button.addEventListener(
                'click',
                () => {

                    setTheme(
                        button.dataset.theme
                    );

                    if (themeModal) {
                        themeModal.classList.remove('theme-plain');
                        themeModal.classList.remove(
                            'active'
                        );
                    }
                }
            );
        });

        // Breathing

        if (breathBtn) {

            breathBtn.addEventListener(
                'click',
                startBreath
            );
        }

        if (closeBreath) {

            closeBreath.addEventListener(
                'click',
                stopBreath
            );
        }

        // Greeting mascot — click shows sad/crying expression, then back to happy
        if (greetingMascot) {
            greetingMascot.addEventListener(
                'click',
                () => {
                    if (!greetingMascot) return;
                    AudioManager.init();
                    AudioManager.resume();
                    AudioManager.playClick();
                    // Sad / crying: swap to the crying teddy while CSS tears
                    // keep flowing over it (.greeting-mascot.sad in CSS).
                    greetingMascot.classList.add('sad');
                    if (greetingMascotImg) {
                        greetingMascotImg.src = 'assets/image/teddy_crying.png';
                    }
                    setTimeout(() => {
                        greetingMascot.classList.remove('sad');
                        if (greetingMascotImg) {
                            greetingMascotImg.src = 'assets/image/teddy.png';
                        }
                    }, 3000);
                }
            );
        }

        if (teddyStay) {

            teddyStay.addEventListener(
                'click',
                onTeddyStay
            );
        }

        if (teddyBye) {

            teddyBye.addEventListener(
                'click',
                onTeddyBye
            );
        }

                // Welcome modal close — release the desk companion once the
        // welcome screen is dismissed.
        if (welcomeClose) {
            welcomeClose.addEventListener(
                'click',
                () => {
                    hideWelcomeModal();
                    showGreetingMascot();
                }
            );
        }

        // Modal background closing

        [themeModal, breathModal].forEach(
            (modal) => {

                if (!modal) return;

                modal.addEventListener(
                    'click',
                    (event) => {

                        if (
                            event.target === modal
                        ) {
                            modal.classList.remove(
                                'active'
                            );
                        }
                    }
                );
            }
        );

        // Electron close protection

        if (
            window.electronAPI &&
            window.electronAPI.onShowCloseConfirmation
        ) {

            window.electronAPI.onShowCloseConfirmation(
                () => {
                    showTeddyModal();
                }
            );
        }

        // --------------------------------------------------------
        // SECOND TEMPLATE - LET'S BEGIN
        // --------------------------------------------------------

        const beginBtn =
            $('beginBtn');

        if (beginBtn) {

            beginBtn.addEventListener(
                'click',
                () => {

                    AudioManager.init();
                    AudioManager.resume();

                    setDogState('start');

                    setTimeout(() => {
                        startTimer();
                    }, 300);
                }
            );
        }

        // --------------------------------------------------------
        // SECOND TEMPLATE - EXPLORE FEATURES
        // --------------------------------------------------------

        const exploreBtn =
            $('exploreBtn');

        if (exploreBtn) {

            exploreBtn.addEventListener(
                'click',
                () => {

                    AudioManager.init();
                    AudioManager.resume();

                    if (themeModal) {
                        themeModal.classList.add(
                            'active'
                        );
                    }
                }
            );
        }
    }

    // ------------------------------------------------------------
    // STAR TWINKLE ANIMATION LAYER
    // ------------------------------------------------------------

    function createTwinkle() {
        var container = $('stars');
        if (!container) return;

        var existing = container.querySelectorAll('.star');
        for (var e = 0; e < existing.length; e++) {
            existing[e].remove();
        }

        var count = 90;
        for (var i = 0; i < count; i++) {
            var star = document.createElement('div');
            star.className = 'star';

            var x = Math.random() * 100;
            var y = 6 + Math.random() * 78;
            var size = 1 + Math.random() * 2.4;
            var dur = 2.4 + Math.random() * 3.2;
            var delay = Math.random() * 5;
            var min = 0.12 + Math.random() * 0.28;
            var max = 0.55 + Math.random() * 0.45;

            var typeRoll = Math.random();
            if (typeRoll < 0.2) {
                star.classList.add('fast');
            } else if (typeRoll < 0.42) {
                star.classList.add('slow');
            }

            if (Math.random() < 0.12) {
                star.classList.add('glow');
            }

            star.style.left = x + '%';
            star.style.top = y + '%';
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            star.style.setProperty('--dur', dur + 's');
            star.style.setProperty('--delay', delay + 's');
            star.style.setProperty('--star-min', min);
            star.style.setProperty('--star-max', max);

            container.appendChild(star);
        }
    }

    function seedSparkleLayer() {
        var moon = $('moon');
        var container = $('stars');
        if (!moon || !container) return;

        var existing = container.querySelectorAll('.seed');
        for (var e = 0; e < existing.length; e++) {
            existing[e].remove();
        }

        var moonRect = moon.getBoundingClientRect();
        var appRect = document.querySelector('.app').getBoundingClientRect();
        var cx = (moonRect.left - appRect.left + moonRect.width / 2) / appRect.width * 100;
        var cy = (moonRect.top - appRect.top + moonRect.height / 2) / appRect.height * 100;

        var count = 8;
        for (var i = 0; i < count; i++) {
            var seed = document.createElement('div');
            seed.className = 'seed pulse';
            var angle = Math.random() * Math.PI * 2;
            var dist = 3 + Math.random() * 9;
            var x = cx + Math.cos(angle) * dist;
            var y = cy + Math.sin(angle) * dist;
            seed.style.left = x + '%';
            seed.style.top = y + '%';
            seed.style.width = (1 + Math.random() * 1.6) + 'px';
            seed.style.height = seed.style.width;
            seed.style.setProperty('--d', (Math.random() * 4) + 's');
            container.appendChild(seed);
        }
    }

    // ------------------------------------------------------------
    // GREETING MASCOT — desk plushie companion
    // ------------------------------------------------------------

    async function getTeddyDataUri(which) {
        // Reads the SVG file and returns a data URI so the mascot
        // renders even when file:// restrictions apply.
                try {
            const path = 'assets/image/teddy.png';
            const resp = await fetch(path);
            if (!resp.ok) return null;
            const buf = await resp.arrayBuffer();
            const bytes = new Uint8Array(buf);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return 'data:image/png;base64,' + btoa(binary);
        } catch (_) {
            return null;
        }
    }

    async function initMascots() {
        if (!greetingMascotImg) return;

        // Prefer the local SVG file; fall back to a built-in SVG.
        const uri = await getTeddyDataUri('happy');
        if (uri) {
            greetingMascotImg.src = uri;
        } else {
            greetingMascotImg.src =
                'data:image/svg+xml;charset=utf-8,' +
                encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
                    '<circle cx="100" cy="115" r="78" fill="#E8A87C"/>' +
                    '<circle cx="100" cy="115" r="78" fill="url(#g1)"/>' +
                    '<defs><radialGradient id="g1" cx="40%" cy="35%">' +
                    '<stop offset="0%" stop-color="#F4C49C"/>' +
                    '<stop offset="100%" stop-color="#C9825E"/></radialGradient></defs>' +
                    '<circle cx="70" cy="95" r="10" fill="#3D1F0A"/>' +
                    '<circle cx="130" cy="95" r="10" fill="#3D1F0A"/>' +
                    '<circle cx="73" cy="92" r="3" fill="#fff"/>' +
                    '<circle cx="133" cy="92" r="3" fill="#fff"/>' +
                    '<ellipse cx="100" cy="128" rx="16" ry="10" fill="#3D1F0A"/>' +
                    '<path d="M88 140 Q100 148 112 140" stroke="#3D1F0A" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
                    '</svg>'
                );
        }

        // NOTE: the hidden state comes from CSS (.greeting-mascot starts at
        // opacity: 0). Do not set inline opacity/transform here — inline
        // styles would beat the .show class and keep the mascot invisible.
    }

    function showGreetingMascot() {
        if (!greetingMascot) return;
        // Clear any inline styles left over from init so the .show class
        // (opacity/transform) actually takes effect.
        greetingMascot.style.opacity = '';
        greetingMascot.style.transform = '';
        greetingMascot.classList.add('show');
    }

    function hideGreetingMascot() {
        if (!greetingMascot) return;
        greetingMascot.classList.remove('show');
    }

    function setupWelcomeTeddy() {
        if (!welcomeTeddyImage) return;
        welcomeTeddyImage.src = 'assets/image/teddy.png';
        if (welcomeTeddyContainer) {
            welcomeTeddyContainer.className = 'teddy-container happy';
        }
    }

    // ------------------------------------------------------------
    // PAGE VISIBILITY / TRANSITION HANDLING
    // ------------------------------------------------------------

    function handlePageTransition() {
        // When the page becomes hidden (tab switch / minimize) we pause
        // audio ambience to avoid wasted resources / unexpected output.
        if (document.hidden) {
            AudioManager.stopAmbient();
        } else {
            // Resume ambient audio when the user comes back (if a theme
            // is currently active).
            const t = localStorage.getItem('egg-timer-theme') || 'sunset';
            AudioManager.startAmbient(t);
        }
    }

    function handleResize() {
        // Recreate decorations so they fit the new viewport dimensions.
        createTwinkle();
        seedSparkleLayer();
        createClouds();
        createBirds();
    }

    // ------------------------------------------------------------
    // INITIALIZATION
    // ------------------------------------------------------------

    function init() {

        // Background effects
        createStars();
        createTwinkle();
        createClouds();
        createFloatingHearts();
        createFireflies();
        createEmbers();
        createEggSparkles();
        createBirds();

        // Desk plushie companion (greeting mascot)
        initMascots();

        // Load the dog image (transparent SVG)
        setupDogImage();

        // Statistics
        loadStats();

        // Buttons / events
        initEventListeners();

        // Minimize / maximize titlebar buttons (Electron + web fallback)
        initWindowControls();

        // Screen super-zoom (buttons + Ctrl +/- / 0 shortcuts)
        initUiZoom();

        // Resizable square timer box (drag edges / corner, stays 1:1)
        initTimerBoxResize();

        // Timer
        updateTimerDisplay();

        // Saved theme
        const savedTheme =
            localStorage.getItem(
                'egg-timer-theme'
            ) || 'sunset';

        setTheme(savedTheme);

        // Initial state
        setTimerState('READY');

        // Show welcome modal on first load
        showWelcomeModal();

                // Wire up page-visibility / transition handling.
        document.addEventListener('visibilitychange', handlePageTransition);
        window.addEventListener('pageshow', handlePageTransition);
        window.addEventListener('pagehide', handlePageTransition);
        window.addEventListener('beforeunload', handlePageTransition);
        window.addEventListener('resize', handleResize);
    }

    // ------------------------------------------------------------
    // PWA: make the dashboard installable (web + mobile app).
    // Only registers over http(s) so Electron / file:// is unaffected.
    // ------------------------------------------------------------
    if (
        'serviceWorker' in navigator &&
        (location.protocol === 'https:' || location.protocol === 'http:')
    ) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('sw.js')
                .catch(() => { /* offline support unavailable */ });
        });
    }

    // ------------------------------------------------------------
    // START APPLICATION
    // ------------------------------------------------------------

    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            init
        );

    } else {

        init();
    }

})();