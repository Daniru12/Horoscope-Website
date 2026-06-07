require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({email: /subarathnayaka21@gmail.com/i});
  console.log('Found user:', user);
  if(user) {
    if(user.role !== 'admin') {
      await db.collection('users').updateOne({_id: user._id}, {$set: {role: 'admin'}});
      console.log('Updated to admin');
    } else {
      console.log('Already admin');
    }
  } else {
    console.log('User not found!');
  }
  process.exit(0);
}

fix().catch(console.error);
