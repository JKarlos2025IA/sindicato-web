// ============================================================
// SIUTCASJNJ - Modulo: Economia y Finanzas (v2)
// ============================================================
import { db, storage, collection, getDocs, addDoc, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from '../../core.js';
import { ref, uploadBytes, getDownloadURL } from '../../core.js';

let snapCache = null;

export function initEconomia() {
    window.cargarSolicitudes = cargarSolicitudes;
    window.cargarLibroGastos = cargarLibroGastos;
    window.cargarBalance = cargarBalance;
    window.descargarLibro = descargarLibro;
    window.actualizarSelectFirmado = actualizarSelectFirmado;
    window.cerrarModal = cerrarModal;
    window.cargarIngresos = cargarIngresos;

    cargarSolicitudes();
    cargarLibroGastos();
    initBalance();
    initUploadSigned();
    initModalButtons();
    initIngresos();
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

        const docs = snap.docs.filter(d => d.data().estado !== 'eliminado');
        if (docs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" class="text-center py-8 text-gray-400">No hay solicitudes.</td></tr>';
            return;
        }

        tbody.innerHTML = docs.map(d => {
            const v = d.data();
            const id = d.id;
            const f = v.timestamp?.toDate ? v.timestamp.toDate().toLocaleDateString('es-PE') : '';
            const archivos = (v.archivos || []).map(a =>
                `<a href="${a.url}" target="_blank" class="text-blue-600 hover:underline text-xs block truncate max-w-[250px]">${a.nombre}</a>`
            ).join('');
            const plantilla = v.plantillaFirmadaURL
                ? `<a href="${v.plantillaFirmadaURL}" target="_blank" class="text-blue-600 hover:underline text-xs font-bold">Ver Firmada</a>`
                : '<span class="text-gray-300 text-xs">-</span>';
            const badge = v.estado === 'anotado'
                ? '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Anotado</span>'
                : '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Pendiente</span>';
            const btnAnotar = v.estado !== 'anotado'
                ? `<button class="text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded text-xs font-bold" data-act="anotar" data-id="${id}">Anotar</button>`
                : '';
            const btnDevolver = v.estado === 'anotado'
                ? `<button class="text-amber-600 hover:bg-amber-50 px-2 py-1 rounded text-xs font-bold" data-act="devolver" data-id="${id}">Devolver</button>`
                : '';

            return `<tr class="border-b hover:bg-gray-50">
                <td class="p-2 text-xs whitespace-nowrap">${f}</td>
                <td class="p-2 text-xs">${v.nombre||''}</td>
                <td class="p-2 text-xs max-w-[380px] truncate" title="${v.descripcion||''}">${v.descripcion||''}</td>
                <td class="p-2 text-xs text-center">${v.cantidad||''}</td>
                <td class="p-2 text-xs text-center">${v.unidad||''}</td>
                <td class="p-2 text-xs text-right">${(v.pu||0).toFixed(2)}</td>
                <td class="p-2 text-xs text-right font-bold">${(v.total||0).toFixed(2)}</td>
                <td class="p-2 text-xs max-w-[200px] truncate" title="${v.observacion||''}">${v.observacion||''}</td>
                <td class="p-2 text-xs max-w-[200px] truncate" title="${v.sustento||''}">${v.sustento||''}</td>
                <td class="p-2 text-xs">${archivos||'<span class="text-gray-300">-</span>'}</td>
                <td class="p-2 text-xs">${plantilla}</td>
                <td class="p-2 text-center">${badge}</td>
                <td class="p-2 whitespace-nowrap">
                    <div class="flex gap-1 justify-center">
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
    document.getElementById('edit-fecha').value = v.fecha || '';
    document.getElementById('edit-descripcion').value = v.descripcion || '';
    document.getElementById('edit-cantidad').value = v.cantidad || 1;
    document.getElementById('edit-unidad').value = v.unidad || 'UNIDAD';
    document.getElementById('edit-pu').value = v.pu || 0;
    document.getElementById('edit-total').value = v.total || 0;
    document.getElementById('edit-observacion').value = v.observacion || '';
    document.getElementById('edit-sustento').value = v.sustento || '';
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
            await updateDoc(doc(db, 'viaticos', vid), {
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
        const docs = snap.docs.filter(d => d.data().estado === 'anotado');

        if (docs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center py-8 text-gray-400">No hay gastos anotados.</td></tr>';
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
            const firmado = v.firmadoURL
                ? `<a href="${v.firmadoURL}" target="_blank" class="text-emerald-600 hover:underline text-xs font-bold">Firmado</a>`
                : '<span class="text-gray-400 text-xs">Sin firmar</span>';
            return `<tr class="border-b hover:bg-gray-50">
                <td class="p-2 text-xs whitespace-nowrap">${f}</td>
                <td class="p-2 text-xs">${v.nombre||''}</td>
                <td class="p-2 text-xs max-w-[380px] truncate" title="${v.descripcion||''}">${v.descripcion||''}</td>
                <td class="p-2 text-xs text-center">${v.cantidad||''}</td>
                <td class="p-2 text-xs text-center">${v.unidad||''}</td>
                <td class="p-2 text-xs text-right">${(v.pu||0).toFixed(2)}</td>
                <td class="p-2 text-xs text-right font-bold">${(v.total||0).toFixed(2)}</td>
                <td class="p-2 text-xs max-w-[200px] truncate" title="${v.observacion||''}">${v.observacion||''}</td>
                <td class="p-2 text-xs">${firmado}</td>
            </tr>`;
        }).join('');

        document.getElementById('total-libro').textContent = total.toFixed(2);
        document.getElementById('btn-descargar-libro').disabled = false;
        actualizarSelectFirmado();
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-red-500">${e.message}</td></tr>`;
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
// 3. BALANCE
// ============================================================

function initBalance() {
    document.getElementById('balance-tipo')?.addEventListener('change', cargarBalance);
    document.getElementById('balance-mes')?.addEventListener('change', cargarBalance);
    document.getElementById('balance-anio')?.addEventListener('change', cargarBalance);

    const now = new Date();
    const selMes = document.getElementById('balance-mes');
    const selAnio = document.getElementById('balance-anio');
    if (selMes) selMes.value = now.getMonth() + 1;
    if (selAnio) {
        selAnio.value = now.getFullYear();
        if (selAnio.options.length < 2) {
            for (let y = now.getFullYear(); y >= 2020; y--)
                selAnio.innerHTML += `<option value="${y}">${y}</option>`;
        }
    }
}

async function cargarBalance() {
    const container = document.getElementById('balance-detalle');
    const totalEl = document.getElementById('balance-total');
    if (!container) return;

    const tipo = document.getElementById('balance-tipo')?.value || 'mes';
    const mes = parseInt(document.getElementById('balance-mes')?.value) || (new Date().getMonth()+1);
    const anio = parseInt(document.getElementById('balance-anio')?.value) || new Date().getFullYear();
    const MESES = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    try {
        const q = query(collection(db, 'viaticos'), orderBy('timestamp','desc'));
        const snap = await getDocs(q);
        const docs = snap.docs.filter(d => d.data().estado === 'anotado');

        const gastos = [];
        docs.forEach(d => {
            const v = d.data();
            if (!v.timestamp?.toDate) return;
            const date = v.timestamp.toDate();
            gastos.push({ fecha: date, nombre: v.nombre, descripcion: v.descripcion, total: v.total||0, mes: date.getMonth()+1, anio: date.getFullYear(), unidad: v.unidad, cantidad: v.cantidad, pu: v.pu });
        });

        let filtrados = gastos;
        if (tipo === 'mes') filtrados = gastos.filter(g => g.mes === mes && g.anio === anio);
        else if (tipo === 'anio') filtrados = gastos.filter(g => g.anio === anio);

        const total = filtrados.reduce((s,g) => s+g.total, 0);
        if (totalEl) totalEl.textContent = 'S/ ' + total.toFixed(2);

        if (filtrados.length === 0) {
            container.innerHTML = '<p class="text-center py-8 text-gray-400">Sin gastos en este periodo.</p>';
            return;
        }

        if (tipo === 'mes') {
            const sorted = filtrados.sort((a,b) => b.fecha - a.fecha);
            container.innerHTML = `<table class="w-full text-sm"><thead><tr class="bg-emerald-50"><th class="p-2 text-left">Fecha</th><th class="p-2 text-left">Solicitante</th><th class="p-2 text-left">Descripcion</th><th class="p-2 text-right">Monto</th></tr></thead><tbody>${sorted.map(g => `<tr class="border-b"><td class="p-2 text-xs">${g.fecha.toLocaleDateString('es-PE')}</td><td class="p-2 text-xs">${g.nombre}</td><td class="p-2 text-xs">${g.descripcion}</td><td class="p-2 text-xs text-right font-bold">S/ ${g.total.toFixed(2)}</td></tr>`).join('')}</tbody></table>`;
        } else if (tipo === 'anio') {
            const porMes = {};
            filtrados.forEach(g => {
                const k = `${g.anio}-${g.mes.toString().padStart(2,'0')}`;
                if (!porMes[k]) porMes[k] = { total:0, mes:g.mes, anio:g.anio, items:[] };
                porMes[k].total += g.total;
                porMes[k].items.push(g);
            });
            const meses = Object.values(porMes).sort((a,b) => b.anio!==a.anio ? b.anio-a.anio : b.mes-a.mes);
            container.innerHTML = meses.map(m => `<div class="bg-white rounded-lg border p-4 mb-3"><div class="flex justify-between items-center mb-2"><h4 class="font-bold text-gray-800">${MESES[m.mes]} ${m.anio}</h4><span class="font-bold text-emerald-700">S/ ${m.total.toFixed(2)}</span></div><table class="w-full text-xs"><tbody>${m.items.sort((a,b)=>b.fecha-a.fecha).map(g=>`<tr class="border-t border-gray-100"><td class="py-1">${g.fecha.toLocaleDateString('es-PE')}</td><td class="py-1">${g.nombre}</td><td class="py-1">${g.descripcion}</td><td class="py-1 text-right">S/ ${g.total.toFixed(2)}</td></tr>`).join('')}</tbody></table></div>`).join('');
        } else {
            const todos = gastos.sort((a,b) => b.fecha - a.fecha);
            container.innerHTML = `<table class="w-full text-sm"><thead><tr class="bg-emerald-50"><th class="p-2 text-left">Fecha</th><th class="p-2 text-left">Solicitante</th><th class="p-2 text-left">Descripcion</th><th class="p-2 text-center">Cant</th><th class="p-2 text-center">Unid</th><th class="p-2 text-right">P.U.</th><th class="p-2 text-right">Total</th></tr></thead><tbody>${todos.map(g => `<tr class="border-b"><td class="p-2 text-xs">${g.fecha.toLocaleDateString('es-PE')}</td><td class="p-2 text-xs">${g.nombre}</td><td class="p-2 text-xs">${g.descripcion}</td><td class="p-2 text-xs text-center">${g.cantidad||''}</td><td class="p-2 text-xs text-center">${g.unidad||''}</td><td class="p-2 text-xs text-right">${(g.pu||0).toFixed(2)}</td><td class="p-2 text-xs text-right font-bold">S/ ${g.total.toFixed(2)}</td></tr>`).join('')}</tbody></table>`;
        }
    } catch (e) {
        container.innerHTML = `<p class="text-center py-8 text-red-500">${e.message}</p>`;
    }
}

// ============================================================
// 4. INGRESOS
// ============================================================

function initIngresos() {
    document.getElementById('form-ingreso')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-ingreso');
        btn.disabled = true;
        btn.textContent = 'Guardando...';
        try {
            await addDoc(collection(db, 'ingresos'), {
                tipo: document.getElementById('ing-tipo').value,
                monto: parseFloat(document.getElementById('ing-monto').value) || 0,
                descripcion: document.getElementById('ing-desc').value.trim().toUpperCase(),
                fecha: document.getElementById('ing-fecha').value,
                responsable: document.getElementById('ing-responsable').value.trim().toUpperCase(),
                timestamp: serverTimestamp()
            });
            document.getElementById('form-ingreso').reset();
            cargarIngresos();
        } catch (err) { alert('Error: ' + err.message); }
        btn.disabled = false;
        btn.innerHTML = 'Registrar Ingreso';
    });
}

async function cargarIngresos() {
    const tbody = document.getElementById('tbl-ingresos');
    const totalEl = document.getElementById('total-ingresos');
    if (!tbody) return;
    try {
        const q = query(collection(db, 'ingresos'), orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        if (snap.empty) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-400">No hay ingresos registrados.</td></tr>';
            if (totalEl) totalEl.textContent = 'S/ 0.00';
            return;
        }
        let total = 0;
        tbody.innerHTML = snap.docs.map(d => {
            const v = d.data();
            total += v.monto || 0;
            const f = v.timestamp?.toDate ? v.timestamp.toDate().toLocaleDateString('es-PE') : (v.fecha || '');
            return `<tr class="border-b hover:bg-gray-50">
                <td class="p-2 text-xs whitespace-nowrap">${f}</td>
                <td class="p-2 text-xs"><span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">${v.tipo||''}</span></td>
                <td class="p-2 text-xs">${v.descripcion||''}</td>
                <td class="p-2 text-xs">${v.responsable||''}</td>
                <td class="p-2 text-xs text-right font-bold text-emerald-700">S/ ${(v.monto||0).toFixed(2)}</td>
                <td class="p-2 text-center"><button class="text-red-400 hover:text-red-600 text-xs font-bold" data-del-ing="${d.id}">X</button></td>
            </tr>`;
        }).join('');
        if (totalEl) totalEl.textContent = 'S/ ' + total.toFixed(2);

        tbody.querySelectorAll('[data-del-ing]').forEach(btn => {
            btn.addEventListener('click', async function () {
                if (confirm('Eliminar este ingreso?')) {
                    await deleteDoc(doc(db, 'ingresos', this.dataset.delIng));
                    cargarIngresos();
                }
            });
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-red-500">${e.message}</td></tr>`;
    }
}
