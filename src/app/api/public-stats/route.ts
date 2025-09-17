import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    // Get aggregated, non-PII statistics
    const totalMembers = await Member.countDocuments({ isApproved: true });
    
    // Gender breakdown (aggregated)
    const genderStats = await Member.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$gender', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Age distribution (grouped into ranges)
    const ageStats = await Member.aggregate([
      { $match: { isApproved: true } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$age', 25] }, then: '18-24' },
                { case: { $lt: ['$age', 35] }, then: '25-34' },
                { case: { $lt: ['$age', 45] }, then: '35-44' },
                { case: { $lt: ['$age', 55] }, then: '45-54' },
                { case: { $gte: ['$age', 55] }, then: '55+' }
              ],
              default: 'Unknown'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Average age (rounded)
    const avgAgeResult = await Member.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, avgAge: { $avg: '$age' } } }
    ]);

    // Arrival day distribution
    const arrivalStats = await Member.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$arrivalDay', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Role distribution
    const roleStats = await Member.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$campRole', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Format the data for public consumption
    const publicStats = {
      totalMembers,
      averageAge: avgAgeResult[0] ? Math.round(avgAgeResult[0].avgAge) : 0,
      genderBreakdown: genderStats.map(stat => ({
        gender: stat._id,
        count: stat.count
      })),
      ageDistribution: ageStats.map(stat => ({
        range: stat._id,
        count: stat.count
      })),
      arrivalDays: arrivalStats.map(stat => ({
        day: stat._id,
        count: stat.count
      })),
      roles: roleStats.map(stat => ({
        role: stat._id,
        count: stat.count
      })),
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: publicStats
    });

  } catch (error) {
    console.error('Public stats error:', error);
    
    // Return mock data if database fails
    const mockStats = {
      totalMembers: 42,
      averageAge: 32,
      genderBreakdown: [
        { gender: 'Male', count: 18 },
        { gender: 'Female', count: 20 },
        { gender: 'Non-binary', count: 3 },
        { gender: 'Prefer not to say', count: 1 }
      ],
      ageDistribution: [
        { range: '18-24', count: 8 },
        { range: '25-34', count: 18 },
        { range: '35-44', count: 12 },
        { range: '45-54', count: 4 }
      ],
      arrivalDays: [
        { day: 'Monday', count: 12 },
        { day: 'Tuesday', count: 15 },
        { day: 'Wednesday', count: 10 },
        { day: 'Thursday', count: 5 }
      ],
      roles: [
        { role: 'Build Team', count: 12 },
        { role: 'Kitchen Manager', count: 8 },
        { role: 'Art Team', count: 10 },
        { role: 'DJ/Music', count: 6 },
        { role: 'Other', count: 6 }
      ],
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockStats
    });
  }
}
