
import { prisma } from "../../../../lib/prisma";
import { z } from "zod";

const DEMO_EMAIL = "manish@draftly.app";

async function getDemoUser() {
  let user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Manish",
        email: DEMO_EMAIL,
      },
    });
  }

  return user;
}

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().max(500_000).optional(),
}).refine(
  (data) => data.title !== undefined || data.content !== undefined
);

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid document data." },
        { status: 400 }
      );
    }

    const user = await getDemoUser();

    const result = await prisma.document.updateMany({
      where: { id, ownerId: user.id },
      data: parsed.data,
    });

    if (result.count === 0) {
      return Response.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    const document = await prisma.document.findFirst({
      where: { id, ownerId: user.id },
    });

    return Response.json({ document });
  } catch (error) {
    console.error("PATCH document:", error);

    return Response.json(
      { error: "Could not save document." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const user = await getDemoUser();

    const result = await prisma.document.deleteMany({
      where: { id, ownerId: user.id },
    });

    if (result.count === 0) {
      return Response.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE document:", error);

    return Response.json(
      { error: "Could not delete document." },
      { status: 500 }
    );
  }
}
