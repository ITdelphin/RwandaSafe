import 'dotenv/config';
import { PrismaClient, AgencyType, Role, ResourceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Agencies ────────────────────────────────────────────────────────────────
  const rnp = await prisma.agency.upsert({
    where: { id: 'agency-rnp' },
    update: {},
    create: {
      id: 'agency-rnp',
      name: 'Rwanda National Police (RNP)',
      type: AgencyType.POLICE,
      region: 'Kigali City',
      district: 'Kigali',
      latitude: -1.9441,
      longitude: 30.0619,
      phone: '112',
      email: 'info@police.gov.rw',
    },
  });

  const samu = await prisma.agency.upsert({
    where: { id: 'agency-samu' },
    update: {},
    create: {
      id: 'agency-samu',
      name: 'King Faisal Hospital SAMU',
      type: AgencyType.HOSPITAL,
      region: 'Kigali City',
      district: 'Kigali',
      latitude: -1.9536,
      longitude: 30.0606,
      phone: '912',
      email: 'samu@kfh.rw',
    },
  });

  const fire = await prisma.agency.upsert({
    where: { id: 'agency-fire' },
    update: {},
    create: {
      id: 'agency-fire',
      name: 'Rwanda Fire Brigade',
      type: AgencyType.FIRE,
      region: 'Kigali City',
      district: 'Kigali',
      latitude: -1.9500,
      longitude: 30.0588,
      phone: '111',
      email: 'fire@rnp.gov.rw',
    },
  });

  const rib = await prisma.agency.upsert({
    where: { id: 'agency-rib' },
    update: {},
    create: {
      id: 'agency-rib',
      name: 'Rwanda Investigation Bureau (RIB)',
      type: AgencyType.RIB,
      region: 'Kigali City',
      district: 'Kigali',
      latitude: -1.9480,
      longitude: 30.0627,
      phone: '+250788310310',
      email: 'info@rib.gov.rw',
    },
  });

  const gov = await prisma.agency.upsert({
    where: { id: 'agency-gov' },
    update: {},
    create: {
      id: 'agency-gov',
      name: 'Ministry of Internal Security',
      type: AgencyType.GOVERNMENT,
      region: 'Kigali City',
      district: 'Kigali',
      latitude: -1.9462,
      longitude: 30.0611,
      phone: '+250788301030',
      email: 'info@mininter.gov.rw',
    },
  });

  console.log('Agencies created');

  // ── Super Admin ─────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { phone: '+250788000001' },
    update: {},
    create: {
      phone: '+250788000001',
      name: 'Super Administrator',
      role: Role.SUPER_ADMIN,
      isVerified: true,
    },
  });

  // ── Officer users ────────────────────────────────────────────────────────────
  const policeUser = await prisma.user.upsert({
    where: { phone: '+250788100001' },
    update: {},
    create: {
      phone: '+250788100001',
      name: 'Officer Jean-Paul Habimana',
      role: Role.POLICE_OFFICER,
      isVerified: true,
    },
  });

  const medicalUser = await prisma.user.upsert({
    where: { phone: '+250788200001' },
    update: {},
    create: {
      phone: '+250788200001',
      name: 'Dr. Marie Uwimana',
      role: Role.MEDICAL_RESPONDER,
      isVerified: true,
    },
  });

  const fireUser = await prisma.user.upsert({
    where: { phone: '+250788300001' },
    update: {},
    create: {
      phone: '+250788300001',
      name: 'Officer Eric Nkurunziza',
      role: Role.FIRE_OFFICER,
      isVerified: true,
    },
  });

  const ribUser = await prisma.user.upsert({
    where: { phone: '+250788400001' },
    update: {},
    create: {
      phone: '+250788400001',
      name: 'Investigator Alice Mukamana',
      role: Role.RIB_INVESTIGATOR,
      isVerified: true,
    },
  });

  // ── Officer profiles ─────────────────────────────────────────────────────────
  await prisma.officer.upsert({
    where: { userId: policeUser.id },
    update: {},
    create: {
      userId: policeUser.id,
      agencyId: rnp.id,
      badgeNumber: 'RNP-001',
      rank: 'Sergeant',
      isOnDuty: true,
    },
  });

  await prisma.officer.upsert({
    where: { userId: medicalUser.id },
    update: {},
    create: {
      userId: medicalUser.id,
      agencyId: samu.id,
      badgeNumber: 'SAMU-001',
      rank: 'Senior Paramedic',
      isOnDuty: true,
    },
  });

  await prisma.officer.upsert({
    where: { userId: fireUser.id },
    update: {},
    create: {
      userId: fireUser.id,
      agencyId: fire.id,
      badgeNumber: 'FIRE-001',
      rank: 'Fire Officer',
      isOnDuty: true,
    },
  });

  await prisma.officer.upsert({
    where: { userId: ribUser.id },
    update: {},
    create: {
      userId: ribUser.id,
      agencyId: rib.id,
      badgeNumber: 'RIB-001',
      rank: 'Senior Investigator',
      isOnDuty: true,
    },
  });

  console.log('Officers created');

  // ── Sample resources ─────────────────────────────────────────────────────────
  await prisma.resource.upsert({
    where: { plateNumber: 'RNP-V001' },
    update: {},
    create: {
      agencyId: rnp.id,
      type: ResourceType.POLICE_VEHICLE,
      name: 'Patrol Car Alpha-1',
      plateNumber: 'RNP-V001',
      currentLat: -1.9441,
      currentLng: 30.0619,
    },
  });

  await prisma.resource.upsert({
    where: { plateNumber: 'SAMU-A001' },
    update: {},
    create: {
      agencyId: samu.id,
      type: ResourceType.AMBULANCE,
      name: 'Ambulance Unit 1',
      plateNumber: 'SAMU-A001',
      currentLat: -1.9536,
      currentLng: 30.0606,
    },
  });

  await prisma.resource.upsert({
    where: { plateNumber: 'FIRE-T001' },
    update: {},
    create: {
      agencyId: fire.id,
      type: ResourceType.FIRE_TRUCK,
      name: 'Fire Engine 1',
      plateNumber: 'FIRE-T001',
      currentLat: -1.9500,
      currentLng: 30.0588,
    },
  });

  console.log('Resources created');
  console.log('\nSeed complete. Accounts:');
  console.log('  Super Admin : +250788000001');
  console.log('  Police      : +250788100001');
  console.log('  Medical     : +250788200001');
  console.log('  Fire        : +250788300001');
  console.log('  RIB         : +250788400001');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
