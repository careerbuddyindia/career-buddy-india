import { Ionicons } from "@expo/vector-icons";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Job } from "@/src/components/job-card";
import { makeStyles } from "@/src/theme";

type NotificationModalProps = {
  visible: boolean;
  jobs?: Job[];
  onClose: () => void;
};

export function NotificationModal({ visible, jobs = [], onClose }: NotificationModalProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();

  if (!visible) return null;

  const content = (
    <View style={[styles.screen, { paddingBottom: insets.bottom, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>YOUR UPDATES</Text>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <Pressable
          accessibilityLabel="Close notifications"
          accessibilityRole="button"
          onPress={onClose}
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          testID="notifications-close"
        >
          <Ionicons name="close" size={23} color={styles.closeIcon.color} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {jobs.length ? (
          jobs.map((job) => (
            <View key={String(job.id)} style={styles.item}>
              <View style={styles.iconCircle}>
                <Ionicons name="sparkles-outline" size={18} color={styles.itemIcon.color} />
              </View>
              <View style={styles.itemCopy}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  New opportunity from {job.organization || "an organization"}
                </Text>
                <Text style={styles.itemBody} numberOfLines={2}>
                  {job.title || "A new role is waiting to be explored."}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={28} color={styles.emptyIconGlyph.color} />
            </View>
            <Text style={styles.emptyTitle}>You’re all caught up</Text>
            <Text style={styles.emptyBody}>
              New job alerts will appear here as opportunities are added.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  if (Platform.OS === "web") return <View style={styles.webOverlay}>{content}</View>;
  return (
    <Modal animationType="slide" onRequestClose={onClose} visible>
      {content}
    </Modal>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    webOverlay: {
      backgroundColor: colors.surface,
      bottom: 0,
      left: 0,
      position: "absolute",
      right: 0,
      top: 0,
      zIndex: 20,
    },
    screen: { backgroundColor: colors.surface, flex: 1 },
    header: {
      alignItems: "center",
      borderBottomColor: colors.divider,
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 22,
      paddingVertical: 20,
    },
    eyebrow: {
      color: colors.brand,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.3,
      marginBottom: 4,
    },
    title: {
      color: colors.onSurface,
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: -0.7,
    },
    closeButton: {
      alignItems: "center",
      backgroundColor: colors.surfaceTertiary,
      borderRadius: 22,
      height: 44,
      justifyContent: "center",
      width: 44,
    },
    closeIcon: { color: colors.onSurface },
    content: { padding: 22 },
    item: {
      alignItems: "center",
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.border,
      borderRadius: 16,
      borderWidth: 1,
      flexDirection: "row",
      gap: 13,
      marginBottom: 12,
      padding: 15,
    },
    iconCircle: {
      alignItems: "center",
      backgroundColor: colors.brandTertiary,
      borderRadius: 22,
      height: 44,
      justifyContent: "center",
      width: 44,
    },
    itemIcon: { color: colors.brand },
    itemCopy: { flex: 1, gap: 4 },
    itemTitle: {
      color: colors.onSurfaceSecondary,
      fontSize: 14,
      fontWeight: "700",
      lineHeight: 20,
    },
    itemBody: { color: colors.muted, fontSize: 13, lineHeight: 18 },
    empty: { alignItems: "center", paddingHorizontal: 24, paddingTop: 100 },
    emptyIcon: {
      alignItems: "center",
      backgroundColor: colors.brandTertiary,
      borderRadius: 36,
      height: 72,
      justifyContent: "center",
      marginBottom: 18,
      width: 72,
    },
    emptyIconGlyph: { color: colors.brand },
    emptyTitle: {
      color: colors.onSurface,
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 8,
    },
    emptyBody: {
      color: colors.muted,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
    },
    pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  })
);
