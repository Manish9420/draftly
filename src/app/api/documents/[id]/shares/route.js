
import { prisma } from "../../../../../lib/prisma";
import { z } from "zod";

const DEMO_EMAIL = "manish@draftly.app";

async function getDemoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { name: "Manish", email: DEMO_EMAIL },
  });
}

const shareSchema = z.object({
  email: z.string().trim().email(),
  role: z.enum(["EDITOR", "VIEWER"]),
});

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const owner = await getDemoUser();

    const document = await prisma.document.findFirst({
      where: { id, ownerId: owner.id },
      include: {
        shares: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!document) {
      return Response.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    return Response.json({ shares: document.shares });
  } catch (error) {
    console.error("GET document shares:", error);
    return Response.json(
      { error: "Could not load shares." },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = shareSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Enter a valid email and role." },
        { status: 400 }
      );
    }

    const owner = await getDemoUser();
    const document = await prisma.document.findFirst({
      where: { id, ownerId: owner.id },
      select: { id: true },
    });

    if (!document) {
      return Response.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    const email = parsed.data.email.toLowerCase();

    if (email === DEMO_EMAIL) {
      return Response.json(
        { error: "You already own this document." },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: email.split("@")[0],
        email,
      },
    });

    const share = await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: id,
          userId: user.id,
        },
      },
      update: { role: parsed.data.role },
      create: {
        documentId: id,
        userId: user.id,
        role: parsed.data.role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return Response.json({ share }, { status: 201 });
  } catch (error) {
    console.error("POST document shares:", error);
    return Response.json(
      { error: "Could not share document." },
      { status: 500 }
    );
  }
}
