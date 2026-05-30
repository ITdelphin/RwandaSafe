import { Navbar } from '../../components/Navbar';

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Emergency Numbers */}
      <div className="bg-gray-800 text-white py-4 px-6">
        <div className="max-w-4xl mx-auto flex justify-center gap-10">
          <a href="tel:112" className="font-bold hover:text-red-300">🚔 Police: 112</a>
          <a href="tel:912" className="font-bold hover:text-red-300">🚑 Ambulance: 912</a>
          <a href="tel:111" className="font-bold hover:text-red-300">🚒 Fire: 111</a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="text-6xl mb-6">🗺️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Nearest Emergency Services</h1>
        <p className="text-gray-500 mb-4">Configure your Google Maps API key to enable the full map with nearby police stations, hospitals, and fire stations.</p>
        <p className="text-sm text-gray-400">Set <code className="bg-gray-100 px-2 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_KEY</code> in <code className="bg-gray-100 px-2 py-0.5 rounded">.env.local</code></p>
      </div>
    </div>
  );
}
