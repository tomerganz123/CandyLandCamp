import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import KitchenShift from '@/models/KitchenShift';
import { kitchenShiftSchema } from '@/lib/validations';
import { verifyAdminToken } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Shift capacity configuration
const SHIFT_CAPACITY = {
  morning: 5,
  evening: 6
};

// POST - Register for a kitchen shift
export async function POST(request: NextRequest) {
  try {
    console.log('Starting kitchen shift registration...');
    
    const body = await request.json();
    console.log('Kitchen shift registration request received');
    
    // Validate the request body
    const validationResult = kitchenShiftSchema.safeParse(body);
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
    const connectPromise = connectDB();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    console.log('Database connected');

    const { memberId, memberName, memberEmail, day, shiftTime, role } = validationResult.data;

    // Check if member already registered for this shift
    const existingShift = await KitchenShift.findOne({
      memberId,
      day,
      shiftTime
    });

    if (existingShift) {
      return NextResponse.json(
        { success: false, error: 'You are already registered for this shift' },
        { status: 409 }
      );
    }

    // Get all shifts for this specific day/time combination
    const shiftsForDayTime = await KitchenShift.find({ day, shiftTime });
    
    // Count managers and volunteers
    const managerCount = shiftsForDayTime.filter(s => s.role === 'manager').length;
    const volunteerCount = shiftsForDayTime.filter(s => s.role === 'volunteer').length;
    const totalRegistered = shiftsForDayTime.length;
    const capacity = SHIFT_CAPACITY[shiftTime];

    // Smart logic: Check if shift is full
    if (totalRegistered >= capacity) {
      return NextResponse.json(
        { 
          success: false, 
          error: `This shift is full. ${capacity} volunteers are already registered.` 
        },
        { status: 409 }
      );
    }

    // Smart logic: Manager registration
    if (role === 'manager') {
      if (managerCount >= 1) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'This shift already has a manager. Please register as a volunteer instead.' 
          },
          { status: 409 }
        );
      }
    } else {
      // Smart logic: Volunteer registration - managers must be filled first
      if (managerCount < 1) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'A shift manager must be assigned first before volunteers can register. Please check back later or consider becoming the shift manager!' 
          },
          { status: 409 }
        );
      }
    }

    // Create new kitchen shift registration
    console.log('Creating new kitchen shift registration...');
    const kitchenShift = new KitchenShift(validationResult.data);
    await kitchenShift.save();
    console.log('Kitchen shift registration saved successfully');

    // Calculate remaining spots
    const remainingSpots = capacity - totalRegistered - 1;

    return NextResponse.json(
      { 
        success: true, 
        message: `Successfully registered as ${role} for ${day} ${shiftTime} shift`,
        data: { 
          id: kitchenShift._id,
          day,
          shiftTime,
          role,
          remainingSpots
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Kitchen shift registration error:', error);
    
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

// GET - Get available shifts (no auth required for members to see availability)
// Or get all shifts (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const getAvailability = searchParams.get('availability') === 'true';
    
    await connectDB();

    if (getAvailability) {
      // Return availability information for all shifts
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const shiftTimes: ('morning' | 'evening')[] = ['morning', 'evening'];
      
      const availability = [];
      
      for (const day of days) {
        for (const shiftTime of shiftTimes) {
          const shifts = await KitchenShift.find({ day, shiftTime });
          const managerCount = shifts.filter(s => s.role === 'manager').length;
          const volunteerCount = shifts.filter(s => s.role === 'volunteer').length;
          const capacity = SHIFT_CAPACITY[shiftTime];
          const totalRegistered = shifts.length;
          const availableSpots = capacity - totalRegistered;
          const needsManager = managerCount === 0;
          
          availability.push({
            day,
            shiftTime,
            capacity,
            managerCount,
            volunteerCount,
            totalRegistered,
            availableSpots,
            needsManager,
            canRegisterVolunteer: managerCount > 0 && availableSpots > 0,
            canRegisterManager: managerCount === 0 && availableSpots > 0,
            registeredMembers: shifts.map(s => ({
              name: s.memberName,
              role: s.role
            }))
          });
        }
      }
      
      return NextResponse.json({
        success: true,
        data: availability
      });
    } else {
      // Admin access - get all shifts
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

      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '100');

      const shifts = await KitchenShift.find()
        .sort({ day: 1, shiftTime: 1, role: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await KitchenShift.countDocuments();

      return NextResponse.json({
        success: true,
        data: shifts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      });
    }

  } catch (error) {
    console.error('Get kitchen shifts error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a kitchen shift registration (admin only)
export async function DELETE(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const shiftId = searchParams.get('id');

    if (!shiftId) {
      return NextResponse.json(
        { success: false, error: 'Shift ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const deletedShift = await KitchenShift.findByIdAndDelete(shiftId);

    if (!deletedShift) {
      return NextResponse.json(
        { success: false, error: 'Shift not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kitchen shift registration deleted successfully'
    });

  } catch (error) {
    console.error('Delete kitchen shift error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

