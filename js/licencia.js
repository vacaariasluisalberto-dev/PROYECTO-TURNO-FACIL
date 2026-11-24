const app = document.getElementById('app');
const page = Number(app.dataset.page);
const titles = { 3: 'RENOVACIÓN', 4: 'DUPLICADO', 5: 'PRIMERA VEZ' };
const reqs = { 3: ['Cédula de identidad vigente y licencia vencida', 'Certificado médico vigente (grupo sanguíneo y vista)', 'Certificado de antecedentes de tránsito', 'Comprobante de pago bancario'], 4: ['Cédula de identidad vigente (original y copia)', 'Denuncia de extravío (FELCC) o licencia deteriorada', 'Certificado de antecedentes de tránsito (SEGIP)', 'Comprobante de pago bancario'], 5: ['Cédula de identidad vigente (original y copia)', 'Certificado médico y evaluación psicológica', 'Certificado de aprobación de escuela de conducción', 'Comprobante de pago bancario (valorado)'] };
// Los formularios comienzan vacíos. Los datos se guardan únicamente
// cuando el usuario los completa y confirma la solicitud.
const clearDraft = () => {
    ['tramite','tipoPage','sede','filtro','dia','hora','nombre','ci','telefono','correo','estado','motivo'].forEach(k => localStorage.removeItem(k));
    [3,4,5].forEach(n => localStorage.removeItem('requisitos_' + n));
};
const readRequests = () => {
    try { return JSON.parse(localStorage.getItem('segip_solicitudes') || '[]'); }
    catch (e) { return []; }
};
const saveRequests = list => localStorage.setItem('segip_solicitudes', JSON.stringify(list));
const get = (k, d = '') => localStorage.getItem(k) ?? d;
const set = (k, v) => localStorage.setItem(k, v);
const go = n => location.href = String(n).padStart(2, '0') + '-' + ({ 1: 'access', 2: 'election', 3: 'req-renovacion', 4: 'req-duplicado', 5: 'req-primera', 6: 'cita', 7: 'cita-sede', 8: 'cita-filtro', 9: 'cita-dia', 10: 'cita-hora', 11: 'datos', 12: 'resumen', 13: 'pendiente', 14: 'mis-turnos', 15: 'turno-aceptado', 16: 'login-admin', 17: 'notificaciones-admin', 18: 'revision', 19: 'decision', 20: 'rechazo', 21: 'confirmada', 22: 'turnos-aceptados', 23: 'notificaciones-final' }[n]) + '.html';
const logo = '<img class="toplogo" src="../img/logo-sep.svg" alt="SEP">';
function header(admin = false) { return `<header class="topbar">${logo}<nav class="topnav"><a href="14-mis-turnos.html">${admin ? 'LOS TURNOS' : 'MI TURNO'}</a><a href="02-election.html" onclick="resetAndGo(2);return false;">INICIO</a><a href="01-access.html" onclick="resetAndGo(1);return false;">CAMBIAR USUARIO</a></nav></header>`; }
function shell(content, admin = false) { app.innerHTML = header(admin) + `<main class="page">${content}</main>`; }
function btn(text, fn, cls = '') { return `<button class="btn ${cls}" onclick="${fn}">${text}</button>`; }
function access() { app.innerHTML = `<main class="access"><div class="access-inner"><img class="access-logo" src="../img/logo-sep.svg"><div class="access-buttons">${btn('ADMINISTRADOR', 'go(16)')}${btn('USUARIO', 'resetAndGo(2)')}</div></div></main>`; }
function election() { shell(`<h1 class="title">TIPOS DE TRÁMITES</h1><section class="cards"><article class="tramite-card"><img src="../img/primera-vez.jpg"><h2>PRIMERA VEZ</h2>${btn('INGRESAR', 'selectType(5)')}</article><article class="tramite-card"><img src="../img/duplicado.jpg"><h2>DUPLICADO</h2>${btn('INGRESAR', 'selectType(4)')}</article><article class="tramite-card"><img src="../img/renovacion.jpg"><h2>RENOVACIÓN</h2>${btn('INGRESAR', 'selectType(3)')}</article></section>`); }
function selectType(n) { set('tramite', titles[n]); set('tipoPage', n); go(n); }
function requirements() {
    const list = reqs[page] || [];
    const key = 'requisitos_' + page;
    let seleccionados = [];
    try { seleccionados = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { seleccionados = []; }
    const items = list.map((texto, i) => `
        <li>
            <label class="requirement-option">
                <span>${texto}</span>
                <input type="checkbox" class="requirement-check" value="${i}" ${seleccionados.includes(i) ? 'checked' : ''} onchange="updateRequirementSelection()">
            </label>
        </li>`).join('');
    shell(`<section class="panel">
        <div class="panel-head"><span>${titles[page]}</span>
            <button class="btn small" id="requirementsNext" onclick="continueRequirements()" ${seleccionados.length === 4 ? '' : 'disabled'}>SIGUIENTE</button>
        </div>
        <div class="inner"><ul class="requirements">${items}</ul></div>
    </section>`);
}
function updateRequirementSelection() {
    const checks = Array.from(document.querySelectorAll('.requirement-check'));
    const selected = checks.filter(c => c.checked).map(c => Number(c.value));
    localStorage.setItem('requisitos_' + page, JSON.stringify(selected));
    const next = document.getElementById('requirementsNext');
    if (next) next.disabled = selected.length !== 4;
}
function continueRequirements() {
    const checks = document.querySelectorAll('.requirement-check');
    if (checks.length !== 4 || Array.from(checks).some(c => !c.checked)) {
        alert('Debes seleccionar los cuatro requisitos para continuar.');
        return;
    }
    go(6);
}
function cita() {
    shell(`<h1 class="title">DATOS DEL SOLICITANTE</h1><section class="form-card"><div class="form-grid">
    <div class="field"><label for="sede">ELEGIR EL LUGAR O LA SEDE</label><select id="sede"><option value="">Seleccionar sede</option><option>PLAZA 24 DE SEPTIEMBRE</option><option>AV. BANZER Y 4TO ANILLO</option><option>AV. SANTOS DUMONT Y 3ER ANILLO</option></select></div>
    <div class="field"><label for="filtro">FILTRO</label><select id="filtro"><option value="">Seleccionar filtro</option><option>MOTO</option><option>AUTO</option></select></div>
    <div class="field"><label for="hora">HORA</label><select id="hora"><option value="">Seleccionar hora</option><option>08:30 LIBRE</option><option>09:00 LIBRE</option><option>09:30 AM</option><option>11:00 LIBRE</option><option>15:00 LIBRE</option></select></div>
    <div class="field"><label for="dia">ELEGIR EL DÍA (LUNES-SÁBADO)</label><select id="dia"><option value="">Seleccionar día</option><option>VIERNES 20 DE NOVIEMBRE</option><option>SÁBADO 21 DE NOVIEMBRE</option><option>LUNES 23 DE NOVIEMBRE</option></select></div>
    </div></section><div class="form-actions">${btn('CONFIRMAR', 'saveAppointment()')}</div>`);
}
function saveAppointment() {
    const fields = ['sede','filtro','hora','dia'];
    for (const key of fields) {
        const el = document.getElementById(key);
        if (!el.value) { alert('Rellena este campo.'); el.focus(); return; }
    }
    fields.forEach(key => set(key, document.getElementById(key).value));
    go(11);
}
function datos() { shell(`<h1 class="title">DATOS DEL SOLICITANTE</h1><section class="form-card form-single">
    <div class="field"><label for="nombre">NOMBRE COMPLETO:</label><input id="nombre" type="text" placeholder="Ej. José Daniel Galarza Calderón" autocomplete="off"></div>
    <div class="field"><label for="ci">CÉDULA DE IDENTIDAD:</label><input id="ci" type="text" placeholder="Ej. 1234567" autocomplete="off"></div>
    <div class="field"><label for="telefono">TELÉFONO:</label><input id="telefono" type="tel" placeholder="Ej. 70012345" autocomplete="off"></div>
    <div class="field"><label for="correo">CORREO ELECTRÓNICO</label><input id="correo" type="email" placeholder="Ej. daniel@gmail.com" autocomplete="off"></div>
    </section><div class="form-actions">${btn('CONFIRMAR', 'savePerson()')}</div>`); }
function savePerson() {
    const vals = ['nombre','ci','telefono','correo'];
    const values = {};
    for (const key of vals) {
        const el = document.getElementById(key);
        const value = el.value.trim();
        if (!value) { alert('Rellena este campo.'); el.focus(); return; }
        if (key === 'correo' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { alert('Ingresa un correo electrónico válido.'); el.focus(); return; }
        values[key] = value;
    }
    Object.entries(values).forEach(([key,value]) => set(key,value));
    go(12);
}
function summary() { let fields = [['TRÁMITE', get('tramite')], ['SEDE', get('sede')], ['FILTRO', get('filtro')], ['DÍA', get('dia')], ['HORA', get('hora')], ['NOMBRE COMPLETO', get('nombre')], ['CI', get('ci')], ['TELÉFONO', get('telefono')], ['CORREO', get('correo')]]; shell(`<h1 class="title">DATOS DEL SOLICITANTE</h1><section class="summary">${fields.map(([a, b]) => `<p><strong>${a}:</strong> ${b}</p>`).join('')}</section><div class="form-actions">${btn('ATRÁS', 'go(11)')}${btn('CONFIRMAR', 'submitRequest()')}</div>`); }
function pending() { shell(`<h1 class="title">DATOS DEL SOLICITANTE</h1>${summaryCard()}<p class="notice">ESPERANDO CONFIRMACIÓN DEL ADMINISTRADOR</p><div class="form-actions">${btn('ATRÁS', 'go(12)')}${btn('VOLVER', 'go(14)')}</div>`); }
function summaryCard() { return `<section class="summary">${[['TRÁMITE', get('tramite')], ['SEDE', get('sede')], ['FILTRO', get('filtro')], ['DÍA', get('dia')], ['HORA', get('hora')], ['NOMBRE', get('nombre')], ['CI', get('ci')], ['TELÉFONO', get('telefono')], ['CORREO', get('correo')]].map(([a, b]) => `<p><strong>${a}:</strong> ${b}</p>`).join('')}</section>`; }
function getActiveRequest() {
    const id = Number(localStorage.getItem('segip_active_request'));
    return readRequests().find(r => r.id === id) || null;
}
function summaryCardFor(request) {
    if (!request) return '<section class="summary"><p>No hay datos del turno.</p></section>';
    const fields = [['TRÁMITE', request.tramite], ['SEDE', request.sede], ['FILTRO', request.filtro], ['DÍA', request.dia], ['HORA', request.hora], ['NOMBRE', request.nombre], ['CI', request.ci], ['TELÉFONO', request.telefono], ['CORREO', request.correo]];
    return `<section class="summary">${fields.map(([a,b]) => `<p><strong>${a}:</strong> ${b || ''}</p>`).join('')}</section>`;
}
function userTurnCard(request) {
    const status = request.estado || 'PENDIENTE';
    const label = status === 'ACEPTADO' ? 'TU TURNO FUE ACEPTADO' : status === 'RECHAZADO' ? 'TU TURNO FUE RECHAZADO' : 'SOLICITUD PENDIENTE';
    return `<article class="appointment" onclick="openUserTurn(${request.id})"><strong>${request.tramite || 'TRÁMITE'}</strong><span>${request.dia || ''}</span><span>${request.hora || ''}</span><span>${label}</span></article>`;
}
function openUserTurn(id) {
    localStorage.setItem('segip_active_request', String(id));
    go(15);
}
function myturns() {
    const requests = readRequests();
    shell(`<h1 class="title">MIS TURNOS</h1><div class="small-cards">${requests.length ? requests.slice().reverse().map(userTurnCard).join('') : '<p class="empty">TODAVÍA NO TIENES TURNOS REGISTRADOS</p>'}</div><div class="form-actions">${btn('ATRÁS', 'go(2)')}</div>`);
}
function accepted() {
    const request = getActiveRequest();
    const status = request?.estado || 'PENDIENTE';
    const message = status === 'ACEPTADO'
        ? 'TU TURNO FUE ACEPTADO POR EL ADMINISTRADOR'
        : status === 'RECHAZADO'
            ? 'TU TURNO FUE RECHAZADO POR EL ADMINISTRADOR'
            : 'TU SOLICITUD ESTÁ PENDIENTE DE CONFIRMACIÓN';
    const reason = status === 'RECHAZADO' && request?.motivo ? `<p class="notice">MOTIVO: ${request.motivo}</p>` : '';
    shell(`<h1 class="title">MIS TURNOS</h1>${summaryCardFor(request)}<p class="notice">${message}</p>${reason}<div class="form-actions">${btn('ATRÁS', 'go(14)')}</div>`);
}
function login() { app.innerHTML = `<main class="login"><section class="login-box"><img src="../img/logo-sep.svg"><div class="field"><label for="adminMail">CORREO ELECTRÓNICO</label><input id="adminMail" type="email" placeholder="Ingrese su correo electrónico" required autocomplete="username"></div><div class="field"><label for="adminPass">CONTRASEÑA</label><input id="adminPass" type="password" placeholder="Ingrese su contraseña" required autocomplete="current-password"></div>${btn('CONFIRMAR', 'adminLogin()')}</section></main>`; }
function adminLogin() {
    const email = document.getElementById('adminMail').value.trim();
    const password = document.getElementById('adminPass').value;
    const emailInput = document.getElementById('adminMail');
    if (!email) {
        alert('El correo electrónico es obligatorio.');
        emailInput.focus();
        return;
    }
    if (!emailInput.checkValidity()) {
        alert('Ingresa un correo electrónico válido.');
        emailInput.focus();
        return;
    }
    if (!password) {
        alert('La contraseña es obligatoria.');
        document.getElementById('adminPass').focus();
        return;
    }
    if (password !== 'Licencia2026') {
        alert('La contraseña es incorrecta.');
        document.getElementById('adminPass').focus();
        return;
    }
    go(17);
}
function notificationCard(request, index) { return `<article class="appointment" onclick="openRequest(${index})"><strong>MI ${request.tramite || 'TRÁMITE'}</strong><span>${request.sede}</span><span>${request.dia}</span><span>${request.hora}</span><span>${request.telefono}</span><span>ESTADO: ${request.estado}</span></article>`; }
function notifications() {
    const requests = readRequests();
    shell(`<h1 class="title">NOTIFICACIONES</h1><div class="small-cards">${requests.length ? requests.map((r,i)=>notificationCard(r,i)).join('') : '<p class="empty">NO HAY NOTIFICACIONES NUEVAS</p>'}</div>`, true);
}
function openRequest(index) { const requests = readRequests(); const r = requests[index]; if (!r) return; localStorage.setItem('segip_active_request', String(r.id)); Object.entries(r).forEach(([k,v]) => { if (k !== 'id') set(k,v); }); go(18); }
function submitRequest() {
    const required = ['tramite','sede','filtro','dia','hora','nombre','ci','telefono','correo'];
    for (const key of required) { if (!get(key).trim()) { alert('Falta completar: ' + key.toUpperCase()); return; } }
    const requests = readRequests();
    const id = Date.now();
    const request = { id, ...Object.fromEntries(required.map(k => [k,get(k)])), estado: 'PENDIENTE' };
    requests.push(request); saveRequests(requests); set('segip_active_request', String(id)); go(13);
}
function review() { shell(`<h1 class="title">DATOS DEL SOLICITANTE</h1>${summaryCard()}<div class="form-actions">${btn('CANCELAR', 'go(20)', 'red')}${btn('CONFIRMAR', 'go(19)', 'green')}</div><div class="form-actions">${btn('ATRÁS', 'go(17)')}</div>`, true); }
function decision() { shell(`<h1 class="title">DATOS DEL SOLICITANTE</h1>${summaryCard()}<div class="form-actions">${btn('RECHAZAR', 'go(20)', 'red')}${btn('CONFIRMAR', 'go(21)', 'green')}</div>`, true); }
function reject() { shell(`<h1 class="title">DATOS DEL SOLICITANTE</h1><section class="summary">${summaryCard()}<div class="field"><label>MOTIVO DEL RECHAZO</label><textarea id="motivo" placeholder="EL MOTIVO POR EL CUAL FUE RECHAZADA SU SOLICITUD..."></textarea></div></section><div class="form-actions">${btn('CONFIRMAR', 'saveReject()')}</div>`, true); }
function saveReject() { const motivo = document.getElementById('motivo').value.trim(); if (!motivo) { alert('Rellena este campo.'); document.getElementById('motivo').focus(); return; } set('motivo', motivo); set('estado', 'RECHAZADO'); updateActiveRequest('RECHAZADO', motivo); go(17); }
function updateActiveRequest(estado, motivo='') { const id = Number(localStorage.getItem('segip_active_request')); const requests = readRequests().map(r => r.id === id ? {...r, estado, motivo} : r); saveRequests(requests); }
function confirmed() { set('estado', 'ACEPTADO'); updateActiveRequest('ACEPTADO'); shell(`<h1 class="title">DATOS DEL SOLICITANTE</h1>${summaryCard()}<p class="notice">SOLICITUD CONFIRMADA</p><div class="form-actions">${btn('CONTINUAR', 'go(22)')}</div>`, true); }
function acceptedList() {
    const acceptedRequests = readRequests().filter(r => r.estado === 'ACEPTADO');
    shell(`<h1 class="title">LOS TURNOS ACEPTADOS</h1><div class="small-cards">${acceptedRequests.length ? acceptedRequests.map(userTurnCard).join('') : '<p class="empty">NO HAY TURNOS ACEPTADOS</p>'}</div>`, true);
}
function finalNotifications() { const requests = readRequests(); shell(`<h1 class="title">NOTIFICACIONES</h1><div class="small-cards">${requests.length ? requests.map((r,i)=>notificationCard(r,i)).join('') : '<p class="empty">NO HAY NOTIFICACIONES</p>'}</div>`, true); }
function resetAndGo(n) { clearDraft(); go(n); }
const render = { 1: access, 2: election, 3: requirements, 4: requirements, 5: requirements, 6: cita, 7: cita, 8: cita, 9: cita, 10: cita, 11: datos, 12: summary, 13: pending, 14: myturns, 15: accepted, 16: login, 17: notifications, 18: review, 19: decision, 20: reject, 21: confirmed, 22: acceptedList, 23: finalNotifications };
window.go = go;
window.resetAndGo = resetAndGo;
window.saveAppointment = saveAppointment;
window.submitRequest = submitRequest;
window.openRequest = openRequest;
window.openUserTurn = openUserTurn;
window.selectType = selectType;
window.savePerson = savePerson;
window.adminLogin = adminLogin;
window.saveReject = saveReject;
window.updateRequirementSelection = updateRequirementSelection;
window.continueRequirements = continueRequirements;
(render[page] || access)();
