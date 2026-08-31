import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { DEFAULT_BASE_URL } from '../../api/apiClient';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const LoginScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useContext(AuthContext);

  // These breakpoints intentionally mirror login.css.
  const isDesktop = width > 992;
  const isTablet = width <= 992 && width > 768;
  const isMobileLandscape = width <= 768 && width > 576;
  const isMobile = width <= 576 && width > 375;
  const isSmallMobile = width <= 375 && width > 320;
  const isTiny = width <= 320;

  const containerPadding = isTiny ? 0 : isSmallMobile || isMobile ? 5 : isMobileLandscape ? 10 : 15;
  const cardRadius = isTiny || isSmallMobile ? 10 : isMobile ? 12 : 15;
  const cardMargin = isSmallMobile ? 5 : 0;

  const horizontalPadding = isTiny || isSmallMobile
    ? 12
    : isMobile
      ? 15
      : isMobileLandscape
        ? 20
        : isTablet
          ? 30
          : 40;

  const verticalPadding = isTiny || isSmallMobile
    ? 20
    : isMobile
      ? 25
      : isMobileLandscape
        ? 30
        : isTablet
          ? 40
          : 50;

  const imageSize = isTiny ? 100 : isSmallMobile ? 120 : isMobile ? 140 : isMobileLandscape ? 180 : isTablet ? 280 : 250;
  const titleSize = isTiny ? 14 : isSmallMobile ? 15 : isMobile ? 17 : isMobileLandscape || isTablet ? 20 : 18;
  const descriptionSize = isTiny ? 9 : isSmallMobile ? 10 : isMobile ? 11 : isMobileLandscape ? 12 : 14;
  const loginTitleSize = isTiny ? 16 : isSmallMobile ? 18 : isMobile ? 20 : isMobileLandscape ? 22 : 20;
  const inputFontSize = isTiny ? 12 : isSmallMobile ? 13 : 14;
  const inputPadV = isTiny ? 6 : isSmallMobile ? 7 : isMobile ? 8 : 10;
  const inputPadH = isTiny ? 8 : isSmallMobile ? 10 : isMobile ? 12 : 15;
  const buttonFontSize = isTiny ? 13 : isSmallMobile ? 14 : isMobile ? 15 : 16;
  const buttonPadV = isTiny ? 9 : isSmallMobile ? 9 : isMobile ? 10 : 12;
  const forgotFontSize = isTiny ? 12 : isSmallMobile || isMobile ? 13 : 14;

  const imageUri = `${DEFAULT_BASE_URL.replace(/\/$/, '')}/images/img1.png`;

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    await login(username, password);
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
          width <= 768 && styles.mobileScrollContent,
          width <= 576 && styles.smallMobileScrollContent,
          width <= 375 && styles.tinyScrollContent,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.loginCard,
            {
              flexDirection: isDesktop ? 'row' : 'column',
              borderRadius: cardRadius,
              marginHorizontal: cardMargin,
            },
          ]}
        >
          <View
            style={[
              styles.loginLeft,
              {
                paddingVertical: verticalPadding,
                paddingHorizontal: horizontalPadding,
              },
            ]}
          >
            <Image
              source={{ uri: imageUri }}
              style={{ width: imageSize, height: imageSize }}
              resizeMode="contain"
              accessibilityLabel="Team Illustration"
            />
            <Text style={[styles.leftTitle, { fontSize: titleSize }]}> 
              Grow Your <Text style={styles.greenText}>Workspace</Text> Experience
            </Text>
            <Text style={[styles.leftDesc, { fontSize: descriptionSize }]}> 
              It is certainly important because it is only through hard work that we can achieve the goals of our life. Thus, we all must work hard.
            </Text>
          </View>

          <View
            style={[
              styles.loginRight,
              {
                paddingVertical: verticalPadding,
                paddingHorizontal: horizontalPadding,
              },
            ]}
          >
            <Text style={[styles.loginTitle, { fontSize: loginTitleSize }]}>Login</Text>

            <CustomInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter User name or Email"
              icon="mail-outline"
              autoComplete="off"
              textContentType="none"
              style={{ inputFontSize, inputPadV, inputPadH }}
            />

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

            <TouchableOpacity
              style={[styles.forgotContainer, { marginTop: isTiny ? 8 : 10 }]}
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.7}
            >
              <Text style={[styles.forgotLink, { fontSize: forgotFontSize }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <CustomButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
              style={[styles.loginBtn, { paddingVertical: buttonPadV }]}
              textStyle={{ fontSize: buttonFontSize }}
            />

            {error ? (
              <View style={styles.errorAlert}>
                <Text style={styles.errorAlertText}>{error}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileScrollContent: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  smallMobileScrollContent: {
    paddingTop: 10,
  },
  tinyScrollContent: {
    paddingTop: 5,
  },
  loginCard: {
    width: '100%',
    maxWidth: 950,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 25,
    elevation: 4,
  },
  loginLeft: {
    flex: 1,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftTitle: {
    color: '#111111',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 25,
    fontFamily: Platform.OS === 'web' ? 'Poppins' : undefined,
  },
  greenText: {
    color: '#10b981',
  },
  leftDesc: {
    color: '#333333',
    textAlign: 'center',
    maxWidth: 400,
    marginTop: 10,
    lineHeight: 20,
    fontFamily: Platform.OS === 'web' ? 'Poppins' : undefined,
  },
  loginRight: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  loginTitle: {
    color: '#111111',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: Platform.OS === 'web' ? 'Poppins' : undefined,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 0,
  },
  forgotLink: {
    color: '#111111',
    textAlign: 'right',
    fontFamily: Platform.OS === 'web' ? 'Poppins' : undefined,
  },
  loginBtn: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    marginTop: 15,
    minHeight: 46,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    borderWidth: 1,
    borderColor: '#f5c2c7',
    borderRadius: 6,
    padding: 10,
    marginTop: 12,
  },
  errorAlertText: {
    flex: 1,
    color: '#842029',
    fontSize: 13,
    fontFamily: Platform.OS === 'web' ? 'Poppins' : undefined,
  },
});

export default LoginScreen;
