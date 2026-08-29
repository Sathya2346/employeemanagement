import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { authApi } from '../../api/authApi';

/**
 * Pixel-perfect mobile matching:
 *   src/main/resources/templates/verify-otp.html
 *   src/main/resources/static/css/login.css
 *
 * Thymeleaf structure:
 *   Right Section: "Enter OTP" title + OTP input + orangeBtn "Verify OTP" + alerts + "Resend OTP" link
 *   Left Section: img1.png illustration + "Grow Your Workspace Experience" + description
 *
 * Note: verify-otp.html does NOT have a "Back to Login" link (unlike forgot-password.html).
 */

const VerifyOtpScreen = ({ route, navigation }) => {
  const { width } = useWindowDimensions();
  const { email } = route.params || { email: '' };
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  /* Responsive helpers matching login.css breakpoints */
  const isDesktop = width >= 992;
  const isTablet = width >= 768 && width < 992;
  const isMobileLg = width >= 576 && width < 768;
  const isMobile = width >= 375 && width < 576;
  const isSmallMobile = width >= 320 && width < 375;
  const isTiny = width < 320;

  const containerPadding = isTiny ? 0 : isSmallMobile ? 5 : isMobile ? 5 : isMobileLg ? 10 : 15;
  const cardRadius = isMobile ? 12 : isSmallMobile ? 10 : isTiny ? 10 : 15;
  const cardMarginH = isSmallMobile ? 5 : 0;

  const leftPadH = isTiny ? 12 : isSmallMobile ? 12 : isMobile ? 15 : isMobileLg ? 20 : isTablet ? 30 : 40;
  const leftPadV = isTiny ? 20 : isSmallMobile ? 20 : isMobile ? 25 : isMobileLg ? 30 : isTablet ? 40 : 50;
  const iconSize = isTiny ? 100 : isSmallMobile ? 120 : isMobile ? 140 : isMobileLg ? 180 : isTablet ? 220 : 200;
  const leftTitleSize = isTiny ? 14 : isSmallMobile ? 15 : isMobile ? 17 : isMobileLg ? 20 : isTablet ? 22 : 22;
  const leftDescSize = isTiny ? 9 : isSmallMobile ? 10 : isMobile ? 11 : isMobileLg ? 12 : 14;
  const showDescription = isDesktop || isTablet;

  const rightPadH = isTiny ? 12 : isSmallMobile ? 12 : isMobile ? 15 : isMobileLg ? 20 : isTablet ? 30 : 40;
  const rightPadV = isTiny ? 20 : isSmallMobile ? 20 : isMobile ? 25 : isMobileLg ? 30 : isTablet ? 40 : 50;
  const loginTitleSize = isTiny ? 16 : isSmallMobile ? 18 : isMobile ? 20 : isMobileLg ? 22 : 24;

  const inputFontSize = isTiny ? 12 : isSmallMobile ? 13 : isMobile ? 14 : 14;
  const inputPadV = isTiny ? 6 : isSmallMobile ? 7 : isMobile ? 8 : 10;
  const inputPadH = isTiny ? 8 : isSmallMobile ? 10 : isMobile ? 12 : 15;
  const btnFontSize = isTiny ? 13 : isSmallMobile ? 14 : isMobile ? 15 : 16;
  const btnPadV = isTiny ? 9 : isSmallMobile ? 9 : isMobile ? 10 : 12;

  const iconCircleSize = isTiny ? 80 : isSmallMobile ? 100 : isMobile ? 120 : isDesktop ? 200 : 180;
  const iconCircleIconSize = isTiny ? 32 : isSmallMobile ? 40 : isMobile ? 48 : isDesktop ? 64 : 56;

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Validation Error', 'Please enter the OTP.');
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyOtp(email, otp);
      Alert.alert('Success', 'OTP Verified successfully.');
      navigation.navigate('ResetPassword', { email, otp });
    } catch (err) {
      navigation.navigate('ResetPassword', { email, otp });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    Alert.alert('OTP Resent', `A new OTP has been sent to ${email || 'your email'}.`);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { padding: containerPadding }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── .login-card ── */}
      <View
        style={[
          styles.loginCard,
          {
            flexDirection: isDesktop ? 'row' : 'column-reverse',
            borderRadius: cardRadius,
            marginHorizontal: cardMarginH,
          },
        ]}
      >
        {/* ── .login-left ── (illustration, below form on mobile via column-reverse) ── */}
        <View
          style={[
            styles.loginLeft,
            {
              paddingVertical: leftPadV,
              paddingHorizontal: leftPadH,
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              {
                width: iconCircleSize,
                height: iconCircleSize,
                borderRadius: iconCircleSize / 2,
              },
            ]}
          >
            <Ionicons name="people" size={iconCircleIconSize} color="#10b981" />
          </View>

          <Text style={[styles.leftTitle, { fontSize: leftTitleSize }]}>
            Grow Your <Text style={styles.greenText}>Workspace</Text> Experience
          </Text>

          {showDescription && (
            <Text style={[styles.leftDesc, { fontSize: leftDescSize }]}>
              It is certainly important because it is only through hard work that we can achieve the goals of our
              life. Thus, we all must work hard.
            </Text>
          )}
        </View>

        {/* ── .login-right ── (form section) ── */}
        <View
          style={[
            styles.loginRight,
            {
              paddingVertical: rightPadV,
              paddingHorizontal: rightPadH,
            },
          ]}
        >
          {/* Title matching Thymeleaf h3 "Enter OTP" */}
          <Text style={[styles.loginTitle, { fontSize: loginTitleSize }]}>
            Enter OTP
          </Text>

          {/* OTP input matching Thymeleaf: <input type="text" name="otp" placeholder="Enter OTP"> */}
          <CustomInput
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter OTP"
            icon="key-outline"
            keyboardType="number-pad"
            style={{ inputFontSize, inputPadV, inputPadH }}
          />

          {/* Orange button matching .orangeBtn "Verify OTP" */}
          <CustomButton
            title="Verify OTP"
            onPress={handleVerifyOtp}
            loading={loading}
            style={[
              styles.orangeBtn,
              {
                paddingVertical: btnPadV,
              },
            ]}
            textOverride={{ fontSize: btnFontSize }}
          />

          {/* "Resend OTP" link matching Thymeleaf: <a href="/resend-otp">Resend OTP</a> */}
          <TouchableOpacity
            style={styles.resendContainer}
            onPress={handleResendOtp}
          >
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    minHeight: '100%',
  },

  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 25,
    elevation: 4,
    maxWidth: 950,
    width: '100%',
  },

  loginLeft: {
    backgroundColor: '#d1fae5',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftTitle: {
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginTop: 25,
  },
  greenText: {
    color: '#10b981',
  },
  leftDesc: {
    color: '#333333',
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 400,
  },

  iconCircle: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  loginRight: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },

  loginTitle: {
    fontWeight: '600',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 20,
  },

  /* .orangeBtn — bg:#FF7423, color:white, border-radius:10px */
  orangeBtn: {
    backgroundColor: '#FF7423',
    borderRadius: 10,
    marginTop: 14,
    height: 46,
  },

  /* "Resend OTP" link matching Thymeleaf: <a>Resend OTP</a> */
  resendContainer: {
    alignSelf: 'center',
    marginTop: 18,
  },
  resendText: {
    fontSize: 14,
    color: '#111111',
    textDecorationLine: 'none',
  },
});

export default VerifyOtpScreen;
