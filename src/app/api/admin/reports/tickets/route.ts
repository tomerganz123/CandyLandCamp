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

    // Calculate ticket status breakdown
    const ticketStatusCounts: Record<string, number> = {};
    const campFeeAcceptance = { accepted: 0, pending: 0 };
    const approvalStatus = { approved: 0, pending: 0 };

    members.forEach(member => {
      // Ticket status
      ticketStatusCounts[member.ticketStatus] = (ticketStatusCounts[member.ticketStatus] || 0) + 1;

      // Camp fee acceptance
      if (member.acceptsCampFee) {
        campFeeAcceptance.accepted++;
      } else {
        campFeeAcceptance.pending++;
      }

      // Approval status
      if (member.isApproved) {
        approvalStatus.approved++;
      } else {
        approvalStatus.pending++;
      }
    });

    // Format data for charts
    const ticketStatusData = Object.entries(ticketStatusCounts).map(([status, count]) => ({
      status: status.replace('Yes I bought via ', '').replace('No - ', ''),
      fullStatus: status,
      count,
      percentage: Math.round((count / members.length) * 100)
    }));

    const campFeeData = [
      { status: 'Accepted', count: campFeeAcceptance.accepted, percentage: Math.round((campFeeAcceptance.accepted / members.length) * 100) },
      { status: 'Pending', count: campFeeAcceptance.pending, percentage: Math.round((campFeeAcceptance.pending / members.length) * 100) }
    ];

    const approvalData = [
      { status: 'Approved', count: approvalStatus.approved, percentage: Math.round((approvalStatus.approved / members.length) * 100) },
      { status: 'Pending', count: approvalStatus.pending, percentage: Math.round((approvalStatus.pending / members.length) * 100) }
    ];

    const responseData = {
      members,
      ticketStatusData,
      campFeeData,
      approvalData,
      summary: {
        totalMembers: members.length,
        ticketStatusCounts,
        campFeeAcceptance,
        approvalStatus
      }
    };

    if (format === 'csv') {
      // Generate CSV for tickets and fees
      const csvHeaders = [
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Ticket Status',
        'Camp Fee Accepted',
        'Approval Status',
        'Registration Date'
      ].join(',');

      const csvRows = members.map(member => [
        `"${member.firstName}"`,
        `"${member.lastName}"`,
        `"${member.email}"`,
        `"${member.phone}"`,
        `"${member.ticketStatus}"`,
        member.acceptsCampFee ? 'Yes' : 'No',
        member.isApproved ? 'Approved' : 'Pending',
        `"${member.createdAt.toISOString()}"`
      ].join(','));

      const csvContent = [csvHeaders, ...csvRows].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="baba-zman-tickets-fees-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });

  } catch (error) {
    console.error('Tickets & fees report error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
