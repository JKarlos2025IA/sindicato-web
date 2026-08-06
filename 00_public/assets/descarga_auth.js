// ============================================================
// SIUTCASJNJ - Sistema de Descarga con Codigo de Autorizacion
// ============================================================
// Incluir este script en cualquier pagina publica + Firebase
// ============================================================

(function() {
    if (window.DescargaAuth) return;

    let db = null;

    function initFirebase() {
        return new Promise((resolve, reject) => {
            if (db) return resolve(db);
            const script = document.createElement('script');
            script.type = 'module';
            script.textContent = `
                import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
                import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
                const fc = { apiKey: "AIzaSyAF7geSgASMmvXYUy_LamNh0K2allmZEy0", authDomain: "sindicato-jnj.firebaseapp.com", projectId: "sindicato-jnj", storageBucket: "sindicato-jnj.firebasestorage.app", messagingSenderId: "1036915309355", appId: "1:1036915309355:web:fac53de65031a39597e36e" };
                window.__fb = { db: getFirestore(initializeApp(fc)), Firestore: { collection, query, where, getDocs, addDoc, serverTimestamp } };
                window.dispatchEvent(new Event('fb_ready'));
            `;
            document.head.appendChild(script);
            window.addEventListener('fb_ready', () => {
                db = window.__fb.db;
                resolve(db);
            }, { once: true });
        });
    }

    function showModal(title, content, buttons) {
        const overlay = document.createElement('div');
        overlay.className = 'descarga-overlay';
        overlay.innerHTML = `<div class="descarga-modal">
            <h3 class="descarga-modal-title">${title}</h3>
            <div class="descarga-modal-content">${content}</div>
            <div class="descarga-modal-buttons">${buttons}</div>
        </div>`;
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);
        return overlay;
    }

    window.DescargaAuth = {
        async descargar(docId, docNombre, url) {
            await initFirebase();
            const { collection, query, where, getDocs, addDoc, serverTimestamp } = window.__fb.Firestore;

            showModal(
                'Descargar Documento',
                `<p class="descarga-doc-name">${docNombre}</p>
                <p class="text-sm text-gray-400 mb-3">Ingresa tu codigo de afiliado para descargar</p>
                <input type="text" id="codigo-input" class="descarga-input" placeholder="Codigo de 6 digitos" maxlength="6" autocomplete="off">`,
                `<button class="descarga-btn descarga-btn-cancel" onclick="document.querySelector('.descarga-overlay').remove()">Cancelar</button>
                <button class="descarga-btn descarga-btn-confirm" id="btn-confirmar">Confirmar</button>`
            );

            const input = document.getElementById('codigo-input');
            const btn = document.getElementById('btn-confirmar');
            input.focus();

            const procesar = async (codigo) => {
                if (!codigo || codigo.length < 4) {
                    input.classList.add('descarga-input-error');
                    input.placeholder = 'Codigo invalido';
                    input.value = '';
                    return;
                }
                btn.disabled = true;
                btn.textContent = 'Verificando...';

                try {
                    // Buscar en afiliados (importados del Excel)
                    let q = query(collection(db, 'afiliados'), where('codigo', '==', codigo.toUpperCase()));
                    let snap = await getDocs(q);

                    // Si no encuentra, buscar en socios (centro de datos)
                    if (snap.empty) {
                        q = query(collection(db, 'socios'), where('codigo', '==', codigo.toUpperCase()));
                        snap = await getDocs(q);
                    }

                    if (snap.empty) {
                        input.classList.add('descarga-input-error');
                        input.value = '';
                        input.placeholder = 'Codigo no encontrado';
                        btn.disabled = false;
                        btn.textContent = 'Confirmar';
                        return;
                    }

                    const afiliado = snap.docs[0].data();

                    // Verificar si esta activo (solo aplica en coleccion socios)
                    if (afiliado.activo === false) {
                        input.classList.add('descarga-input-error');
                        input.value = '';
                        input.placeholder = 'Afiliado inactivo';
                        btn.disabled = false;
                        btn.textContent = 'Confirmar';
                        return;
                    }

                    // Registrar descarga
                    await addDoc(collection(db, 'descargas'), {
                        afiliado: afiliado.nombre,
                        codigo: codigo.toUpperCase(),
                        documento: docNombre,
                        docId: docId || docNombre,
                        url: url,
                        timestamp: serverTimestamp()
                    });

                    document.querySelector('.descarga-overlay').remove();

                    // Disparar descarga
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = docNombre;
                    a.click();

                    // Toast de exito
                    const toast = document.createElement('div');
                    toast.className = 'descarga-toast';
                    toast.innerHTML = `Descarga autorizada`;
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 3000);

                } catch (e) {
                    btn.disabled = false;
                    btn.textContent = 'Confirmar';
                    input.placeholder = 'Error: ' + e.message;
                }
            };

            btn.addEventListener('click', () => procesar(input.value));
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') procesar(input.value); });
        }
    };
})();
