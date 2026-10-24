import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>Safety & Career Advice</Text>
        <Text style={styles.subtitle}>Helpful resources and Google Play safety guidelines.</Text>

        <View style={styles.warningCard}>
          <View style={styles.warningHead}>
            <Ionicons name="warning" size={20} color="#DC2626" />
            <Text style={styles.warningTitle}>Beware of Job Scams!</Text>
          </View>
          <Text style={styles.warningBody}>
            • Genuine companies never demand registration or document processing fees.{'\n'}
            • Never share OTPs, bank passwords, or UPI PINs with anyone claiming to be HR.{'\n'}
            • Always verify company credentials before attending online interviews.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardHeader}>5 Tips for Fresher Resume</Text>
          <Text style={styles.cardBody}>
            1. Keep it strictly to 1 page.{'\n'}
            2. Clearly list your computer & language skills (e.g., Excel, Typing, English/Hindi).{'\n'}
            3. Highlight academic projects or volunteer work.{'\n'}
            4. Use a clear, standard email address.{'\n'}
            5. Double-check for phone number errors.
          </Text>
        </View>

        <View style={styles.legalCard}>
          <Text style={styles.legalTitle}>Official Disclaimer & Compliance</Text>
          <Text style={styles.legalBody}>
            Career Buddy India is an independent career enablement and listing platform designed to assist freshers and private job seekers. We are NOT associated with, authorized by, or representing any government department or official recruitment agency.
          </Text>
        </View>

        <View style={styles.linksGroup}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL('https://policies.google.com/privacy')}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#2563EB" />
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL('mailto:support@careerbuddy.sample.in')}
          >
            <Ionicons name="headset-outline" size={20} color="#2563EB" />
            <Text style={styles.linkText}>Report Fake Job / Help Desk</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>Career Buddy India • Version 1.0.0 (Production Ready)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 16, paddingBottom: 40 },
  screenTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 16 },
  warningCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  warningHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  warningTitle: { fontSize: 15, fontWeight: '700', color: '#B91C1C' },
  warningBody: { fontSize: 13, color: '#991B1B', lineHeight: 20 },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  cardBody: { fontSize: 13, color: '#475569', lineHeight: 22 },
  legalCard: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  legalTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 4 },
  legalBody: { fontSize: 12, color: '#64748B', lineHeight: 18 },
  linksGroup: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  linkText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  footerNote: { textAlign: 'center', fontSize: 11, color: '#94A3B8', marginTop: 10 },
});
