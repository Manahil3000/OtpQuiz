import { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, signInWithPhoneNumber, signOut } from '@react-native-firebase/auth';

export default function App() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<Awaited<
    ReturnType<typeof signInWithPhoneNumber>
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState<boolean | null>(null);

  const sendOtp = async () => {
    setLoading(true);
    setMessage('');
    setSuccess(null);
    try {
      const result = await signInWithPhoneNumber(getAuth(), phone.trim());
      setConfirmation(result);
      setMessage('OTP sent. Enter the code below.');
    } catch (e: any) {
      setSuccess(false);
      setMessage(`Failed to send OTP: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!confirmation) return;
    setLoading(true);
    try {
      await confirmation.confirm(code.trim());
      setSuccess(true);
      setMessage('✅ Phone number verified successfully!');
    } catch {
      setSuccess(false);
      setMessage('❌ Verification failed: invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    await signOut(getAuth()).catch(() => {});
    setConfirmation(null);
    setCode('');
    setPhone('');
    setMessage('');
    setSuccess(null);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Phone Verification</Text>

        {!confirmation ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="+923001234567"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <Button
              title="Send OTP"
              onPress={sendOtp}
              disabled={loading || !phone}
            />
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit OTP"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
            />
            <Button
              title="Verify OTP"
              onPress={verifyOtp}
              disabled={loading || code.length < 6}
            />
            <View style={{ height: 10 }} />
            <Button title="Start over" onPress={reset} color="gray" />
          </>
        )}

        {loading && <ActivityIndicator style={styles.loader} />}
        {!!message && (
          <Text
            style={[
              styles.msg,
              success === true && styles.ok,
              success === false && styles.err,
            ]}
          >
            {message}
          </Text>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  loader: { marginTop: 16 },
  msg: { marginTop: 20, textAlign: 'center', fontSize: 16 },
  ok: { color: 'green' },
  err: { color: 'red' },
});