import React, { useEffect, useState } from 'react';
import visitorService from '../../services/visitorService';

const ReceptionistVisitorPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await visitorService.getAll({ page: 1 });
        setVisitors(response.data?.data || []);
      } catch (err) {
        setError('Gagal memuat data tamu.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Data Tamu</h1>
        <p className="mt-2 text-sm text-gray-600">Lihat daftar tamu yang bisa dipakai untuk kegiatan check-in harian.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Daftar Tamu</h2>
        </div>
        {loading ? (
          <div className="p-5 text-sm text-gray-500">Memuat daftar tamu...</div>
        ) : error ? (
          <div className="p-5 text-sm text-red-600">{error}</div>
        ) : visitors.length === 0 ? (
          <div className="p-5 text-sm text-gray-500">Belum ada data tamu.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {visitors.map((visitor) => (
              <div key={visitor.id} className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{visitor.name}</p>
                  <p className="text-sm text-gray-500">{visitor.company || '—'} · {visitor.email || '—'}</p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{visitor.face_embedding ? 'Terdaftar' : 'Baru'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceptionistVisitorPage;
