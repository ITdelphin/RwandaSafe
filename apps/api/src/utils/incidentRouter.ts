import { IncidentType, AgencyType } from '@prisma/client';

export function routeIncident(type: IncidentType): AgencyType[] {
  const routing: Record<IncidentType, AgencyType[]> = {
    ACCIDENT:         [AgencyType.POLICE, AgencyType.HOSPITAL],
    MEDICAL_EMERGENCY:[AgencyType.HOSPITAL],
    CRIME:            [AgencyType.POLICE],
    FIRE:             [AgencyType.FIRE, AgencyType.POLICE],
    GBV:              [AgencyType.POLICE, AgencyType.RIB],
    CORRUPTION:       [AgencyType.RIB],
    MISSING_PERSON:   [AgencyType.POLICE, AgencyType.RIB],
    NATURAL_DISASTER: [AgencyType.FIRE, AgencyType.HOSPITAL, AgencyType.POLICE],
    OTHER:            [AgencyType.POLICE],
  };
  return routing[type] ?? [AgencyType.POLICE];
}
