import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { COLORS, RADII, SHADOWS } from "../constants/theme";
import { getCompanyLogoSource } from "../constants/companyLogos";
import { LABELS, getWorkTypeLabel } from "../constants/labels";

export default function JobCard({
  job,
  saved = false,
  compact = false,
  monochrome = false,
  blueScale = false,
  onPress,
  onToggleSave,
  rightAccessory = null,
}) {
  const logoSource = getCompanyLogoSource(job.logo_path);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compactCard,
        monochrome && styles.monochromeCard,
        blueScale && styles.blueScaleCard,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.companyLogo,
            compact && styles.compactCompanyLogo,
            monochrome && styles.monochromeCompanyLogo,
            blueScale && styles.blueScaleCompanyLogo,
          ]}
        >
          {logoSource ? (
            <Image resizeMode="contain" source={logoSource} style={styles.companyLogoImage} />
          ) : (
            <Text
              style={[
                styles.companyLogoText,
                compact && styles.compactCompanyLogoText,
                monochrome && styles.monochromeCompanyLogoText,
                blueScale && styles.blueScaleCompanyLogoText,
              ]}
            >
              {getCompanyInitial(job.company_name)}
            </Text>
          )}
        </View>

        <View style={styles.titleWrap}>
          <Text numberOfLines={2} style={[styles.title, compact && styles.compactTitle]}>
            {job.title}
          </Text>
          <Text numberOfLines={1} style={[styles.company, compact && styles.compactCompany]}>
            {job.company_name}
          </Text>

          <View style={[styles.metaRow, compact && styles.compactMetaRow]}>
            <MetaItem icon="location-outline" text={job.location_name || LABELS.common.noUpdate} />
            <MetaItem icon="cash-outline" strong text={job.salary || LABELS.common.negotiableSalary} />
          </View>
        </View>

        {rightAccessory ? (
          <View style={styles.rightAccessory}>{rightAccessory}</View>
        ) : onToggleSave ? (
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={8}
            onPress={onToggleSave}
            style={[
              styles.heartButton,
              compact && styles.compactHeartButton,
              monochrome && styles.monochromeHeartButton,
              blueScale && styles.blueScaleHeartButton,
            ]}
          >
            <Ionicons
              color={saved ? (blueScale ? "#0466C8" : COLORS.favorite) : "#7D8597"}
              name={saved ? "heart" : "heart-outline"}
              size={compact ? 19 : 22}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text
          style={[
            styles.workTypeBadge,
            compact && styles.compactWorkTypeBadge,
            monochrome && styles.monochromeWorkTypeBadge,
            blueScale && styles.blueScaleWorkTypeBadge,
          ]}
        >
          {getWorkTypeLabel(job.work_type)}
        </Text>
        <Text numberOfLines={1} style={[styles.categoryText, compact && styles.compactCategoryText]}>
          {job.category_name || LABELS.common.noUpdate}
        </Text>
      </View>
    </Pressable>
  );
}

function MetaItem({ icon, strong = false, text }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons color={strong ? COLORS.text : COLORS.muted} name={icon} size={14} />
      <Text numberOfLines={1} style={[styles.metaText, strong && styles.metaTextStrong]}>
        {text}
      </Text>
    </View>
  );
}

function getCompanyInitial(name = "") {
  return name.trim().charAt(0).toUpperCase() || "V";
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#cccccc",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  compactCard: {
    gap: 10,
    padding: 12,
  },
  monochromeCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E5E5",
  },
  blueScaleCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D8DDE6",
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.992 }],
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  companyLogo: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADII.md,
    height: 44,
    justifyContent: "center",
    width: 44,
    overflow: "hidden",
  },
  companyLogoImage: {
    height: "82%",
    width: "82%",
  },
  compactCompanyLogo: {
    borderRadius: RADII.sm,
    height: 60,
    width: 60,
  },
  monochromeCompanyLogo: {
    backgroundColor: "#F4F4F5",
  },
  blueScaleCompanyLogo: {
    backgroundColor: "#023E7D",
  },
  companyLogoText: {
    color: COLORS.brand,
    fontSize: 18,
    fontWeight: "700",
  },
  monochromeCompanyLogoText: {
    color: "#111111",
  },
  blueScaleCompanyLogoText: {
    color: "#FFFFFF",
  },
  compactCompanyLogoText: {
    fontSize: 18,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  compactTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  company: {
    color: "#444444",
    fontSize: 13,
    fontWeight: "400",
    marginTop: 3,
  },
  compactCompany: {
    fontSize: 12,
    marginTop: 2,
  },
  heartButton: {
    alignItems: "center",
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADII.md,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  compactHeartButton: {
    height: 31,
    width: 31,
  },
  monochromeHeartButton: {
    backgroundColor: "#F7F7F7",
  },
  blueScaleHeartButton: {
    backgroundColor: "#EEF3F8",
  },
  rightAccessory: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    minWidth: 76,
  },
  metaRow: {
    gap: 5,
    marginTop: 8,
  },
  compactMetaRow: {
    gap: 4,
    marginTop: 6,
  },
  metaItem: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: 5,
    maxWidth: "100%",
  },
  metaText: {
    color: COLORS.muted,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "400",
  },
  metaTextStrong: {
    color: COLORS.text,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  workTypeBadge: {
    backgroundColor: COLORS.brandSoft,
    borderRadius: RADII.sm,
    color: COLORS.brand,
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  compactWorkTypeBadge: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  monochromeWorkTypeBadge: {
    backgroundColor: "#F2F2F2",
    color: "#111111",
  },
  blueScaleWorkTypeBadge: {
    backgroundColor: "#EAF2FB",
    color: "#023E7D",
  },
  categoryText: {
    color: COLORS.muted,
    flex: 1,
    fontSize: 12,
    fontWeight: "400",
    textAlign: "right",
  },
  compactCategoryText: {
    fontSize: 11,
  },
});
