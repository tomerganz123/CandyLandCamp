import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BudgetExpense from '@/models/BudgetExpense';
import Member from '@/models/Member';
import { budgetExpenseSchema } from '@/lib/validations';
import { verifyAdminToken } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Get single budget expense (admin only)
export async function GET(request: NextRequest, { params }: RouteParams) {
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
        { success: false, error: 'Budget expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: expense,
    });

  } catch (error) {
    console.error('Get budget expense error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update budget expense (admin only)
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
    
    // Validate the request body
    const validationResult = budgetExpenseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    await connectDB();

    // If whoPaid is provided, get the member name
    let whoPaidName = '';
    if (validationResult.data.whoPaid) {
      const member = await Member.findById(validationResult.data.whoPaid);
      if (member) {
        whoPaidName = `${member.firstName} ${member.lastName}`;
      }
    }

    const expense = await BudgetExpense.findByIdAndUpdate(
      params.id,
      {
        ...validationResult.data,
        whoPaidName
      },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return NextResponse.json(
        { success: false, error: 'Budget expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: expense,
      message: 'Budget expense updated successfully',
    });

  } catch (error) {
    console.error('Update budget expense error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete budget expense (admin only)
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

    const expense = await BudgetExpense.findByIdAndDelete(params.id);

    if (!expense) {
      return NextResponse.json(
        { success: false, error: 'Budget expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Budget expense deleted successfully',
      data: expense
    });

  } catch (error) {
    console.error('Delete budget expense error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
