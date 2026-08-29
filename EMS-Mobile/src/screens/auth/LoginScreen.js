import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

/**
 * Pixel-perfect mobile & responsive login matching:
 *   src/main/resources/templates/login.html
 *   src/main/resources/static/css/login.css
 *
 * Breakpoints mirror the CSS exactly:
 *   ≥992px  — side-by-side (row)
 *   <992px  — stacked (column)
 *   <768px  — slightly smaller
 *   <576px  — mobile-optimised
 *   <375px  — small-phone
 *   <320px  — ultra-small
 */

const LoginScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useContext(AuthContext);

  /* ── Responsive helpers matching login.css breakpoints ── */
  const isDesktop = width >= 992;
  const isTablet = width >= 768 && width < 992;   // @media(max-width:992px)
  const isMobileLg = width >= 576 && width < 768; // @media(max-width:768px)
  const isMobile = width >= 375 && width < 576;   // @media(max-width:576px)
  const isSmallMobile = width >= 320 && width < 375; // @media(max-width:375px)
  const isTiny = width < 320;                      // @media(max-width:320px)

  /* ── Derived sizes matching login.css at each breakpoint ── */
  // .login-container padding
  const containerPadding = isTiny ? 0 : isSmallMobile ? 5 : isMobile ? 5 : isMobileLg ? 10 : isTablet ? 15 : 15;

  // .login-card border-radius
  const cardRadius = isMobile ? 12 : isSmallMobile ? 10 : isTiny ? 10 : 15;

  // .login-card margin (375 breakpoint adds margin:0 5px)
  const cardMarginH = isSmallMobile ? 5 : 0;

  // .login-left padding
  const leftPadH = isTiny ? 12 : isSmallMobile ? 12 : isMobile ? 15 : isMobileLg ? 20 : isTablet ? 30 : 40;
  const leftPadV = isTiny ? 20 : isSmallMobile ? 20 : isMobile ? 25 : isMobileLg ? 30 : isTablet ? 40 : 50;

  // .login-left img size
  const iconSize = isTiny ? 100 : isSmallMobile ? 120 : isMobile ? 140 : isMobileLg ? 180 : isTablet ? 220 : 200;

  // .login-left h3 font-size
  const leftTitleSize = isTiny ? 14 : isSmallMobile ? 15 : isMobile ? 17 : isMobileLg ? 20 : isTablet ? 22 : 22;

  // .login-left p font-size
  const leftDescSize = isTiny ? 9 : isSmallMobile ? 10 : isMobile ? 11 : isMobileLg ? 12 : 14;

  // .login-left p — only show description on desktop/tablet
  const showDescription = isDesktop || isTablet;

  // .login-right padding
  const rightPadH = isTiny ? 12 : isSmallMobile ? 12 : isMobile ? 15 : isMobileLg ? 20 : isTablet ? 30 : 40;
  const rightPadV = isTiny ? 20 : isSmallMobile ? 20 : isMobile ? 25 : isMobileLg ? 30 : isTablet ? 40 : 50;

  // .login-right h3 font-size
  const loginTitleSize = isTiny ? 16 : isSmallMobile ? 18 : isMobile ? 20 : isMobileLg ? 22 : 24;

  // .form-control font-size & padding
  const inputFontSize = isTiny ? 12 : isSmallMobile ? 13 : isMobile ? 14 : 14;
  const inputPadV = isTiny ? 6 : isSmallMobile ? 7 : isMobile ? 8 : 10;
  const inputPadH = isTiny ? 8 : isSmallMobile ? 10 : isMobile ? 12 : 15;

  // .btn-login font-size & padding
  const btnFontSize = isTiny ? 13 : isSmallMobile ? 14 : isMobile ? 15 : 16;
  const btnPadV = isTiny ? 9 : isSmallMobile ? 9 : isMobile ? 10 : 12;

  // .forgot-link font-size
  const forgotFontSize = isTiny ? 12 : isSmallMobile ? 13 : isMobile ? 13 : 14;

  // Icon circle size inside .login-left
  const iconCircleSize = isTiny ? 80 : isSmallMobile ? 100 : isMobile ? 120 : isDesktop ? 200 : 180;
  const iconCircleIconSize = isTiny ? 32 : isSmallMobile ? 40 : isMobile ? 48 : isDesktop ? 64 : 56;

  // Force-clear password after mount — Chrome injects autofill AFTER first paint,
  // so we need to overwrite it with an empty string after a short delay.
  useEffect(() => {
    setUsername('');
    setPassword('');
    const timer = setTimeout(() => {
      setPassword('');
      setUsername('');
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { padding: containerPadding },
        ]}
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
          {/* ── .login-left ── */}
          <View
            style={[
              styles.loginLeft,
              {
                paddingVertical: leftPadV,
                paddingHorizontal: leftPadH,
              },
            ]}
          >
            {/* Icon circle (replaces img1.png) */}
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

            {/* .login-left h3 */}
            <Text style={[styles.leftTitle, { fontSize: leftTitleSize }]}>
              Grow Your <Text style={styles.greenText}>Workspace</Text> Experience
            </Text>

            {/* .login-left p — hidden on small screens */}
            {showDescription && (
              <Text style={[styles.leftDesc, { fontSize: leftDescSize }]}>
                It is certainly important because it is only through hard work that we can achieve the goals of our
                life. Thus, we all must work hard.
              </Text>
            )}
          </View>

          {/* ── .login-right ── */}
          <View
            style={[
              styles.loginRight,
              {
                paddingVertical: rightPadV,
                paddingHorizontal: rightPadH,
              },
            ]}
          >
            {/* .login-right h3 */}
            <Text style={[styles.loginTitle, { fontSize: loginTitleSize }]}>
              Login
            </Text>

            {/* Error alert matching .alert-danger */}
            {error ? (
              <View style={styles.errorAlert}>
                <Text style={styles.errorAlertText}>{error}</Text>
              </View>
            ) : null}

            {/* Username / Email input */}
            <CustomInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter User name or Email"
              icon="mail-outline"
              autoComplete="off"
              textContentType="none"
              style={{ inputFontSize, inputPadV, inputPadH }}
            />

            {/* Password input with toggle */}
            <CustomInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter Your Password"
              icon="lock-closed-outline"
              secureTextEntry
              autoComplete="new-password"
              textContentType="none"
              style={{ inputFontSize, inputPadV, inputPadH }}
            />

            {/* .forgot-link */}
            <TouchableOpacity
              style={styles.forgotContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={[styles.forgotLink, { fontSize: forgotFontSize }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* .btn-login */}
            <CustomButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
              style={[
                styles.loginBtn,
                {
                  paddingVertical: btnPadV,
                },
              ]}
              textOverride={{ fontSize: btnFontSize }}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  /* .login-container — min-height:100vh, flex center */
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  /* .login-container padding + flex centering */
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* .login-card — max-width:950px, border-radius:15px, overflow:hidden */
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

  /* .login-left — flex:1 1 50%, bg:#d1fae5 */
  loginLeft: {
    backgroundColor: '#d1fae5',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* .login-left h3 — font-weight:700, color:#111, margin-top:25px */
  leftTitle: {
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginTop: 25,
  },
  /* .login-left span — color:#10b981 */
  greenText: {
    color: '#10b981',
  },
  /* .login-left p — font-size:14px, text-align:center, max-width:400px, margin-top:10px */
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

  /* .login-right — flex:1 1 50%, bg:#ffffff */
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

  /* Error alert matching .alert-danger */
  errorAlert: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorAlertText: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
  },

  /* .forgot-link — text-align:right, font-size:14px, color:#111 */
  forgotContainer: {
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  forgotLink: {
    color: '#111111',
  },

  /* .btn-login — bg:#10b981, border-radius:10px, font-weight:600 */
  loginBtn: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    marginTop: 15,
    height: 46,
  },
});

export default LoginScreen;
