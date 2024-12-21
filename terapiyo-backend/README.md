# Terapiyo Backend API

Bu proje, Terapiyo uygulamasının backend API'sini içerir.

## Teknolojiler

- Node.js
- Express.js
- MongoDB
- Socket.IO
- JWT Authentication

## Kurulum

1. Gerekli paketleri yükleyin:
```bash
npm install
```

2. .env dosyasını yapılandırın:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/terapiyo
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:5173
```

3. MongoDB'nin çalıştığından emin olun

4. Uygulamayı başlatın:
```bash
# Geliştirme modu
npm run dev

# Prodüksiyon modu
npm start
```

## API Endpoints

- `GET /`: API durumunu kontrol eder
- `POST /api/auth/register`: Yeni kullanıcı kaydı
- `POST /api/auth/login`: Kullanıcı girişi
- `GET /api/therapists`: Terapist listesi
- `POST /api/appointments`: Randevu oluşturma
- `GET /api/appointments`: Randevuları listeleme

## WebSocket Events

- `connection`: Kullanıcı bağlantısı
- `disconnect`: Kullanıcı ayrılması
- `message`: Mesaj gönderme/alma
- `typing`: Yazma durumu bildirimi
