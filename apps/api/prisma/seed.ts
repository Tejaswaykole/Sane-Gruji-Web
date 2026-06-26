import { PrismaClient, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Permissions
  const permissionsData = [
    'users.view', 'users.create', 'users.update', 'users.delete',
    'users.manage_roles', 'users.manage_status',
    'students.view', 'students.create', 'students.update', 'students.import', 'students.export',
    'teachers.view', 'teachers.create', 'teachers.update',
    'attendance.view', 'attendance.create',
    'homework.view', 'homework.create',
    'exams.view', 'exams.create',
    'notices.view', 'notices.create',
    'fees.view'
  ];

  const permissions: Record<string, any> = {};
  for (const p of permissionsData) {
    permissions[p] = await prisma.permission.upsert({
      where: { name: p },
      update: {},
      create: { name: p, description: `Allows ${p}` },
    });
  }

  // 2. Create Roles
  const rolesData = [
    'SUPER_ADMIN',
    'PRINCIPAL',
    'ADMISSION_OFFICER',
    'TEACHER',
    'PARENT',
    'STUDENT'
  ];

  const roles: Record<string, any> = {};
  for (const r of rolesData) {
    roles[r] = await prisma.role.upsert({
      where: { name: r },
      update: {},
      create: { name: r, description: `${r} role` },
    });
  }

  // 3. Assign Permissions to Roles
  const rolePermissionsMap = {
    'SUPER_ADMIN': permissionsData, // Full Access
    'PRINCIPAL': permissionsData.filter(p => p.includes('.view') || ['users.update', 'students.update'].includes(p)),
    'ADMISSION_OFFICER': ['students.view', 'students.create'],
    'TEACHER': ['attendance.create', 'attendance.view', 'homework.create', 'homework.view', 'exams.create', 'exams.view', 'students.view'],
    'PARENT': ['attendance.view', 'homework.view', 'exams.view', 'fees.view', 'notices.view'],
    'STUDENT': ['attendance.view', 'homework.view', 'exams.view', 'fees.view', 'notices.view'],
  };

  for (const [roleName, perms] of Object.entries(rolePermissionsMap)) {
    const roleId = roles[roleName].id;
    for (const p of perms) {
      const permissionId = permissions[p].id;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId, permissionId }
        },
        update: {},
        create: { roleId, permissionId }
      });
    }
  }

  // 4. Create Super Admin User
  const adminPassword = await bcrypt.hash('Admin@123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@stjudes.edu' },
    update: {},
    create: {
      first_name: 'Super',
      last_name: 'Admin',
      email: 'admin@stjudes.edu',
      password_hash: adminPassword,
      roleId: roles['SUPER_ADMIN'].id,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
