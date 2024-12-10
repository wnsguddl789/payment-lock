"use client";

import { useState } from "react";

import { usePaymentLock } from "@/hooks/usePaymentLock";

export function PaymentButton({ userId }: { userId: string }) {
  const { isLocked, startPayment, endPayment } = usePaymentLock(userId);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handlePayment() {
    if (isLocked || isProcessing) return;

    try {
      setIsProcessing(true);
      const locked = await startPayment();

      if (!locked) {
        alert("다른 세션에서 결제가 진행 중입니다.");
        return;
      }

      // 결제 로직 실행
      alert("결제 로직 실행");
    } catch (error) {
      console.error("Payment error:", error);
      alert("결제 중 오류가 발생했습니다.");
    } finally {
      await endPayment();
      setIsProcessing(false);
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLocked || isProcessing}
      className={`px-4 py-2 rounded-lg ${
        isLocked || isProcessing
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600"
      } text-white font-medium transition-colors`}
    >
      {isLocked
        ? "다른 창에서 결제 진행 중"
        : isProcessing
          ? "결제 처리 중..."
          : "결제하기"}
    </button>
  );
}
