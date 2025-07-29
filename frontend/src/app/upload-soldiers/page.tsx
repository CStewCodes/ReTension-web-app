'use client'

import { useState } from 'react'
import ExcelJS from 'exceljs'

// Raw rows use the headers from the Excel file. Values may be strings,
// numbers, null or undefined while the sheet is being parsed.
type RawRow = Record<string, string | number | null | undefined>

// Define the fields required for a soldier record. Casting to const
// preserves the literal string union for the RequiredField type.
const requiredFields = ['dodid', 'first_name', 'last_name', 'mos', 'component'] as const

// A union type representing each required field name.
type RequiredField = (typeof requiredFields)[number]

// A normalized row contains only the required fields, each as a string.
type NormalizedRow = Record<RequiredField, string>

// A minimal interface for rows returned by ExcelJS. We only care about the `values` property.
interface ExcelRowValues {
  values: (string | number | undefined | null)[]
  // ExcelJS Row type also has a `getCell` method, which we need to satisfy the Row type
  getCell: (column: string | number) => { value: string | number | undefined | null }
}

export default function UploadSoldiersPage() {
  // State to store the headers from the uploaded Excel sheet
  const [rawHeaders, setRawHeaders] = useState<string[]>([])

  // Holds all the parsed rows from the Excel sheet using the raw header names
  const [rawData, setRawData] = useState<RawRow[]>([])

  // Maps our required field names to the column names in the spreadsheet
  const [columnMap, setColumnMap] = useState<Record<RequiredField, string>>(
    {} as Record<RequiredField, string>
  )

  // Stores the normalized rows ready for preview or upload
  const [normalizedData, setNormalizedData] = useState<NormalizedRow[]>([])

  // Error message (if any) from loading the file
  const [error, setError] = useState<string | null>(null)

  /**
   * Handle an Excel file upload. Reads the first worksheet and captures
   * headers and rows. If an error occurs, the message is stored in state.
   */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    setError(null)
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Read the file into an ArrayBuffer, then load it into ExcelJS
      const buffer: ArrayBuffer = await file.arrayBuffer()
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buffer)
      const worksheet = workbook.worksheets[0]

      const rows: RawRow[] = []
      let headers: string[] = []

      // Provide our own type for the row so that `row` isn’t implicitly `any`
      worksheet.eachRow((row: ExcelJS.Row, rowIndex: number): void => {
        // row.values is defined as any[] in the typings, so cast it
        const rowValues = row.values as (string | number | undefined | null)[]
        if (rowIndex === 1) {
          // Capture header names from the first row (skip the first blank cell)
          headers = rowValues.slice(1).map((cell) => String(cell ?? ''))
          setRawHeaders(headers)
        } else {
          // Build a row object keyed by the header names
          const rowObj: RawRow = {}
          headers.forEach((header, i) => {
            rowObj[header] = rowValues[i + 1] ?? ''
          })
          rows.push(rowObj)
        }
      })

      setRawData(rows)
    } catch (err: unknown) {
      console.error(err)
      setError('Failed to read Excel file. Make sure it is a valid .xlsx file.')
    }
  }

  /**
   * Update the mapping for a single required field. When the user selects a
   * column from the dropdown, we store that association in state.
   */
  const handleMappingChange = (field: RequiredField, value: string): void => {
    setColumnMap((prev) => ({ ...prev, [field]: value }))
  }

  /**
   * Normalize the raw data based on the current column map. Any missing
   * mapping results in an empty string for that field. The normalized
   * rows are stored in state for preview.
   */
  const handlePreview = (): void => {
    const mapped: NormalizedRow[] = rawData.map((row: RawRow): NormalizedRow => {
      const mappedRow: NormalizedRow = {} as NormalizedRow
      requiredFields.forEach((key) => {
        const sourceKey = columnMap[key]
        mappedRow[key] = sourceKey ? String(row[sourceKey] ?? '') : ''
      })
      return mappedRow
    })
    setNormalizedData(mapped)
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Soldiers (Excel)</h1>

      {/* File input to select an .xlsx file */}
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFile}
        className="mb-4"
      />

      {error && <p className="text-red-500 mb-4">❌ {error}</p>}

      {/* Step 1: Mapping UI */}
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
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleMappingChange(field, e.target.value)
                  }
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

      {/* Step 2: Preview normalized data */}
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