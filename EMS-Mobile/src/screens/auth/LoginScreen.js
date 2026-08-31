import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const LoginScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useContext(AuthContext);

  const isDesktop = width >= 992;
  const isTablet = width >= 768 && width < 992;
  const isMobileLg = width >= 576 && width < 768;
  const isMobile = width >= 375 && width < 576;
  const isSmallMobile = width >= 320 && width < 375;
  const isTiny = width < 320;
  const containerPadding = isTiny ? 0 : isSmallMobile || isMobile ? 5 : isMobileLg ? 10 : 15;
  const cardRadius = isMobile ? 12 : isSmallMobile || isTiny ? 10 : 15;
  const cardMarginH = isSmallMobile ? 5 : 0;
  const leftPadH = isTiny || isSmallMobile ? 12 : isMobile ? 15 : isMobileLg ? 20 : isTablet ? 30 : 40;
  const leftPadV = isTiny || isSmallMobile ? 20 : isMobile ? 25 : isMobileLg ? 30 : isTablet ? 40 : 50;
  const leftTitleSize = isTiny ? 14 : isSmallMobile ? 15 : isMobile ? 17 : isMobileLg || isTablet ? 20 : 22;
  const leftDescSize = isTiny ? 9 : isSmallMobile ? 10 : isMobile ? 11 : isMobileLg ? 12 : 14;
  const showDescription = isDesktop || isTablet;
  const rightPadH = leftPadH;
  const rightPadV = leftPadV;
  const loginTitleSize = isTiny ? 16 : isSmallMobile ? 18 : isMobile ? 20 : isMobileLg ? 22 : 24;
  const inputFontSize = isTiny ? 12 : isSmallMobile ? 13 : 14;
  const inputPadV = isTiny ? 6 : isSmallMobile ? 7 : isMobile ? 8 : 10;
  const inputPadH = isTiny ? 8 : isSmallMobile ? 10 : isMobile ? 12 : 15;
  const btnFontSize = isTiny ? 13 : isSmallMobile ? 14 : isMobile ? 15 : 16;
  const btnPadV = isTiny ? 9 : isSmallMobile ? 9 : isMobile ? 10 : 12;
  const forgotFontSize = isTiny ? 12 : isSmallMobile || isMobile ? 13 : 14;
  const iconCircleSize = isTiny ? 80 : isSmallMobile ? 100 : isMobile ? 120 : isDesktop ? 200 : 180;
  const iconCircleIconSize = isTiny ? 32 : isSmallMobile ? 40 : isMobile ? 48 : isDesktop ? 64 : 56;

  useEffect(() => {
    setUsername(''); setPassword('');
    const timer = setTimeout(() => { setPassword(''); setUsername(''); }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    await login(username, password);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { padding: containerPadding }]} keyboardShouldPersistTaps="handled">
        <View style={[styles.loginCard, { flexDirection: isDesktop ? 'row' : 'column', borderRadius: cardRadius, marginHorizontal: cardMarginH }]}>
          <View style={[styles.loginLeft, { paddingVertical: leftPadV, paddingHorizontal: leftPadH }]}>
            <View style={[styles.iconCircle, { width: iconCircleSize, height: iconCircleSize, borderRadius: iconCircleSize / 2 }]}>
              <Ionicons name="people" size={iconCircleIconSize} color="#10b981" />
            </View>
            <Text style={[styles.leftTitle, { fontSize: leftTitleSize }]}>Grow Your <Text style={styles.greenText}>Workspace</Text> Experience</Text>
            {showDescription && <Text style={[styles.leftDesc, { fontSize: leftDescSize }]}>It is certainly important because it is only through hard work that we can achieve the goals of our life. Thus, we all must work hard.</Text>}
          </View>
          <View style={[styles.loginRight, { paddingVertical: rightPadV, paddingHorizontal: rightPadH }]}>
            <Text style={[styles.loginTitle, { fontSize: loginTitleSize }]}>Login</Text>
            {error ? <View style={styles.errorAlert}><Text style={styles.errorAlertText}>{error}</Text></View> : null}
            <CustomInput value={username} onChangeText={setUsername} placeholder="Enter User name or Email" icon="mail-outline" autoComplete="off" textContentType="none" style={{ inputFontSize, inputPadV, inputPadH }} />
            <CustomInput value={password} onChangeText={setPassword} placeholder="Enter Your Password" icon="lock-closed-outline" secureTextEntry autoComplete="new-password" textContentType="none" style={{ inputFontSize, inputPadV, inputPadH }} />
            <TouchableOpacity style={styles.forgotContainer} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={[styles.forgotLink, { fontSize: forgotFontSize }]}>Forgot Password?</Text>
            </TouchableOpacity>
            <CustomButton title="Login" onPress={handleLogin} loading={loading} style={[styles.loginBtn, { paddingVertical: btnPadV }]} textStyle={{ fontSize: btnFontSize }} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  loginCard: { backgroundColor: '#ffffff', borderRadius: 15, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 25, elevation: 4, maxWidth: 950, width: '100%' },
  loginLeft: { backgroundColor: '#d1fae5', flex: 1, justifyContent: 'center', alignItems: 'center' },
  leftTitle: { fontWeight: '700', color: '#111111', textAlign: 'center', marginTop: 25 },
  greenText: { color: '#10b981' },
  leftDesc: { color: '#333333', textAlign: 'center', marginTop: 10, maxWidth: 400 },
  iconCircle: { backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  loginRight: { flex: 1, backgroundColor: '#ffffff', justifyContent: 'center' },
  loginTitle: { fontWeight: '600', color: '#111111', textAlign: 'center', marginBottom: 20 },
  errorAlert: { backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8, marginBottom: 14, borderWidth: 1, borderColor: '#FECACA' },
  errorAlertText: { color: '#DC2626', fontSize: 13, textAlign: 'center' },
  forgotContainer: { alignSelf: 'flex-end', marginVertical: 10 },
  forgotLink: { color: '#111111' },
  loginBtn: { backgroundColor: '#10b981', borderRadius: 10, marginTop: 15, height: 46 },
});

export default LoginScreen;
