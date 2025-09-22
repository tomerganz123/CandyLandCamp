import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FeePayment from '@/models/FeePayment';
import Member from '@/models/Member';
import { feePaymentSchema } from '@/lib/validations';
import { verifyAdminToken } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// POST - Create or update fee payment record
export async function POST(request: NextRequest) {
  try {
    console.log('Starting fee payment update...');
    
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
    console.log('Fee payment request received');
    
    // Validate the request body
    const validationResult = feePaymentSchema.safeParse(body);
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

    // Create or update fee payment record
    console.log('Creating/updating fee payment record...');
    
    // Calculate totalPaid manually since pre-save hooks don't always run with findOneAndUpdate
    let totalPaid = 0;
    if (validationResult.data.firstPaymentPaid) totalPaid += 750;
    if (validationResult.data.secondPaymentPaid) totalPaid += 1250;
    if (validationResult.data.thirdPaymentPaid) totalPaid += 0; // TBD amount
    
    const updateData = {
      ...validationResult.data,
      totalPaid
    };
    
    const feePayment = await FeePayment.findOneAndUpdate(
      { memberId: validationResult.data.memberId },
      updateData,
      { 
        new: true, 
        upsert: true, // Create if doesn't exist
        runValidators: true 
      }
    );
    
    console.log('Fee payment record saved successfully');
    console.log('Updated payment data:', {
      memberId: feePayment.memberId,
      firstPaymentPaid: feePayment.firstPaymentPaid,
      secondPaymentPaid: feePayment.secondPaymentPaid,
      totalPaid: feePayment.totalPaid
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Fee payment updated successfully',
        data: feePayment
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Fee payment update error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET - Get all fee payment records with member data
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
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';

    // Get all approved members first
    const membersQuery: any = { isApproved: true };
    if (search) {
      membersQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const members = await Member.find(membersQuery)
      .sort({ firstName: 1, lastName: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get existing fee payment records
    const memberIds = members.map(m => m._id.toString());
    const existingPayments = await FeePayment.find({ 
      memberId: { $in: memberIds } 
    });

    // Create a map for quick lookup
    const paymentMap = new Map();
    existingPayments.forEach(payment => {
      paymentMap.set(payment.memberId, payment);
    });

    // Combine member data with payment data
    const memberPayments = members.map(member => {
      const existingPayment = paymentMap.get(member._id.toString());
      
      // Recalculate totalPaid for display
      let totalPaid = 0;
      const firstPaid = existingPayment?.firstPaymentPaid || false;
      const secondPaid = existingPayment?.secondPaymentPaid || false;
      const thirdPaid = existingPayment?.thirdPaymentPaid || false;
      
      if (firstPaid) totalPaid += 750;
      if (secondPaid) totalPaid += 1250;
      if (thirdPaid) totalPaid += 0; // TBD amount
      
      return {
        _id: member._id,
        memberId: member._id.toString(),
        memberName: `${member.firstName} ${member.lastName}`,
        memberEmail: member.email,
        memberPhone: member.phone,
        firstPaymentPaid: firstPaid,
        firstPaymentDate: existingPayment?.firstPaymentDate || null,
        firstPaymentNotes: existingPayment?.firstPaymentNotes || '',
        secondPaymentPaid: secondPaid,
        secondPaymentDate: existingPayment?.secondPaymentDate || null,
        secondPaymentNotes: existingPayment?.secondPaymentNotes || '',
        thirdPaymentPaid: thirdPaid,
        thirdPaymentDate: existingPayment?.thirdPaymentDate || null,
        thirdPaymentNotes: existingPayment?.thirdPaymentNotes || '',
        totalPaid,
        createdAt: existingPayment?.createdAt || member.createdAt,
        updatedAt: existingPayment?.updatedAt || member.updatedAt
      };
    });

    // Apply payment status filter if provided
    let filteredPayments = memberPayments;
    if (paymentStatus === 'paid-first') {
      filteredPayments = memberPayments.filter(p => p.firstPaymentPaid);
    } else if (paymentStatus === 'unpaid-first') {
      filteredPayments = memberPayments.filter(p => !p.firstPaymentPaid);
    } else if (paymentStatus === 'paid-second') {
      filteredPayments = memberPayments.filter(p => p.secondPaymentPaid);
    } else if (paymentStatus === 'unpaid-second') {
      filteredPayments = memberPayments.filter(p => !p.secondPaymentPaid);
    } else if (paymentStatus === 'fully-paid') {
      filteredPayments = memberPayments.filter(p => p.firstPaymentPaid && p.secondPaymentPaid);
    } else if (paymentStatus === 'partially-paid') {
      filteredPayments = memberPayments.filter(p => p.firstPaymentPaid || p.secondPaymentPaid);
    } else if (paymentStatus === 'unpaid') {
      filteredPayments = memberPayments.filter(p => !p.firstPaymentPaid && !p.secondPaymentPaid);
    }

    // Calculate statistics based on ALL members (not just paginated)
    const allMembers = await Member.find({ isApproved: true });
    const allMemberIds = allMembers.map(m => m._id.toString());
    const allExistingPayments = await FeePayment.find({ 
      memberId: { $in: allMemberIds } 
    });

    // Create complete member payments data for statistics
    const allMemberPayments = allMembers.map(member => {
      const existingPayment = allExistingPayments.find(p => p.memberId === member._id.toString());
      
      // Recalculate totalPaid to ensure accuracy
      let totalPaid = 0;
      const firstPaid = existingPayment?.firstPaymentPaid || false;
      const secondPaid = existingPayment?.secondPaymentPaid || false;
      const thirdPaid = existingPayment?.thirdPaymentPaid || false;
      
      if (firstPaid) totalPaid += 750;
      if (secondPaid) totalPaid += 1250;
      if (thirdPaid) totalPaid += 0; // TBD amount
      
      return {
        memberId: member._id.toString(),
        firstPaymentPaid: firstPaid,
        secondPaymentPaid: secondPaid,
        thirdPaymentPaid: thirdPaid,
        totalPaid
      };
    });

    const totalMembers = allMemberPayments.length;
    const firstPaymentPaid = allMemberPayments.filter(p => p.firstPaymentPaid).length;
    const secondPaymentPaid = allMemberPayments.filter(p => p.secondPaymentPaid).length;
    const fullyPaid = allMemberPayments.filter(p => p.firstPaymentPaid && p.secondPaymentPaid).length;
    const totalCollected = allMemberPayments.reduce((sum, p) => sum + p.totalPaid, 0);
    const expectedTotal = totalMembers * (750 + 1250); // Total if everyone pays both
    const outstandingAmount = expectedTotal - totalCollected;

    const statistics = {
      totalMembers,
      firstPaymentPaid,
      secondPaymentPaid,
      fullyPaid,
      totalCollected,
      expectedTotal,
      outstandingAmount,
      firstPaymentOutstanding: totalMembers - firstPaymentPaid,
      secondPaymentOutstanding: totalMembers - secondPaymentPaid,
      collectionRate: totalMembers > 0 ? (totalCollected / expectedTotal * 100) : 0
    };

    // Get total count for pagination
    const total = await Member.countDocuments(membersQuery);

    return NextResponse.json({
      success: true,
      data: filteredPayments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      statistics
    });

  } catch (error) {
    console.error('Get fee payments error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
