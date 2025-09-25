import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateStatus() {
  try {
    console.log('🔄 Migration des données completed vers status...');

    // Migrer les tâches terminées
    const completedTasks = await prisma.todo.findMany({
      where: { completed: true }
    });

    if (completedTasks.length > 0) {
      await prisma.todo.updateMany({
        where: { completed: true },
        data: { status: 'completed' }
      });
      console.log(`✅ ${completedTasks.length} tâche(s) terminée(s) migrée(s)`);
    }

    // Migrer les tâches non terminées
    const pendingTasks = await prisma.todo.findMany({
      where: { completed: false }
    });

    if (pendingTasks.length > 0) {
      await prisma.todo.updateMany({
        where: { completed: false },
        data: { status: 'in_progress' }
      });
      console.log(`✅ ${pendingTasks.length} tâche(s) en cours migrée(s)`);
    }

    console.log('✅ Migration terminée !');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateStatus();