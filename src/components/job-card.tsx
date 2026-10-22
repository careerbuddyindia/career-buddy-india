import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type Job = {
  id: string | number;
  title: string | null;
  organization: string | null;
  category: string | null;
  qualification: string | null;
  location: string | null;
  last_date: string | null;
  apply_link: string | null;
  created_at?: string | null;
};

type JobCardProps = {
  job: Job;
  onApply: (link: string) => void;
};

export function JobCard({ job, onApply }: JobCardProps) {
  const canApply = Boolean(job.apply_link);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{job.title || "Untitled Job"}</Text>
          <Text style={styles.organization}>{job.organization || "Confidential"}</Text>
        </View>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>
            {(job.category || "General").toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <View style={styles.iconLabelRow}>
            <Ionicons name="school-outline" size={14} color="#C2410C" />
            <Text style={styles.detailLabel}>QUALIFICATION</Text>
          </View>
          <Text style={styles.detailValue} numberOfLines={1}>
            {job.qualification || "Any Graduate"}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.iconLabelRow}>
            <Ionicons name="location-outline" size={14} color="#C2410C" />
            <Text style={styles.detailLabel}>LOCATION</Text>
          </View>
          <Text style={styles.detailValue} numberOfLines={1}>
            {job.location || "Pan India"}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.dateBlock}>
          <Ionicons name="calendar-outline" size={16} color="#C2410C" />
          <View style={{ marginLeft: 6 }}>
            <Text style={styles.dateLabel}>LAST DATE</Text>
            <Text style={styles.dateValue}>{job.last_date || "Open until filled"}</Text>
          </View>
        </View>

        <TouchableOpacity
          disabled={!canApply}
          onPress={() => job.apply_link && onApply(job.apply_link)}
          style={[styles.applyBtn, !canApply && styles.disabledBtn]}
          activeOpacity={0.8}
        >
          <Text style={styles.applyBtnText}>
            {canApply ? "Apply Online →" : "Unavailable"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 24,
    marginBottom: 4,
  },
  organization: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  tagBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.5,
  },
  detailsGrid: {
    flexDirection: "row",
    marginBottom: 18,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 12,
  },
  detailItem: {
    flex: 1,
  },
  iconLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#C2410C",
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  dateBlock: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  applyBtn: {
    backgroundColor: "#C2410C",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  disabledBtn: {
    backgroundColor: "#CBD5E1",
  },
  applyBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
