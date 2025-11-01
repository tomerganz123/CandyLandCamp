import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Get list of all approved members (public endpoint for forms)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all approved members (no limit - will return all)
    // Explicitly set limit high enough to handle growth
    const allMembers = await Member.find({ isApproved: true })
      .select('_id firstName lastName email')
      .sort({ lastName: 1, firstName: 1 })
      .limit(200); // High limit to ensure we get all members (currently ~65, allows for growth)

    console.log(`Fetched ${allMembers.length} approved members for form dropdown`);

    // Transform to simple format
    const members = allMembers.map(member => ({
      id: member._id.toString(),
      name: `${member.firstName} ${member.lastName}`,
      email: member.email
    }));

    return NextResponse.json({
      success: true,
      data: members,
      total: members.length
    });

  } catch (error) {
    console.error('Get approved members error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

