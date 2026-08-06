// ============================================================
// SIUTCASJNJ - Admin Core (modulo compartido)
// ============================================================
// Firebase init, auth, navegacion, helpers.
// Todos los modulos importan desde aqui.
// ============================================================

// --- Firebase ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc, where, writeBatch } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAF7geSgASMmvXYUy_LamNh0K2allmZEy0",
    authDomain: "sindicato-jnj.firebaseapp.com",
    projectId: "sindicato-jnj",
    storageBucket: "sindicato-jnj.firebasestorage.app",
    messagingSenderId: "1036915309355",
    appId: "1:1036915309355:web:fac53de65031a39597e36e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Exportar funciones Firestore para modulos
export { collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc, where, writeBatch };
export { ref, uploadBytes, getDownloadURL, deleteObject };
export { signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail };

// --- Estado compartido ---
export let usuarioActual = null;
export let rolUsuario = 'admin';
export let seccionUsuario = '';

// --- Auth ---
export function initAuth() {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            usuarioActual = user;
            document.getElementById('admin-email-display').textContent = user.email;
            loginSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');

            // Cargar rol desde Firestore
            try {
                const q = query(collection(db, 'admins'), where('email', '==', user.email));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    const data = snap.docs[0].data();
                    rolUsuario = data.rol || 'admin';
                    seccionUsuario = data.seccion || '';
                }
            } catch (e) { console.warn('Error cargando rol:', e); }

            aplicarPermisos();
        } else {
            usuarioActual = null;
            rolUsuario = 'admin';
            loginSection.classList.remove('hidden');
            dashboardSection.classList.add('hidden');
        }
    });
}

// --- Permisos por rol ---
const SECCIONES_COMPARTIDAS = ['nav-inicio', 'nav-portadas', 'nav-anuncio', 'nav-eventos'];
const SECCIONES_ADMIN = ['nav-socios', 'nav-config', 'nav-tema', 'nav-descargas', 'nav-admins'];
const MAPEO_SECRETARIA_NAV = {
    'Secretaría General': 'nav-sec-general',
    'Sub-Secretaría General': 'nav-sec-subgeneral',
    'Organización': 'nav-sec-organizacion',
    'Defensa': 'nav-sec-defensa',
    'Economía': 'nav-sec-economia',
    'Actas y Archivo': 'nav-sec-actas',
    'Control y Disciplina': 'nav-sec-disciplina',
    'Prensa y Propaganda': 'nav-sec-prensa',
    'Cultura y Deporte': 'nav-sec-cultura',
    'Bienestar Social': 'nav-sec-bienestar',
};

function aplicarPermisos() {
    const todosLosNav = document.querySelectorAll('.nav-menu-item');
    if (rolUsuario === 'admin') {
        todosLosNav.forEach(n => n.style.display = '');
        return;
    }
    // Secretario: mostrar solo compartidas + su seccion
    todosLosNav.forEach(n => n.style.display = 'none');
    SECCIONES_COMPARTIDAS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = '';
    });
    const navId = MAPEO_SECRETARIA_NAV[seccionUsuario];
    if (navId) {
        const el = document.getElementById(navId);
        if (el) el.style.display = '';
    }
    document.getElementById('nav-socios').style.display = 'none';
    document.getElementById('nav-config').style.display = 'none';
    document.getElementById('nav-tema').style.display = 'none';
}

// --- Navegacion ---
export function initNav() {
    const viewTitle = document.getElementById('view-title');
    const navItems = document.querySelectorAll('.nav-menu-item');

    const vistas = {};
    document.querySelectorAll('[id^="view-"]').forEach(el => { vistas[el.id] = el; });

    function switchView(activeNav, activeView, title) {
        navItems.forEach(item => {
            item.classList.remove('bg-blue-900/50', 'text-blue-300', 'border-l-4', 'border-blue-500');
            item.classList.add('text-gray-400', 'hover:text-white', 'hover:bg-gray-800');
        });
        activeNav.classList.add('bg-blue-900/50', 'text-blue-300', 'border-l-4', 'border-blue-500');
        activeNav.classList.remove('text-gray-400', 'hover:text-white', 'hover:bg-gray-800');
        Object.values(vistas).forEach(v => v.classList.add('hidden'));
        activeView.classList.remove('hidden');
        viewTitle.textContent = title;
        // Cerrar sidebar mobile
        const sidebar = document.getElementById('main-sidebar');
        if (window.innerWidth < 768 && sidebar) {
            sidebar.classList.add('-translate-x-full');
            document.getElementById('sidebar-overlay')?.classList.add('hidden');
        }
    }

    return { switchView, vistas, viewTitle };
}

// --- Helpers ---
export function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-bold z-[99999] shadow-lg animate-pulse ${
        type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

export function modalConfirm(msg) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-[99998]';
        overlay.innerHTML = `<div class="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700 shadow-2xl">
            <p class="text-white text-lg mb-6">${msg}</p>
            <div class="flex gap-3 justify-end">
                <button id="modal-cancel" class="px-5 py-2 bg-gray-600 text-white rounded-lg font-semibold">Cancelar</button>
                <button id="modal-ok" class="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold">Confirmar</button>
            </div></div>`;
        overlay.querySelector('#modal-cancel').onclick = () => { overlay.remove(); resolve(false); };
        overlay.querySelector('#modal-ok').onclick = () => { overlay.remove(); resolve(true); };
        document.body.appendChild(overlay);
    });
}
