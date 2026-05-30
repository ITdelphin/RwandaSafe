import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const requestLocation = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState((s) => ({ ...s, loading: false, error: 'Location permission denied' }));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setState({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        error: null,
        loading: false,
      });
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
    }
  };

  useEffect(() => { requestLocation(); }, []);

  return { ...state, requestLocation };
}
