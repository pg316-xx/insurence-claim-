const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);
  const tpaPassword = await bcrypt.hash('tpa123', 10);
  const hospitalPassword = await bcrypt.hash('hospital123', 10);

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Super Admin',
      password,
      role: 'ADMIN',
    },
  });

  // TPA
  await prisma.user.upsert({
    where: { email: 'tpa@test.com' },
    update: {},
    create: {
      email: 'tpa@test.com',
      name: 'Claims Reviewer',
      password: tpaPassword,
      role: 'TPA',
    },
  });

  // Customer
  const customer = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      name: 'John Doe',
      password: userPassword,
      role: 'CUSTOMER',
      phone: '9876543210',
    },
  });

  // Policy for Customer
  await prisma.policy.upsert({
    where: { policyNumber: 'POL123456' },
    update: {},
    create: {
      policyNumber: 'POL123456',
      userId: customer.id,
      coverageAmount: 500000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
    },
  });

  // Hospital User
  const hospitalUser = await prisma.user.upsert({
    where: { email: 'hospital@test.com' },
    update: {},
    create: {
      email: 'hospital@test.com',
      name: 'City Hospital Admin',
      password: hospitalPassword,
      role: 'HOSPITAL',
    },
  });

  // Hospital Entity
  const hospital = await prisma.hospital.create({
    data: {
      name: 'City General Hospital',
      location: 'New York',
      isNetwork: true,
      user: {
        connect: { id: hospitalUser.id }
      }
    }
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
