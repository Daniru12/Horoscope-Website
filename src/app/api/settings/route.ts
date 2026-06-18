import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

export async function GET() {
  try {
    await connectToDatabase();
    
    // We only expect one settings document in the database
    let settings = await Setting.findOne();
    
    if (!settings) {
      // Return default empty settings if none exist
      settings = {
        bankName: '',
        accountNumber: '',
        accountName: '',
        mobileNumber: '',
        email: ''
      };
    }
    
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ message: 'Error fetching settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bankName, accountNumber, accountName, mobileNumber, email } = body;
    
    await connectToDatabase();
    
    let settings = await Setting.findOne();
    
    if (settings) {
      settings.bankName = bankName !== undefined ? bankName : settings.bankName;
      settings.accountNumber = accountNumber !== undefined ? accountNumber : settings.accountNumber;
      settings.accountName = accountName !== undefined ? accountName : settings.accountName;
      settings.mobileNumber = mobileNumber !== undefined ? mobileNumber : settings.mobileNumber;
      settings.email = email !== undefined ? email : settings.email;
      await settings.save();
    } else {
      settings = await Setting.create({
        bankName,
        accountNumber,
        accountName,
        mobileNumber,
        email
      });
    }
    
    return NextResponse.json({ message: 'Settings updated successfully', settings }, { status: 200 });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ message: 'Error updating settings' }, { status: 500 });
  }
}
