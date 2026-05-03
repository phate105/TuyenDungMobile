import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/Screen";
import { COLORS } from "../../constants/theme";
import { adminService } from "../../services/adminService";

export default function PendingJobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadJobs() {
        try {
          const rows = await adminService.getPendingJobs();

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
    }, [])
  );

  return (
    <Screen scroll>
      <View style={styles.list}>
        {jobs.length === 0 ? <Text style={styles.emptyText}>Không có tin chờ duyệt.</Text> : null}

        {jobs.map((job) => (
          <Pressable
            key={job.id}
            onPress={() => navigation.navigate("AdminJobDetail", { jobId: job.id })}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <Text style={styles.title}>{job.title}</Text>
            <Text style={styles.meta}>{job.company_name}</Text>
            <Text style={styles.meta}>
              {(job.category_name || "Chưa cập nhật") + " • " + (job.location_name || "Chưa cập nhật")}
            </Text>
            <Text style={styles.meta}>
              {(job.salary || "Thương lượng") + " • " + (job.work_type || "Chưa cập nhật")}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  meta: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
