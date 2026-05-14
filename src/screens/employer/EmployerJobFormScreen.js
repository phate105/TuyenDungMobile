import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import SelectField from "../../components/SelectField";
import { COLORS, RADII } from "../../constants/theme";
import { employerService } from "../../services/employerService";
import { jobService } from "../../services/jobService";

const initialForm = {
  title: "",
  categoryId: null,
  locationId: null,
  salary: "",
  workType: "Full-time",
  description: "",
  requirements: "",
};

const workTypeOptions = [
  { label: "Toàn thời gian", value: "Full-time" },
  { label: "Bán thời gian", value: "Part-time" },
  { label: "Từ xa", value: "Remote" },
  { label: "Kết hợp", value: "Hybrid" },
  { label: "Hợp đồng", value: "Contract" },
  { label: "Thực tập", value: "Internship" },
];

export default function EmployerJobFormScreen({ navigation, route, user }) {
  const jobId = route.params?.jobId;
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const categoryOptions = useMemo(() => categories.map((item) => ({ label: item.name, value: item.id })), [categories]);
  const locationOptions = useMemo(() => locations.map((item) => ({ label: item.name, value: item.id })), [locations]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [categoryRows, locationRows] = await Promise.all([jobService.getCategories(), jobService.getLocations()]);

        if (!active) {
          return;
        }

        setCategories(categoryRows);
        setLocations(locationRows);

        if (jobId) {
          const job = await employerService.getJobById(user.id, jobId);
          if (job && active) {
            setForm({
              title: job.title || "",
              categoryId: job.category_id || null,
              locationId: job.location_id || null,
              salary: job.salary || "",
              workType: job.work_type || "Full-time",
              description: job.description || "",
              requirements: job.requirements || "",
            });
          }
        }
      } catch (error) {
        Alert.alert("Lỗi", error.message || "Không thể tải dữ liệu form.");
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [jobId, user.id]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    try {
      setLoading(true);

      if (jobId) {
        await employerService.updateJob(user.id, jobId, form);
      } else {
        await employerService.createJob(user.id, form);
      }

      Alert.alert("Thành công", jobId ? "Đã cập nhật tin tuyển dụng." : "Đã tạo tin tuyển dụng.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể lưu tin tuyển dụng.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <View style={styles.form}>
        <Field label="Tên công việc">
          <TextInput
            value={form.title}
            onChangeText={(value) => updateField("title", value)}
            placeholder="Nhập tên công việc"
            placeholderTextColor={COLORS.mutedLight}
            style={styles.input}
          />
        </Field>

        <SelectField
          label="Ngành nghề"
          options={categoryOptions}
          placeholder="Chọn ngành nghề"
          selectedValue={form.categoryId}
          onChange={(value) => updateField("categoryId", value)}
        />

        <SelectField
          label="Địa điểm"
          options={locationOptions}
          placeholder="Chọn địa điểm"
          selectedValue={form.locationId}
          onChange={(value) => updateField("locationId", value)}
        />

        <Field label="Mức lương">
          <TextInput
            value={form.salary}
            onChangeText={(value) => updateField("salary", value)}
            placeholder="Ví dụ: 10 - 15 triệu"
            placeholderTextColor={COLORS.mutedLight}
            style={styles.input}
          />
        </Field>

        <SelectField
          label="Hình thức làm việc"
          options={workTypeOptions}
          selectedValue={form.workType}
          onChange={(value) => updateField("workType", value)}
        />

        <Field label="Mô tả công việc">
          <TextInput
            multiline
            value={form.description}
            onChangeText={(value) => updateField("description", value)}
            placeholder="Nhập mô tả công việc"
            placeholderTextColor={COLORS.mutedLight}
            style={[styles.input, styles.textArea]}
            textAlignVertical="top"
          />
        </Field>

        <Field label="Yêu cầu công việc">
          <TextInput
            multiline
            value={form.requirements}
            onChangeText={(value) => updateField("requirements", value)}
            placeholder="Nhập yêu cầu công việc"
            placeholderTextColor={COLORS.mutedLight}
            style={[styles.input, styles.textArea]}
            textAlignVertical="top"
          />
        </Field>

        <Text style={styles.note}>Sau khi lưu, tin sẽ ở trạng thái chờ admin duyệt.</Text>
        <PrimaryButton loading={loading} onPress={handleSave} title="Lưu tin tuyển dụng" />
      </View>
    </Screen>
  );
}

function Field({ children, label }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  form: {
    gap: 14,
  },
  field: {
    gap: 8,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 110,
  },
  note: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
