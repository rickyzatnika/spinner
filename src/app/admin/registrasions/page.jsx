"use client"

import React, { useEffect } from 'react'
import useSWR, { mutate } from "swr";
import axios from 'axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

const UserRegistration = () => {

  const fetcher = (url) => fetch(url).then((res) => res.json());

  // Penggunaan SWR untuk mengambil data dengan mem-passing URL ke dalam useSWR hook
  const { data, error } = useSWR(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`, fetcher);

  useEffect(() => {

    //refresh data setiap ada perubahan pada data
    mutate(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`);


  }, [data]);



  const deleteUser = async (id) => {
    await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register/${id}`);

    mutate(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`);
    toast.success("User berhasil dihapus");

  };

  return (
    <div className='w-full '>


      <div class="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
        <table class="w-full text-sm text-left rtl:text-right text-body">
          <thead class="text-sm bg-pink-200 text-body bg-neutral-secondary-medium border-b border-default-medium">
            <tr>
              <th scope="col" class="px-6 py-3 font-bold">
                Nama Peserta
              </th>
              <th scope="col" class="px-6 py-3 font-bold">
                Email
              </th>
              <th scope="col" class="px-6 py-3 font-bold">
                Nomor Handphone
              </th>
              <th scope="col" class="px-6 py-3 font-bold">
                Kode Spin
              </th>
              <th scope="col" class="px-6 py-3 font-bold">
                Valid
              </th>
              <th scope="col" class="px-6 py-3 font-bold">
                Hadiah
              </th>
              <th scope="col" class="px-6 py-3 font-bold">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.users?.map((user) => (
              <tr key={user._id} class="bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium">
                <th scope="row" class="px-6 py-4 font-medium text-heading whitespace-nowrap">
                  {user.name}
                </th>
                <th scope="row" class="px-6 py-4 font-medium text-heading whitespace-nowrap">
                  {user.email}
                </th>
                <th scope="row" class="px-6 py-4 font-medium text-heading whitespace-nowrap">
                  {user.phone}
                </th>
                <th scope="row" class="px-6 py-4 font-medium text-heading whitespace-nowrap">
                  {user.code}
                </th>
                <th scope="row" class="px-6 py-4 font-medium text-heading whitespace-nowrap">
                  {user.isUsed ? "Sudah" : "Belum"}
                </th>
                <th scope="row" class="px-6 py-4 font-medium text-heading whitespace-nowrap">
                  {user.spinResult ? user.spinResult : "-"}
                </th>
                <td class="px-6 py-4 text-right flex items-center gap-6">
                  <Link href={`/admin/registrasions/${user._id}`} class="font-medium text-fg-brand hover:underline">Edit</Link>
                  <button className='py-1.5 px-3 bg-red-400 text-white rounded-xl hover:bg-red-600 ' onClick={() => deleteUser(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default UserRegistration
