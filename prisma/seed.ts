import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const roles = ["Admin", "Seller", "Buyer", "Driver"];
  for (const name of roles) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`✅ Role ready: ${role.name}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
