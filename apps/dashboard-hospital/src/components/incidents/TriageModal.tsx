'use client';
import { useState } from 'react';
import { medicalApi } from '../../lib/apiClient';
import { TRIAGE_COLORS, SYMPTOM_OPTIONS, BLOOD_TYPE_LABELS } from '../../constants/theme';

interface Props { incidentId: string; onClose: () => void; onSuccess: () => void; }

const BLOOD_TYPES = Object.entries(BLOOD_TYPE_LABELS).filter(([k]) => k !== 'UNKNOWN');

export function TriageModal({ incidentId, onClose, onSuccess }: Props) {
  const [triage, setTriage] = useState('URGENT');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bloodType, setBloodType] = useState('UNKNOWN');
  const [conscious, setConscious] = useState<string>('');
  const [breathing, setBreathing] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSymptom = (s: string) =>
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await medicalApi.setTriage(incidentId, {
        triageLevel: triage,
        patientData: {
          symptoms,
          age: age ? parseInt(age) : undefined,
          gender: gender || undefined,
          bloodType: bloodType !== 'UNKNOWN' ? bloodType : undefined,
          isConscious: conscious === 'yes' ? true : conscious === 'no' ? false : undefined,
          isBreathing: breathing === 'yes' ? true : breathing === 'no' ? false : undefined,
        },
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to save triage');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Set Triage Level</h2>
        </div>
        <div className="px-6 py-4 space-y-5">
          {/* Triage level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Triage Level</label>
            <div className="grid grid-cols-4 gap-2">
              {['IMMEDIATE','URGENT','DELAYED','EXPECTANT'].map(level => {
                const color = TRIAGE_COLORS[level];
                const textColor = level === 'DELAYED' ? '#333' : '#fff';
                return (
                  <button key={level} onClick={() => setTriage(level)}
                    className="py-3 rounded-xl text-xs font-bold transition-all border-2"
                    style={{
                      backgroundColor: triage === level ? color : 'transparent',
                      color: triage === level ? textColor : color,
                      borderColor: color,
                    }}>
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Symptoms</label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map(s => (
                <button key={s} onClick={() => toggleSymptom(s)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${symptoms.includes(s) ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Age / Gender / Blood type */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Age</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="—"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400">
                <option value="">Unknown</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Blood Type</label>
              <select value={bloodType} onChange={e => setBloodType(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400">
                <option value="UNKNOWN">Unknown</option>
                {BLOOD_TYPES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Conscious / Breathing */}
          <div className="grid grid-cols-2 gap-4">
            {[['conscious', conscious, setConscious, 'Conscious?'], ['breathing', breathing, setBreathing, 'Breathing?']].map(([key, val, setter, label]: any) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <div className="flex gap-2">
                  {['yes','no','unknown'].map(opt => (
                    <button key={opt} onClick={() => setter(opt)}
                      className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors capitalize ${val === opt ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 text-gray-600'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50"
            style={{ backgroundColor: '#C62828' }}>
            {loading ? 'Saving...' : 'Save Triage'}
          </button>
        </div>
      </div>
    </div>
  );
}
