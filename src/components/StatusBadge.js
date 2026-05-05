import { StyleSheet, Text } from "react-native";

import { APPLICATION_STATUS, JOB_STATUS, USER_STATUS } from "../constants/appConstants";
import { COLORS, RADII } from "../constants/theme";
import { getStatusLabel } from "../constants/labels";

const badgeStyles = {
  [JOB_STATUS.PENDING]: {
    backgroundColor: COLORS.warningSoft,
    color: COLORS.warning,
  },
  [JOB_STATUS.APPROVED]: {
    backgroundColor: COLORS.successSoft,
    color: COLORS.success,
  },
  [JOB_STATUS.REJECTED]: {
    backgroundColor: COLORS.dangerSoft,
    color: COLORS.danger,
  },
  [APPLICATION_STATUS.SUBMITTED]: {
    backgroundColor: COLORS.infoSoft,
    color: COLORS.info,
  },
  [APPLICATION_STATUS.VIEWED]: {
    backgroundColor: COLORS.warningSoft,
    color: COLORS.warning,
  },
  [APPLICATION_STATUS.SUITABLE]: {
    backgroundColor: COLORS.successSoft,
    color: COLORS.success,
  },
  [APPLICATION_STATUS.REJECTED]: {
    backgroundColor: COLORS.dangerSoft,
    color: COLORS.danger,
  },
  [USER_STATUS.ACTIVE]: {
    backgroundColor: COLORS.successSoft,
    color: COLORS.success,
  },
  [USER_STATUS.LOCKED]: {
    backgroundColor: COLORS.dangerSoft,
    color: COLORS.danger,
  },
};

export default function StatusBadge({ status, label }) {
  const colors = badgeStyles[status] || {
    backgroundColor: COLORS.surfaceMuted,
    color: COLORS.muted,
  };

  return (
    <Text style={[styles.badge, { backgroundColor: colors.backgroundColor, color: colors.color }]}>
      {label || getStatusLabel(status)}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: RADII.sm,
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
});
