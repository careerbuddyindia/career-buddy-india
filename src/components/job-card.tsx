import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { makeStyles } from "@/src/theme";

export type Job = {
  id: string | number;
  title: string | null;
  organization: string | null;
  category: string | null;
  qualification: string | null;
  location: string | null;
  last_date: string | null;
  apply_link: string | null;
  created_at: string | null;
};

type JobCardProps = {
  job: Job;
  onApply: (link: string) => void;
};

const formatDate = (value: string | null) => {
  if (!value) return "Date not listed";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export function JobCard({ job, onApply }: JobCardProps) {
  const styles = useStyles();
  const isGovernment = job.category?.toLowerCase() === "government";
  const badgeStyle = isGovernment ? styles.governmentBadge : styles.privateBadge;
  const badgeTextStyle = isGovernment ? styles.governmentBadgeText : styles.privateBadgeText;
  const canApply = Boolean(job.apply_link);

  return (
    <View style={styles.card} testID={`job-card-${job.id}`}>
      <View style={styles.cardTop}>
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={2}>
            {job.title || "Untitled opportunity"}
          </Text>
          <Text style={styles.organization} numberOfLines={1}>
            {job.organization || "Organization not listed"}
          </Text>
        </View>
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, badgeTextStyle]}>
            {job.category || "Other"}
          </Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <Detail
          icon="school-outline"
          label="Qualification"
          value={job.qualification || "Not specified"}
          styles={styles}
        />
        <Detail
          icon="location-outline"
          label="Location"
          value={job.location || "Not specified"}
          styles={styles}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.dateBlock}>
          <Ionicons name="calendar-outline" size={16} color={styles.dateIcon.color} />
          <View>
            <Text style={styles.metaLabel}>Last date</Text>
            <Text style={styles.date}>{formatDate(job.last_date)}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Apply online for ${job.title || "this job"}`}
          disabled={!canApply}
          onPress={() => job.apply_link && onApply(job.apply_link)}
          testID={`apply-button-${job.id}`}
          style={({ pressed }) => [
            styles.applyButton,
            !canApply && styles.disabledButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.applyText}>
            {canApply ? "Apply Online" : "Link unavailable"}
          </Text>
          {canApply ? (
            <Ionicons name="arrow-forward" size={16} color={styles.applyIcon.color} />
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

function Detail({
  icon,
  label,
  value,
  styles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  styles: ReturnType<typeof useStyles>;
}) {
  return (
    <View style={styles.detail}>
      <Ionicons name={icon} size={17} color={styles.detailIcon.color} />
      <View style={styles.detailCopy}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.border,
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 14,
      padding: 18,
    },
    cardTop: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between",
    },
    titleBlock: { flex: 1, gap: 5 },
    title: {
      color: colors.onSurfaceSecondary,
      fontSize: 17,
      fontWeight: "700",
      lineHeight: 23,
    },
    organization: { color: colors.muted, fontSize: 14, fontWeight: "600" },
    badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
    badgeText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
    governmentBadge: { backgroundColor: colors.brandTertiary },
    governmentBadgeText: { color: colors.onBrandTertiary },
    privateBadge: { backgroundColor: colors.surfaceTertiary },
    privateBadgeText: { color: colors.onSurfaceTertiary },
    detailsGrid: {
      borderBottomColor: colors.divider,
      borderBottomWidth: 1,
      flexDirection: "row",
      gap: 10,
      marginTop: 19,
      paddingBottom: 17,
    },
    detail: {
      alignItems: "flex-start",
      flex: 1,
      flexDirection: "row",
      gap: 8,
      minWidth: 0,
    },
    detailCopy: { flex: 1, gap: 3 },
    detailIcon: { color: colors.brand },
    metaLabel: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 0.2,
      textTransform: "uppercase",
    },
    detailValue: {
      color: colors.onSurfaceSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    footer: {
      alignItems: "center",
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between",
      paddingTop: 16,
    },
    dateBlock: { alignItems: "center", flexDirection: "row", flex: 1, gap: 8 },
    dateIcon: { color: colors.brand },
    date: {
      color: colors.onSurfaceSecondary,
      fontSize: 13,
      fontWeight: "600",
      marginTop: 2,
    },
    applyButton: {
      alignItems: "center",
      backgroundColor: colors.brandPrimary,
      borderRadius: 12,
      flexDirection: "row",
      gap: 7,
      minHeight: 44,
      paddingHorizontal: 14,
    },
    applyText: { color: colors.onBrandPrimary, fontSize: 13, fontWeight: "700" },
    applyIcon: { color: colors.onBrandPrimary },
    disabledButton: { backgroundColor: colors.surfaceTertiary },
    pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  })
);
  
