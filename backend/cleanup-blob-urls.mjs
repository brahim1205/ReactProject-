import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupBlobUrls() {
  try {
    console.log(' Nettoyage des URLs blob invalides...');

    // Trouver tous les todos avec des URLs blob
    const todosWithBlobUrls = await prisma.todo.findMany({
      where: {
        OR: [
          {
            audioUrl: {
              startsWith: 'blob:'
            }
          },
          {
            imageUrl: {
              startsWith: 'blob:'
            }
          }
        ]
      }
    });

    console.log(` Trouvé ${todosWithBlobUrls.length} todos avec des URLs blob`);

    // Nettoyer les URLs blob
    for (const todo of todosWithBlobUrls) {
      const updateData = {};

      if (todo.audioUrl?.startsWith('blob:')) {
        updateData.audioUrl = null;
        console.log(` Suppression URL audio blob pour todo ${todo.id}`);
      }

      if (todo.imageUrl?.startsWith('blob:')) {
        updateData.imageUrl = null;
        console.log(`Suppression URL image blob pour todo ${todo.id}`);
      }

      await prisma.todo.update({
        where: { id: todo.id },
        data: updateData
      });
    }

    console.log(' Nettoyage terminé !');
    console.log(`${todosWithBlobUrls.length} todos nettoyés`);

  } catch (error) {
    console.error(' Erreur lors du nettoyage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le nettoyage
cleanupBlobUrls();