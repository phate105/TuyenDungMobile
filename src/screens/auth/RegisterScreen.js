import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import SelectField from "../../components/SelectField";
import { ROLES } from "../../constants/appConstants";
import { COLORS } from "../../constants/theme";
import { authService } from "../../services/authService";
import { jobService } from "../../services/jobService";

const initialCandidateForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  interestedCategory: "",
  desiredLocation: "",
  categoryId: null,
  locationId: null,
};

const initialEmployerForm = {
  representativeName: "",
  email: "",
  password: "",
  phone: "",
  companyName: "",
  companyField: "",
  companyAddress: "",
};

const COPY = {
  candidate: "Ứng viên",
  companyField: "Lĩnh vực hoạt động",
  companyLocation: "Địa điểm công ty",
  companyName: "Tên công ty",
  createAccount: "Tạo tài khoản",
  email: "Email",
  emailPlaceholder: "Nhập email",
  employer: "Nhà tuyển dụng",
  fieldLoadError: "Không thể tải danh mục.",
  fullName: "Họ tên",
  fullNamePlaceholder: "Nhập họ tên",
  industry: "Ngành nghề quan tâm",
  industryLoading: "Đang tải ngành nghề...",
  industryPlaceholder: "Chọn ngành nghề",
  location: "Địa điểm",
  locationLoading: "Đang tải địa điểm...",
  locationPlaceholder: "Chọn địa điểm",
  password: "Mật khẩu",
  passwordPlaceholder: "Nhập mật khẩu",
  personInCharge: "Người phụ trách tuyển dụng",
  personInChargePlaceholder: "Nhập họ tên người phụ trách",
  phone: "Số điện thoại",
  phonePlaceholder: "Nhập số điện thoại",
};

export default function RegisterScreen({ onAuthenticated }) {
  const [role, setRole] = useState(ROLES.CANDIDATE);
  const [candidateForm, setCandidateForm] = useState(initialCandidateForm);
  const [employerForm, setEmployerForm] = useState(initialEmployerForm);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [focusedField, setFocusedField] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const isCandidate = role === ROLES.CANDIDATE;
  const activeForm = isCandidate ? candidateForm : employerForm;

  const categoryIdOptions = useMemo(
    () => categories.map((item) => ({ label: item.name, value: item.id })),
    [categories]
  );
  const categoryNameOptions = useMemo(
    () => categories.map((item) => ({ label: item.name, value: item.name })),
    [categories]
  );
  const locationIdOptions = useMemo(
    () => locations.map((item) => ({ label: item.name, value: item.id })),
    [locations]
  );
  const locationNameOptions = useMemo(
    () => locations.map((item) => ({ label: item.name, value: item.name })),
    [locations]
  );

  useEffect(() => {
    let mounted = true;

    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [categoryRows, locationRows] = await Promise.all([
          jobService.getCategories(),
          jobService.getLocations(),
        ]);

        if (!mounted) {
          return;
        }

        setCategories(categoryRows);
        setLocations(locationRows);
      } catch (err) {
        if (mounted) {
          setError(err.message || COPY.fieldLoadError);
        }
      } finally {
        if (mounted) {
          setLoadingOptions(false);
        }
      }
    }

    loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  function updateField(field, value) {
    setError("");

    if (isCandidate) {
      setCandidateForm((current) => ({ ...current, [field]: value }));
      return;
    }

    setEmployerForm((current) => ({ ...current, [field]: value }));
  }

  function updateCandidateSelection(value, sourceOptions, idField, textField) {
    const selectedOption = sourceOptions.find((option) => option.value === value);

    setError("");
    setCandidateForm((current) => ({
      ...current,
      [idField]: value,
      [textField]: selectedOption?.label || "",
    }));
  }

  async function handleRegister() {
    try {
      setLoading(true);
      setError("");

      const user = isCandidate
        ? await authService.registerCandidate(candidateForm)
        : await authService.registerEmployer(employerForm);

      onAuthenticated(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function renderInput({ field, label, ...props }) {
    return (
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          onBlur={() => setFocusedField("")}
          onChangeText={(value) => updateField(field, value)}
          onFocus={() => setFocusedField(field)}
          placeholderTextColor={COLORS.mutedLight}
          style={[styles.input, focusedField === field && styles.inputFocused]}
          value={activeForm[field]}
          {...props}
        />
      </View>
    );
  }

  return (
    <Screen scroll edges={["left", "right"]} contentContainerStyle={styles.scrollContent}>
      <View style={styles.switchRow}>
        <Pressable
          onPress={() => setRole(ROLES.CANDIDATE)}
          style={({ pressed }) => [
            styles.roleButton,
            isCandidate && styles.roleButtonActive,
            pressed && styles.roleButtonPressed,
          ]}
        >
          <Text style={[styles.roleText, isCandidate && styles.roleTextActive]}>{COPY.candidate}</Text>
        </Pressable>

        <Pressable
          onPress={() => setRole(ROLES.EMPLOYER)}
          style={({ pressed }) => [
            styles.roleButton,
            !isCandidate && styles.roleButtonActive,
            pressed && styles.roleButtonPressed,
          ]}
        >
          <Text style={[styles.roleText, !isCandidate && styles.roleTextActive]}>{COPY.employer}</Text>
        </Pressable>
      </View>

      <View style={styles.formCard}>
        {isCandidate ? (
          <>
            {renderInput({ field: "fullName", label: COPY.fullName, placeholder: COPY.fullNamePlaceholder })}
            {renderInput({
              field: "email",
              label: COPY.email,
              placeholder: COPY.emailPlaceholder,
              autoCapitalize: "none",
              autoComplete: "email",
              keyboardType: "email-address",
              textContentType: "emailAddress",
            })}
            {renderInput({
              field: "password",
              label: COPY.password,
              placeholder: COPY.passwordPlaceholder,
              autoComplete: "password",
              secureTextEntry: true,
              textContentType: "password",
            })}
            {renderInput({
              field: "phone",
              label: COPY.phone,
              placeholder: COPY.phonePlaceholder,
              keyboardType: "phone-pad",
            })}
            <SelectField
              label={COPY.industry}
              onChange={(value) =>
                updateCandidateSelection(value, categoryIdOptions, "categoryId", "interestedCategory")
              }
              options={categoryIdOptions}
              placeholder={loadingOptions ? COPY.industryLoading : COPY.industryPlaceholder}
              selectedValue={candidateForm.categoryId}
              variant="underline"
            />
            <SelectField
              label={COPY.location}
              onChange={(value) =>
                updateCandidateSelection(value, locationIdOptions, "locationId", "desiredLocation")
              }
              options={locationIdOptions}
              placeholder={loadingOptions ? COPY.locationLoading : COPY.locationPlaceholder}
              selectedValue={candidateForm.locationId}
              variant="underline"
            />
          </>
        ) : (
          <>
            {renderInput({
              field: "representativeName",
              label: COPY.personInCharge,
              placeholder: COPY.personInChargePlaceholder,
            })}
            {renderInput({
              field: "email",
              label: COPY.email,
              placeholder: COPY.emailPlaceholder,
              autoCapitalize: "none",
              autoComplete: "email",
              keyboardType: "email-address",
              textContentType: "emailAddress",
            })}
            {renderInput({
              field: "password",
              label: COPY.password,
              placeholder: COPY.passwordPlaceholder,
              autoComplete: "password",
              secureTextEntry: true,
              textContentType: "password",
            })}
            {renderInput({
              field: "phone",
              label: COPY.phone,
              placeholder: COPY.phonePlaceholder,
              keyboardType: "phone-pad",
            })}
            {renderInput({
              field: "companyName",
              label: COPY.companyName,
              placeholder: COPY.companyName,
            })}
            <SelectField
              label={COPY.companyField}
              onChange={(value) => updateField("companyField", value)}
              options={categoryNameOptions}
              placeholder={loadingOptions ? COPY.industryLoading : COPY.industryPlaceholder}
              selectedValue={employerForm.companyField}
              variant="underline"
            />
            <SelectField
              label={COPY.companyLocation}
              onChange={(value) => updateField("companyAddress", value)}
              options={locationNameOptions}
              placeholder={loadingOptions ? COPY.locationLoading : COPY.locationPlaceholder}
              selectedValue={employerForm.companyAddress}
              variant="underline"
            />
          </>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        disabled={loadingOptions}
        loading={loading}
        onPress={handleRegister}
        style={styles.submitButton}
        title={COPY.createAccount}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    backgroundColor: COLORS.surface,
    paddingBottom: 28,
    paddingTop: 8,
  },
  switchRow: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    marginBottom: 12,
  },
  roleButton: {
    alignItems: "center",
    flex: 1,
    gap: 10,
    justifyContent: "center",
    paddingBottom: 12,
    paddingTop: 8,
  },
  roleButtonActive: {
    backgroundColor: COLORS.surface,
  },
  roleButtonPressed: {
    opacity: 0.74,
  },
  roleText: {
    color: COLORS.muted,
    fontSize: 16,
    fontWeight: "500",
  },
  roleTextActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: COLORS.surface,
    paddingTop: 4,
  },
  fieldGroup: {
    gap: 8,
    marginBottom: 14,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: COLORS.surface,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    color: COLORS.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 0,
  },
  inputFocused: {
    borderBottomColor: COLORS.action,
  },
  error: {
    color: COLORS.danger,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    marginTop: 14,
  },
  submitButton: {
    marginTop: 12,
  },
});
