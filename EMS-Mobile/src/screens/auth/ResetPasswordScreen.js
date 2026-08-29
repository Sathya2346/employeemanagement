import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton';
import { authApi } from '../../api/authApi';

/**
 * Pixel-perfect mobile matching:
 *   src/main/resources/templates/reset-password.html
 *   src/main/resources/static/css/login.css
 *
 * Thymeleaf structure:
 *   Left Section: img1.png illustration + "Grow Your Workspace Experience" + description
 *   Right Section: "Reset Password" title + password input (with eye toggle) + green "Reset Password" button + alerts
 *
 * Key details:
 *   - Password field has input-group with lock icon + eye toggle (matching login.html pattern)
 *   - Button uses btn-success (#198754 green)
 *   - Hidden email field (passed via route params)
 */

const ResetPasswordScreen = ({ route, navigation }) => {
  const { width } = useWindowDimensions();
  const { email } = route.params || { email: '' };
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleResetPassword = async () => {
    if (!password.trim() || password.length < 6) return;
    setLoading(true);
    try {
      await authApi.resetPassword(email, password);
      navigation.navigate('Login');
    } catch (err) {
      navigation.navigate('Login');
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
            flexDirection: isDesktop ? 'row' : 'column',
            borderRadius: cardRadius,
            marginHorizontal: cardMarginH,
          },
        ]}
      >
        {/* ── .login-left ── (illustration, first on desktop, first on mobile column) ── */}
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
          {/* Title matching Thymeleaf h3 "Reset Password" */}
          <Text style={[styles.loginTitle, { fontSize: loginTitleSize }]}>
            Reset Password
          </Text>

          {/* Password input-group matching Thymeleaf:
              <span class="input-group-text"><i class="bi bi-lock"></i></span>
              <input type="password" name="password" placeholder="New Password">
              <button class="btn btn-outline-secondary" id="togglePassword"><i class="bi bi-eye-slash"></i></button>
          */}
          <View style={styles.inputGroup}>
            <View style={styles.inputGroupText}>
              <Ionicons name="lock-closed-outline" size={18} color="#10b981" />
            </View>
            <TextInput
              style={[styles.formControl, { fontSize: inputFontSize, paddingVertical: inputPadV, paddingHorizontal: inputPadH }]}
              value={password}
              onChangeText={setPassword}
              placeholder="New Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#10b981" />
            </TouchableOpacity>
          </View>

          {/* Green button matching .btn-success "Reset Password" */}
          <CustomButton
            title="Reset Password"
            onPress={handleResetPassword}
            loading={loading}
            style={[
              styles.successBtn,
              {
                paddingVertical: btnPadV,
              },
            ]}
            textOverride={{ fontSize: btnFontSize }}
          />
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

  /* Input group matching Thymeleaf .input-group */
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  /* .input-group-text — bg:transparent, border:1px solid #10b981, color:#10b981 */
  inputGroupText: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRightWidth: 0,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* .form-control — border-radius:10px, border:1px solid #10b981 */
  formControl: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#10b981',
    color: '#111111',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  /* Toggle password button matching #togglePassword */
  toggleBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#10b981',
    borderLeftWidth: 0,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* .btn-success — green button */
  successBtn: {
    backgroundColor: '#198754',
    borderRadius: 10,
    marginTop: 14,
    height: 46,
  },
});

export default ResetPasswordScreen;
