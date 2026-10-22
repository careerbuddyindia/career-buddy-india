import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../src/lib/supabase";

export default function LoginScreen() {
  const router = useRouter();

  // State: 'phone' or 'otp'
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(57);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Send OTP via Supabase
  const handleSendOtp = async () => {
    const cleanedNumber = mobileNumber.replace(/\D/g, "");
    if (cleanedNumber.length !== 10) {
      Alert.alert("Invalid Number", "Kripya 10-digit valid mobile number enter karein.");
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `+91${cleanedNumber}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (error) {
        Alert.alert("OTP Error", error.message);
      } else {
        setStep("otp");
        setTimer(57);
      }
    } catch {
      Alert.alert("Error", "OTP bhejne me dikkat hui. Kripya dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP via Supabase
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      Alert.alert("Incomplete OTP", "Kripya 6-digit OTP enter karein.");
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `+91${mobileNumber.replace(/\D/g, "")}`;
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: enteredOtp,
        type: "sms",
      });

      if (error) {
        Alert.alert("Verification Failed", error.message);
      } else {
        Alert.alert("Success", "Login successful!", [
          { text: "OK", onPress: () => router.replace("/") },
        ]);
      }
    } catch {
      Alert.alert("Error", "OTP verify nahi ho paya. Dobara koshish karein.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
  };

  const isPhoneValid = mobileNumber.replace(/\D/g, "").length === 10;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        {/* Top Header Navigation */}
        <View style={styles.navBar}>
          <Pressable 
            onPress={() => {
              if (step === "otp") setStep("phone");
              else router.back();
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </Pressable>
        </View>

        {step === "phone" ? (
          /* Phone Input Screen (Naukri Style) */
          <View style={styles.content}>
            <Text style={styles.heading}>Enter Mobile Number</Text>
            <Text style={styles.subHeading}>
              Get job updates and recruiter calls
            </Text>

            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.phoneInputRow}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={10}
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  autoFocus
                />
              </View>
              <Text style={styles.helperText}>
                You will receive an OTP on this number
              </Text>
            </View>

            <View style={styles.btnRowRight}>
              <Pressable
                disabled={!isPhoneValid || loading}
                onPress={handleSendOtp}
                style={[
                  styles.primaryPillBtn,
                  !isPhoneValid && styles.disabledPillBtn,
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.primaryBtnText,
                      !isPhoneValid && styles.disabledBtnText,
                    ]}
                  >
                    Get OTP
                  </Text>
                )}
              </Pressable>
            </View>

            <View style={styles.orDividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable 
              style={styles.socialButton}
              onPress={() => Alert.alert("Notice", "Google login next update me joda jayega.")}
            >
              <Ionicons name="logo-google" size={18} color="#EA4335" />
              <Text style={styles.socialBtnText}>Continue with Google</Text>
            </Pressable>

            <Pressable 
              style={styles.socialButton}
              onPress={() => Alert.alert("Notice", "Email login next update me joda jayega.")}
            >
              <Ionicons name="mail" size={18} color="#0F172A" />
              <Text style={styles.socialBtnText}>Continue with Email</Text>
            </Pressable>
          </View>
        ) : (
          /* OTP Screen (Naukri Style) */
          <View style={styles.content}>
            <Text style={styles.heading}>Log in to Career Buddy</Text>
            <Text style={styles.subHeading}>
              You will receive an OTP on this number
            </Text>

            <View style={styles.editPhoneRow}>
              <Text style={styles.enteredPhoneNumber}>+91 {mobileNumber}</Text>
              <Pressable onPress={() => setStep("phone")}>
                <Ionicons name="pencil" size={16} color="#2563EB" />
              </Pressable>
            </View>

            <Text style={styles.enterOtpLabel}>Enter OTP</Text>

            {/* 6 Digit Underline Inputs */}
            <View style={styles.otpBoxesRow}>
              {otp.map((digit, idx) => (
                <TextInput
                  key={idx}
                  style={styles.otpLineInput}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, idx)}
                />
              ))}
            </View>

            <View style={styles.resendRow}>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend OTP in {timer} seconds</Text>
              ) : (
                <Pressable onPress={handleSendOtp}>
                  <Text style={styles.resendActiveText}>Resend OTP</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.btnRowRight}>
              <Pressable
                disabled={otp.join("").length !== 6 || loading}
                onPress={handleVerifyOtp}
                style={[
                  styles.primaryPillBtn,
                  otp.join("").length !== 6 && styles.disabledPillBtn,
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.primaryBtnText,
                      otp.join("").length !== 6 && styles.disabledBtnText,
                    ]}
                  >
                    Log in
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  navBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  subHeading: {
    fontSize: 14,
    color: "#475569",
    marginTop: 6,
    marginBottom: 28,
  },
  inputCard: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 4,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#2563EB",
    paddingBottom: 6,
  },
  countryCode: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    paddingVertical: 0,
  },
  helperText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 6,
  },
  btnRowRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  primaryPillBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    elevation: 2,
    minWidth: 110,
    alignItems: "center",
  },
  disabledPillBtn: {
    backgroundColor: "#93C5FD",
    elevation: 0,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  disabledBtnText: {
    color: "#FFFFFF",
  },
  orDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: "#94A3B8",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 24,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 10,
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  editPhoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  enteredPhoneNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  enterOtpLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 12,
  },
  otpBoxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpLineInput: {
    width: 44,
    height: 48,
    borderBottomWidth: 2,
    borderBottomColor: "#2563EB",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  resendRow: {
    marginBottom: 16,
  },
  timerText: {
    fontSize: 13,
    color: "#64748B",
  },
  resendActiveText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
});
    
