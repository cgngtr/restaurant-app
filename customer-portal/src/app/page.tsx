import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome to QR Order App</h1>
      <p>This is the home page.</p>
      <div className="mt-4">
        <p>Test Links:</p>
        <ul className="list-disc pl-6">
          <li>
            <Link href="/test" className="text-blue-600 hover:underline">
              Test Page
            </Link>
          </li>
          <li>
            <Link href="/test/123" className="text-blue-600 hover:underline">
              Dynamic Test Page
            </Link>
          </li>
          <li>
            <Link href="/demo-restaurant/1" className="text-blue-600 hover:underline">
              Demo Restaurant Table 1
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
