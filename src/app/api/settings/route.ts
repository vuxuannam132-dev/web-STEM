import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    const settingsMap = settings.reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("[Settings GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key || typeof value === "undefined") {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value: value.toString() },
      create: { key, value: value.toString() }
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error("[Settings POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
