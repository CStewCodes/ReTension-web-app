'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Soldier = {
  dodid: string
  first_name?: string
  last_name?: string
  email?: string
  component?: string
  mos?: string
}

export default function SoldiersPage() {
  const [soldiers, setSoldiers] = useState<Soldier[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSoldiers = async () => {
      const { data, error } = await supabase.from('soldiers').select('*')
      if (error) {
        console.error('Fetch error:', error)
        setError(error.message)
      } else {
        setSoldiers(data || [])
      }
    }

    fetchSoldiers()
  }, [])

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">All Soldiers</h1>

      {error && <p className="text-red-500">❌ Error: {error}</p>}

      <table className="w-full border-collapse border border-gray-600 text-white">
        <thead className="bg-gray-800">
          <tr>
            <th className="border px-4 py-2">DODID</th>
            <th className="border px-4 py-2">First Name</th>
            <th className="border px-4 py-2">Last Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Component</th>
            <th className="border px-4 py-2">MOS</th>
          </tr>
        </thead>
        <tbody>
          {soldiers.map((s) => (
            <tr key={s.dodid} className="odd:bg-gray-900 even:bg-gray-800">
              <td className="border px-4 py-2">{s.dodid}</td>
              <td className="border px-4 py-2">{s.first_name}</td>
              <td className="border px-4 py-2">{s.last_name}</td>
              <td className="border px-4 py-2">{s.email}</td>
              <td className="border px-4 py-2">{s.component}</td>
              <td className="border px-4 py-2">{s.mos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}