// ============================================================
// SIUTCASJNJ - Modulo: Economia y Finanzas (v2)
// ============================================================
import { db, storage, collection, getDocs, query, orderBy, doc, updateDoc, addDoc, deleteDoc } from '../../core.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from '../../core.js';

let snapCache = null;

export function initEconomia() {
    window.cargarSolicitudes = cargarSolicitudes;
    window.cargarLibroGastos = cargarLibroGastos;
    window.cargarBalances = cargarBalances;
    window.descargarLibro = descargarLibro;
    window.actualizarSelectFirmado = actualizarSelectFirmado;
    window.cerrarModal = cerrarModal;

    cargarSolicitudes();
    cargarLibroGastos();
    initBalanceForm();
    initUploadSigned();
    initModalButtons();
    document.getElementById('filtro-libro-tipo')?.addEventListener('change', cargarLibroGastos);
}

// ============================================================
// 1. SOLICITUDES
// ============================================================

async function cargarSolicitudes() {
    const tbody = document.getElementById('tbl-solicitudes');
    if (!tbody) return;
    try {
        const q = query(collection(db, 'viaticos'), orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        snapCache = snap.docs;

        const docs = snap.docs.filter(d => d.data().estado === 'pendiente');
        if (docs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" class="text-center py-8 text-gray-400">No hay solicitudes.</td></tr>';
            return;
        }

        tbody.innerHTML = docs.map(d => {
            const v = d.data();
            const id = d.id;
            const f = v.timestamp?.toDate ? v.timestamp.toDate().toLocaleDateString('es-PE') : '';
            const nroReg = v.nroRegistro ? `<span class="text-gray-400 text-[10px]">#${String(v.nroRegistro).padStart(2,'0')}</span> ` : '';
            const badge = v.estado === 'anotado'
                ? '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Anotado</span>'
                : '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Pendiente</span>';
            const tipoBadge = v.tipo === 'INGRESO'
                ? '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Ingreso</span>'
                : '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">Gasto</span>';
            const fichaSol = v.plantillaFirmadaURL
                ? `<a href="${v.plantillaFirmadaURL}" target="_blank" class="text-blue-600 hover:underline text-xs font-bold">Ver</a>`
                : '<span class="text-gray-400 text-xs">-</span>';
            const fichaCont = v.firmadoURL
                ? `<a href="${v.firmadoURL}" target="_blank" class="text-emerald-600 hover:underline text-xs font-bold">Aprobado</a>`
                : `<label class="cursor-pointer text-blue-500 hover:text-blue-700 text-xs font-bold">Subir <input type="file" class="hidden upload-contador" data-id="${id}" accept=".pdf"></label>`;
            const tieneAprobacion = v.firmadoURL ? true : false;
            const btnAnotar = v.estado !== 'anotado'
                ? (tieneAprobacion
                    ? `<button class="text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded text-xs font-bold" data-act="anotar" data-id="${id}">Anotar</button>`
                    : `<span class="text-gray-400 text-xs">Pendiente</span>`)
                : '';
            const btnDevolver = v.estado === 'anotado'
                ? `<button class="text-amber-600 hover:bg-amber-50 px-2 py-1 rounded text-xs font-bold" data-act="devolver" data-id="${id}">Devolver</button>`
                : '';

            return `<tr class="border-b hover:bg-gray-50">
                <td class="px-2 py-2.5 text-sm whitespace-nowrap">${nroReg}${f}</td>
                <td class="px-2 py-2.5 text-sm whitespace-nowrap">${v.nombre||''}</td>
                <td class="px-2 py-2.5 text-sm">${tipoBadge}</td>
                <td class="px-2 py-2.5 text-sm whitespace-nowrap">${v.descripcion||''}</td>
                <td class="px-2 py-2.5 text-sm text-center">${v.cantidad||''}</td>
                <td class="px-2 py-2.5 text-sm text-center">${v.unidad||''}</td>
                <td class="px-2 py-2.5 text-sm text-right">${(v.pu||0).toFixed(2)}</td>
                <td class="px-2 py-2.5 text-sm text-right font-bold">${(v.total||0).toFixed(2)}</td>
                <td class="px-2 py-2.5 text-sm text-center">${fichaSol}</td>
                <td class="px-2 py-2.5 text-sm text-center">${fichaCont}</td>
                <td class="px-2 py-2.5 text-center">${badge}</td>
                <td class="px-2 py-2.5 text-center whitespace-nowrap">
                    <div class="flex gap-1 justify-center text-xs">
                        ${btnAnotar}
                        ${btnDevolver}
                        <button class="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs" data-act="modificar" data-id="${id}">Editar</button>
                        <button class="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-xs" data-act="eliminar" data-id="${id}">Eliminar</button>
                    </div>
                </td>
            </tr>`;
        }).join('');

        tbody.querySelectorAll('[data-act]').forEach(btn => {
            btn.addEventListener('click', async function () {
                const act = this.dataset.act;
                const vid = this.dataset.id;
                try {
                if (act === 'anotar') {
                    await updateDoc(doc(db, 'viaticos', vid), { estado: 'anotado' });
                    cargarSolicitudes();
                    cargarLibroGastos();
                } else if (act === 'devolver') {
                    if (confirm('Devolver esta solicitud a pendiente?')) {
                        await updateDoc(doc(db, 'viaticos', vid), { estado: 'pendiente' });
                        cargarSolicitudes();
                        cargarLibroGastos();
                    }
                } else if (act === 'eliminar') {
                    if (confirm('Eliminar esta solicitud?')) {
                        await updateDoc(doc(db, 'viaticos', vid), { estado: 'eliminado' });
                        cargarSolicitudes();
                        cargarLibroGastos();
                    }
                } else if (act === 'modificar') {
                    abrirModal(vid);
                }
                } catch (err) { alert('Error: ' + err.message); }
            });
        });

        // Upload ficha contador inline
        tbody.querySelectorAll('.upload-contador').forEach(input => {
            input.addEventListener('change', async function () {
                const file = this.files[0];
                if (!file) return;
                const vid = this.dataset.id;
                try {
                    this.disabled = true;
                    // Leer datos del doc para el naming
                    const docSnap = snapCache?.find(d => d.id === vid);
                    const dv = docSnap?.data() || {};
                    const fechaHoy = new Date().toISOString().slice(0,10).replace(/-/g,'.');
                    const tipo = dv.tipo || 'GASTO';
                    const nroReg = dv.nroRegistro || '01';
                    const ext = file.name.split('.').pop();
                    const r = ref(storage, `viaticos/${fechaHoy}-${tipo}-APROBACION_CONTADOR-N-REG-${String(nroReg).padStart(2,'0')}.${ext}`);
                    await uploadBytes(r, file);
                    const url = await getDownloadURL(r);
                    await updateDoc(doc(db, 'viaticos', vid), { firmadoURL: url });
                    cargarSolicitudes();
                    cargarLibroGastos();
                } catch (err) { alert('Error: ' + err.message); }
            });
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="12" class="text-center py-8 text-red-500">${e.message}</td></tr>`;
    }
}

// ============================================================
// MODAL EDICION
// ============================================================

function abrirModal(vid) {
    const doc = snapCache?.find(d => d.id === vid);
    if (!doc) return;
    const v = doc.data();
    document.getElementById('edit-viatico-id').value = vid;
    // Nombre
    const selNom = document.getElementById('edit-nombre');
    selNom.value = v.nombre || '';
    // Tipo
    const tipo = v.tipo || 'GASTO';
    document.querySelector(`input[name="edit-tipo"][value="${tipo}"]`).checked = true;
    // Fecha, desc
    document.getElementById('edit-fecha').value = v.fecha || '';
    document.getElementById('edit-descripcion').value = v.descripcion || '';
    document.getElementById('edit-cantidad').value = v.cantidad || 1;
    document.getElementById('edit-unidad').value = v.unidad || 'UNIDAD';
    document.getElementById('edit-pu').value = v.pu || 0;
    document.getElementById('edit-total').value = v.total || 0;
    document.getElementById('edit-observacion').value = v.observacion || '';
    document.getElementById('edit-sustento').value = v.sustento || '';

    // Archivos actuales (con opcion de borrar)
    const archDiv = document.getElementById('edit-archivos-actuales');
    if (v.archivos && v.archivos.length) {
        archDiv.innerHTML = '<label class="block text-xs font-bold text-gray-700 mb-1">Archivos Adjuntos</label>' +
            v.archivos.map((a, i) => `<div class="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5 mb-1 text-xs"><a href="${a.url}" target="_blank" class="text-blue-600 hover:underline">${a.nombre}</a><button class="text-red-400 hover:text-red-600 font-bold text-xs del-archivo" data-idx="${i}">X</button></div>`).join('');
        archDiv.querySelectorAll('.del-archivo').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Eliminar este archivo?')) return;
                const idx = parseInt(btn.dataset.idx);
                const archivos = [...(v.archivos || [])];
                archivos.splice(idx, 1);
                await updateDoc(doc(db, 'viaticos', vid), { archivos });
                abrirModal(vid); // refrescar
                cargarSolicitudes();
            });
        });
    } else {
        archDiv.innerHTML = '<p class="text-xs text-gray-400">Sin archivos adjuntos.</p>';
    }

    // Ficha firmada (solo lectura)
    const firmDiv = document.getElementById('edit-firmada-info');
    if (v.plantillaFirmadaURL) {
        firmDiv.innerHTML = `<strong>Ficha del Solicitante:</strong> <a href="${v.plantillaFirmadaURL}" target="_blank" class="text-blue-600 hover:underline">${v.plantillaFirmadaNombre || 'Ver firmada'}</a> <span class="text-gray-400 text-xs">(no editable)</span>`;
    } else {
        firmDiv.innerHTML = '<span class="text-gray-400">Sin ficha firmada del solicitante.</span>';
    }

    document.getElementById('modal-editar').classList.remove('hidden');

    const calcEd = () => {
        document.getElementById('edit-total').value = ((parseFloat(document.getElementById('edit-cantidad').value)||0)*(parseFloat(document.getElementById('edit-pu').value)||0)).toFixed(2);
    };
    document.getElementById('edit-cantidad').oninput = calcEd;
    document.getElementById('edit-pu').oninput = calcEd;
}

function cerrarModal() {
    document.getElementById('modal-editar').classList.add('hidden');
}

function initModalButtons() {
    document.getElementById('btn-guardar-edicion')?.addEventListener('click', async () => {
        const vid = document.getElementById('edit-viatico-id').value;
        try {
            const tipo = document.querySelector('input[name="edit-tipo"]:checked')?.value || 'GASTO';
            await updateDoc(doc(db, 'viaticos', vid), {
                nombre: document.getElementById('edit-nombre').value,
                tipo,
                fecha: document.getElementById('edit-fecha').value,
                descripcion: document.getElementById('edit-descripcion').value.trim().toUpperCase(),
                cantidad: parseFloat(document.getElementById('edit-cantidad').value) || 0,
                unidad: document.getElementById('edit-unidad').value,
                pu: parseFloat(document.getElementById('edit-pu').value) || 0,
                total: parseFloat(document.getElementById('edit-total').value) || 0,
                observacion: document.getElementById('edit-observacion').value.trim().toUpperCase(),
                sustento: document.getElementById('edit-sustento').value.trim().toUpperCase(),
            });
            cerrarModal();
            cargarSolicitudes();
            cargarLibroGastos();
        } catch (err) { alert('Error: ' + err.message); }
    });

    document.getElementById('btn-cancelar-modal')?.addEventListener('click', cerrarModal);
}

// ============================================================
// 2. LIBRO DE GASTOS (ANOTADOS)
// ============================================================

async function cargarLibroGastos() {
    const tbody = document.getElementById('tbl-libro');
    if (!tbody) return;
    try {
        const q = query(collection(db, 'viaticos'), orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        let docs = snap.docs.filter(d => d.data().estado === 'anotado');
        // Filtro por tipo
        const filtroTipo = document.getElementById('filtro-libro-tipo')?.value || 'todas';
        if (filtroTipo !== 'todas') docs = docs.filter(d => d.data().tipo === filtroTipo);

        if (docs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" class="text-center py-8 text-gray-400">No hay registros anotados.</td></tr>';
            document.getElementById('total-libro').textContent = '0.00';
            document.getElementById('btn-descargar-libro').disabled = true;
            window._snapLibro = [];
            return;
        }

        let total = 0;
        window._snapLibro = docs;

        tbody.innerHTML = docs.map(d => {
            const v = d.data();
            total += v.total || 0;
            const f = v.timestamp?.toDate ? v.timestamp.toDate().toLocaleDateString('es-PE') : '';
            const tipoBadge = v.tipo === 'INGRESO'
                ? '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Ingreso</span>'
                : '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">Gasto</span>';
            const fichaCont = v.firmadoURL
                ? `<a href="${v.firmadoURL}" target="_blank" class="text-emerald-600 hover:underline text-xs font-bold">Aprobado</a>`
                : (v.plantillaFirmadaURL
                    ? `<a href="${v.plantillaFirmadaURL}" target="_blank" class="text-blue-600 hover:underline text-xs">Descargar</a>`
                    : '<span class="text-red-400 text-xs">No subida</span>');
            // Consolidar todos los archivos en links
            const todosDocs = [];
            if (v.plantillaFirmadaURL) todosDocs.push(`<a href="${v.plantillaFirmadaURL}" target="_blank" class="text-blue-600 hover:underline text-xs block"><ion-icon name="document-text"></ion-icon> Ficha Solicitante</a>`);
            else todosDocs.push('<span class="text-gray-400 text-xs block">Ficha Solicitante: no adjuntada</span>');
            if (v.firmadoURL) todosDocs.push(`<a href="${v.firmadoURL}" target="_blank" class="text-emerald-600 hover:underline text-xs block"><ion-icon name="checkmark-circle"></ion-icon> Ficha Contador</a>`);
            else todosDocs.push('<span class="text-gray-400 text-xs block">Ficha Contador: pendiente</span>');
            if (v.archivos && v.archivos.length) {
                todosDocs.push(`<span class="text-xs font-bold text-gray-500 block mt-1">${v.archivos.length} comprobante(s):</span>`);
                v.archivos.forEach((a,i) => { todosDocs.push(`<a href="${a.url}" target="_blank" class="text-gray-600 hover:underline text-xs block ml-2">${i+1}. ${a.nombre}</a>`); });
            } else {
                todosDocs.push('<span class="text-gray-400 text-xs block">Comprobantes: 0 archivos</span>');
            }
            const docsHTML = todosDocs.join('');

            return `<tr class="border-b hover:bg-gray-50">
                <td class="p-2 text-xs whitespace-nowrap">${f}</td>
                <td class="p-2 text-xs">${v.nombre||''}</td>
                <td class="p-2 text-xs">${tipoBadge}</td>
                <td class="p-2 text-xs">${v.descripcion||''}</td>
                <td class="p-2 text-xs text-center">${v.cantidad||''}</td>
                <td class="p-2 text-xs text-center">${v.unidad||''}</td>
                <td class="p-2 text-xs text-right">${(v.pu||0).toFixed(2)}</td>
                <td class="p-2 text-xs text-right font-bold">${(v.total||0).toFixed(2)}</td>
                <td class="p-2 text-xs">${v.observacion||''}</td>
                <td class="p-2 text-xs text-center">${fichaCont}</td>
                <td class="p-2 text-xs">${docsHTML}</td>
                <td class="p-2 text-center"><button class="text-amber-600 hover:bg-amber-50 px-2 py-1 rounded text-xs font-bold" data-act="devolver" data-id="${d.id}">Devolver</button></td>
            </tr>`;
        }).join('');

        document.getElementById('total-libro').textContent = total.toFixed(2);
        document.getElementById('btn-descargar-libro').disabled = false;
        actualizarSelectFirmado();

        tbody.querySelectorAll('[data-act="devolver"]').forEach(btn => {
            btn.addEventListener('click', async function () {
                if (confirm('Devolver este registro a solicitudes?')) {
                    await updateDoc(doc(db, 'viaticos', this.dataset.id), { estado: 'pendiente' });
                    cargarSolicitudes();
                    cargarLibroGastos();
                }
            });
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="12" class="text-center py-8 text-red-500">${e.message}</td></tr>`;
    }
}

function descargarLibro() {
    if (!window._snapLibro || window._snapLibro.length === 0) return;
    const rows = [['Fecha','Solicitante','Descripcion','Cantidad','Unidad','P.U.','Total','Observacion']];
    window._snapLibro.forEach(d => {
        const v = d.data();
        const f = v.timestamp?.toDate ? v.timestamp.toDate().toLocaleDateString('es-PE') : '';
        rows.push([f, v.nombre||'', v.descripcion||'', v.cantidad||'', v.unidad||'', v.pu||0, v.total||0, v.observacion||'']);
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Libro de Gastos');
    XLSX.writeFile(wb, 'Libro_Gastos_SIUTCASJNJ.xlsx');
}

// ============================================================
// 2.5 SUBIR FORMULARIO FIRMADO
// ============================================================

function actualizarSelectFirmado() {
    const select = document.getElementById('signed-solicitud-select');
    if (!select || !window._snapLibro) return;
    select.innerHTML = '<option value="">Seleccionar solicitud...</option>';
    window._snapLibro.forEach(d => {
        const v = d.data();
        const f = v.timestamp?.toDate ? v.timestamp.toDate().toLocaleDateString('es-PE') : '';
        select.innerHTML += `<option value="${d.id}">${f} - ${v.nombre} - ${v.descripcion} - S/ ${(v.total||0).toFixed(2)}</option>`;
    });
}

function initUploadSigned() {
    document.getElementById('btn-subir-firmado')?.addEventListener('click', async () => {
        const vid = document.getElementById('signed-solicitud-select').value;
        const file = document.getElementById('signed-file-input').files[0];
        if (!vid || !file) { alert('Selecciona solicitud y archivo.'); return; }
        try {
            const r = ref(storage, `viaticos/firmado_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-]/g,'_')}`);
            await uploadBytes(r, file);
            const url = await getDownloadURL(r);
            await updateDoc(doc(db, 'viaticos', vid), { firmadoURL: url });
            alert('Formulario firmado subido.');
            cargarLibroGastos();
            document.getElementById('signed-file-input').value = '';
        } catch (err) { alert('Error: ' + err.message); }
    });
}

// ============================================================
// 3. BALANCES (CARGA MANUAL DE PDFs)
// ============================================================

function initBalanceForm() {
    const form = document.getElementById('form-balance');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mes = document.getElementById('balance-mes-upload').value;
        const anio = document.getElementById('balance-anio-upload').value;
        const descripcion = document.getElementById('balance-descripcion').value.trim();
        const archivo = document.getElementById('balance-archivo').files[0];
        const btn = document.getElementById('btn-submit-balance');

        if (!mes || !anio || !descripcion || !archivo) return;

        btn.disabled = true;
        btn.innerHTML = '<ion-icon name="sync" class="animate-spin mr-2"></ion-icon> Subiendo...';

        try {
            const safeName = archivo.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
            const storagePath = `balances/${anio}_${mes}_${Date.now()}_${safeName}`;
            const sRef = ref(storage, storagePath);
            await uploadBytes(sRef, archivo);
            const url = await getDownloadURL(sRef);

            await addDoc(collection(db, 'balances'), {
                mes: mes,
                anio: parseInt(anio),
                descripcion: descripcion,
                archivoURL: url,
                archivoNombre: archivo.name,
                storagePath: storagePath,
                timestamp: Date.now()
            });

            form.reset();
            document.getElementById('balance-anio-upload').value = new Date().getFullYear();
            alert('Balance publicado exitosamente. Ya visible en la pagina publica.');
            cargarBalances();
        } catch (err) {
            alert('Error al publicar: ' + err.message);
            console.error(err);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<ion-icon name="cloud-upload-outline" class="mr-2 text-xl"></ion-icon> Publicar Balance';
        }
    });

    cargarBalances();
}

async function cargarBalances() {
    const container = document.getElementById('lista-balances-admin');
    if (!container) return;

    try {
        const q = query(collection(db, 'balances'), orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        const balances = [];
        snap.forEach(d => balances.push({ id: d.id, ...d.data() }));

        if (balances.length === 0) {
            container.innerHTML = '<p class="text-center py-8 text-gray-400 italic">No hay balances publicados. Usa el formulario de arriba para publicar el primero.</p>';
            return;
        }

        container.innerHTML = balances.map(b => `
            <div class="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-sm transition">
                <div class="flex items-center gap-4">
                    <div class="bg-emerald-100 text-emerald-700 font-bold text-sm px-3 py-2 rounded-lg text-center min-w-[70px]">
                        ${b.mes}<br><span class="text-xs font-normal">${b.anio}</span>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">${b.descripcion}</p>
                        <a href="${b.archivoURL}" target="_blank" class="text-emerald-600 hover:underline text-xs font-bold flex items-center gap-1 mt-1">
                            <ion-icon name="document-text"></ion-icon> ${b.archivoNombre || 'Descargar PDF'}
                        </a>
                    </div>
                </div>
                <button class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg text-xs font-bold transition btn-eliminar-balance" data-id="${b.id}" data-path="${b.storagePath || ''}">
                    <ion-icon name="trash"></ion-icon> Eliminar
                </button>
            </div>
        `).join('');

        container.querySelectorAll('.btn-eliminar-balance').forEach(btn => {
            btn.addEventListener('click', async function () {
                const id = this.dataset.id;
                const path = this.dataset.path;
                if (!confirm('Eliminar este balance? Desaparecera de la pagina publica.')) return;
                this.disabled = true;
                this.innerHTML = '<ion-icon name="sync" class="animate-spin"></ion-icon>';
                try {
                    await deleteDoc(doc(db, 'balances', id));
                    if (path) await deleteObject(ref(storage, path)).catch(() => {});
                    cargarBalances();
                } catch (err) {
                    alert('Error al eliminar: ' + err.message);
                    this.disabled = false;
                    this.innerHTML = '<ion-icon name="trash"></ion-icon> Eliminar';
                }
            });
        });
    } catch (e) {
        container.innerHTML = `<p class="text-center py-8 text-red-500">Error: ${e.message}</p>`;
    }
}

