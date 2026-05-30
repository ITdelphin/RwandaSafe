'use client';
import { useAmbulanceFleet } from '../../../hooks/useAmbulanceFleet';
import { AmbulanceFleetPanel } from '../../../components/ambulance/AmbulanceFleetPanel';
import { LiveMap } from '../../../components/map/LiveMap';

export default function DispatchPage() {
  const { ambulances, availableCount, dispatchedCount } = useAmbulanceFleet();
  const onScene = ambulances.filter(a => a.status === 'ON_SCENE').length;
  const transporting = ambulances.filter(a => a.status === 'TRANSPORTING').length;

  return (
    <div className="h-full flex flex-col gap-4">
      <h1 className="text-lg font-bold text-gray-900">Ambulance Dispatch</h1>
      <div className="flex-1 grid grid-cols-5 gap-4 min-h-0">
        {/* Fleet panel */}
        <div className="col-span-2 overflow-y-auto">
          <AmbulanceFleetPanel ambulances={ambulances} />
        </div>
        {/* Map */}
        <div className="col-span-3 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
          <LiveMap />
        </div>
      </div>
    </div>
  );
}
