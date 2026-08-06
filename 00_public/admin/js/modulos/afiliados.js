// ============================================================
// SIUTCASJNJ - Modulo: Afiliados (Centro de Datos)
// ============================================================
import { db, collection, getDocs, query, where, writeBatch, updateDoc, addDoc, deleteDoc, doc, serverTimestamp } from '../core.js';

export function initAfiliados() {
    const listaSocios = document.getElementById('lista-socios');
    const socioCount = document.getElementById('socio-count');
    const socioSearch = document.getElementById('socio-search');

    window.generarCodigoSocio = function () {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
        document.getElementById('socio-codigo').value = code;
    };

    window.cargarSocios = async function (filtro = '') {
        if (!listaSocios) return;
        try {
            listaSocios.innerHTML = '<tr><td colspan="11" class="px-3 py-4 text-center">Cargando afiliados...</td></tr>';
            const qSocios = await getDocs(collection(db, "socios"));
            const socios = [];
            qSocios.forEach(docSnap => socios.push({ id: docSnap.id, ...docSnap.data() }));
            socios.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

            const field = document.getElementById('socio-filter-field');
            const campo = field ? field.value : 'todos';
            const q = filtro.toLowerCase();
            const filtrados = filtro ? socios.filter(s => {
                if (campo === 'todos') {
                    return ['nombre','dni','codigo','uo','cargo','genero','email','telefono'].some(k =>
                        (s[k] || '').toLowerCase().includes(q));
                }
                return (s[campo] || '').toLowerCase().includes(q);
            }) : socios;

            if (socioCount) socioCount.textContent = socios.length;

            if (filtrados.length === 0) {
                listaSocios.innerHTML = `<tr><td colspan="11" class="px-3 py-4 text-center text-gray-500">${filtro ? 'No se encontraron resultados.' : 'No hay afiliados registrados.'}</td></tr>`;
                return;
            }

            let html = '';
            filtrados.forEach(s => {
                const activo = s.activo !== false;
                const badge = activo
                    ? '<span class="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Activo</span>'
                    : '<span class="bg-red-50 text-red-500 px-2 py-1 rounded text-xs font-bold">Inactivo</span>';
                const genIcon = s.genero === 'F'
                    ? '<span class="text-pink-500 font-bold" title="Femenino">F</span>'
                    : s.genero === 'M'
                    ? '<span class="text-blue-500 font-bold" title="Masculino">M</span>'
                    : '-';
                html += `
                    <tr class="hover:bg-gray-50 transition ${activo ? '' : 'opacity-60'}">
                        <td class="px-3 py-2 font-mono text-xs font-bold text-blue-600 whitespace-nowrap">${s.codigo || '-'}</td>
                        <td class="px-3 py-2 font-medium text-gray-800 text-xs max-w-[180px] truncate" title="${s.nombre || ''}">${s.nombre || '-'}</td>
                        <td class="px-3 py-2 text-gray-500 text-xs">${s.dni || '-'}</td>
                        <td class="px-3 py-2 text-gray-500 text-xs max-w-[150px] truncate" title="${s.uo || ''}">${s.uo || '-'}</td>
                        <td class="px-3 py-2 text-gray-500 text-xs max-w-[120px] truncate" title="${s.cargo || ''}">${s.cargo || '-'}</td>
                        <td class="px-3 py-2"><span class="bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded text-xs font-bold whitespace-nowrap">${s.fecha || '-'}</span></td>
                        <td class="px-3 py-2 text-gray-500 text-xs max-w-[150px] truncate" title="${s.email || ''}">${s.email || '-'}</td>
                        <td class="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">${s.telefono || '-'}</td>
                        <td class="px-3 py-2 text-center">${genIcon}</td>
                        <td class="px-3 py-2">${badge}</td>
                        <td class="px-3 py-2 text-right space-x-1 whitespace-nowrap">
                            <button class="text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded text-xs font-bold transition btn-editar-socio" data-id="${s.id}">Editar</button>
                            <button class="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-bold transition btn-eliminar-socio" data-id="${s.id}">Eliminar</button>
                        </td>
                    </tr>`;
            });
            listaSocios.innerHTML = html;

            document.querySelectorAll('.btn-editar-socio').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    const socio = socios.find(s => s.id === id);
                    if (!socio) return;
                    document.getElementById('socio-id-edit').value = id;
                    document.getElementById('socio-nombre').value = socio.nombre || '';
                    document.getElementById('socio-dni').value = socio.dni || '';
                    document.getElementById('socio-codigo').value = socio.codigo || '';
                    document.getElementById('socio-fecha').value = socio.fecha || '';
                    document.getElementById('socio-email').value = socio.email || '';
                    document.getElementById('socio-telefono').value = socio.telefono || '';
                    document.getElementById('socio-uo').value = socio.uo || '';
                    document.getElementById('socio-cargo').value = socio.cargo || '';
                    document.getElementById('socio-genero').value = socio.genero || '';
                    const cb = document.getElementById('socio-activo');
                    const lbl = document.getElementById('socio-activo-label');
                    cb.checked = socio.activo !== false;
                    lbl.textContent = cb.checked ? 'Activo' : 'Inactivo';
                    lbl.className = cb.checked ? 'text-sm font-semibold text-emerald-600' : 'text-sm font-semibold text-red-500';
                    document.getElementById('btn-socio-text').textContent = 'Actualizar Afiliado';
                    document.getElementById('btn-cancel-socio').classList.remove('hidden');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            });

            document.querySelectorAll('.btn-eliminar-socio').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    if (confirm('Eliminar este afiliado de la lista?')) {
                        await deleteDoc(doc(db, "socios", id));
                        await window.cargarSocios(socioSearch ? socioSearch.value : '');
                    }
                });
            });
        } catch (error) {
            console.error("Error cargando afiliados:", error);
            listaSocios.innerHTML = '<tr><td colspan="11" class="px-3 py-4 text-center text-red-500">Error al cargar afiliados.</td></tr>';
        }
    };

    // === IMPORTAR EXCEL ===
    window.importarSociosExcel = async function (event) {
        const file = event.target.files[0];
        if (!file) return;
        try {
            const data = await file.arrayBuffer();
            const wb = XLSX.read(data, { type: 'array' });

            let bestSheet = wb.SheetNames[0];
            for (const name of wb.SheetNames) {
                const sh = wb.Sheets[name];
                const preview = XLSX.utils.sheet_to_json(sh, { header: 1, defval: '' });
                for (let r = 0; r < Math.min(preview.length, 5); r++) {
                    const txt = (preview[r] || []).map(c => String(c || '').toUpperCase().trim()).join(' ');
                    if (txt.includes('CARGO') && !txt.includes('ESTADO')) { bestSheet = name; break; }
                }
            }
            const ws = wb.Sheets[bestSheet];
            const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

            let headerRow = -1;
            for (let i = 0; i < Math.min(rows.length, 10); i++) {
                const row = rows[i];
                if (!row || !Array.isArray(row)) continue;
                const txt = row.map(c => String(c || '').toUpperCase().trim()).join(' ');
                if (txt.includes('APELLIDOS') || txt.includes('NOMBRES') || txt.includes('NOMBRE')) { headerRow = i; break; }
            }
            if (headerRow < 0) { alert('No se encontro cabecera con APELLIDOS Y NOMBRES.'); event.target.value = ''; return; }

            const headers = rows[headerRow].map(h => String(h || '').toUpperCase().trim());
            let colNombre = -1, colUO = -1, colCargo = -1, colDNI = -1, colCodigo = -1, colCumple = -1, colEmail = -1, colTelefono = -1, colEstado = -1, colGenero = -1;
            for (let i = 0; i < headers.length; i++) {
                const h = headers[i]; if (!h) continue;
                if (h.includes('APELLIDOS') || h.includes('NOMBRE')) colNombre = i;
                if (h.includes('CODIGO')) colCodigo = i;
                if (h.includes('CUMPLE')) colCumple = i;
                if (h === 'DNI' || h.startsWith('DNI')) colDNI = i;
                if (h.includes('EMAIL') || h.includes('CORREO')) colEmail = i;
                if (h.includes('TELEFONO') || h.includes('CELULAR')) colTelefono = i;
                if (h === 'ESTADO' || h.startsWith('ESTADO')) colEstado = i;
                if (h === 'UO' || h.startsWith('UO') || h.includes('UNIDAD') || h.includes('OFICINA')) colUO = i;
                if (h.includes('CARGO')) colCargo = i;
                if (h.includes('GENERO') || h.includes('SEXO')) colGenero = i;
            }
            if (colNombre < 0) { alert('No se encontro columna NOMBRE.'); event.target.value = ''; return; }

            let codigosPre = [];
            try { const r = await fetch('admin/afiliados_codigos.json'); codigosPre = await r.json(); } catch (e) {}

            const existingMap = new Map();
            const existingCodes = new Set();
            const qSnap = await getDocs(collection(db, 'socios'));
            qSnap.forEach(d => {
                const dt = d.data();
                if (dt.codigo) existingCodes.add(dt.codigo);
                if (dt.nombre) existingMap.set(dt.nombre.toUpperCase(), { id: d.id, data: dt });
            });

            const paraCrear = [];
            const paraActualizar = [];
            let idx = 0, nuevos = 0, actualizados = 0;
            for (let i = headerRow + 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || !row[colNombre]) continue;
                const nombre = String(row[colNombre]).trim().toUpperCase();
                if (!nombre || nombre.length < 5) continue;

                const existente = existingMap.get(nombre);
                const dniExcel = colDNI >= 0 && row[colDNI] ? String(row[colDNI]).trim() : '';
                const uoExcel = colUO >= 0 && row[colUO] ? String(row[colUO]).trim().toUpperCase() : '';
                const cargoExcel = colCargo >= 0 && row[colCargo] ? String(row[colCargo]).trim().toUpperCase() : '';
                const cumpleExcel = colCumple >= 0 && row[colCumple] ? String(row[colCumple]).trim() : '';
                const emailExcel = colEmail >= 0 && row[colEmail] ? String(row[colEmail]).trim() : '';
                const telExcel = colTelefono >= 0 && row[colTelefono] ? String(row[colTelefono]).trim() : '';
                let activoExcel = null;
                if (colEstado >= 0 && row[colEstado]) {
                    const ev = String(row[colEstado]).trim().toUpperCase();
                    if (ev === 'INACTIVO' || ev === 'SUSPENDIDO') activoExcel = false;
                    else if (ev === 'ACTIVO') activoExcel = true;
                }
                const generoExcel = colGenero >= 0 && row[colGenero] ? String(row[colGenero]).trim().toUpperCase().charAt(0) : '';

                if (existente) {
                    const upd = { dni: dniExcel || existente.data.dni || '', uo: uoExcel || existente.data.uo || '', cargo: cargoExcel || existente.data.cargo || '', timestamp: Date.now() };
                    if (cumpleExcel) upd.fecha = cumpleExcel;
                    if (emailExcel) upd.email = emailExcel;
                    if (telExcel) upd.telefono = telExcel;
                    if (activoExcel !== null) upd.activo = activoExcel;
                    if (generoExcel) upd.genero = generoExcel;
                    if (colCodigo >= 0 && row[colCodigo] && !existente.data.codigo) upd.codigo = String(row[colCodigo]).trim().toUpperCase();
                    paraActualizar.push({ ref: doc(db, 'socios', existente.id), data: upd });
                    actualizados++;
                } else {
                    let codigo = '';
                    if (colCodigo >= 0 && row[colCodigo]) codigo = String(row[colCodigo]).trim().toUpperCase();
                    else if (idx < codigosPre.length) codigo = codigosPre[idx].codigo;
                    if (!codigo || existingCodes.has(codigo)) {
                        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                        do { codigo = ''; for (let j = 0; j < 6; j++) codigo += chars[Math.floor(Math.random() * chars.length)]; }
                        while (existingCodes.has(codigo));
                    }
                    existingCodes.add(codigo);
                    paraCrear.push({ nombre, codigo, dni: dniExcel, uo: uoExcel, cargo: cargoExcel, fecha: cumpleExcel, email: emailExcel, telefono: telExcel, activo: activoExcel !== null ? activoExcel : true, genero: generoExcel, timestamp: Date.now() });
                    nuevos++;
                }
                idx++;
            }

            if (paraCrear.length === 0 && paraActualizar.length === 0) { alert('No hay cambios para importar.'); event.target.value = ''; return; }

            const BS = 400;
            for (let i = 0; i < paraActualizar.length; i += BS) {
                const batch = writeBatch(db);
                paraActualizar.slice(i, i + BS).forEach(u => batch.update(u.ref, u.data));
                await batch.commit();
            }
            for (let i = 0; i < paraCrear.length; i += BS) {
                const batch = writeBatch(db);
                paraCrear.slice(i, i + BS).forEach(a => batch.set(doc(collection(db, 'socios')), a));
                await batch.commit();
            }
            alert(`Importacion: ${nuevos} nuevos, ${actualizados} actualizados (cumpleanos, email y telefono preservados).`);
            await window.cargarSocios();
        } catch (err) { alert('Error al importar Excel: ' + err.message); }
        event.target.value = '';
    };

    // === ELIMINAR TODOS ===
    window.eliminarTodosSocios = async function () {
        if (!confirm('Estas seguro? Se eliminaran TODOS los afiliados.')) return;
        try {
            const snap = await getDocs(collection(db, 'socios'));
            const docs = []; snap.forEach(d => docs.push(d));
            for (let i = 0; i < docs.length; i += 400) {
                const batch = writeBatch(db);
                docs.slice(i, i + 400).forEach(d => batch.delete(d.ref));
                await batch.commit();
            }
            alert(`Eliminados: ${docs.length} afiliados.`);
            await window.cargarSocios();
        } catch (err) { alert('Error al eliminar: ' + err.message); }
    };

    // === EXPORTAR EXCEL ===
    window.exportarSociosExcel = async function () {
        try {
            const qSnap = await getDocs(collection(db, 'socios'));
            const data = [];
            qSnap.forEach(d => {
                const s = d.data();
                data.push({
                    'Codigo': s.codigo || '', 'Nombre': s.nombre || '', 'DNI': s.dni || '',
                    'UO': s.uo || '', 'Cargo': s.cargo || '', 'Cumpleanos': s.fecha || '',
                    'Email': s.email || '', 'Telefono': s.telefono || '',
                    'Estado': s.activo !== false ? 'Activo' : 'Inactivo',
                    'Genero': s.genero === 'F' ? 'Femenino' : s.genero === 'M' ? 'Masculino' : ''
                });
            });
            data.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
            const ws = XLSX.utils.json_to_sheet(data);
            ws['!cols'] = [{ wch: 10 }, { wch: 45 }, { wch: 12 }, { wch: 40 }, { wch: 25 }, { wch: 10 }, { wch: 35 }, { wch: 15 }, { wch: 8 }, { wch: 10 }];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Afiliados');
            XLSX.writeFile(wb, 'Afiliados_Exportado_' + new Date().toISOString().slice(0,10) + '.xlsx');
        } catch (err) { alert('Error al exportar: ' + err.message); }
    };

    // Event listeners
    if (socioSearch) socioSearch.addEventListener('input', e => window.cargarSocios(e.target.value));
    const socioFilterField = document.getElementById('socio-filter-field');
    if (socioFilterField) socioFilterField.addEventListener('change', () => window.cargarSocios(socioSearch ? socioSearch.value : ''));

    const formSocio = document.getElementById('form-socio');
    if (formSocio) {
        formSocio.addEventListener('submit', async (e) => {
            e.preventDefault();
            const idEdit = document.getElementById('socio-id-edit').value;
            const nombre = document.getElementById('socio-nombre').value.trim().toUpperCase();
            if (!nombre) return;
            const dni = document.getElementById('socio-dni').value.trim();
            const codigo = document.getElementById('socio-codigo').value.trim();
            const fecha = document.getElementById('socio-fecha').value.trim();
            const email = document.getElementById('socio-email').value.trim();
            const telefono = document.getElementById('socio-telefono').value.trim();
            const uo = document.getElementById('socio-uo').value.trim().toUpperCase();
            const cargo = document.getElementById('socio-cargo').value.trim().toUpperCase();
            const activo = document.getElementById('socio-activo').checked;
            const genero = document.getElementById('socio-genero').value;

            const btn = document.getElementById('btn-submit-socio');
            const btnText = document.getElementById('btn-socio-text');
            const btnIcon = btn.querySelector('ion-icon');
            btn.disabled = true;
            btnIcon.setAttribute('name', 'sync');
            btnIcon.classList.add('animate-spin');
            btnText.textContent = 'Guardando...';

            try {
                const data = { nombre, dni, codigo, fecha, email, telefono, uo, cargo, activo, genero, timestamp: Date.now() };
                if (idEdit) { await updateDoc(doc(db, "socios", idEdit), data); }
                else { await addDoc(collection(db, "socios"), data); }
                formSocio.reset();
                document.getElementById('socio-id-edit').value = '';
                document.getElementById('socio-activo').checked = true;
                document.getElementById('socio-activo-label').textContent = 'Activo';
                document.getElementById('socio-activo-label').className = 'text-sm font-semibold text-emerald-600';
                btnText.textContent = 'Guardar Afiliado';
                document.getElementById('btn-cancel-socio').classList.add('hidden');
                await window.cargarSocios();
            } catch (err) { alert('Error al guardar: ' + err.message); }
            finally {
                btn.disabled = false;
                btnIcon.setAttribute('name', 'save');
                btnIcon.classList.remove('animate-spin');
                btnText.textContent = 'Guardar Afiliado';
            }
        });
    }

    const cbActivo = document.getElementById('socio-activo');
    if (cbActivo) cbActivo.addEventListener('change', function () {
        const lbl = document.getElementById('socio-activo-label');
        lbl.textContent = this.checked ? 'Activo' : 'Inactivo';
        lbl.className = this.checked ? 'text-sm font-semibold text-emerald-600' : 'text-sm font-semibold text-red-500';
    });

    const btnCancelSocio = document.getElementById('btn-cancel-socio');
    if (btnCancelSocio) btnCancelSocio.addEventListener('click', () => {
        formSocio?.reset();
        document.getElementById('socio-id-edit').value = '';
        document.getElementById('socio-activo').checked = true;
        document.getElementById('socio-activo-label').textContent = 'Activo';
        document.getElementById('socio-activo-label').className = 'text-sm font-semibold text-emerald-600';
        document.getElementById('btn-socio-text').textContent = 'Guardar Afiliado';
        btnCancelSocio.classList.add('hidden');
    });
}
