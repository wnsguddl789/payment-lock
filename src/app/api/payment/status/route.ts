// src/app/api/payment/status/route.ts
import { headers } from "next/headers";

import { PaymentLock } from "@/lib/lock";

export async function GET(req: Request) {
  const userId = getUserId();
  if (!userId) {
    return unauthorizedResponse();
  }

  const readable = createReadableStream(userId, req.signal);
  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function getUserId(): string | null {
  const headersList = headers();
  const userId = headersList.get("x-user-id");

  return userId;
}

function unauthorizedResponse(): Response {
  return new Response("Unauthorized", { status: 401 });
}

function createReadableStream(
  userId: string,
  signal: AbortSignal,
): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const sendStatus = async () => {
        const isLocked = await PaymentLock.check(userId);
        const data = encoder.encode(
          `data: ${JSON.stringify({ locked: isLocked })}\n\n`,
        );
        controller.enqueue(data);
      };

      await sendStatus();
      const interval = setInterval(sendStatus, 1000);

      signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });
}
