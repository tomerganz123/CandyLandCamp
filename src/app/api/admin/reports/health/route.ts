import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member, { IMember } from '@/models/Member';
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
    const members = await Member.find({}).sort({ firstName: 1 });

    // Calculate dietary restrictions breakdown
    const dietaryCounts: Record<string, number> = {};
    const membersWithMedical: IMember[] = [];
    const membersWithAllergies: IMember[] = [];
    const membersWithDietary: IMember[] = [];

    members.forEach(member => {
      // Dietary restrictions
      member.dietaryRestrictions.forEach((restriction: string) => {
        dietaryCounts[restriction] = (dietaryCounts[restriction] || 0) + 1;
      });
      
      if (member.dietaryRestrictions.length > 0) {
        membersWithDietary.push(member);
      }

      // Medical conditions
      if (member.medicalConditions && member.medicalConditions.trim()) {
        membersWithMedical.push(member);
      }

      // Allergies
      if (member.allergies && member.allergies.trim()) {
        membersWithAllergies.push(member);
      }
    });

    // Format data for charts
    const dietaryData = Object.entries(dietaryCounts).map(([restriction, count]) => ({
      restriction,
      count,
      percentage: Math.round((count / members.length) * 100)
    }));

    const healthSummary = {
      totalMembers: members.length,
      withDietaryRestrictions: membersWithDietary.length,
      withMedicalConditions: membersWithMedical.length,
      withAllergies: membersWithAllergies.length,
      noDietaryRestrictions: members.length - membersWithDietary.length
    };

    const responseData = {
      members,
      dietaryData,
      membersWithMedical,
      membersWithAllergies,
      membersWithDietary,
      healthSummary,
      dietaryCounts
    };

    if (format === 'csv') {
      // Generate CSV for health data
      const csvHeaders = [
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Dietary Restrictions',
        'Medical Conditions',
        'Allergies',
        'Registration Date'
      ].join(',');

      const csvRows = members.map(member => [
        `"${member.firstName}"`,
        `"${member.lastName}"`,
        `"${member.email}"`,
        `"${member.phone}"`,
        `"${member.dietaryRestrictions.join('; ')}"`,
        `"${member.medicalConditions}"`,
        `"${member.allergies}"`,
        `"${member.createdAt.toISOString()}"`
      ].join(','));

      const csvContent = [csvHeaders, ...csvRows].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="baba-zman-health-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });

  } catch (error) {
    console.error('Health report error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
