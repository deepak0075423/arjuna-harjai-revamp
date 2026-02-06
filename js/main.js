/* ==========================================================================
   ARJUNA HARJAI - Main JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initNavigation();
    initSmoothScroll();
    initVideoLightbox();
    initFilters();
    initContactForm();
    initScrollProgress();
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
    // Video filters
    initFilterGroup('.video-filters .filter-btn', '.video-card');

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
