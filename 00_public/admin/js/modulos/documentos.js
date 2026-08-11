// ============================================================
// SIUTCASJNJ - Generador de Documentos Oficiales
// ============================================================
// Genera Cartas, Oficios y Comunicados en formato Word (.docx)
// Depende de: docx.js (UMD global), FileSaver.js
// ============================================================

export const SIGLAS = {
    'Secretaria General':             { sigla: 'SG',  persona: 'Pavel Ordonez Escarza' },
    'Sub-Secretaria General':         { sigla: 'SSG', persona: 'Katty Candy Jara Jancco' },
    'Organizacion':                   { sigla: 'SO',  persona: 'Juan Alfredo Tisza Astete' },
    'Defensa':                        { sigla: 'SD',  persona: 'Richard Trejo Silva' },
    'Economia':                       { sigla: 'SE',  persona: 'Ricardo Molleapaza Calderon' },
    'Actas y Archivo':                { sigla: 'SAA', persona: 'Lucy Alvarez Herrera' },
    'Control y Disciplina':           { sigla: 'SCD', persona: 'Antuaned Maria Montoya La Rosa' },
    'Prensa y Propaganda':            { sigla: 'SPP', persona: 'Jimmy Geraldo Chalco Bustinza' },
    'Cultura y Deporte':              { sigla: 'SCyD', persona: 'Juan Carlos Montenegro Gonzales' },
    'Bienestar Social':               { sigla: 'SBS', persona: 'Gissela Margarita Silva Macetas' },
};

export const TIPOS = {
    carta:      { label: 'CARTA',       prefijo: 'CARTA',       badge: 'CARTA' },
    oficio:     { label: 'OFICIO',      prefijo: 'OFICIO',      badge: 'OFICIO' },
    comunicado: { label: 'COMUNICADO',  prefijo: 'COM',         badge: 'COMUNICADO OFICIAL' },
};

const LOGO_PATH = 'docs/img/logo_new.png';

let logoCache = null;

async function fetchLogoBase64() {
    if (logoCache) return logoCache;
    try {
        const resp = await fetch(LOGO_PATH);
        if (!resp.ok) throw new Error('logo not found');
        const blob = await resp.blob();
        const arrayBuffer = await blob.arrayBuffer();
        logoCache = { buffer: arrayBuffer, type: blob.type || 'image/png' };
        return logoCache;
    } catch (e) {
        console.warn('Logo no encontrado, se usara fallback:', e.message);
        return null;
    }
}

function formatearFecha(fechaISO, lugar) {
    const d = new Date(fechaISO + 'T12:00:00');
    const meses = ['enero','febrero','marzo','abril','mayo','junio',
                   'julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const dia = d.getDate();
    const mes = meses[d.getMonth()];
    const anio = d.getFullYear();
    return `${lugar}, ${dia} de ${mes} de ${anio}`;
}

export function generarNumero(tipo, sigla, anio, contador) {
    const prefijo = (TIPOS[tipo] && TIPOS[tipo].prefijo) || tipo.toUpperCase();
    const n = String(contador).padStart(3, '0');
    return `${prefijo} N.° ${n}-${anio}-SIUTCASJNJ/${sigla}`;
}

export async function contarYGenerarNumero(db, collection, getDocs, query, orderBy, tipo, anio) {
    try {
        const q = query(
            collection(db, 'documentos_oficiales'),
            orderBy('timestamp', 'desc')
        );
        const snap = await getDocs(q);
        let maxNum = 0;
        snap.forEach(docSnap => {
            const d = docSnap.data();
            if (d.tipo === tipo && d.anio === anio && d.numeroSecuencial) {
                maxNum = Math.max(maxNum, d.numeroSecuencial);
            }
        });
        return maxNum + 1;
    } catch (e) {
        console.warn('Error contando documentos, usando 1:', e);
        return 1;
    }
}

export async function generarDocxWord(tipo, datos) {
    const { docx } = window;
    if (!docx) throw new Error('docx.js no esta cargado. Recarga la pagina.');

    const {
        Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        WidthType, AlignmentType, Header, Footer, ImageRun, PageBreak,
        BorderStyle, HeadingLevel, PageBorder, TableLayoutType,
    } = docx;

    const tipoInfo = TIPOS[tipo] || { label: tipo.toUpperCase(), badge: tipo.toUpperCase() };
    const siglasDe = (SIGLAS[datos.deSecretario] && SIGLAS[datos.deSecretario].sigla) || datos.deSiglas || '';
    const siglasPara = (SIGLAS[datos.paraSecretario] && SIGLAS[datos.paraSecretario].sigla) || datos.paraSiglas || '';

    const colorAzul = '#1e3a8a';
    const colorDorado = '#c9a84c';
    const colorGris = '#374151';
    const colorGrisClaro = '#6b7280';
    const colorBlanco = '#ffffff';
    const colorFondoFooter = '#f1f5f9';

    const logoData = await fetchLogoBase64();
    let headerChildren = [];

    if (logoData) {
        headerChildren = [
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                layout: TableLayoutType.FIXED,
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                width: { size: 900, type: WidthType.DXA },
                                children: [
                                    new Paragraph({
                                        children: [
                                            new ImageRun({
                                                data: new Uint8Array(logoData.buffer),
                                                transformation: { width: 70, height: 70 },
                                                type: 'png',
                                            }),
                                        ],
                                    }),
                                ],
                                borders: {
                                    top: { style: BorderStyle.NONE, size: 0 },
                                    bottom: { style: BorderStyle.NONE, size: 0 },
                                    left: { style: BorderStyle.NONE, size: 0 },
                                    right: { style: BorderStyle.NONE, size: 0 },
                                },
                            }),
                            new TableCell({
                                width: { size: 8000, type: WidthType.DXA },
                                children: [
                                    new Paragraph({
                                        children: [new TextRun({ text: 'SIUTCASJNJ', bold: true, size: 28, font: 'Arial', color: colorBlanco })],
                                        spacing: { after: 40 },
                                    }),
                                    new Paragraph({
                                        children: [new TextRun({ text: 'SINDICATO UNICO DE TRABAJADORES CAS - JNJ', size: 16, font: 'Arial', color: '93a3c4' })],
                                    }),
                                ],
                                borders: {
                                    top: { style: BorderStyle.NONE, size: 0 },
                                    bottom: { style: BorderStyle.NONE, size: 0 },
                                    left: { style: BorderStyle.NONE, size: 0 },
                                    right: { style: BorderStyle.NONE, size: 0 },
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];
    } else {
        headerChildren = [
            new Paragraph({
                children: [new TextRun({ text: 'SIUTCASJNJ', bold: true, size: 26, font: 'Arial', color: colorBlanco })],
                spacing: { after: 40 },
            }),
            new Paragraph({
                children: [new TextRun({ text: 'SINDICATO UNICO DE TRABAJADORES CAS - JNJ', size: 14, font: 'Arial', color: '93a3c4' })],
            }),
        ];
    }

    const header = new Header({
        children: [
            new Paragraph({
                children: [],
                shading: { type: 'solid', color: '0a1628' },
                spacing: { before: 0, after: 0 },
                border: {
                    bottom: { color: colorDorado, style: BorderStyle.SINGLE, size: 8, space: 1 },
                },
            }),
            ...headerChildren,
            new Paragraph({
                children: [new TextRun({ text: tipoInfo.badge, bold: true, size: 20, font: 'Arial', color: colorDorado })],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 60, after: 120 },
            }),
            new Paragraph({
                children: [new TextRun({ text: datos.numero || `${tipoInfo.prefijo} N.° ___/2026`, bold: true, size: 24, font: 'Arial', color: colorAzul })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                border: {
                    bottom: { color: colorDorado, style: BorderStyle.SINGLE, size: 4, space: 8 },
                },
            }),
        ],
    });

    const footer = new Footer({
        children: [
            new Paragraph({
                children: [
                    new TextRun({ text: 'GESTION 2026 - 2028', size: 16, font: 'Arial', color: '94a3b8' }),
                    new TextRun({ text: '    |    ', size: 16, font: 'Arial', color: '94a3b8' }),
                    new TextRun({ text: 'sindicatocasjnj.com', size: 16, font: 'Arial', color: '94a3b8' }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 80 },
                border: {
                    top: { color: 'e2e8f0', style: BorderStyle.SINGLE, size: 2, space: 4 },
                },
            }),
        ],
    });

    const children = [];

    const addSection = (title, content) => {
        children.push(
            new Paragraph({
                children: [new TextRun({ text: title, bold: true, size: 22, font: 'Arial', color: colorAzul })],
                spacing: { before: 200, after: 40 },
            })
        );
        const lineas = content.split('\n');
        lineas.forEach(linea => {
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: linea, size: 22, font: 'Arial', color: colorGris })],
                    spacing: { after: 60, line: 320 },
                })
            );
        });
    };

    if (tipo === 'carta') {
        children.push(
            new Paragraph({
                children: [new TextRun({ text: `Lima, ${new Date(datos.fecha + 'T12:00:00').toLocaleDateString('es-PE', {day:'numeric',month:'long',year:'numeric'})}`, size: 22, font: 'Arial', color: colorGris })],
                spacing: { after: 200 },
            })
        );
        children.push(
            new Paragraph({
                children: [new TextRun({ text: `Senor(a):`, size: 22, font: 'Arial', color: colorGris })],
                spacing: { after: 40 },
            })
        );
        children.push(
            new Paragraph({
                children: [new TextRun({ text: datos.paraPersona || datos.paraSecretario || '', bold: true, size: 22, font: 'Arial', color: colorGris })],
                spacing: { after: 40 },
            })
        );
        if (datos.paraSecretario) {
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: datos.paraSecretario, size: 20, font: 'Arial', color: colorGrisClaro })],
                    spacing: { after: 200 },
                })
            );
        }
        children.push(
            new Paragraph({
                children: [new TextRun({ text: 'Presente. -', size: 22, font: 'Arial', color: colorGris })],
                spacing: { after: 200 },
            })
        );
        children.push(
            new Paragraph({
                children: [new TextRun({ text: `Asunto: ${datos.asunto}`, bold: true, size: 22, font: 'Arial', color: colorAzul, underline: {} })],
                spacing: { after: 200 },
            })
        );
        addSection('', datos.cuerpo);
        children.push(
            new Paragraph({
                children: [new TextRun({ text: 'Atentamente,', size: 22, font: 'Arial', color: colorGris })],
                spacing: { before: 300, after: 600 },
            })
        );
        children.push(
            new Paragraph({
                children: [new TextRun({ text: '____________________________', size: 20, font: 'Arial', color: colorGris })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
            })
        );
        children.push(
            new Paragraph({
                children: [new TextRun({ text: datos.dePersona || datos.deSecretario || '', bold: true, size: 22, font: 'Arial', color: colorGris })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 20 },
            })
        );
        children.push(
            new Paragraph({
                children: [new TextRun({ text: datos.deSecretario, size: 20, font: 'Arial', color: colorGrisClaro })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 20 },
            })
        );
        children.push(
            new Paragraph({
                children: [new TextRun({ text: 'SIUTCASJNJ', size: 20, font: 'Arial', color: colorGrisClaro })],
                alignment: AlignmentType.CENTER,
            })
        );
    } else if (tipo === 'oficio') {
        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: 'DE : ', bold: true, size: 22, font: 'Arial', color: colorAzul }),
                    new TextRun({ text: `${datos.deSecretario} (${siglasDe})`, size: 22, font: 'Arial', color: colorGris }),
                ],
                spacing: { after: 40 },
            })
        );
        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: 'A   : ', bold: true, size: 22, font: 'Arial', color: colorAzul }),
                    new TextRun({ text: `${datos.paraSecretario || ''} ${siglasPara ? `(${siglasPara})` : ''}`, size: 22, font: 'Arial', color: colorGris }),
                ],
                spacing: { after: 80 },
            })
        );
        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: 'ASUNTO : ', bold: true, size: 22, font: 'Arial', color: colorAzul }),
                    new TextRun({ text: datos.asunto, size: 22, font: 'Arial', color: colorGris }),
                ],
                spacing: { after: 80 },
            })
        );
        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: 'FECHA  : ', bold: true, size: 22, font: 'Arial', color: colorAzul }),
                    new TextRun({ text: new Date(datos.fecha + 'T12:00:00').toLocaleDateString('es-PE', {day:'numeric',month:'long',year:'numeric'}), size: 22, font: 'Arial', color: colorGris }),
                ],
                spacing: { after: 200 },
                border: {
                    bottom: { color: 'e5e7eb', style: BorderStyle.SINGLE, size: 2, space: 8 },
                },
            })
        );
        addSection('', datos.cuerpo);
        children.push(
            new Paragraph({
                children: [new TextRun({ text: 'Atentamente,', size: 22, font: 'Arial', color: colorGris })],
                spacing: { before: 300, after: 600 },
            })
        );
        children.push(
            new Paragraph({
                children: [new TextRun({ text: '____________________________', size: 20, font: 'Arial', color: colorGris })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
            })
        );
        children.push(
            new Paragraph({
                children: [new TextRun({ text: datos.dePersona || datos.deSecretario || '', bold: true, size: 22, font: 'Arial', color: colorGris })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 20 },
            })
        );
        children.push(
            new Paragraph({
                children: [new TextRun({ text: datos.deSecretario, size: 20, font: 'Arial', color: colorGrisClaro })],
                alignment: AlignmentType.CENTER,
            })
        );
    } else if (tipo === 'comunicado') {
        children.push(
            new Paragraph({
                children: [new TextRun({ text: datos.asunto || 'COMUNICADO', bold: true, size: 30, font: 'Arial', color: colorAzul })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 60 },
                border: {
                    bottom: { color: 'e5e7eb', style: BorderStyle.SINGLE, size: 2, space: 8 },
                },
            })
        );
        addSection('', datos.cuerpo);
        children.push(
            new Paragraph({
                children: [new TextRun({ text: formatearFecha(datos.fecha, datos.lugar || 'Lima'), size: 20, font: 'Arial', color: colorGrisClaro })],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 200, after: 200 },
            })
        );
        children.push(
            new Paragraph({
                children: [new TextRun({ text: `${datos.deSecretario}`, bold: true, size: 22, font: 'Arial', color: colorGris })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 20 },
            })
        );
        children.push(
            new Paragraph({
                children: [new TextRun({ text: 'SIUTCASJNJ', size: 20, font: 'Arial', color: colorGrisClaro })],
                alignment: AlignmentType.CENTER,
            })
        );
    }

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: { top: 800, bottom: 800, left: 1200, right: 1200 },
                },
            },
            headers: {
                default: header,
            },
            footers: {
                default: footer,
            },
            children: children,
        }],
    });

    const blob = await Packer.toBlob(doc);
    return blob;
}

export function generarNombreArchivo(tipo, numero) {
    const nombreSeguro = numero.replace(/[^a-zA-Z0-9.\- ]/g, '_').replace(/\s+/g, '_');
    return `${nombreSeguro}.docx`;
}
