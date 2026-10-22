import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
  const isGovernment = (job.category || "").toLowerCase() === "government";
  const canApply = Boolean(job.apply_link);
  const companyInitial = (job.organization || "J").charAt(0).toUpperCase();

  return (
    <View style={styles.card}>
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
              {job.organization || "Organization not listed"}
            </Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.starText}>★</Text>
              <Text style={styles.ratingNumber}>4.0</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.metaContainer}>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={15} color="#64748B" />
          <Text style={styles.metaText} numberOfLines={1}>
            {job.location || "Location not specified"}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="school-outline" size={15} color="#64748B" />
          <Text style={styles.metaText} numberOfLines={1}>
            {job.qualification || "Any Graduate"}
          </Text>
        </View>
      </View>

      <View style={styles.badgesRow}>
        <View style={styles.urgentBadge}>
          <Ionicons name="flash" size={11} color="#B45309" />
          <Text style={styles.urgentText}>Urgent Hiring</Text>
        </View>

        <View style={[styles.badge, isGovernment ? styles.govtBadge : styles.pvtBadge]}>
          <Text style={[styles.badgeText, isGovernment ? styles.govtBadgeText : styles.pvtBadgeText]}>
            {job.category || "Private"}
          </Text>
        </View>

        {job.last_date ? (
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={11} color="#64748B" />
            <Text style={styles.dateText}>{formatDate(job.last_date)}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.divider} />

      <Pressable
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3730A3",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 22,
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  organization: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    maxWidth: "70%",
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
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
    marginRight: 2,
  },
  ratingNumber: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  metaContainer: {
    marginTop: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#475569",
    marginLeft: 6,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 12,
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  urgentText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#92400E",
    marginLeft: 3,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
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
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 11,
    color: "#64748B",
    marginLeft: 3,
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
  },
});
