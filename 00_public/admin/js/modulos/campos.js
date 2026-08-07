// ============================================================
// SIUTCASJNJ - Modulo: Campos Extra & Campanas de Actualizacion
// ============================================================
import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, writeBatch, serverTimestamp } from '../core.js';

let camposCache = [];
let campanasCache = [];
const COL_CAMPOS = 'campos_extra';
const COL_CAMPANAS = 'campanas_actualizacion';

const CAMPOS_BASE_EDITABLES = [
    { nombre: 'email', etiqueta: 'Email', tipo: 'texto', base: true },
    { nombre: 'telefono', etiqueta: 'Telefono / WhatsApp', tipo: 'texto', base: true },
    { nombre: 'fecha', etiqueta: 'Fecha de Cumpleanos (DD/MM)', tipo: 'texto', base: true },
    { nombre: 'dni', etiqueta: 'DNI', tipo: 'texto', base: true },
    { nombre: 'uo', etiqueta: 'Unidad Organica (UO)', tipo: 'texto', base: true },
    { nombre: 'cargo', etiqueta: 'Cargo', tipo: 'texto', base: true },
];

function slug(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 30);
}

// ============================================================
// SUB-TAB NAVIGATION
// ============================================================
function initSubTabs() {
    const tabs = {
        'subtab-socio-afiliados': 'panel-socio-afiliados',
        'subtab-socio-campos': 'panel-socio-campos',
        'subtab-socio-campanas': 'panel-socio-campanas'
    };

    Object.keys(tabs).forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', () => {
            Object.keys(tabs).forEach(bid => {
                const b = document.getElementById(bid);
                if (b) { b.classList.remove('bg-white', 'shadow', 'text-pink-700'); b.classList.add('text-gray-500', 'hover:text-gray-700'); }
            });
            btn.classList.add('bg-white', 'shadow', 'text-pink-700');
            btn.classList.remove('text-gray-500', 'hover:text-gray-700');
            Object.values(tabs).forEach(pid => {
                const p = document.getElementById(pid);
                if (p) p.classList.add('hidden');
            });
            const panel = document.getElementById(tabs[id]);
            if (panel) panel.classList.remove('hidden');
        });
    });
}

// ============================================================
// CAMPOS EXTRA - CRUD
// ============================================================
async function cargarCampos() {
    const tbody = document.getElementById('lista-campos-extra');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="4" class="px-3 py-4 text-center text-gray-400">Cargando...</td></tr>`;
    try {
        const snap = await getDocs(collection(db, COL_CAMPOS));
        camposCache = [];
        snap.forEach(d => camposCache.push({ id: d.id, ...d.data() }));
        camposCache.sort((a, b) => (a.orden || 99) - (b.orden || 99));

        if (camposCache.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="px-3 py-4 text-center text-gray-500">No hay campos extra. Crea el primero aqui arriba.</td></tr>`;
            return;
        }

        let html = '';
        camposCache.forEach(c => {
            const tipoLabel = { texto: 'Texto', numero: 'Numero', si_no: 'Si/No', opciones: 'Opciones' }[c.tipo] || c.tipo;
            const opcionesInfo = c.tipo === 'opciones' ? (c.opciones || []).join(', ') + (c.permitir_otros ? ' + Otros' : '') : '-';
            html += `
            <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                <td class="px-3 py-2 font-medium text-gray-800 text-xs">${c.etiqueta || ''}</td>
                <td class="px-3 py-2 font-mono text-xs text-gray-500">${c.nombre || ''}</td>
                <td class="px-3 py-2 text-xs"><span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">${tipoLabel}</span></td>
                <td class="px-3 py-2 text-xs text-gray-500 max-w-[180px] truncate">${opcionesInfo}</td>
                <td class="px-3 py-2 text-right space-x-1 whitespace-nowrap">
                    <button class="text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded text-xs font-bold btn-editar-campo" data-id="${c.id}">Editar</button>
                    <button class="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-bold btn-eliminar-campo" data-id="${c.id}">Eliminar</button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;

        document.querySelectorAll('.btn-editar-campo').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = e.currentTarget.getAttribute('data-id');
                const campo = camposCache.find(c => c.id === id);
                if (!campo) return;
                document.getElementById('campo-id-edit').value = campo.id;
                document.getElementById('campo-etiqueta').value = campo.etiqueta || '';
                document.getElementById('campo-nombre').value = campo.nombre || '';
                document.getElementById('campo-tipo').value = campo.tipo || 'texto';
                document.getElementById('campo-orden').value = campo.orden || 1;
                const ac = campo.activo !== false;
                document.getElementById('campo-activo').checked = ac;
                document.getElementById('campo-activo-label').textContent = ac ? 'Activo' : 'Inactivo';
                document.getElementById('campo-opciones-container').classList.toggle('hidden', campo.tipo !== 'opciones');
                document.getElementById('campo-opciones').value = (campo.opciones || []).join('\n');
                document.getElementById('campo-otros').checked = campo.permitir_otros || false;
                document.getElementById('btn-campo-text').textContent = 'Actualizar Campo';
                document.getElementById('btn-cancel-campo').classList.remove('hidden');
                document.getElementById('form-campo-container').scrollIntoView({ behavior: 'smooth' });
            });
        });

        document.querySelectorAll('.btn-eliminar-campo').forEach(btn => {
            btn.addEventListener('click', async e => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm('Eliminar este campo extra? Los datos de los afiliados NO se borran.')) {
                    await deleteDoc(doc(db, COL_CAMPOS, id));
                    await cargarCampos();
                    await cargarCamposChecklist();
                }
            });
        });
    } catch (err) {
        console.error('Error cargando campos extra:', err);
        tbody.innerHTML = `<tr><td colspan="4" class="px-3 py-4 text-center text-red-500">Error al cargar campos.</td></tr>`;
    }
}

function initFormCampo() {
    const form = document.getElementById('form-campo');
    const tipoSelect = document.getElementById('campo-tipo');
    const etiquetaInput = document.getElementById('campo-etiqueta');
    const nombreInput = document.getElementById('campo-nombre');

    if (etiquetaInput && nombreInput) {
        etiquetaInput.addEventListener('input', () => {
            if (!document.getElementById('campo-id-edit').value) {
                nombreInput.value = slug(etiquetaInput.value);
            }
        });
    }

    if (tipoSelect) {
        tipoSelect.addEventListener('change', () => {
            document.getElementById('campo-opciones-container').classList.toggle('hidden', tipoSelect.value !== 'opciones');
        });
    }

    if (form) {
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const idEdit = document.getElementById('campo-id-edit').value;
            const etiqueta = document.getElementById('campo-etiqueta').value.trim();
            const nombre = document.getElementById('campo-nombre').value.trim() || slug(etiqueta);
            const tipo = document.getElementById('campo-tipo').value;
            const orden = parseInt(document.getElementById('campo-orden').value) || 1;
            const activo = document.getElementById('campo-activo').checked;

            if (!etiqueta || !nombre) return;

            const data = { nombre, etiqueta, tipo, orden, activo, timestamp: Date.now() };

            if (tipo === 'opciones') {
                data.opciones = document.getElementById('campo-opciones').value.split('\n').map(s => s.trim()).filter(Boolean);
                data.permitir_otros = document.getElementById('campo-otros').checked;
            }

            const btn = document.getElementById('btn-submit-campo');
            btn.disabled = true;

            try {
                if (idEdit) { await updateDoc(doc(db, COL_CAMPOS, idEdit), data); }
                else { await addDoc(collection(db, COL_CAMPOS), data); }
                form.reset();
                document.getElementById('campo-id-edit').value = '';
                document.getElementById('campo-opciones-container').classList.add('hidden');
                document.getElementById('campo-activo').checked = true;
                document.getElementById('campo-activo-label').textContent = 'Activo';
                document.getElementById('btn-campo-text').textContent = 'Crear Campo';
                document.getElementById('btn-cancel-campo').classList.add('hidden');
                await cargarCampos();
                await cargarCamposChecklist();
            } catch (err) { alert('Error: ' + err.message); }
            finally { btn.disabled = false; }
        });
    }

    const btnCancel = document.getElementById('btn-cancel-campo');
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            form?.reset();
            document.getElementById('campo-id-edit').value = '';
            document.getElementById('campo-opciones-container').classList.add('hidden');
            document.getElementById('campo-activo').checked = true;
            document.getElementById('campo-activo-label').textContent = 'Activo';
            document.getElementById('btn-campo-text').textContent = 'Crear Campo';
            btnCancel.classList.add('hidden');
        });
    }

    const cbActivo = document.getElementById('campo-activo');
    if (cbActivo) {
        cbActivo.addEventListener('change', function () {
            const lbl = document.getElementById('campo-activo-label');
            lbl.textContent = this.checked ? 'Activo' : 'Inactivo';
        });
    }
}

// ============================================================
// INYECCION DE CAMPOS EXTRA EN FORMULARIO DE SOCIO
// ============================================================
export async function cargarCamposExtrasEnForm(docId) {
    const container = document.getElementById('campos-extra-socio-container');
    if (!container) return;

    try {
        const snap = await getDocs(collection(db, COL_CAMPOS));
        const campos = [];
        snap.forEach(d => campos.push({ id: d.id, ...d.data() }));
        const activos = campos.filter(c => c.activo !== false).sort((a, b) => (a.orden || 99) - (b.orden || 99));

        if (activos.length === 0) {
            container.innerHTML = '';
            return;
        }

        let socioExtra = {};
        if (docId) {
            try {
                const socioSnap = await getDocs(collection(db, 'socios'));
                let found = null;
                socioSnap.forEach(d => { if (d.id === docId) found = d.data(); });
                if (found && found.extra) socioExtra = found.extra;
            } catch (e) {}
        }

        let html = '<div class="border-t border-gray-200 pt-4 mt-4"><h4 class="text-sm font-bold text-gray-600 mb-3">Datos Adicionales</h4>';
        html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">';

        activos.forEach(campo => {
            const val = socioExtra[campo.nombre] || '';
            const id = 'extra-' + campo.nombre;
            html += `<div><label class="block text-sm font-bold text-gray-700 mb-1.5">${campo.etiqueta}</label>`;

            switch (campo.tipo) {
                case 'numero':
                    html += `<input type="number" id="${id}" value="${val}" class="w-full border-gray-300 rounded-lg p-3 border-2 focus:ring-0 focus:border-pink-500 bg-white shadow-sm transition outline-none">`;
                    break;
                case 'si_no':
                    html += `<select id="${id}" class="w-full border-gray-300 rounded-lg p-3 border-2 focus:ring-0 focus:border-pink-500 bg-white shadow-sm transition outline-none">
                        <option value="">Seleccionar...</option>
                        <option value="si" ${val === 'si' ? 'selected' : ''}>Si</option>
                        <option value="no" ${val === 'no' ? 'selected' : ''}>No</option>
                    </select>`;
                    break;
                case 'opciones':
                    const opciones = campo.opciones || [];
                    if (campo.permitir_otros) opciones.push('Otros');
                    html += `<select id="${id}" class="w-full border-gray-300 rounded-lg p-3 border-2 focus:ring-0 focus:border-pink-500 bg-white shadow-sm transition outline-none campo-opciones-select" data-nombre="${campo.nombre}" data-otros="${campo.permitir_otros ? '1' : '0'}">
                        <option value="">Seleccionar...</option>`;
                    opciones.forEach(opt => { html += `<option value="${opt}" ${val === opt ? 'selected' : ''}>${opt}</option>`; });
                    html += `</select>`;
                    if (campo.permitir_otros) {
                        const otrosVal = val && !campo.opciones.includes(val) ? val : '';
                        html += `<input type="text" id="${id}-otros" placeholder="Especificar..." value="${otrosVal}" class="hidden w-full border-gray-300 rounded-lg p-3 border-2 mt-2 focus:ring-0 focus:border-pink-500 bg-white shadow-sm transition outline-none campo-otros-input" data-select="${id}">`;
                    }
                    break;
                default:
                    html += `<input type="text" id="${id}" value="${val}" class="w-full border-gray-300 rounded-lg p-3 border-2 focus:ring-0 focus:border-pink-500 bg-white shadow-sm transition outline-none">`;
            }
            html += '</div>';
        });

        html += '</div></div>';
        container.innerHTML = html;

        // Bind "otros" select listeners
        document.querySelectorAll('.campo-opciones-select').forEach(sel => {
            const otrosInput = document.getElementById(sel.id + '-otros');
            if (!otrosInput) return;
            sel.addEventListener('change', () => {
                otrosInput.classList.toggle('hidden', sel.value !== 'Otros');
            });
            if (sel.value === 'Otros') otrosInput.classList.remove('hidden');
        });

    } catch (err) { console.error('Error cargando campos extra en form:', err); }
}

export async function obtenerCamposExtrasDelForm() {
    const container = document.getElementById('campos-extra-socio-container');
    if (!container) return {};
    const extra = {};
    try {
        const snap = await getDocs(collection(db, COL_CAMPOS));
        const campos = [];
        snap.forEach(d => campos.push({ id: d.id, ...d.data() }));
        const activos = campos.filter(c => c.activo !== false);

        activos.forEach(campo => {
            const el = document.getElementById('extra-' + campo.nombre);
            if (!el) return;
            let val;
            if (campo.tipo === 'opciones' && campo.permitir_otros) {
                if (el.value === 'Otros') {
                    const otrosEl = document.getElementById('extra-' + campo.nombre + '-otros');
                    val = otrosEl ? otrosEl.value.trim() : '';
                } else {
                    val = el.value;
                }
            } else {
                val = el.value.trim();
            }
            if (val) extra[campo.nombre] = campo.tipo === 'numero' ? (parseFloat(val) || 0) : val;
        });
    } catch (e) { console.error('Error obteniendo campos extra del form:', e); }
    return extra;
}

// ============================================================
// CAMPANAS DE ACTUALIZACION
// ============================================================
async function cargarCamposChecklist() {
    const container = document.getElementById('campana-campos-checklist');
    if (!container) return;
    try {
        const snap = await getDocs(collection(db, COL_CAMPOS));
        const campos = [];
        snap.forEach(d => campos.push({ id: d.id, ...d.data() }));
        const activos = campos.filter(c => c.activo !== false).sort((a, b) => (a.orden || 99) - (b.orden || 99));

        let html = '<p class="text-xs font-bold text-gray-500 mb-2 uppercase">Datos Base del Afiliado</p>';
        CAMPOS_BASE_EDITABLES.forEach(c => {
            const tipoIcon = { texto: 'ABC', numero: '123', si_no: 'S/N', opciones: '=' }[c.tipo] || '';
            html += `
            <label class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition border border-blue-100">
                <input type="checkbox" class="campana-campo-check w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500" value="${c.nombre}">
                <div>
                    <span class="text-sm font-bold text-gray-700">${c.etiqueta}</span>
                    <span class="text-xs text-blue-500 ml-2">(dato base)</span>
                </div>
            </label>`;
        });

        html += '<p class="text-xs font-bold text-gray-500 mt-4 mb-2 uppercase">Campos Extra Personalizados</p>';
        if (activos.length === 0) {
            html += '<p class="text-gray-400 text-sm">No hay campos extra creados. Ve a la pestana "Campos Extra" para crear.</p>';
        } else {
            activos.forEach(c => {
                const tipoIcon = { texto: 'ABC', numero: '123', si_no: 'S/N', opciones: '=' }[c.tipo] || '';
                html += `
                <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <input type="checkbox" class="campana-campo-check w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500" value="${c.nombre}">
                    <div>
                        <span class="text-sm font-bold text-gray-700">${c.etiqueta}</span>
                        <span class="text-xs text-gray-400 ml-2">(${c.nombre})</span>
                    </div>
                </label>`;
            });
        }
        container.innerHTML = html;
    } catch (err) { console.error('Error cargando checklist:', err); }
}

function obtenerCamposSeleccionados() {
    const checks = document.querySelectorAll('.campana-campo-check:checked');
    return Array.from(checks).map(c => c.value);
}

async function cargarCampanas() {
    const tbody = document.getElementById('lista-campanas');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" class="px-3 py-4 text-center text-gray-400">Cargando...</td></tr>`;
    try {
        const snap = await getDocs(collection(db, COL_CAMPANAS));
        campanasCache = [];
        snap.forEach(d => campanasCache.push({ id: d.id, ...d.data() }));
        campanasCache.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        if (campanasCache.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-3 py-4 text-center text-gray-500">No hay campanas creadas aun.</td></tr>`;
            return;
        }

        const snapCampos = await getDocs(collection(db, COL_CAMPOS));
        const mapaCampos = {};
        snapCampos.forEach(d => { const dt = d.data(); mapaCampos[dt.nombre] = dt.etiqueta; });
        CAMPOS_BASE_EDITABLES.forEach(c => { mapaCampos[c.nombre] = c.etiqueta; });

        let html = '';
        campanasCache.forEach(cam => {
            const activa = cam.activo !== false;
            const badge = activa
                ? '<span class="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Activa</span>'
                : '<span class="bg-red-50 text-red-500 px-2 py-1 rounded text-xs font-bold">Inactiva</span>';
            const camposNombres = (cam.campos_habilitados || []).map(k => mapaCampos[k] || k).join(', ');
            const link = `${window.location.origin}/paginas/actualizar_mis_datos.html?campana=${cam.id}`;
            html += `
            <tr class="hover:bg-gray-50 transition border-b border-gray-100 ${activa ? '' : 'opacity-50'}">
                <td class="px-3 py-2 font-medium text-gray-800 text-xs">${cam.nombre || '-'}</td>
                <td class="px-3 py-2 text-xs text-gray-500 max-w-[250px] truncate" title="${camposNombres}">${camposNombres || '-'}</td>
                <td class="px-3 py-2">${badge}</td>
                <td class="px-3 py-2 text-xs text-gray-400">${cam.timestamp ? new Date(cam.timestamp).toLocaleDateString('es-PE') : '-'}</td>
                <td class="px-3 py-2 text-right space-x-1 whitespace-nowrap">
                    <button class="text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded text-xs font-bold btn-copiar-link" data-link="${link}">Copiar Link</button>
                    <button class="text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded text-xs font-bold btn-editar-campana" data-id="${cam.id}">Editar</button>
                    <button class="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-bold btn-eliminar-campana" data-id="${cam.id}">Eliminar</button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;

        document.querySelectorAll('.btn-copiar-link').forEach(btn => {
            btn.addEventListener('click', () => {
                const link = btn.getAttribute('data-link');
                navigator.clipboard.writeText(link).then(() => {
                    const orig = btn.textContent;
                    btn.textContent = 'Copiado!';
                    btn.classList.add('bg-emerald-100', 'text-emerald-700');
                    setTimeout(() => { btn.textContent = orig; btn.classList.remove('bg-emerald-100', 'text-emerald-700'); }, 2000);
                }).catch(() => alert('Link: ' + link));
            });
        });

        document.querySelectorAll('.btn-editar-campana').forEach(btn => {
            btn.addEventListener('click', async e => {
                const id = e.currentTarget.getAttribute('data-id');
                const cam = campanasCache.find(c => c.id === id);
                if (!cam) return;
                document.getElementById('campana-id-edit').value = cam.id;
                document.getElementById('campana-nombre').value = cam.nombre || '';
                document.getElementById('campana-activo-edit').checked = cam.activo !== false;
                document.getElementById('btn-campana-text').textContent = 'Actualizar Campaña';
                document.getElementById('btn-cancel-campana').classList.remove('hidden');
                // Marcar checkboxes
                await cargarCamposChecklist();
                const habilitados = cam.campos_habilitados || [];
                document.querySelectorAll('.campana-campo-check').forEach(chk => {
                    chk.checked = habilitados.includes(chk.value);
                });
                document.getElementById('form-campana-container').scrollIntoView({ behavior: 'smooth' });
            });
        });

        document.querySelectorAll('.btn-eliminar-campana').forEach(btn => {
            btn.addEventListener('click', async e => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm('Eliminar esta campana? No se podra recuperar.')) {
                    await deleteDoc(doc(db, COL_CAMPANAS, id));
                    await cargarCampanas();
                }
            });
        });
    } catch (err) {
        console.error('Error cargando campanas:', err);
        tbody.innerHTML = `<tr><td colspan="5" class="px-3 py-4 text-center text-red-500">Error al cargar campanas.</td></tr>`;
    }
}

function initFormCampana() {
    const form = document.getElementById('form-campana');
    if (form) {
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const idEdit = document.getElementById('campana-id-edit').value;
            const nombre = document.getElementById('campana-nombre').value.trim();
            const activo = document.getElementById('campana-activo-edit').checked;
            const campos_habilitados = obtenerCamposSeleccionados();

            if (!nombre) return;
            if (campos_habilitados.length === 0) { alert('Selecciona al menos un campo para actualizar.'); return; }

            const data = { nombre, campos_habilitados, activo, timestamp: Date.now() };

            const btn = document.getElementById('btn-submit-campana');
            btn.disabled = true;
            try {
                if (idEdit) { await updateDoc(doc(db, COL_CAMPANAS, idEdit), data); }
                else { const ref = await addDoc(collection(db, COL_CAMPANAS), data); data._nuevoId = ref.id; }
                form.reset();
                document.getElementById('campana-id-edit').value = '';
                document.getElementById('btn-campana-text').textContent = 'Publicar Campaña';
                document.getElementById('btn-cancel-campana').classList.add('hidden');
                // Reset checks but keep checklist loaded
                document.querySelectorAll('.campana-campo-check').forEach(chk => chk.checked = false);
                await cargarCampanas();
                if (data._nuevoId) {
                    const link = `${window.location.origin}/paginas/actualizar_mis_datos.html?campana=${data._nuevoId}`;
                    navigator.clipboard.writeText(link).then(() => {
                        alert('Campana publicada. Link copiado al portapapeles:\n\n' + link + '\n\nCompartelo con los afiliados.');
                    }).catch(() => {
                        alert('Campana publicada. Comparte este link:\n\n' + link);
                    });
                }
            } catch (err) { alert('Error: ' + err.message); }
            finally { btn.disabled = false; }
        });
    }

    const btnCancel = document.getElementById('btn-cancel-campana');
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            form?.reset();
            document.getElementById('campana-id-edit').value = '';
            document.getElementById('campana-activo-edit').checked = true;
            document.getElementById('btn-campana-text').textContent = 'Publicar Campaña';
            btnCancel.classList.add('hidden');
            document.querySelectorAll('.campana-campo-check').forEach(chk => chk.checked = false);
        });
    }
}

// ============================================================
// INIT PRINCIPAL
// ============================================================
export function initCamposExtra() {
    initSubTabs();
    initFormCampo();
    initFormCampana();

    window._cargarCamposExtra = async function () {
        await cargarCampos();
        await cargarCamposChecklist();
    };

    window._cargarCampanas = async function () {
        await cargarCampanas();
    };

    // Cargar datos iniciales cuando se muestre la vista de socios
    const observer = new MutationObserver(() => {
        const panel = document.getElementById('panel-socio-campos');
        if (panel && !panel.classList.contains('hidden')) {
            cargarCampos();
        }
        const panelCamp = document.getElementById('panel-socio-campanas');
        if (panelCamp && !panelCamp.classList.contains('hidden')) {
            cargarCampanas();
            cargarCamposChecklist();
        }
    });

    const viewSocios = document.getElementById('view-socios');
    if (viewSocios) {
        observer.observe(viewSocios, { attributes: true, subtree: true });
    }

    // Carga inicial
    cargarCampos();
    cargarCampanas();
    cargarCamposChecklist();
}
