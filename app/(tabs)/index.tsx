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
        Alert.alert('Notice', 'Unable to fetch real-time jobs. Showing default listings.');
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

  const handleApplyNow = (job: JobItem) => {
    if (job.contact_email && job.contact_email.includes('@')) {
      const subject = encodeURIComponent(`Application: ${job.role} - [Your Name]`);
      const body = encodeURIComponent(
        `Dear Hiring Team at ${job.company},\n\nI am applying for the ${job.role} position found on Career Buddy India.\n\nKey Highlights:\n- Qualification/Experience: ${job.experience || 'Fresher'}\n- Role Type: ${job.type || 'Full-time'}\n\nPlease review my attached resume. I am available for an immediate interview.\n\nThank you,\nCandidate`
      );
      Linking.openURL(`mailto:${job.contact_email}?subject=${subject}&body=${body}`).catch(() => {
        Alert.alert('Application Desk', `Please send your resume to: ${job.contact_email}`);
      });
    } else {
      Alert.alert('Application Notice', 'Online application will open shortly for this hiring.');
    }
  };

  const handleShareJob = async (job: JobItem) => {
    try {
      await Share.share({
        message: `📢 Vacancy: ${job.role} at ${job.company}\n📍 Location: ${job.location}\n💰 Salary: ${job.salary}\nApply free on Career Buddy India App!`,
      });
    } catch {}
  };

  const getAvatarLetter = (name: string) => {
    return (name && name.length > 0) ? name.charAt(0).toUpperCase() : 'C';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>Career Buddy</Text>
          <Text style={styles.brandSubtitle}>Verified Entry-Level & Fresher Jobs</Text>
        </View>
        <View style={styles.verifiedTag}>
          <Ionicons name="checkmark-seal" size={18} color="#059669" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      </View>

      <View style={styles.trustBanner}>
        <Ionicons name="shield-checkmark" size={16} color="#047857" />
        <Text style={styles.trustBannerText}>
          100% Free Career Portal • Never pay any registration or training fee!
        </Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search by job title, company, or city..."
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

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item)}
              style={[
                styles.filterChip,
                selectedCategory === item && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === item && styles.filterChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color="#0F172A" />
          <Text style={styles.stateText}>Loading verified openings...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.centeredState}>
              <Ionicons name="briefcase-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyHeading}>No Jobs Found</Text>
              <Text style={styles.stateText}>Try clearing your search or category filter.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isBookmarked = savedJobIds.includes(item.id);
            return (
              <View style={styles.naukriCard}>
                <View style={styles.cardTopRow}>
                  <View style={styles.companyAvatar}>
                    <Text style={styles.avatarText}>{getAvatarLetter(item.company)}</Text>
                  </View>
                  <View style={styles.titleColumn}>
                    <Text style={styles.jobRole} numberOfLines={1}>{item.role}</Text>
                    <Text style={styles.companyName} numberOfLines={1}>{item.company}</Text>
                  </View>
                  <View style={styles.actionIconGroup}>
                    <TouchableOpacity onPress={() => toggleBookmark(item.id)} style={styles.iconPadding}>
                      <Ionicons
                        name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                        size={22}
                        color={isBookmarked ? '#2563EB' : '#94A3B8'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleShareJob(item)} style={styles.iconPadding}>
                      <Ionicons name="share-social-outline" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.infoStrip}>
                  <View style={styles.stripItem}>
                    <Ionicons name="briefcase-outline" size={14} color="#64748B" />
                    <Text style={styles.stripText}>{item.experience || 'Fresher'}</Text>
                  </View>
                  <View style={styles.stripItem}>
                    <Ionicons name="wallet-outline" size={14} color="#059669" />
                    <Text style={[styles.stripText, { color: '#059669', fontWeight: '700' }]}>
                      {item.salary}
                    </Text>
                  </View>
                  <View style={styles.stripItem}>
                    <Ionicons name="location-outline" size={14} color="#64748B" />
                    <Text style={styles.stripText} numberOfLines={1}>{item.location}</Text>
                  </View>
                </View>

                <View style={styles.badgeRow}>
                  <View style={styles.pillBadge}>
                    <Text style={styles.pillText}>{item.type || 'Full Time'}</Text>
                  </View>
                  <View style={[styles.pillBadge, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={[styles.pillText, { color: '#2563EB' }]}>{item.category}</Text>
                  </View>
                  <View style={[styles.pillBadge, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={[styles.pillText, { color: '#16A34A' }]}>Direct Hiring</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={styles.detailsBtn}
                    onPress={() => setSelectedJob(item)}
                  >
                    <Text style={styles.detailsBtnText}>View Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={() => handleApplyNow(item)}
                  >
                    <Text style={styles.applyBtnText}>Apply Now</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* JOB DETAILS POPUP */}
      <Modal
        visible={!!selectedJob}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedJob(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSheetTitle}>Job Specifications</Text>
                <Text style={styles.modalSheetSub}>Review role profile before applying</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedJob(null)}>
                <Ionicons name="close-circle" size={28} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {selectedJob && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.detailHeading}>{selectedJob.role}</Text>
                <Text style={styles.detailSub}>{selectedJob.company} • {selectedJob.location}</Text>

                <View style={styles.gridSummary}>
                  <View style={styles.gridBox}>
                    <Text style={styles.gridTitle}>Package Offered</Text>
                    <Text style={styles.gridDesc}>{selectedJob.salary}</Text>
                  </View>
                  <View style={styles.gridBox}>
                    <Text style={styles.gridTitle}>Experience Needed</Text>
                    <Text style={styles.gridDesc}>{selectedJob.experience}</Text>
                  </View>
                  <View style={styles.gridBox}>
                    <Text style={styles.gridTitle}>Job Mode</Text>
                    <Text style={styles.gridDesc}>{selectedJob.type}</Text>
                  </View>
                  <View style={styles.gridBox}>
                    <Text style={styles.gridTitle}>Verification</Text>
                    <Text style={[styles.gridDesc, { color: '#059669' }]}>Verified 100% Free</Text>
                  </View>
                </View>

                <View style={styles.tipsBox}>
                  <View style={styles.tipsTitleRow}>
                    <Ionicons name="bulb-outline" size={18} color="#B45309" />
                    <Text style={styles.tipsHeading}>Interview Preparation Tip</Text>
                  </View>
                  <Text style={styles.tipsText}>
                    Always introduce yourself clearly in 60 seconds (Education, hobbies, strengths). Keep your documents ready in PDF format.
                  </Text>
                </View>

                <View style={styles.antiFraudBox}>
                  <Ionicons name="shield-alert-outline" size={18} color="#DC2626" />
                  <Text style={styles.antiFraudText}>
                    Career Buddy India never charges any fees from candidates. If any employer asks for money, do not pay and report immediately.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalApplyBtn}
                  onPress={() => {
                    const target = selectedJob;
                    setSelectedJob(null);
                    handleApplyNow(target);
                  }}
                >
                  <Text style={styles.modalApplyText}>Submit Application</Text>
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                </TouchableOpacity>
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
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  brandTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  brandSubtitle: { fontSize: 12, color: '#64748B', marginTop: 1 },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#065F46' },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
    gap: 6,
  },
  trustBannerText: { fontSize: 11, color: '#065F46', fontWeight: '600', flex: 1 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A' },
  filterContainer: { paddingHorizontal: 16, paddingVertical: 10 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  filterChipText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  filterChipTextActive: { color: '#FFFFFF' },
  listContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  centeredState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  stateText: { fontSize: 12, color: '#64748B', marginTop: 8 },
  emptyHeading: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 12 },
  naukriCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center' },
  companyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#2563EB' },
  titleColumn: { flex: 1 },
  jobRole: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  companyName: { fontSize: 13, color: '#64748B', marginTop: 2 },
  actionIconGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconPadding: { padding: 4 },
  infoStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  stripItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stripText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap' },
  pillBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailsBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  detailsBtnText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  applyBtn: {
    flex: 1.2,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  applyBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 14,
  },
  modalSheetTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  modalSheetSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  detailHeading: { fontSize: 19, fontWeight: '800', color: '#0F172A' },
  detailSub: { fontSize: 13, color: '#64748B', marginTop: 2, marginBottom: 16 },
  gridSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  gridBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridTitle: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  gridDesc: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  tipsBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  tipsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  tipsHeading: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  tipsText: { fontSize: 12, color: '#78350F', lineHeight: 18 },
  antiFraudBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  antiFraudText: { fontSize: 11, color: '#991B1B', flex: 1, lineHeight: 16 },
  modalApplyBtn: {
    backgroundColor: '#2563EB',
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  modalApplyText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
