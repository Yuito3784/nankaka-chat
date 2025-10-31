// app/api/history/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionPlan: true },
    });

    const isPremium =
      user?.subscriptionPlan === "premium" || user?.subscriptionPlan === "gold";

    const histories = await prisma.history.findMany({
      where: {
        userId,
        ...(isPremium
          ? {}
          : {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 過去30日
              },
            }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ histories });
  } catch (e) {
    console.error("[history/list] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
