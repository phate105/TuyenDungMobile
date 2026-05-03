import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { COLORS } from "../../constants/theme";
import { employerService } from "../../services/employerService";

const applicationStatusLabels = {
  submitted: "Đã nộp",
  viewed: "Đã xem",
  suitable: "Phù hợp",
  rejected: "Bị từ chối",
};

export default function JobApplicationsScreen({ navigation, route, user }) {
  const { jobId, jobTitle } = route.params;
  const [applications, setApplications] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadApplications() {
        try {
          const rows = await employerService.getApplicationsByJob(user.id, jobId);

          if (active) {
            setApplications(rows);
          }
        } catch (err) {
          Alert.alert("Lỗi", err.message);
        }
      }

      loadApplications();

      return () => {
        active = false;
      };
    }, [jobId, user.id])
  );

  return (
    <Screen scroll>
      <Text style={styles.title}>{jobTitle}</Text>
      <Text style={styles.subtitle}>Danh sách ứng viên đã ứng tuyển</Text>

      <View style={styles.list}>
        {applications.length === 0 ? <Text style={styles.emptyText}>Chưa có ứng viên ứng tuyển.</Text> : null}

        {applications.map((application) => (
          <Pressable
            key={application.id}
            onPress={() => navigation.navigate("ApplicantCV", { applicationId: application.id })}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.candidateName}>{application.candidate_name}</Text>
              <StatusBadge status={application.status} label={applicationStatusLabels[application.status]} />
            </View>
            <Text style={styles.meta}>{application.candidate_email}</Text>
            <Text style={styles.meta}>{application.candidate_phone}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 14,
  },
  list: {
    gap: 12,
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
  candidateName: {
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
