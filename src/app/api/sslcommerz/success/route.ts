import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tran_id = searchParams.get('tran_id');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    const value_a = searchParams.get('value_a'); // enrollmentId
    const card_type = searchParams.get('card_type');
    const card_brand = searchParams.get('card_brand');
    const card_issuer = searchParams.get('card_issuer');
    const card_issuer_country = searchParams.get('card_issuer_country');
    const card_issuer_country_code = searchParams.get('card_issuer_country_code');
    const store_id = searchParams.get('store_id');
    const store_amount = searchParams.get('store_amount');
    const bank_tran_id = searchParams.get('bank_tran_id');
    const status_code = searchParams.get('status_code');
    const status = searchParams.get('status');
    const error = searchParams.get('error');
    const risk_level = searchParams.get('risk_level');
    const risk_title = searchParams.get('risk_title');

    // Log payment details
    console.log('SSLCommerz Payment Success:', {
      tran_id,
      amount,
      currency,
      enrollmentId: value_a,
      status,
      card_type,
      card_brand
    });

    // Validate payment
    if (status === 'VALID' || status === 'VALIDATED') {
      // Update enrollment status in database
      if (value_a) {
        try {
          const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/enrollments/${value_a}/payment-success`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transactionId: tran_id,
              amount,
              paymentMethod: 'sslcommerz',
              cardType: card_type,
              cardBrand: card_brand,
              bankTransactionId: bank_tran_id,
              status: 'completed'
            })
          });

          if (updateResponse.ok) {
            // Redirect to success page
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/payment/success?enrollment=${value_a}`);
          }
        } catch (updateError) {
          console.error('Error updating enrollment:', updateError);
        }
      }
    }

    // Redirect to success page even if update fails (for user experience)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/payment/success?enrollment=${value_a}`);

  } catch (error) {
    console.error('SSLCommerz Success Handler Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/payment/error`);
  }
}
