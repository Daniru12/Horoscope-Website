import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import { requireAdmin } from '@/lib/requireAdmin';
import { toInternational } from '@/lib/sms';

// Both handlers are admin-only: this endpoint edits the bank details customers pay into
// and the number that receives alerts. (Public pages read Settings directly on the server.)

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    await connectToDatabase();
    const settings: any = await Setting.findOne();
    return NextResponse.json(
      settings || { bankName: '', branchName: '', accountNumber: '', accountName: '', mobileNumber: '', email: '', smsNumber: '', smsEnabled: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ message: 'Error fetching settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { bankName, branchName, accountNumber, accountName, mobileNumber, email, smsNumber, smsEnabled } = await req.json();

    if (smsNumber && !toInternational(smsNumber)) {
      return NextResponse.json({ message: 'SMS number is not a valid Sri Lankan mobile number' }, { status: 400 });
    }

    await connectToDatabase();

    const update: Record<string, unknown> = {};
    if (bankName !== undefined) update.bankName = bankName;
    if (branchName !== undefined) update.branchName = branchName;
    if (accountNumber !== undefined) update.accountNumber = accountNumber;
    if (accountName !== undefined) update.accountName = accountName;
    if (mobileNumber !== undefined) update.mobileNumber = mobileNumber;
    if (email !== undefined) update.email = email;
    if (smsNumber !== undefined) update.smsNumber = smsNumber;
    if (smsEnabled !== undefined) update.smsEnabled = !!smsEnabled;

    let settings: any = await Setting.findOne();
    if (settings) {
      Object.assign(settings, update);
      await settings.save();
    } else {
      settings = await Setting.create(update);
    }

    return NextResponse.json({ message: 'Settings updated successfully', settings }, { status: 200 });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ message: 'Error updating settings' }, { status: 500 });
  }
}
