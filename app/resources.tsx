import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  Alert
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { createClient } from '@supabase/supabase-js';

// Supabase credentials using environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ResourceItem {
  id: number;
  category: string;
  sub_category: string;
  title: string;
  content: string;
}

const CATEGORIES = [
  'All',
  'Leave Application',
  'Professional Emails',
  'Appreciation & Replies',
  'Interview Preparation'
];

export default function ResourcesScreen() {
  const router = useRouter();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      if (data) setResources(data);
    } catch (err: any) {
      console.error('Error fetching resources:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, title: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', `"${title}" has been copied to your clipboard.`);
  };

  const filteredResources = selectedCategory === 'All'
    ? resources
    : resources.filter((item) => item.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Jobs</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Career Toolkit</Text>
        <View style={{ width: 50 }} />
      </View>

      <Text style={styles.subHeader}>
        Ready-to-use email drafts, leave templates & interview answers.
      </Text>

      {/* Category Horizontal Filter */}
      <View style={{ height: 46 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E11D48" />
          <Text style={styles.loadingText}>Loading templates...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {filteredResources.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.sub_category}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.copyBtn} 
                  onPress={() => copyToClipboard(item.content, item.title)}
                >
                  <Text style={styles.copyBtnText}>Copy Text</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              
              <View style={styles.contentBox}>
                <Text style={styles.contentText} numberOfLines={6}>
                  {item.content}
                </Text>
              </View>
            </View>
          ))}

          {filteredResources.length === 0 && (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No templates found in this category.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  subHeader: {
    fontSize: 13,
    color: '#64748B',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
  },
  filterChipActive: {
    backgroundColor: '#7C3AED',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5B21B6',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  copyBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  contentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  contentText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});
         
