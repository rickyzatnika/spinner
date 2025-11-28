"use client"

import React, { useEffect, useState } from 'react'
import useSWR, { mutate } from "swr";
import axios from 'axios';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const UserRegistration = () => {

  const fetcher = (url) => fetch(url).then((res) => res.json());
  const router = useRouter();
  // Pagination + data fetch
  const [page, setPage] = useState(1);
  const limit = 10;
  const urlKey = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register?page=${page}&limit=${limit}`;
  const { data, error } = useSWR(urlKey, fetcher);

  useEffect(() => {
    // whenever data changes refresh (SWR will revalidate), keep same behaviour
    mutate(urlKey);
  }, [data]);



  // selection + modal
  const [selected, setSelected] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, ids: [], message: '' });

  useEffect(() => {
    setSelected(new Set());
    setSelectAll(false);
  }, [data]);

  useEffect(() => {
    if (!data?.users) return;
    setSelectAll(selected.size > 0 && selected.size === data.users.length);
  }, [selected, data]);

  const openDeleteSingle = (id) => setConfirmModal({ open: true, ids: [id], message: 'Hapus user ini? Tindakan ini tidak dapat dibatalkan.' });

  const openDeleteMultiple = () => {
    if (!selected || selected.size === 0) return toast.info('Pilih user terlebih dahulu');
    setConfirmModal({ open: true, ids: Array.from(selected), message: `Hapus ${selected.size} user terpilih? Tindakan ini tidak dapat dibatalkan.` });
  };

  // Export columns picker
  const availableColumns = [
    { key: 'name', label: 'Nama' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'code', label: 'Kode' },
    { key: 'isUsed', label: 'Valid' },
    { key: 'spinResult', label: 'Hadiah' },
    { key: 'createdAt', label: 'Waktu' },
  ];

  const [columnsOpen, setColumnsOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(() => {
    try { const raw = localStorage.getItem('export_columns_registrations'); return raw ? JSON.parse(raw) : availableColumns.map(c => c.key); } catch (e) { return availableColumns.map(c => c.key); }
  });

  useEffect(() => {
    try { localStorage.setItem('export_columns_registrations', JSON.stringify(selectedColumns)); } catch (e) { }
  }, [selectedColumns]);

  const toggleColumn = (key) => {
    setSelectedColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return Array.from(next);
    });
  };

  const exportUsingSelected = async (format) => {
    const cols = availableColumns.filter(c => selectedColumns.includes(c.key));
    if (!cols.length) return toast.info('Pilih minimal 1 kolom untuk diexport');

    if (format === 'csv') {
      exportToCSV(data?.users || [], cols, `registrations-page-${page}.csv`);
    } else {
      await exportToPDF(data?.users || [], cols, `registrations-page-${page}.pdf`, `Registrations - page ${page}`);
    }
  };

  const deleteSelected = async (ids) => {
    try {
      // optimistic update: remove items immediately from cache for current page
      mutate(urlKey, (current) => {
        if (!current) return current;
        const removedOnPage = current.users.filter(u => ids.includes(u._id)).length;
        const filtered = current.users.filter(u => !ids.includes(u._id));
        const newTotal = Math.max(0, (current.totalCount || 0) - removedOnPage);
        const newPages = Math.max(1, Math.ceil(newTotal / (current.limit || limit)));
        return { ...current, users: filtered, totalCount: newTotal, totalPages: newPages };
      }, false);

      // call server
      if (ids.length === 1) {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register/${ids[0]}`);
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register/bulk-delete`, { ids });
      }

      toast.success(`${ids.length} user berhasil dihapus`);
      setConfirmModal({ open: false, ids: [], message: '' });

      setSelected(prev => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });

      // revalidate
      mutate(urlKey);
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus user');
      mutate(urlKey);
    }
  };

  return (
    <div className='w-full '>

      <div className="flex items-center justify-between mb-3">
        <h3 className='text-2xl font-semibold '>User Registered</h3>
        <div />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 relative">
            <button onClick={() => setColumnsOpen(v => !v)} className="px-4 py-2 rounded-md border bg-purple-200 border-gray-200 text-sm">Columns</button>
            {columnsOpen && (
              <div className="absolute top-9 left-0 bg-white rounded-md shadow-lg p-3 z-30 w-[260px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">Pilih kolom</div>
                  <button onClick={() => { const all = availableColumns.map(c => c.key); setSelectedColumns(all); }} className="text-xs text-blue-600">Select all</button>
                </div>
                <div className="max-h-48 overflow-auto space-y-2 mb-2">
                  {availableColumns.map((c) => (
                    <label key={c.key} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={selectedColumns.includes(c.key)} onChange={() => toggleColumn(c.key)} className="h-4 w-4" />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setColumnsOpen(false)} className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm">Close</button>
                </div>
              </div>
            )}
            <button onClick={() => exportUsingSelected('csv')} className={`py-2 px-3 text-white rounded-md bg-green-400/90 hover:bg-green-500/90 text-sm`}>Export CSV</button>
            <button onClick={async () => await exportUsingSelected('pdf')} className={`py-2 px-3 text-white bg-red-400/90 hover:bg-red-500/90 rounded-md border border-gray-200 text-sm`}>Export PDF</button>
          </div>
          <div className="text-sm text-muted">{selected.size} terpilih</div>
          <button onClick={openDeleteMultiple} className={`py-2 px-3 rounded-xl text-white ${selected.size ? 'bg-red-400/90 hover:bg-red-500/90' : 'bg-red-300 cursor-not-allowed'}`} disabled={!selected.size}>Delete Selected</button>
        </div>
      </div>

      <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
        <table className="w-full text-sm text-left rtl:text-right text-body">
          <thead className="text-sm bg-purple-200 text-body bg-neutral-secondary-medium border-b border-default-medium">
            <tr>
              <th scope="col" className="px-6 py-3 font-bold w-6 text-center">
                <input aria-label="select all users" className="h-4 w-4 rounded border-gray-300" type="checkbox" checked={selectAll} onChange={(e) => {
                  const checked = e.target.checked;
                  setSelectAll(checked);
                  if (checked) {
                    const allIds = data?.users?.map(u => u._id) || [];
                    setSelected(new Set(allIds));
                  } else {
                    setSelected(new Set());
                  }
                }} />
              </th>
              <th scope="col" className="px-6 py-3 font-bold text-center">No</th>
              <th scope="col" className="px-6 py-3 font-bold">Nama Peserta</th>
              <th scope="col" className="px-6 py-3 font-bold">Email</th>
              <th scope="col" className="px-6 py-3 font-bold">Nomor Handphone</th>
              <th scope="col" className="px-6 py-3 font-bold">Kode Spin</th>
              <th scope="col" className="px-6 py-3 font-bold">Valid</th>
              <th scope="col" className="px-6 py-3 font-bold">Hadiah</th>
              <th scope="col" className="px-6 py-3 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.users?.length > 0 ? (
              data.users.map((user, idx) => (
                <tr key={user._id} className="bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium">
                  <td className="px-6 py-4">
                    <input aria-label={`select user ${user._id}`} className="h-4 w-4 rounded border-gray-300" type="checkbox" checked={selected.has(user._id)} onChange={(e) => {
                      const next = new Set(selected);
                      if (e.target.checked) next.add(user._id); else next.delete(user._id);
                      setSelected(next);
                    }} />
                  </td>
                  <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap text-center">
                    {(page - 1) * limit + idx + 1}
                  </th>
                  <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                    {user.name}
                  </th>
                  <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                    {user.email}
                  </th>
                  <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                    {user.phone}
                  </th>
                  <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                    {user.code}
                  </th>
                  <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                    {user.isUsed ? "Sudah" : "Belum"}
                  </th>
                  <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap text-center">
                    {user.spinResult ? user.spinResult : "-"}
                  </th>
                  <td onClick={() => router.push(`/admin/registrasions/${user._id}`)} className="px-6 py-4 cursor-pointer text-center group  bg-green-400/80 hover:bg-green-500/80 ">
                    <Link href={`/admin/registrasions/${user._id}`} className="font-medium text-black/60 group-hover:text-black/80 text-md text-center group-hover:underline">Edit</Link> 
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-sm text-muted">Tidak ada user</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination controls */}
      {data?.totalCount > limit && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted">Menampilkan halaman {data?.page} dari {data?.totalPages} — total {data?.totalCount} User</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className={`px-3 py-1 rounded-md ${page <= 1 ? 'bg-gray-200 text-muted' : 'bg-white/90 hover:bg-white'}`}>Prev</button>
            {/* simple numeric pages */}
            {Array.from({ length: data.totalPages }).map((_, idx) => (
              <button key={idx} onClick={() => setPage(idx + 1)} className={`px-3 py-1 rounded-md ${page === idx + 1 ? 'bg-purple-500 text-white' : 'bg-white/90 hover:bg-white'}`}>{idx + 1}</button>
            ))}
            <button onClick={() => setPage(Math.min(data.totalPages, page + 1))} disabled={page >= data.totalPages} className={`px-3 py-1 rounded-md ${page >= data.totalPages ? 'bg-gray-200 text-muted' : 'bg-white/90 hover:bg-white'}`}>Next</button>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-bold mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray-700 mb-4">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmModal({ open: false, ids: [], message: '' })} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Batal</button>
              <button onClick={() => deleteSelected(confirmModal.ids)} className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600">Hapus</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default UserRegistration
