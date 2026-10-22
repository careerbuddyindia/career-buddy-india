.import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Linking,
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

type Category = "All" | "Fresher" | "Internship" | "Remote";
const categories: Category[] = ["All", "Fresher", "Internship", "Remote"];

export default function Index() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  const loadJobs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, organization, category, qualification, location, last_date, apply_link, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setJobs(data as Job[]);
      }
    } catch {
      // safe fallback
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
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

      return matchesCategory && (!q || searchable.includes(q));
    });
  }, [category, jobs, query]);

  const openApplication = async (link: string) => {
    try {
      const supported = await Linking.canOpenURL(link);
      if (supported) {
        await Linking.openURL(link);
      } else {
        Alert.alert("Notice", "Cannot open this link.");
      }
    } catch {
      Alert.alert("Notice", "Unable to open link.");
    }
  };

  const renderHeader = () => (
    <View>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Ionicons name="briefcase" size={20} color="#FFFFFF" />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.subBrand}>YOUR NEXT MOVE</Text>
            <Text style={styles.brandTitle}>Career Buddy India</Text>
          </View>
        </View>

        <Pressable
          style={styles.bellBtn}
          onPress={() => setNotificationsVisible(true)}
        >
          <Ionicons name="notifications-outline" size={22} color="#1E293B" />
        </Pressable>
      </View>

      {/* Hero Headline */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>
          Find work that moves{"\n"}you forward.
        </Text>
        <Text style={styles.heroSubtitle}>
          Browse entry-level jobs, internships{'\n'}and early career opportunities.
        </Text>
      </View>

      {/* Toolkit Banner */}
      <Pressable
        style={styles.toolkitBanner}
        onPress={() => router.push("/resources")}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerSubtitle}>
           Leave Applications, Cover Letters, Resignation & Cold Emails
        </Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </Pressable>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#C2410C" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search title, department, organization"
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

      {/* Filter Chips */}
      <View style={styles.chipsRow}>
        {categories.map((cat) => {
          const isSelected = category === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.chip, isSelected && styles.activeChip]}
            >
              <Text style={[styles.chipText, isSelected && styles.activeChipText]}>
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Latest opportunities</Text>
        <Text style={styles.rolesCount}>{filteredJobs.length} roles</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {loading && !refreshing ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#C2410C" />
          <Text style={styles.loadingText}>Fetching opportunities...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <JobCard job={item} onApply={openApplication} />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadJobs(true)}
              colors={["#C2410C"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No matching jobs found</Text>
              <Pressable
                onPress={() => {
                  setQuery("");
                  setCategory("All");
                }}
                style={styles.resetBtn}
              >
                <Text style={styles.resetBtnText}>Reset Filters</Text>
              </Pressable>
            </View>
          }
        />
      )}

      <NotificationModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  listContent: {
    paddingBottom: 30,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#C2410C",
    alignItems: "center",
    justifyContent: "center",
  },
  subBrand: {
    fontSize: 11,
    fontWeight: "800",
    color: "#C2410C",
    letterSpacing: 0.8,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  heroSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    lineHeight: 20,
  },
  toolkitBanner: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#4338CA",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  bannerSubtitle: {
    color: "#E0E7FF",
    fontSize: 12,
    marginTop: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    height: 52,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    marginLeft: 10,
  },
  chipsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 16,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 10,
  },
  activeChip: {
    backgroundColor: "#C2410C",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  activeChipText: {
    color: "#FFFFFF",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  rolesCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 12,
  },
  resetBtn: {
    backgroundColor: "#C2410C",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
    
