'use client';
import { useState } from 'react';
import { capacityApi } from '../../lib/apiClient';
import { BLOOD_TYPE_LABELS } from '../../constants/theme';

interface Props { agencyId: string; currentCapacity: any; onClose: () => void; onSuccess: () => void; }

export function UpdateCapacityModal({ agencyId, currentCapacity: c, onClose, onSuccess }: Props) {
  const [data, setData] = useState({
    emergencyBedsAvail: c?.emergencyBedsAvail ?? 0,
    icuBedsAvail: c?.icuBedsAvail ?? 0,
    bloodBankAPos: c?.bloodBankAPos ?? 0,
    bloodBankANeg: c?.bloodBankANeg ?? 0,
    bloodBankBPos: c?.bloodBankBPos ?? 0,
    bloodBankBNeg: c?.bloodBankBNeg ?? 0,
    bloodBankOPos: c?.bloodBankOPos ?? 0,
    bloodBankONeg: c?.bloodBankONeg ?? 0,
    bloodBankABPos: c?.bloodBankABPos ?? 0,
    bloodBankABNeg: c?.bloodBankABNeg ?? 0,
    surgeonOnCall: c?.surgeonOnCall ?? false,
    neurologistOnCall: c?.neurologistOnCall ?? false,
    cardiologistOnCall: c?.cardiologistOnCall ?? false,
    pediatricianOnCall: c?.pediatricianOnCall ?? false,
    isAcceptingPatients: c?.isAcceptingPatients ?? true,
    statusMessage: c?.statusMessage ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, value: any) => setData(d => ({ ...d, [key]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await capacityApi.update(agencyId, data);
      onSuccess();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to update');
    } finally { setLoading(false); }
  };

  const bloodFields = [
    ['bloodBankAPos','A_POSITIVE'],['bloodBankANeg','A_NEGATIVE'],
    ['bloodBankBPos','B_POSITIVE'],['bloodBankBNeg','B_NEGATIVE'],
    ['bloodBankOPos','O_POSITIVE'],['bloodBankONeg','O_NEGATIVE'],
    ['bloodBankABPos','AB_POSITIVE'],['bloodBankABNeg','AB_NEGATIVE'],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="px-6 py-4 border-b border-gray-100"><h2 className="text-lg font-bold">Update Hospital Capacity</h2></div>
        <div className="px-6 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {[['Emergency Beds Available', 'emergencyBedsAvail'], ['ICU Beds Available', 'icuBedsAvail']].map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input type="number" min={0} value={(data as any)[key]} onChange={e => set(key, parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-2">Blood Bank (units)</label>
            <div className="grid grid-cols-4 gap-2">
              {bloodFields.map(([field, type]) => (
                <div key={field}>
                  <label className="block text-xs text-gray-400 mb-1">{BLOOD_TYPE_LABELS[type]}</label>
                  <input type="number" min={0} value={(data as any)[field]} onChange={e => set(field, parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-red-400" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-2">Specialists On Call</label>
            <div className="grid grid-cols-2 gap-2">
              {[['surgeonOnCall','Surgeon'],['neurologistOnCall','Neurologist'],['cardiologistOnCall','Cardiologist'],['pediatricianOnCall','Pediatrician']].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={(data as any)[key]} onChange={e => set(key, e.target.checked)} className="accent-red-600" />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={data.isAcceptingPatients} onChange={e => set('isAcceptingPatients', e.target.checked)} className="accent-red-600" />
            Currently accepting patients
          </label>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status Message (optional)</label>
            <input value={data.statusMessage} onChange={e => set('statusMessage', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
              placeholder="e.g. Oxygen supply limited" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: '#C62828' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
