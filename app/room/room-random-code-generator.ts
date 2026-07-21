function randomCode(length = 6) {
  const chars = "abcdefghyjklmnopqrstuvyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

export async function generateUniqueRoomCode(prisma: any) {
  //ciclo que checka si el codigo existe y solo retorna si no se encuentra codigo igual
  while (true) {
    const code = randomCode();

    const codeExists = await prisma.room.findUnique({
      where: {
        code,
      },
    });

    if (!codeExists) return code;
  }
}
