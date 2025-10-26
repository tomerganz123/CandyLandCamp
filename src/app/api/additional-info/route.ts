import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AdditionalInfo from '@/models/AdditionalInfo';
import Member from '@/models/Member';
import { additionalInfoSchema } from '@/lib/validations';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// POST - Submit additional member info
export async function POST(request: NextRequest) {
  try {
    console.log('Starting additional info submission...');
    
    const body = await request.json();
    console.log('Request body received');
    
    // Validate the request body
    const validationResult = additionalInfoSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected');

    // Check if member exists
    console.log('Checking if member exists...');
    const member = await Member.findById(validationResult.data.memberId);
    if (!member) {
      console.log('Member not found');
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    // Check if member has already submitted additional info
    console.log('Checking if member has already submitted...');
    const existingSubmission = await AdditionalInfo.findOne({ memberId: validationResult.data.memberId });
    if (existingSubmission) {
      console.log('Member has already submitted');
      return NextResponse.json(
        { success: false, error: 'You have already submitted your additional information' },
        { status: 409 }
      );
    }

    // Create new additional info
    console.log('Creating additional info record...');
    const dataToSave = {
      ...validationResult.data,
      // Ensure memberName and memberEmail are set
      memberName: validationResult.data.memberName || '',
      memberEmail: validationResult.data.memberEmail || '',
    };
    const additionalInfo = new AdditionalInfo(dataToSave);
    await additionalInfo.save();
    console.log('Additional info saved successfully');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Additional information submitted successfully!',
        data: { id: additionalInfo._id }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Additional info submission error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET - Get all additional info (for admin purposes, can add auth later if needed)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const additionalInfoRecords = await AdditionalInfo.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: additionalInfoRecords,
      total: additionalInfoRecords.length
    });

  } catch (error) {
    console.error('Get additional info error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
