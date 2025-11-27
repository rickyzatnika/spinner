"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";


const EditPrizes = ({ params }) => {

  const router = useRouter();
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);




  useEffect(() => {
    async function getStudentsById() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/prizes/${params._id}`);
      const prize = await res.json();

      setName(prize?.name);
      setWeight(prize?.weight);
      setImage(prize?.image || "");


    }
    getStudentsById();
  }, [params._id]);



  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {

      const body = { name, weight, image };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/prizes/${params._id}`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      console.log("Response data:", data);

      if (res.status === 200) {
        const setTimeoutId = setTimeout(() => {
          toast.success(`${name} berhasil diperbaharui`);
          setLoading(false);
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



  return (
    <>
      <div className=" second dark:bg-slate-800 text-white">
        <h1 className="py-4 px-4">Edit</h1>
      </div>
      <div className="w-full flex gap-4 py-8 px-4 ">
        <div className="flex flex-col w-full ">
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
        {/* {preview &&
          <div className="w-full">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-5">Foto Murid</h3>
            <Image src={preview} alt="foto-murid" width={350} height={350} priority={true} className="object-contain" />
          </div>
        } */}
      </div>
    </>
  );
};

export default EditPrizes;
