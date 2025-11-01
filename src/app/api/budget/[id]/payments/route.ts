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
  };
}

// POST - Add a payment to an expense
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    
    // Validate payment data
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Payment amount is required and must be positive' },
        { status: 400 }
      );
    }

    if (!body.whoPaid) {
      return NextResponse.json(
        { success: false, error: 'Who paid is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get member name
    const member = await Member.findById(body.whoPaid);
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    const whoPaidName = `${member.firstName} ${member.lastName}`;

    // Create payment object
    const payment = {
      amount: body.amount,
      whoPaid: body.whoPaid,
      whoPaidName: whoPaidName,
      datePaid: body.datePaid || new Date(),
      moneyReturned: body.moneyReturned || false,
      notes: body.notes || ''
    };

    // Add payment to expense
    const expense = await BudgetExpense.findById(params.id);
    if (!expense) {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Initialize payments array if it doesn't exist
    if (!expense.payments) {
      expense.payments = [];
    }

    expense.payments.push(payment);
    await expense.save();

    // Convert to object with virtuals
    const expenseObj = expense.toObject({ virtuals: true });

    return NextResponse.json({
      success: true,
      data: expenseObj,
      message: 'Payment added successfully'
    });

  } catch (error) {
    console.error('Add payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update all payments for an expense
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
    
    if (!Array.isArray(body.payments)) {
      return NextResponse.json(
        { success: false, error: 'Payments must be an array' },
        { status: 400 }
      );
    }

    await connectDB();

    // Update expense with new payments array
    const expense = await BudgetExpense.findByIdAndUpdate(
      params.id,
      { payments: body.payments },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Convert to object with virtuals
    const expenseObj = expense.toObject({ virtuals: true });

    return NextResponse.json({
      success: true,
      data: expenseObj,
      message: 'Payments updated successfully'
    });

  } catch (error) {
    console.error('Update payments error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

