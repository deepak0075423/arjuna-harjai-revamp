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
    initCarousels();
    initNewsFeed();
    initReelsList();
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
            console.log(videoId);
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

    let currentSlide = Array.from(slides).findIndex(s => s.classList.contains('active'));
    if (currentSlide < 0) {
        currentSlide = 0;
        slides[0].classList.add('active');
    }

    function stopSlide(index) {
        const iframe = slides[index]?.querySelector('iframe');
        if (iframe) iframe.src = '';
    }

    function ensureSlideLoaded(index) {
        const iframe = slides[index]?.querySelector('iframe');
        const ytSrc = slides[index]?.dataset?.ytSrc;
        if (!iframe || !ytSrc) return;
        if (iframe.src !== ytSrc) iframe.src = ytSrc;
    }

    function goToSlide(index) {
        // Stop current iframe playback
        stopSlide(currentSlide);

        // Update slides
        slides[currentSlide].classList.remove('active');
        currentSlide = ((index % slides.length) + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');

        // Load active slide iframe
        ensureSlideLoaded(currentSlide);

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

    // Clear all non-active slides' iframes so only one YouTube embed loads at a time.
    // Loading all 5 simultaneously causes YouTube to throttle/block playback.
    slides.forEach((slide, i) => {
        if (i !== currentSlide) {
            const iframe = slide.querySelector('iframe');
            if (iframe) iframe.src = '';
        }
    });

    // Ensure initial slide is loaded (in case the iframe src was empty).
    ensureSlideLoaded(currentSlide);
}

/* --------------------------------------------------------------------------
   Horizontal Carousels (News / Awards / Reels)
   -------------------------------------------------------------------------- */
function initCarousels() {
    const carousels = document.querySelectorAll('[data-carousel]');
    if (!carousels.length) return;

    carousels.forEach((carousel) => {
        const track = carousel.querySelector('.carousel-track');
        if (!track) return;

        const prevBtn = carousel.querySelector('[data-carousel-prev]');
        const nextBtn = carousel.querySelector('[data-carousel-next]');

        const scrollAmount = () => Math.max(240, Math.floor(track.clientWidth * 0.9));

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
            });
        }

        // Keyboard navigation when carousel is in view
        carousel.addEventListener('keydown', (e) => {
            const rect = carousel.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (!inView) return;

            if (e.key === 'ArrowLeft') track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
            if (e.key === 'ArrowRight') track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
        });
    });
}

/* --------------------------------------------------------------------------
   News Feed (Build-time JSON)
   -------------------------------------------------------------------------- */
function initNewsFeed() {
    const track = document.querySelector('[data-news-track]');
    if (!track) return;

    const jsonPath = track.dataset.newsJson || 'assets/data/news.json';

    fetch(jsonPath, { cache: 'no-store' })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
            if (!data || !Array.isArray(data.items) || !data.items.length) return;

            // Replace any static markup with fetched items
            track.innerHTML = '';

            data.items.forEach((item) => {
                const title = item.title || 'News';
                const url = item.url || '#';
                const source = item.source || '';
                const dateIso = item.date || null;
                const dateText = dateIso ? new Date(dateIso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }) : '';
                const img = item.image;

                const article = document.createElement('article');
                article.className = 'news-card animate-on-scroll';

                const media = document.createElement('a');
                media.className = 'news-media';
                media.href = url;
                media.target = '_blank';
                media.rel = 'noopener';
                media.setAttribute('aria-label', `Read: ${title}`);

                if (img) {
                    const image = document.createElement('img');
                    image.src = img;
                    image.alt = title;
                    image.loading = 'lazy';
                    media.appendChild(image);
                } else {
                    media.classList.add('news-media--noimg');
                }

                if (dateText) {
                    const time = document.createElement('time');
                    time.className = 'news-date';
                    if (dateIso) time.dateTime = dateIso;
                    time.textContent = dateText;
                    media.appendChild(time);
                }

                const content = document.createElement('div');
                content.className = 'news-content';

                const h3 = document.createElement('h3');
                h3.textContent = title;

                const p = document.createElement('p');
                p.textContent = source ? source : 'Read the full article.';

                const link = document.createElement('a');
                link.className = 'news-link';
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener';
                link.innerHTML = 'Read More <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>';

                content.appendChild(h3);
                content.appendChild(p);
                content.appendChild(link);

                article.appendChild(media);
                article.appendChild(content);

                track.appendChild(article);
            });

            document.dispatchEvent(new CustomEvent('content:added', { detail: { root: track } }));
        })
        .catch(() => {});
}

/* --------------------------------------------------------------------------
   Reels List (Auto Render 18 videos)
   -------------------------------------------------------------------------- */
function initReelsList() {
    const track = document.querySelector('[data-reels-track]');
    if (!track) return;

    // If user already authored items in HTML, don't overwrite.
    if (track.children.length) return;

    const jsonPath = track.dataset.reelsJson;
    const totalReels = Number(track.dataset.reelsCount) || 18;

    function encodeAssetPath(path) {
        const raw = String(path || '');
        if (!raw) return '';

        // Keep slashes, encode each segment so filenames with `#` don't get treated as fragments.
        return raw
            .split('/')
            .map((seg, i) => (i === 0 ? seg : encodeURIComponent(seg)))
            .join('/');
    }

    const iconHeart = '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>';
    const iconComment = '<path d="M21 6h-18c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14l4 4v-18c0-1.1-.9-2-2-2zm-2 11h-12v-2h12v2zm0-3h-12v-2h12v2zm0-3h-12v-2h12v2z"/>';
    const iconShare = '<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.02-4.11c.54.5 1.25.81 2.07.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.07 9.81C7.53 9.31 6.82 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.82 0 1.53-.31 2.07-.81l7.12 4.16c-.05.2-.08.41-.08.63 0 1.61 1.31 2.92 2.92 2.92S21 19.61 21 18s-1.34-3-3-3z"/>';
    const iconMore = '<path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>';
    const iconSound = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';

    function renderReel({ src, caption, likes, comments }, index) {
        const reelCard = document.createElement('div');
        reelCard.className = 'reel-card animate-on-scroll';

        const safeSrc = src ? encodeAssetPath(src) : '';
        const safeCaption = caption || `Reel #${index + 1}`;
        const likesText = likes || '—';
        const commentsText = comments || '—';

        reelCard.innerHTML = `
            <div class="phone-mockup">
                <div class="phone-notch"></div>
                <div class="reel-frame">
                    <video src="${safeSrc}" muted loop playsinline preload="metadata" data-reel-video></video>
                    <div class="reel-overlay">
                        <div class="reel-top" aria-hidden="true">
                            <span class="reel-top-title">Reels</span>
                        </div>
                        <div class="reel-actions" aria-hidden="true">
                            <div class="reel-action">
                                <svg viewBox="0 0 24 24" fill="currentColor">${iconHeart}</svg>
                                <span>${likesText}</span>
                            </div>
                            <div class="reel-action">
                                <svg viewBox="0 0 24 24" fill="currentColor">${iconComment}</svg>
                                <span>${commentsText}</span>
                            </div>
                            <div class="reel-action">
                                <svg viewBox="0 0 24 24" fill="currentColor">${iconShare}</svg>
                                <span>Share</span>
                            </div>
                            <div class="reel-action">
                                <svg viewBox="0 0 24 24" fill="currentColor">${iconMore}</svg>
                                <span>More</span>
                            </div>
                        </div>
                        <div class="reel-bottom" aria-hidden="true">
                            <div class="reel-user">@arjunaharjai</div>
                            <div class="reel-caption-inline">${safeCaption}</div>
                        </div>
                        <div class="reel-sound-indicator" aria-label="Toggle sound">
                            <svg viewBox="0 0 24 24" fill="currentColor">${iconSound}</svg>
                        </div>
                    </div>
                </div>
                <div class="phone-home-indicator"></div>
            </div>
        `;
        track.appendChild(reelCard);
    }

    function finish() {
        document.dispatchEvent(new CustomEvent('content:added', { detail: { root: track } }));
    }

    if (jsonPath) {
        fetch(jsonPath, { cache: 'no-store' })
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                const items = data && Array.isArray(data.items) ? data.items : null;
                if (!items || !items.length) throw new Error('no reels');

                items.forEach((item, idx) => renderReel(item, idx));
                finish();
            })
            .catch(() => {
                for (let i = 1; i <= totalReels; i++) {
                    renderReel({ src: `assets/videos/reel${i}.mp4` }, i - 1);
                }
                finish();
            });
        return;
    }

    for (let i = 1; i <= totalReels; i++) {
        renderReel({ src: `assets/videos/reel${i}.mp4` }, i - 1);
    }
    finish();
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
    // Browser autoplay policy: audio playback/unmute requires a user gesture.
    // We try to unmute on hover; if blocked, we prompt for a one-time gesture.
    let userActivatedMedia = false;
    let lastHover = null;
    const activateMedia = () => { userActivatedMedia = true; };

    // Minimal UI to ask for a first gesture (so hover-unmute can work afterwards).
    const bannerId = 'mediaActivationBanner';
    const existingBanner = document.getElementById(bannerId);
    let activationBanner = existingBanner;

    function ensureActivationBanner() {
        if (activationBanner) return activationBanner;

        const styleId = 'mediaActivationBannerStyle';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                #${bannerId} {
                    position: fixed;
                    left: 50%;
                    bottom: 18px;
                    transform: translateX(-50%);
                    z-index: 3000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 999px;
                    border: 1px solid rgba(196, 163, 90, 0.35);
                    background: rgba(10, 10, 10, 0.75);
                    backdrop-filter: blur(10px);
                    color: rgba(255, 255, 255, 0.92);
                    font-size: 0.9rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
                }
                #${bannerId} button {
                    appearance: none;
                    border: 1px solid rgba(196, 163, 90, 0.35);
                    background: rgba(196, 163, 90, 0.18);
                    color: rgba(255, 255, 255, 0.95);
                    padding: 8px 12px;
                    border-radius: 999px;
                    font-weight: 600;
                    cursor: pointer;
                }
                #${bannerId} button:hover {
                    background: rgba(196, 163, 90, 0.28);
                }
                #${bannerId}[hidden] { display: none !important; }
            `;
            document.head.appendChild(style);
        }

        activationBanner = document.createElement('div');
        activationBanner.id = bannerId;
        activationBanner.setAttribute('role', 'status');
        activationBanner.innerHTML = `
            <span>Enable sound for reels</span>
            <button type="button" aria-label="Enable sound">Enable Sound</button>
        `;

        const btn = activationBanner.querySelector('button');
        if (btn) {
            btn.addEventListener('click', () => {
                userActivatedMedia = true;
                activationBanner.hidden = true;
                if (lastHover && lastHover.card && lastHover.card.matches(':hover')) {
                    void tryUnmuteAndPlay(lastHover.video, lastHover.soundIndicator);
                }
            });
        }

        document.body.appendChild(activationBanner);
        return activationBanner;
    }

    function hideActivationBanner() {
        if (activationBanner) activationBanner.hidden = true;
    }

    document.addEventListener('pointerdown', () => {
        activateMedia();
        hideActivationBanner();
    }, { once: true, capture: true });
    document.addEventListener('keydown', () => {
        activateMedia();
        hideActivationBanner();
    }, { once: true, capture: true });

    async function tryUnmuteAndPlay(video, soundIndicator) {
        // Try immediately: some browsers allow autoplay-with-sound based on prior engagement/settings.
        // If blocked, fall back to muted playback and show a one-time "Enable Sound" prompt.
        video.muted = false;
        if (soundIndicator) soundIndicator.classList.add('unmuted');

        try {
            await video.play();
            userActivatedMedia = true;
            hideActivationBanner();
        } catch {
            // Most common: NotAllowedError (no user gesture). Keep it muted.
            video.muted = true;
            if (soundIndicator) soundIndicator.classList.remove('unmuted');
            video.play().catch(() => {});
            if (!userActivatedMedia) ensureActivationBanner();
        }
    }

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

    function attachReel(video) {
        if (!video || video.dataset.reelBound === 'true') return;
        video.dataset.reelBound = 'true';

        observer.observe(video);

        const card = video.closest('.reel-card');
        const soundIndicator = card ? card.querySelector('.reel-sound-indicator') : null;

        // Desktop: mouseenter unmutes (after gesture), mouseleave mutes
        if (card) {
            card.addEventListener('mouseenter', () => {
                lastHover = { video, soundIndicator, card };
                if (userActivatedMedia) {
                    // User has interacted with the page — just unmute directly.
                    // Avoid calling play() on an already-playing video to prevent race conditions.
                    video.muted = false;
                    if (soundIndicator) soundIndicator.classList.add('unmuted');
                    if (video.paused) video.play().catch(() => {});
                } else {
                    // No user activation yet — try to unmute; if blocked, play muted + show banner.
                    void tryUnmuteAndPlay(video, soundIndicator);
                }
            });

            card.addEventListener('mouseleave', () => {
                video.muted = true;
                if (soundIndicator) soundIndicator.classList.remove('unmuted');
            });

            // Click anywhere on the reel counts as a gesture: toggle sound.
            card.addEventListener('click', async () => {
                userActivatedMedia = true;
                hideActivationBanner();
                video.play().catch(() => {});
                if (video.muted) {
                    await tryUnmuteAndPlay(video, soundIndicator);
                } else {
                    video.muted = true;
                    if (soundIndicator) {
                        soundIndicator.classList.remove('unmuted');
                    }
                }
            });
        }

        // Mobile: tap to toggle mute
        if (soundIndicator) {
            soundIndicator.style.pointerEvents = 'auto';
            soundIndicator.addEventListener('click', async (e) => {
                e.stopPropagation();
                userActivatedMedia = true;
                hideActivationBanner();
                video.play().catch(() => {});

                if (video.muted) {
                    await tryUnmuteAndPlay(video, soundIndicator);
                } else {
                    video.muted = true;
                    soundIndicator.classList.remove('unmuted');
                }
            });
        }
    }

    // Attach to initial reels (if any).
    document.querySelectorAll('[data-reel-video]').forEach(attachReel);

    // Attach to dynamically added reels (generated by JS).
    document.addEventListener('content:added', (e) => {
        const root = e && e.detail && e.detail.root ? e.detail.root : document;
        if (!root.querySelectorAll) return;
        root.querySelectorAll('[data-reel-video]').forEach(attachReel);
    });

    // If the user first interacts while hovering a reel, enable sound for that reel.
    document.addEventListener('pointerdown', () => {
        if (!lastHover || !lastHover.card || !lastHover.card.matches(':hover')) return;
        void tryUnmuteAndPlay(lastHover.video, lastHover.soundIndicator);
    }, { once: true, capture: true });
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
