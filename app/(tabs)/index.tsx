import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  Share,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';

interface JobItem {
  id: string | number;
  role: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  category: string;
  experience: string;
  contact_email: string;
  whatsapp: string;
}

const CATEGORIES = ['All', 'Saved ❤️', 'WFH', '12th Pass', 'Sales', 'Graduate'];

export default function JobsScreen() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedJobIds, setSavedJobIds] = useState<Array<string | number>>([]);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        Alert.alert('Notice', 'Unable to fetch real-time jobs right now.');
      } else if (data && data.length > 0) {
        setJobs(data as JobItem[]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const toggleBookmark = (id: string | number) => {
    if (savedJobIds.includes(id)) {
      setSavedJobIds(savedJobIds.filter((item) => item !== id));
    } else {
      setSavedJobIds([...savedJobIds, id]);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    let matchesCategory = true;
    if (selectedCategory === 'Saved ❤️') {
      matchesCategory = savedJobIds.includes(job.id);
    } else if (selectedCategory !== 'All') {
      matchesCategory = job.category === selectedCategory;
    }

    const matchesSearch =
      (job.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.company || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleApplyEmail = (job: JobItem) => {
    const subject = encodeURIComponent(`Application for ${job.role} - Career Buddy India`);
    const body = encodeURIComponent(
      `Dear Hiring Team at ${job.company},\n\nI am applying for the ${job.role} position listed on Career Buddy India.\n\nKey Highlights:\n- Qualification/Experience: ${job.experience || 'Fresher'}\n- Preferred Mode: ${job.type || 'Full-time'}\n\nPlease find my resume attached.\n\nWarm regards,\nCandidate`
    );
    Linking.openURL(`mailto:${job.contact_email}?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert('Email App Missing', `Please email directly to: ${job.contact_email}`);
    });
  };

  const handleApplyWhatsApp = (job: JobItem) => {
    const msg = encodeURIComponent(
      `Hello HR Team,\nI came across the opening for *${job.role}* at *${job.company}* via Career Buddy India.\n\nI would like to submit my application for this role.\nCould you please let me know the procedure to share my resume?\n\nThank you!`
    );
    Linking.openURL(`whatsapp://send?phone=${job.whatsapp}&text=${msg}`).catch(() => {
      Alert.alert('Notice', 'WhatsApp is not installed on this device.');
    });
  };

  const handleShareJob = async (job: JobItem) => {
    try {
      await Share.share({
        message: `📢 Opening: ${job.role} at ${job.company} (${job.location})\n💰 Salary: ${job.salary}\nApply via Career Buddy India!`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Career Buddy India</Text>
          <Text style={styles.headerSubtitle}>Verified Private Jobs for Freshers</Text>
        </View>
        <Ionicons name="sparkles" size={24} color="#2563EB" />
      </View>

      <View style={styles.alertBanner}>
        <Ionicons name="shield-checkmark" size={16} color="#B45309" />
        <Text style={styles.alertText}>100% Free jobs. Never pay any fee for interview calls!</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search by role, city, or company..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item)}
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Fetching active openings...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Ionicons name="briefcase-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyText}>No jobs found in this section.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isBookmarked = savedJobIds.includes(item.id);
            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => setSelectedJob(item)}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.roleText}>{item.role}</Text>
                    <Text style={styles.companyText}>{item.company}</Text>
                  </View>
                  <View style={styles.topCardActions}>
                    <TouchableOpacity onPress={() => toggleBookmark(item.id)} style={styles.iconBtn}>
                      <Ionicons
                        name={isBookmarked ? 'heart' : 'heart-outline'}
                        size={22}
                        color={isBookmarked ? '#EF4444' : '#64748B'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleShareJob(item)} style={styles.iconBtn}>
                      <Ionicons name="share-social-outline" size={20} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={15} color="#64748B" />
                    <Text style={styles.metaText}>{item.location}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="cash-outline" size={15} color="#059669" />
                    <Text style={[styles.metaText, { color: '#059669', fontWeight: 'bold' }]}>
                      {item.salary}
                    </Text>
                  </View>
                </View>

                <View style={styles.tagRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.experience || 'Fresher'}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={[styles.badgeText, { color: '#2563EB' }]}>{item.type || 'Full-time'}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={[styles.badgeText, { color: '#16A34A' }]}>{item.category}</Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.emailBtn]}
                    onPress={() => handleApplyEmail(item)}
                  >
                    <Ionicons name="mail" size={16} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>Send CV (Email)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.whatsappBtn]}
                    onPress={() => handleApplyWhatsApp(item)}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>WhatsApp HR</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* JOB DETAILS POPUP MODAL */}
      <Modal
        visible={!!selectedJob}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedJob(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Job Overview</Text>
              <TouchableOpacity onPress={() => setSelectedJob(null)}>
                <Ionicons name="close-circle" size={26} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {selectedJob && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.detailRole}>{selectedJob.role}</Text>
                <Text style={styles.detailCompany}>{selectedJob.company}</Text>

                <View style={styles.detailGrid}>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Monthly Salary</Text>
                    <Text style={styles.gridValue}>{selectedJob.salary}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Location</Text>
                    <Text style={styles.gridValue}>{selectedJob.location}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Eligibility</Text>
                    <Text style={styles.gridValue}>{selectedJob.experience}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Employment Type</Text>
                    <Text style={styles.gridValue}>{selectedJob.type}</Text>
                  </View>
                </View>

                <View style={styles.safetyBox}>
                  <Ionicons name="shield-half-outline" size={18} color="#D97706" />
                  <Text style={styles.safetyText}>
                    Direct HR Contact: Ensure your resume highlights basic computer knowledge and clear contact info.
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.emailBtn]}
                    onPress={() => handleApplyEmail(selectedJob)}
                  >
                    <Ionicons name="mail" size={16} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>Email Resume</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.whatsappBtn]}
                    onPress={() => handleApplyWhatsApp(selectedJob)}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>WhatsApp HR</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  alertText: { fontSize: 12, color: '#92400E', fontWeight: '600', marginLeft: 6, flex: 1 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 46,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
  filterRow: { paddingHorizontal: 16, paddingVertical: 12 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  categoryChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  categoryText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  categoryTextActive: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 16, paddingBottom: 35 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 10, fontSize: 13, color: '#64748B' },
  emptyText: { fontSize: 14, color: '#94A3B8', marginTop: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  topCardActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: { padding: 4 },
  roleText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  companyText: { fontSize: 14, color: '#64748B', marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#64748B' },
  tagRow: { flexDirection: 'row', marginTop: 10, gap: 8, flexWrap: 'wrap' },
  badge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  emailBtn: { backgroundColor: '#2563EB' },
  whatsappBtn: { backgroundColor: '#16A34A' },
  actionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  detailRole: { fontSize: 19, fontWeight: '800', color: '#1E293B' },
  detailCompany: { fontSize: 14, color: '#64748B', marginTop: 2, marginBottom: 16 },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  gridValue: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  safetyBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  safetyText: { fontSize: 12, color: '#92400E', flex: 1, lineHeight: 18 },
  modalActions: { flexDirection: 'row', gap: 10, paddingBottom: 10 },
});
                    
