import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const PRICE_ID_TO_PLAN: Record<string, 'premium' | 'gold'> = {
  [process.env.STRIPE_PREMIUM_PRICE_ID!]: 'premium',
  [process.env.STRIPE_GOLD_PRICE_ID!]: 'gold',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'] as string;
  const buf = await buffer(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('❌ Webhook署名エラー:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📩 Webhook受信: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const plan = session.metadata?.plan;

        if (!userId || !customerId || !plan || !subscriptionId) {
          console.error('❌ 必須データが不足しています');
          return res.status(400).send('Missing data');
        }

        // すでに登録済ならスキップ（冪等性）
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (existingUser?.stripeSubId === subscriptionId) {
          console.log('🔁 すでに登録済のサブスクリプションです。スキップします。');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const timestamp = (subscription as any)['current_period_end'];

        const currentPeriodEnd = typeof timestamp === 'number'
          ? new Date(timestamp * 1000)
          : null;

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionPlan: plan,
            stripeCustomerId: customerId,
            stripeSubId: subscription.id,
            currentPeriodEnd,
          },
        });

        console.log(`✅ ユーザー ${userId} → ${plan} にアップグレード完了`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer.toString();
        const priceId = subscription.items.data[0]?.price.id;
        const plan = PRICE_ID_TO_PLAN[priceId];

        if (!plan) {
          console.warn(`⚠️ priceId ${priceId} に対応するプランが不明`);
          break;
        }

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.warn(`⚠️ customerId ${customerId} に該当するユーザーが見つかりません`);
          break;
        }

        const timestamp = (subscription as any)['current_period_end'];
        const currentPeriodEnd = typeof timestamp === 'number'
          ? new Date(timestamp * 1000)
          : null;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionPlan: plan,
            stripeSubId: subscription.id,
            currentPeriodEnd,
          },
        });

        console.log(`🔁 プラン変更: ${user.id} → ${plan}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer.toString();

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.warn(`⚠️ 解約対象のユーザーが見つかりません (customerId: ${customerId})`);
          break;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionPlan: 'free',
            stripeSubId: null,
            currentPeriodEnd: null,
          },
        });

        console.log(`🛑 解約完了: ${user.id} → free に変更`);
        break;
      }

      default:
        console.log(`ℹ️ 未処理イベント: ${event.type}`);
        break;
    }

    return res.status(200).send('Webhook processed');
  } catch (e: any) {
    console.error('❌ 処理中エラー:', e);
    return res.status(500).send('Internal Server Error');
  }
}
