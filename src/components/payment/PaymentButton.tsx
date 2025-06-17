'use client';

import { useState } from 'react';
import { createRazorpayOrder, initializeRazorpayPayment, getRazorpayConfig } from '@/lib/payment/razorpay';
import { useToast } from '@/components/ui/use-toast';

interface PaymentButtonProps {
  amount: number;
  onSuccess: (paymentDetails: any) => void;
  onError: (error: any) => void;
  userEmail?: string;
  userPhone?: string;
}

export default function PaymentButton({
  amount,
  onSuccess,
  onError,
  userEmail,
  userPhone,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRazorPayPayment = async () => {
    try {
      setLoading(true);
      const config = getRazorpayConfig();
      const orderData = await createRazorpayOrder({
        amount,
        currency: 'INR',
      });

      const result = await initializeRazorpayPayment(orderData, {
        ...config,
        email: userEmail,
        phone: userPhone,
      });

      onSuccess(result);
    } catch (error) {
      onError(error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRazorPayPayment}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Pay with RazorPay'}
    </button>
  );
} 