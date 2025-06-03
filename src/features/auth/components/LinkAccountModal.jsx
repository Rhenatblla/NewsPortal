import React, { useState } from 'react';

const LinkAccountModal = ({ email, onLink, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onLink(password);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>Link Akun</h2>
        <p>Akun dengan email <b>{email}</b> sudah ada. Masukkan password untuk menghubungkan akun Google.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{width: '100%', padding: '8px', marginTop: '10px'}}
          />
          {error && <div style={{color: 'red', marginTop: '8px'}}>{error}</div>}
          <div style={{marginTop: '15px', display: 'flex', justifyContent: 'space-between'}}>
            <button type="submit" disabled={loading} style={{padding: '8px 12px'}}>
              {loading ? 'Menghubungkan...' : 'Hubungkan'}
            </button>
            <button type="button" onClick={onCancel} disabled={loading} style={{padding: '8px 12px'}}>
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  justifyContent: 'center', alignItems: 'center', zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: '#fff', padding: 20, borderRadius: 8,
  maxWidth: 400, width: '90%',
};

export default LinkAccountModal;
