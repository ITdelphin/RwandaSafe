'use client';
import { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Theme, BLOOD_TYPE_LABELS } from '../../constants/theme';

// Bed capacity color thresholds mapped to new Material palette
const HospitalTheme = {
  bedsGood:     Theme.secondary,    // #34A853
  bedsWarning:  Theme.warning,      // #F9AB00
  bedsCritical: Theme.danger,       // #d93025
  bedsEmpty:    Theme.textSecondary, // #5f6368
};
import { UpdateCapacityModal } from './UpdateCapacityModal';

interface Props { hospitals: any[]; myAgencyId?: string; onRefresh: () => void; }

function BedBar({ avail, total }: { avail: number; total: number }) {
  const pct = total > 0 ? avail / total : 0;
  const color = pct > 0.5 ? HospitalTheme.bedsGood : pct > 0.2 ? HospitalTheme.bedsWarning : avail === 0 ? HospitalTheme.bedsEmpty : HospitalTheme.bedsCritical;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium" style={{ color }}>{avail}/{total}</span>
    </div>
  );
}

function BloodDot({ units }: { units: number }) {
  if (units >= 5) return <CheckCircle2 size={12} className="text-green-500" />;
  if (units >= 2) return <AlertTriangle size={12} className="text-yellow-500" />;
  if (units > 0) return <XCircle size={12} className="text-red-500" />;
  return <span className="text-xs text-gray-400">—</span>;
}

export function HospitalCapacityBoard({ hospitals, myAgencyId, onRefresh }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const editHospital = hospitals.find(h => h.agencyId === editId);

  return (
    <div className="space-y-4">
      {hospitals.map(h => (
        <div key={h.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">{h.agency?.name ?? 'Hospital'}</h3>
              <p className="text-xs text-gray-500">{h.agency?.district}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${h.isAcceptingPatients ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {h.isAcceptingPatients
                  ? <><CheckCircle2 size={12} /> Accepting</>
                  : <><XCircle size={12} /> Not Accepting</>}
              </span>
              {(myAgencyId === h.agencyId || !myAgencyId) && (
                <button onClick={() => setEditId(h.agencyId)}
                  className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                  Update
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Emergency Beds</div>
              <BedBar avail={h.emergencyBedsAvail} total={h.emergencyBedsTotal} />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">ICU Beds</div>
              <BedBar avail={h.icuBedsAvail} total={h.icuBedsTotal} />
            </div>
          </div>
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-2">Blood Bank</div>
            <div className="grid grid-cols-4 gap-2">
              {[
                ['A_POSITIVE', h.bloodBankAPos], ['A_NEGATIVE', h.bloodBankANeg],
                ['B_POSITIVE', h.bloodBankBPos], ['B_NEGATIVE', h.bloodBankBNeg],
                ['O_POSITIVE', h.bloodBankOPos], ['O_NEGATIVE', h.bloodBankONeg],
                ['AB_POSITIVE', h.bloodBankABPos], ['AB_NEGATIVE', h.bloodBankABNeg],
              ].map(([type, units]: any) => (
                <div key={type} className="flex items-center gap-1.5">
                  <BloodDot units={units} />
                  <span className="text-xs text-gray-600">{BLOOD_TYPE_LABELS[type]} <span className="text-gray-400">({units})</span></span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">{h.surgeonOnCall ? <CheckCircle2 size={12} className="text-green-600" /> : <XCircle size={12} className="text-red-500" />} Surgeon</span>
            <span className="flex items-center gap-1">{h.neurologistOnCall ? <CheckCircle2 size={12} className="text-green-600" /> : <XCircle size={12} className="text-red-500" />} Neurologist</span>
            <span className="flex items-center gap-1">{h.cardiologistOnCall ? <CheckCircle2 size={12} className="text-green-600" /> : <XCircle size={12} className="text-red-500" />} Cardiologist</span>
            <span className="flex items-center gap-1">{h.pediatricianOnCall ? <CheckCircle2 size={12} className="text-green-600" /> : <XCircle size={12} className="text-red-500" />} Pediatrician</span>
          </div>
          {h.statusMessage && (
            <p className="text-xs text-orange-600 mt-2 italic flex items-center gap-1">
              <AlertTriangle size={12} /> {h.statusMessage}
            </p>
          )}
        </div>
      ))}
      {editId && editHospital && (
        <UpdateCapacityModal agencyId={editId} currentCapacity={editHospital} onClose={() => setEditId(null)} onSuccess={() => { setEditId(null); onRefresh(); }} />
      )}
    </div>
  );
}
