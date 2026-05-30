'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fireApi } from '../../../lib/apiClient';
import { HAZMAT_COLORS } from '../../../constants/theme';
import { HazmatGuidePanel } from '../../../components/fire/HazmatGuidePanel';

export default function HazmatPage() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [selectedChemical, setSelectedChemical] = useState<string | null>(null);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['hazmat-search', query],
    queryFn: () => fireApi.searchChemical(query).then(r => (r.data as any).data ?? []),
    enabled: query.trim().length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search.trim());
    setSelectedChemical(null);
  };

  const handlePrint = () => window.print();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hazmat Guide</h1>
          <p className="text-sm text-gray-500 mt-1">Search chemical hazard information for fire response</p>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 text-sm text-white bg-orange-600 rounded-xl hover:bg-orange-700 font-medium"
        >
          Print Guide
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search chemical name (e.g. Chlorine, Ammonia, LPG)..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 bg-white shadow-sm"
        />
        <button
          type="submit"
          disabled={!search.trim()}
          className="px-6 py-3 text-sm text-white bg-orange-600 rounded-xl hover:bg-orange-700 disabled:opacity-50 font-semibold"
        >
          Search
        </button>
      </form>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-10 text-gray-400 text-sm">Searching chemical database...</div>
      )}

      {/* Results grid */}
      {!isLoading && query && results.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <div className="text-4xl mb-3">☣️</div>
          <div className="text-sm">No chemicals found for "{query}"</div>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((chem: any) => {
            const hazmatColor = HAZMAT_COLORS[chem.hazmatLevel] ?? '#64748B';
            const isSelected = selectedChemical === chem.name;
            return (
              <div key={chem.id ?? chem.name} className="space-y-3">
                <div
                  onClick={() => setSelectedChemical(isSelected ? null : chem.name)}
                  className={`bg-white rounded-xl border p-4 shadow-sm cursor-pointer transition-all ${
                    isSelected ? 'border-orange-400 ring-2 ring-orange-200' : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">{chem.name}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: hazmatColor }}
                    >
                      {chem.hazmatLevel ?? 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    {chem.hazardClass && <div>Hazard Class: {chem.hazardClass}</div>}
                    {chem.evacuationRadius && <div>Evacuation: {chem.evacuationRadius}m radius</div>}
                    {chem.waterReactive && (
                      <div className="text-red-600 font-semibold">WATER REACTIVE</div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-orange-600 font-medium">
                    {isSelected ? '▲ Hide details' : '▼ View full guide'}
                  </div>
                </div>

                {isSelected && (
                  <HazmatGuidePanel chemicalName={chem.name} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state when no search */}
      {!query && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">☣️</div>
          <div className="text-base font-medium mb-2">Search the Hazmat Database</div>
          <p className="text-sm">Enter a chemical name to find hazard information, protective equipment, and fire response guidance.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['Chlorine', 'Ammonia', 'LPG', 'Benzene', 'Sulfuric Acid'].map(name => (
              <button
                key={name}
                onClick={() => { setSearch(name); setQuery(name); }}
                className="text-xs px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-orange-700 hover:bg-orange-100 transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
