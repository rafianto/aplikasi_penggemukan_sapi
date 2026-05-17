// ==================== UTILITIES ====================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
}

function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num);
}

function showToast(msg, type = '') {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.className = 'toast', 3000);
}

function statusBadge(status) {
  const map = { Aktif: 'badge-aktif', Terjual: 'badge-terjual', Sakit: 'badge-sakit', Meninggal: 'badge-meninggal' };
  return `<span class="badge ${map[status] || ''}">${status}</span>`;
}

function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// ==================== NAVIGATION ====================
$$('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const page = item.dataset.page;
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    $$('.page').forEach(p => p.classList.remove('active'));
    $(`#page-${page}`).classList.add('active');
    $('#page-title').textContent = item.querySelector('span:last-child').textContent;
    loadPage(page);
  });
});

function loadPage(page) {
  switch(page) {
    case 'dashboard': loadDashboard(); break;
    case 'sapi': loadSapi(); break;
    case 'perawatan': loadPerawatan(); break;
    case 'medis': loadMedis(); break;
    case 'penjualan': loadPenjualan(); break;
    case 'keuangan': loadKeuangan(); break;
  }
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
  const stats = await window.api.dashboard.stats();

  $('#dashboard-stats').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">🐄 Sapi Aktif</div>
      <div class="stat-value">${stats.sapiAktif}</div>
      <div class="stat-sub">dari ${stats.totalSapi} total</div>
    </div>
    <div class="stat-card success">
      <div class="stat-label">💰 Terjual</div>
      <div class="stat-value">${stats.sapiTerjual}</div>
      <div class="stat-sub">${stats.sapiSakit} sakit</div>
    </div>
    <div class="stat-card warning">
      <div class="stat-label">💵 Total Penjualan</div>
      <div class="stat-value">${formatRupiah(stats.totalPenjualan)}</div>
    </div>
    <div class="stat-card danger">
      <div class="stat-label">📦 Investasi Aktif</div>
      <div class="stat-value">${formatRupiah(stats.totalInvestasi)}</div>
      <div class="stat-sub">Biaya operasional: ${formatRupiah(stats.totalBiaya)}</div>
    </div>
  `;

  const sl = stats.sapiTerbaru;
  $('#dash-sapi-list').innerHTML = sl.length
    ? sl.map(s => `
        <div class="list-item">
          <div class="list-item-info">${s.nama} <span class="list-item-sub">${s.tag_id}</span></div>
          <div class="list-item-value">${statusBadge(s.status)} ${formatRupiah(s.harga_beli)}</div>
        </div>
      `).join('')
    : '<div class="empty-state">Belum ada data sapi</div>';

  const jl = stats.penjualanTerbaru;
  $('#dash-jual-list').innerHTML = jl.length
    ? jl.map(p => `
        <div class="list-item">
          <div class="list-item-info">${p.nama_sapi} <span class="list-item-sub">${p.pembeli}</span></div>
          <div class="list-item-value" style="color:var(--success)">${formatRupiah(p.total_harga)}</div>
        </div>
      `).join('')
    : '<div class="empty-state">Belum ada penjualan</div>';
}

// ==================== SAPI ====================
async function loadSapi() {
  const list = await window.api.sapi.getAll();
  const tbody = $('#table-sapi tbody');
  tbody.innerHTML = list.length
    ? list.map(s => `
        <tr>
          <td><strong>${s.tag_id}</strong></td>
          <td>${s.nama}</td>
          <td>${s.jenis_kelamin}</td>
          <td>${formatNumber(s.berat_awal)} kg</td>
          <td>${formatNumber(s.berat_sekarang)} kg</td>
          <td>${s.tanggal_masuk}</td>
          <td>${formatRupiah(s.harga_beli)}</td>
          <td>${statusBadge(s.status)}</td>
          <td>
            <div class="actions-cell">
              <button class="btn btn-primary btn-sm" onclick="editSapi(${s.id})">✏️</button>
              <button class="btn btn-danger btn-sm" onclick="deleteSapi(${s.id})">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('')
    : '<tr><td colspan="9" class="empty-state">Belum ada data sapi</td></tr>';
}

function clearSapiForm() {
  $('#form-sapi').reset();
  $('#sapi-id').value = '';
  $('#sapi-berat-sekarang').value = '';
}

async function openSapiModal(id) {
  clearSapiForm();
  if (id) {
    const s = await window.api.sapi.getById(id);
    $('#modal-sapi-title').textContent = 'Edit Sapi';
    $('#sapi-id').value = s.id;
    $('#sapi-tag').value = s.tag_id;
    $('#sapi-nama').value = s.nama;
    $('#sapi-jk').value = s.jenis_kelamin;
    $('#sapi-status').value = s.status;
    $('#sapi-berat-awal').value = s.berat_awal;
    $('#sapi-berat-sekarang').value = s.berat_sekarang;
    $('#sapi-tgl-masuk').value = s.tanggal_masuk;
    $('#sapi-harga').value = s.harga_beli;
    $('#sapi-ket').value = s.keterangan;
  } else {
    $('#modal-sapi-title').textContent = 'Tambah Sapi';
    $('#sapi-tgl-masuk').value = todayStr();
  }
  openModal('modal-sapi');
}

async function editSapi(id) { openSapiModal(id); }

async function saveSapi() {
  const data = {
    tag_id: $('#sapi-tag').value.trim(),
    nama: $('#sapi-nama').value.trim(),
    jenis_kelamin: $('#sapi-jk').value,
    status: $('#sapi-status').value,
    berat_awal: parseFloat($('#sapi-berat-awal').value) || 0,
    berat_sekarang: parseFloat($('#sapi-berat-sekarang').value) || parseFloat($('#sapi-berat-awal').value) || 0,
    tanggal_masuk: $('#sapi-tgl-masuk').value,
    harga_beli: parseFloat($('#sapi-harga').value) || 0,
    keterangan: $('#sapi-ket').value.trim()
  };

  if (!data.tag_id || !data.nama || !data.jenis_kelamin || !data.tanggal_masuk) {
    showToast('Lengkapi field yang bertanda *', 'error');
    return;
  }

  const id = $('#sapi-id').value;
  if (id) {
    await window.api.sapi.update(parseInt(id), data);
    showToast('Data sapi berhasil diperbarui', 'success');
  } else {
    await window.api.sapi.create(data);
    showToast('Sapi baru berhasil ditambahkan', 'success');
  }
  closeModal('modal-sapi');
  loadSapi();
}

async function deleteSapi(id) {
  if (!confirm('Hapus sapi ini? Semua data perawatan dan medis terkait juga akan dihapus.')) return;
  await window.api.sapi.delete(id);
  showToast('Sapi berhasil dihapus', 'success');
  loadSapi();
}

// ==================== PERAWATAN ====================
async function loadPerawatan() {
  const list = await window.api.perawatan.getAll();
  const tbody = $('#table-perawatan tbody');
  tbody.innerHTML = list.length
    ? list.map(p => `
        <tr>
          <td>${p.tanggal}</td>
          <td><strong>${p.tag_id}</strong></td>
          <td>${p.nama_sapi}</td>
          <td>${p.jenis_perawatan}</td>
          <td>${p.keterangan || '-'}</td>
          <td>${formatRupiah(p.biaya)}</td>
          <td>
            <div class="actions-cell">
              <button class="btn btn-primary btn-sm" onclick="editPerawatan(${p.id})">✏️</button>
              <button class="btn btn-danger btn-sm" onclick="deletePerawatan(${p.id})">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('')
    : '<tr><td colspan="7" class="empty-state">Belum ada data perawatan</td></tr>';
}

async function loadSapiOptions(selectId, onlyActive = true) {
  const allSapi = await window.api.sapi.getAll();
  const filtered = onlyActive ? allSapi.filter(s => s.status === 'Aktif' || s.status === 'Sakit') : allSapi;
  const sel = $(`#${selectId}`);
  sel.innerHTML = '<option value="">Pilih Sapi...</option>' +
    filtered.map(s => `<option value="${s.id}">${s.tag_id} - ${s.nama} (${s.status})</option>`).join('');
}

function clearPerawatanForm() {
  $('#form-perawatan').reset();
  $('#perawatan-id').value = '';
}

async function openPerawatanModal(id) {
  clearPerawatanForm();
  await loadSapiOptions('perawatan-sapi');
  if (id) {
    const all = await window.api.perawatan.getAll();
    const p = all.find(x => x.id === id);
    if (p) {
      $('#modal-perawatan-title').textContent = 'Edit Perawatan';
      $('#perawatan-id').value = p.id;
      $('#perawatan-sapi').value = p.sapi_id;
      $('#perawatan-jenis').value = p.jenis_perawatan;
      $('#perawatan-tgl').value = p.tanggal;
      $('#perawatan-biaya').value = p.biaya;
      $('#perawatan-ket').value = p.keterangan;
    }
  } else {
    $('#modal-perawatan-title').textContent = 'Tambah Perawatan';
    $('#perawatan-tgl').value = todayStr();
  }
  openModal('modal-perawatan');
}

async function editPerawatan(id) { openPerawatanModal(id); }

async function savePerawatan() {
  const data = {
    sapi_id: parseInt($('#perawatan-sapi').value),
    jenis_perawatan: $('#perawatan-jenis').value.trim(),
    tanggal: $('#perawatan-tgl').value,
    biaya: parseFloat($('#perawatan-biaya').value) || 0,
    keterangan: $('#perawatan-ket').value.trim()
  };
  if (!data.sapi_id || !data.jenis_perawatan || !data.tanggal) {
    showToast('Lengkapi field yang bertanda *', 'error'); return;
  }
  const id = $('#perawatan-id').value;
  if (id) {
    await window.api.perawatan.update(parseInt(id), data);
    showToast('Perawatan berhasil diperbarui', 'success');
  } else {
    await window.api.perawatan.create(data);
    showToast('Perawatan berhasil ditambahkan', 'success');
  }
  closeModal('modal-perawatan');
  loadPerawatan();
}

async function deletePerawatan(id) {
  if (!confirm('Hapus data perawatan ini?')) return;
  await window.api.perawatan.delete(id);
  showToast('Data perawatan dihapus', 'success');
  loadPerawatan();
}

// ==================== MEDIS ====================
async function loadMedis() {
  const list = await window.api.medis.getAll();
  const tbody = $('#table-medis tbody');
  tbody.innerHTML = list.length
    ? list.map(m => `
        <tr>
          <td>${m.tanggal}</td>
          <td><strong>${m.tag_id}</strong></td>
          <td>${m.nama_sapi}</td>
          <td>${m.dokter || '-'}</td>
          <td>${m.diagnosa}</td>
          <td>${m.tindakan || '-'}</td>
          <td>${m.obat || '-'}</td>
          <td>${formatRupiah(m.biaya)}</td>
          <td>
            <div class="actions-cell">
              <button class="btn btn-primary btn-sm" onclick="editMedis(${m.id})">✏️</button>
              <button class="btn btn-danger btn-sm" onclick="deleteMedis(${m.id})">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('')
    : '<tr><td colspan="9" class="empty-state">Belum ada data medis</td></tr>';
}

function clearMedisForm() {
  $('#form-medis').reset();
  $('#medis-id').value = '';
}

async function openMedisModal(id) {
  clearMedisForm();
  await loadSapiOptions('medis-sapi');
  if (id) {
    const all = await window.api.medis.getAll();
    const m = all.find(x => x.id === id);
    if (m) {
      $('#modal-medis-title').textContent = 'Edit Rekaman Medis';
      $('#medis-id').value = m.id;
      $('#medis-sapi').value = m.sapi_id;
      $('#medis-dokter').value = m.dokter;
      $('#medis-diagnosa').value = m.diagnosa;
      $('#medis-tindakan').value = m.tindakan;
      $('#medis-obat').value = m.obat;
      $('#medis-tgl').value = m.tanggal;
      $('#medis-biaya').value = m.biaya;
    }
  } else {
    $('#modal-medis-title').textContent = 'Tambah Rekaman Medis';
    $('#medis-tgl').value = todayStr();
  }
  openModal('modal-medis');
}

async function editMedis(id) { openMedisModal(id); }

async function saveMedis() {
  const data = {
    sapi_id: parseInt($('#medis-sapi').value),
    dokter: $('#medis-dokter').value.trim(),
    diagnosa: $('#medis-diagnosa').value.trim(),
    tindakan: $('#medis-tindakan').value.trim(),
    obat: $('#medis-obat').value.trim(),
    tanggal: $('#medis-tgl').value,
    biaya: parseFloat($('#medis-biaya').value) || 0
  };
  if (!data.sapi_id || !data.diagnosa || !data.tanggal) {
    showToast('Lengkapi field yang bertanda *', 'error'); return;
  }
  const id = $('#medis-id').value;
  if (id) {
    await window.api.medis.update(parseInt(id), data);
    showToast('Rekaman medis berhasil diperbarui', 'success');
  } else {
    await window.api.medis.create(data);
    showToast('Rekaman medis berhasil ditambahkan', 'success');
  }
  closeModal('modal-medis');
  loadMedis();
}

async function deleteMedis(id) {
  if (!confirm('Hapus rekaman medis ini?')) return;
  await window.api.medis.delete(id);
  showToast('Rekaman medis dihapus', 'success');
  loadMedis();
}

// ==================== PENJUALAN ====================
async function loadPenjualan() {
  const list = await window.api.penjualan.getAll();
  const tbody = $('#table-penjualan tbody');
  tbody.innerHTML = list.length
    ? list.map(p => `
        <tr>
          <td>${p.tanggal_jual}</td>
          <td><strong>${p.tag_id}</strong></td>
          <td>${p.nama_sapi}</td>
          <td>${p.pembeli}</td>
          <td>${formatNumber(p.berat_jual)} kg</td>
          <td>${formatRupiah(p.harga_per_kg)}</td>
          <td><strong>${formatRupiah(p.total_harga)}</strong></td>
          <td>
            <div class="actions-cell">
              <button class="btn btn-danger btn-sm" onclick="deletePenjualan(${p.id})">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('')
    : '<tr><td colspan="8" class="empty-state">Belum ada data penjualan</td></tr>';
}

function hitungTotalJual() {
  const berat = parseFloat($('#penjualan-berat').value) || 0;
  const hargaKg = parseFloat($('#penjualan-harga-kg').value) || 0;
  const total = berat * hargaKg;
  $('#penjualan-total').value = formatRupiah(total);
}

function clearPenjualanForm() {
  $('#form-penjualan').reset();
  $('#penjualan-id').value = '';
  $('#penjualan-total').value = '';
}

async function openPenjualanModal() {
  clearPenjualanForm();
  await loadSapiOptions('penjualan-sapi');
  $('#penjualan-tgl').value = todayStr();
  openModal('modal-penjualan');
}

async function savePenjualan() {
  const data = {
    sapi_id: parseInt($('#penjualan-sapi').value),
    pembeli: $('#penjualan-pembeli').value.trim(),
    tanggal_jual: $('#penjualan-tgl').value,
    berat_jual: parseFloat($('#penjualan-berat').value) || 0,
    harga_per_kg: parseFloat($('#penjualan-harga-kg').value) || 0,
    total_harga: (parseFloat($('#penjualan-berat').value) || 0) * (parseFloat($('#penjualan-harga-kg').value) || 0),
    keterangan: $('#penjualan-ket').value.trim()
  };
  if (!data.sapi_id || !data.pembeli || !data.tanggal_jual || !data.berat_jual || !data.harga_per_kg) {
    showToast('Lengkapi field yang bertanda *', 'error'); return;
  }
  await window.api.penjualan.create(data);
  showToast('Penjualan berhasil dicatat', 'success');
  closeModal('modal-penjualan');
  loadPenjualan();
}

async function deletePenjualan(id) {
  if (!confirm('Hapus catatan penjualan ini? Status sapi akan dikembalikan ke Aktif.')) return;
  await window.api.penjualan.delete(id);
  showToast('Catatan penjualan dihapus', 'success');
  loadPenjualan();
}

// ==================== KEUANGAN / RUGI LABA ====================
async function loadKeuangan() {
  const rekap = await window.api.keuangan.getRekapitulasi();

  $('#keuangan-summary').innerHTML = `
    <div class="keu-box income">
      <div class="keu-label">💰 Total Pemasukan</div>
      <div class="keu-value income-color">${formatRupiah(rekap.pemasukan.total)}</div>
      <div class="keu-detail">Dari penjualan: ${formatRupiah(rekap.pemasukan.penjualan)}</div>
    </div>
    <div class="keu-box expense">
      <div class="keu-label">💸 Total Pengeluaran</div>
      <div class="keu-value expense-color">${formatRupiah(rekap.pengeluaran.total)}</div>
      <div class="keu-detail">
        Pembelian: ${formatRupiah(rekap.pengeluaran.pembelian)}<br>
        Perawatan: ${formatRupiah(rekap.pengeluaran.perawatan)}<br>
        Medis: ${formatRupiah(rekap.pengeluaran.medis)}<br>
        Lainnya: ${formatRupiah(rekap.pengeluaran.lainnya)}
      </div>
    </div>
    <div class="keu-box profit">
      <div class="keu-label">📊 ${rekap.labaRugi >= 0 ? 'Laba Bersih' : 'Rugi Bersih'}</div>
      <div class="keu-value profit-color" style="color:${rekap.labaRugi >= 0 ? 'var(--success)' : 'var(--danger)'}">
        ${formatRupiah(rekap.labaRugi)}
      </div>
    </div>
  `;

  // Load default full list
  loadKeuanganDetail('', '');
}

async function filterKeuangan() {
  const dari = $('#keu-dari').value || '';
  const sampai = $('#keu-sampai').value || '';
  loadKeuanganDetail(dari, sampai);
}

async function loadKeuanganDetail(dari, sampai) {
  let data;
  if (dari && sampai) {
    data = await window.api.keuangan.getLaporan(dari, sampai);
  } else {
    const [jual, raw, med] = await Promise.all([
      window.api.penjualan.getAll(),
      window.api.perawatan.getAll(),
      window.api.medis.getAll()
    ]);
    data = { penjualan: jual, perawatan: raw, medis: med };
  }

  // Penjualan list
  $('#keu-jual-list').innerHTML = data.penjualan.length
    ? data.penjualan.map(p => `
        <div class="list-item">
          <div class="list-item-info">${p.nama_sapi} <span class="list-item-sub">${p.tanggal_jual} · ${p.pembeli}</span></div>
          <div class="list-item-value" style="color:var(--success)">${formatRupiah(p.total_harga)}</div>
        </div>
      `).join('')
    : '<div class="empty-state">Tidak ada data penjualan</div>';

  // Biaya list (perawatan + medis)
  const biayaItems = [
    ...data.perawatan.map(p => ({ tgl: p.tanggal, nama: p.nama_sapi, ket: p.jenis_perawatan, biaya: p.biaya })),
    ...data.medis.map(m => ({ tgl: m.tanggal, nama: m.nama_sapi, ket: `Medis: ${m.diagnosa}`, biaya: m.biaya }))
  ].sort((a, b) => b.tgl.localeCompare(a.tgl));

  $('#keu-biaya-list').innerHTML = biayaItems.length
    ? biayaItems.map(b => `
        <div class="list-item">
          <div class="list-item-info">${b.nama} <span class="list-item-sub">${b.tgl} · ${b.ket}</span></div>
          <div class="list-item-value" style="color:var(--danger)">${formatRupiah(b.biaya)}</div>
        </div>
      `).join('')
    : '<div class="empty-state">Tidak ada biaya</div>';
}

// ==================== CLOCK ====================
function updateClock() {
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  $('#datetime').textContent = now.toLocaleDateString('id-ID', opts);
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 30000);
  loadDashboard();
});
