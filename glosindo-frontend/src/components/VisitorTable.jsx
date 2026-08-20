import React from 'react';
import { User, Edit2, Trash2, CheckCircle2, UserX, CalendarRange, Building2, Briefcase } from 'lucide-react';
import Badge from './ui/Badge';

const VisitorTable = ({ visitors, loading, onEdit, onDelete, isAdmin }) => {
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-xs font-semibold">Memuat direktori tamu...</p>
      </div>
    );
  }

  if (!visitors || visitors.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-200">
          <UserX className="w-6 h-6" />
        </div>
        <p className="text-slate-700 font-bold text-sm">Belum Ada Data Tamu</p>
        <p className="text-slate-400 text-xs mt-1">Data tamu yang terdaftar di sistem akan ditampilkan di sini.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
            <th className="px-5 py-3.5">Nama & Profil</th>
            <th className="px-5 py-3.5 hidden md:table-cell">Kontak</th>
            <th className="px-5 py-3.5 hidden lg:table-cell">Instansi / Perusahaan</th>
            <th className="px-5 py-3.5 text-center">Kategori Tamu</th>
            <th className="px-5 py-3.5 text-center">Biometrik Wajah</th>
            <th className="px-5 py-3.5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {visitors.map((visitor) => {
            const hasEvent =
              (visitor.event_participants && visitor.event_participants.length > 0) ||
              visitor.latest_visit?.event ||
              (visitor.visits && visitor.visits.some((v) => v.event_id));

            const latestEventName =
              visitor.event_participants?.[0]?.event?.name ||
              visitor.latest_visit?.event?.name;

            return (
              <tr key={visitor.id} className="hover:bg-slate-50/80 transition-colors group">
                {/* Visitor Name & Avatar */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {visitor.photo ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${visitor.photo}`}
                        alt={visitor.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-10 h-10 rounded-xl bg-brand-navy text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0 ${
                        visitor.photo ? 'hidden' : 'flex'
                      }`}
                    >
                      {visitor.name?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 group-hover:text-brand-navy transition-colors truncate">
                        {visitor.name}
                      </p>
                      {visitor.position && (
                        <p className="text-[11px] text-slate-400 font-medium truncate">
                          {visitor.position}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 md:hidden truncate">
                        {visitor.company || visitor.phone || visitor.email || 'Tanpa instansi'}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-5 py-3.5 text-slate-600 hidden md:table-cell">
                  <p className="font-semibold text-slate-800">{visitor.phone || '—'}</p>
                  <p className="text-xs text-slate-400 truncate max-w-[180px]">{visitor.email || '—'}</p>
                </td>

                {/* Company */}
                <td className="px-5 py-3.5 text-slate-700 hidden lg:table-cell">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
                    {visitor.company || 'Pribadi'}
                  </span>
                </td>

                {/* Visitor Category (Tamu Biasa / Tamu Event) */}
                <td className="px-5 py-3.5 text-center whitespace-nowrap">
                  {hasEvent ? (
                    <div className="inline-flex flex-col items-center gap-0.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                        <CalendarRange className="w-3 h-3 text-cyan-600" />
                        Tamu Event
                      </span>
                      {latestEventName && (
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]" title={latestEventName}>
                          {latestEventName}
                        </span>
                      )}
                    </div>
                  ) : (
                    <Badge variant="neutral">Tamu Biasa</Badge>
                  )}
                </td>

                {/* Face Biometric Status */}
                <td className="px-5 py-3.5 text-center">
                  {visitor.face_embedding ? (
                    <Badge variant="emerald" dot>
                      Terdaftar
                    </Badge>
                  ) : (
                    <Badge variant="neutral">
                      Belum Wajah
                    </Badge>
                  )}
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(visitor)}
                        className="p-2 rounded-xl text-brand-navy hover:bg-brand-navy/10 transition-colors"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {isAdmin && onDelete && (
                      <button
                        onClick={() => onDelete(visitor)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Data"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default VisitorTable;
