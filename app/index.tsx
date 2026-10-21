import { Ionicons } from "@expo/vector-icons";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Job, JobCard } from "@/src/components/job-card";
import { NotificationModal } from "@/src/components/notification-modal";
import { supabase } from "@/src/lib/supabase";
import { makeStyles, useTheme } from "@/src/theme";

type Category = "All" | "Government" | "Private";
const categories: Category[] = ["All", "Government", "Private"];

const sortJobs = (items: Job[]) =>
  [...items].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

export default function Index() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
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

    const { data, error: queryError } = await supabase
      .from("jobs")
      .select(
        "id, title, organization, category, qualification, location, last_date, apply_link, created_at"
      )
      .order("created_at", { ascending: false });

    if (queryError) setError(queryError.message);
    else setJobs(sortJobs((data ?? []) as Job[]));

    if (isRefresh) setRefreshing(false);
    else setLoading(false);
  }, []);

  useEffect(() => {
    void loadJobs();

    const handleChange = (payload: RealtimePostgresChangesPayload<Job>) => {
      if (payload.eventType === "INSERT") {
        setJobs((current) =>
          current.some((job) => String(job.id) === String(payload.new.id))
            ? current
            : sortJobs([payload.new as Job, ...current])
        );
      }
      if (payload.eventType === "UPDATE") {
        setJobs((current) =>
          sortJobs(
            current.map((job) =>
              String(job.id) === String(payload.new.id) ? (payload.new as Job) : job
            )
          )
        );
      }
      if (payload.eventType === "DELETE") {
        setJobs((current) =>
          current.filter((job) => String(job.id) !== String(payload.old.id))
        );
      }
    };

    const channel = supabase
      .channel("public:jobs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        handleChange
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setError(`Live updates unavailable (${status.toLowerCase()}).`);
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadJobs]);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesCategory =
        category === "All" || job.category?.toLowerCase() === category.toLowerCase();
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
        throw new Error("This application link cannot be opened on your device.");
      }
      await Linking.openURL(link);
    } catch (openError) {
      Alert.alert(
        "Unable to open link",
        openError instanceof Error ? openError.message : "Please try again later."
      );
    }
  };

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
  };

  const header = (
    <View>
      <View style={styles.header}>
        <View style={styles.brandLockup}>
          <View style={styles.brandMark}>
            <Ionicons name="briefcase" size={18} color={colors.onBrandPrimary} />
          </View>
          <View>
            <Text style={styles.eyebrow}>YOUR NEXT MOVE</Text>
            <Text style={styles.title}>Career Buddy India</Text>
          </View>
        </View>
        <Pressable
          accessibilityLabel="Open notifications"
          accessibilityRole="button"
          onPress={() => setNotificationsVisible(true)}
          style={({ pressed }) => [
            styles.notificationButton,
            pressed && styles.pressed,
          ]}
          testID="notifications-button"
        >
          <Ionicons name="notifications-outline" size={22} color={styles.notificationIcon.color} />
          {jobs.length > 0 ? <View style={styles.notificationDot} /> : null}
        </Pressable>
      </View>

      <View style={styles.introBlock}>
        <Text style={styles.heading}>Find work that moves you forward.</Text>
        <Text style={styles.subtitle}>
          Browse verified openings across government and private organizations.
        </Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={styles.searchIcon.color} />
        <TextInput
          accessibilityLabel="Search jobs"
          autoCapitalize="none"
          onChangeText={setQuery}
          onSubmitEditing={Keyboard.dismiss}
          placeholder="Search title, department, organization"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          style={styles.searchInput}
          testID="job-search-input"
          value={query}
        />
        {query ? (
          <Pressable
            accessibilityLabel="Clear search"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setQuery("")}
          >
            <Ionicons name="close-circle" size={19} color={styles.clearIcon.color} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.filterRow}>
        {categories.map((item) => {
          const selected = category === item;
          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setCategory(item)}
              style={({ pressed }) => [
                styles.filterPill,
                selected && styles.selectedPill,
                pressed && styles.pressed,
              ]}
              testID={`filter-${item.toLowerCase()}`}
            >
              <Text
                style={[
                  styles.filterText,
                  selected && styles.selectedFilterText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error && jobs.length > 0 ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={18} color={styles.errorIcon.color} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => void loadJobs(true)}>
            <Text style={styles.retryInline}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.resultsHeader}>
        <Text style={styles.sectionTitle}>
          {query || category !== "All" ? "Matching roles" : "Latest opportunities"}
        </Text>
        <Text style={styles.resultCount}>
          {filteredJobs.length} {filteredJobs.length === 1 ? "role" : "roles"}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <FlatList
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 24, paddingTop: insets.top + 12 },
          ]}
          data={filteredJobs}
          keyExtractor={(job) => String(job.id)}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            loading ? (
              <LoadingState styles={styles} />
            ) : error && !jobs.length ? (
              <ErrorState
                error={error}
                onRetry={() => void loadJobs()}
                styles={styles}
              />
            ) : (
              <EmptyState
                hasFilters={Boolean(query || category !== "All")}
                onReset={resetFilters}
                styles={styles}
              />
            )
          }
          ListHeaderComponent={header}
          refreshControl={
            <RefreshControl
              onRefresh={() => void loadJobs(true)}
              refreshing={refreshing}
              tintColor={colors.brand}
              colors={[colors.brand]}
            />
          }
          renderItem={({ item }) => (
            <JobCard job={item} onApply={openApplication} />
          )}
          showsVerticalScrollIndicator={false}
          testID="jobs-list"
        />
      </KeyboardAvoidingView>
      <NotificationModal
        jobs={jobs.slice(0, 8)}
        onClose={() => setNotificationsVisible(false)}
        visible={notificationsVisible}
      />
    </View>
  );
}

function LoadingState({ styles }: { styles: ReturnType<typeof useStyles> }) {
  return (
    <View style={styles.state} testID="jobs-loading">
      <ActivityIndicator size="large" color={styles.loading.color} />
      <Text style={styles.stateTitle}>Finding your next opportunity...</Text>
      <Text style={styles.stateBody}>Fetching the latest listings.</Text>
    </View>
  );
}

function ErrorState({
  error,
  onRetry,
  styles,
}: {
  error: string;
  onRetry: () => void;
  styles: ReturnType<typeof useStyles>;
}) {
  return (
    <View style={styles.state} testID="jobs-error">
      <View style={styles.stateIcon}>
        <Ionicons name="cloud-offline-outline" size={28} color={styles.stateIconGlyph.color} />
      </View>
      <Text style={styles.stateTitle}>We couldn’t load jobs</Text>
      <Text style={styles.stateBody}>{error}</Text>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
      >
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </View>
  );
}

function EmptyState({
  hasFilters,
  onReset,
  styles,
}: {
  hasFilters: boolean;
  onReset: () => void;
  styles: ReturnType<typeof useStyles>;
}) {
  return (
    <View style={styles.state} testID="jobs-empty">
      <View style={styles.stateIcon}>
        <Ionicons name="compass-outline" size={28} color={styles.stateIconGlyph.color} />
      </View>
      <Text style={styles.stateTitle}>
        {hasFilters ? "No matching jobs" : "No jobs posted yet"}
      </Text>
      <Text style={styles.stateBody}>
        {hasFilters
          ? "Try a different search or clear your filters to explore every opening."
          : "New opportunities will appear here as soon as they are published."}
      </Text>
      {hasFilters ? (
        <Pressable
          onPress={onReset}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.retryText}>Clear filters</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    screen: { backgroundColor: colors.surface, flex: 1 },
    keyboardView: { flex: 1 },
    listContent: { paddingHorizontal: 20 },
    header: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    brandLockup: { alignItems: "center", flexDirection: "row", gap: 11 },
    brandMark: {
      alignItems: "center",
      backgroundColor: colors.brandPrimary,
      borderRadius: 13,
      height: 38,
      justifyContent: "center",
      width: 38,
    },
    eyebrow: {
      color: colors.brand,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.3,
      marginBottom: 2,
    },
    title: {
      color: colors.onSurface,
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    notificationButton: {
      alignItems: "center",
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.border,
      borderRadius: 22,
      borderWidth: 1,
      height: 44,
      justifyContent: "center",
      position: "relative",
      width: 44,
    },
    notificationIcon: { color: colors.onSurface },
    notificationDot: {
      backgroundColor: colors.brand,
      borderColor: colors.surfaceSecondary,
      borderRadius: 5,
      borderWidth: 2,
      height: 10,
      position: "absolute",
      right: 9,
      top: 8,
      width: 10,
    },
    introBlock: { gap: 8, marginBottom: 22, marginTop: 35 },
    heading: {
      color: colors.onSurface,
      fontSize: 30,
      fontWeight: "800",
      letterSpacing: -1,
      lineHeight: 36,
      maxWidth: 350,
    },
    subtitle: {
      color: colors.muted,
      fontSize: 15,
      lineHeight: 22,
      maxWidth: 340,
    },
    searchBar: {
      alignItems: "center",
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.border,
      borderRadius: 15,
      borderWidth: 1,
      flexDirection: "row",
      gap: 10,
      minHeight: 54,
      paddingHorizontal: 15,
    },
    searchIcon: { color: colors.brand },
    searchInput: {
      color: colors.onSurface,
      flex: 1,
      fontSize: 14,
      minHeight: 52,
    },
    clearIcon: { color: colors.muted },
    filterRow: {
      flexDirection: "row",
      gap: 9,
      marginBottom: 26,
      marginTop: 15,
    },
    filterPill: {
      alignItems: "center",
      backgroundColor: colors.surfaceTertiary,
      borderRadius: 999,
      minHeight: 40,
      justifyContent: "center",
      paddingHorizontal: 18,
    },
    selectedPill: { backgroundColor: colors.brandPrimary },
    filterText: {
      color: colors.onSurfaceTertiary,
      fontSize: 13,
      fontWeight: "700",
    },
    selectedFilterText: { color: colors.onBrandPrimary },
    errorBanner: {
      alignItems: "center",
      backgroundColor: colors.brandTertiary,
      borderRadius: 12,
      flexDirection: "row",
      gap: 8,
      marginBottom: 19,
      padding: 12,
    },
    errorIcon: { color: colors.brand },
    errorText: {
      color: colors.onBrandTertiary,
      flex: 1,
      fontSize: 12,
      lineHeight: 17,
    },
    retryInline: { color: colors.brand, fontSize: 12, fontWeight: "800" },
    resultsHeader: {
      alignItems: "baseline",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 13,
    },
    sectionTitle: {
      color: colors.onSurface,
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: -0.4,
    },
    resultCount: { color: colors.muted, fontSize: 13, fontWeight: "600" },
    state: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      minHeight: 330,
      paddingHorizontal: 28,
    },
    loading: { color: colors.brand },
    stateIcon: {
      alignItems: "center",
      backgroundColor: colors.brandTertiary,
      borderRadius: 36,
      height: 72,
      justifyContent: "center",
      marginBottom: 18,
      width: 72,
    },
    stateIconGlyph: { color: colors.brand },
    stateTitle: {
      color: colors.onSurface,
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 8,
      textAlign: "center",
    },
    stateBody: {
      color: colors.muted,
      fontSize: 14,
      lineHeight: 21,
      maxWidth: 300,
      textAlign: "center",
    },
    retryButton: {
      alignItems: "center",
      backgroundColor: colors.brandPrimary,
      borderRadius: 12,
      marginTop: 22,
      minHeight: 46,
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    retryText: { color: colors.onBrandPrimary, fontSize: 14, fontWeight: "700" },
    pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  })
);
  
