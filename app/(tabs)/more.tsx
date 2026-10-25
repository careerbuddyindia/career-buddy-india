import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>Candidate Help & Policy</Text>
        <Text style={styles.subtitle}>Play Store compliant recruitment guidance & safety standards.</Text>

        {/* Anti-Fraud Disclaimer */}
        <View style={styles.alertCard}>
          <View style={styles.alertHead}>
            <Ionicons name="shield-alert" size={20} color="#DC2626" />
            <Text style={styles.alertTitle}>Zero Fee Policy (No Scam Guarantee)</Text>
          </View>
          <Text style={styles.alertBody}>
            Career Buddy India provides 100% free career enablement. We strictly prohibit listing any recruiter or agency that asks for registration fees, processing charges, or training payments.
          </Text>
        </View>

        {/* 4 Steps for Fresher Job Success */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Fresher Preparation Checklist</Text>
          <Text style={styles.stepItem}>1. <Text style={styles.boldText}>Keep Resume to 1 Page</Text>: Focus on education, projects, and basic computer skills (Excel, Typing).</Text>
          <Text style={styles.stepItem}>2. <Text style={styles.boldText}>Direct Follow-ups</Text>: When applying, check email inbox & spam folder regularly for interview invites.</Text>
          <Text style={styles.stepItem}>3. <Text style={styles.boldText}>Never Share Confidential Data</Text>: Never send OTPs, Aadhaar OTPs, or bank account credentials to anyone.</Text>
        </View>

        {/* Government Non-Affiliation Disclaimer */}
        <View style={styles.legalBox}>
          <Text style={styles.legalHeading}>Compliance Notice (Government Disclaimer)</Text>
          <Text style={styles.legalText}>
            Career Buddy India is a privately managed educational & private recruitment facilitation app. This app is NOT an official government entity, does NOT represent any government ministry, and does not conduct government recruitment examinations.
          </Text>
        </View>

        {/* Important Links */}
        <View style={styles.linksCard}>
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
            onPress={() => Linking.openURL('mailto:support@careerbuddyindia.in')}
          >
            <Ionicons name="mail-unread-outline" size={20} color="#2563EB" />
            <Text style={styles.linkText}>Report Suspicious Recruiter</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Career Buddy India • Release Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 16, paddingBottom: 40 },
  screenTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 16 },
  alertCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  alertHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#B91C1C' },
  alertBody: { fontSize: 12, color: '#991B1B', lineHeight: 18 },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  stepItem: { fontSize: 13, color: '#475569', lineHeight: 22, marginBottom: 6 },
  boldText: { fontWeight: '700', color: '#0F172A' },
  legalBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  legalHeading: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 4 },
  legalText: { fontSize: 11, color: '#64748B', lineHeight: 16 },
  linksCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: 12,
  },
  linkText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0F172A' },
  versionText: { textAlign: 'center', fontSize: 11, color: '#94A3B8', marginTop: 8 },
});
