'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AddSoldierPage() {
  const [formData, setFormData] = useState({
    dodid: '',
    first_name: '',
    last_name: '',
    email: '',
    component: '',
    mos: '',
  })

  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    const { error } = await supabase.from('soldiers').insert([formData])

    if (error) {
      console.error('Error inserting:', JSON.stringify(error, null, 2))
      setMessage('❌ Error: ' + error?.message || 'Unknown error')
    } else {
      setMessage('✅ Soldier added successfully!')
      setFormData({
        dodid: '',
        first_name: '',
        last_name: '',
        email: '',
        component: '',
        mos: '',
      })
    }
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Soldier</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { name: 'dodid', label: 'DODID (10-digit ID)' },
          { name: 'first_name', label: 'First Name' },
          { name: 'last_name', label: 'Last Name' },
          { name: 'email', label: 'Email' },
          { name: 'component', label: 'Component (e.g. IRR)' },
          { name: 'mos', label: 'MOS (e.g. 25S)' },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-200">
              {field.label}
            </label>
            <input
              required={field.name === 'dodid'}
              type="text"
              name={field.name}
              value={formData[field.name as keyof typeof formData]}
              onChange={handleChange}
              className="mt-1 w-full p-2 rounded border border-gray-600 bg-gray-800 text-white"
            />
          </div>
        ))}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </main>
  )
}