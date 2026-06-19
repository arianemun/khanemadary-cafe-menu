import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const email = process.argv[2] ?? "admin@cafe.local";
  const password = process.argv[3] ?? "admin123";
  const name = process.argv[4] ?? "Super Admin";

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.adminUser.upsert({
    where: { email },
    update: { password: hash, role: "superadmin", name },
    create: { email, password: hash, role: "superadmin", name },
  });

  console.log(`Admin user ready: ${user.email} (role: ${user.role})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
