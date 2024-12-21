import { catchAsync } from '../utils/catch-async.js';
import { ApiError } from '../utils/api-error.js';
import User from '../models/user.model.js';
import logger from '../config/logger.js';

// Profil bilgilerini getir
export const getProfile = catchAsync(async (req, res) => {
  console.log('Get Profile Request:', { userId: req.user._id });
  
  const user = await User.findById(req.user._id)
    .select('-password')
    .lean();

  if (!user) {
    throw new ApiError(404, 'Kullanıcı bulunamadı');
  }

  // Varsayılan değerleri ekle
  const userWithDefaults = {
    _id: user._id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    avatar: user.avatar || '',
    notificationSettings: user.notificationSettings || {
      email: true,
      push: true,
      sms: true
    },
    isVerified: user.isVerified || false,
    sessionCount: user.sessionCount || 0,
    createdAt: user.createdAt
  };

  console.log('Get Profile Response:', { user: userWithDefaults });

  res.status(200).json({
    status: 'success',
    user: userWithDefaults
  });
});

// Profil güncelleme
export const updateProfile = catchAsync(async (req, res) => {
  console.log('Update Profile Request:', { userId: req.user._id, body: req.body });
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      notificationSettings: req.body.notificationSettings || {
        email: true,
        push: true,
        sms: true
      }
    },
    {
      new: true,
      runValidators: true
    }
  )
  .select('-password')
  .lean();

  if (!user) {
    throw new ApiError(404, 'Kullanıcı bulunamadı');
  }

  // Varsayılan değerleri ekle
  const userWithDefaults = {
    _id: user._id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    avatar: user.avatar || '',
    notificationSettings: user.notificationSettings || {
      email: true,
      push: true,
      sms: true
    },
    isVerified: user.isVerified || false,
    sessionCount: user.sessionCount || 0,
    createdAt: user.createdAt
  };

  console.log('Update Profile Response:', { user: userWithDefaults });

  res.status(200).json({
    status: 'success',
    user: userWithDefaults
  });
});

// Avatar güncelleme
export const updateAvatar = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Lütfen bir resim yükleyin');
  }

  // Yüklenen dosya bilgilerini logla
  console.log('Uploaded file:', {
    file: req.file,
    body: req.body,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
    path: req.path
  });

  // Dosya adını kaydet
  const filename = req.file.filename;
  console.log('Saving filename:', filename);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: filename },
    { new: true }
  )
  .select('-password')
  .lean();

  // Varsayılan değerleri ekle
  const userWithDefaults = {
    _id: user._id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    avatar: user.avatar || '',
    notificationSettings: user.notificationSettings || {
      email: true,
      push: true,
      sms: true
    },
    isVerified: user.isVerified || false,
    sessionCount: user.sessionCount || 0,
    createdAt: user.createdAt
  };

  console.log('Update Avatar Response:', { user: userWithDefaults });

  res.status(200).json({
    status: 'success',
    user: userWithDefaults
  });
});

// Şifre güncelleme
export const updatePassword = catchAsync(async (req, res) => {
  logger.info('Update Password Request:', { userId: req.user._id });
  
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Lütfen mevcut ve yeni parolanızı girin');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw new ApiError(404, 'Kullanıcı bulunamadı');
  }

  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Mevcut parola yanlış');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Parola başarıyla güncellendi'
  });
});
