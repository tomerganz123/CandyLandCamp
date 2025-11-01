import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BudgetExpense from '@/models/BudgetExpense';
import Member from '@/models/Member';
import { budgetExpenseSchema } from '@/lib/validations';
import { verifyAdminToken } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// POST - Create new budget expense
export async function POST(request: NextRequest) {
  try {
    console.log('Starting budget expense creation...');
    
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
    console.log('Budget expense request received');
    
    // Validate the request body
    const validationResult = budgetExpenseSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    console.log('Connecting to database...');
    await connectDB();

    // If whoPaid is provided, get the member name
    let whoPaidName = '';
    if (validationResult.data.whoPaid) {
      const member = await Member.findById(validationResult.data.whoPaid);
      if (member) {
        whoPaidName = `${member.firstName} ${member.lastName}`;
      }
    }

    // Create new budget expense
    console.log('Creating new budget expense...');
    const budgetExpense = new BudgetExpense({
      ...validationResult.data,
      whoPaidName
    });
    await budgetExpense.save();
    console.log('Budget expense saved successfully');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Budget expense created successfully',
        data: budgetExpense
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Budget expense creation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET - Get all budget expenses (admin only)
export async function GET(request: NextRequest) {
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

    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category') || '';
    const paidStatus = searchParams.get('paidStatus') || '';
    const returnedStatus = searchParams.get('returnedStatus') || '';

    // Build query
    const query: any = {};
    
    if (category) {
      query.costCategory = category;
    }
    
    if (paidStatus === 'paid') {
      query.alreadyPaid = true;
    } else if (paidStatus === 'unpaid') {
      query.alreadyPaid = false;
    }
    
    if (returnedStatus === 'returned') {
      query.moneyReturned = true;
    } else if (returnedStatus === 'not-returned') {
      query.moneyReturned = false;
    }

    // Get budget expenses with pagination
    const expenses = await BudgetExpense.find(query)
      .sort({ dateOfExpense: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await BudgetExpense.countDocuments(query);

    // Calculate statistics with new payment structure
    const stats = await BudgetExpense.aggregate([
      {
        $addFields: {
          // Calculate total paid from payments array
          totalPaidAmount: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ['$payments', []] } }, 0] },
              then: { $sum: '$payments.amount' },
              else: { $cond: ['$alreadyPaid', '$costAmount', 0] } // Legacy fallback
            }
          },
          // Calculate total returned from payments array
          totalReturnedAmount: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ['$payments', []] } }, 0] },
              then: { 
                $sum: {
                  $map: {
                    input: '$payments',
                    as: 'payment',
                    in: { $cond: ['$$payment.moneyReturned', '$$payment.amount', 0] }
                  }
                }
              },
              else: { $cond: ['$moneyReturned', '$costAmount', 0] } // Legacy fallback
            }
          },
          // Check if fully paid
          isFullyPaid: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ['$payments', []] } }, 0] },
              then: { $gte: [{ $sum: '$payments.amount' }, '$costAmount'] },
              else: '$alreadyPaid' // Legacy fallback
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: 1 },
          totalAmount: { $sum: '$costAmount' },
          paidAmount: { $sum: '$totalPaidAmount' },
          unpaidAmount: { $sum: { $subtract: ['$costAmount', '$totalPaidAmount'] } },
          returnedAmount: { $sum: '$totalReturnedAmount' },
          paidExpenses: { 
            $sum: { $cond: ['$isFullyPaid', 1, 0] }
          },
          unpaidExpenses: { 
            $sum: { $cond: ['$isFullyPaid', 0, 1] }
          },
          partiallyPaidExpenses: {
            $sum: {
              $cond: [
                { $and: [
                  { $gt: ['$totalPaidAmount', 0] },
                  { $lt: ['$totalPaidAmount', '$costAmount'] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Category breakdown with new payment structure
    const categoryStats = await BudgetExpense.aggregate([
      {
        $addFields: {
          totalPaidAmount: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ['$payments', []] } }, 0] },
              then: { $sum: '$payments.amount' },
              else: { $cond: ['$alreadyPaid', '$costAmount', 0] }
            }
          }
        }
      },
      {
        $group: {
          _id: '$costCategory',
          count: { $sum: 1 },
          totalAmount: { $sum: '$costAmount' },
          paidAmount: { $sum: '$totalPaidAmount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    return NextResponse.json({
      success: true,
      data: expenses,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      statistics: stats[0] || {
        totalExpenses: 0,
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        returnedAmount: 0,
        paidExpenses: 0,
        unpaidExpenses: 0,
        partiallyPaidExpenses: 0
      },
      categoryStats
    });

  } catch (error) {
    console.error('Get budget expenses error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
