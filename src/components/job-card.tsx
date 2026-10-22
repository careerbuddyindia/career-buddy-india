import React from "react";
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

export function JobCard({ job, onApply }: JobCardProps) {
  const canApply = Boolean(job.apply_link);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{job.title || "Untitled Job"}</Text>
      <Text style={styles.org}>{job.organization || "Confidential"}</Text>
      <Text style={styles.meta}>{job.location || "Pan India"} • {job.category || "General"}</Text>
      
      <Pressable
        disabled={!canApply}
        onPress={() => job.apply_link && onApply(job.apply_link)}
        style={[styles.btn, !canApply && styles.disabledBtn]}
      >
        <Text style={styles.btnText}>{canApply ? "Apply Now" : "Link Unavailable"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  org: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledBtn: {
    backgroundColor: "#94A3B8",
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
