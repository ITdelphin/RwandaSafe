'use client';
import { useState } from 'react';
import { fireApi } from '../../lib/apiClient';
import { FIRE_TYPE_ICONS } from '../../constants/theme';
import { WeatherPanel } from './WeatherPanel';
import { NearestHydrantsPanel } from './NearestHydrantsPanel';
import { HazmatGuidePanel } from './HazmatGuidePanel';
import { FireUnitDispatchPanel } from './FireUnitDispatchPanel';

const FIRE_TYPES = Object.keys(FIRE_TYPE_ICONS);
const HAZMAT_LEVELS = ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4'];
const BUILDING_TYPES = ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'GOVERNMENT', 'SCHOOL', 'HOSPITAL', 'OTHER'];

interface Props {
  incidentId: string;
  fireReport?: any;
  onRefresh: () => void;
}

export function FireReportPanel({ incidentId, fireReport, onRefresh }: Props) {
  const [fireType, setFireType] = useState(fireReport?.fireType ?? '');
  const [hazmatLevel, setHazmatLevel] = useState(fireReport?.hazmatLevel ?? '');
  const [chemicalName, setChemicalName] = useState(fireReport?.chemicalName ?? '');
  const [buildingType, setBuildingType] = useState(fireReport?.buildingType ?? '');
  const [floors, setFloors] = useState(fireReport?.floors ?? '');
  const [occupancy, setOccupancy] = useState(fireReport?.occupancy ?? '');
  const [casualties, setCasualties] = useState(fireReport?.casualties ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const isHazmat = ['GAS_LEAK', 'CHEMICAL_SPILL'].includes(fireType);

  const handleSave = async () => {
    if (!fireType) { setError('Please select a fire type'); return; }
    setError('');
    setSaving(true);
    try {
      await fireApi.createReport(incidentId, {
        fireType,
        hazmatLevel: isHazmat ? hazmatLevel : undefined,
        chemicalName: isHazmat ? chemicalName : undefined,
        buildingType: buildingType || undefined,
        floors: floors ? Number(floors) : undefined,
        occupancy: occupancy ? Number(occupancy) : undefined,
        casualties: casualties ? Number(casualties) : undefined,
      });
      setSaved(true);
      onRefresh();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-orange-800 uppercase tracking-wide mb-3">
          Fire Report
        </h4>

        {/* Fire Type */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">Fire Type</label>
          <div className="flex flex-wrap gap-2">
            {FIRE_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setFireType(type)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                  fireType === type
                    ? 'border-orange-500 bg-orange-100 text-orange-800 font-semibold'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {FIRE_TYPE_ICONS[type]} {type.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Hazmat fields */}
        {isHazmat && (
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Hazmat Level</label>
              <div className="flex gap-2">
                {HAZMAT_LEVELS.map(level => (
                  <button
                    key={level}
                    onClick={() => setHazmatLevel(level)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      hazmatLevel === level
                        ? 'border-orange-500 bg-orange-100 text-orange-800 font-semibold'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {level.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Chemical Name</label>
              <input
                value={chemicalName}
                onChange={e => setChemicalName(e.target.value)}
                placeholder="e.g. Chlorine, Ammonia..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
            </div>
          </div>
        )}

        {/* Building info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Building Type</label>
            <select
              value={buildingType}
              onChange={e => setBuildingType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-400"
            >
              <option value="">Select...</option>
              {BUILDING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Floors</label>
            <input
              type="number"
              value={floors}
              onChange={e => setFloors(e.target.value)}
              placeholder="# floors"
              min={1}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Occupancy</label>
            <input
              type="number"
              value={occupancy}
              onChange={e => setOccupancy(e.target.value)}
              placeholder="# people"
              min={0}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Casualties</label>
            <input
              type="number"
              value={casualties}
              onChange={e => setCasualties(e.target.value)}
              placeholder="# casualties"
              min={0}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-400"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        {saved && <p className="text-xs text-green-600 mb-2">Report saved successfully</p>}

        <button
          onClick={handleSave}
          disabled={saving || !fireType}
          className="w-full py-2 text-sm text-white bg-orange-600 rounded-xl hover:bg-orange-700 disabled:opacity-50 font-semibold transition-colors"
        >
          {saving ? 'Saving...' : 'Save Report'}
        </button>
      </div>

      {/* Dispatch */}
      <FireUnitDispatchPanel incidentId={incidentId} fireReport={fireReport} onRefresh={onRefresh} />

      {/* Weather */}
      <WeatherPanel incidentId={incidentId} />

      {/* Hydrants */}
      <NearestHydrantsPanel incidentId={incidentId} />

      {/* Hazmat guide if chemical set */}
      {isHazmat && chemicalName && (
        <HazmatGuidePanel chemicalName={chemicalName} />
      )}
    </div>
  );
}
