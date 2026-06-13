import 'dotenv/config';
import { PrismaClient, AgencyType, Role, ResourceType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Agencies ────────────────────────────────────────────────────────────────
  const rnp = await prisma.agency.upsert({
    where: { id: '11111111-1111-4111-a111-111111111111' },
    update: {},
    create: {
      id: '11111111-1111-4111-a111-111111111111',
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
    where: { id: '22222222-2222-4222-a222-222222222222' },
    update: {},
    create: {
      id: '22222222-2222-4222-a222-222222222222',
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
    where: { id: '33333333-3333-4333-a333-333333333333' },
    update: {},
    create: {
      id: '33333333-3333-4333-a333-333333333333',
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
    where: { id: '44444444-4444-4444-a444-444444444444' },
    update: {},
    create: {
      id: '44444444-4444-4444-a444-444444444444',
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
    where: { id: '55555555-5555-4555-a555-555555555555' },
    update: {},
    create: {
      id: '55555555-5555-4555-a555-555555555555',
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
  const adminPassword = await bcrypt.hash('RwandaSafe123', 10);
  const adminUser = await prisma.user.upsert({
    where: { phone: '+250788000001' },
    update: {
      email: 'delphinngarambe@gmail.com',
      passwordHash: adminPassword,
    },
    create: {
      phone: '+250788000001',
      email: 'delphinngarambe@gmail.com',
      name: 'Super Administrator',
      passwordHash: adminPassword,
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

  // ── SLA Configs ─────────────────────────────────────────────────────────────
  const slaConfigs = [
    // Police SLA targets
    { agencyType: 'POLICE', severity: 'CRITICAL', targetMinutes: 10, warningMinutes: 7 },
    { agencyType: 'POLICE', severity: 'HIGH', targetMinutes: 15, warningMinutes: 10 },
    { agencyType: 'POLICE', severity: 'MEDIUM', targetMinutes: 30, warningMinutes: 20 },
    { agencyType: 'POLICE', severity: 'LOW', targetMinutes: 60, warningMinutes: 45 },
    // Hospital SLA targets
    { agencyType: 'HOSPITAL', severity: 'CRITICAL', targetMinutes: 8, warningMinutes: 5 },
    { agencyType: 'HOSPITAL', severity: 'HIGH', targetMinutes: 12, warningMinutes: 8 },
    { agencyType: 'HOSPITAL', severity: 'MEDIUM', targetMinutes: 20, warningMinutes: 14 },
    { agencyType: 'HOSPITAL', severity: 'LOW', targetMinutes: 45, warningMinutes: 30 },
    // Fire SLA targets
    { agencyType: 'FIRE', severity: 'CRITICAL', targetMinutes: 8, warningMinutes: 5 },
    { agencyType: 'FIRE', severity: 'HIGH', targetMinutes: 12, warningMinutes: 8 },
    { agencyType: 'FIRE', severity: 'MEDIUM', targetMinutes: 20, warningMinutes: 14 },
    { agencyType: 'FIRE', severity: 'LOW', targetMinutes: 60, warningMinutes: 45 },
    // RIB SLA targets
    { agencyType: 'RIB', severity: 'CRITICAL', targetMinutes: 60, warningMinutes: 40 },
    { agencyType: 'RIB', severity: 'HIGH', targetMinutes: 120, warningMinutes: 90 },
    { agencyType: 'RIB', severity: 'MEDIUM', targetMinutes: 240, warningMinutes: 180 },
    { agencyType: 'RIB', severity: 'LOW', targetMinutes: 480, warningMinutes: 360 },
  ];

  for (const config of slaConfigs) {
    await prisma.slaConfig.upsert({
      where: {
        agencyType_severity: {
          agencyType: config.agencyType,
          severity: config.severity,
        },
      },
      update: {},
      create: {
        ...config,
        updatedById: adminUser.id,
      },
    });
  }
  console.log('SLA configurations created');

  console.log('\nSeed complete. Accounts:');
  console.log('  Super Admin : delphinngarambe@gmail.com / RwandaSafe123');
  console.log('  Police      : +250788100001 (OTP only)');
  console.log('  Medical     : +250788200001 (OTP only)');
  console.log('  Fire        : +250788300001 (OTP only)');
  console.log('  RIB         : +250788400001 (OTP only)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
