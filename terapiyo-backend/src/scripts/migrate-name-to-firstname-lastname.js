import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

// .env dosyasını yükle
dotenv.config();

const migrateUsers = async () => {
  try {
    // MongoDB'ye bağlan
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI ortam değişkeni tanımlı değil');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB\'ye bağlandı');

    // Tüm kullanıcıları al
    const users = await User.find();
    if (!users) {
      throw new Error('Kullanıcılar alınamadı');
    }
    console.log(`${users.length} kullanıcı bulundu`);

    // Her kullanıcı için
    for (const user of users) {
      try {
        // Kullanıcıyı güncelle
        if (!user._id) {
          throw new Error(`Kullanıcı ID'si tanımlı değil: ${user}`);
        }
        await User.findByIdAndUpdate(user._id, {
          $set: {
            firstName: user.firstName || user.name?.split(' ')[0] || '',
            lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || ''
          },
          $unset: {
            name: ""
          }
        });

        console.log(`Kullanıcı güncellendi: ${user._id}`);
      } catch (error) {
        console.error(`Kullanıcı güncellenirken hata: ${user._id}`, error);
      }
    }

    console.log('Migration tamamlandı');
    process.exit(0);
  } catch (error) {
    console.error('Migration hatası:', error);
    process.exit(1);
  }
};

// Migration'ı başlat
migrateUsers();
