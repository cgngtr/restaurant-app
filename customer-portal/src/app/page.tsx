import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            QR Order App
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Please scan a QR code at your table to start ordering.
          </p>
          
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="text-left space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                How it works:
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Find the QR code on your table</li>
                <li>Scan it with your phone&apos;s camera</li>
                <li>Browse the menu and select your items</li>
                <li>Place your order and track its status</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
