// Raksha — The Intelligent Guardian
// Main Application

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

// Components
import SplashScreen from './src/components/SplashScreen';
import MenuGrid from './src/components/MenuGrid';
import SOSSlider from './src/components/SOSSlider';
import SOSButton from './src/components/SOSButton';
import BlackoutScreen from './src/components/BlackoutScreen';
import FallDetectionAlert from './src/components/FallDetectionAlert';
import CustomModal from './src/components/CustomModal';
import FakeCallPopup from './src/components/FakeCallPopup';
import FakeCallScreen from './src/components/FakeCallScreen';
import StalkerCallScreen from './src/components/StalkerCallScreen';
import CabCallScreen from './src/components/CabCallScreen';
import HistoryScreen from './src/components/HistoryScreen';

// Config & Utils
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, FEATURE_FLAGS, FAKE_CALL_CONFIG, SENSOR_THRESHOLDS } from './src/config/constants';
import { calculateAccelerationMagnitude, FallDetector } from './src/utils/sensorUtils';
import { requestLocationPermission, sendEmergencyAlert, sendSilentSOS } from './src/utils/locationUtils';
import {
  requestAudioPermission,
  startEvidenceRecording,
  stopEvidenceRecording,
  playAudioFile,
  stopAudioPlayback,
  startScreamDetection,
  stopScreamDetection,
  cleanupAudio,
} from './src/utils/audioUtils';

// ─── Audio Assets ───
let ringtoneAsset = null;
let deterrentAsset = null;
let cabAudioAsset = null;
let cabDialogueData = null;

try { ringtoneAsset = require('./src/assets/audio/ringtone.mp3'); } catch (e) { }
try { deterrentAsset = require('./src/assets/audio/stalker_call.mp3'); } catch (e) { }
try { cabAudioAsset = require('./src/assets/audio/cab.mp3'); } catch (e) { }
try { cabDialogueData = require('./src/assets/audio/cab.json'); } catch (e) { }

const DEFAULT_CAB_DIALOGUE = [
  { dialogue: 'Hello, your cab is arriving in 2 minutes', gapMs: 4000 },
  { dialogue: 'Can you confirm your pickup location?', gapMs: 5000 },
  { dialogue: 'I am near the main gate, are you there?', gapMs: 4000 },
  { dialogue: 'Okay, I can see you. Coming now.', gapMs: 3000 },
];

export default function App() {
  // ─── SPLASH ─────────────────────────────────────────────
  const [showSplash, setShowSplash] = useState(true);
  const mainOpacity = useRef(new Animated.Value(0)).current;

  // ─── CORE STATE ─────────────────────────────────────────
  const [isGuardActive, setIsGuardActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isBlackout, setIsBlackout] = useState(false);

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [sosMode, setSosMode] = useState('slider'); // 'slider' | 'button'

  // Alert
  const [alertActive, setAlertActive] = useState(false);
  const [alertType, setAlertType] = useState('fall');
  const [alertCountdown, setAlertCountdown] = useState(10);

  // Fake call
  const [showFakeCallPopup, setShowFakeCallPopup] = useState(false);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [showStalkerCall, setShowStalkerCall] = useState(false);
  const [showCabCall, setShowCabCall] = useState(false);
  const [fakeCallType, setFakeCallType] = useState(null);

  // History
  const [showHistory, setShowHistory] = useState(false);

  // Modal
  const [modalConfig, setModalConfig] = useState({
    visible: false, title: '', message: '', buttons: [],
  });

  // ─── REFS ───────────────────────────────────────────────
  const fallDetector = useRef(new FallDetector());
  const accelSub = useRef(null);
  const countdownRef = useRef(null);
  const recordingRef = useRef(null);
  const isGuardRef = useRef(false);
  const isRecordingRef = useRef(false);

  useEffect(() => { isGuardRef.current = isGuardActive; }, [isGuardActive]);
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

  // ─── INIT ───────────────────────────────────────────────
  useEffect(() => {
    initializeApp();
    return () => cleanup();
  }, []);

  const initializeApp = async () => {
    const [loc, audio] = await Promise.all([
      requestLocationPermission(),
      requestAudioPermission(),
    ]);
    if (!loc || !audio) {
      showModal('Permissions Required',
        'Raksha needs Location and Microphone permissions to function properly.',
        [{ text: 'OK', onPress: hideModal }]
      );
    }
  };

  const cleanup = async () => {
    stopSensorMonitoring();
    await cleanupAudio();
  };

  // ─── SPLASH DONE ────────────────────────────────────────
  const onSplashFinish = () => {
    setShowSplash(false);
    Animated.timing(mainOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // ─── MODAL ──────────────────────────────────────────────
  const showModal = (title, message, buttons) => {
    setModalConfig({ visible: true, title, message, buttons });
  };
  const hideModal = () => {
    setModalConfig({ visible: false, title: '', message: '', buttons: [] });
  };

  // ─── SENSOR MONITORING ──────────────────────────────────
  const startSensorMonitoring = () => {
    try {
      const sub = Accelerometer.addListener(handleAccelData);
      Accelerometer.setUpdateInterval(20);
      accelSub.current = sub;
    } catch (e) {
      console.log('[Sensor] Not available:', e);
    }
  };

  const stopSensorMonitoring = () => {
    if (accelSub.current) {
      accelSub.current.remove();
      accelSub.current = null;
    }
    fallDetector.current.reset();
  };

  const handleAccelData = (data) => {
    const mag = calculateAccelerationMagnitude(data.x, data.y, data.z);
    if (FEATURE_FLAGS.ENABLE_FALL_DETECTION) {
      const result = fallDetector.current.processAcceleration(mag, Date.now());
      if (result.fallDetected) triggerAlert('fall');
    }
  };

  // ─── GUARD MODE ─────────────────────────────────────────
  const handleToggleGuard = async () => {
    const newState = !isGuardActive;
    setIsGuardActive(newState);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(newState ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light);
    }

    if (newState) {
      startSensorMonitoring();
      if (FEATURE_FLAGS.ENABLE_SCREAM_DETECTION && !isRecordingRef.current) {
        setTimeout(() => {
          startScreamDetection(() => triggerAlert('scream'));
        }, 200);
      }
      showModal('Guard Mode Armed',
        'Fall detection and scream detection are now active.',
        [{ text: 'OK', onPress: hideModal }]
      );
    } else {
      stopSensorMonitoring();
      await stopScreamDetection();
    }
  };

  // ─── ALERT (FALL / SCREAM) ──────────────────────────────
  const triggerAlert = (type) => {
    if (alertActive) return;
    console.log(`[Alert] ${type.toUpperCase()} detected`);

    setAlertType(type);
    setAlertActive(true);
    setAlertCountdown(SENSOR_THRESHOLDS.COUNTDOWN_DURATION);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    let secondsLeft = SENSOR_THRESHOLDS.COUNTDOWN_DURATION;
    countdownRef.current = setInterval(() => {
      secondsLeft -= 1;
      setAlertCountdown(secondsLeft);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      if (secondsLeft <= 0) {
        clearInterval(countdownRef.current);
        handleAutoSOS();
      }
    }, 1000);
  };

  const cancelAlert = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setAlertActive(false);
    setAlertCountdown(SENSOR_THRESHOLDS.COUNTDOWN_DURATION);
    fallDetector.current.reset();
  };

  const handleAutoSOS = async () => {
    setAlertActive(false);
    await handleSilentSOS();
  };

  // ─── SOS ────────────────────────────────────────────────
  const handleSOSActivated = async () => {
    console.log('[SOS] Activated');
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    if (FEATURE_FLAGS.ENABLE_AUDIO_RECORDING && !isRecording) {
      await handleStartRecording();
    }
    if (!isGuardActive) {
      setIsGuardActive(true);
      startSensorMonitoring();
    }
    await sendEmergencyAlert();
    if (FEATURE_FLAGS.ENABLE_BLACKOUT_MODE) setIsBlackout(true);
  };

  const handleSilentSOS = async () => {
    if (FEATURE_FLAGS.ENABLE_AUDIO_RECORDING && !isRecording) {
      await handleStartRecording();
    }
    if (!isGuardActive) {
      setIsGuardActive(true);
      startSensorMonitoring();
    }
    await sendSilentSOS();
    if (FEATURE_FLAGS.ENABLE_BLACKOUT_MODE) setIsBlackout(true);
  };

  const exitBlackout = () => setIsBlackout(false);

  // ─── RECORDING ──────────────────────────────────────────
  const handleStartRecording = async () => {
    const recording = await startEvidenceRecording();
    if (recording) {
      recordingRef.current = recording;
      setIsRecording(true);
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      await handleStopRecording();
    } else {
      await handleStartRecording();
      showModal('Recording Started', 'Audio evidence is now being recorded.', [
        { text: 'OK', onPress: hideModal },
      ]);
    }
  };

  const handleStopRecording = async () => {
    if (recordingRef.current) {
      const evidence = await stopEvidenceRecording();
      setIsRecording(false);
      recordingRef.current = null;

      if (isGuardRef.current && FEATURE_FLAGS.ENABLE_SCREAM_DETECTION) {
        setTimeout(() => {
          if (isGuardRef.current && !isRecordingRef.current) {
            startScreamDetection(() => triggerAlert('scream'))
              .catch(e => console.log('[Audio] Scream restart failed:', e));
          }
        }, 500);
      }

      if (evidence) {
        showModal('Evidence Saved', `${evidence.filename}`, [
          { text: 'OK', onPress: hideModal },
        ]);
      }
    }
  };

  // ─── FAKE CALL ──────────────────────────────────────────
  const handleFakeCallPress = () => setShowFakeCallPopup(true);

  const handleSelectStalking = () => {
    setShowFakeCallPopup(false);
    setFakeCallType(FAKE_CALL_CONFIG.CALL_TYPES.STALKING);
    setTimeout(() => {
      setShowIncomingCall(true);
      if (ringtoneAsset) playAudioFile(ringtoneAsset, { loop: true });
    }, 500);
  };

  const handleSelectCab = () => {
    setShowFakeCallPopup(false);
    setFakeCallType(FAKE_CALL_CONFIG.CALL_TYPES.CAB);
    setTimeout(() => {
      setShowIncomingCall(true);
      if (ringtoneAsset) playAudioFile(ringtoneAsset, { loop: true });
    }, 500);
  };

  const handleAcceptCall = async () => {
    setShowIncomingCall(false);
    await stopAudioPlayback();

    // Small delay to let audio system settle
    await new Promise(resolve => setTimeout(resolve, 200));

    if (fakeCallType === FAKE_CALL_CONFIG.CALL_TYPES.STALKING) {
      setShowStalkerCall(true);
      if (deterrentAsset) {
        console.log('[Audio] Playing stalker deterrent audio');
        playAudioFile(deterrentAsset);
      } else {
        console.log('[Audio] No stalker audio file found');
      }
    } else {
      setShowCabCall(true);
      if (cabAudioAsset) {
        console.log('[Audio] Playing cab audio');
        playAudioFile(cabAudioAsset);
      }
    }
  };

  const handleDeclineCall = async () => {
    setShowIncomingCall(false);
    await stopAudioPlayback();
    setFakeCallType(null);
  };

  const handleEndCall = async () => {
    setShowStalkerCall(false);
    setShowCabCall(false);
    await stopAudioPlayback();
    setFakeCallType(null);
  };

  // ─── RENDER ─────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.BG} />

      {showSplash && <SplashScreen onFinish={onSplashFinish} />}

      <Animated.View style={[styles.mainWrap, { opacity: mainOpacity }]}>
        <SafeAreaView style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              {/* Settings button (left) */}
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => setShowSettings(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="settings-outline" size={22} color={COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>

              {/* Brand (center) */}
              <View style={styles.brandRow}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.ACCENT} />
                <Text style={styles.appTitle}>RAKSHA</Text>
              </View>

              {/* History button (right) */}
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => setShowHistory(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={22} color={COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Menu */}
          <MenuGrid
            isRecording={isRecording}
            isGuardActive={isGuardActive}
            onToggleRecording={handleToggleRecording}
            onToggleGuard={handleToggleGuard}
            onFakeCall={handleFakeCallPress}
          />

          {/* Status */}
          <View style={styles.statusArea}>
            {isRecording && (
              <View style={styles.statusBadge}>
                <View style={styles.recDot} />
                <Text style={styles.recText}>Recording</Text>
              </View>
            )}
          </View>

          {/* SOS — Slider or Button */}
          {sosMode === 'slider' ? (
            <SOSSlider onActivate={handleSOSActivated} />
          ) : (
            <SOSButton onActivate={handleSOSActivated} />
          )}

        </SafeAreaView>
      </Animated.View>

      {/* ── Settings Modal ── */}
      <Modal visible={showSettings} transparent animationType="fade" onRequestClose={() => setShowSettings(false)}>
        <TouchableOpacity
          style={styles.settingsOverlay}
          activeOpacity={1}
          onPress={() => setShowSettings(false)}
        >
          <View style={styles.settingsCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.settingsTitle}>Settings</Text>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsLabel}>SOS Activation</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, sosMode === 'slider' && styles.toggleBtnActive]}
                  onPress={() => setSosMode('slider')}
                >
                  <Ionicons name="arrow-forward" size={16} color={sosMode === 'slider' ? COLORS.TEXT : COLORS.TEXT_MUTED} />
                  <Text style={[styles.toggleText, sosMode === 'slider' && styles.toggleTextActive]}>Slider</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleBtn, sosMode === 'button' && styles.toggleBtnActive]}
                  onPress={() => setSosMode('button')}
                >
                  <Ionicons name="alert-circle" size={16} color={sosMode === 'button' ? COLORS.TEXT : COLORS.TEXT_MUTED} />
                  <Text style={[styles.toggleText, sosMode === 'button' && styles.toggleTextActive]}>Button</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.settingsClose} onPress={() => setShowSettings(false)}>
              <Text style={styles.settingsCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Overlays ── */}
      <FallDetectionAlert
        isVisible={alertActive}
        countdown={alertCountdown}
        alertType={alertType}
        onCancel={cancelAlert}
      />

      <BlackoutScreen
        visible={isBlackout}
        onExit={exitBlackout}
        isRecording={isRecording}
      />

      <FakeCallPopup
        visible={showFakeCallPopup}
        onSelectStalking={handleSelectStalking}
        onSelectCab={handleSelectCab}
        onClose={() => setShowFakeCallPopup(false)}
      />

      <FakeCallScreen
        visible={showIncomingCall}
        callerName={
          fakeCallType === FAKE_CALL_CONFIG.CALL_TYPES.STALKING
            ? FAKE_CALL_CONFIG.CALLER_NAME_STALKER
            : FAKE_CALL_CONFIG.CALLER_NAME_CAB
        }
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
      />

      <StalkerCallScreen visible={showStalkerCall} onEndCall={handleEndCall} />

      <CabCallScreen
        visible={showCabCall}
        dialogueData={cabDialogueData || DEFAULT_CAB_DIALOGUE}
        onEndCall={handleEndCall}
      />

      <HistoryScreen
        visible={showHistory}
        onClose={() => setShowHistory(false)}
      />

      <CustomModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        buttons={modalConfig.buttons}
        onClose={hideModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  mainWrap: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.LG,
    paddingHorizontal: SPACING.LG,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBtn: {
    padding: SPACING.SM,
    width: 40,
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  appTitle: {
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
    fontSize: TYPOGRAPHY.TITLE,
    color: COLORS.TEXT,
    fontWeight: '600',
    letterSpacing: 4,
  },
  statusArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.DANGER_DIM,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: 20,
    gap: SPACING.SM,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.DANGER,
  },
  recText: {
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
    fontSize: TYPOGRAPHY.CAPTION,
    color: COLORS.DANGER,
    letterSpacing: 1,
  },
  // Settings Modal
  settingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsCard: {
    width: '80%',
    backgroundColor: COLORS.SURFACE,
    borderRadius: RADIUS.LG,
    padding: SPACING.XL,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  settingsTitle: {
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
    fontSize: TYPOGRAPHY.HEADING,
    color: COLORS.TEXT,
    fontWeight: '600',
    marginBottom: SPACING.XL,
  },
  settingsSection: {
    marginBottom: SPACING.XL,
  },
  settingsLabel: {
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
    fontSize: TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.MD,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.SM,
    paddingVertical: SPACING.MD,
    borderRadius: RADIUS.MD,
    backgroundColor: COLORS.ELEVATED,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.ACCENT_DIM,
    borderColor: COLORS.ACCENT,
  },
  toggleText: {
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
    fontSize: TYPOGRAPHY.BODY,
    color: COLORS.TEXT_MUTED,
  },
  toggleTextActive: {
    color: COLORS.TEXT,
  },
  settingsClose: {
    alignItems: 'center',
    paddingVertical: SPACING.MD,
    borderRadius: RADIUS.MD,
    backgroundColor: COLORS.ACCENT,
  },
  settingsCloseText: {
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
    fontSize: TYPOGRAPHY.BODY,
    color: COLORS.TEXT,
    fontWeight: '600',
  },
});