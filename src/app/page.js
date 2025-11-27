import Link from 'next/link'
import React from 'react'

const Home = () => {
  return (
    <div className='bg-black text-white gap-6 h-screen flex flex-col items-center justify-center'>
      <h1 className=' text-3xl md:text-6xl'>HELLO WHEEL SPIN</h1>
      <button className='py-2 px-4 bg-purple-600 rounded-lg '>
        <Link href="/register">MULAI SPIN GRATIS</Link>
      </button>
    </div>
  )
}

export default Home
