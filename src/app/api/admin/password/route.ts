import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;
    
    // In a real app, you would get the user ID from the session.
    // For this admin password change, we'll assume there's only one admin, 
    // or we'll find the first user with the role 'admin'.
    // A more secure implementation would use NextAuth's getServerSession.
    
    await connectToDatabase();
    
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }
    
    if (admin.password) {
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return NextResponse.json({ message: 'Invalid current password' }, { status: 400 });
      }
    } else {
      // If the admin was created via Google OAuth and has no password,
      // we might want to just set the new password. But usually, an admin should have one.
      // We will proceed to set it.
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    admin.password = hashedPassword;
    await admin.save();
    
    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Update password error:', error);
    return NextResponse.json({ message: 'Error updating password' }, { status: 500 });
  }
}
