import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import KitchenShift from '@/models/KitchenShift';
import { verifyAdminToken } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// DELETE - Clear all kitchen shift registrations for a specific member (admin only)
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Delete all kitchen shifts for this member
    const result = await KitchenShift.deleteMany({ memberId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No kitchen shifts found for this member' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} kitchen shift registration(s)`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Clear member kitchen shifts error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


