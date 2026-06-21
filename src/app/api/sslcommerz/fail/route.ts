import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tran_id = searchParams.get('tran_id');
    const value_a = searchParams.get('value_a'); // enrollmentId
    const error = searchParams.get('error');

    console.log('SSLCommerz Payment Failed:', {
      tran_id,
      enrollmentId: value_a,
      error
    });

    // Update enrollment status to failed
    if (value_a) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/enrollments/${value_a}/payment-failed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionId: tran_id,
            error: error || 'Payment failed',
            status: 'failed'
          })
        });
      } catch (updateError) {
        console.error('Failed to update enrollment after payment failure — enrollment status may be stale:', {
          error: updateError instanceof Error ? updateError.message : updateError,
          enrollmentId: value_a,
          transactionId: tran_id,
        });
      }
    }

    // Redirect to payment failed page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/payment/failed?enrollment=${value_a}`);

  } catch (error) {
    console.error('SSLCommerz Fail Handler Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/payment/error`);
  }
}
