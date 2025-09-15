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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Get all members
    const members = await Member.find({}).sort({ createdAt: -1 });

    // Calculate age distribution
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56+': 0
    };

    // Calculate gender breakdown
    const genderCounts: Record<string, number> = {};
    
    // Calculate experience breakdown
    const experienceCounts: Record<string, number> = {
      '0': 0,
      '1': 0,
      '2-3': 0,
      '4-5': 0,
      '6+': 0
    };

    let totalAge = 0;
    let approvedCount = 0;

    members.forEach(member => {
      // Age distribution
      const age = member.age;
      totalAge += age;
      
      if (age >= 18 && age <= 25) ageGroups['18-25']++;
      else if (age >= 26 && age <= 35) ageGroups['26-35']++;
      else if (age >= 36 && age <= 45) ageGroups['36-45']++;
      else if (age >= 46 && age <= 55) ageGroups['46-55']++;
      else if (age >= 56) ageGroups['56+']++;

      // Gender breakdown
      genderCounts[member.gender] = (genderCounts[member.gender] || 0) + 1;

      // Experience breakdown
      const burns = member.previousBurns;
      if (burns === 0) experienceCounts['0']++;
      else if (burns === 1) experienceCounts['1']++;
      else if (burns >= 2 && burns <= 3) experienceCounts['2-3']++;
      else if (burns >= 4 && burns <= 5) experienceCounts['4-5']++;
      else if (burns >= 6) experienceCounts['6+']++;

      // Approval count
      if (member.isApproved) approvedCount++;
    });

    // Format data for charts
    const ageDistribution = Object.entries(ageGroups).map(([ageGroup, count]) => ({
      ageGroup,
      count
    }));

    const genderBreakdown = Object.entries(genderCounts).map(([gender, count]) => ({
      gender,
      count,
      percentage: Math.round((count / members.length) * 100)
    }));

    const experienceBreakdown = Object.entries(experienceCounts).map(([burns, count]) => ({
      burns: burns === '0' ? 'First Timer' : `${burns} Burns`,
      count
    }));

    const totalStats = {
      total: members.length,
      approved: approvedCount,
      pending: members.length - approvedCount,
      averageAge: members.length > 0 ? Math.round(totalAge / members.length) : 0
    };

    const responseData = {
      members,
      ageDistribution,
      genderBreakdown,
      experienceBreakdown,
      totalStats
    };

    if (format === 'csv') {
      // Generate CSV for demographics
      const csvHeaders = [
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'ID Number',
        'Gender',
        'Age',
        'Camp Role',
        'Ticket Status',
        'Previous Burns',
        'Approved',
        'Registration Date'
      ].join(',');

      const csvRows = members.map(member => [
        `"${member.firstName}"`,
        `"${member.lastName}"`,
        `"${member.email}"`,
        `"${member.phone}"`,
        `"${member.idNumber}"`,
        `"${member.gender}"`,
        member.age,
        `"${member.campRole}"`,
        `"${member.ticketStatus}"`,
        member.previousBurns,
        member.isApproved ? 'Yes' : 'No',
        `"${member.createdAt.toISOString()}"`
      ].join(','));

      const csvContent = [csvHeaders, ...csvRows].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="baba-zman-demographics-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });

  } catch (error) {
    console.error('Demographics report error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
