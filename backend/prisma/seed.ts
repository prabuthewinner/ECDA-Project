import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed demo users
  const officerHash = await bcrypt.hash('password123', 10);
  const operatorHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'officer@example.com' },
    update: {},
    create: {
      email: 'officer@example.com',
      passwordHash: officerHash,
      name: 'Sarah Officer',
      role: Role.OFFICER,
    },
  });

  await prisma.user.upsert({
    where: { email: 'operator@example.com' },
    update: {},
    create: {
      email: 'operator@example.com',
      passwordHash: operatorHash,
      name: 'John Operator',
      role: Role.OPERATOR,
    },
  });

  // Seed comment templates
  const templates = [
    { sectionKey: 'business_details', text: 'Business registration number is missing or invalid.' },
    { sectionKey: 'business_details', text: 'Please provide a valid business address.' },
    { sectionKey: 'owner_info', text: 'NRIC/Passport copy is required for all directors.' },
    { sectionKey: 'owner_info', text: 'Owner contact details are incomplete.' },
    { sectionKey: 'premises_info', text: 'Floor plan of the premises is required.' },
    { sectionKey: 'premises_info', text: 'Tenancy agreement or proof of ownership is missing.' },
    { sectionKey: 'licence_details', text: 'Previous licence number must be provided for renewals.' },
    { sectionKey: null, text: 'Supporting documents are missing or illegible.' },
    { sectionKey: null, text: 'Please ensure all uploaded documents are in PDF or image format.' },
  ];

  for (const t of templates) {
    await prisma.commentTemplate.create({ data: t });
  }

  console.log('✅ Seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
