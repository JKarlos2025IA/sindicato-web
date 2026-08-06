// ============================================================
// SIUTCASJNJ - Modulo: Economia y Finanzas (Viaticos)
// ============================================================
import { db, storage, collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from '../core.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from '../core.js';

export function initEconomia() {
    cargarViaticos();

    const form = document.getElementById('form-viatico');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-viatico');
            btn.disabled = true;
            btn.innerHTML = '<ion-icon name="sync" class="animate-spin mr-2"></ion-icon> Guardando...';

            const nombre = document.getElementById('via-nombre').value.trim().toUpperCase();
            const monto = parseFloat(document.getElementById('via-monto').value) || 0;
            const motivo = document.getElementById('via-motivo').value.trim().toUpperCase();
            const fecha = document.getElementById('via-fecha').value;
            const archivo = document.getElementById('via-sustento').files[0];

            if (!nombre || !monto || !motivo) {
                alert('Completa nombre, monto y motivo.');
                btn.disabled = false;
                btn.innerHTML = '<ion-icon name="save" class="mr-2"></ion-icon> Registrar Viatico';
                return;
            }

            try {
                let sustentoURL = '';
                if (archivo) {
                    const stamp = Date.now();
                    const safeName = archivo.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
                    const storageRef = ref(storage, `viaticos/${stamp}_${safeName}`);
                    await uploadBytes(storageRef, archivo);
                    sustentoURL = await getDownloadURL(storageRef);
                }

                await addDoc(collection(db, 'viaticos'), {
                    nombre, monto, motivo, fecha,
                    sustentoURL,
                    estado: 'pendiente',
                    timestamp: serverTimestamp()
                });

                form.reset();
                alert('Viatico registrado. Pendiente de aprobacion.');
                cargarViaticos();
            } catch (err) {
                alert('Error: ' + err.message);
            }
            btn.disabled = false;
            btn.innerHTML = '<ion-icon name="save" class="mr-2"></ion-icon> Registrar Viatico';
        });
    }
}

async function cargarViaticos() {
    const container = document.getElementById('lista-viaticos');
    if (!container) return;
    try {
        const q = query(collection(db, 'viaticos'), orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        if (snap.empty) {
            container.innerHTML = '<p class="text-center py-8 text-gray-400">No hay viaticos registrados.</p>';
            return;
        }

        let total = 0;
        let html = '';
        snap.forEach(d => {
            const v = d.data();
            const id = d.id;
            total += v.monto || 0;

            const badge = v.estado === 'aprobado'
                ? '<span class="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Aprobado</span>'
                : v.estado === 'rechazado'
                ? '<span class="bg-red-50 text-red-500 px-2 py-1 rounded text-xs font-bold">Rechazado</span>'
                : '<span class="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-bold">Pendiente</span>';

            let f = '';
            if (v.timestamp && v.timestamp.toDate) f = v.timestamp.toDate().toLocaleDateString('es-PE');

            html += `
                <div class="bg-white border rounded-xl p-4 mb-3 shadow-sm hover:shadow transition">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold text-gray-800">${v.nombre}</h4>
                            <p class="text-sm text-gray-500">${v.motivo}</p>
                            <p class="text-xs text-gray-400 mt-1">${f} | ${v.fecha || 'Sin fecha'}</p>
                        </div>
                        <div class="text-right">
                            <span class="text-lg font-bold text-gray-800">S/ ${(v.monto || 0).toFixed(2)}</span>
                            <div class="mt-1">${badge}</div>
                        </div>
                    </div>
                    <div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                        ${v.sustentoURL ? `<a href="${v.sustentoURL}" target="_blank" class="text-xs text-blue-600 hover:underline flex items-center"><ion-icon name="document" class="mr-1"></ion-icon> Ver sustento</a>` : '<span class="text-xs text-gray-400">Sin sustento</span>'}
                        ${v.estado === 'pendiente' ? `
                            <button class="text-xs text-emerald-600 font-bold hover:underline ml-auto" data-action="aprobar" data-id="${id}">Aprobar</button>
                            <button class="text-xs text-red-500 font-bold hover:underline" data-action="rechazar" data-id="${id}">Rechazar</button>
                        ` : ''}
                        <button class="text-xs text-gray-400 hover:text-red-500 ml-2" data-action="eliminar" data-id="${id}">Eliminar</button>
                    </div>
                </div>`;
            container.innerHTML = html;

            // Event listeners
            container.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const action = btn.dataset.action;
                    const vid = btn.dataset.id;
                    if (action === 'aprobar') await updateDoc(doc(db, 'viaticos', vid), { estado: 'aprobado' });
                    else if (action === 'rechazar') await updateDoc(doc(db, 'viaticos', vid), { estado: 'rechazado' });
                    else if (action === 'eliminar' && confirm('Eliminar este viatico?')) await deleteDoc(doc(db, 'viaticos', vid));
                    cargarViaticos();
                });
            });
        });

        // Resumen
        container.innerHTML += `<div class="bg-gray-100 rounded-xl p-4 mt-4 text-center font-bold text-gray-700">
            Total registrado: <span class="text-blue-700 text-lg">S/ ${total.toFixed(2)}</span>
        </div>`;
    } catch (e) {
        container.innerHTML = '<p class="text-center py-8 text-red-500">Error: ' + e.message + '</p>';
    }
}
