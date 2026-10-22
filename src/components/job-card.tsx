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
  const canApply = Boolean(job.apply_link);

  // Logo ke liye company name ka pehla letter
  const companyInitial = (job.organization || "J").charAt(0).toUpperCase();

  return (
    <View style={styles.card} testID={`job-card-${job.id}`}>
      {/* Top Section: Logo + Title + Org */}
      <View style={styles.cardHeader}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>{companyInitial}</Text>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {job.title || "Untitled Opportunity"}
          </Text>
          <View style={styles.companyRow}>
            <Text style={styles.organization} numberOfLines={1}>
              {job.organization || "Confidential Organization"}
            </Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.starText}>★</Text>
              <Text style={styles.ratingNumber}>4.0</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Meta Information: Location & Qualification/Salary */}
      <View style={styles.metaContainer}>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={16} color="#64748B" />
          <Text style={styles.metaText} numberOfLines={1}>
            {job.location || "Remote / Pan India"}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="school-outline" size={16} color="#64748B" />
          <Text style={styles.metaText} numberOfLines={1}>
            {job.qualification || "Any Graduate"}
          </Text>
        </View>
      </View>

      {/* Badges / Highlights */}
      <View style={styles.badgesRow}>
        <View style={styles.urgentBadge}>
          <Ionicons name="flash" size={12} color="#D97706" />
          <Text style={styles.urgentText}>Urgent Hiring</Text>
        </View>

        <View style={[styles.badge, isGovernment ? styles.govtBadge : styles.pvtBadge]}>
          <Text style={[styles.badgeText, isGovernment ? styles.govtBadgeText : styles.pvtBadgeText]}>
            {job.category || "General"}
          </Text>
        </View>

        {job.last_date ? (
          <View style={styles.dateBadge}>
            <Ionicons name="time-outline" size={12} color="#64748B" />
            <Text style={styles.dateText}>{formatDate(job.last_date)}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.divider} />

      {/* Naukri-style Action Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Apply online for ${job.title || "this job"}`}
        disabled={!canApply}
        onPress={() => job.apply_link && onApply(job.apply_link)}
        style={({ pressed }) => [
          styles.applyButton,
          !canApply && styles.disabledButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.applyButtonText, !canApply && styles.disabledButtonText]}>
          {canApply ? "Apply" : "Link Unavailable"}
        </Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      marginHorizontal: 16,
      marginBottom: 14,
      padding: 16,
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    logoBox: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: "#EEF2FF",
      borderWidth: 1,
      borderColor: "#E0E7FF",
      justifyContent: "center",
      alignItems: "center",
    },
    logoText: {
      fontSize: 20,
      fontWeight: "700",
      color: "#4338CA",
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: "700",
      color: "#1E293B",
      lineHeight: 22,
    },
    companyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },
    organization: {
      fontSize: 14,
      fontWeight: "500",
      color: "#475569",
      maxWidth: "70%",
    },
    ratingBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      backgroundColor: "#F8FAFC",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    starText: {
      fontSize: 11,
      color: "#F59E0B",
    },
    ratingNumber: {
      fontSize: 11,
      fontWeight: "600",
      color: "#475569",
    },
    metaContainer: {
      marginTop: 12,
      gap: 6,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    metaText: {
      fontSize: 13,
      color: "#475569",
    },
    badgesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 8,
      marginTop: 12,
    },
    urgentBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#FEF3C7",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    urgentText: {
      fontSize: 11,
      fontWeight: "600",
      color: "#92400E",
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    govtBadge: {
      backgroundColor: "#DCFCE7",
    },
    govtBadgeText: {
      color: "#166534",
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
    },
    pvtBadge: {
      backgroundColor: "#F1F5F9",
    },
    pvtBadgeText: {
      color: "#475569",
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
    },
    dateBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#F8FAFC",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    dateText: {
      fontSize: 11,
      color: "#64748B",
    },
    divider: {
      height: 1,
      backgroundColor: "#F1F5F9",
      marginVertical: 12,
    },
    applyButton: {
      backgroundColor: "#EEF2FF",
      borderRadius: 24,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#C7D2FE",
    },
    applyButtonText: {
      color: "#3730A3",
      fontSize: 14,
      fontWeight: "700",
    },
    disabledButton: {
      backgroundColor: "#F1F5F9",
      borderColor: "#E2E8F0",
    },
    disabledButtonText: {
      color: "#94A3B8",
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.99 }],
    },
  })
);
    
