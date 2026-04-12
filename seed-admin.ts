
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const AdminSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, default: 'ADMIN' },
}, { collection: 'admins' });

const AdminModel = mongoose.model('Admin', AdminSchema);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);

  const email = 'admin@example.com';
  const password = 'securePassword123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  try {
    // Check if exists
    const exists = await AdminModel.findOne({ email });
    if (exists) {
      console.log('Admin already exists.');
      await mongoose.disconnect();
      return;
    }

    const admin = new AdminModel({
      _id: 'admin-1',
      email,
      passwordHash,
      role: 'ADMIN',
    });

    await admin.save();
    console.log('Admin created successfully.');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
