import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';
import { verifyAdminToken } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const adminPayload = verifyAdminToken(token);
    if (!adminPayload) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const members = await Member.find({}).sort({ campRole: 1, firstName: 1 });

    // Calculate role distribution
    const roleCounts: Record<string, number> = {};
    const giftParticipation: Record<string, number> = {};
    const skillsDirectory: Record<string, string[]> = {};

    members.forEach(member => {
      // Roles
      roleCounts[member.campRole] = (roleCounts[member.campRole] || 0) + 1;

      // Gift participation
      giftParticipation[member.giftParticipation] = (giftParticipation[member.giftParticipation] || 0) + 1;

      // Skills
      member.specialSkills.forEach(skill => {
        if (!skillsDirectory[skill]) {
          skillsDirectory[skill] = [];
        }
        skillsDirectory[skill].push(`${member.firstName} ${member.lastName}`);
      });
    });

    const roleData = Object.entries(roleCounts).map(([role, count]) => ({
      role, count, percentage: Math.round((count / members.length) * 100)
    }));

    const giftData = Object.entries(giftParticipation).map(([gift, count]) => ({
      gift, count, percentage: Math.round((count / members.length) * 100)
    }));

    const skillsData = Object.entries(skillsDirectory).map(([skill, memberNames]) => ({
      skill, count: memberNames.length, members: memberNames
    })).sort((a, b) => b.count - a.count);

    const responseData = {
      members, roleData, giftData, skillsData, 
      summary: {
        totalMembers: members.length,
        totalRoles: Object.keys(roleCounts).length,
        totalSkills: Object.keys(skillsDirectory).length,
        totalGifts: Object.keys(giftParticipation).length
      }
    };

    if (format === 'csv') {
      const csvHeaders = ['First Name', 'Last Name', 'Email', 'Camp Role', 'Gift Participation', 'Special Skills'].join(',');
      const csvRows = members.map(member => [
        `"${member.firstName}"`, `"${member.lastName}"`, `"${member.email}"`,
        `"${member.campRole}"`, `"${member.giftParticipation}"`, `"${member.specialSkills.join('; ')}"`
      ].join(','));

      return new NextResponse([csvHeaders, ...csvRows].join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="baba-zman-skills-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, data: responseData });

  } catch (error) {
    console.error('Skills report error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
