// src/components/payment/usePaymentLock.ts

import { EventSourcePolyfill, NativeEventSource } from "event-source-polyfill";
import { useEffect, useState } from "react";

const EventSource = EventSourcePolyfill || NativeEventSource;

// API endpoints
const PAYMENT_API = {
  status: "/api/payment/status",
  lock: "/api/payment/lock",
} as const;

// Types
interface PaymentStatus {
  locked: boolean;
}

interface PaymentResponse {
  success: boolean;
}

// API functions
const paymentApi = {
  async start(userId: string): Promise<boolean> {
    try {
      const response = await fetch(PAYMENT_API.lock, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      const data: PaymentResponse = await response.json();
      return data.success;
    } catch (error) {
      console.error("Failed to start payment:", error);
      return false;
    }
  },

  async end(userId: string): Promise<void> {
    try {
      await fetch(PAYMENT_API.lock, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } catch (error) {
      console.error("Failed to end payment:", error);
    }
  },
};

export function usePaymentLock(userId: string) {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const events = new EventSource(PAYMENT_API.status, {
      headers: {
        "x-user-id": userId,
      },
    });

    events.onmessage = (event) => {
      try {
        const data: PaymentStatus = JSON.parse(event.data);
        setIsLocked(data.locked);
      } catch (error) {
        console.error("Failed to parse payment status:", error);
      }
    };

    events.onerror = (error) => {
      console.error("EventSource failed:", error);
    };

    return () => events.close();
  }, [userId]);

  return {
    isLocked,
    startPayment: () => paymentApi.start(userId),
    endPayment: () => paymentApi.end(userId),
  };
}
