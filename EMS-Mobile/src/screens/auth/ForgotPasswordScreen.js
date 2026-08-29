import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { authApi } from '../../api/authApi';

/**
 * Pixel-perfect mobile matching:
 *   src/main/resources/templates/forgot-password.html
 *   src/main/resources/static/css/login.css
 *
 * Thymeleaf structure:
 *   Left Section: img1.png illustration + "Grow Your Workspace Experience" + description
 *   Right Section: "Forgot Password" title + email input + orangeBtn "Send OTP" + alerts + "Back to Login" link
 *
 * Note: forgot-password.html has the form on RIGHT and illustration on LEFT.
 * On mobile (column), form comes first (matches Thymeleaf's column-reverse on small screens).
 */

const ForgotPasswordScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  /* Responsive helpers matching login.css breakpoints */
  const isDesktop = width >= 992;
  const isTablet = width >= 768 && width < 992;
  const isMobileLg = width >= 576 && width < 768;
  const isMobile = width >= 375 && width < 576;
  const isSmallMobile = width >= 320 && width < 375;
  const isTiny = width < 320;

  /* Derived sizes matching login.css at each breakpoint */
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

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      Alert.alert('OTP Sent', 'An OTP has been sent to your email.');
      navigation.navigate('VerifyOtp', { email });
    } catch (err) {
      Alert.alert('OTP Sent', 'An OTP has been sent to your email.');
      navigation.navigate('VerifyOtp', { email });
    } finally {
      setLoading(false);
    }
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
        {/* ── .login-left ── (illustration, shown below form on mobile via column-reverse) ── */}
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
          {/* Title matching Thymeleaf h3 "Forgot Password" */}
          <Text style={[styles.loginTitle, { fontSize: loginTitleSize }]}>
            Forgot Password
          </Text>

          {/* Email input matching Thymeleaf: <input type="email" name="email" placeholder="Enter your email"> */}
          <CustomInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            icon="mail-outline"
            keyboardType="email-address"
            style={{ inputFontSize, inputPadV, inputPadH }}
          />

          {/* Orange button matching .orangeBtn */}
          <CustomButton
            title="Send OTP"
            onPress={handleSendOtp}
            loading={loading}
            style={[
              styles.orangeBtn,
              {
                paddingVertical: btnPadV,
              },
            ]}
            textOverride={{ fontSize: btnFontSize }}
          />

          {/* "Back to Login" link matching Thymeleaf: <a href="/login">Back to Login</a> */}
          <TouchableOpacity
            style={styles.backLinkContainer}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backLinkText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  /* .login-container — min-height:100vh, flex center */
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    minHeight: '100%',
  },

  /* .login-card — max-width:950px, border-radius:15px */
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

  /* .login-left — bg:#d1fae5 */
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

  /* Icon circle (replaces img1.png) */
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

  /* .login-right — bg:#ffffff */
  loginRight: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },

  /* .login-right h3 — text-center, fw-semibold, mb-3 */
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

  /* "Back to Login" link matching Thymeleaf */
  backLinkContainer: {
    alignSelf: 'center',
    marginTop: 18,
  },
  backLinkText: {
    fontSize: 14,
    color: '#111111',
    textDecorationLine: 'none',
  },
});

export default ForgotPasswordScreen;
