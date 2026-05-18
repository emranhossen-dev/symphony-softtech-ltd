import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const paymentData = await request.json();
    
    // SSL Commerce Configuration
    const store_id = process.env.SSL_STORE_ID || 'test123';
    const store_password = process.env.SSL_STORE_PASSWORD || 'test123';
    const is_live = process.env.NODE_ENV === 'production';

    const sslcz = {
      store_id: store_id,
      store_passwd: store_password,
      total_amount: paymentData.amount,
      currency: paymentData.currency || 'BDT',
      tran_id: paymentData.tran_id,
      success_url: paymentData.success_url,
      fail_url: paymentData.fail_url,
      cancel_url: paymentData.cancel_url,
      ipn_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/ssl-ipn`,
      shipping_method: 'NO',
      product_name: paymentData.courseName,
      product_category: paymentData.category,
      product_profile: 'general',
      cus_name: paymentData.fullName,
      cus_email: paymentData.email,
      cus_add1: paymentData.address,
      cus_add2: '',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: paymentData.phoneNumber,
      cus_fax: '',
      ship_name: paymentData.fullName,
      ship_add1: paymentData.address,
      ship_add2: '',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: '1000',
      ship_country: 'Bangladesh',
      ship_phone: paymentData.phoneNumber,
      multi_card_name: 'mastercard,visacard,amexcard',
      value_a: paymentData.courseId,
      value_b: paymentData.paymentMethod,
      value_c: paymentData.preferredBatchTime || '',
      value_d: paymentData.educationLevel || '',
    };

    // SSL Commerce API endpoint
    const sslcz_url = is_live 
      ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

    const response = await fetch(sslcz_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(sslcz).toString(),
    });

    const result = await response.json();

    if (result.status === 'SUCCESS') {
      return NextResponse.json({
        success: true,
        gateway_url: result.GatewayURL,
        tran_id: result.tran_id,
        sessionkey: result.sessionkey
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to initiate payment'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('SSL Commerce initiation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Payment initiation failed'
    }, { status: 500 });
  }
}
