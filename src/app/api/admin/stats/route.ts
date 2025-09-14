import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';
import { verifyAdminToken } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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

    // Get basic stats
    const [total, approved, pending] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ isApproved: true }),
      Member.countDocuments({ isApproved: false }),
    ]);

    // Get stats by role
    const roleStats = await Member.aggregate([
      { $group: { _id: '$campRole', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get stats by dietary restrictions
    const dietaryStats = await Member.aggregate([
      { $unwind: { path: '$dietaryRestrictions', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$dietaryRestrictions', count: { $sum: 1 } } },
      { $match: { _id: { $ne: null } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRegistrations = await Member.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Convert aggregation results to objects
    const byRole: Record<string, number> = {};
    roleStats.forEach((item) => {
      byRole[item._id] = item.count;
    });

    const byDietary: Record<string, number> = {};
    dietaryStats.forEach((item) => {
      byDietary[item._id] = item.count;
    });

    return NextResponse.json({
      success: true,
      data: {
        total,
        approved,
        pending,
        recentRegistrations,
        byRole,
        byDietary,
      },
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
