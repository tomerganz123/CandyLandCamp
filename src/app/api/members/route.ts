import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';
import { memberRegistrationSchema } from '@/lib/validations';
import { verifyAdminToken } from '@/lib/auth';

// POST - Create new member registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validationResult = memberRegistrationSchema.safeParse(body);
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

    // Connect to database
    await connectDB();

    // Check if member already exists
    const existingMember = await Member.findOne({ email: validationResult.data.email });
    if (existingMember) {
      return NextResponse.json(
        { success: false, error: 'Member with this email already registered' },
        { status: 409 }
      );
    }

    // Create new member
    const member = new Member(validationResult.data);
    await member.save();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Registration successful! You will receive a confirmation email shortly.',
        data: { id: member._id, email: member.email }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Member registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get all members (admin only)
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
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const approved = searchParams.get('approved');

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (role) {
      query.campRole = role;
    }
    
    if (approved !== null && approved !== '') {
      query.isApproved = approved === 'true';
    }

    // Get members with pagination
    const members = await Member.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Member.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        members,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
