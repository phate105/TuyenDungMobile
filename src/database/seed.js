import { JOB_STATUS, ROLES, USER_STATUS } from "../constants/appConstants";

const DEMO_PASSWORD = "123456";

const categories = [
  "Công nghệ thông tin",
  "Viễn thông - Hạ tầng số",
  "Ngân hàng - Tài chính",
  "Fintech - Thanh toán số",
  "Thương mại điện tử",
  "Bán lẻ - Chuỗi cửa hàng",
  "Logistics - Kho vận",
  "Sản xuất - Kỹ thuật",
  "Ô tô - Xe máy - EV",
  "Y tế - Dược phẩm",
  "Giáo dục - EdTech",
  "Marketing - Sales - Vận hành",
];

const locations = [
  "An Giang",
  "Bắc Ninh",
  "Cà Mau",
  "Cao Bằng",
  "Cần Thơ",
  "Đà Nẵng",
  "Đắk Lắk",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Phòng",
  "Hưng Yên",
  "Huế",
  "Khánh Hòa",
  "Lai Châu",
  "Lạng Sơn",
  "Lào Cai",
  "Lâm Đồng",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sơn La",
  "TP. Hồ Chí Minh",
  "Tây Ninh",
  "Thái Nguyên",
  "Thanh Hóa",
  "Tuyên Quang",
  "Vĩnh Long",
  "Bình Dương",
  "Toàn quốc",
  "Remote",
  "Hybrid",
];

const companies = [
  {
    name: "CMC Telecom",
    slug: "cmc",
    field: "Viễn thông - Hạ tầng số",
    logoPath: "assets/logos/cmc.png",
    email: "recruitment@cmctelecom.vn",
    phone: "02471068888",
    contactPerson: "Phòng Tuyển dụng CMC Telecom",
    address: "Cầu Giấy, Hà Nội",
    website: "https://cmctelecom.vn",
    size: "1.000 - 4.999 nhân sự",
    groups: ["telecom", "it"],
  },
  {
    name: "FPT",
    slug: "fpt",
    field: "Công nghệ thông tin",
    logoPath: "assets/logos/fpt.png",
    email: "recruitment@fptsoftware.com",
    phone: "02473007300",
    contactPerson: "FPT Talent Acquisition",
    address: "Cầu Giấy, Hà Nội",
    website: "https://fpt.com.vn",
    size: "Trên 10.000 nhân sự",
    groups: ["it", "education"],
  },
  {
    name: "GHN",
    slug: "ghn",
    field: "Logistics - Kho vận",
    logoPath: "assets/logos/ghn.png",
    email: "recruitment@ghn.vn",
    phone: "1900636677",
    contactPerson: "Bộ phận Tuyển dụng GHN",
    address: "Thủ Đức, TP. Hồ Chí Minh",
    website: "https://ghn.vn",
    size: "5.000 - 9.999 nhân sự",
    groups: ["logistics", "operations"],
  },
  {
    name: "Honda Việt Nam",
    slug: "honda",
    field: "Ô tô - Xe máy - EV",
    logoPath: "assets/logos/honda2.png",
    email: "recruitment@honda.com.vn",
    phone: "02113868888",
    contactPerson: "Honda Việt Nam HR",
    address: "Phúc Yên, Vĩnh Phúc",
    website: "https://honda.com.vn",
    size: "5.000 - 9.999 nhân sự",
    groups: ["auto", "manufacturing"],
  },
  {
    name: "KiotViet",
    slug: "kiotviet",
    field: "Công nghệ thông tin",
    logoPath: "assets/logos/kiotviet.jpg",
    email: "careers@kiotviet.vn",
    phone: "02473063868",
    contactPerson: "KiotViet Recruitment",
    address: "Thanh Xuân, Hà Nội",
    website: "https://kiotviet.vn",
    size: "1.000 - 4.999 nhân sự",
    groups: ["it", "ecommerce", "operations"],
  },
  {
    name: "MB Bank",
    slug: "mbbank",
    field: "Ngân hàng - Tài chính",
    logoPath: "assets/logos/mb.png",
    email: "tuyendung@mbbank.com.vn",
    phone: "1900545426",
    contactPerson: "MB Talent Acquisition",
    address: "Đống Đa, Hà Nội",
    website: "https://mbbank.com.vn",
    size: "Trên 10.000 nhân sự",
    groups: ["banking", "fintech"],
  },
  {
    name: "MindX",
    slug: "mindx",
    field: "Giáo dục - EdTech",
    logoPath: "assets/logos/mindx.jpg",
    email: "careers@mindx.edu.vn",
    phone: "0936305888",
    contactPerson: "MindX People Team",
    address: "Ba Đình, Hà Nội",
    website: "https://mindx.edu.vn",
    size: "500 - 999 nhân sự",
    groups: ["education", "it"],
  },
  {
    name: "MoMo",
    slug: "momo",
    field: "Fintech - Thanh toán số",
    logoPath: "assets/logos/momo.png",
    email: "careers@momo.vn",
    phone: "02873055555",
    contactPerson: "MoMo Talent Team",
    address: "Quận 7, TP. Hồ Chí Minh",
    website: "https://momo.vn",
    size: "1.000 - 4.999 nhân sự",
    groups: ["fintech", "it"],
  },
  {
    name: "NashTech",
    slug: "nashtech",
    field: "Công nghệ thông tin",
    logoPath: "assets/logos/nashtech.png",
    email: "careers.vn@nashtechglobal.com",
    phone: "02838248888",
    contactPerson: "NashTech Vietnam Recruitment",
    address: "Quận 1, TP. Hồ Chí Minh",
    website: "https://nashtechglobal.com",
    size: "1.000 - 4.999 nhân sự",
    groups: ["it"],
  },
  {
    name: "Rikkeisoft",
    slug: "rikkeisoft",
    field: "Công nghệ thông tin",
    logoPath: "assets/logos/rkei.png",
    email: "recruitment@rikkeisoft.com",
    phone: "02436231685",
    contactPerson: "Rikkeisoft HR",
    address: "Nam Từ Liêm, Hà Nội",
    website: "https://rikkeisoft.com",
    size: "1.000 - 4.999 nhân sự",
    groups: ["it"],
  },
  {
    name: "Shopee Việt Nam",
    slug: "shopee",
    field: "Thương mại điện tử",
    logoPath: "assets/logos/shopee.png",
    email: "careers.vn@shopee.com",
    phone: "02873001221",
    contactPerson: "Shopee Vietnam Recruitment",
    address: "Quận 1, TP. Hồ Chí Minh",
    website: "https://shopee.vn",
    size: "5.000 - 9.999 nhân sự",
    groups: ["ecommerce", "operations", "logistics"],
  },
  {
    name: "Techcombank",
    slug: "techcombank",
    field: "Ngân hàng - Tài chính",
    logoPath: "assets/logos/techcombank.jpg",
    email: "careers@techcombank.com.vn",
    phone: "1800588822",
    contactPerson: "Techcombank Careers",
    address: "Hoàn Kiếm, Hà Nội",
    website: "https://techcombank.com",
    size: "Trên 10.000 nhân sự",
    groups: ["banking", "it"],
  },
  {
    name: "Thế Giới Di Động",
    slug: "tgdd",
    field: "Bán lẻ - Chuỗi cửa hàng",
    logoPath: "assets/logos/TGDD.jpg",
    email: "tuyendung@thegioididong.com",
    phone: "1900232460",
    contactPerson: "Phòng Tuyển dụng Thế Giới Di Động",
    address: "Tân Bình, TP. Hồ Chí Minh",
    website: "https://thegioididong.com",
    size: "Trên 10.000 nhân sự",
    groups: ["retail", "operations", "ecommerce"],
  },
  {
    name: "TPBank",
    slug: "tpbank",
    field: "Ngân hàng - Tài chính",
    logoPath: "assets/logos/TPBank.jpg",
    email: "recruitment@tpb.com.vn",
    phone: "1900585885",
    contactPerson: "TPBank Recruitment",
    address: "Hoàn Kiếm, Hà Nội",
    website: "https://tpb.vn",
    size: "5.000 - 9.999 nhân sự",
    groups: ["banking", "fintech"],
  },
  {
    name: "Vietcombank",
    slug: "vietcombank",
    field: "Ngân hàng - Tài chính",
    logoPath: "assets/logos/vietcombank.jpg",
    email: "hr@vietcombank.com.vn",
    phone: "1900545413",
    contactPerson: "Vietcombank HR",
    address: "Hoàn Kiếm, Hà Nội",
    website: "https://vietcombank.com.vn",
    size: "Trên 10.000 nhân sự",
    groups: ["banking"],
  },
  {
    name: "Viettel",
    slug: "viettel",
    field: "Viễn thông - Hạ tầng số",
    logoPath: "assets/logos/viettel.png",
    email: "tuyendung@viettel.com.vn",
    phone: "02462556789",
    contactPerson: "Viettel Talent Acquisition",
    address: "Cầu Giấy, Hà Nội",
    website: "https://viettel.com.vn",
    size: "Trên 10.000 nhân sự",
    groups: ["telecom", "it"],
  },
  {
    name: "Viettel Post",
    slug: "viettelpost",
    field: "Logistics - Kho vận",
    logoPath: "assets/logos/viettelpost.png",
    email: "tuyendung@viettelpost.com.vn",
    phone: "19008095",
    contactPerson: "Viettel Post HR",
    address: "Nam Từ Liêm, Hà Nội",
    website: "https://viettelpost.com.vn",
    size: "Trên 10.000 nhân sự",
    groups: ["logistics", "operations"],
  },
  {
    name: "VinFast",
    slug: "vinfast",
    field: "Ô tô - Xe máy - EV",
    logoPath: "assets/logos/vinfast.png",
    email: "careers@vinfastauto.com",
    phone: "1900232389",
    contactPerson: "VinFast Careers",
    address: "Hải Phòng",
    website: "https://vinfastauto.com",
    size: "Trên 10.000 nhân sự",
    groups: ["auto", "manufacturing", "it"],
  },
  {
    name: "VNG",
    slug: "vng",
    field: "Công nghệ thông tin",
    logoPath: "assets/logos/vng.png",
    email: "careers@vng.com.vn",
    phone: "02839623888",
    contactPerson: "VNG Talent Team",
    address: "Quận 7, TP. Hồ Chí Minh",
    website: "https://vng.com.vn",
    size: "1.000 - 4.999 nhân sự",
    groups: ["it"],
  },
  {
    name: "VNPay",
    slug: "vnpay",
    field: "Fintech - Thanh toán số",
    logoPath: "assets/logos/vnpay.jpg",
    email: "recruitment@vnpay.vn",
    phone: "02437764668",
    contactPerson: "VNPay Recruitment",
    address: "Đống Đa, Hà Nội",
    website: "https://vnpay.vn",
    size: "1.000 - 4.999 nhân sự",
    groups: ["fintech", "it"],
  },
  {
    name: "VNPost",
    slug: "vnpost",
    field: "Logistics - Kho vận",
    logoPath: "assets/logos/vnpost.jpg",
    email: "hr@vnpost.vn",
    phone: "1900545481",
    contactPerson: "VNPost HR",
    address: "Hoàn Kiếm, Hà Nội",
    website: "https://vnpost.vn",
    size: "Trên 10.000 nhân sự",
    groups: ["logistics", "operations"],
  },
  {
    name: "VPBank",
    slug: "vpbank",
    field: "Ngân hàng - Tài chính",
    logoPath: "assets/logos/vpbank.jpg",
    email: "careers@vpbank.com.vn",
    phone: "1900545415",
    contactPerson: "VPBank Careers",
    address: "Đống Đa, Hà Nội",
    website: "https://vpbank.com.vn",
    size: "Trên 10.000 nhân sự",
    groups: ["banking", "fintech"],
  },
  {
    name: "WinCommerce",
    slug: "wincommerce",
    field: "Bán lẻ - Chuỗi cửa hàng",
    logoPath: "assets/logos/win.png",
    email: "recruitment@wincommerce.vn",
    phone: "19001908",
    contactPerson: "WinCommerce Recruitment",
    address: "Hai Bà Trưng, Hà Nội",
    website: "https://wincommerce.vn",
    size: "Trên 10.000 nhân sự",
    groups: ["retail", "operations"],
  },
  {
    name: "Yamaha Motor Việt Nam",
    slug: "yamaha",
    field: "Ô tô - Xe máy - EV",
    logoPath: "assets/logos/yamaha2.png",
    email: "careers@yamaha-motor.com.vn",
    phone: "02438868888",
    contactPerson: "Yamaha Motor HR",
    address: "Sóc Sơn, Hà Nội",
    website: "https://yamaha-motor.com.vn",
    size: "1.000 - 4.999 nhân sự",
    groups: ["auto", "manufacturing"],
  },
  {
    name: "Zalo",
    slug: "zalo",
    field: "Công nghệ thông tin",
    logoPath: "assets/logos/zalo.png",
    email: "careers@zalo.me",
    phone: "02839623888",
    contactPerson: "Zalo Talent Team",
    address: "Quận 7, TP. Hồ Chí Minh",
    website: "https://zalo.me",
    size: "1.000 - 4.999 nhân sự",
    groups: ["it"],
  },
  {
    name: "Cốc Cốc",
    slug: "coccoc",
    field: "Công nghệ thông tin",
    logoPath: "assets/logos/coccoc.png",
    email: "careers@coccoc.com",
    phone: "02432001234",
    contactPerson: "Cốc Cốc Recruitment",
    address: "Cầu Giấy, Hà Nội",
    website: "https://coccoc.com",
    size: "500 - 999 nhân sự",
    groups: ["it", "marketing"],
  },
  {
    name: "Sapo",
    slug: "sapo",
    field: "Công nghệ thông tin",
    logoPath: "assets/logos/sapo.png",
    email: "tuyendung@sapo.vn",
    phone: "02473088668",
    contactPerson: "Sapo HR",
    address: "Cầu Giấy, Hà Nội",
    website: "https://sapo.vn",
    size: "500 - 999 nhân sự",
    groups: ["it", "ecommerce", "operations"],
  },
  {
    name: "MISA",
    slug: "misa",
    field: "Công nghệ thông tin",
    logoPath: "assets/logos/missa.png",
    email: "tuyendung@misa.vn",
    phone: "02437629595",
    contactPerson: "MISA HR",
    address: "Cầu Giấy, Hà Nội",
    website: "https://misa.vn",
    size: "1.000 - 4.999 nhân sự",
    groups: ["it", "operations"],
  },
  {
    name: "Coolmate",
    slug: "coolmate",
    field: "Thương mại điện tử",
    logoPath: "assets/logos/coolmate.png",
    email: "careers@coolmate.me",
    phone: "0901882668",
    contactPerson: "Coolmate People Team",
    address: "Đống Đa, Hà Nội",
    website: "https://coolmate.me",
    size: "100 - 499 nhân sự",
    groups: ["ecommerce", "marketing", "operations"],
  },
  {
    name: "Yody",
    slug: "yody",
    field: "Bán lẻ - Chuỗi cửa hàng",
    logoPath: "assets/logos/yody.png",
    email: "tuyendung@yody.vn",
    phone: "18002086",
    contactPerson: "Yody Recruitment",
    address: "Hải Dương",
    website: "https://yody.vn",
    size: "5.000 - 9.999 nhân sự",
    groups: ["retail", "ecommerce", "marketing"],
  },
  {
    name: "Pharmacity",
    slug: "pharmacity",
    field: "Y tế - Dược phẩm",
    logoPath: "assets/logos/pharrmacy.png",
    email: "careers@pharmacity.vn",
    phone: "18006821",
    contactPerson: "Pharmacity HR",
    address: "Quận 7, TP. Hồ Chí Minh",
    website: "https://pharmacity.vn",
    size: "5.000 - 9.999 nhân sự",
    groups: ["healthcare", "retail"],
  },
  {
    name: "Long Châu",
    slug: "longchau",
    field: "Y tế - Dược phẩm",
    logoPath: "assets/logos/longChau.png",
    email: "tuyendung@longchau.com.vn",
    phone: "18006928",
    contactPerson: "Long Châu Recruitment",
    address: "Tân Bình, TP. Hồ Chí Minh",
    website: "https://nhathuoclongchau.com.vn",
    size: "Trên 10.000 nhân sự",
    groups: ["healthcare", "retail"],
  },
  {
    name: "Dat Bike",
    slug: "datbike",
    field: "Ô tô - Xe máy - EV",
    logoPath: "assets/logos/datBike.png",
    email: "careers@dat.bike",
    phone: "0902357788",
    contactPerson: "Dat Bike People Team",
    address: "Quận 7, TP. Hồ Chí Minh",
    website: "https://dat.bike",
    size: "100 - 499 nhân sự",
    groups: ["auto", "manufacturing", "marketing"],
  },
  {
    name: "Manabie",
    slug: "manabie",
    field: "Giáo dục - EdTech",
    logoPath: "assets/logos/manabie.png",
    email: "careers@manabie.com",
    phone: "02873098866",
    contactPerson: "Manabie Talent Team",
    address: "Quận 3, TP. Hồ Chí Minh",
    website: "https://manabie.com",
    size: "500 - 999 nhân sự",
    groups: ["education", "it"],
  },
  {
    name: "Kyna English",
    slug: "kyna",
    field: "Giáo dục - EdTech",
    logoPath: "assets/logos/kyna.png",
    email: "tuyendung@kyna.vn",
    phone: "02873055688",
    contactPerson: "Kyna English HR",
    address: "Quận 1, TP. Hồ Chí Minh",
    website: "https://kynaenglish.vn",
    size: "100 - 499 nhân sự",
    groups: ["education", "marketing"],
  },
  {
    name: "Got It",
    slug: "gotit",
    field: "Giáo dục - EdTech",
    logoPath: "assets/logos/gotIt.png",
    email: "careers@gotitapp.co",
    phone: "02873009988",
    contactPerson: "Got It Careers",
    address: "Quận 7, TP. Hồ Chí Minh",
    website: "https://gotitapp.co",
    size: "100 - 499 nhân sự",
    groups: ["education", "it"],
  },
];

const blueprints = {
  it: [
    ["Thực tập sinh Lập trình Web", "Intern", "Internship", "Công nghệ thông tin"],
    ["Fresher Backend Developer", "Fresher", "Full-time", "Công nghệ thông tin"],
    ["Junior Frontend Developer", "Junior", "Full-time", "Công nghệ thông tin"],
    ["Middle Mobile Developer", "Middle", "Hybrid", "Công nghệ thông tin"],
    ["Senior Software Engineer", "Senior", "Hybrid", "Công nghệ thông tin"],
    ["DevOps Engineer", "Middle", "Full-time", "Công nghệ thông tin"],
    ["QA Automation Engineer", "Junior", "Full-time", "Công nghệ thông tin"],
    ["Data Analyst", "Middle", "Hybrid", "Công nghệ thông tin"],
    ["Product Owner", "Senior", "Full-time", "Công nghệ thông tin"],
    ["AI Engineer", "Senior", "Remote", "Công nghệ thông tin"],
  ],
  telecom: [
    ["Network Operation Engineer", "Junior", "Full-time", "Viễn thông - Hạ tầng số"],
    ["Cloud Infrastructure Engineer", "Middle", "Hybrid", "Viễn thông - Hạ tầng số"],
    ["Cybersecurity Analyst", "Middle", "Full-time", "Viễn thông - Hạ tầng số"],
    ["IT Support Specialist", "Fresher", "Full-time", "Viễn thông - Hạ tầng số"],
    ["Data Center Technician", "Junior", "Full-time", "Viễn thông - Hạ tầng số"],
    ["Presales Cloud Consultant", "Senior", "Hybrid", "Viễn thông - Hạ tầng số"],
    ["NOC Shift Leader", "Lead / Manager", "Full-time", "Viễn thông - Hạ tầng số"],
    ["System Administrator", "Middle", "Full-time", "Viễn thông - Hạ tầng số"],
    ["Security Operations Engineer", "Senior", "Hybrid", "Viễn thông - Hạ tầng số"],
    ["Technical Account Manager", "Lead / Manager", "Full-time", "Viễn thông - Hạ tầng số"],
  ],
  banking: [
    ["Giao dịch viên", "Fresher", "Full-time", "Ngân hàng - Tài chính"],
    ["Chuyên viên Quan hệ khách hàng", "Junior", "Full-time", "Ngân hàng - Tài chính"],
    ["Chuyên viên Tín dụng cá nhân", "Junior", "Full-time", "Ngân hàng - Tài chính"],
    ["Chuyên viên Phân tích rủi ro", "Middle", "Full-time", "Ngân hàng - Tài chính"],
    ["Chuyên viên Ngân hàng số", "Middle", "Hybrid", "Ngân hàng - Tài chính"],
    ["Data Analyst Tài chính", "Middle", "Hybrid", "Ngân hàng - Tài chính"],
    ["Kiểm soát viên Giao dịch", "Senior", "Full-time", "Ngân hàng - Tài chính"],
    ["Quản lý Kinh doanh Chi nhánh", "Lead / Manager", "Full-time", "Ngân hàng - Tài chính"],
    ["Chuyên viên Vận hành thẻ", "Junior", "Full-time", "Ngân hàng - Tài chính"],
    ["Chuyên viên Tuân thủ", "Middle", "Full-time", "Ngân hàng - Tài chính"],
  ],
  fintech: [
    ["Payment Operations Specialist", "Junior", "Full-time", "Fintech - Thanh toán số"],
    ["Fraud Monitoring Analyst", "Middle", "Full-time", "Fintech - Thanh toán số"],
    ["Backend Engineer Payment Gateway", "Middle", "Hybrid", "Fintech - Thanh toán số"],
    ["Product Executive Ví điện tử", "Junior", "Full-time", "Fintech - Thanh toán số"],
    ["Business Analyst Fintech", "Middle", "Hybrid", "Fintech - Thanh toán số"],
    ["Merchant Success Executive", "Junior", "Full-time", "Fintech - Thanh toán số"],
    ["Senior Risk Analyst", "Senior", "Full-time", "Fintech - Thanh toán số"],
    ["QR Payment Partnership Manager", "Lead / Manager", "Full-time", "Fintech - Thanh toán số"],
    ["Data Engineer Transaction", "Senior", "Hybrid", "Fintech - Thanh toán số"],
    ["Customer Experience Specialist", "Fresher", "Full-time", "Fintech - Thanh toán số"],
  ],
  ecommerce: [
    ["E-commerce Executive", "Junior", "Full-time", "Thương mại điện tử"],
    ["Category Management Executive", "Middle", "Full-time", "Thương mại điện tử"],
    ["Campaign Operations Specialist", "Junior", "Full-time", "Thương mại điện tử"],
    ["Marketplace Growth Analyst", "Middle", "Hybrid", "Thương mại điện tử"],
    ["Digital Marketing Executive", "Junior", "Full-time", "Thương mại điện tử"],
    ["CRM Specialist", "Middle", "Hybrid", "Thương mại điện tử"],
    ["Warehouse Planning Executive", "Junior", "Full-time", "Thương mại điện tử"],
    ["Senior Performance Marketing", "Senior", "Full-time", "Thương mại điện tử"],
    ["Livestream Operations Executive", "Fresher", "Part-time", "Thương mại điện tử"],
    ["Head of Online Sales", "Lead / Manager", "Full-time", "Thương mại điện tử"],
  ],
  retail: [
    ["Nhân viên Bán hàng", "Fresher", "Full-time", "Bán lẻ - Chuỗi cửa hàng"],
    ["Thu ngân Cửa hàng", "Fresher", "Full-time", "Bán lẻ - Chuỗi cửa hàng"],
    ["Ca trưởng Cửa hàng", "Junior", "Full-time", "Bán lẻ - Chuỗi cửa hàng"],
    ["Quản lý Cửa hàng", "Lead / Manager", "Full-time", "Bán lẻ - Chuỗi cửa hàng"],
    ["Nhân viên Kho Cửa hàng", "Fresher", "Full-time", "Bán lẻ - Chuỗi cửa hàng"],
    ["Inventory Control Executive", "Junior", "Full-time", "Bán lẻ - Chuỗi cửa hàng"],
    ["Retail Operations Supervisor", "Middle", "Full-time", "Bán lẻ - Chuỗi cửa hàng"],
    ["Customer Service Retail", "Fresher", "Part-time", "Bán lẻ - Chuỗi cửa hàng"],
    ["Merchandising Executive", "Junior", "Full-time", "Bán lẻ - Chuỗi cửa hàng"],
    ["Regional Store Manager", "Lead / Manager", "Full-time", "Bán lẻ - Chuỗi cửa hàng"],
  ],
  logistics: [
    ["Nhân viên Điều phối Giao nhận", "Fresher", "Full-time", "Logistics - Kho vận"],
    ["Nhân viên Kho Vận", "Fresher", "Full-time", "Logistics - Kho vận"],
    ["Route Planner", "Junior", "Full-time", "Logistics - Kho vận"],
    ["Logistics Customer Service", "Fresher", "Full-time", "Logistics - Kho vận"],
    ["Warehouse Supervisor", "Middle", "Full-time", "Logistics - Kho vận"],
    ["Hub Operations Lead", "Lead / Manager", "Full-time", "Logistics - Kho vận"],
    ["Last-mile Operations Analyst", "Middle", "Hybrid", "Logistics - Kho vận"],
    ["Shipper Part-time", "Fresher", "Part-time", "Logistics - Kho vận"],
    ["Fleet Coordinator", "Junior", "Full-time", "Logistics - Kho vận"],
    ["Quality Control Logistics", "Junior", "Full-time", "Logistics - Kho vận"],
  ],
  manufacturing: [
    ["Kỹ thuật viên Sản xuất", "Fresher", "Full-time", "Sản xuất - Kỹ thuật"],
    ["Kỹ sư Quy trình", "Junior", "Full-time", "Sản xuất - Kỹ thuật"],
    ["Maintenance Engineer", "Middle", "Full-time", "Sản xuất - Kỹ thuật"],
    ["QA/QC Engineer", "Junior", "Full-time", "Sản xuất - Kỹ thuật"],
    ["Production Planner", "Middle", "Full-time", "Sản xuất - Kỹ thuật"],
    ["Manufacturing Supervisor", "Lead / Manager", "Full-time", "Sản xuất - Kỹ thuật"],
    ["Supply Chain Executive", "Junior", "Full-time", "Sản xuất - Kỹ thuật"],
    ["Embedded Test Engineer", "Middle", "Full-time", "Sản xuất - Kỹ thuật"],
    ["Mechanical Design Engineer", "Middle", "Full-time", "Sản xuất - Kỹ thuật"],
    ["EHS Officer", "Junior", "Full-time", "Sản xuất - Kỹ thuật"],
  ],
  auto: [
    ["Cố vấn Dịch vụ Ô tô", "Junior", "Full-time", "Ô tô - Xe máy - EV"],
    ["Kỹ thuật viên Bảo trì Xe máy", "Fresher", "Full-time", "Ô tô - Xe máy - EV"],
    ["EV Service Engineer", "Middle", "Full-time", "Ô tô - Xe máy - EV"],
    ["Nhân viên Kinh doanh Xe", "Junior", "Full-time", "Ô tô - Xe máy - EV"],
    ["Embedded Engineer Vehicle", "Senior", "Hybrid", "Ô tô - Xe máy - EV"],
    ["Battery Test Engineer", "Middle", "Full-time", "Ô tô - Xe máy - EV"],
    ["Quality Engineer Automotive", "Middle", "Full-time", "Ô tô - Xe máy - EV"],
    ["Workshop Supervisor", "Lead / Manager", "Full-time", "Ô tô - Xe máy - EV"],
    ["Spare Parts Coordinator", "Junior", "Full-time", "Ô tô - Xe máy - EV"],
    ["Sales Manager Automotive", "Lead / Manager", "Full-time", "Ô tô - Xe máy - EV"],
  ],
  healthcare: [
    ["Dược sĩ Bán thuốc", "Junior", "Full-time", "Y tế - Dược phẩm"],
    ["Phụ tá Nhà thuốc", "Fresher", "Full-time", "Y tế - Dược phẩm"],
    ["Quản lý Nhà thuốc", "Lead / Manager", "Full-time", "Y tế - Dược phẩm"],
    ["Tư vấn Sức khỏe", "Junior", "Full-time", "Y tế - Dược phẩm"],
    ["Inventory Pharmacy Executive", "Junior", "Full-time", "Y tế - Dược phẩm"],
    ["Training Pharmacist", "Middle", "Full-time", "Y tế - Dược phẩm"],
    ["Quality Assurance Pharmacy", "Middle", "Full-time", "Y tế - Dược phẩm"],
    ["Customer Care Healthcare", "Fresher", "Full-time", "Y tế - Dược phẩm"],
    ["Store Opening Executive", "Middle", "Full-time", "Y tế - Dược phẩm"],
    ["Regional Pharmacy Supervisor", "Lead / Manager", "Full-time", "Y tế - Dược phẩm"],
  ],
  education: [
    ["Cố vấn Học tập", "Junior", "Full-time", "Giáo dục - EdTech"],
    ["Giảng viên Lập trình Part-time", "Middle", "Part-time", "Giáo dục - EdTech"],
    ["Giáo viên Tiếng Anh Online", "Junior", "Remote", "Giáo dục - EdTech"],
    ["Learning Content Executive", "Junior", "Hybrid", "Giáo dục - EdTech"],
    ["Class Operations Specialist", "Fresher", "Full-time", "Giáo dục - EdTech"],
    ["Curriculum Developer", "Middle", "Hybrid", "Giáo dục - EdTech"],
    ["Student Success Executive", "Junior", "Full-time", "Giáo dục - EdTech"],
    ["Education Sales Consultant", "Junior", "Full-time", "Giáo dục - EdTech"],
    ["Academic Manager", "Lead / Manager", "Full-time", "Giáo dục - EdTech"],
    ["EdTech Product Analyst", "Middle", "Hybrid", "Giáo dục - EdTech"],
  ],
  marketing: [
    ["Marketing Executive", "Junior", "Full-time", "Marketing - Sales - Vận hành"],
    ["Content Creator", "Fresher", "Full-time", "Marketing - Sales - Vận hành"],
    ["Performance Marketing Specialist", "Middle", "Hybrid", "Marketing - Sales - Vận hành"],
    ["Sales Operations Executive", "Junior", "Full-time", "Marketing - Sales - Vận hành"],
    ["Customer Success Executive", "Junior", "Full-time", "Marketing - Sales - Vận hành"],
    ["Business Development Executive", "Junior", "Full-time", "Marketing - Sales - Vận hành"],
    ["Operations Coordinator", "Fresher", "Full-time", "Marketing - Sales - Vận hành"],
    ["Brand Manager", "Lead / Manager", "Full-time", "Marketing - Sales - Vận hành"],
    ["CRM Marketing Specialist", "Middle", "Hybrid", "Marketing - Sales - Vận hành"],
    ["Key Account Manager", "Lead / Manager", "Full-time", "Marketing - Sales - Vận hành"],
  ],
  operations: [
    ["Operations Executive", "Junior", "Full-time", "Marketing - Sales - Vận hành"],
    ["Customer Service Specialist", "Fresher", "Full-time", "Marketing - Sales - Vận hành"],
    ["Process Improvement Analyst", "Middle", "Hybrid", "Marketing - Sales - Vận hành"],
    ["Training Executive", "Junior", "Full-time", "Marketing - Sales - Vận hành"],
    ["Regional Operations Supervisor", "Lead / Manager", "Full-time", "Marketing - Sales - Vận hành"],
    ["Workforce Planning Executive", "Middle", "Full-time", "Marketing - Sales - Vận hành"],
    ["Quality Assurance Operations", "Junior", "Full-time", "Marketing - Sales - Vận hành"],
    ["Admin Operations Assistant", "Fresher", "Full-time", "Marketing - Sales - Vận hành"],
    ["Partner Support Executive", "Junior", "Full-time", "Marketing - Sales - Vận hành"],
    ["Service Excellence Manager", "Lead / Manager", "Full-time", "Marketing - Sales - Vận hành"],
  ],
};

const locationDetails = [
  "Cầu Giấy, Hà Nội",
  "Nam Từ Liêm, Hà Nội",
  "Quận 1, TP. Hồ Chí Minh",
  "Quận 7, TP. Hồ Chí Minh",
  "Thủ Đức, TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Cần Thơ",
  "Hải Phòng",
  "KCN VSIP, Bình Dương",
  "Biên Hòa, Đồng Nai",
  "Bắc Ninh",
  "Toàn quốc",
  "Remote",
  "Hybrid tại Hà Nội/TP. Hồ Chí Minh",
];

export async function seedDatabase(db) {
  await seedLookup(db, "categories", categories);
  await seedLookup(db, "locations", locations);
  await repairDisplayText(db);
  await cleanupLegacyDemoData(db);
  await seedCoreAccounts(db);

  for (const [companyIndex, company] of companies.entries()) {
    const employer = await upsertEmployer(db, company, companyIndex);
    const companyProfile = await upsertCompanyProfile(db, employer.id, company);
    const jobs = buildJobsForCompany(company, companyIndex);

    await cleanupCompanySeedJobs(db, employer.id, jobs);

    for (const job of jobs) {
      await upsertSeedJob(db, employer.id, companyProfile.id, job);
    }
  }
}

async function seedLookup(db, tableName, values) {
  for (const name of values) {
    await db.runAsync(`INSERT OR IGNORE INTO ${tableName} (name) VALUES (?)`, [name]);
  }
}

async function cleanupLegacyDemoData(db) {
  const legacyCompanies = await db.getAllAsync(
    `
      SELECT id, user_id
      FROM company_profiles
      WHERE company_name LIKE ?
         OR company_name LIKE ?
         OR company_name LIKE ?
         OR user_id IN (SELECT id FROM users WHERE email = ?)
    `,
    ["%Demo VietJob%", "%Công ty Demo%", "%VietJob Demo%", "employer@vietjob.local"]
  );

  for (const company of legacyCompanies) {
    const jobs = await db.getAllAsync("SELECT id FROM jobs WHERE company_id = ?", [company.id]);

    for (const job of jobs) {
      await db.runAsync("DELETE FROM applications WHERE job_id = ?", [job.id]);
      await db.runAsync("DELETE FROM saved_jobs WHERE job_id = ?", [job.id]);
    }

    await db.runAsync("DELETE FROM jobs WHERE company_id = ?", [company.id]);
    await db.runAsync("DELETE FROM company_profiles WHERE id = ?", [company.id]);
  }
}

async function seedCoreAccounts(db) {
  await upsertUser(db, {
    fullName: "Quản trị hệ thống",
    email: "admin@vietjob.local",
    password: "admin123",
    phone: "0900000000",
    role: ROLES.ADMIN,
  });

  await upsertUser(db, {
    fullName: "Nguyễn Văn Ứng Viên",
    email: "candidate@vietjob.local",
    password: "candidate123",
    phone: "0922222222",
    role: ROLES.CANDIDATE,
  });

  const candidate = await db.getFirstAsync("SELECT id FROM users WHERE email = ?", ["candidate@vietjob.local"]);
  const category = await db.getFirstAsync("SELECT id FROM categories WHERE name = ?", ["Công nghệ thông tin"]);
  const location = await db.getFirstAsync("SELECT id FROM locations WHERE name = ?", ["TP. Hồ Chí Minh"]);

  await db.runAsync(
    `
      INSERT INTO candidate_profiles
        (user_id, interested_category, desired_location, category_id, location_id, desired_title, work_type, expected_salary)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        interested_category = excluded.interested_category,
        desired_location = excluded.desired_location,
        category_id = excluded.category_id,
        location_id = excluded.location_id,
        desired_title = excluded.desired_title,
        work_type = excluded.work_type,
        expected_salary = excluded.expected_salary,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      candidate.id,
      "Công nghệ thông tin",
      "TP. Hồ Chí Minh",
      category?.id || null,
      location?.id || null,
      "Mobile Developer",
      "Hybrid",
      "15 - 25 triệu",
    ]
  );

  await upsertUser(db, {
    fullName: "Nhà tuyển dụng Demo",
    email: "employer@vietjob.local",
    password: "employer123",
    phone: "0911111111",
    role: ROLES.EMPLOYER,
  });
}

async function upsertEmployer(db, company, index) {
  await upsertUser(db, {
    fullName: company.contactPerson,
    email: company.email,
    password: DEMO_PASSWORD,
    phone: company.phone,
    role: ROLES.EMPLOYER,
  });

  await upsertUser(db, {
    fullName: `${company.name} Employer Demo`,
    email: `${company.slug}.employer@demo.vn`,
    password: DEMO_PASSWORD,
    phone: buildMobilePhone(index),
    role: ROLES.EMPLOYER,
  });

  return db.getFirstAsync("SELECT id FROM users WHERE email = ?", [company.email]);
}

async function upsertUser(db, user) {
  await db.runAsync(
    `
      INSERT INTO users
        (full_name, email, password, phone, role, status)
      VALUES
        (?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        full_name = excluded.full_name,
        password = excluded.password,
        phone = excluded.phone,
        role = excluded.role,
        status = excluded.status,
        updated_at = CURRENT_TIMESTAMP
    `,
    [user.fullName, user.email, user.password, user.phone, user.role, USER_STATUS.ACTIVE]
  );
}

async function upsertCompanyProfile(db, employerId, company) {
  const description = `${company.name} là doanh nghiệp hoạt động trong lĩnh vực ${company.field.toLowerCase()}, có nhu cầu tuyển dụng thường xuyên tại Việt Nam. Công ty tập trung xây dựng môi trường làm việc chuyên nghiệp, quy trình rõ ràng và cơ hội phát triển năng lực cho nhân sự.`;

  await db.runAsync(
    `
      INSERT INTO company_profiles
        (
          user_id,
          company_name,
          company_field,
          company_address,
          description,
          logo_path,
          website,
          company_size,
          contact_person,
          updated_at
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        company_name = excluded.company_name,
        company_field = excluded.company_field,
        company_address = excluded.company_address,
        description = excluded.description,
        logo_path = excluded.logo_path,
        website = excluded.website,
        company_size = excluded.company_size,
        contact_person = excluded.contact_person,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      employerId,
      company.name,
      company.field,
      company.address,
      description,
      company.logoPath,
      company.website,
      company.size,
      company.contactPerson,
    ]
  );

  return db.getFirstAsync("SELECT id FROM company_profiles WHERE user_id = ? LIMIT 1", [employerId]);
}

function buildJobsForCompany(company, companyIndex) {
  const jobs = [];

  for (let index = 0; index < 5; index += 1) {
    const group = company.groups[index % company.groups.length];
    const template = blueprints[group][(companyIndex + index) % blueprints[group].length];
    const [baseTitle, level, workType, category] = template;
    const locationDetail = pickLocation(company, group, companyIndex, index);
    const salary = getSalary(level, group, workType, index);
    const status = index < 8 ? JOB_STATUS.APPROVED : index === 8 ? JOB_STATUS.PENDING : JOB_STATUS.REJECTED;
    const deadline = buildDeadline(companyIndex, index);

    jobs.push({
      legacyTitle: `${company.slug}-${baseTitle}-${index}`,
      title: baseTitle,
      category,
      location: normalizeLocationForLookup(locationDetail),
      salary,
      workType,
      status,
      rejectReason: status === JOB_STATUS.REJECTED ? "Tin cần bổ sung thêm thông tin quyền lợi hoặc địa điểm làm việc." : null,
      createdAt: buildCreatedAt(companyIndex, index),
      description: buildDescription(company, group, baseTitle, level, locationDetail, workType, deadline),
      requirements: buildRequirements(group, level),
    });
  }

  return jobs;
}

async function cleanupCompanySeedJobs(db, employerId, expectedJobs) {
  const expectedTitles = new Set(expectedJobs.map((job) => normalizeDisplayText(job.title)));
  const rows = await db.getAllAsync("SELECT id, title FROM jobs WHERE employer_id = ?", [employerId]);

  for (const row of rows) {
    const normalizedTitle = normalizeDisplayText(row.title);

    if (expectedTitles.has(normalizedTitle)) {
      continue;
    }

    await db.runAsync("DELETE FROM applications WHERE job_id = ?", [row.id]);
    await db.runAsync("DELETE FROM saved_jobs WHERE job_id = ?", [row.id]);
    await db.runAsync("DELETE FROM jobs WHERE id = ?", [row.id]);
  }
}

function pickLocation(company, group, companyIndex, jobIndex) {
  if (["logistics"].includes(group)) {
    return ["Hà Nội", "TP. Hồ Chí Minh", "KCN VSIP, Bình Dương", "Biên Hòa, Đồng Nai", "Hải Phòng"][
      (companyIndex + jobIndex) % 5
    ];
  }

  if (["retail", "healthcare"].includes(group)) {
    return ["Toàn quốc", "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ"][(companyIndex + jobIndex) % 5];
  }

  if (["auto", "manufacturing"].includes(group)) {
    return ["Hải Phòng", "Bình Dương", "Đồng Nai", "Bắc Ninh", company.address][(companyIndex + jobIndex) % 5];
  }

  if (["education"].includes(group)) {
    return ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Remote", "Hybrid tại Hà Nội/TP. Hồ Chí Minh"][
      (companyIndex + jobIndex) % 5
    ];
  }

  return locationDetails[(companyIndex + jobIndex) % locationDetails.length];
}

function normalizeLocationForLookup(locationDetail) {
  if (locationDetail.includes("TP. Hồ Chí Minh")) {
    return "TP. Hồ Chí Minh";
  }

  if (locationDetail.includes("Hà Nội")) {
    return "Hà Nội";
  }

  if (locationDetail.includes("Đà Nẵng")) {
    return "Đà Nẵng";
  }

  if (locationDetail.includes("Bình Dương")) {
    return "Bình Dương";
  }

  if (locationDetail.includes("Đồng Nai")) {
    return "Đồng Nai";
  }

  if (locationDetail.includes("Bắc Ninh")) {
    return "Bắc Ninh";
  }

  return locations.includes(locationDetail) ? locationDetail : "Toàn quốc";
}

function getSalary(level, group, workType, index) {
  if (workType === "Part-time") {
    return ["25.000 - 35.000/giờ", "30.000 - 45.000/giờ"][index % 2];
  }

  if (["retail", "logistics", "healthcare"].includes(group) && ["Intern", "Fresher", "Junior"].includes(level)) {
    return ["6 - 9 triệu", "8 - 12 triệu", "9 - 14 triệu"][index % 3];
  }

  const ranges = {
    Intern: "3 - 8 triệu",
    Fresher: "7 - 12 triệu",
    Junior: "10 - 18 triệu",
    Middle: "18 - 35 triệu",
    Senior: "30 - 60 triệu",
    "Lead / Manager": "40 - 80 triệu",
  };

  return ranges[level] || "Thương lượng";
}

function buildDescription(company, group, title, level, locationDetail, workType, deadline) {
  const workLines = getWorkLines(group, title, level);
  const benefits = getBenefits(group, level);
  const schedule = getSchedule(group, workType);

  return [
    "Mô tả công việc:",
    ...workLines.map((line) => `- ${line}`),
    "",
    "Quyền lợi:",
    ...benefits.map((line) => `- ${line}`),
    "",
    "Địa điểm làm việc:",
    `- ${locationDetail}`,
    "",
    "Thời gian làm việc:",
    `- ${schedule}`,
    "",
    "Hạn nộp hồ sơ:",
    `- ${deadline}`,
    "",
    `Thông tin thêm: Vị trí thuộc ${company.name}, phù hợp ứng viên muốn phát triển trong lĩnh vực ${company.field.toLowerCase()}.`,
  ].join("\n");
}

function getWorkLines(group, title, level) {
  const commonLead = level === "Lead / Manager" ? "Quản lý kế hoạch, phân công công việc và theo dõi KPI của nhóm." : null;

  const map = {
    it: [
      `Phát triển và bảo trì tính năng cho sản phẩm phần mềm ở vị trí ${title}.`,
      "Phối hợp với BA, QA và Product Owner để phân tích yêu cầu.",
      "Tối ưu hiệu năng API, database query và trải nghiệm người dùng.",
      "Tham gia review code, xử lý lỗi và cải thiện chất lượng sản phẩm.",
    ],
    telecom: [
      `Vận hành hệ thống mạng, cloud hoặc hạ tầng số theo phạm vi của vị trí ${title}.`,
      "Theo dõi cảnh báo, xử lý sự cố và phối hợp với các nhóm kỹ thuật liên quan.",
      "Cập nhật tài liệu cấu hình, quy trình vận hành và báo cáo chất lượng dịch vụ.",
      "Đề xuất cải tiến bảo mật, hiệu năng và độ ổn định của hệ thống.",
    ],
    banking: [
      `Tư vấn, phân tích hoặc vận hành nghiệp vụ ngân hàng theo vị trí ${title}.`,
      "Xử lý hồ sơ khách hàng, đánh giá dữ liệu và tuân thủ quy trình nội bộ.",
      "Phối hợp với bộ phận vận hành, pháp chế và rủi ro để hoàn tất giao dịch.",
      "Theo dõi danh mục khách hàng và đảm bảo chất lượng dịch vụ.",
    ],
    fintech: [
      `Theo dõi và vận hành sản phẩm thanh toán số ở vị trí ${title}.`,
      "Phân tích giao dịch, xử lý đối soát và hỗ trợ merchant khi có phát sinh.",
      "Phối hợp với Product, Risk và Engineering để cải thiện trải nghiệm thanh toán.",
      "Cập nhật báo cáo vận hành, rủi ro và chất lượng giao dịch hằng tuần.",
    ],
    ecommerce: [
      `Triển khai hoạt động thương mại điện tử theo vai trò ${title}.`,
      "Theo dõi ngành hàng, campaign, tồn kho hoặc hiệu quả bán hàng trên kênh online.",
      "Phối hợp với marketing, vận hành và kho để đảm bảo tiến độ chương trình.",
      "Phân tích dữ liệu đơn hàng và đề xuất tối ưu tăng trưởng.",
    ],
    retail: [
      `Vận hành hoạt động bán lẻ hoặc cửa hàng theo vị trí ${title}.`,
      "Tư vấn sản phẩm, hỗ trợ khách hàng và đảm bảo quy trình phục vụ.",
      "Sắp xếp hàng hóa, kiểm tra tồn kho và phối hợp xử lý đơn hàng.",
      "Theo dõi chỉ tiêu doanh số, chất lượng dịch vụ và hình ảnh cửa hàng.",
    ],
    logistics: [
      `Điều phối đơn hàng, tuyến giao nhận hoặc kho vận theo vị trí ${title}.`,
      "Theo dõi tiến độ giao hàng và xử lý phát sinh trong quá trình vận chuyển.",
      "Làm việc với shipper, kho và bộ phận chăm sóc khách hàng.",
      "Cập nhật dữ liệu vận hành lên hệ thống và báo cáo theo ca.",
    ],
    manufacturing: [
      `Tham gia vận hành, cải tiến hoặc kiểm soát kỹ thuật sản xuất ở vị trí ${title}.`,
      "Theo dõi chỉ số sản xuất, chất lượng và tình trạng thiết bị.",
      "Phối hợp với QA/QC, bảo trì và kế hoạch để xử lý lỗi phát sinh.",
      "Đề xuất cải tiến quy trình nhằm tăng năng suất và giảm lãng phí.",
    ],
    auto: [
      `Thực hiện công việc kỹ thuật, dịch vụ hoặc kinh doanh trong ngành xe ở vị trí ${title}.`,
      "Phối hợp với xưởng dịch vụ, showroom hoặc bộ phận sản phẩm để hỗ trợ khách hàng.",
      "Theo dõi chất lượng xe, linh kiện hoặc tiến độ xử lý yêu cầu sau bán.",
      "Cập nhật dữ liệu kỹ thuật, bán hàng hoặc bảo hành trên hệ thống.",
    ],
    healthcare: [
      `Tư vấn, vận hành hoặc quản lý hoạt động nhà thuốc theo vị trí ${title}.`,
      "Hỗ trợ khách hàng về sản phẩm chăm sóc sức khỏe và quy trình mua hàng.",
      "Kiểm tra tồn kho, hạn dùng và tiêu chuẩn trưng bày sản phẩm.",
      "Tuân thủ quy định chuyên môn, quy trình bán thuốc và chăm sóc khách hàng.",
    ],
    education: [
      `Hỗ trợ học viên, giảng viên hoặc sản phẩm học tập ở vị trí ${title}.`,
      "Theo dõi tiến độ học tập, lịch học và dữ liệu học viên trên hệ thống.",
      "Phối hợp với giảng viên, phụ huynh hoặc đội vận hành để xử lý phát sinh.",
      "Đề xuất cải thiện trải nghiệm học tập và chất lượng lớp học.",
    ],
    marketing: [
      `Triển khai hoạt động marketing, sales hoặc vận hành tăng trưởng ở vị trí ${title}.`,
      "Lập kế hoạch nội dung, campaign hoặc chăm sóc khách hàng theo mục tiêu kinh doanh.",
      "Theo dõi chỉ số hiệu quả, phối hợp với các bộ phận để tối ưu kết quả.",
      "Báo cáo tiến độ, đề xuất thử nghiệm mới và cải thiện quy trình.",
    ],
    operations: [
      `Điều phối quy trình vận hành nội bộ ở vị trí ${title}.`,
      "Theo dõi dữ liệu vận hành, chất lượng dịch vụ và tiến độ xử lý yêu cầu.",
      "Làm việc với các bộ phận liên quan để xử lý vấn đề phát sinh.",
      "Chuẩn hóa tài liệu, quy trình và báo cáo kết quả định kỳ.",
    ],
  };

  return commonLead ? [commonLead, ...map[group].slice(1)] : map[group];
}

function buildRequirements(group, level) {
  const base = {
    it: ["Có nền tảng JavaScript/TypeScript, Java, .NET hoặc ngôn ngữ tương đương.", "Hiểu REST API, cơ sở dữ liệu và quy trình Git.", "Có tư duy giải quyết vấn đề, biết phối hợp trong nhóm Agile/Scrum."],
    telecom: ["Có kiến thức mạng, cloud, Linux hoặc bảo mật hệ thống.", "Biết đọc log, phân tích sự cố và viết tài liệu vận hành.", "Ưu tiên có chứng chỉ CCNA, Linux hoặc Cloud cơ bản."],
    banking: ["Tốt nghiệp Tài chính, Ngân hàng, Kế toán, Kinh tế hoặc ngành liên quan.", "Cẩn thận, trung thực và tuân thủ quy trình.", "Có kỹ năng giao tiếp, phân tích số liệu và xử lý hồ sơ."],
    fintech: ["Hiểu quy trình thanh toán, đối soát hoặc vận hành sản phẩm số.", "Có khả năng phân tích dữ liệu giao dịch và xử lý tình huống.", "Ưu tiên kinh nghiệm ví điện tử, ngân hàng số hoặc payment gateway."],
    ecommerce: ["Hiểu hoạt động thương mại điện tử, marketplace hoặc vận hành bán hàng online.", "Sử dụng tốt Excel/Google Sheet và biết đọc chỉ số kinh doanh.", "Có khả năng phối hợp với marketing, kho và chăm sóc khách hàng."],
    retail: ["Giao tiếp tốt, nhanh nhẹn và có tinh thần phục vụ khách hàng.", "Có thể làm việc theo ca và tuân thủ quy trình cửa hàng.", "Không yêu cầu kinh nghiệm với vị trí đầu vào; sẽ được đào tạo."],
    logistics: ["Có kỹ năng tổ chức công việc và xử lý tình huống.", "Sử dụng được Excel hoặc phần mềm quản lý đơn hàng.", "Có thể làm việc theo ca nếu vị trí yêu cầu."],
    manufacturing: ["Tốt nghiệp kỹ thuật, cơ khí, điện, tự động hóa hoặc ngành liên quan.", "Hiểu quy trình sản xuất, chất lượng hoặc bảo trì thiết bị.", "Cẩn thận, tuân thủ an toàn lao động và có khả năng làm việc tại nhà máy."],
    auto: ["Có kiến thức cơ khí, điện, ô tô, xe máy hoặc xe điện theo vị trí.", "Giao tiếp tốt với khách hàng hoặc đội kỹ thuật.", "Ưu tiên kinh nghiệm showroom, xưởng dịch vụ hoặc sản xuất xe."],
    healthcare: ["Có bằng cấp/chứng chỉ phù hợp nếu ứng tuyển vị trí dược sĩ.", "Cẩn thận, trung thực và tuân thủ quy trình chuyên môn.", "Giao tiếp tốt, có thái độ phục vụ khách hàng tích cực."],
    education: ["Yêu thích lĩnh vực giáo dục và có kỹ năng giao tiếp tốt.", "Có khả năng chăm sóc học viên, vận hành lớp hoặc giảng dạy.", "Ưu tiên kinh nghiệm EdTech, tư vấn giáo dục hoặc đào tạo."],
    marketing: ["Có tư duy khách hàng, biết lập kế hoạch và theo dõi chỉ số.", "Giao tiếp tốt, chủ động và có khả năng phối hợp liên phòng ban.", "Ưu tiên kinh nghiệm marketing, sales, CSKH hoặc vận hành."],
    operations: ["Có kỹ năng tổ chức công việc, quản lý dữ liệu và xử lý vấn đề.", "Sử dụng tốt Excel/Google Sheet, ưu tiên biết công cụ quản lý quy trình.", "Cẩn thận, chủ động và có khả năng phối hợp nhiều bộ phận."],
  };

  const levelRequirement = {
    Intern: "Chấp nhận sinh viên năm cuối hoặc ứng viên mới bắt đầu, có tinh thần học hỏi.",
    Fresher: "Có kiến thức nền tảng và sẵn sàng được đào tạo theo quy trình công ty.",
    Junior: "Có ít nhất 6 tháng đến 1 năm kinh nghiệm ở vị trí tương đương.",
    Middle: "Có 2 đến 4 năm kinh nghiệm và có thể xử lý công việc độc lập.",
    Senior: "Có trên 4 năm kinh nghiệm, biết hướng dẫn thành viên khác và xử lý bài toán phức tạp.",
    "Lead / Manager": "Có kinh nghiệm quản lý nhóm, lập kế hoạch, theo dõi KPI và cải tiến quy trình.",
  };

  return ["Yêu cầu ứng viên:", ...base[group].map((line) => `- ${line}`), `- ${levelRequirement[level]}`].join("\n");
}

function getBenefits(group, level) {
  const common = ["Lương cạnh tranh theo năng lực và kinh nghiệm.", "Review hiệu quả công việc định kỳ.", "Bảo hiểm và phúc lợi theo chính sách công ty."];

  if (["retail", "logistics", "healthcare"].includes(group)) {
    return ["Lương cứng, phụ cấp ca và thưởng theo hiệu quả.", "Được đào tạo quy trình nghiệp vụ trước khi nhận việc.", "Cơ hội phát triển lên ca trưởng, giám sát hoặc quản lý.", "Chính sách phúc lợi và bảo hiểm theo quy định."];
  }

  if (group === "education") {
    return ["Môi trường giáo dục trẻ, nhiều cơ hội học hỏi.", "Được đào tạo sản phẩm, kỹ năng tư vấn hoặc phương pháp giảng dạy.", "Thưởng theo hiệu quả công việc hoặc chất lượng lớp học.", "Có cơ hội tham gia xây dựng chương trình học mới."];
  }

  if (level === "Intern") {
    return ["Có mentor hướng dẫn trong quá trình thực tập.", "Hỗ trợ phụ cấp thực tập theo năng lực.", "Được tham gia dự án thực tế và đánh giá chuyển chính thức.", "Môi trường làm việc rõ quy trình, phù hợp sinh viên mới ra trường."];
  }

  return [...common, "Hỗ trợ thiết bị làm việc, đào tạo nội bộ và cơ hội thăng tiến rõ ràng."];
}

function getSchedule(group, workType) {
  if (workType === "Remote") {
    return "Làm việc từ xa, họp online theo lịch nhóm.";
  }

  if (workType === "Hybrid") {
    return "Hybrid 2-3 ngày/tuần tại văn phòng, Thứ 2 - Thứ 6.";
  }

  if (["retail", "healthcare"].includes(group)) {
    return "Làm xoay ca 8 tiếng/ngày, 6 ngày/tuần; ca sáng 08:00 - 16:00 hoặc ca chiều 14:00 - 22:00.";
  }

  if (group === "logistics") {
    return "Làm theo ca vận hành; ca ngày 08:00 - 17:00 hoặc ca tối 13:00 - 22:00 tùy kho/bưu cục.";
  }

  if (["manufacturing", "auto"].includes(group)) {
    return "Giờ hành chính 08:00 - 17:00 hoặc theo ca sản xuất tùy vị trí.";
  }

  if (group === "education") {
    return "Giờ hành chính hoặc theo ca lớp học; một số vị trí làm buổi tối/cuối tuần.";
  }

  return "Thứ 2 - Thứ 6, 08:30 - 17:30.";
}

function buildDeadline(companyIndex, jobIndex) {
  const month = 6 + ((companyIndex + jobIndex) % 4);
  const day = 10 + ((companyIndex * 3 + jobIndex) % 18);
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/2026`;
}

function buildCreatedAt(companyIndex, jobIndex) {
  const day = 1 + ((companyIndex + jobIndex) % 26);
  return `2026-04-${String(day).padStart(2, "0")} 09:00:00`;
}

function buildMobilePhone(index) {
  const prefixes = ["090", "091", "093", "096", "097", "098", "032", "033", "034", "035", "036", "037"];
  return `${prefixes[index % prefixes.length]}${String(1000000 + index * 13729).slice(0, 7)}`;
}

async function repairDisplayText(db) {
  await repairLookupTableText(db, "categories", categories, [
    { tableName: "jobs", columnName: "category_id" },
    { tableName: "candidate_profiles", columnName: "category_id" },
  ]);

  await repairLookupTableText(db, "locations", locations, [
    { tableName: "jobs", columnName: "location_id" },
    { tableName: "candidate_profiles", columnName: "location_id" },
  ]);

  await repairTableText(db, "users", ["full_name"]);
  await repairTableText(db, "company_profiles", [
    "company_name",
    "company_field",
    "company_address",
    "description",
    "logo_path",
    "website",
    "company_size",
    "contact_person",
  ]);
  await repairTableText(db, "jobs", ["title", "description", "requirements", "salary", "reject_reason"]);
  await repairTableText(db, "candidate_profiles", [
    "interested_category",
    "desired_location",
    "desired_position",
    "desired_title",
    "work_type",
    "expected_salary",
    "address",
    "career_goal",
    "job_search_status",
    "bio",
  ]);
}

async function repairLookupTableText(db, tableName, canonicalValues, references) {
  const columns = await getColumnNames(db, tableName);

  if (!columns.includes("name")) {
    return;
  }

  const rows = await db.getAllAsync(`SELECT id, name FROM ${tableName}`);
  const canonicalByName = new Map();

  for (const row of rows) {
    if (canonicalValues.includes(row.name) && !canonicalByName.has(row.name)) {
      canonicalByName.set(row.name, row.id);
    }
  }

  for (const row of rows) {
    const normalizedName = normalizeDisplayText(row.name);
    const canonicalName = pickCanonicalValue(normalizedName, canonicalValues);
    const canonicalId = canonicalByName.get(canonicalName);

    if (!canonicalId) {
      canonicalByName.set(canonicalName, row.id);

      if (canonicalName !== row.name) {
        await db.runAsync(`UPDATE ${tableName} SET name = ? WHERE id = ?`, [canonicalName, row.id]);
      }

      continue;
    }

    if (canonicalId === row.id) {
      continue;
    }

    for (const reference of references) {
      const refColumns = await getColumnNames(db, reference.tableName);

      if (refColumns.includes(reference.columnName)) {
        await db.runAsync(
          `UPDATE ${reference.tableName} SET ${reference.columnName} = ? WHERE ${reference.columnName} = ?`,
          [canonicalId, row.id]
        );
      }
    }

    await db.runAsync(`DELETE FROM ${tableName} WHERE id = ?`, [row.id]);
  }
}

async function repairTableText(db, tableName, candidateColumns) {
  const columns = await getColumnNames(db, tableName);
  const textColumns = candidateColumns.filter((column) => columns.includes(column));

  if (textColumns.length === 0) {
    return;
  }

  const rows = await db.getAllAsync(`SELECT rowid AS row_key, ${textColumns.join(", ")} FROM ${tableName}`);

  for (const row of rows) {
    const assignments = [];
    const params = [];

    for (const column of textColumns) {
      const currentValue = row[column];
      const normalizedValue = normalizeDisplayText(currentValue);

      if (typeof currentValue === "string" && normalizedValue !== currentValue) {
        assignments.push(`${column} = ?`);
        params.push(normalizedValue);
      }
    }

    if (assignments.length > 0) {
      params.push(row.row_key);
      await db.runAsync(`UPDATE ${tableName} SET ${assignments.join(", ")} WHERE rowid = ?`, params);
    }
  }
}

async function getColumnNames(db, tableName) {
  const rows = await db.getAllAsync(`PRAGMA table_info(${tableName})`);
  return rows.map((row) => row.name);
}

function pickCanonicalValue(value, canonicalValues) {
  if (canonicalValues.includes(value)) {
    return value;
  }

  const valueKey = toLookupKey(value);
  let bestMatch = canonicalValues[0];
  let bestScore = 0;

  for (const candidate of canonicalValues) {
    const candidateKey = toLookupKey(candidate);
    const score = similarityScore(valueKey, candidateKey);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
    }
  }

  return bestScore >= 0.48 ? bestMatch : value;
}

function similarityScore(left, right) {
  if (!left || !right) {
    return 0;
  }

  const distance = levenshtein(left, right);
  return 1 - distance / Math.max(left.length, right.length);
}

function levenshtein(left, right) {
  const matrix = Array.from({ length: left.length + 1 }, (_, rowIndex) =>
    Array.from({ length: right.length + 1 }, (_, columnIndex) => {
      if (rowIndex === 0) {
        return columnIndex;
      }

      if (columnIndex === 0) {
        return rowIndex;
      }

      return 0;
    })
  );

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost
      );
    }
  }

  return matrix[left.length][right.length];
}

function toLookupKey(value) {
  return normalizeDisplayText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function normalizeDisplayText(value) {
  if (typeof value !== "string") {
    return value;
  }

  let result = value.trim();

  if (!result) {
    return result;
  }

  result = decodeUnicodeEscapes(result);

  for (let index = 0; index < 3; index += 1) {
    const next = decodeMojibake(result);

    if (next === result) {
      break;
    }

    result = decodeUnicodeEscapes(next);
  }

  return result.replace(/\s+/g, " ").trim();
}

function decodeUnicodeEscapes(value) {
  if (!/\\u[0-9a-fA-F]{4}/.test(value)) {
    return value;
  }

  return value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function decodeMojibake(value) {
  if (!/[ÃƒÃ‚Ã„Ã…Ã†Ã‡ÃÃ‘Ã’Ã“Ã”Ã•Ã–Ã˜Ã™ÃšÃ›ÃœÃÃžÃŸï¿½]|Ã¡Â»|Ã¡Âº|Ã¢â‚¬Â¢|Ã¯Â¿Â½/.test(value)) {
    return value;
  }

  try {
    return decodeURIComponent(escape(value));
  } catch (error) {
    return value;
  }
}

async function upsertSeedJob(db, employerId, companyId, job) {
  const category = await db.getFirstAsync("SELECT id FROM categories WHERE name = ?", [job.category]);
  const location = await db.getFirstAsync("SELECT id FROM locations WHERE name = ?", [job.location]);
  const existingJob = await findExistingSeedJob(db, employerId, job);

  if (existingJob) {
    await db.runAsync(
      `
        UPDATE jobs
        SET
          company_id = ?,
          category_id = ?,
          location_id = ?,
          title = ?,
          description = ?,
          requirements = ?,
          salary = ?,
          work_type = ?,
          status = ?,
          reject_reason = ?,
          created_at = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        companyId,
        category?.id || null,
        location?.id || null,
        job.title,
        job.description,
        job.requirements,
        job.salary,
        job.workType,
        job.status,
        job.rejectReason || null,
        job.createdAt,
        existingJob.id,
      ]
    );
    return;
  }

  await db.runAsync(
    `
      INSERT INTO jobs
        (
          employer_id,
          company_id,
          category_id,
          location_id,
          title,
          description,
          requirements,
          salary,
          work_type,
          status,
          reject_reason,
          created_at
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      employerId,
      companyId,
      category?.id || null,
      location?.id || null,
      job.title,
      job.description,
      job.requirements,
      job.salary,
      job.workType,
      job.status,
      job.rejectReason || null,
      job.createdAt,
    ]
  );
}

async function findExistingSeedJob(db, employerId, job) {
  const rows = await db.getAllAsync("SELECT id, title FROM jobs WHERE employer_id = ?", [employerId]);
  const expectedTitle = normalizeDisplayText(job.title);
  const expectedLegacyTitle = normalizeDisplayText(job.legacyTitle || "");

  return rows.find((row) => {
    const currentTitle = normalizeDisplayText(row.title);
    return currentTitle === expectedTitle || currentTitle === expectedLegacyTitle;
  });
}
