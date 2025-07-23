import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const plan = searchParams.get("plan");

  // ✅ 無料プランならキャンセルAPIへリダイレクト
  if (plan === "free") {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cancel-subscription`, 303);
  }

  if (!plan || !["premium", "gold"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // ✅ 認証トークン取得
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ トークン検証
  let userId: string;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // ✅ ユーザー取得
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // ✅ 旧サブスクリプションがあればキャンセル（支払い継続防止）
  if (user.stripeSubId) {
    try {
      await stripe.subscriptions.cancel(user.stripeSubId);
    } catch (err) {
      console.error("❌ サブスクキャンセル失敗（続行）:", err);
    }
  }

  // ✅ Stripe Customer の取得 or 作成
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });

    customerId = customer.id;

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  // ✅ プランに対応するPrice ID
  const priceId =
    plan === "premium"
      ? process.env.STRIPE_PREMIUM_PRICE_ID
      : process.env.STRIPE_GOLD_PRICE_ID;

  if (!priceId) {
    console.error("❌ Price ID が .env に設定されていません:", plan);
    return NextResponse.json({ error: "Stripe Price ID not set in .env" }, { status: 500 });
  }

  // ✅ Checkout セッション作成
  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      metadata: {
        plan,
        userId: user.id,
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade`,
    });
  } catch (err) {
    console.error("❌ Checkout セッション作成失敗:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }

  return NextResponse.redirect(session.url!, 303);
}
