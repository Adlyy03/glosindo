import React from 'react';

const VisitorTable = ({ visitors, loading, onEdit, onDelete, isAdmin }) => {
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Memuat data tamu...</p>
      </div>
    );
  }

  if (!visitors || visitors.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium text-sm">Belum ada data tamu</p>
        <p className="text-gray-400 text-xs mt-1">Data tamu yang terdaftar akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 text-gray-500 font-semibold text-xs uppercase tracking-wider">
            <th className="px-5 py-3.5">Nama & Profil</th>
            <th className="px-5 py-3.5 hidden md:table-cell">Kontak</th>
            <th className="px-5 py-3.5 hidden lg:table-cell">Instansi / Perusahaan</th>
            <th className="px-5 py-3.5 text-center">Biometrik Wajah</th>
            <th className="px-5 py-3.5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {visitors.map((visitor) => (
            <tr key={visitor.id} className="hover:bg-blue-50/30 transition-colors group">
              {/* Visitor Name & Avatar */}
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  {visitor.photo ? (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${visitor.photo}`}
                      alt={visitor.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-xs flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0 ${
                      visitor.photo ? 'hidden' : 'flex'
                    }`}
                  >
                    {visitor.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{visitor.name}</p>
                    <p className="text-xs text-gray-400 md:hidden">{visitor.company || visitor.phone || visitor.email || 'Tanpa instansi'}</p>
                  </div>
                </div>
              </td>

              {/* Contact */}
              <td className="px-5 py-3.5 text-gray-600 hidden md:table-cell">
                <p className="font-medium text-gray-800">{visitor.phone || '—'}</p>
                <p className="text-xs text-gray-400 truncate max-w-[180px]">{visitor.email || '—'}</p>
              </td>

              {/* Company */}
              <td className="px-5 py-3.5 text-gray-700 hidden lg:table-cell">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium text-xs">
                  {visitor.company || 'Pribadi'}
                </span>
              </td>

              {/* Face Biometric Status */}
              <td className="px-5 py-3.5 text-center">
                {visitor.face_embedding ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Terdaftar
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-400 font-medium text-xs">
                    Belum Ada Wajah
                  </span>
                )}
              </td>

              {/* Actions */}
              <td className="px-5 py-3.5 text-right">
                <div className="flex items-center justify-end gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(visitor)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit Tamu"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}

                  {isAdmin && onDelete && (
                    <button
                      onClick={() => onDelete(visitor)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Hapus Tamu"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VisitorTable;
