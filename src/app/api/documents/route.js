
import { prisma } from "../../../lib/prisma";
import { z } from "zod";

const DEMO_EMAIL = "manish@draftly.app";

const documentSchema = z.object({
  title: z.string().trim().min(1).max(200).default("Untitled document"),
  content: z.string().max(500_000).default("<p>Start writing...</p>"),
});

async function getDemoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      name: "Manish",
      email: DEMO_EMAIL,
    },
  });
}

export async function GET() {
  try {
    const user = await getDemoUser();

    const documents = await prisma.document.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        shares: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return Response.json({ documents });
  } catch (error) {
    console.error("GET /api/documents:", error);
    return Response.json(
      { error: "Could not load documents." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = documentSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Please provide a valid title and document content." },
        { status: 400 }
      );
    }

    const user = await getDemoUser();

    const document = await prisma.document.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        ownerId: user.id,
      },
    });

    return Response.json({ document }, { status: 201 });
  } catch (error) {
    console.error("POST /api/documents:", error);
    return Response.json(
      { error: "Could not create the document." },
      { status: 500 }
    );
  }
}
