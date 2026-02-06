/* ==========================================================================
   ARJUNA HARJAI - Advanced Scroll Animations & Creative Effects
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initCustomCursor();
    initScrollAnimations();
    initParallax();
    initCounterAnimations();
    initMagneticButtons();
    initTiltCards();
    initTextSplitAnimation();
    initAudioWaveSync();
});

/* --------------------------------------------------------------------------
   Loading Screen
   -------------------------------------------------------------------------- */
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (!loadingScreen) return;

    // Hide loading screen after content loads
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            document.body.classList.add('loaded');

            // Remove from DOM after transition
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }, 1500); // Show loading for at least 1.5 seconds
    });
}

/* --------------------------------------------------------------------------
   Custom Cursor
   -------------------------------------------------------------------------- */
function initCustomCursor() {
    // Only on desktop
    if (window.matchMedia('(hover: none)').matches) return;

    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');

    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor animation
    function animateCursor() {
        // Cursor follows immediately
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;

        // Follower lags behind
        followerX += (mouseX - followerX) * 0.08;
        followerY += (mouseY - followerY) * 0.08;

        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;

        follower.style.left = `${followerX}px`;
        follower.style.top = `${followerY}px`;

        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // Hover effects on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .video-thumbnail, .disco-card, .track-item');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            follower.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        follower.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        follower.style.opacity = '1';
    });
}

/* --------------------------------------------------------------------------
   Scroll-Triggered Animations
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.classList.add('visible');
        });
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Add staggered animation to children
                const children = entry.target.querySelectorAll('.stagger-child');
                children.forEach((child, index) => {
                    child.style.transitionDelay = `${index * 0.1}s`;
                    child.classList.add('visible');
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    // Reveal wipe animations
    const wipeElements = document.querySelectorAll('.reveal-wipe');
    const wipeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.3 });

    wipeElements.forEach(el => wipeObserver.observe(el));
}

/* --------------------------------------------------------------------------
   Parallax Effects
   -------------------------------------------------------------------------- */
function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    const glowOrbs = document.querySelectorAll('.glow-orb');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.pageYOffset;

                // Parallax elements
                parallaxElements.forEach(el => {
                    const speed = el.dataset.parallax || 0.3;
                    el.style.transform = `translateY(${scrollY * speed}px)`;
                });

                // Subtle movement for glow orbs
                glowOrbs.forEach((orb, index) => {
                    const speed = 0.02 + (index * 0.01);
                    const direction = index % 2 === 0 ? 1 : -1;
                    orb.style.transform = `translate(${scrollY * speed * direction}px, ${scrollY * speed}px)`;
                });

                ticking = false;
            });
            ticking = true;
        }
    });
}

/* --------------------------------------------------------------------------
   Counter Animations (for stats)
   -------------------------------------------------------------------------- */
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');

    if (!counters.length) return;

    const observerOptions = { threshold: 0.5 };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const text = element.textContent;
    const match = text.match(/(\d+)(\+?)/);

    if (!match) return;

    const target = parseInt(match[1]);
    const suffix = match[2] || '';
    const duration = 2500;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);

    let frame = 0;

    const counter = setInterval(() => {
        frame++;
        const progress = easeOutExpo(frame / totalFrames);
        const currentCount = Math.round(target * progress);

        element.textContent = currentCount + suffix;

        if (frame === totalFrames) {
            clearInterval(counter);
            element.textContent = target + suffix;
        }
    }, frameDuration);
}

function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/* --------------------------------------------------------------------------
   Magnetic Buttons
   -------------------------------------------------------------------------- */
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn, .social-link, .streaming-btn');

    if (window.matchMedia('(hover: none)').matches) return;

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

/* --------------------------------------------------------------------------
   Tilt Effect for Cards
   -------------------------------------------------------------------------- */
function initTiltCards() {
    const cards = document.querySelectorAll('.disco-card, .video-card, .download-card');

    if (window.matchMedia('(hover: none)').matches) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            const rotateX = (y - 0.5) * -10;
            const rotateY = (x - 0.5) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

/* --------------------------------------------------------------------------
   Text Split Animation
   -------------------------------------------------------------------------- */
function initTextSplitAnimation() {
    const splitElements = document.querySelectorAll('.split-text');

    splitElements.forEach(el => {
        const text = el.textContent;
        el.innerHTML = '';

        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.className = 'char';
            span.style.animationDelay = `${index * 0.03}s`;
            el.appendChild(span);
        });
    });
}

/* --------------------------------------------------------------------------
   Audio Wave Sync with Music Player
   -------------------------------------------------------------------------- */
function initAudioWaveSync() {
    const audioWave = document.getElementById('audioWave');
    const playBtn = document.getElementById('playBtn');

    if (!audioWave || !playBtn) return;

    // Start/stop wave animation based on play state
    playBtn.addEventListener('click', () => {
        const isPlaying = playBtn.classList.contains('playing');

        if (isPlaying) {
            audioWave.classList.add('active');
        } else {
            audioWave.classList.remove('active');
        }
    });
}

/* --------------------------------------------------------------------------
   Smooth Scroll Reveal for Sections
   -------------------------------------------------------------------------- */
function initSectionReveal() {
    const sections = document.querySelectorAll('.section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => observer.observe(section));
}

/* --------------------------------------------------------------------------
   Particle System Enhancement
   -------------------------------------------------------------------------- */
function initParticleSystem() {
    const container = document.querySelector('.particles-container');
    if (!container) return;

    // Add mouse interaction to particles
    document.addEventListener('mousemove', (e) => {
        const particles = container.querySelectorAll('.particle');
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        particles.forEach(particle => {
            const rect = particle.getBoundingClientRect();
            const particleX = rect.left + rect.width / 2;
            const particleY = rect.top + rect.height / 2;

            const distX = mouseX - particleX;
            const distY = mouseY - particleY;
            const distance = Math.sqrt(distX * distX + distY * distY);

            if (distance < 150) {
                const force = (150 - distance) / 150;
                const moveX = (distX / distance) * force * 30;
                const moveY = (distY / distance) * force * 30;

                particle.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
            }
        });
    });
}

/* --------------------------------------------------------------------------
   Initialize Additional Effects
   -------------------------------------------------------------------------- */
initSectionReveal();

// Optional: Initialize particle mouse interaction
// Uncomment if you want particles to react to mouse
// initParticleSystem();

/* --------------------------------------------------------------------------
   Performance: Pause animations when tab is not visible
   -------------------------------------------------------------------------- */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.classList.add('animations-paused');
    } else {
        document.body.classList.remove('animations-paused');
    }
});

/* --------------------------------------------------------------------------
   Utility: Debounce & Throttle
   -------------------------------------------------------------------------- */
function debounce(func, wait = 20) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
