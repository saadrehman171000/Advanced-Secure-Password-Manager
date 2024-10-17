import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

function encrypt(data: string): string {
  return Buffer.from(data).toString("base64");
}
function decrypt(encryptedData: string): string {
  return Buffer.from(encryptedData, "base64").toString("utf-8");
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, password, website } = await request.json();

    // Validate input
    if (!username || !password || !website) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Encrypt the password
    const encryptedPassword = encrypt(password);

    // Store the credential in the database
    const credential = await prisma.credential.create({
      data: {
        username,
        password: encryptedPassword,
        website,
        userId: user?.id,
      },
    });

    return NextResponse.json(
      { message: "Credential stored successfully", id: credential.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error storing credential:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credentials = await prisma.credential.findMany({
      where: { userId: user.id },
    });

    // Decrypt the password for each credential before sending
    const decryptedCredentials = credentials.map((credential) => ({
      ...credential,
      password: decrypt(credential.password),
    }));

    return NextResponse.json(decryptedCredentials);
  } catch (error) {
    console.error("Error retrieving credentials:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const { username, password, website } = await request.json();

    if (!id || (!username && !password && !website)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updateData: {
      username?: string;
      password?: string;
      website?: string;
    } = {};
    if (username) updateData.username = username;
    if (password) updateData.password = encrypt(password);
    if (website) updateData.website = website;

    const updatedCredential = await prisma.credential.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Credential updated successfully",
      id: updatedCredential.id,
    });
  } catch (error) {
    console.error("Error updating credential:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }

    await prisma.credential.delete({
      where: { id: id, userId: user.id },
    });

    return NextResponse.json({ message: "Credential deleted successfully" });
  } catch (error) {
    console.error("Error deleting credential:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
