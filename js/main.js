/* ==========================================================================
   ARJUNA HARJAI - Main JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initNavigation();
    initSmoothScroll();
    initVideoLightbox();
    initFilters();
    initMusicPlayer();
    initVideoSlider();
    initContactForm();
    initScrollProgress();
    initCountdownTimers();
    initReelVideos();
});

/* --------------------------------------------------------------------------
   Navigation
   -------------------------------------------------------------------------- */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect for navbar
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add/remove scrolled class
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/* --------------------------------------------------------------------------
   Smooth Scrolling
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            if (href === '#') return;

            e.preventDefault();

            const target = document.querySelector(href);

            if (target) {
                const navbarHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* --------------------------------------------------------------------------
   Video Lightbox
   -------------------------------------------------------------------------- */
function initVideoLightbox() {
    const lightbox = document.getElementById('videoLightbox');
    const lightboxVideo = document.getElementById('lightboxVideo');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');

    // Open lightbox
    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            const videoId = thumbnail.dataset.video;
            if (videoId) {
                lightboxVideo.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close lightbox function
    function closeLightbox() {
        lightbox.classList.remove('active');
        lightboxVideo.src = '';
        document.body.style.overflow = '';
    }

    // Close on button click
    closeBtn.addEventListener('click', closeLightbox);

    // Close on backdrop click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

/* --------------------------------------------------------------------------
   Filter Functionality
   -------------------------------------------------------------------------- */
function initFilters() {
    // Discography filters
    initFilterGroup('.disco-filters .filter-btn', '.disco-card');
}

function initFilterGroup(btnSelector, itemSelector) {
    const buttons = document.querySelectorAll(btnSelector);
    const items = document.querySelectorAll(itemSelector);

    if (!buttons.length || !items.length) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            // Update active button
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter items
            items.forEach(item => {
                const category = item.dataset.category;

                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                    item.style.display = '';
                } else {
                    item.classList.add('hidden');
                    // Use setTimeout to allow transition
                    setTimeout(() => {
                        if (item.classList.contains('hidden')) {
                            item.style.display = 'none';
                        }
                    }, 400);
                }
            });
        });
    });
}

/* --------------------------------------------------------------------------
   Contact Form
   -------------------------------------------------------------------------- */
function initContactForm() {
    const form = document.getElementById('contactForm');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Basic validation
        let isValid = true;
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                isValid = false;
                showError(input, 'This field is required');
            } else if (input.type === 'email' && !isValidEmail(input.value)) {
                isValid = false;
                showError(input, 'Please enter a valid email');
            } else {
                clearError(input);
            }
        });

        if (isValid) {
            // Show success message (visual only - no backend)
            showFormSuccess(form);
            console.log('Form submitted:', data);
        }
    });

    // Clear errors on input
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', () => clearError(input));
    });
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(input, message) {
    clearError(input);
    input.style.borderColor = '#e74c3c';

    const error = document.createElement('span');
    error.className = 'form-error';
    error.textContent = message;
    error.style.cssText = 'color: #e74c3c; font-size: 0.75rem; margin-top: 0.25rem; display: block;';

    input.parentNode.appendChild(error);
}

function clearError(input) {
    input.style.borderColor = '';
    const error = input.parentNode.querySelector('.form-error');
    if (error) error.remove();
}

function showFormSuccess(form) {
    const successMsg = document.createElement('div');
    successMsg.className = 'form-success';
    successMsg.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#c4a35a" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3 style="margin-top: 1rem; color: #c4a35a;">Message Sent!</h3>
            <p style="color: #888; margin-top: 0.5rem;">Thank you for reaching out. We'll get back to you soon.</p>
        </div>
    `;

    form.style.display = 'none';
    form.parentNode.appendChild(successMsg);

    // Reset after 5 seconds
    setTimeout(() => {
        successMsg.remove();
        form.reset();
        form.style.display = '';
    }, 5000);
}

/* --------------------------------------------------------------------------
   Scroll Progress Indicator
   -------------------------------------------------------------------------- */
function initScrollProgress() {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;

        progressBar.style.width = scrolled + '%';
    });
}

/* --------------------------------------------------------------------------
   Music Player (Track List + Spotify Embed)
   -------------------------------------------------------------------------- */
function initMusicPlayer() {
    const trackItems = document.querySelectorAll('.track-list-item');
    const nowPlayingEmbed = document.getElementById('nowPlayingEmbed');
    const filterBtns = document.querySelectorAll('.spotify-filters .filter-btn');

    if (!trackItems.length || !nowPlayingEmbed) return;

    // Click track to load in player
    trackItems.forEach(item => {
        item.addEventListener('click', () => {
            const embedUrl = item.dataset.embed;
            if (!embedUrl) return;

            // Update active state
            trackItems.forEach(t => t.classList.remove('active'));
            item.classList.add('active');

            // Update the main Spotify embed
            const iframe = nowPlayingEmbed.querySelector('iframe');
            if (iframe) {
                iframe.src = embedUrl;
            }
        });
    });

    // Category filter for track list
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter track items
            trackItems.forEach(item => {
                const category = item.dataset.category;
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
}

/* --------------------------------------------------------------------------
   Video Slider (YouTube)
   -------------------------------------------------------------------------- */
function initVideoSlider() {
    const slider = document.getElementById('videoSlider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.slider-slide');
    const dots = slider.querySelectorAll('.slider-dot');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');

    if (!slides.length) return;

    let currentSlide = 0;

    function goToSlide(index) {
        // Pause current iframe
        const currentIframe = slides[currentSlide].querySelector('iframe');
        if (currentIframe) {
            currentIframe.src = currentIframe.src; // Reload to stop playback
        }

        // Update slides
        slides[currentSlide].classList.remove('active');
        currentSlide = ((index % slides.length) + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');

        // Lazy-load iframe src for active slide
        const newIframe = slides[currentSlide].querySelector('iframe');
        const ytSrc = slides[currentSlide].dataset.ytSrc;
        if (newIframe && ytSrc && !newIframe.src.includes('youtube.com')) {
            newIframe.src = ytSrc;
        }

        // Update dots
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    // Arrow navigation
    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

    // Dot navigation
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.dataset.slide);
            goToSlide(slideIndex);
        });
    });

    // Keyboard navigation when slider is in view
    document.addEventListener('keydown', (e) => {
        const rect = slider.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) return;

        if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
        if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
    });
}

/* --------------------------------------------------------------------------
   Countdown Timers (Upcoming Music)
   -------------------------------------------------------------------------- */
function initCountdownTimers() {
    const upcomingDates = document.querySelectorAll('.upcoming-date[data-date]');

    if (!upcomingDates.length) return;

    function updateCountdowns() {
        upcomingDates.forEach(dateEl => {
            const targetDate = new Date(dateEl.dataset.date).getTime();
            const now = Date.now();
            const diff = targetDate - now;

            const timerEl = dateEl.closest('.upcoming-info').querySelector('.countdown-timer');
            if (!timerEl) return;

            if (diff <= 0) {
                // Release date passed
                timerEl.classList.add('released');
                timerEl.classList.remove('urgent');
                timerEl.innerHTML = '<span class="countdown-value" style="font-size: var(--text-lg);">Out Now!</span>';
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const daysEl = timerEl.querySelector('[data-unit="days"]');
            const hoursEl = timerEl.querySelector('[data-unit="hours"]');
            const minutesEl = timerEl.querySelector('[data-unit="minutes"]');
            const secondsEl = timerEl.querySelector('[data-unit="seconds"]');

            if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');

            // Add urgent class when less than 24 hours
            if (days === 0) {
                timerEl.classList.add('urgent');
            } else {
                timerEl.classList.remove('urgent');
            }
        });
    }

    // Run immediately then every second
    updateCountdowns();
    setInterval(updateCountdowns, 1000);
}

/* --------------------------------------------------------------------------
   Reel Videos (Autoplay/Mute Control)
   -------------------------------------------------------------------------- */
function initReelVideos() {
    const reelVideos = document.querySelectorAll('[data-reel-video]');

    if (!reelVideos.length) return;

    // IntersectionObserver: play when visible, pause when not
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.5 });

    reelVideos.forEach(video => {
        observer.observe(video);

        const card = video.closest('.reel-card');
        const soundIndicator = card ? card.querySelector('.reel-sound-indicator') : null;

        // Desktop: mouseenter unmutes, mouseleave mutes
        if (card) {
            card.addEventListener('mouseenter', () => {
                video.muted = false;
                if (soundIndicator) soundIndicator.classList.add('unmuted');
            });

            card.addEventListener('mouseleave', () => {
                video.muted = true;
                if (soundIndicator) soundIndicator.classList.remove('unmuted');
            });
        }

        // Mobile: tap to toggle mute
        if (soundIndicator) {
            soundIndicator.style.pointerEvents = 'auto';
            soundIndicator.addEventListener('click', (e) => {
                e.stopPropagation();
                video.muted = !video.muted;
                soundIndicator.classList.toggle('unmuted', !video.muted);
            });
        }
    });
}

/* --------------------------------------------------------------------------
   Utility Functions
   -------------------------------------------------------------------------- */

// Debounce function for performance
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

// Throttle function for scroll events
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

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Preload images
function preloadImages(urls) {
    urls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}
