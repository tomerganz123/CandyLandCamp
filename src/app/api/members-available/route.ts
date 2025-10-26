import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';
import AdditionalInfo from '@/models/AdditionalInfo';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Get list of available members (members who haven't submitted additional info yet)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all members who have been approved
    const allMembers = await Member.find({ isApproved: true }).select('_id firstName lastName email').sort({ lastName: 1 });

    // Get all members who have already submitted additional info
    const submittedMembers = await AdditionalInfo.find({}).select('memberId');

    // Create a set of member IDs who have already submitted
    const submittedMemberIds = new Set(submittedMembers.map(m => m.memberId.toString()));

    // Filter out members who have already submitted
    const availableMembers = allMembers
      .filter(member => !submittedMemberIds.has(member._id.toString()))
      .map(member => ({
        id: member._id.toString(),
        name: `${member.firstName} ${member.lastName}`,
        email: member.email
      }));

    return NextResponse.json({
      success: true,
      data: availableMembers,
      total: availableMembers.length
    });

  } catch (error) {
    console.error('Get available members error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
