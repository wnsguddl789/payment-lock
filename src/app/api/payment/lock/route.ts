// src/app/api/payment/lock/route.ts
import { NextRequest, NextResponse } from "next/server";

import { PaymentLock } from "@/lib/lock";

interface PaymentLockRequest {
  userId: string;
}

const createErrorResponse = (message: string, status = 400) => {
  return NextResponse.json({ success: false, error: message }, { status });
};

const createSuccessResponse = (data: Record<string, unknown>) => {
  return NextResponse.json({ success: true, ...data }, { status: 200 });
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PaymentLockRequest;

    if (!body.userId?.trim()) {
      return createErrorResponse("userId is required");
    }

    const acquired = await PaymentLock.acquire(body.userId);

    if (!acquired) {
      return createErrorResponse("Failed to acquire lock", 409);
    }

    return createSuccessResponse({ locked: true });
  } catch (error) {
    console.error("Error in POST /api/payment/lock:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = (await req.json()) as PaymentLockRequest;

    if (!body.userId?.trim()) {
      return createErrorResponse("userId is required");
    }

    const released = await PaymentLock.release(body.userId);

    if (!released) {
      return createErrorResponse("Failed to release lock", 409);
    }

    return createSuccessResponse({ released: true });
  } catch (error) {
    console.error("Error in DELETE /api/payment/lock:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
