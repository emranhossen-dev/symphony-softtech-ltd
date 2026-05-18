import { NextRequest, NextResponse } from 'next/server';

// SSLCommerz configuration
const SSLCOMMERZ_CONFIG = {
  store_id: process.env.SSLCOMMERZ_STORE_ID || 'test5dc7bed68d60d',
  store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD || 'test5dc7bed68d60d@ssl',
  sandbox: process.env.SSLCOMMERZ_MODE !== 'live',
  currency: 'BDT'
};

export async function POST(request: NextRequest) {
  try {
    const { enrollmentId, amount, courseName, customerInfo } = await request.json();

    // Validate required fields
    if (!enrollmentId || !amount || !courseName || !customerInfo) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create transaction data
    const transactionData = {
      store_id: SSLCOMMERZ_CONFIG.store_id,
      store_passwd: SSLCOMMERZ_CONFIG.store_passwd,
      total_amount: amount.toString(),
      currency: SSLCOMMERZ_CONFIG.currency,
      tran_id: `TRX_${enrollmentId}_${Date.now()}`,
      success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/sslcommerz/success`,
      fail_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/sslcommerz/fail`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/sslcommerz/cancel`,
      ipn_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/sslcommerz/ipn`,
      product_name: courseName,
      product_category: 'Education',
      product_profile: 'general',
      shipping_method: 'NO',
      multi_card_name: '',
      value_a: enrollmentId,
      value_b: courseName,
      value_c: customerInfo.email,
      value_d: customerInfo.phone,
      cus_name: customerInfo.name,
      cus_email: customerInfo.email,
      cus_phone: customerInfo.phone,
      cus_add1: customerInfo.address || 'N/A',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      ship_name: customerInfo.name,
      ship_add1: customerInfo.address || 'N/A',
      ship_city: 'Dhaka',
      ship_country: 'Bangladesh',
    };

    // Make API call to SSLCommerz
    const sslcommerzUrl = SSLCOMMERZ_CONFIG.sandbox 
      ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';

    const formData = new URLSearchParams();
    Object.entries(transactionData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch(sslcommerzUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();

    if (result.status === 'SUCCESS') {
      return NextResponse.json({
        success: true,
        paymentUrl: result.GatewayPageURL,
        transactionId: transactionData.tran_id,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.failedreason || 'Payment initialization failed' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('SSLCommerz API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
