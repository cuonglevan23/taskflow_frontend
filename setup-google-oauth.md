# 🚀 Setup Google OAuth cho TaskManager

## ⚠️ QUAN TRỌNG: Bạn cần setup Google OAuth credentials để login hoạt động

Hiện tại bạn đang thấy lỗi vì Google OAuth credentials chưa được cấu hình đúng.

## 📋 Các bước setup:

### 1. Tạo Google Cloud Project
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable **Google+ API** và **Google OAuth2 API**

### 2. Tạo OAuth 2.0 Credentials
1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Chọn **Web application**
4. Thêm **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

### 3. Cập nhật Environment Variables
Sao chép Client ID và Client Secret vào file `.env.local`:

```env
# Thay thế các giá trị placeholder bằng credentials thật từ Google Console
GOOGLE_CLIENT_ID=your-real-google-client-id-here
GOOGLE_CLIENT_SECRET=your-real-google-client-secret-here
```

### 4. Restart Development Server
```bash
npm run dev
```

### 5. Test Login
1. Truy cập `http://localhost:3000/login`
2. Click **"Continue with Google"**
3. Bạn sẽ được redirect đến Google OAuth consent screen

## 🔧 Troubleshooting

### Lỗi "redirect_uri_mismatch"
- Đảm bảo redirect URI trong Google Console chính xác: `http://localhost:3000/api/auth/callback/google`
- Không có dấu `/` cuối
- Sử dụng đúng protocol (http cho localhost)

### Lỗi "invalid_client"
- Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET đúng
- Không có khoảng trắng thừa trong .env.local

### Lỗi "access_denied"
- User đã cancel OAuth flow
- Kiểm tra OAuth consent screen configuration

## 🎯 Kết quả mong đợi

Sau khi setup đúng, bạn sẽ thấy:
- Login page với button "Continue with Google"
- Click button sẽ redirect đến Google
- Sau khi authorize, redirect về app với user đã login
- User info hiển thị với role và permissions

## 📝 Notes

- NextAuth.js v5 đã được cấu hình sẵn
- Authentication cũ đã được disable để tránh xung đột
- Middleware đã được setup với role-based protection
- UI components đã được tạo sẵn