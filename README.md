
## 1. Tên đề tài
**Ứng dụng tuyển dụng và tìm kiếm việc làm trên mobile**

## 2. Giới thiệu hệ thống
VietJobMobile là ứng dụng mobile chạy local bằng **Expo + React Native**, dùng **SQLite** để lưu dữ liệu và **AsyncStorage** để lưu phiên đăng nhập.

Hệ thống có 3 vai trò:
- **Ứng viên**
- **Nhà tuyển dụng**
- **Quản trị viên**

Luồng chính của hệ thống:
1. Nhà tuyển dụng đăng tin tuyển dụng
2. Quản trị viên duyệt/từ chối tin
3. Ứng viên xem tin đã duyệt, tạo CV và ứng tuyển
4. Nhà tuyển dụng xem CV và xử lý đơn ứng tuyển


## 3. Danh sách thành viên
| STT | Họ và tên | MSSV | Vai trò |
|---|---|---|---|
| 1 | Trần Minh Quân | 23810310334 | Luồng ứng viên: đăng ký/đăng nhập, khám phá, tìm kiếm, chi tiết việc làm, lưu việc, tạo CV, ứng tuyển, hồ sơ cá nhân |
| 2 | Bạch Gia Bảo | 23810310334 | Luồng Nhà tuyển dụng: tổng quan, hồ sơ công ty, đăng/sửa tin, xem đơn ứng tuyển, xem CV ứng viên |
| 3 | Đinh Quang Hữu | 23810310328 | 	Admin + hệ thống chung: duyệt tin, quản lý tài khoản, database/schema/seed, navigation, service chung |


## 4. Công nghệ sử dụng
- React Native
- Expo SDK 54
- expo-sqlite
- AsyncStorage
- React Navigation
- expo-image-picker
- react-native-safe-area-context
- @expo-google-fonts/inter

## 5. Cấu trúc thư mục chính
```text
src/
  components/
  constants/
  database/
  navigation/
  screens/
    auth/
    candidate/
    employer/
    admin/
  services/
```

## 6. Hướng dẫn cài đặt
### Yêu cầu môi trường
- Node.js
- npm
- Expo Go trên điện thoại

### Cài đặt dự án
```bash
npm install
```

## 7. Link video demo
[Video demo](https://drive.google.com/drive/folders/1GffX2xDrK1WPfchC5pn60OK1F0i7efoe?usp=sharing)

## 8. Link online đã deploy
- Demo Web: [https://vietjob-mobile-web.vercel.app/](https://vietjob-mobile-web.vercel.app/)

## 9. Hướng dẫn chạy project
### Chạy trên máy 
```bash
npx expo start -c
```

### Chạy trên Expo Go
1. Mở Expo Go trên điện thoại
2. Quét QR từ terminal hoặc Expo Dev Tools

## 10. Tài khoản demo
### Ứng viên
- Email: `candidate@vietjob.local`
- Mật khẩu: `candidate123`

### Nhà tuyển dụng
- Email: `employer@vietjob.local`
- Mật khẩu: `employer123`

### Quản trị viên
- Email: `admin@vietjob.local`
- Mật khẩu: `admin123`

## 11. Hình ảnh minh họa hệ thống

<p align="center">
  <img src="assets/imgDemo/z7832161214162_3ea195c99500be9719e329a128e1f700.jpg" width="200" />
  <img src="assets/imgDemo/z7832161228049_03723b74cf1f76849638e13856443ca9.jpg" width="200" />
  <img src="assets/imgDemo/z7832161228140_a23680659cd61e3492e0f10d9a0f527e.jpg" width="200" />
  <img src="assets/imgDemo/z7832161275051_ba8e136b69504014a73065727e102cc1.jpg" width="200" />
  <img src="assets/imgDemo/z7832161275136_1939dffd771e8fea40783fad9689516c.jpg" width="200" />
  <img src="assets/imgDemo/z7832161279888_891cd5b728a93cbc09d4334cd77aa98d.jpg" width="200" />
  <img src="assets/imgDemo/z7832161290107_46755fe129830e6a509ee6942881c84c.jpg" width="200" />
  <img src="assets/imgDemo/z7832161295731_8e1dda0f300750b87b22db62663f722e.jpg" width="200" />
  <img src="assets/imgDemo/z7832161305523_0244dabd1cb5d023ca9490abcd803b84.jpg" width="200" />
  <img src="assets/imgDemo/z7832161400462_46b8d6299741247594d7bace83a311cc.jpg" width="200" />
  <img src="assets/imgDemo/z7832161407617_8fc04f8ee80d7a7509e3e10c4f5cd67b.jpg" width="200" />
  <img src="assets/imgDemo/z7832161417251_364e0e9083bf026e8fcbcfb7597208d2.jpg" width="200" />
  <img src="assets/imgDemo/z7832161421802_54328760827ca059fe8db107f6084400.jpg" width="200" />
  <img src="assets/imgDemo/z7832161422942_f6a7117ea23bfc3dc1a81b081b0bb5a0.jpg" width="200" />
  <img src="assets/imgDemo/z7832161436848_6ecf44db50e83c0cf3cf1f0ca7cfe137.jpg" width="200" />
  <img src="assets/imgDemo/z7832161441296_469ae03e52d5f5f4bae4e156c83f30ef.jpg" width="200" />
  <img src="assets/imgDemo/z7832161441648_1a5e512b60fe84a8944431b7f53e0794.jpg" width="200" />
</p>
