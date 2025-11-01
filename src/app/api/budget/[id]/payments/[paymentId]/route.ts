import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BudgetExpense from '@/models/BudgetExpense';
import Member from '@/models/Member';
import { verifyAdminToken } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
    paymentId: string;
  };
}

// PUT - Update a specific payment
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const adminPayload = verifyAdminToken(token);
    if (!adminPayload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();

    await connectDB();

    const expense = await BudgetExpense.findById(params.id);
    if (!expense) {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Find and update the payment
    const paymentIndex = expense.payments?.findIndex(
      (p: any) => p._id?.toString() === params.paymentId
    );

    if (paymentIndex === -1 || paymentIndex === undefined) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Get member name if whoPaid changed
    let whoPaidName = body.whoPaidName;
    if (body.whoPaid && body.whoPaid !== expense.payments[paymentIndex].whoPaid) {
      const member = await Member.findById(body.whoPaid);
      if (member) {
        whoPaidName = `${member.firstName} ${member.lastName}`;
      }
    }

    // Update the payment
    expense.payments[paymentIndex] = {
      ...expense.payments[paymentIndex],
      ...body,
      whoPaidName
    };

    await expense.save();

    return NextResponse.json({
      success: true,
      data: expense,
      message: 'Payment updated successfully'
    });

  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific payment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const adminPayload = verifyAdminToken(token);
    if (!adminPayload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    await connectDB();

    const expense = await BudgetExpense.findById(params.id);
    if (!expense) {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Filter out the payment
    const initialLength = expense.payments?.length || 0;
    expense.payments = expense.payments?.filter(
      (p: any) => p._id?.toString() !== params.paymentId
    ) || [];

    if (expense.payments.length === initialLength) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    await expense.save();

    return NextResponse.json({
      success: true,
      data: expense,
      message: 'Payment deleted successfully'
    });

  } catch (error) {
    console.error('Delete payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

