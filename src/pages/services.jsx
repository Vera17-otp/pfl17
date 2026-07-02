import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  FaTags, FaPlus, FaEdit, FaTrash, FaCheckCircle, 
  FaTimesCircle, FaSearch, FaFilter, FaToggleOn, FaToggleOff
} from 'react-icons/fa';

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(val || 0);
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua Kategori');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      showToast('Gagal memuat data layanan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const categories = useMemo(() => {
    const cats = services.map(s => s.category);
    return ['Semua Kategori', ...new Set(cats)];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterCategory !== 'Semua Kategori' && s.category !== filterCategory) return false;
      return true;
    });
  }, [services, searchQuery, filterCategory]);

  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setFormName('');
    setFormDesc('');
    setFormPrice('');
    setFormCategory('General');
    setFormIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (service) => {
    setModalMode('edit');
    setEditingId(service.id);
    setFormName(service.name);
    setFormDesc(service.description || '');
    setFormPrice(service.price.toString());
    setFormCategory(service.category);
    setFormIsActive(service.is_active);
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice || !formCategory.trim()) {
      alert('Nama, Kategori, dan Harga wajib diisi!');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      alert('Harga harus berupa angka positif!');
      return;
    }

    const payload = {
      name: formName.trim(),
      description: formDesc.trim(),
      price: priceNum,
      category: formCategory.trim(),
      is_active: formIsActive
    };

    try {
      if (modalMode === 'add') {
        const { data, error } = await supabase.from('services').insert([payload]).select().single();
        if (error) throw error;
        setServices(prev => [...prev, data]);
        showToast(`Layanan ${data.name} ditambahkan!`);
      } else {
        const { error } = await supabase.from('services').update(payload).eq('id', editingId);
        if (error) throw error;
        setServices(prev => prev.map(s => s.id === editingId ? { ...s, ...payload } : s));
        showToast('Perubahan disimpan!');
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan layanan: ' + err.message);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase.from('services').update({ is_active: !currentStatus }).eq('id', id);
      if (error) throw error;
      setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
      showToast('Status layanan diperbarui!');
    } catch (err) {
      console.error(err);
      showToast('Gagal merubah status.');
    }
  };

  const deleteService = async (id, name) => {
    if (!window.confirm(`Yakin ingin MENGHAPUS layanan ${name} secara permanen?\n\nTip: Lebih baik nonaktifkan layanan jika pernah digunakan di riwayat reservasi.`)) return;
    
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) {
        if (error.code === '23503') { // foreign key violation
          alert('Tidak bisa dihapus karena layanan ini sudah pernah digunakan di riwayat reservasi. Silakan nonaktifkan saja layanan ini.');
          return;
        }
        throw error;
      }
      setServices(prev => prev.filter(s => s.id !== id));
      showToast('Layanan dihapus!');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#10B981', color: '#FFF', padding: '12px 20px', borderRadius: '8px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaCheckCircle /> <span style={{ fontWeight: 600 }}>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaTags style={{ color: 'var(--primary-color)' }} /> Manajemen Layanan Tambahan
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Kelola katalog layanan ekstra hotel (Laundry, Spa, F&B) yang dapat ditambahkan ke reservasi tamu.
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaPlus /> Tambah Layanan
        </button>
      </div>

      {/* Filter */}
      <div className="table-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama layanan..."
              style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }}
            />
          </div>
          <div style={{ width: '200px' }}>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }}>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat data...</div>
        ) : filteredServices.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada layanan yang sesuai kriteria.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>NAMA LAYANAN</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>KATEGORI</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>HARGA</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>STATUS</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(svc => (
                <tr key={svc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{svc.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{svc.description}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--primary-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {svc.category}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{formatRupiah(svc.price)}</td>
                  <td style={{ padding: '16px' }}>
                    <button 
                      onClick={() => toggleStatus(svc.id, svc.is_active)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: svc.is_active ? '#10B981' : '#64748B' }}
                    >
                      {svc.is_active ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{svc.is_active ? 'Aktif' : 'Nonaktif'}</span>
                    </button>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '10px' }}>
                      <button onClick={() => openEditModal(svc)} style={{ color: 'var(--primary-color)', background: 'rgba(37,99,235,0.1)', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }} title="Edit"><FaEdit /></button>
                      <button onClick={() => deleteService(svc.id, svc.name)} style={{ color: 'var(--danger-color)', background: 'rgba(239,68,68,0.1)', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }} title="Hapus Permanen"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="table-card" style={{ width: '100%', maxWidth: '500px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><FaTimesCircle size={24} /></button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--text-main)' }}>
              {modalMode === 'add' ? 'Tambah Layanan Baru' : 'Edit Layanan'}
            </h2>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Nama Layanan *</label>
                <input required type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Contoh: Breakfast (Per Pax)"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Kategori *</label>
                <input required type="text" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} placeholder="Contoh: F&B, Spa, Transport"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Harga (Rp) *</label>
                <input required type="number" min="0" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="Contoh: 150000"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>Deskripsi</label>
                <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Penjelasan singkat..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'vertical', minHeight: '80px' }} />
              </div>
              
              {modalMode === 'add' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" id="isActive" checked={formIsActive} onChange={(e) => setFormIsActive(e.target.checked)} />
                  <label htmlFor="isActive" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Langsung aktifkan layanan ini?</label>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Batal</button>
                <button type="submit" className="btn-primary" style={{ padding: '10px 16px' }}>Simpan Layanan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
