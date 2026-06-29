// ===== AKAUN DEMO =====
const akaun = {
    sv: { emel: 'sv@mytask.com', password: 'sv1234', nama: 'Harris Danish', role: 'SV / Penyelia' },
    pelajar: { emel: 'pelajar@mytask.com', password: 'pelajar1234', nama: 'Ahmad Faris', role: 'Pelajar LI' }
};

let roleSekarang = 'sv';
let penggunaLogin = null;

// ===== DATA TUGASAN =====
let tugasan = [
    { id: 1, tajuk: 'Hantar Laporan Minggu 4', tarikh: '2026-06-20', pelajar: 'Ahmad Faris', email: 'pelajar@mytask.com', reason: 'Laporan minggu 4 perlu diserahkan segera.', status: 'overdue' },
    { id: 2, tajuk: 'Dokumentasi API Backend', tarikh: '2026-06-30', pelajar: 'Nurul Izzah', email: 'nurul@mytask.com', reason: '', status: 'proses' },
    { id: 3, tajuk: 'Pembangunan Modul Login', tarikh: '2026-06-18', pelajar: 'Ahmad Faris', email: 'pelajar@mytask.com', reason: '', status: 'selesai' }
];

// ===== EMAILJS SETUP =====
emailjs.init('YOUR_PUBLIC_KEY'); // Tukar dengan Public Key EmailJS anda

// ===== PILIH ROLE LOG MASUK =====
function pilihRole(role, el) {
    roleSekarang = role;
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
}

// ===== LOG MASUK =====
function logMasuk() {
    const emel = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const error = document.getElementById('login-error');

    const akaunDipilih = akaun[roleSekarang];

    if (emel === akaunDipilih.emel && password === akaunDipilih.password) {
        penggunaLogin = { ...akaunDipilih, role: roleSekarang };
        error.style.display = 'none';
        masukSistem();
    } else {
        error.style.display = 'block';
    }
}

// ===== MASUK SISTEM =====
function masukSistem() {
    document.getElementById('halaman-login').style.display = 'none';
    document.getElementById('sistem-utama').style.display = 'flex';

    // Set nama pengguna
    document.getElementById('user-name').textContent = penggunaLogin.nama;
    document.getElementById('user-role').textContent = penggunaLogin.role;
    document.getElementById('user-avatar').textContent = penggunaLogin.nama[0];

    // Kalau pelajar, sembunyikan butang tambah tugasan
    if (penggunaLogin.role === 'pelajar') {
        document.getElementById('btn-tambah-tugasan').style.display = 'none';
    }

    muatTugasan();
    muatNotifikasi();
    muatLaporan();
    semakReminder();
    setupNav();
}

// ===== LOG KELUAR =====
function logKeluar() {
    penggunaLogin = null;
    document.getElementById('halaman-login').style.display = 'flex';
    document.getElementById('sistem-utama').style.display = 'none';
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
}

// ===== NAVIGASI =====
function setupNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            const target = this.getAttribute('data-page');
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(target).classList.add('active');
        });
    });
}

// ===== MUAT TUGASAN =====
function muatTugasan() {
    const senarai = document.getElementById('senarai-tugasan');
    const dashboard = document.getElementById('dashboard-tugasan');
    senarai.innerHTML = '';
    dashboard.innerHTML = '';

    tugasan.forEach(t => {
        const hariTinggal = hitungHari(t.tarikh);
        const reminderTag = (hariTinggal <= 3 && hariTinggal >= 0 && t.status !== 'selesai')
            ? `<div class="reminder-tag">⏰ ${hariTinggal} hari lagi!</div>` : '';

        const btnSelesai = t.status !== 'selesai' && penggunaLogin.role !== 'pelajar'
            ? `<button class="btn-selesai" onclick="tandaSelesai(${t.id})">✅ Tandakan Selesai</button>` : '';

        const html = `
            <div class="task-card ${t.status}" id="task-${t.id}">
                <div class="task-header">
                    <div class="task-title">${t.tajuk}</div>
                    <span class="pill ${t.status}">${labelStatus(t.status)}</span>
                </div>
                <div class="task-meta">📅 ${formatTarikh(t.tarikh)} &nbsp;|&nbsp; 👤 ${t.pelajar}</div>
                ${t.reason ? `<div class="reason-box">💬 <b>SV:</b> ${t.reason}</div>` : ''}
                ${reminderTag}
                ${btnSelesai}
            </div>`;

        senarai.innerHTML += html;
        if (tugasan.indexOf(t) < 3) dashboard.innerHTML += html;
    });

    kemaskiniStats();
}

// ===== MUAT NOTIFIKASI =====
function muatNotifikasi() {
    const senarai = document.getElementById('senarai-notifikasi');
    senarai.innerHTML = '';

    tugasan.forEach(t => {
        const hariTinggal = hitungHari(t.tarikh);
        let warna = 'biru', teks = '', masa = 'Baru sahaja';

        if (t.status === 'overdue') {
            warna = 'merah';
            teks = `<b>Overdue!</b> ${t.pelajar} belum siapkan "${t.tajuk}"`;
            masa = 'Sudah lepas tarikh akhir';
        } else if (hariTinggal <= 3 && hariTinggal >= 0) {
            warna = 'kuning';
            teks = `<b>Peringatan:</b> "${t.tajuk}" perlu diserahkan dalam ${hariTinggal} hari`;
            masa = 'Reminder automatik';
        } else if (t.status === 'selesai') {
            warna = 'hijau';
            teks = `${t.pelajar} telah menyiapkan "${t.tajuk}" ✓`;
            masa = formatTarikh(t.tarikh);
        } else {
            teks = `Tugasan baharu: "${t.tajuk}" diberikan kepada ${t.pelajar}`;
        }

        senarai.innerHTML += `
            <div class="notif-card">
                <div class="notif-dot ${warna}"></div>
                <div>
                    <div class="notif-title">${teks}</div>
                    <div class="notif-time">${masa}</div>
                </div>
            </div>`;
    });
}

// ===== MUAT LAPORAN =====
function muatLaporan() {
    const selesai = tugasan.filter(t => t.status === 'selesai').length;
    const proses = tugasan.filter(t => t.status === 'proses').length;
    const overdue = tugasan.filter(t => t.status === 'overdue').length;

    document.getElementById('laporan-selesai').textContent = selesai;
    document.getElementById('laporan-proses').textContent = proses;
    document.getElementById('laporan-overdue').textContent = overdue;

    const senarai = document.getElementById('senarai-laporan');
    senarai.innerHTML = '';
    tugasan.forEach(t => {
        senarai.innerHTML += `
            <div class="task-card ${t.status}">
                <div class="task-header">
                    <div class="task-title">${t.tajuk}</div>
                    <span class="pill ${t.status}">${labelStatus(t.status)}</span>
                </div>
                <div class="task-meta">👤 ${t.pelajar} &nbsp;|&nbsp; 📅 ${formatTarikh(t.tarikh)}</div>
            </div>`;
    });

    const peratus = Math.round((selesai / tugasan.length) * 100);
    document.getElementById('teks-ringkasan').textContent =
        `${overdue} tugasan overdue · ${proses} dalam proses · ${selesai} selesai · Kadar prestasi: ${peratus}%`;
}

// ===== TANDA SELESAI =====
function tandaSelesai(id) {
    tugasan = tugasan.map(t => t.id === id ? { ...t, status: 'selesai' } : t);
    muatTugasan();
    muatNotifikasi();
    muatLaporan();
    alert('✅ Tugasan berjaya ditandakan selesai!');
}

// ===== TAMBAH TUGASAN =====
function tambahTugasan() {
    const tajuk = document.getElementById('input-tajuk').value.trim();
    const tarikh = document.getElementById('input-tarikh').value;
    const pelajar = document.getElementById('input-pelajar').value.trim();
    const emailPelajar = document.getElementById('input-email-pelajar').value.trim();
    const reason = document.getElementById('input-reason').value.trim();

    if (!tajuk || !tarikh || !pelajar || !emailPelajar) {
        alert('⚠️ Sila isi semua maklumat tugasan!');
        return;
    }

    const idBaru = tugasan.length + 1;
    tugasan.push({ id: idBaru, tajuk, tarikh, pelajar, email: emailPelajar, reason, status: 'baharu' });

    // Hantar email kepada pelajar
    hantarEmailTugasan(emailPelajar, pelajar, tajuk, tarikh, reason);

    tutupModal();
    muatTugasan();
    muatNotifikasi();
    muatLaporan();

    document.getElementById('input-tajuk').value = '';
    document.getElementById('input-tarikh').value = '';
    document.getElementById('input-pelajar').value = '';
    document.getElementById('input-email-pelajar').value = '';
    document.getElementById('input-reason').value = '';

    alert('✅ Tugasan baharu berjaya ditambah! Email dihantar kepada pelajar.');
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

// ===== HANTAR EMAIL TUGASAN BAHARU =====
function hantarEmailTugasan(email, nama, tajuk, tarikh, reason) {
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
        to_email: email,
        to_name: nama,
        tajuk_tugasan: tajuk,
        tarikh_akhir: formatTarikh(tarikh),
        arahan_sv: reason || 'Tiada arahan tambahan.',
        jenis: 'Tugasan Baharu'
    }).then(() => {
        console.log('Email tugasan berjaya dihantar!');
    }).catch(err => {
        console.log('Email gagal:', err);
    });
}

// ===== HANTAR EMAIL REMINDER =====
function hantarEmailReminder(email, nama, tajuk, tarikh, hari) {
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
        to_email: email,
        to_name: nama,
        tajuk_tugasan: tajuk,
        tarikh_akhir: formatTarikh(tarikh),
        arahan_sv: `Tugasan ini perlu diserahkan dalam ${hari} hari lagi!`,
        jenis: `Reminder — ${hari} Hari Lagi`
    }).then(() => {
        console.log('Email reminder berjaya dihantar!');
    }).catch(err => {
        console.log('Reminder gagal:', err);
    });
}

// ===== MODAL =====
function bukaModal() { document.getElementById('modal-tugasan').style.display = 'flex'; }
function tutupModal() { document.getElementById('modal-tugasan').style.display = 'none'; }

// ===== HELPER =====
function hitungHari(tarikh) {
    const hari = Math.ceil((new Date(tarikh) - new Date()) / (1000 * 60 * 60 * 24));
    return hari;
}

function formatTarikh(tarikh) {
    return new Date(tarikh).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
}

function labelStatus(status) {
    const label = { overdue: 'Overdue', proses: 'Dalam Proses', selesai: 'Selesai', baharu: 'Baharu' };
    return label[status] || status;
}

function kemaskiniStats() {
    document.getElementById('stat-semua').textContent = tugasan.length;
    document.getElementById('stat-overdue').textContent = tugasan.filter(t => t.status === 'overdue').length;
    document.getElementById('stat-proses').textContent = tugasan.filter(t => t.status === 'proses').length;
    document.getElementById('stat-selesai').textContent = tugasan.filter(t => t.status === 'selesai').length;
}