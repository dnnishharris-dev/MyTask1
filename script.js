// ===== SUPABASE SETUP =====
const SUPABASE_URL = 'https://mrktydgpseajqaitpalb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ya3R5ZGdwc2VhanFhaXRwYWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NjE0ODYsImV4cCI6MjA5ODQzNzQ4Nn0.80PVgA1lgzEIqD5slgF8D9iLRjWlZrXb-CPvkZn2QxY';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const KEY_SESI = 'mytask_sesi';

let roleSekarang = 'sv';
let roleDaftarSekarang = 'sv';
let penggunaLogin = null;
let filterAktif = 'semua';
let modGelap = false;

let tugasan = [];
let laporan = [];

// ===== TUKAR HALAMAN LOGIN/DAFTAR/LUPA =====
function papar(halaman) {
    document.getElementById('halaman-login').style.display = halaman === 'login' ? 'flex' : 'none';
    document.getElementById('halaman-daftar').style.display = halaman === 'daftar' ? 'flex' : 'none';
    document.getElementById('halaman-lupa').style.display = halaman === 'lupa' ? 'flex' : 'none';

    if (halaman === 'lupa') {
        document.getElementById('lupa-email').value = '';
        document.getElementById('lupa-password-baru').value = '';
        document.getElementById('lupa-error').style.display = 'none';
        document.getElementById('lupa-success').style.display = 'none';
        document.getElementById('lupa-set-baru').style.display = 'none';
    }
}

// ===== DARK MODE =====
function toggelMode() {
    modGelap = !modGelap;
    document.documentElement.setAttribute('data-theme', modGelap ? 'dark' : 'light');
    document.getElementById('btn-mode').textContent = modGelap ? '☀️ Light Mode' : '🌙 Dark Mode';
}

// ===== PILIH ROLE =====
function pilihRole(role, el) {
    roleSekarang = role;
    el.parentElement.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
}

function pilihRoleDaftar(role, el) {
    roleDaftarSekarang = role;
    el.parentElement.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
}

// ===== DAFTAR AKAUN BAHARU (SUPABASE) =====
async function daftarAkaun() {
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

    const { data: existing } = await sb.from('akaun').select('id').eq('emel', emel).maybeSingle();
    if (existing) {
        error.textContent = '⚠️ Emel ini sudah didaftarkan! Sila log masuk.';
        error.style.display = 'block';
        return;
    }

    const { error: insertError } = await sb.from('akaun').insert({
        nama, emel, password, role: roleDaftarSekarang
    });

    if (insertError) {
        error.textContent = '⚠️ Ralat pendaftaran: ' + insertError.message;
        error.style.display = 'block';
        return;
    }

    error.style.display = 'none';
    alert('✅ Akaun berjaya didaftarkan! Sila log masuk.');

    document.getElementById('daftar-nama').value = '';
    document.getElementById('daftar-email').value = '';
    document.getElementById('daftar-password').value = '';
    papar('login');
}

// ===== LOG MASUK (SUPABASE) =====
async function logMasuk() {
    const emel = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const error = document.getElementById('login-error');

    const { data: akaunDijumpai, error: fetchError } = await sb
        .from('akaun')
        .select('*')
        .eq('emel', emel)
        .eq('password', password)
        .eq('role', roleSekarang)
        .maybeSingle();

    if (fetchError || !akaunDijumpai) {
        error.textContent = '⚠️ Emel, kata laluan, atau peranan tidak sepadan!';
        error.style.display = 'block';
        return;
    }

    penggunaLogin = akaunDijumpai;
    localStorage.setItem(KEY_SESI, JSON.stringify(akaunDijumpai));
    error.style.display = 'none';
    masukSistem();
}

// ===== MASUK SISTEM =====
async function masukSistem() {
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
    await muatSemua();
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
async function semakSesi() {
    const sesi = localStorage.getItem(KEY_SESI);
    if (sesi) {
        penggunaLogin = JSON.parse(sesi);
        await masukSistem();
    }
}

// ===== NAVIGASI =====
function setupNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.replaceWith(item.cloneNode(true));
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

// ===== MUAT SEMUA DARI SUPABASE =====
async function muatSemua() {
    await ambilTugasanDB();
    await ambilLaporanDB();
    muatTugasan();
    muatNotifikasi();
    muatLaporan();
    kemaskiniStats();
}

// ===== AMBIL TUGASAN DARI SUPABASE =====
async function ambilTugasanDB() {
    const { data, error } = await sb.from('tugasan').select('*').order('tarikh', { ascending: true });
    if (!error) tugasan = data || [];
}

// ===== AMBIL LAPORAN DARI SUPABASE =====
async function ambilLaporanDB() {
    const { data, error } = await sb.from('laporan').select('*').order('created_at', { ascending: false });
    if (!error) laporan = data || [];
}

// ===== MUAT TUGASAN (RENDER) =====
function muatTugasan() {
    const senarai = document.getElementById('senarai-tugasan');
    const dashboard = document.getElementById('dashboard-tugasan');
    senarai.innerHTML = '';
    dashboard.innerHTML = '';

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
        ? laporan.filter(l => l.email_pelajar === penggunaLogin.emel)
        : laporan;

    let totalSelesai = 0, totalProses = 0, totalOverdue = 0;
    senaraiAsas.forEach(l => {
        const semua = [...(l.skop_harian || []), ...(l.skop_tambahan || [])];
        semua.forEach(s => {
            if (s.status === 'selesai') totalSelesai++;
            else if (s.status === 'proses') totalProses++;
            else if (s.status === 'overdue') totalOverdue++;
        });
    });

    document.getElementById('laporan-selesai').textContent = totalSelesai;
    document.getElementById('laporan-proses').textContent = totalProses;
    document.getElementById('laporan-overdue').textContent = totalOverdue;

    const senarai = document.getElementById('senarai-laporan');
    senarai.innerHTML = '';

    if (senaraiAsas.length === 0) {
        senarai.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-muted);">Tiada laporan harian lagi.</div>`;
    }

    senaraiAsas.slice().reverse().forEach(l => {
        let htmlSkopHarian = '';
        let htmlSkopTambahan = '';
        const bolehEdit = penggunaLogin.role === 'pelajar' && l.email_pelajar === penggunaLogin.emel;

        if (l.skop_harian && l.skop_harian.length > 0) {
            htmlSkopHarian = `<div class="laporan-group-title">🔁 Skop Kerja Harian</div>`;
            l.skop_harian.forEach((s, idx) => {
                const btnUpdate = (bolehEdit && s.status !== 'selesai')
                    ? `<button class="btn-selesai" style="margin-top:6px;font-size:11px;padding:4px 10px;" onclick="tandaSkopSelesai(${l.id}, 'skop_harian', ${idx})">✅ Tandakan Selesai</button>`
                    : '';
                htmlSkopHarian += `
                <div class="laporan-card ${s.status}" style="margin-bottom:6px;">
                    <div class="task-header">
                        <div class="task-title" style="font-size:13px;">${s.tajuk}</div>
                        <span class="pill ${s.status}">${labelStatus(s.status)}</span>
                    </div>
                    ${s.reason ? `<div class="reason-tag">💬 ${s.reason}</div>` : ''}
                    ${btnUpdate}
                </div>`;
            });
        }

        if (l.skop_tambahan && l.skop_tambahan.length > 0) {
            htmlSkopTambahan = `<div class="laporan-group-title">➕ Task Tambahan</div>`;
            l.skop_tambahan.forEach((s, idx) => {
                const btnUpdate = (bolehEdit && s.status !== 'selesai')
                    ? `<button class="btn-selesai" style="margin-top:6px;font-size:11px;padding:4px 10px;" onclick="tandaSkopSelesai(${l.id}, 'skop_tambahan', ${idx})">✅ Tandakan Selesai</button>`
                    : '';
                htmlSkopTambahan += `
                <div class="laporan-card ${s.status}" style="margin-bottom:6px;">
                    <div class="task-header">
                        <div class="task-title" style="font-size:13px;">${s.tajuk}</div>
                        <span class="pill ${s.status}">${labelStatus(s.status)}</span>
                    </div>
                    ${s.reason ? `<div class="reason-tag">💬 ${s.reason}</div>` : ''}
                    ${btnUpdate}
                </div>`;
            });
        }

        senarai.innerHTML += `
        <div class="laporan-card selesai" style="margin-bottom:12px;">
            <div class="task-header" style="margin-bottom:8px;">
                <div class="task-title">📅 ${formatTarikh(l.tarikh)}</div>
                <span style="font-size:11px;color:var(--text-muted);">👤 ${l.pelajar}</span>
            </div>
            ${htmlSkopHarian}
            ${htmlSkopTambahan}
        </div>`;
    });

    const total = totalSelesai + totalProses + totalOverdue;
    const peratus = total > 0 ? Math.round((totalSelesai / total) * 100) : 0;
    document.getElementById('teks-ringkasan').textContent =
        `${totalOverdue} tidak sempat · ${totalProses} dalam proses · ${totalSelesai} selesai · Kadar prestasi: ${peratus}%`;
}

// ===== TANDA SKOP LAPORAN SELESAI (PELAJAR) =====
async function tandaSkopSelesai(laporanId, jenisSkop, index) {
    const l = laporan.find(lap => lap.id === laporanId);
    if (!l) return;

    const senaraiSkop = [...l[jenisSkop]];
    senaraiSkop[index] = { ...senaraiSkop[index], status: 'selesai' };

    const { error } = await sb.from('laporan').update({ [jenisSkop]: senaraiSkop }).eq('id', laporanId);
    if (error) { alert('❌ Ralat: ' + error.message); return; }

    await ambilLaporanDB();
    muatLaporan();
    alert('✅ Status skop kerja berjaya dikemaskini!');
}

// ===== TANDA SELESAI (SV) =====
async function tandaSelesai(id) {
    const { error } = await sb.from('tugasan').update({ status: 'selesai' }).eq('id', id);
    if (error) { alert('❌ Ralat: ' + error.message); return; }
    await muatSemua();
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

async function simpanKemaskini() {
    const id = parseInt(document.getElementById('kemaskini-id').value);
    const status = document.getElementById('kemaskini-status').value;

    const { error } = await sb.from('tugasan').update({ status }).eq('id', id);
    if (error) { alert('❌ Ralat: ' + error.message); return; }

    tutupModal('modal-kemaskini');
    await muatSemua();
    alert('✅ Status tugasan berjaya dikemaskini!');
}
// ===== BUKA MODAL TUGASAN (SV) =====
function bukaModalTugasan() { bukaModal('modal-tugasan'); }

// ===== TAMBAH TUGASAN (SV) =====
async function tambahTugasan() {
    const tajuk = document.getElementById('input-tajuk').value.trim();
    const tarikh = document.getElementById('input-tarikh').value;
    const pelajar = document.getElementById('input-pelajar').value.trim();
    const emailPelajar = document.getElementById('input-email-pelajar').value.trim().toLowerCase();
    const reason = document.getElementById('input-reason').value.trim();

    if (!tajuk || !tarikh || !pelajar || !emailPelajar) {
        alert('⚠️ Sila isi semua maklumat yang diperlukan!');
        return;
    }

    const { error } = await sb.from('tugasan').insert({
        tajuk, tarikh, pelajar, email: emailPelajar, reason, status: 'baharu'
    });

    if (error) { alert('❌ Ralat: ' + error.message); return; }

    hantarEmailTugasan(emailPelajar, pelajar, tajuk, tarikh, reason);

    document.getElementById('input-tajuk').value = '';
    document.getElementById('input-tarikh').value = '';
    document.getElementById('input-pelajar').value = '';
    document.getElementById('input-email-pelajar').value = '';
    document.getElementById('input-reason').value = '';

    tutupModal('modal-tugasan');
    await muatSemua();
    alert('✅ Tugasan berjaya dihantar kepada pelajar!');
}

// ===== COUNTER UNTUK SKOP ITEM =====
let counterHarian = 1;
let counterTambahan = 1;

// ===== BUKA MODAL LAPORAN =====
function bukaModalLaporan() {
    document.getElementById('laporan-tarikh').value = new Date().toISOString().split('T')[0];

    counterHarian = 1;
    counterTambahan = 1;
    document.getElementById('senarai-skop-harian').innerHTML = buatSkopItem('harian', 1);
    document.getElementById('senarai-skop-tambahan').innerHTML = buatSkopItem('tambahan', 1);

    bukaModal('modal-laporan');
}

// ===== BUAT SKOP ITEM HTML =====
function buatSkopItem(jenis, nombor) {
    const prefix = jenis === 'harian' ? 'h' : 't';
    return `
    <div class="skop-item" id="skop-${jenis}-${nombor}">
        <div class="skop-item-header">
            <input type="text" class="skop-input" placeholder="${jenis === 'harian' ? 'Contoh: Semak dan balas emel' : 'Contoh: Bantu setup server baharu'}" id="skop-${prefix}-tajuk-${nombor}">
            <select class="skop-status" id="skop-${prefix}-status-${nombor}">
                <option value="selesai">✅ Selesai</option>
                <option value="proses">🔄 Dalam Proses</option>
                <option value="overdue">⚠️ Tidak Sempat</option>
            </select>
            <button class="btn-hapus-skop" onclick="hapusSkop('skop-${jenis}-${nombor}')">✕</button>
        </div>
        <div class="skop-reason-wrap">
            <select class="skop-reason-pilihan" onchange="pilihanReason(this, 'skop-${prefix}-reason-${nombor}')">
                <option value="">— Tiada Reason —</option>
                <option value="Belum siap">Belum Siap</option>
                <option value="Tidak sihat">Tidak Sihat</option>
                <option value="Emergency Leave (EL)">Emergency Leave (EL)</option>
                <option value="lain">Lain-lain (taip sendiri)</option>
            </select>
            <input type="text" class="skop-reason-input" id="skop-${prefix}-reason-${nombor}" placeholder="Taip reason anda..." style="display:none;">
        </div>
    </div>`;
}

// ===== TAMBAH SKOP HARIAN =====
function tambahSkopHarian() {
    counterHarian++;
    document.getElementById('senarai-skop-harian').innerHTML += buatSkopItem('harian', counterHarian);
}

// ===== TAMBAH SKOP TAMBAHAN =====
function tambahSkopTambahan() {
    counterTambahan++;
    document.getElementById('senarai-skop-tambahan').innerHTML += buatSkopItem('tambahan', counterTambahan);
}

// ===== HAPUS SKOP ITEM =====
function hapusSkop(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// ===== PILIHAN REASON =====
function pilihanReason(select, inputId) {
    const input = document.getElementById(inputId);
    if (select.value === 'lain') {
        input.style.display = 'block';
        input.focus();
    } else {
        input.style.display = 'none';
        input.value = '';
    }
}

// ===== KUMPUL DATA SKOP =====
function kumpulSkop(jenis) {
    const prefix = jenis === 'harian' ? 'h' : 't';
    const container = document.getElementById(`senarai-skop-${jenis}`);
    const items = container.querySelectorAll('.skop-item');
    const hasil = [];

    items.forEach(item => {
        const id = item.id.replace(`skop-${jenis}-`, '');
        const tajuk = document.getElementById(`skop-${prefix}-tajuk-${id}`)?.value.trim();
        const status = document.getElementById(`skop-${prefix}-status-${id}`)?.value;
        const reasonPilihan = item.querySelector('.skop-reason-pilihan')?.value;
        const reasonInput = item.querySelector('.skop-reason-input')?.value.trim();

        if (!tajuk) return;

        let reason = '';
        if (reasonPilihan === 'lain') reason = reasonInput;
        else reason = reasonPilihan;

        hasil.push({ tajuk, status, reason });
    });

    return hasil;
}

// ===== TAMBAH LAPORAN (PELAJAR) =====
async function tambahLaporan() {
    const tarikh = document.getElementById('laporan-tarikh').value;
    if (!tarikh) {
        alert('⚠️ Sila pilih tarikh!');
        return;
    }

    const skopHarian = kumpulSkop('harian');
    const skopTambahan = kumpulSkop('tambahan');

    if (skopHarian.length === 0 && skopTambahan.length === 0) {
        alert('⚠️ Sila isi sekurang-kurangnya satu skop kerja!');
        return;
    }

    const { error } = await sb.from('laporan').insert({
        tarikh,
        pelajar: penggunaLogin.nama,
        email_pelajar: penggunaLogin.emel,
        skop_harian: skopHarian,
        skop_tambahan: skopTambahan
    });

    if (error) { alert('❌ Ralat: ' + error.message); return; }

    tutupModal('modal-laporan');
    await ambilLaporanDB();
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

// ===== LUPA KATA LALUAN (SUPABASE) =====
let emelLupaSemasa = '';

async function semakEmelLupa() {
    const emel = document.getElementById('lupa-email').value.trim().toLowerCase();
    const error = document.getElementById('lupa-error');
    const success = document.getElementById('lupa-success');

    if (!emel) {
        error.textContent = '⚠️ Sila masukkan emel anda!';
        error.style.display = 'block';
        success.style.display = 'none';
        return;
    }

    const { data: akaunDijumpai } = await sb.from('akaun').select('*').eq('emel', emel).maybeSingle();

    if (!akaunDijumpai) {
        error.textContent = '⚠️ Emel ini tidak didaftarkan dalam sistem!';
        error.style.display = 'block';
        success.style.display = 'none';
        document.getElementById('lupa-set-baru').style.display = 'none';
        return;
    }

    emelLupaSemasa = emel;
    error.style.display = 'none';
    success.textContent = `✅ Akaun dijumpai atas nama ${akaunDijumpai.nama}. Sila tetapkan kata laluan baharu.`;
    success.style.display = 'block';
    document.getElementById('lupa-set-baru').style.display = 'block';
}

async function tetapkanSemulaPassword() {
    const passwordBaru = document.getElementById('lupa-password-baru').value;
    const error = document.getElementById('lupa-error');

    if (!passwordBaru || passwordBaru.length < 4) {
        error.textContent = '⚠️ Kata laluan perlu sekurang-kurangnya 4 aksara!';
        error.style.display = 'block';
        return;
    }

    const { error: updateError } = await sb.from('akaun').update({ password: passwordBaru }).eq('emel', emelLupaSemasa);
    if (updateError) { error.textContent = '⚠️ Ralat: ' + updateError.message; error.style.display = 'block'; return; }

    error.style.display = 'none';
    alert('✅ Kata laluan berjaya ditetapkan semula! Sila log masuk dengan kata laluan baharu.');

    document.getElementById('lupa-email').value = '';
    document.getElementById('lupa-password-baru').value = '';
    document.getElementById('lupa-set-baru').style.display = 'none';
    document.getElementById('lupa-success').style.display = 'none';
    papar('login');
}

// ===== TOGGLE LIHAT KATA LALUAN =====
function togglePassword(idInput, btn) {
    const input = document.getElementById(idInput);
    const iconEye = btn.querySelector('.icon-eye');
    const iconEyeOff = btn.querySelector('.icon-eye-off');

    if (input.type === 'password') {
        input.type = 'text';
        iconEye.style.display = 'none';
        iconEyeOff.style.display = 'block';
    } else {
        input.type = 'password';
        iconEye.style.display = 'block';
        iconEyeOff.style.display = 'none';
    }
}

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