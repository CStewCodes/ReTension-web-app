import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-900 text-white">
      {/* App name and tagline */}
      <h1 className="text-4xl font-bold mb-2">ReTension</h1>
      <p className="text-lg mb-8">The all‑in‑one App for ARCCs</p>

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/add-soldier">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded w-40">
            Add Soldier
          </button>
        </Link>
        <Link href="/soldiers">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded w-40">
            Soldiers
          </button>
        </Link>
        <Link href="/upload-soldiers">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded w-40">
            Upload Soldiers
          </button>
        </Link>
      </div>
    </main>
  );
}