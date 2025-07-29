'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
const { data, error } = await supabase.from('soldiers').select('*')

export default function Home() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await supabase.from('soldiers').select('*')
      if (error) console.error('Supabase error:', error)
      else setData(data)
    }

    loadData()
  }, [])

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">IRR Prospecting Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  )
}