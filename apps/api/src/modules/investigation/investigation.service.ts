import { prisma } from '../../config/database';
import { InvestigationStatus, EvidenceType, SuspectStatus } from '@prisma/client';
import PDFDocument from 'pdfkit';

export const investigationService = {
  // Generate unique case number: RIB-YYYY-NNNNN
  async _generateCaseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.investigation.count({
      where: { caseNumber: { startsWith: `RIB-${year}-` } },
    });
    const seq = String(count + 1).padStart(5, '0');
    return `RIB-${year}-${seq}`;
  },

  // Create a new investigation
  async createInvestigation(
    data: {
      title: string;
      description: string;
      incidentId?: string;
      leadInvestigatorId?: string;
      classificationLevel?: string;
      isSensitive?: boolean;
    },
    createdById: string,
  ) {
    // Get the officer's agencyId
    const officer = await prisma.officer.findUnique({
      where: { id: createdById },
      select: { agencyId: true },
    });

    // Fall back to userId lookup if createdById is a userId
    let agencyId: string;
    if (officer) {
      agencyId = officer.agencyId;
    } else {
      const officerByUser = await prisma.officer.findUnique({
        where: { userId: createdById },
        select: { id: true, agencyId: true },
      });
      if (!officerByUser) throw Object.assign(new Error('Officer profile not found'), { statusCode: 403 });
      agencyId = officerByUser.agencyId;
    }

    const caseNumber = await this._generateCaseNumber();

    return prisma.investigation.create({
      data: {
        caseNumber,
        title: data.title,
        description: data.description,
        incidentId: data.incidentId,
        leadInvestigatorId: data.leadInvestigatorId,
        agencyId,
        classificationLevel: data.classificationLevel ?? 'STANDARD',
        isSensitive: data.isSensitive ?? false,
        status: 'OPEN',
      },
      include: {
        incident: true,
        leadInvestigator: { include: { user: { select: { id: true, name: true, phone: true } } } },
        agency: true,
      },
    });
  },

  // Link an incident to an investigation via CaseNote
  async linkIncidents(investigationId: string, incidentIds: string[], officerUserId: string) {
    const investigation = await prisma.investigation.findUnique({ where: { id: investigationId } });
    if (!investigation) throw Object.assign(new Error('Investigation not found'), { statusCode: 404 });

    // Find the officer record for the user
    const officer = await prisma.officer.findUnique({ where: { userId: officerUserId } });
    if (!officer) throw Object.assign(new Error('Officer profile not found'), { statusCode: 403 });

    const notes = incidentIds.map(incidentId =>
      prisma.caseNote.create({
        data: {
          incidentId,
          authorId: officerUserId,
          note: `Linked to investigation ${investigation.caseNumber}: ${investigation.title}`,
          isInternal: true,
        },
      }),
    );

    await prisma.$transaction(notes);

    return { investigationId, linkedIncidentIds: incidentIds };
  },

  // Add a suspect to an investigation
  async addSuspect(
    investigationId: string,
    suspectData: {
      alias?: string;
      description?: string;
      age?: number;
      gender?: string;
      nationality?: string;
      knownAddresses?: string[];
      notes?: string;
    },
  ) {
    const investigation = await prisma.investigation.findUnique({ where: { id: investigationId } });
    if (!investigation) throw Object.assign(new Error('Investigation not found'), { statusCode: 404 });

    return prisma.suspect.create({
      data: {
        investigationId,
        alias: suspectData.alias,
        description: suspectData.description,
        age: suspectData.age,
        gender: suspectData.gender,
        nationality: suspectData.nationality,
        knownAddresses: suspectData.knownAddresses ?? [],
        notes: suspectData.notes,
        status: 'PERSON_OF_INTEREST',
      },
    });
  },

  // Update suspect status
  async updateSuspectStatus(suspectId: string, status: SuspectStatus, notes?: string) {
    const suspect = await prisma.suspect.findUnique({ where: { id: suspectId } });
    if (!suspect) throw Object.assign(new Error('Suspect not found'), { statusCode: 404 });

    return prisma.suspect.update({
      where: { id: suspectId },
      data: {
        status,
        notes: notes ?? suspect.notes,
        updatedAt: new Date(),
      },
    });
  },

  // Upload evidence to an investigation
  async uploadEvidence(
    investigationId: string,
    data: {
      type: EvidenceType;
      title: string;
      description?: string;
      fileUrl?: string;
      filePublicId?: string;
      collectedAt?: Date;
      suspectId?: string;
      isAdmissible?: boolean;
    },
    uploadedById: string,
  ) {
    const investigation = await prisma.investigation.findUnique({ where: { id: investigationId } });
    if (!investigation) throw Object.assign(new Error('Investigation not found'), { statusCode: 404 });

    // Build Supabase URL pattern for fileUrl if not provided
    const fileUrl = data.fileUrl
      ?? (data.filePublicId
        ? `https://supabase.rwanda-safe.rw/storage/v1/object/public/evidence/${data.filePublicId}`
        : undefined);

    // Initial chain of custody entry
    const chainOfCustody = [
      {
        action: 'UPLOADED',
        byUserId: uploadedById,
        at: new Date().toISOString(),
        notes: 'Initial upload',
      },
    ];

    return prisma.investigationEvidence.create({
      data: {
        investigationId,
        suspectId: data.suspectId,
        type: data.type,
        title: data.title,
        description: data.description,
        fileUrl,
        filePublicId: data.filePublicId,
        collectedAt: data.collectedAt,
        collectedById: uploadedById,
        chainOfCustody,
        isAdmissible: data.isAdmissible ?? true,
      },
    });
  },

  // Get evidence signed URL (uses stored fileUrl; production would use Supabase signed URLs)
  async getEvidenceSignedUrl(evidenceId: string, requestedById: string) {
    const evidence = await prisma.investigationEvidence.findUnique({ where: { id: evidenceId } });
    if (!evidence) throw Object.assign(new Error('Evidence not found'), { statusCode: 404 });

    // Append access log to chain of custody
    const currentChain = (evidence.chainOfCustody as any[]) ?? [];
    const updatedChain = [
      ...currentChain,
      {
        action: 'ACCESSED',
        byUserId: requestedById,
        at: new Date().toISOString(),
        notes: 'URL access request',
      },
    ];

    await prisma.investigationEvidence.update({
      where: { id: evidenceId },
      data: { chainOfCustody: updatedChain },
    });

    // In production, generate a Supabase signed URL here.
    // For now, return the stored fileUrl directly.
    return { url: evidence.fileUrl, expiresIn: 3600 };
  },

  // Run pattern detection — scan incidents in last 72h for clusters
  async runPatternDetection() {
    const since = new Date(Date.now() - 72 * 60 * 60 * 1000);

    const incidents = await prisma.incident.findMany({
      where: { createdAt: { gte: since } },
      select: { id: true, type: true, district: true, createdAt: true },
    });

    // Group by type + district
    const groups: Record<string, { incidentIds: string[]; type: string; district: string }> = {};

    for (const inc of incidents) {
      if (!inc.district) continue;
      const key = `${inc.type}::${inc.district}`;
      if (!groups[key]) {
        groups[key] = { incidentIds: [], type: inc.type, district: inc.district };
      }
      groups[key].incidentIds.push(inc.id);
    }

    const createdAlerts = [];

    for (const [key, group] of Object.entries(groups)) {
      if (group.incidentIds.length >= 3) {
        // Check if we already created an alert for this combination recently
        const existing = await prisma.patternAlert.findFirst({
          where: {
            incidentType: group.type,
            district: group.district,
            createdAt: { gte: since },
          },
        });

        if (!existing) {
          const alert = await prisma.patternAlert.create({
            data: {
              title: `Pattern detected: ${group.type} in ${group.district}`,
              description: `${group.incidentIds.length} incidents of type ${group.type} reported in ${group.district} within the last 72 hours.`,
              incidentType: group.type,
              district: group.district,
              incidentCount: group.incidentIds.length,
              timeWindowHours: 72,
              incidentIds: group.incidentIds,
              isReviewed: false,
            },
          });
          createdAlerts.push(alert);
        }
      }
    }

    return { detectedPatterns: createdAlerts.length, alerts: createdAlerts };
  },

  // Export investigation as PDF using pdfkit
  async exportCasePdf(investigationId: string, requestedById: string): Promise<Buffer> {
    const investigation = await prisma.investigation.findUnique({
      where: { id: investigationId },
      include: {
        incident: true,
        leadInvestigator: { include: { user: { select: { name: true, phone: true } } } },
        agency: true,
        suspects: true,
        evidence: true,
        tips: { where: { isReviewed: true } },
      },
    });

    if (!investigation) throw Object.assign(new Error('Investigation not found'), { statusCode: 404 });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .text('RWANDA INVESTIGATION BUREAU', { align: 'center' })
        .fontSize(14)
        .text('CONFIDENTIAL CASE FILE', { align: 'center' })
        .moveDown(1);

      // Case details
      doc
        .fontSize(16)
        .text(`Case Number: ${investigation.caseNumber}`)
        .moveDown(0.5)
        .fontSize(12)
        .text(`Title: ${investigation.title}`)
        .text(`Status: ${investigation.status}`)
        .text(`Classification: ${investigation.classificationLevel}`)
        .text(`Opened: ${investigation.openedAt.toISOString().split('T')[0]}`)
        .text(`Agency: ${investigation.agency.name}`)
        .moveDown(1);

      // Lead investigator
      if (investigation.leadInvestigator) {
        doc
          .fontSize(14)
          .text('Lead Investigator')
          .fontSize(12)
          .text(`Name: ${investigation.leadInvestigator.user?.name ?? 'N/A'}`)
          .text(`Phone: ${investigation.leadInvestigator.user?.phone ?? 'N/A'}`)
          .moveDown(1);
      }

      // Description
      doc
        .fontSize(14)
        .text('Description')
        .fontSize(12)
        .text(investigation.description)
        .moveDown(1);

      // Linked incident
      if (investigation.incident) {
        doc
          .fontSize(14)
          .text('Linked Incident')
          .fontSize(12)
          .text(`ID: ${investigation.incident.id}`)
          .text(`Tracking: ${investigation.incident.trackingCode}`)
          .text(`Type: ${investigation.incident.type}`)
          .text(`Status: ${investigation.incident.status}`)
          .moveDown(1);
      }

      // Suspects
      if (investigation.suspects.length > 0) {
        doc.fontSize(14).text('Suspects').moveDown(0.5);
        for (const suspect of investigation.suspects) {
          doc
            .fontSize(12)
            .text(`  Alias: ${suspect.alias ?? 'Unknown'}`)
            .text(`  Status: ${suspect.status}`)
            .text(`  Description: ${suspect.description ?? 'N/A'}`)
            .text(`  Age: ${suspect.age ?? 'N/A'} | Gender: ${suspect.gender ?? 'N/A'} | Nationality: ${suspect.nationality ?? 'N/A'}`)
            .moveDown(0.5);
        }
        doc.moveDown(0.5);
      }

      // Evidence
      if (investigation.evidence.length > 0) {
        doc.fontSize(14).text('Evidence').moveDown(0.5);
        for (const ev of investigation.evidence) {
          doc
            .fontSize(12)
            .text(`  [${ev.type}] ${ev.title}`)
            .text(`  Description: ${ev.description ?? 'N/A'}`)
            .text(`  Admissible: ${ev.isAdmissible ? 'Yes' : 'No'}`)
            .text(`  Collected: ${ev.collectedAt ? ev.collectedAt.toISOString().split('T')[0] : 'N/A'}`)
            .moveDown(0.5);
        }
        doc.moveDown(0.5);
      }

      // Tips
      if (investigation.tips.length > 0) {
        doc.fontSize(14).text('Reviewed Tips').moveDown(0.5);
        for (const tip of investigation.tips) {
          doc
            .fontSize(12)
            .text(`  ${tip.isAnonymous ? '[Anonymous]' : 'Identified'}: ${tip.content}`)
            .text(`  Credible: ${tip.isCredible === true ? 'Yes' : tip.isCredible === false ? 'No' : 'Unassessed'}`)
            .moveDown(0.5);
        }
        doc.moveDown(0.5);
      }

      // Closure info
      if (investigation.closedAt) {
        doc
          .fontSize(14)
          .text('Closure')
          .fontSize(12)
          .text(`Closed: ${investigation.closedAt.toISOString().split('T')[0]}`)
          .text(`Note: ${investigation.closureNote ?? 'N/A'}`)
          .moveDown(1);
      }

      // Footer
      doc
        .moveDown(2)
        .fontSize(10)
        .text(`Report generated: ${new Date().toISOString()}`, { align: 'right' })
        .text(`Requested by user ID: ${requestedById}`, { align: 'right' });

      doc.end();
    });
  },

  // Close an investigation
  async closeInvestigation(
    investigationId: string,
    status: InvestigationStatus,
    note: string,
    closedById: string,
  ) {
    const investigation = await prisma.investigation.findUnique({ where: { id: investigationId } });
    if (!investigation) throw Object.assign(new Error('Investigation not found'), { statusCode: 404 });

    const closableStatuses: InvestigationStatus[] = ['CLOSED_SOLVED', 'CLOSED_UNSOLVED', 'REFERRED', 'SUSPENDED'];
    if (!closableStatuses.includes(status)) {
      throw Object.assign(new Error('Status must be a closing status'), { statusCode: 400 });
    }

    return prisma.investigation.update({
      where: { id: investigationId },
      data: {
        status,
        closedAt: new Date(),
        closureNote: note,
        updatedAt: new Date(),
      },
    });
  },

  // Get all investigations (with optional filters)
  async getInvestigations(
    agencyId: string,
    filters: {
      page?: number;
      limit?: number;
      status?: InvestigationStatus;
    } = {},
  ) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { agencyId };
    if (filters.status) where.status = filters.status;

    const [investigations, total] = await prisma.$transaction([
      prisma.investigation.findMany({
        where,
        include: {
          leadInvestigator: { include: { user: { select: { id: true, name: true } } } },
          _count: { select: { suspects: true, evidence: true, tips: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.investigation.count({ where }),
    ]);

    return { investigations, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  // Get a single investigation by ID
  async getInvestigation(id: string) {
    const investigation = await prisma.investigation.findUnique({
      where: { id },
      include: {
        incident: true,
        leadInvestigator: { include: { user: { select: { id: true, name: true, phone: true } } } },
        agency: true,
        suspects: true,
        evidence: true,
        tips: true,
      },
    });

    if (!investigation) throw Object.assign(new Error('Investigation not found'), { statusCode: 404 });
    return investigation;
  },

  // Get evidence for an investigation
  async getEvidence(investigationId: string) {
    return prisma.investigationEvidence.findMany({
      where: { investigationId },
      include: { suspect: true },
      orderBy: { createdAt: 'desc' },
    });
  },
};
