import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function LetterGeneratorScreen() {
  const [candidateName, setCandidateName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [education, setEducation] = useState('');
  const [selectedType, setSelectedType] = useState('job_cover');
  const [generatedLetter, setGeneratedLetter] = useState('');

  const generateLetterContent = () => {
    const name = candidateName.trim() || '[Your Name]';
    const role = jobRole.trim() || '[Job Title]';
    const company = companyName.trim() || '[Company Name]';
    const qual = education.trim() || '[Highest Qualification]';

    let result = '';

    if (selectedType === 'job_cover') {
      result = `Subject: Application for ${role} - ${name}

Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${role} opening. I have completed my ${qual} and I am eager to apply my skills, fast-learning ability, and dedication to your organization.

As a fresher, I bring a high level of enthusiasm, discipline, and a strong willingness to learn and adapt to ${company}'s work culture. I am confident that my positive attitude and dedication will make me a productive asset to your team.

My resume is attached for your review. I would welcome the opportunity to discuss my application further in an interview.

Thank you for your time and consideration.

Warm regards,
${name}
Contact: [Your Phone Number]`;
    } else if (selectedType === 'hr_email') {
      result = `Subject: Job Inquiry: ${role} - ${name} (${qual})

Hello HR Team,

I hope you are having a productive week.

I have been following ${company}'s growth and would love to explore any entry-level or junior opportunities in ${role}. 

With a background in ${qual}, I am ready to join immediately and support your operations with complete commitment. Please find my updated resume attached for your consideration.

Looking forward to hearing from you.

Best regards,
${name}
Contact: [Your Mobile Number]`;
    } else {
      result = `Subject: Resignation Letter - ${name}

Dear Manager,

Please accept this letter as formal notification that I am resigning from my position as ${role} at ${company}. My last working day will be [Notice Date].

I want to thank you and the entire team for the support and learning opportunities provided to me during my time here. I will ensure a smooth handover of all my current responsibilities before my departure.

Wishing the organization continued success.

Sincerely,
${name}`;
    }

    setGeneratedLetter(result);
  };

  const copyToClipboard = async () => {
    if (!generatedLetter) return;
    await Clipboard.setStringAsync(generatedLetter);
    Alert.alert('Copied!', 'Letter copied to clipboard. You can paste it directly into Gmail or WhatsApp.');
  };

  const shareLetter = async () => {
    if (!generatedLetter) return;
    await Share.share({ message: generatedLetter });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.screenTitle}>Instant Letter Generator</Text>
        <Text style={styles.subtitle}>
          Create ATS-ready professional cover letters and HR emails in seconds.
        </Text>

        {/* Template Type Selector */}
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, selectedType === 'job_cover' && styles.typeBtnActive]}
            onPress={() => setSelectedType('job_cover')}
          >
            <Text style={[styles.typeBtnText, selectedType === 'job_cover' && styles.typeBtnTextActive]}>
              Fresher Cover
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeBtn, selectedType === 'hr_email' && styles.typeBtnActive]}
            onPress={() => setSelectedType('hr_email')}
          >
            <Text style={[styles.typeBtnText, selectedType === 'hr_email' && styles.typeBtnTextActive]}>
              HR Cold Email
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeBtn, selectedType === 'resignation' && styles.typeBtnActive]}
            onPress={() => setSelectedType('resignation')}
          >
            <Text style={[styles.typeBtnText, selectedType === 'resignation' && styles.typeBtnTextActive]}>
              Resignation
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Your Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Rahul Sharma"
            placeholderTextColor="#94A3B8"
            value={candidateName}
            onChangeText={setCandidateName}
          />

          <Text style={styles.inputLabel}>Applying For (Job Title)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Back Office Assistant / Sales Executive"
            placeholderTextColor="#94A3B8"
            value={jobRole}
            onChangeText={setJobRole}
          />

          <Text style={styles.inputLabel}>Target Company Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Infosys / Local Business Name"
            placeholderTextColor="#94A3B8"
            value={companyName}
            onChangeText={setCompanyName}
          />

          <Text style={styles.inputLabel}>Highest Qualification</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 12th Pass / B.Com / BCA Graduate"
            placeholderTextColor="#94A3B8"
            value={education}
            onChangeText={setEducation}
          />

          <TouchableOpacity style={styles.createBtn} onPress={generateLetterContent}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            <Text style={styles.createBtnText}>Generate Ready Letter</Text>
          </TouchableOpacity>
        </View>

        {/* Preview & Actions */}
        {generatedLetter ? (
          <View style={styles.resultBox}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Your Formatted Letter:</Text>
              <View style={styles.iconActions}>
                <TouchableOpacity onPress={copyToClipboard} style={styles.actionIconBtn}>
                  <Ionicons name="copy-outline" size={20} color="#2563EB" />
                </TouchableOpacity>
                <TouchableOpacity onPress={shareLetter} style={styles.actionIconBtn}>
                  <Ionicons name="share-social-outline" size={20} color="#16A34A" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.letterBody}>{generatedLetter}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 16, paddingBottom: 40 },
  screenTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 14 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  typeBtnText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  typeBtnTextActive: { color: '#FFFFFF' },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 4 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 12,
  },
  createBtn: {
    backgroundColor: '#2563EB',
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  createBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  resultBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  iconActions: { flexDirection: 'row', gap: 12 },
  actionIconBtn: { padding: 4 },
  letterBody: { fontSize: 13, color: '#334155', lineHeight: 20 },
});
