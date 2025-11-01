import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';
import AdditionalInfo from '@/models/AdditionalInfo';
import KitchenShift from '@/models/KitchenShift';
import { verifyAdminToken } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Get all members with their form completion status (admin only)
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

    await connectDB();

    // Get all approved members
    const allMembers = await Member.find({ isApproved: true })
      .select('_id firstName lastName email phone campRole')
      .sort({ lastName: 1, firstName: 1 });

    // Get all members who have submitted additional info
    const additionalInfoSubmissions = await AdditionalInfo.find({}).select('memberId');
    const additionalInfoMemberIds = new Set(
      additionalInfoSubmissions.map(m => m.memberId.toString())
    );

    // Get all members who have registered for kitchen shifts
    const kitchenShiftRegistrations = await KitchenShift.find({}).select('memberId day shiftTime role');
    
    // Group kitchen shifts by member
    const kitchenShiftsByMember = new Map<string, any[]>();
    kitchenShiftRegistrations.forEach(shift => {
      const memberId = shift.memberId.toString();
      if (!kitchenShiftsByMember.has(memberId)) {
        kitchenShiftsByMember.set(memberId, []);
      }
      kitchenShiftsByMember.get(memberId)!.push({
        day: shift.day,
        shiftTime: shift.shiftTime,
        role: shift.role
      });
    });

    // Create comprehensive member list with completion status
    const membersWithStatus = allMembers.map(member => {
      const memberId = member._id.toString();
      const kitchenShifts = kitchenShiftsByMember.get(memberId) || [];
      
      return {
        id: memberId,
        name: `${member.firstName} ${member.lastName}`,
        email: member.email,
        phone: member.phone,
        campRole: member.campRole,
        hasFilledAdditionalInfo: additionalInfoMemberIds.has(memberId),
        hasFilledKitchenShift: kitchenShifts.length > 0,
        kitchenShifts: kitchenShifts,
        kitchenShiftCount: kitchenShifts.length
      };
    });

    // Calculate statistics
    const stats = {
      totalMembers: membersWithStatus.length,
      completedAdditionalInfo: membersWithStatus.filter(m => m.hasFilledAdditionalInfo).length,
      completedKitchenShift: membersWithStatus.filter(m => m.hasFilledKitchenShift).length,
      completedBoth: membersWithStatus.filter(m => m.hasFilledAdditionalInfo && m.hasFilledKitchenShift).length,
      completedNeither: membersWithStatus.filter(m => !m.hasFilledAdditionalInfo && !m.hasFilledKitchenShift).length,
      pendingAdditionalInfo: membersWithStatus.filter(m => !m.hasFilledAdditionalInfo).length,
      pendingKitchenShift: membersWithStatus.filter(m => !m.hasFilledKitchenShift).length
    };

    return NextResponse.json({
      success: true,
      data: membersWithStatus,
      stats
    });

  } catch (error) {
    console.error('Get member completion status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

