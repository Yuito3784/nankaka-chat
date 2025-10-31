// app/api/diagnose/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getUserIdFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const { symptom } = await req.json();

  // ★ async にしたので await を付ける
  const userId = await getUserIdFromCookie();

  const prompt = `
あなたは症状から適切な診療科と受診緊急度を判断する医師AIです。
以下の症状を診断し、次のJSON形式で出力してください。

症状: ${symptom}

出力形式：
{
  "診療科": "〇〇科",
  "緊急度": "1（軽度）／2（早めの受診）／3（すぐに受診）",
  "コメント": "具体的なアドバイスを簡潔に",
  "自宅でできる対処法": "水分補給、安静など",
  "注意すべき症状": "〜の場合はすぐに受診",
  "受診時に伝えるとよい情報": "痛みの頻度、発熱の有無、発症時期など",
  "他の可能性がある診療科": "耳鼻科、神経内科など"
}
`;

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const raw = chat.choices[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, "$1");

    let json: any;
    try {
      json = JSON.parse(cleaned);
    } catch {
      json = {
        診療科: "不明",
        緊急度: "",
        コメント: "AI応答の解析に失敗しました。",
        "自宅でできる対処法": "",
        "注意すべき症状": "",
        "受診時に伝えるとよい情報": "",
        "他の可能性がある診療科": "",
      };
    }

    if (userId && json?.診療科) {
      await prisma.history.create({
        data: {
          userId,
          symptom: String(symptom ?? ""),
          department: String(json.診療科 ?? ""),
          urgency: String(json.緊急度 ?? ""),
          comment: String(json.コメント ?? ""),
          homeCare: String(json["自宅でできる対処法"] ?? ""),
          warningSymptoms: String(json["注意すべき症状"] ?? ""),
          helpfulToTellDoctor: String(json["受診時に伝えるとよい情報"] ?? ""),
          additionalDepartments: String(json["他の可能性がある診療科"] ?? ""),
        },
      });
    }

    return NextResponse.json({ diagnosis: json });
  } catch (error) {
    console.error("[/api/diagnose] error:", error);
    return NextResponse.json(
      {
        diagnosis: {
          診療科: "不明",
          緊急度: "",
          コメント: "診断に失敗しました。現在サーバーが混雑しています。",
          "自宅でできる対処法": "",
          "注意すべき症状": "",
          "受診時に伝えるとよい情報": "",
          "他の可能性がある診療科": "",
        },
      },
      { status: 200 }
    );
  }
}
