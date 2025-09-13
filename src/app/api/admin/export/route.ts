import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';
import { verifyAdminToken } from '@/lib/auth';

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
    const approved = searchParams.get('approved');

    // Build query
    const query: any = {};
    if (approved !== null && approved !== '') {
      query.isApproved = approved === 'true';
    }

    // Get all members matching the query
    const members = await Member.find(query).sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV
      const csvHeaders = [
        'First Name',
        'Last Name', 
        'Email',
        'Phone',
        'Camp Role',
        'Emergency Contact Name',
        'Emergency Contact Phone',
        'Emergency Contact Relationship',
        'Dietary Restrictions',
        'Medical Conditions',
        'Allergies',
        'Arrival Date',
        'Departure Date',
        'Needs Transport',
        'Has Vehicle',
        'Vehicle Details',
        'Special Skills',
        'Previous Burns',
        'Comments',
        'Approved',
        'Registration Date'
      ].join(',');

      const csvRows = members.map(member => [
        `"${member.firstName}"`,
        `"${member.lastName}"`,
        `"${member.email}"`,
        `"${member.phone}"`,
        `"${member.campRole}"`,
        `"${member.emergencyContact.name}"`,
        `"${member.emergencyContact.phone}"`,
        `"${member.emergencyContact.relationship}"`,
        `"${member.dietaryRestrictions.join('; ')}"`,
        `"${member.medicalConditions}"`,
        `"${member.allergies}"`,
        `"${member.arrivalDate.toISOString().split('T')[0]}"`,
        `"${member.departureDate.toISOString().split('T')[0]}"`,
        member.needsTransport ? 'Yes' : 'No',
        member.hasVehicle ? 'Yes' : 'No',
        `"${member.vehicleDetails || ''}"`,
        `"${member.specialSkills.join('; ')}"`,
        member.previousBurns,
        `"${member.comments}"`,
        member.isApproved ? 'Yes' : 'No',
        `"${member.createdAt.toISOString()}"`
      ].join(','));

      const csvContent = [csvHeaders, ...csvRows].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="midburn-camp-members-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Default to JSON export
    return NextResponse.json({
      success: true,
      data: {
        exportDate: new Date().toISOString(),
        totalMembers: members.length,
        members,
      },
    });

  } catch (error) {
    console.error('Export members error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
