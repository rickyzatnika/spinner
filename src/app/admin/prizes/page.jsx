"use client"

import React, { useEffect, useState } from 'react'
import useSWR, { mutate } from "swr";
import axios from 'axios';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Prizes = () => {

  const router = useRouter();
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);


  const fetcher = (url) => fetch(url).then((res) => res.json());

  // Penggunaan SWR untuk mengambil data dengan mem-passing URL ke dalam useSWR hook
  const { data, error } = useSWR(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/prizes`, fetcher);

  useEffect(() => {

  }, [data]);



  // Delete Client

  const deletePrize = async (id) => {
    await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/prizes/${id}`);

    mutate(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/prizes`);
    toast.success("Hadiah berhasil dihapus");

  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {

      const body = { name, weight, image };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/prizes`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      console.log("Response data:", data);

      if (res.status === 200) {
        const setTimeoutId = setTimeout(() => {
          toast.success(`${name} berhasil ditambahkan`);
          setLoading(false);
          setModalOpen(false);
          mutate(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/prizes`);

          //reset form
          setName("");
          setWeight("");
          setImage("");

          router.push(`/admin/prizes`);
        }, 3000);

        return () => clearTimeout(setTimeoutId);
      } else {
        toast.error(data.message);
        setLoading(false);
      }

    } catch (error) {
      toast.error("Ups something went wrong", error);
      setLoading(false);
    }
  };


  const modalToggle = () => {
    setModalOpen(!modalOpen);
  }


  return (
    <div className='w-full relative'>
      {/* Modal Button */}
      <button onClick={modalToggle} className="mb-3 bg-pink-600 text-white p-4 rounded-md shadow-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">Tambahkan Hadiah</button>
      <div class="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
        <table class="w-full text-sm text-left rtl:text-right text-body">
          <thead class="text-sm bg-purple-200 text-body bg-neutral-secondary-medium border-b border-default-medium">
            <tr>
              <th scope="col" class="px-6 py-3 font-bold">
                Nama Produk
              </th>
              <th scope="col" class="px-6 py-3 font-bold">
                Stok
              </th>
              <th scope="col" class="px-6 py-3 font-bold">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.prizes?.map((prize) => (
              <tr key={prize._id} class="bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium">
                <th scope="row" class="px-6 py-4 font-medium text-heading whitespace-nowrap">
                  {prize.name}
                </th>
                <th scope="row" class="px-6 py-4 font-medium text-heading whitespace-nowrap">
                  {prize.weight}
                </th>
                <td class="px-6 py-4 text-right flex items-center gap-6">
                  <Link href={`/admin/prizes/${prize._id}`} class="font-medium text-fg-brand hover:underline">Edit</Link>
                  <button className='py-1.5 px-3 bg-red-400 text-white rounded-xl hover:bg-red-600 ' onClick={() => deletePrize(prize._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <div className="absolute flex-col w-4/6  mx-auto top-0 bottom-0 left-0  bg-pink-300/60 h-[600px] items-center justify-center z-50 p-14 rounded-3xl shadow-lg backdrop-blur-md">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nama</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-lime-500 focus:border-lime-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white " />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Weight</label>
              <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-lime-500 focus:border-lime-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white " />
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Image</label>
              <input type="text" value={image} onChange={(e) => setImage(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-lime-500 focus:border-lime-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white " />
            </div>
            <button type="submit" className="text-white bg-gradient-to-tr from-purple-400 to-pink-500 hover:bg-gradient-to-tl hover:from-pink-400 hover:to-pink-500 focus:ring-4 focus:outline-none  font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ">
              {loading ? <div className="flex gap-2 items-center justify-center">
                <span className=" text-white">Loading... </span>
                <span className="loader"></span>
              </div> : "Simpan"}
            </button>
          </form>
        </div>
      )}


    </div>
  )
}

export default Prizes
