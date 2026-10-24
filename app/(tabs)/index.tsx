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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';

interface JobItem {
  id: string;
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

const CATEGORIES = ['All', 'WFH', '12th Pass', 'Sales', 'Graduate'];

export default function JobsScreen() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        Alert.alert('Notice', 'Unable to fetch real-time jobs. Showing default jobs.');
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

  const filteredJobs = jobs.filter((job) => {
    const matchesCategory =
      selectedCategory === 'All' || job.category === selectedCategory;
    const matchesSearch =
      (job.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.company || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApplyEmail = (job: JobItem) => {
    const subject = encodeURIComponent(`Application for ${job.role} - Career Buddy India`);
    const body = encodeURIComponent(
      `Respected HR Team,\n\nI am writing to express my interest in the ${job.role} opening at ${job.company}.\n\nPlease find my resume attached.\n\nThank you,\nCandidate`
    );
    Linking.openURL(`mailto:${job.contact_email}?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert('Email App Missing', `Please email your CV directly to: ${job.contact_email}`);
    });
  };

  const handleApplyWhatsApp = (job: JobItem) => {
    const msg = encodeURIComponent(
      `Hello HR, I saw the opening for "${job.role}" on Career Buddy India. I am interested and want to apply.`
    );
    Linking.openURL(`whatsapp://send?phone=${job.whatsapp}&text=${msg}`).catch(() => {
      Alert.alert('Notice', 'WhatsApp is not installed on this device.');
    });
  };

  const handleShareJob = async (job: JobItem) => {
    try {
      await Share.share({
        message: `Opportunity: ${job.role} at ${job.company} (${job.location}). Salary: ${job.salary}. Contact: ${job.contact_email}. Shared via Career Buddy India!`,
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
        <Ionicons name="shield-alert" size={18} color="#D97706" />
        <Text style={styles.alertText}>
          Never pay money for any job registration or interview!
        </Text>
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
          <Text style={styles.loadingText}>Fetching latest jobs...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Text style={styles.emptyText}>No jobs found in this category.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleText}>{item.role}</Text>
                  <Text style={styles.companyText}>{item.company}</Text>
                </View>
                <TouchableOpacity onPress={() => handleShareJob(item)}>
                  <Ionicons name="share-social-outline" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{item.location}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="cash-outline" size={14} color="#059669" />
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
            </View>
          )}
        />
      )}
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
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  categoryChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  categoryText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  categoryTextActive: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 10, fontSize: 13, color: '#64748B' },
  emptyText: { fontSize: 14, color: '#94A3B8' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  roleText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  companyText: { fontSize: 14, color: '#64748B', marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#64748B' },
  tagRow: { flexDirection: 'row', marginTop: 10, gap: 8 },
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
    height: 38,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  emailBtn: { backgroundColor: '#2563EB' },
  whatsappBtn: { backgroundColor: '#16A34A' },
  actionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
