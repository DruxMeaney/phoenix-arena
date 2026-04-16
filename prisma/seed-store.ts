/**
 * Seed script to migrate hardcoded store items to the database.
 * Run with: npx tsx prisma/seed-store.ts
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

const STORE_ITEMS = [
  { slug: "credits-50", type: "credit_pack", name: "50 Creditos Phoenix", price: 5, credits: 50, description: "Paquete basico para empezar a competir", sortOrder: 1 },
  { slug: "credits-150", type: "credit_pack", name: "150 Creditos Phoenix", price: 12, credits: 150, description: "El mas popular. 25% mas valor", sortOrder: 2 },
  { slug: "credits-500", type: "credit_pack", name: "500 Creditos Phoenix", price: 35, credits: 500, description: "Para competidores serios. 40% mas valor", sortOrder: 3 },
  { slug: "credits-1200", type: "credit_pack", name: "1,200 Creditos Phoenix", price: 70, credits: 1200, description: "Paquete elite. Mejor precio por credito", sortOrder: 4 },
  { slug: "name-change", type: "name_change", name: "Cambio de Identidad", price: 5, credits: 0, description: "Cambia tu nombre de usuario en la plataforma", sortOrder: 5 },
  { slug: "record-reset", type: "record_reset", name: "Reinicio de Historial", price: 10, credits: 0, description: "Borra tu historial de partidas y empieza de cero", sortOrder: 6 },
  { slug: "badge-flame", type: "badge", name: "Insignia Llama Eterna", price: 3, credits: 0, description: "Insignia exclusiva para tu perfil", sortOrder: 7 },
  { slug: "title-legend", type: "title", name: "Titulo: Leyenda", price: 8, credits: 0, description: "Titulo especial visible junto a tu nombre", sortOrder: 8 },
];

async function main() {
  console.log("Seeding store items...");
  for (const item of STORE_ITEMS) {
    await prisma.storeItem.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
    console.log(`  ✓ ${item.name}`);
  }
  console.log("Done! Store items seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
