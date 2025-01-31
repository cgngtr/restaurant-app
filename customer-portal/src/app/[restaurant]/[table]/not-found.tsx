import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Table Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The restaurant or table you're looking for doesn't exist or is not available.
        </p>
        <div className="flex justify-center">
          <Link
            href="/"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  )
} 