import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { COLORS } from "../../constants/theme";
import { employerService } from "../../services/employerService";

const jobStatusLabels = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Bị từ chối",
};

export default function EmployerJobsScreen({ navigation, user }) {
  const [jobs, setJobs] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadJobs() {
        try {
          const rows = await employerService.getJobsByEmployer(user.id);

          if (active) {
            setJobs(rows);
          }
        } catch (err) {
          Alert.alert("Lỗi", err.message);
        }
      }

      loadJobs();

      return () => {
        active = false;
      };
    }, [user.id])
  );

  return (
    <Screen scroll>
      <PrimaryButton title="Đăng tin tuyển dụng" onPress={() => navigation.navigate("EmployerJobForm")} />

      <View style={styles.list}>
        {jobs.length === 0 ? <Text style={styles.emptyText}>Chưa có tin tuyển dụng.</Text> : null}

        {jobs.map((job) => (
          <Pressable
            key={job.id}
            onPress={() => navigation.navigate("EmployerJobDetail", { jobId: job.id })}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <StatusBadge status={job.status} label={jobStatusLabels[job.status]} />
            </View>
            <Text style={styles.meta}>{job.company_name}</Text>
            <Text style={styles.meta}>{job.location_name || "Chưa cập nhật"} • {job.salary || "Thỏa thuận"}</Text>
            <Text style={styles.meta}>Ứng viên: {job.application_count || 0}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
    marginTop: 16,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 15,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  cardPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  cardHeader: {
    gap: 8,
    marginBottom: 8,
  },
  jobTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
  },
  meta: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
