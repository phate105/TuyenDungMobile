export const LABELS = {
  appName: "VietJobMobile",
  common: {
    loading: "Đang tải...",
    noUpdate: "Chưa cập nhật",
    negotiableSalary: "Thương lượng",
    error: "Lỗi",
    continue: "Tiếp tục",
    logout: "Đăng xuất",
  },
  tabs: {
    explore: "Khám phá",
    myJobs: "Việc của tôi",
    profile: "Cá nhân",
  },
  screens: {
    candidateRegister: "Đăng ký ứng viên",
    employerRegister: "Đăng ký nhà tuyển dụng",
    jobDetail: "Chi tiết việc làm",
    apply: "Hồ sơ ứng tuyển",
    settings: "Cài đặt",
    createCV: "Tạo CV",
    personalInfo: "Thông tin cá nhân",
    experience: "Kinh nghiệm",
    education: "Học vấn",
    skills: "Kỹ năng",
    cvPreview: "Xem CV",
    search: "Tìm kiếm việc làm",
    searchResult: "Kết quả tìm kiếm",
    editProfile: "Chỉnh sửa hồ sơ",
    jobPreference: "Tiêu chí việc làm",
    cvManagement: "Quản lý CV",
    employerHome: "Nhà tuyển dụng",
    adminHome: "Quản trị viên",
    companyDetail: "Chi tiết công ty",
    companyProfile: "Hồ sơ công ty",
    jobApplications: "Ứng viên ứng tuyển",
    applicantCV: "Hồ sơ ứng viên",
    adminApplications: "Đơn ứng tuyển",
    adminUsers: "Tài khoản",
    adminJobs: "Tin tuyển dụng",
  },
  buttons: {
    login: "Đăng nhập",
    registerCandidate: "Đăng ký ứng viên",
    registerEmployer: "Đăng ký nhà tuyển dụng",
    createCandidateAccount: "Tạo tài khoản ứng viên",
    createEmployerAccount: "Tạo tài khoản nhà tuyển dụng",
    apply: "Ứng tuyển",
    submitApplication: "Nộp hồ sơ ứng tuyển",
    createCV: "Tạo CV",
    editCV: "Chỉnh sửa CV",
    viewCV: "Xem CV",
    uploadCV: "Tải CV",
    saveCV: "Lưu CV vào hồ sơ",
    saveAndApply: "Lưu CV và tiếp tục ứng tuyển",
    saveChanges: "Lưu thay đổi",
    search: "Tìm kiếm",
  },
};

export const STATUS_LABELS = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Bị từ chối",
  submitted: "Đã nộp",
  viewed: "Đã xem",
  suitable: "Phù hợp",
  active: "Hoạt động",
  locked: "Bị khóa",
};

export const ROLE_LABELS = {
  admin: "Quản trị viên",
  employer: "Nhà tuyển dụng",
  candidate: "Ứng viên",
};

export const WORK_TYPE_LABELS = {
  "Full-time": "Toàn thời gian",
  "Part-time": "Bán thời gian",
  Remote: "Từ xa",
  Hybrid: "Kết hợp",
  Contract: "Hợp đồng",
  Internship: "Thực tập",
};

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function getWorkTypeLabel(workType) {
  return WORK_TYPE_LABELS[workType] || workType || LABELS.common.noUpdate;
}
