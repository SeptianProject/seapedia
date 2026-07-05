import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import DOMPurify from "isomorphic-dompurify";

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
        { error: "rating harus integer antara 1-5" },
        { status: 400 },
      );
    }

    const sanitizedComment = DOMPurify.sanitize(comment_text.trim(), {
      ALLOWED_TAGS: [],
    });
    const sanitizedName = DOMPurify.sanitize(reviewer_name.trim(), {
      ALLOWED_TAGS: [],
    });

    if (!sanitizedComment) {
      return NextResponse.json(
        { error: "comment_text tidak valid setelah sanitasi" },
        { status: 400 },
      );
    }

    const review = await prisma.appReview.create({
      data: {
        reviewerName: sanitizedName,
        rating,
        commentText: sanitizedComment,
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
