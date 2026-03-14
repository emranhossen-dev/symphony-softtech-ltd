import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tran_id = searchParams.get('tran_id');
    const value_a = searchParams.get('value_a'); // enrollmentId

    console.log('SSLCommerz Payment Cancelled:', {
      tran_id,
      enrollmentId: value_a
    });

    // Update enrollment status to cancelled
    if (value_a) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/enrollments/${value_a}/payment-cancelled`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionId: tran_id,
            status: 'cancelled'
          })
        });
      } catch (updateError) {
        console.error('Error updating enrollment cancellation:', updateError);
      }
    }

    // Redirect to payment cancelled page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/payment/cancelled?enrollment=${value_a}`);

  } catch (error) {
    console.error('SSLCommerz Cancel Handler Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/payment/error`);
  }
}
