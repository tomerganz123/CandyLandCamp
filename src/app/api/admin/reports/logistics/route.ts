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
    const members = await Member.find({}).sort({ arrivalDay: 1, firstName: 1 });

    // Calculate arrival schedule
    const arrivalSchedule: Record<string, IMember[]> = {};
    const transportationNeeds = { needsRide: 0, hasVehicle: 0, totalSeats: 0 };
    const earlyArrivalTeam: IMember[] = [];
    const departureCommitment = { committed: 0, notCommitted: 0 };
    const vehicleInventory: { member: string; details: string }[] = [];

    members.forEach(member => {
      // Arrival schedule
      const day = member.arrivalDay || 'Unknown';
      if (!arrivalSchedule[day]) {
        arrivalSchedule[day] = [];
      }
      arrivalSchedule[day].push(member);

      // Early arrival team
      if (member.canArriveEarly) {
        earlyArrivalTeam.push(member);
      }

      // Transportation
      if (member.needsTransport) {
        transportationNeeds.needsRide++;
      }
      if (member.hasVehicle) {
        transportationNeeds.hasVehicle++;
        if (member.vehicleDetails) {
          vehicleInventory.push({
            member: `${member.firstName} ${member.lastName}`,
            details: member.vehicleDetails
          });
        }
      }

      // Departure commitment
      if (member.agreesToStayTillSaturday) {
        departureCommitment.committed++;
      } else {
        departureCommitment.notCommitted++;
      }
    });

    // Format arrival schedule for charts
    const arrivalData = Object.entries(arrivalSchedule).map(([day, memberList]) => ({
      day,
      count: memberList.length,
      members: memberList.map(m => `${m.firstName} ${m.lastName}`)
    }));

    const responseData = {
      members,
      arrivalSchedule,
      arrivalData,
      earlyArrivalTeam,
      transportationNeeds,
      departureCommitment,
      vehicleInventory,
      summary: {
        totalMembers: members.length,
        earlyArrivals: earlyArrivalTeam.length,
        needsTransport: transportationNeeds.needsRide,
        hasVehicles: transportationNeeds.hasVehicle,
        committedToSaturday: departureCommitment.committed
      }
    };

    if (format === 'csv') {
      // Generate CSV for logistics
      const csvHeaders = [
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Arrival Day',
        'Can Arrive Early',
        'Needs Transport',
        'Has Vehicle',
        'Vehicle Details',
        'Stays Till Saturday',
        'Registration Date'
      ].join(',');

      const csvRows = members.map(member => [
        `"${member.firstName}"`,
        `"${member.lastName}"`,
        `"${member.email}"`,
        `"${member.phone}"`,
        `"${member.arrivalDay || 'Not specified'}"`,
        member.canArriveEarly ? 'Yes' : 'No',
        member.needsTransport ? 'Yes' : 'No',
        member.hasVehicle ? 'Yes' : 'No',
        `"${member.vehicleDetails || ''}"`,
        member.agreesToStayTillSaturday ? 'Yes' : 'No',
        `"${member.createdAt.toISOString()}"`
      ].join(','));

      const csvContent = [csvHeaders, ...csvRows].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="baba-zman-logistics-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });

  } catch (error) {
    console.error('Logistics report error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
