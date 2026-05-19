document.addEventListener('DOMContentLoaded', () => {
    // --- Birthday Logic (carga desde Firebase con fallback local) ---
    const banner = document.getElementById('birthday-banner');
    const birthdayNamesSpan = document.getElementById('birthday-names');
    const birthdayActions = document.getElementById('birthday-actions');
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${month}-${day}`;

    async function mostrarCumpleanos(listaSocios) {
        const birthdaySocios = listaSocios.filter(s => s.fecha === todayString);
        if (birthdaySocios.length > 0 && banner && birthdayNamesSpan) {
            const names = birthdaySocios.map(s => s.nombre).join(', ');
            birthdayNamesSpan.textContent = names;
            banner.classList.remove('hidden');
            banner.classList.add('flex');
            if (birthdayActions) {
                birthdayActions.innerHTML = '';
                birthdaySocios.forEach(socio => {
                    if (socio.telefono) {
                        const nombreCorto = socio.nombre.split(' ')[0];
                        const mensaje = `¡Feliz Cumpleaños, ${nombreCorto}! 🥳🎉\n\nDe parte de toda la gran familia del *SIUTCASJNJ*, queremos enviarte un afectuoso saludo en tu día. 🎂✨ Valoramos inmensamente tu dedicación. ¡Que la pases extraordinario junto a tus seres queridos y que este nuevo año de vida esté lleno de éxitos y bendiciones! 🫂🎊`;
                        const urlWA = `https://wa.me/${socio.telefono}?text=${encodeURIComponent(mensaje)}`;
                        const btn = document.createElement('a');
                        btn.href = urlWA;
                        btn.target = "_blank";
                        btn.className = "flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-2 rounded-full font-bold shadow-lg transition-transform hover:scale-105 text-sm md:text-base border-2 border-white";
                        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-whatsapp" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg> Saludar a ${nombreCorto}`;
                        birthdayActions.appendChild(btn);
                    }
                });
            }
        }
    }

    // Intentar cargar desde Firebase primero
    try {
        import("https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js").then(async ({ initializeApp }) => {
            const { getFirestore, collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js");
            const firebaseConfig = {
                apiKey: "AIzaSyAF7geSgASMmvXYUy_LamNh0K2allmZEy0",
                authDomain: "sindicato-jnj.firebaseapp.com",
                projectId: "sindicato-jnj",
                storageBucket: "sindicato-jnj.firebasestorage.app",
                messagingSenderId: "1036915309355",
                appId: "1:1036915309355:web:fac53de65031a39597e36e"
            };
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            const qSocios = await getDocs(collection(db, "socios"));
            const sociosFirebase = [];
            qSocios.forEach(docSnap => sociosFirebase.push(docSnap.data()));
            if (sociosFirebase.length > 0) {
                mostrarCumpleanos(sociosFirebase);
            } else if (typeof socios !== 'undefined') {
                mostrarCumpleanos(socios);
            }
        }).catch(() => {
            if (typeof socios !== 'undefined') mostrarCumpleanos(socios);
        });
    } catch (e) {
        if (typeof socios !== 'undefined') mostrarCumpleanos(socios);
    }

    // --- Popup Logic ---
    const popupModal = document.getElementById('popup-modal');
    const closePopupBtn = document.getElementById('close-popup');

    if (popupModal && closePopupBtn) {
        // Show popup on load
        setTimeout(() => {
            popupModal.classList.remove('hidden');
            // Small delay to allow display:block to apply before opacity transition
            setTimeout(() => {
                popupModal.classList.remove('opacity-0');
            }, 10);
        }, 500); // Delay 0.5s after load

        // Close popup
        closePopupBtn.addEventListener('click', () => {
            popupModal.classList.add('opacity-0');
            setTimeout(() => {
                popupModal.classList.add('hidden');
            }, 300);
        });

        // Close on click outside
        popupModal.addEventListener('click', (e) => {
            if (e.target === popupModal) {
                popupModal.classList.add('opacity-0');
                setTimeout(() => {
                    popupModal.classList.add('hidden');
                }, 300);
            }
        });
    }

    // Carousel Logic movida a index.html para manejo asíncrono con Firebase

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
                // Check if it's an img tag or a div with data-src
                const src = img.tagName === 'IMG' ? img.src : img.getAttribute('data-src');
                lightboxImage.src = src;
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
