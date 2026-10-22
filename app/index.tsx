import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Job, JobCard } from "../src/components/job-card";
import NotificationModal from "../src/components/notification-modal";
import { supabase } from "../src/lib/supabase";

type Category = "All" | "Government" | "Private";
const categories: Category[] = ["All", "Government", "Private"];

const sortJobs = (items: Job[]) => {
  return [...items].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
};

export default function Index() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  const loadJobs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("jobs")
        .select(
          "id, title, organization, category, qualification, location, last_date, apply_link, created_at"
        )
        .order("created_at", { ascending: false });

      if (queryError) {
        setError(queryError.message);
      } else {
        setJobs(sortJobs((data ?? []) as Job[]));
      }
    } catch (e) {
      setError("Failed to load jobs");
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const handleChange = (payload: RealtimePostgresChangesPayload<Job>) => {
    if (payload.eventType === "INSERT") {
      setJobs((current) =>
        current.some((job) => String(job.id) === String(payload.new.id))
          ? current
          : sortJobs([payload.new as Job, ...current])
      );
    } else if (payload.eventType === "UPDATE") {
      setJobs((current) =>
        sortJobs(
          current.map((job) =>
            String(job.id) === String(payload.new.id) ? (payload.new as Job) : job
          )
        )
      );
    } else if (payload.eventType === "DELETE") {
      setJobs((current) =>
        current.filter((job) => String(job.id) !== String(payload.old.id))
      );
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("public:jobs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        handleChange
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesCategory =
        category === "All" || (job.category || "").toLowerCase() === category.toLowerCase();

      const searchable = [
        job.title,
        job.organization,
        job.qualification,
        job.location,
        job.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesCategory &&
        (!normalizedQuery || searchable.includes(normalizedQuery))
      );
    });
  }, [category, jobs, query]);

  const openApplication = async (link: string) => {
    try {
      const supported = await Linking.canOpenURL(link);
      if (!supported) {
        Alert.alert("Notice", "Unable to open this link on device.");
        return;
      }
      await Linking.openURL(link);
    } catch {
      Alert.alert("Notice", "Unable to open link.");
    }
  };

  const getCategoryCount = (cat: Category) => {
    if (cat === "All") return jobs.length;
    return jobs.filter((j) => (j.category || "").toLowerCase() === cat.toLowerCase()).length;
  };

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      {/* 1. Top Bar */}
      <View style={styles.topBar}>
        <Pressable 
          style={styles.circleIconBtn}
          onPress={() => setNotificationsVisible(true)}
        >
          <Ionicons name="menu-outline" size={24} color="#1E293B" />
        </Pressable>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search role, skills, company..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        <Pressable 
          style={styles.circleIconBtn} 
          onPress={() => setNotificationsVisible(true)}
        >
          <Ionicons name="notifications-outline" size={22} color="#1E293B" />
          {jobs.length > 0 && <View style={styles.notifBadge} />}
        </Pressable>
      </View>

      {/* 2. Profile Card */}
      <View style={styles.quickAccessCard}>
        <View style={styles.quickCardLeft}>
          <View style={styles.avatarMini}>
            <Ionicons name="person" size={18} color="#2563EB" />
          </View>
          <View style={styles.quickCardTextWrap}>
            <Text style={styles.quickCardTitle}>Profile Strength (85%)</Text>
            <Text style={styles.quickCardSubtitle}>Complete profile to get recruiter calls</Text>
          </View>
        </View>

        <Pressable 
          style={styles.toolkitBtn}
          onPress={() => router.push("/resources")}
        >
          <Text style={styles.toolkitBtnText}>Toolkit 📋</Text>
        </Pressable>
      </View>

      {/* 3. Category Filter Tabs */}
      <View style={styles.filterSection}>
        <View style={styles.filterSectionHeader}>
          <Text style={styles.filterSectionTitle}>Recommended Jobs</Text>
          <Text style={styles.resultsCount}>{filteredJobs.length} openings</Text>
        </View>

        <View style={styles.chipsContainer}>
          {categories.map((item) => {
            const isSelected = category === item;
            const count = getCategoryCount(item);
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.chip, isSelected && styles.activeChip]}
              >
                <Text style={[styles.chipText, isSelected && styles.activeChipText]}>
                  {item} ({count})
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {renderHeader()}

        {loading && !refreshing ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Fetching latest openings...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredJobs}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <JobCard job={item} onApply={openApplication} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void loadJobs(true)}
                colors={["#2563EB"]}
              />
            }
            ListEmptyComponent={
              <View style={styles.centerBox}>
                <Ionicons name="briefcase-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No matching jobs found</Text>
                <Text style={styles.emptySubtitle}>
                  Try clearing your search query or selecting "All" categories.
                </Text>
                <Pressable
                  style={styles.resetButton}
                  onPress={() => {
                    setQuery("");
                    setCategory("All");
                  }}
                >
                  <Text style={styles.resetButtonText}>Reset Filters</Text>
                </Pressable>
              </View>
            }
          />
        )}

        {/* 4. Bottom Tab Bar */}
        <View style={styles.bottomTabBar}>
          <Pressable 
            style={styles.tabBtn} 
            onPress={() => setCategory("All")}
          >
            <Ionicons name="home" size={22} color="#2563EB" />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Home</Text>
          </Pressable>

          <Pressable 
            style={styles.tabBtn} 
            onPress={() => setCategory("Private")}
          >
            <Ionicons name="briefcase-outline" size={22} color="#64748B" />
            <Text style={styles.tabLabel}>Jobs</Text>
          </Pressable>

          <Pressable 
            style={styles.tabBtn} 
            onPress={() => router.push("/resources")}
          >
            <Ionicons name="document-text-outline" size={22} color="#64748B" />
            <Text style={styles.tabLabel}>Toolkit</Text>
          </Pressable>

          <Pressable 
             style={styles.tabBtn} 
             onPress={() => router.push("/login")}
          >
            <Ionicons name="person-outline" size={22} color="#64748B" />
            <Text style={styles.tabLabel}>Profile</Text>
          </Pressable>
        </View>

        <NotificationModal
          visible={notificationsVisible}
          onClose={() => setNotificationsVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerWrapper: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  circleIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 42,
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0F172A",
    marginLeft: 8,
    paddingVertical: 0,
  },
  quickAccessCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EFF6FF",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  quickCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  quickCardTextWrap: {
    flex: 1,
  },
  quickCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  quickCardSubtitle: {
    fontSize: 11,
    color: "#3B82F6",
    marginTop: 1,
  },
  toolkitBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginLeft: 8,
  },
  toolkitBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  chipsContainer: {
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  activeChipText: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingTop: 14,
    paddingBottom: 20,
  },
  centerBox: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  resetButton: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  bottomTabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingVertical: 8,
    elevation: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 3,
  },
  tabLabelActive: {
    color: "#2563EB",
    fontWeight: "700",
  },
});
