import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";

const fakeUsers = Array.from({ length: 10 }, () => ({
  email: faker.internet.email(),
  password: "password",
  role: "user",
  
}));

// const fakeNoti = Array.from({ length: 1000 }, () => ({
//   body_text: faker.lorem.sentences({ min: 1, max: 3 }),
//   type: faker.helpers.arrayElement([
//     "record",
//     "database",
//     "user",
//     "permission",
//   ]),
//   created_at: faker.date.between({
//     from: "2024-06-23T00:00:00.000Z",
//     to: "2024-06-23T09:49:00.000Z",
//   }),
// }));

const prisma = new PrismaClient();

async function main() {
  const push1 = prisma.users.createMany({
    data: fakeUsers,
  });
  // const push2 = prisma.notifications.createMany({
  //   data: fakeNoti,
  // });

  const resolver = await Promise.all([push1]);
  // const resolver = await Promise.all([push1, push2]);

  console.log("done");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
