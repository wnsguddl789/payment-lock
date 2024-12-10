// src/app/payment/page.tsx
import { Suspense } from "react";

import { PaymentButton } from "@/components/payment/payment-button";

export default function PaymentPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">결제 페이지</h1>
      <Suspense fallback={<div>로딩 중...</div>}>
        <PaymentButton userId="test-user-id" />
      </Suspense>
    </main>
  );
}
