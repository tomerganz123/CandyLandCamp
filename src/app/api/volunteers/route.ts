import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VolunteerShift from '@/models/VolunteerShift';
import { volunteerShiftSchema } from '@/lib/validations';
import { verifyAdminToken } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// POST - Create new volunteer shift registration
export async function POST(request: NextRequest) {
  try {
    console.log('Starting volunteer shift registration...');
    
    const body = await request.json();
    console.log('Volunteer registration request received');
    
    // Validate the request body
    const validationResult = volunteerShiftSchema.safeParse(body);
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
    // Connect to database with timeout
    const connectPromise = connectDB();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    console.log('Database connected');

    // Check if volunteer already registered for this exact shift
    console.log('Checking for existing volunteer registration...');
    const query: any = {
      email: validationResult.data.email,
      shiftType: validationResult.data.shiftType,
      role: validationResult.data.role
    };
    
    if (validationResult.data.shiftType === 'gift') {
      query.giftName = validationResult.data.giftName;
    } else if (validationResult.data.shiftType === 'camp') {
      query.teamName = validationResult.data.teamName;
    }

    const existingVolunteer = await VolunteerShift.findOne(query);
    if (existingVolunteer) {
      console.log('Volunteer already registered for this shift');
      return NextResponse.json(
        { success: false, error: 'You are already registered for this volunteer shift' },
        { status: 409 }
      );
    }

    // Create new volunteer shift registration
    console.log('Creating new volunteer registration...');
    const volunteerShift = new VolunteerShift(validationResult.data);
    await volunteerShift.save();
    console.log('Volunteer registration saved successfully');

    // Create response message based on shift type
    let shiftDescription = '';
    if (validationResult.data.shiftType === 'gift') {
      shiftDescription = `${validationResult.data.giftName} - ${validationResult.data.role}`;
    } else {
      shiftDescription = `${validationResult.data.teamName} - ${validationResult.data.role}`;
    }

    return NextResponse.json(
      { 
        success: true, 
        message: `Successfully registered for volunteer shift: ${shiftDescription}`,
        data: { 
          id: volunteerShift._id, 
          email: volunteerShift.email,
          shift: shiftDescription
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Volunteer registration error:', error);
    
    // Return specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'Database connection timeout') {
      return NextResponse.json(
        { success: false, error: 'Database connection timeout. Please try again.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET - Get all volunteer registrations (admin only)
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
    const shiftType = searchParams.get('shiftType') || '';
    const giftName = searchParams.get('giftName') || '';
    const teamName = searchParams.get('teamName') || '';
    const role = searchParams.get('role') || '';

    // Build query
    const query: any = {};
    
    if (shiftType) {
      query.shiftType = shiftType;
    }
    
    if (giftName) {
      query.giftName = giftName;
    }
    
    if (teamName) {
      query.teamName = teamName;
    }
    
    if (role) {
      query.role = { $regex: role, $options: 'i' };
    }

    // Get volunteer registrations with pagination
    const volunteers = await VolunteerShift.find(query)
      .sort({ registeredAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await VolunteerShift.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: volunteers,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });

  } catch (error) {
    console.error('Get volunteers error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
