declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CreateOrderData {
  amount: number;
  currency: string;
}

interface RazorpayConfig {
  key: string;
  currency: string;
}

export const getRazorpayConfig = (): RazorpayConfig => {
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!key) {
    throw new Error('RazorPay key ID is not configured');
  }
  
  return {
    key,
    currency: 'INR',
  };
};

export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
};

export const createRazorpayOrder = async (data: CreateOrderData) => {
  try {
    const response = await fetch('/api/payments/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating RazorPay order:', error);
    throw error;
  }
};

export const initializeRazorpayPayment = async (orderData: any, config: any) => {
  await loadRazorpayScript();
  
  return new Promise((resolve, reject) => {
    const options = {
      key: config.key,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.id,
      name: 'Onidolus',
      description: 'Payment for your order',
      handler: (response: any) => {
        resolve(response);
      },
      prefill: {
        email: config.email,
        contact: config.phone,
      },
      theme: {
        color: '#6366f1',
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  });
}; 