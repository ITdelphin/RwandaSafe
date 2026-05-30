'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { incidentsApi } from '../../lib/apiClient';
import { Navbar } from '../../components/Navbar';

const INCIDENT_TYPES = [
  { key: 'ACCIDENT',          label: 'Accident',         icon: '🚗' },
  { key: 'MEDICAL_EMERGENCY', label: 'Medical Emergency',icon: '🏥' },
  { key: 'CRIME',             label: 'Crime',            icon: '🚨' },
  { key: 'FIRE',              label: 'Fire',             icon: '🔥' },
  { key: 'GBV',               label: 'GBV',              icon: '⚠️' },
  { key: 'CORRUPTION',        label: 'Corruption',       icon: '📋' },
  { key: 'MISSING_PERSON',    label: 'Missing Person',   icon: '🔍' },
  { key: 'NATURAL_DISASTER',  label: 'Natural Disaster', icon: '🌪️' },
  { key: 'OTHER',             label: 'Other',            icon: '❗' },
];

const SEVERITY = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const schema = z.object({
  type: z.string().min(1, 'Select an incident type'),
  severity: z.string(),
  description: z.string().min(10, 'At least 10 characters required'),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  district: z.string().optional(),
  isAnonymous: z.boolean(),
});

function ReportFormContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: params.get('type') ?? '',
      severity: 'MEDIUM',
      description: '',
      latitude: -1.9441,
      longitude: 30.0619,
      address: '',
      district: '',
      isAnonymous: false,
    },
  });

  const selectedType = watch('type');

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await incidentsApi.create(data);
      const incident = res.data.data;
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        try { await incidentsApi.uploadMedia(incident.id, fd); } catch { /* non-fatal */ }
      }
      router.push(`/my-reports/${incident.id}`);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Report an Incident</h1>
        <div className="flex gap-2 mb-8">
          {['What happened?', 'Where?', 'Evidence'].map((label, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= step ? 'bg-blue-800' : 'bg-gray-200'}`} />
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Incident Type *</label>
                <div className="grid grid-cols-3 gap-3">
                  {INCIDENT_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t.key}
                      onClick={() => setValue('type', t.key)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${selectedType === t.key ? 'border-blue-700 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <span className="text-2xl block">{t.icon}</span>
                      <span className="text-xs font-medium text-gray-700 mt-1 block">{t.label}</span>
                    </button>
                  ))}
                </div>
                {errors.type && <p className="text-red-500 text-xs mt-1">{String(errors.type.message)}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Severity</label>
                <div className="flex gap-2">
                  {SEVERITY.map((s) => (
                    <button type="button" key={s} onClick={() => setValue('severity', s)}
                      className={`flex-1 py-2 rounded-lg border-2 text-xs font-bold transition-all ${watch('severity') === s ? 'border-blue-700 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  {...register('description')}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none"
                  placeholder="Please provide as much detail as possible..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{String(errors.description.message)}</p>}
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('isAnonymous')} className="w-4 h-4" />
                <span className="text-sm text-gray-700">Report anonymously — your identity will be hidden from responders</span>
              </label>

              <button type="button" onClick={() => setStep(1)}
                className="w-full bg-blue-800 text-white py-3 rounded-xl font-semibold hover:bg-blue-900">
                Next →
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm font-medium text-blue-800">📍 GPS coordinates will be captured automatically</p>
                <button type="button" className="text-xs text-blue-600 mt-1 underline"
                  onClick={() => navigator.geolocation?.getCurrentPosition((p) => { setValue('latitude', p.coords.latitude); setValue('longitude', p.coords.longitude); })}>
                  Use my current location
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address (optional)</label>
                <input {...register('address')} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="e.g. KN 5 Road, Kigali" />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)} className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-gray-300">← Back</button>
                <button type="button" onClick={() => setStep(2)} className="flex-1 bg-blue-800 text-white py-3 rounded-xl font-semibold hover:bg-blue-900">Next →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Evidence (optional)</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); setFiles([...files, ...Array.from(e.dataTransfer.files)]); }}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <p className="text-gray-500 text-sm">Drag & drop photos/videos here, or click to select</p>
                  <input id="file-input" type="file" multiple accept="image/*,video/*,audio/*" className="hidden"
                    onChange={(e) => e.target.files && setFiles([...files, ...Array.from(e.target.files)])} />
                </div>
                {files.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {files.map((f, i) => <li key={i} className="text-xs text-gray-600">📎 {f.name}</li>)}
                  </ul>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600">← Back</button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50">
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense>
      <ReportFormContent />
    </Suspense>
  );
}
