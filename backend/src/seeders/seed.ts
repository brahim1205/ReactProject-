import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "Utilisateur Test",
      email: "test@example.com",
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
    },
  });

  console.log("Utilisateurs créés:");
  console.log("- test@example.com / password123");
  console.log("- admin@example.com / password123");

  const todo1 = await prisma.todo.create({
    data: {
      title: "Première tâche",
      description: "Ceci est une tâche de test",
      priority: "Moyenne",
      userId: user1.id,
      createdBy: user1.name,
    },
  });

  const todo2 = await prisma.todo.create({
    data: {
      title: "Tâche terminée",
      description: "Cette tâche est déjà terminée",
      priority: "Urgente",
      completed: true,
      userId: user1.id,
      createdBy: user1.name,
    },
  });

  console.log(" Tâches de test créées");
  console.log("Seeding terminé!");
}

main()
  .catch((e) => {
    console.error(" Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });