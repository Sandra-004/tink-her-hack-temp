// Raksha — Fake Incoming Call Screen
// Mimics a real incoming phone call

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SPACING } from '../config/constants';

export default function FakeCallScreen({ visible, callerName, onAccept, onDecline }) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        if (!visible) return;

        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        );
        pulse.start();

        Animated.spring(slideAnim, { toValue: 0, friction: 6, useNativeDriver: true }).start();

        const hapticInterval = setInterval(() => {
            if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
        }, 1500);

        return () => {
            pulse.stop();
            clearInterval(hapticInterval);
        };
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { transform: [{ translateY: slideAnim }] }]}>
                {/* Avatar */}
                <Animated.View style={[styles.avatar, { transform: [{ scale: pulseAnim }] }]}>
                    <Ionicons name="person" size={40} color={COLORS.TEXT_SECONDARY} />
                </Animated.View>

                <Text style={styles.callerName}>{callerName}</Text>
                <Text style={styles.callStatus}>Incoming call...</Text>
            </Animated.View>

            {/* Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]} onPress={onDecline} activeOpacity={0.7}>
                    <Ionicons name="close" size={28} color={COLORS.WHITE} />
                    <Text style={styles.actionLabel}>Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={onAccept} activeOpacity={0.7}>
                    <Ionicons name="call" size={28} color={COLORS.WHITE} />
                    <Text style={styles.actionLabel}>Accept</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.BG,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 80,
        zIndex: 2000,
    },
    content: {
        alignItems: 'center',
        marginTop: 80,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.SURFACE,
        borderWidth: 2,
        borderColor: COLORS.BORDER_LIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.LG,
    },
    callerName: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.TITLE + 4,
        color: COLORS.TEXT,
        fontWeight: '600',
        letterSpacing: 1,
    },
    callStatus: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.BODY,
        color: COLORS.TEXT_MUTED,
        marginTop: SPACING.SM,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 60,
        paddingBottom: 20,
    },
    actionBtn: {
        width: 68,
        height: 68,
        borderRadius: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },
    declineBtn: {
        backgroundColor: COLORS.DANGER,
    },
    acceptBtn: {
        backgroundColor: COLORS.SUCCESS,
    },
    actionLabel: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.MICRO,
        color: COLORS.WHITE,
        marginTop: 4,
    },
});
