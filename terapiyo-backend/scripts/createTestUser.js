import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/terapiyo';

// Önce eski test kullanıcısını sil
async function deleteTestUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    await mongoose.connection.collection('users').deleteOne({ email: 'test@test.com' });
    console.log('Eski test kullanıcısı silindi');
  } catch (error) {
    console.error('Eski kullanıcı silinirken hata:', error);
  }
}

// Yeni test kullanıcısı oluştur
async function createTestUser() {
  try {
    await deleteTestUser();

    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const testUser = {
      email: 'test@test.com',
      password: hashedPassword,
      name: 'Test User',
      role: 'user',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await mongoose.connection.collection('users').insertOne(testUser);
    console.log('Yeni test kullanıcısı oluşturuldu');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

createTestUser();
