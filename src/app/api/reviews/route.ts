import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface CreateReviewBody {
  reviewer_name: string;
  rating: number;
  comment_text: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateReviewBody = await req.json();
    const { reviewer_name, rating, comment_text } = body;

    if (!reviewer_name?.trim() || !comment_text?.trim()) {
      return NextResponse.json(
        { error: "reviewer_name dan comment_text wajib diisi" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "rating harus berupa integer antara 1-5" },
        { status: 400 },
      );
    }

    const review = await prisma.appReview.create({
      data: {
        reviewerName: reviewer_name.trim(),
        rating,
        commentText: comment_text.trim(),
      },
    });

    return NextResponse.json(
      { message: "Review berhasil ditambahkan", review },
      { status: 201 },
    );
  } catch (error) {
    console.error("[CREATE_REVIEW_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Number(searchParams.get("limit")) || 10);

    const [reviews, total] = await prisma.$transaction([
      prisma.appReview.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.appReview.count(),
    ]);

    return NextResponse.json({
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET_REVIEWS_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
