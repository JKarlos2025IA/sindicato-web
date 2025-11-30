document.addEventListener('DOMContentLoaded', () => {
    // --- Birthday Logic ---
    const banner = document.getElementById('birthday-banner');
    const birthdayNamesSpan = document.getElementById('birthday-names');
    const today = new Date();
    // Format today as MM-DD
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${month}-${day}`;

    // console.log("Fecha actual:", todayString);

    if (typeof socios !== 'undefined') {
        const birthdaySocios = socios.filter(socio => socio.fecha === todayString);

        if (birthdaySocios.length > 0 && banner && birthdayNamesSpan) {
            const names = birthdaySocios.map(s => s.nombre).join(', ');
            birthdayNamesSpan.textContent = names;
            banner.classList.remove('hidden');
        }
    }

    // --- Dynamic CSS Injection for Lightbox and Animations ---
    const style = document.createElement('style');
    style.textContent = `
        /* Lightbox Styles */
        #lightbox-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }
        #lightbox-modal.active {
            opacity: 1;
            pointer-events: auto;
        }
        #lightbox-image {
            max-width: 90%;
            max-height: 90%;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        #lightbox-modal.active #lightbox-image {
            transform: scale(1);
        }
        #lightbox-close {
            position: absolute;
            top: 20px;
            right: 30px;
            color: white;
            font-size: 40px;
            cursor: pointer;
            user-select: none;
        }

        /* Fade-in Animation Styles */
        .fade-in-section {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            will-change: opacity, transform;
        }
        .fade-in-section.is-visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    // --- Lightbox Implementation ---
    // Create Lightbox Elements
    const lightboxModal = document.createElement('div');
    lightboxModal.id = 'lightbox-modal';
    lightboxModal.innerHTML = `
        <span id="lightbox-close">&times;</span>
        <img id="lightbox-image" src="" alt="Lightbox Image">
    `;
    document.body.appendChild(lightboxModal);

    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.getElementById('lightbox-close');

    // Function to attach click listeners to triggers
    function attachLightboxListeners() {
        const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');
        lightboxTriggers.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', (e) => {
                e.preventDefault();
                lightboxImage.src = img.src || img.getAttribute('data-src'); // Support data-src for non-img elements if needed
                lightboxModal.classList.add('active');
            });
        });
    }

    attachLightboxListeners();

    // Close Lightbox
    lightboxClose.addEventListener('click', () => {
        lightboxModal.classList.remove('active');
    });

    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            lightboxModal.classList.remove('active');
        }
    });

    // --- Fade-in on Scroll Implementation ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all sections and elements with specific class
    const sections = document.querySelectorAll('section, .fade-in-section');
    sections.forEach(section => {
        section.classList.add('fade-in-section');
        observer.observe(section);
    });
});
