const fs = require('fs');

const candidateFile = fs.readFileSync('src/screens/candidate/JobDetailScreen.js', 'utf8');

// Build AdminJobDetailScreen
let adminContent = candidateFile
  .replace('export default function JobDetailScreen', 'export default function AdminJobDetailScreen')
  .replace('import { jobService } from "../../services/jobService";', 'import { adminService } from "../../services/adminService";\nimport { JOB_STATUS } from "../../constants/appConstants";\nimport { TextInput } from "react-native";')
  .replace('import { applicationService } from "../../services/applicationService";\n', '')
  .replace('const [saved, setSaved] = useState(false);\n', '')
  .replace('const [saving, setSaving] = useState(false);\n', '')
  .replace('const [applied, setApplied] = useState(false);\n', '')
  .replace('const [rejectReason, setRejectReason] = useState("");\n', '') // Will add manually
  .replace('const logoSource = getCompanyLogoSource(job?.logo_path);', 'const logoSource = getCompanyLogoSource(job?.logo_path);\n  const [rejectReason, setRejectReason] = useState("");\n  const [showRejectInput, setShowRejectInput] = useState(false);')
  .replace(/const \[result.*?Promise\.all\(\[.*?\]\);/s, 'const result = await adminService.getJobById(jobId);')
  .replace('setSaved(savedResult);\n          setApplied(appliedResult);', '')
  .replace('function handleApply() {', 'async function handleApprove() {\n    try {\n      await adminService.approveJob(jobId);\n      Alert.alert("Thành công", "Đã duyệt tin tuyển dụng.");\n      navigation.goBack();\n    } catch (error) {\n      Alert.alert("Lỗi", error.message || "Không thể duyệt tin.");\n    }\n  }\n\n  async function handleReject() {\n    if (!rejectReason.trim()) {\n      Alert.alert("Thông báo", "Vui lòng nhập lý do từ chối.");\n      return;\n    }\n    try {\n      await adminService.rejectJob(jobId, rejectReason);\n      Alert.alert("Thành công", "Đã từ chối tin tuyển dụng.");\n      navigation.goBack();\n    } catch (error) {\n      Alert.alert("Lỗi", error.message || "Không thể từ chối tin.");\n    }\n  }\n\n  function dummy1() {')
  .replace(/async function handleToggleSave\(\).*?\}/s, '')
  .replace(/<View style=\{\[styles\.bottomBar.*?<\/View>/s, `
        {job?.status === JOB_STATUS.PENDING ? (
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) + 6, flexDirection: "column", gap: 10 }]}>
            {!showRejectInput ? (
              <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
                <PrimaryButton
                  style={[styles.applyButton, { backgroundColor: COLORS.danger }]}
                  title="Từ chối"
                  onPress={() => setShowRejectInput(true)}
                />
                <PrimaryButton
                  style={[styles.applyButton, { backgroundColor: COLORS.success }]}
                  title="Duyệt tin"
                  onPress={handleApprove}
                />
              </View>
            ) : (
              <View style={{ width: "100%", gap: 10 }}>
                <TextInput
                  multiline
                  onChangeText={setRejectReason}
                  placeholder="Nhập lý do từ chối"
                  placeholderTextColor={COLORS.mutedLight}
                  style={styles.rejectInput}
                  textAlignVertical="top"
                  value={rejectReason}
                />
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <PrimaryButton
                    style={[styles.applyButton, { backgroundColor: COLORS.muted }]}
                    title="Hủy"
                    onPress={() => setShowRejectInput(false)}
                  />
                  <PrimaryButton
                    style={[styles.applyButton, { backgroundColor: COLORS.danger }]}
                    title="Xác nhận từ chối"
                    onPress={handleReject}
                  />
                </View>
              </View>
            )}
          </View>
        ) : null}
  `)
  .replace('applyButtonDisabled: {', 'rejectInput: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADII.md, borderWidth: 1, color: COLORS.text, minHeight: 80, padding: 12 },\n  applyButtonDisabled: {');

adminContent = adminContent.replace(/user\?.id/g, 'null');
adminContent = adminContent.replace('export default function AdminJobDetailScreen({ route, navigation, user })', 'export default function AdminJobDetailScreen({ route, navigation })');


// Build EmployerJobDetailScreen
let employerContent = candidateFile
  .replace('export default function JobDetailScreen', 'export default function EmployerJobDetailScreen')
  .replace('import { jobService } from "../../services/jobService";', 'import { employerService } from "../../services/employerService";')
  .replace('import { applicationService } from "../../services/applicationService";\n', '')
  .replace('const [saved, setSaved] = useState(false);\n', '')
  .replace('const [saving, setSaving] = useState(false);\n', '')
  .replace('const [applied, setApplied] = useState(false);\n', '')
  .replace(/const \[result.*?Promise\.all\(\[.*?\]\);/s, 'const result = await employerService.getJobById(user.id, jobId);')
  .replace('setSaved(savedResult);\n          setApplied(appliedResult);', '')
  .replace('function handleApply() {', 'async function handleDelete() {\n    Alert.alert("Xác nhận", "Bạn có muốn xóa tin tuyển dụng này?", [\n      { text: "Hủy", style: "cancel" },\n      {\n        text: "Xóa",\n        style: "destructive",\n        onPress: async () => {\n          try {\n            setDeleting(true);\n            await employerService.deleteJob(user.id, jobId);\n            navigation.goBack();\n          } catch (error) {\n            Alert.alert("Lỗi", error.message || "Không thể xóa tin tuyển dụng.");\n          } finally {\n            setDeleting(false);\n          }\n        },\n      },\n    ]);\n  }\n\n  const [deleting, setDeleting] = useState(false);\n\n  function dummy2() {')
  .replace(/async function handleToggleSave\(\).*?\}/s, '')
  .replace(/<View style=\{\[styles\.bottomBar.*?<\/View>/s, `
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) + 6 }]}>
          <PrimaryButton
            style={[styles.applyButton, { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }]}
            textStyle={{ color: COLORS.text }}
            title="Chỉnh sửa"
            onPress={() => navigation.navigate("EmployerJobForm", { jobId })}
          />
          <PrimaryButton
            disabled={deleting}
            style={[styles.applyButton, { backgroundColor: COLORS.dangerSoft, borderWidth: 1, borderColor: COLORS.danger }]}
            textStyle={{ color: COLORS.danger }}
            title={deleting ? "Đang xóa..." : "Xóa tin"}
            onPress={handleDelete}
          />
        </View>
  `);

fs.writeFileSync('src/screens/admin/AdminJobDetailScreen.js', adminContent);
fs.writeFileSync('src/screens/employer/EmployerJobDetailScreen.js', employerContent);
console.log("Done");
