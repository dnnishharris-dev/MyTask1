// ===== NAVIGASI SIDEBAR =====
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();

        // Tukar active nav
        navItems.forEach(n => n.classList.remove('active'));
        this.classList.add('active');

        // Tunjuk page yang betul
        const target = this.getAttribute('data-page');
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById(target).classList.add('active');
    });
});

// ===== TANDAKAN TUGASAN SELESAI =====
function tandaSelesai(btn) {
    const card = btn.closest('.task-card');
    const pill = card.querySelector('.pill');
    
    card.classList.remove('overdue', 'proses', 'baharu');
    card.classList.add('selesai');
    pill.classList.remove('overdue', 'proses', 'baharu');
    pill.classList.add('selesai');
    pill.textContent = 'Selesai';
    btn.remove();

    alert('✅ Tugasan berjaya ditandakan selesai!');
    kemaskiniStats();
}

// ===== KEMASKINI STATS =====
function kemaskiniStats() {
    const semua = document.querySelectorAll('.task-card').length;
    const selesai = document.querySelectorAll('.task-card.selesai').length;
    const overdue = document.querySelectorAll('.task-card.overdue').length;
    const proses = document.querySelectorAll('.task-card.proses').length;

    document.getElementById('stat-semua').textContent = semua;
    document.getElementById('stat-selesai').textContent = selesai;
    document.getElementById('stat-overdue').textContent = overdue;
    document.getElementById('stat-proses').textContent = proses;
}

// ===== TAMBAH TUGASAN BAHARU =====
function tambahTugasan() {
    const tajuk = document.getElementById('input-tajuk').value;
    const tarikh = document.getElementById('input-tarikh').value;
    const pelajar = document.getElementById('input-pelajar').value;
    const reason = document.getElementById('input-reason').value;

    if (!tajuk || !tarikh || !pelajar) {
        alert('⚠️ Sila isi semua maklumat tugasan!');
        return;
    }

    const senarai = document.getElementById('senarai-tugasan');
    const card = document.createElement('div');
    card.className = 'task-card baharu';
    card.innerHTML = `
        <div class="task-header">
            <div class="task-title">${tajuk}</div>
            <span class="pill baharu">Baharu</span>
        </div>
        <div class="task-meta">📅 ${tarikh} &nbsp;|&nbsp; 👤 ${pelajar}</div>
        ${reason ? `<div class="reason-box">💬 <b>SV:</b> ${reason}</div>` : ''}
        <div style="margin-top:8px;">
            <button class="btn-selesai" onclick="tandaSelesai(this)">✅ Tandakan Selesai</button>
        </div>
    `;
    senarai.prepend(card);

    // Clear form
    document.getElementById('input-tajuk').value = '';
    document.getElementById('input-tarikh').value = '';
    document.getElementById('input-pelajar').value = '';
    document.getElementById('input-reason').value = '';

    tutupModal();
    kemaskiniStats();
    alert('✅ Tugasan baharu berjaya ditambah!');
}

// ===== MODAL =====
function bukaModal() {
    document.getElementById('modal-tugasan').style.display = 'flex';
}

function tutupModal() {
    document.getElementById('modal-tugasan').style.display = 'none';
}