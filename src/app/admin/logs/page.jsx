"use client"

import React, { useState, useEffect } from 'react'
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import { exportToCSV, exportToPDF } from '@/lib/export';
import { toast } from 'react-toastify';

const Logs = () => {
    const fetcher = (url) => fetch(url).then((res) => res.json());

    const [page, setPage] = useState(1);
    const limit = 10; // items per page

    const urlKey = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logs?page=${page}&limit=${limit}`;
    const { data, error } = useSWR(urlKey, fetcher);

        const [selected, setSelected] = useState(new Set());
        const [selectAll, setSelectAll] = useState(false);
        const [confirmModal, setConfirmModal] = useState({ open: false, ids: [], message: '' });

        useEffect(() => {
            // when data changes, reset selection
            setSelected(new Set());
            setSelectAll(false);
        }, [data]);

        // keep selectAll in sync if user manually toggles individual checkboxes
        useEffect(() => {
            if (!data?.logs) return;
            setSelectAll(selected.size > 0 && selected.size === data.logs.length);
        }, [selected, data]);

        const openDeleteSingle = (id) => {
            setConfirmModal({ open: true, ids: [id], message: 'Hapus log ini? Tindakan ini tidak dapat dibatalkan.' });
        };

        const openDeleteMultiple = () => {
            if (!selected || selected.size === 0) {
                toast.info('Pilih log terlebih dahulu');
                return;
            }
            setConfirmModal({ open: true, ids: Array.from(selected), message: `Hapus ${selected.size} log terpilih? Tindakan ini tidak dapat dibatalkan.` });
        };

        const deleteSelected = async (ids) => {
                // optimistic update: remove items locally first so UI updates immediately
                try {
                    mutate(urlKey, (current) => {
                        if (!current) return current;
                        const removedOnPage = current.logs.filter(l => ids.includes(l._id)).length;
                        const newLogs = current.logs.filter(l => !ids.includes(l._id));
                        const newTotalCount = Math.max(0, (current.totalCount || 0) - removedOnPage);
                        const newTotalPages = Math.max(1, Math.ceil(newTotalCount / (current.limit || limit)));
                        return { ...current, logs: newLogs, totalCount: newTotalCount, totalPages: newTotalPages };
                    }, false);

                    // remove from selection locally
                    setSelected(prev => {
                        const next = new Set(prev);
                        ids.forEach(id => next.delete(id));
                        return next;
                    });

                    // call server
                    if (ids.length === 1) {
                        await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logs/${ids[0]}`);
                    } else {
                        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logs/bulk-delete`, { ids });
                    }

                    toast.success(`${ids.length} log berhasil dihapus`);
                    setConfirmModal({ open: false, ids: [], message: '' });

                    // revalidate with server to ensure everything's in sync
                    mutate(urlKey);
                } catch (err) {
                    console.error(err);
                    toast.error('Gagal menghapus log');
                    // refresh to revert optimistic update if something failed
                    mutate(urlKey);
                }
            };

            // Export column picker
            const availableColumns = [
                { key: 'code', label: 'Kode' },
                { key: 'user.name', label: 'Nama' },
                { key: 'user.phone', label: 'Phone' },
                { key: 'prize', label: 'Prize' },
                { key: 'createdAt', label: 'Waktu' },
            ];

            const [columnsOpen, setColumnsOpen] = useState(false);
            const [selectedColumns, setSelectedColumns] = useState(() => {
                try {
                    const raw = localStorage.getItem('export_columns_logs');
                    return raw ? JSON.parse(raw) : availableColumns.map(c => c.key);
                } catch (e) { return availableColumns.map(c => c.key); }
            });

            useEffect(() => {
                try { localStorage.setItem('export_columns_logs', JSON.stringify(selectedColumns)); } catch (e) {}
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
                    exportToCSV(data?.logs || [], cols, `logs-page-${page}.csv`);
                } else {
                    await exportToPDF(data?.logs || [], cols, `logs-page-${page}.pdf`, `Logs - page ${page}`);
                }
            };

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div />
                        <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 relative">
                                            <button onClick={() => setColumnsOpen(v => !v)} className="px-3 py-1 rounded-md border border-gray-200 text-sm">Columns</button>
                                            {columnsOpen && (
                                                <div className="absolute top-9 left-0 bg-white rounded-md shadow-lg p-3 z-30 w-[260px]">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-sm font-semibold">Pilih kolom</div>
                                                        <button onClick={() => {
                                                            const all = availableColumns.map(c => c.key);
                                                            setSelectedColumns(all);
                                                        }} className="text-xs text-blue-600">Select all</button>
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
                                            <button onClick={() => exportUsingSelected('csv')} className={`py-2 px-3 rounded-md bg-white/90 hover:bg-white text-sm`}>Export CSV</button>
                                            <button onClick={async () => await exportUsingSelected('pdf')} className={`py-2 px-3 rounded-md border border-gray-200 text-sm`}>Export PDF</button>
                                        </div>
                                        <div className="text-sm text-muted">{selected.size} terpilih</div>
                                        <button onClick={openDeleteMultiple} className={`py-2 px-3 rounded-xl text-white ${selected.size ? 'bg-red-500 hover:bg-red-600' : 'bg-red-300 cursor-not-allowed'}`} disabled={!selected.size}>Delete Selected</button>
                                </div>
            </div>

            <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
                <table className="w-full text-sm text-left text-body">
                    <thead className="text-sm bg-purple-200 text-body bg-neutral-secondary-medium border-b border-default-medium">
                        <tr>
                            <th className="px-6 py-3 font-bold w-6 text-center">
                                <input aria-label="select all logs" className="h-4 w-4 rounded border-gray-300" type="checkbox" checked={selectAll} onChange={(e) => {
                                    const checked = e.target.checked;
                                    setSelectAll(checked);
                                    if (checked) {
                                        const allIds = data?.logs?.map(l => l._id) || [];
                                        setSelected(new Set(allIds));
                                    } else {
                                        setSelected(new Set());
                                    }
                                }} />
                            </th>
                            <th className="px-6 py-3 font-bold">No</th>
                            <th className="px-6 py-3 font-bold">Kode</th>
                            <th className="px-6 py-3 font-bold">Nama</th>
                            <th className="px-6 py-3 font-bold">Phone</th>
                            <th className="px-6 py-3 font-bold">Prize</th>
                            <th className="px-6 py-3 font-bold">Waktu</th>
                            <th className="px-6 py-3 font-bold">Action</th>
                        </tr>
                    </thead>
                      <tbody>
                        {data?.logs?.length > 0 ? (
                            data.logs.map((l, i) => (
                                <tr key={l._id} className="bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium">
                                    <td className="px-6 py-4">
                                        <input aria-label={`select log ${l._id}`} className="h-4 w-4 rounded border-gray-300" type="checkbox" checked={selected.has(l._id)} onChange={(e) => {
                                            const next = new Set(selected);
                                            if (e.target.checked) next.add(l._id); else next.delete(l._id);
                                            setSelected(next);
                                        }} />
                                    </td>
                                    <td className="px-6 py-4">{i + 1}</td>
                                    <td className="px-6 py-4 font-medium">{l.code || '-'}</td>
                                    <td className="px-6 py-4">{l.user?.name || '-'}</td>
                                    <td className="px-6 py-4">{l.user?.phone || '-'}</td>
                                    <td className="px-6 py-4">{l.prize || '-'}</td>
                                      <td className="px-6 py-4">{new Date(l.createdAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right flex items-center gap-6">
                                        <button onClick={() => openDeleteSingle(l._id)} className="py-1.5 px-3 bg-red-500 text-white rounded-xl hover:bg-red-600">Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-sm text-muted">Tidak ada log</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

                        {/* Pagination controls */}
                        {data?.totalCount > limit && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted">Menampilkan halaman {data?.page} dari {data?.totalPages} — total {data?.totalCount} log</div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className={`px-3 py-1 rounded-md ${page <=1 ? 'bg-gray-200 text-muted' : 'bg-white/90 hover:bg-white'}`}>Prev</button>
                                    {/* simple numeric pages */}
                                    {Array.from({ length: data.totalPages }).map((_, idx) => (
                                        <button key={idx} onClick={() => setPage(idx+1)} className={`px-3 py-1 rounded-md ${page === idx+1 ? 'bg-purple-500 text-white' : 'bg-white/90 hover:bg-white'}`}>{idx+1}</button>
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
    );
};

export default Logs
