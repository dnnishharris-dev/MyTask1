// ===== STORAGE KEYS =====
const KEY_AKAUN = 'mytask_akaun';
const KEY_TUGASAN = 'mytask_tugasan';
const KEY_LAPORAN = 'mytask_laporan';
const KEY_SESI = 'mytask_sesi';

let roleSekarang = 'sv';
let roleDaftarSekarang = 'sv';
let penggunaLogin = null;
let filterAktif = 'semua';
let modGelap = false;

// ===== MUAT DATA DARI LOCALSTORAGE =====
function muatAkaun() {
    const data = localStorage.getItem(KEY_AKAUN);
    if (data) return JSON.parse(data);

    // Akaun demo default (kali pertama sahaja)
    const default_akaun = [
        { nama: 'Harris Danish', emel: 'sv@mytask.com', password: 'sv1234', role: 'sv' },
        { nama: 'Ahmad Faris', emel: 'pelajar@mytask.com', password: 'pelajar1234', role: 'pelajar' }
    ];
    localStorage.setItem(KEY_AKAUN, JSON.stringify(default_akaun));
    return default_akaun;
}

function simpanAkaun(senarai) {
    localStorage.setItem(KEY_AKAUN, JSON.stringify(senarai));
}

function muatTugasanData() {
    const data = localStorage.getItem(KEY_TUGASAN);
    if (data) return JSON.parse(data);
    const default_tugasan = [
        { id: 1, tajuk: 'Hantar Laporan Minggu 4', tarikh: '2026-06-20', pelajar: 'Ahmad Faris', email: 'pelajar@mytask.com', reason: 'Laporan minggu 4 perlu diserahkan segera.', status: 'overdue' },
        { id: 2, tajuk: 'Dokumentasi API Backend', tarikh: '2026-06-30', pelajar: 'Ahmad Faris', email: 'pelajar@mytask.com', reason: 'Pastikan semua endpoint didokumentasikan.', status: 'proses' }
    ];
    localStorage.setItem(KEY_TUGASAN, JSON.stringify(default_tugasan));
    return default_tugasan;
}

function simpanTugasanData() {
    localStorage.setItem(KEY_TUGASAN, JSON.stringify(tugasan));
}

function muatLaporanData() {
    const data = localStorage.getItem(KEY_LAPORAN);
    if (data) return JSON.parse(data);
    localStorage.setItem(KEY_LAPORAN, JSON.stringify([]));
    return [];
}

function simpanLaporanData() {
    localStorage.setItem(KEY_LAPORAN, JSON.stringify(laporan));
}

// ===== DATA UTAMA =====
let tugasan = muatTugasanData();
let laporan = muatLaporanData();

// ===== TUKAR HALAMAN LOGIN/DAFTAR =====
function papar(halaman) {
    document.getElementById('halaman-login').style.display = halaman === 'login' ? 'flex' : 'none';
    document.getElementById('halaman-daftar').style.display = halaman === 'daftar' ? 'flex' : 'none';
}

// ===== DARK MODE =====
function toggelMode() {
    modGelap = !modGelap;
    document.documentElement.setAttribute('data-theme', modGelap ? 'dark' : 'light');
    document.getElementById('btn-mode').textContent = modGelap ? '☀️ Light Mode' : '🌙 Dark Mode';
}

// ===== PILIH ROLE LOGIN =====
function pilihRole(role, el) {
    roleSekarang = role;
    el.parentElement.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
}

// ===== PILIH ROLE DAFTAR =====
function pilihRoleDaftar(role, el) {
    roleDaftarSekarang = role;
    el.parentElement.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
}

// ===== DAFTAR AKAUN BAHARU =====
function daftarAkaun() {
    const nama = document.getElementById('daftar-nama').value.trim();
    const emel = document.getElementById('daftar-email').value.trim().toLowerCase();
    const password = document.getElementById('daftar-password').value;
    const error = document.getElementById('daftar-error');

    if (!nama || !emel || !password) {
        error.textContent = '⚠️ Sila isi semua maklumat!';
        error.style.display = 'block';
        return;
    }
    if (password.length < 4) {
        error.textContent = '⚠️ Kata laluan perlu sekurang-kurangnya 4 aksara!';
        error.style.display = 'block';
        return;
    }

    const senaraiAkaun = muatAkaun();
    const dahWujud = senaraiAkaun.find(a => a.emel === emel);
    if (dahWujud) {
        error.textContent = '⚠️ Emel ini sudah didaftarkan! Sila log masuk.';
        error.style.display = 'block';
        return;
    }

    senaraiAkaun.push({ nama, emel, password, role: roleDaftarSekarang });
    simpanAkaun(senaraiAkaun);

    error.style.display = 'none';
    alert('✅ Akaun berjaya didaftarkan! Sila log masuk.');

    document.getElementById('daftar-nama').value = '';
    document.getElementById('daftar-email').value = '';
    document.getElementById('daftar-password').value = '';
    papar('login');
}

// ===== LOG MASUK =====
function logMasuk() {
    const emel = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const error = document.getElementById('login-error');

    const senaraiAkaun = muatAkaun();
    const akaunDijumpai = senaraiAkaun.find(a => a.emel === emel && a.password === password && a.role === roleSekarang);

    if (akaunDijumpai) {
        penggunaLogin = akaunDijumpai;
        localStorage.setItem(KEY_SESI, JSON.stringify(akaunDijumpai));
        error.style.display = 'none';
        masukSistem();
    } else {
        error.textContent = '⚠️ Emel, kata laluan, atau peranan tidak sepadan!';
        error.style.display = 'block';
    }
}

// ===== MASUK SISTEM =====
function masukSistem() {
    document.getElementById('halaman-login').style.display = 'none';
    document.getElementById('halaman-daftar').style.display = 'none';
    document.getElementById('sistem-utama').style.display = 'flex';

    document.getElementById('user-name').textContent = penggunaLogin.nama;
    document.getElementById('user-role').textContent = penggunaLogin.role === 'sv' ? 'SV / Penyelia' : 'Pelajar LI';
    document.getElementById('user-avatar').textContent = penggunaLogin.nama[0].toUpperCase();
    document.getElementById('selamat-datang').textContent = `Selamat datang, ${penggunaLogin.nama}!`;

    if (penggunaLogin.role === 'sv') {
        document.getElementById('btn-tambah-tugasan').style.display = 'flex';
        document.getElementById('btn-tambah-laporan').style.display = 'none';
    } else {
        document.getElementById('btn-tambah-tugasan').style.display = 'none';
        document.getElementById('btn-tambah-laporan').style.display = 'flex';
    }

    setupNav();
    muatSemua();
    semakReminder();
}

// ===== LOG KELUAR =====
function logKeluar() {
    if (!confirm('Adakah anda pasti mahu log keluar?')) return;
    penggunaLogin = null;
    localStorage.removeItem(KEY_SESI);
    document.getElementById('halaman-login').style.display = 'flex';
    document.getElementById('sistem-utama').style.display = 'none';
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector('.nav-item').classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-dashboard').classList.add('active');
}

// ===== SEMAK SESI SEDIA ADA (Auto Login) =====
function semakSesi() {
    const sesi = localStorage.getItem(KEY_SESI);
    if (sesi) {
        penggunaLogin = JSON.parse(sesi);
        masukSistem();
    }
}

// ===== NAVIGASI =====
function setupNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.replaceWith(item.cloneNode(true)); // reset listener lama
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(this.getAttribute('data-page')).classList.add('active');
        });
    });
}

// ===== MUAT SEMUA =====
function muatSemua() {
    muatTugasan();
    muatNotifikasi();
    muatLaporan();
    kemaskiniStats();
}

// ===== MUAT TUGASAN =====
function muatTugasan() {
    const senarai = document.getElementById('senarai-tugasan');
    const dashboard = document.getElementById('dashboard-tugasan');
    senarai.innerHTML = '';
    dashboard.innerHTML = '';

    // Pelajar hanya nampak tugasan dia sendiri
    let senaraiAsas = penggunaLogin.role === 'pelajar'
        ? tugasan.filter(t => t.email === penggunaLogin.emel)
        : tugasan;

    const senaraiFilt = filterAktif === 'semua' ? senaraiAsas : senaraiAsas.filter(t => t.status === filterAktif);

    if (senaraiFilt.length === 0) {
        senarai.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-muted);">Tiada tugasan ditemui.</div>`;
    }

    senaraiFilt.forEach(t => {
        const hariTinggal = hitungHari(t.tarikh);
        const reminderTag = (hariTinggal <= 3 && hariTinggal >= 0 && t.status !== 'selesai')
            ? `<div class="reminder-tag">⏰ ${hariTinggal} hari lagi untuk hantar!</div>` : '';

        let butang = '';
        if (penggunaLogin.role === 'sv' && t.status !== 'selesai') {
            butang = `<button class="btn-selesai" onclick="tandaSelesai(${t.id})">✅ Tandakan Selesai</button>`;
        } else if (penggunaLogin.role === 'pelajar' && t.status !== 'selesai') {
            butang = `<button class="btn-kemaskini" onclick="bukaModalKemaskini(${t.id})">🔄 Kemaskini Status</button>`;
        }

        const html = `
        <div class="task-card ${t.status}">
            <div class="task-header">
                <div class="task-title">${t.tajuk}</div>
                <span class="pill ${t.status}">${labelStatus(t.status)}</span>
            </div>
            <div class="task-meta">📅 ${formatTarikh(t.tarikh)} &nbsp;|&nbsp; 👤 ${t.pelajar}</div>
            ${t.reason ? `<div class="reason-box">💬 <b>Arahan SV:</b> ${t.reason}</div>` : ''}
            ${reminderTag}
            <div class="task-actions">${butang}</div>
        </div>`;

        senarai.innerHTML += html;
        if (senaraiAsas.indexOf(t) < 3) dashboard.innerHTML += html;
    });

    kemaskiniStats();
}

// ===== FILTER TUGASAN =====
function filterTugasan(status, el) {
    filterAktif = status;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    muatTugasan();
}

// ===== MUAT NOTIFIKASI =====
function muatNotifikasi() {
    const senarai = document.getElementById('senarai-notifikasi');
    senarai.innerHTML = '';
    let bilanganNotif = 0;

    let senaraiAsas = penggunaLogin.role === 'pelajar'
        ? tugasan.filter(t => t.email === penggunaLogin.emel)
        : tugasan;

    senaraiAsas.forEach(t => {
        const hariTinggal = hitungHari(t.tarikh);
        let warna = 'biru', teks = '', masa = '';

        if (t.status === 'overdue') {
            warna = 'merah';
            teks = `<b>Overdue!</b> ${t.pelajar} belum siapkan "${t.tajuk}"`;
            masa = 'Sudah lepas tarikh akhir';
            bilanganNotif++;
        } else if (hariTinggal <= 3 && hariTinggal >= 0 && t.status !== 'selesai') {
            warna = 'kuning';
            teks = `<b>Peringatan:</b> "${t.tajuk}" perlu diserahkan dalam ${hariTinggal} hari`;
            masa = 'Reminder automatik';
            bilanganNotif++;
        } else if (t.status === 'selesai') {
            warna = 'hijau';
            teks = `${t.pelajar} telah menyiapkan "${t.tajuk}" ✓`;
            masa = formatTarikh(t.tarikh);
        } else {
            teks = `Tugasan baharu: "${t.tajuk}" diberikan kepada ${t.pelajar}`;
            masa = formatTarikh(t.tarikh);
        }

        senarai.innerHTML += `
        <div class="notif-card">
            <div class="notif-dot ${warna}"></div>
            <div><div class="notif-title">${teks}</div><div class="notif-time">${masa}</div></div>
        </div>`;
    });

    const badge = document.getElementById('badge-notif');
    badge.textContent = bilanganNotif;
    badge.style.display = bilanganNotif > 0 ? 'inline' : 'none';
}

// ===== MUAT LAPORAN =====
function muatLaporan() {
    let senaraiAsas = penggunaLogin.role === 'pelajar'
        ? laporan.filter(l => l.emailPelajar === penggunaLogin.emel)
        : laporan;

    const selesai = senaraiAsas.filter(l => l.status === 'selesai').length;
    const proses = senaraiAsas.filter(l => l.status === 'proses').length;
    const overdue = senaraiAsas.filter(l => l.status === 'overdue').length;

    document.getElementById('laporan-selesai').textContent = selesai;
    document.getElementById('laporan-proses').textContent = proses;
    document.getElementById('laporan-overdue').textContent = overdue;

    const senarai = document.getElementById('senarai-laporan');
    senarai.innerHTML = '';

    if (senaraiAsas.length === 0) {
        senarai.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-muted);">Tiada laporan harian lagi.</div>`;
    }

    senaraiAsas.slice().reverse().forEach(l => {
        senarai.innerHTML += `
        <div class="laporan-card ${l.status}">
            <div class="task-header">
                <div class="task-title">${l.skop}</div>
                <span class="pill ${l.status}">${labelStatus(l.status)}</span>
            </div>
            <div class="task-meta">📅 ${formatTarikh(l.tarikh)} &nbsp;|&nbsp; 👤 ${l.pelajar}</div>
            ${l.catatan ? `<div class="catatan-box">📝 ${l.catatan}</div>` : ''}
        </div>`;
    });

    const peratus = senaraiAsas.length > 0 ? Math.round((selesai / senaraiAsas.length) * 100) : 0;
    document.getElementById('teks-ringkasan').textContent =
        `${overdue} overdue · ${proses} dalam proses · ${selesai} selesai · Kadar prestasi: ${peratus}%`;
}

// ===== TANDA SELESAI (SV) =====
function tandaSelesai(id) {
    tugasan = tugasan.map(t => t.id === id ? { ...t, status: 'selesai' } : t);
    simpanTugasanData();
    muatSemua();
    alert('✅ Tugasan berjaya ditandakan selesai!');
}

// ===== KEMASKINI STATUS (PELAJAR) =====
function bukaModalKemaskini(id) {
    document.getElementById('kemaskini-id').value = id;
    const t = tugasan.find(t => t.id === id);
    document.getElementById('kemaskini-status').value = t.status;
    document.getElementById('kemaskini-catatan').value = '';
    bukaModal('modal-kemaskini');
}

function simpanKemaskini() {
    const id = parseInt(document.getElementById('kemaskini-id').value);
    const status = document.getElementById('kemaskini-status').value;
    tugasan = tugasan.map(t => t.id === id ? { ...t, status } : t);
    simpanTugasanData();
    tutupModal('modal-kemaskini');
    muatSemua();
    alert('✅ Status tugasan berjaya dikemaskini!');
}

// ===== TAMBAH TUGASAN (SV) =====
function bukaModalTugasan() { bukaModal('modal-tugasan'); }

function tambahTugasan() {
    const tajuk = document.getElementById('input-tajuk').value.trim();
    const tarikh = document.getElementById('input-tarikh').value;
    const pelajar = document.getElementById('input-pelajar').value.trim();
    const emailPelajar = document.getElementById('input-email-pelajar').value.trim().toLowerCase();
    const reason = document.getElementById('input-reason').value.trim();

    if (!tajuk || !tarikh || !pelajar || !emailPelajar) {
        alert('⚠️ Sila isi semua maklumat yang diperlukan!');
        return;
    }

    tugasan.push({
        id: Date.now(),
        tajuk, tarikh, pelajar,
        email: emailPelajar,
        reason, status: 'baharu'
    });
    simpanTugasanData();

    hantarEmailTugasan(emailPelajar, pelajar, tajuk, tarikh, reason);

    document.getElementById('input-tajuk').value = '';
    document.getElementById('input-tarikh').value = '';
    document.getElementById('input-pelajar').value = '';
    document.getElementById('input-email-pelajar').value = '';
    document.getElementById('input-reason').value = '';

    tutupModal('modal-tugasan');
    muatSemua();
    alert('✅ Tugasan berjaya dihantar kepada pelajar!');
}

// ===== TAMBAH LAPORAN (PELAJAR) =====
function bukaModalLaporan() {
    document.getElementById('laporan-tarikh').value = new Date().toISOString().split('T')[0];
    bukaModal('modal-laporan');
}

function tambahLaporan() {
    const skop = document.getElementById('laporan-skop').value.trim();
    const tarikh = document.getElementById('laporan-tarikh').value;
    const status = document.getElementById('laporan-status').value;
    const catatan = document.getElementById('laporan-catatan').value.trim();

    if (!skop || !tarikh) {
        alert('⚠️ Sila isi skop kerja dan tarikh!');
        return;
    }

    laporan.push({
        id: Date.now(),
        skop, tarikh,
        pelajar: penggunaLogin.nama,
        emailPelajar: penggunaLogin.emel,
        status, catatan
    });
    simpanLaporanData();

    document.getElementById('laporan-skop').value = '';
    document.getElementById('laporan-catatan').value = '';

    tutupModal('modal-laporan');
    muatLaporan();
    alert('✅ Laporan harian berjaya dihantar!');
}

// ===== SEMAK REMINDER =====
function semakReminder() {
    tugasan.forEach(t => {
        const hariTinggal = hitungHari(t.tarikh);
        if ((hariTinggal === 3 || hariTinggal === 1) && t.status !== 'selesai') {
            hantarEmailReminder(t.email, t.pelajar, t.tajuk, t.tarikh, hariTinggal);
        }
    });
}

// ===== EMAIL WEB3FORMS =====
function hantarEmail(email, nama, tajuk, tarikh, mesej, jenis) {
    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            access_key: '8e15177f-3a70-4b46-8eb1-64849fc16155',
            subject: `MyTask — ${jenis}: ${tajuk}`,
            name: nama,
            email: email,
            message: `Kepada ${nama},\n\n${jenis} telah diberikan kepada anda.\n\n📋 Tajuk : ${tajuk}\n📅 Tarikh Akhir : ${formatTarikh(tarikh)}\n💬 Mesej SV : ${mesej || 'Tiada arahan tambahan.'}\n\nLog masuk ke MyTask:\nhttps://my-task1-rho.vercel.app\n\nSekian,\nSistem MyTask`
        })
    })
    .then(res => res.json())
    .then(data => { if (data.success) console.log('✅ Email dihantar kepada ' + nama); })
    .catch(err => console.log('❌ Ralat email:', err));
}

function hantarEmailTugasan(email, nama, tajuk, tarikh, reason) {
    hantarEmail(email, nama, tajuk, tarikh, reason, 'Tugasan Baharu');
}

function hantarEmailReminder(email, nama, tajuk, tarikh, hari) {
    hantarEmail(email, nama, tajuk, tarikh,
        `⏰ Tugasan perlu diserahkan dalam ${hari} hari lagi!`, `Reminder — ${hari} Hari Lagi`);
}

// ===== MODAL =====
function bukaModal(id) { document.getElementById(id).style.display = 'flex'; }
function tutupModal(id) { document.getElementById(id).style.display = 'none'; }

// ===== HELPER =====
function hitungHari(tarikh) {
    return Math.ceil((new Date(tarikh) - new Date()) / (1000 * 60 * 60 * 24));
}

function formatTarikh(tarikh) {
    return new Date(tarikh).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
}

function labelStatus(status) {
    return { overdue: 'Overdue', proses: 'Dalam Proses', selesai: 'Selesai', baharu: 'Baharu' }[status] || status;
}

function kemaskiniStats() {
    let senaraiAsas = penggunaLogin.role === 'pelajar'
        ? tugasan.filter(t => t.email === penggunaLogin.emel)
        : tugasan;
    document.getElementById('stat-semua').textContent = senaraiAsas.length;
    document.getElementById('stat-overdue').textContent = senaraiAsas.filter(t => t.status === 'overdue').length;
    document.getElementById('stat-proses').textContent = senaraiAsas.filter(t => t.status === 'proses').length;
    document.getElementById('stat-selesai').textContent = senaraiAsas.filter(t => t.status === 'selesai').length;
}

// ===== AUTO LOGIN BILA REFRESH =====
semakSesi();