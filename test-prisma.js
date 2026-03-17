const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst({
      include: {
        favoriteMovies: { take: 5 },
        favoriteSeries: { take: 5 },
        watchedMovies: { take: 10 },
        watchedSeries: { take: 10 }
      }
    });
    console.log("Success:", user ? user.id : "null");
  } catch (e) {
    console.error("Prisma Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
