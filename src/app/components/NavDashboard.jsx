"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaAddressCard } from "react-icons/fa";
import { FiGift } from "react-icons/fi";
import { RiFileHistoryLine } from "react-icons/ri";


const links = [
  {
    id: "1",
    title: "Users",
    url: "/admin/registrasions",
    icon: <FaAddressCard />
  },
  {
    id: "2",
    title: "Hadiah",
    url: "/admin/prizes",
    icon: <FiGift />
  },
  {
    id: "3",
    title: "Logs",
    url: "/admin/logs",
    icon: <RiFileHistoryLine />
  },
];

const NavDashboard = () => {
  const pathname = usePathname();

  return (
    <div className="col-span-1 lg:col-span-2 flex flex-col items-start gap-8 w-full h-full bg-purple-500 text-zinc-100 px-4 py-14">
      <h1 className="font-bold text-xl">LUCKY DASHBOARD</h1>
      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-4 px-4 text-lg text-gray-50"></div>
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.url}
              className={`px-2 py-3 rounded flex gap-2 items-center transition ${
                pathname === link.url
                  ? "bg-white text-purple-600 font-bold"
                  : "hover:bg-purple-600"
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.title}</span>
              
            </Link>
          ))}
        </div>
      </div>
    
  )
};

export default NavDashboard;
