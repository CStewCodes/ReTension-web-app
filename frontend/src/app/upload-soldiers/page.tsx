'use client'

import { useState } from 'react'
import ExcelJS from 'exceljs'

type RawRow = Record<string, string | number | null | undefined>
type NormalizedRow = Record<string, string>

const requiredFields = ['dodid', 'first_name', 'last_name', 'mos', 'component']

export default function UploadSoldiersPage() {
  const [rawHeaders, setRawHeaders] = useState<string[]>([])
  const [rawData, setRawData] = useState<RawRow[]>([])
  const [columnMap, setColumnMap] = useState<Record<string, string>>({})
  const [normalizedData, setNormalizedData] = useState<NormalizedRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const buffer = await file.arrayBuffer()
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buffer)
      const worksheet = workbook.worksheets[0]

      const rows: RawRow[] = []
      let headers: string[] = []

      worksheet.eachRow((row, rowIndex) => {
        const rowValues = row.values as (string | number | undefined | null)[]
        if (rowIndex === 1) {
          headers = rowValues.slice(1).map((cell) => String(cell ?? ''))
          setRawHeaders(headers)
        } else {
          const rowObj: RawRow = {}
          headers.forEach((header, i) => {
            rowObj[header] = rowValues[i + 1] ?? ''
          })
          rows.push(rowObj)
        }
      })

      setRawData(rows)
    } catch (err) {
      console.error(err)
      setError('Failed to read Excel file. Make sure it is a valid .xlsx file.')
    }
  }

  const handleMappingChange = (field: string, value: string) => {
    setColumnMap((prev) => ({ ...prev, [field]: value }))
  }

  const handlePreview = () => {
    const mapped = rawData.map((row) => {
      const mappedRow: NormalizedRow = {}
      for (const key of requiredFields) {
        const sourceKey = columnMap[key]
        mappedRow[key] = sourceKey ? String(row[sourceKey] ?? '') : ''
      }
      return mappedRow
    })
    setNormalizedData(mapped)
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Soldiers (Excel)</h1>

      <input
        type="file"
        accept=".xlsx"
        onChange={handleFile}
        className="mb-4"
      />

      {error && <p className="text-red-500 mb-4">❌ {error}</p>}

      {rawHeaders.length > 0 && (
        <>
          <h2 className="mt-6 text-lg font-semibold">Step 1: Map Your Columns</h2>
          <div className="space-y-4">
            {requiredFields.map((field) => (
              <div key={field} className="flex items-center gap-4">
                <label htmlFor={field} className="w-40 font-medium capitalize">
                  {field}
                </label>
                <select
                  id={field}
                  value={columnMap[field] || ''}
                  onChange={(e) => handleMappingChange(field, e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="">-- Select Column --</option>
                  {rawHeaders.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handlePreview}
          >
            Preview Normalized Rows
          </button>
        </>
      )}

      {normalizedData.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Step 2: Preview Data</h2>
          <pre className="bg-gray-800 p-4 rounded max-h-96 overflow-auto text-sm text-white">
            {JSON.stringify(normalizedData, null, 2)}
          </pre>
        </div>
      )}
    </main>
  )
}