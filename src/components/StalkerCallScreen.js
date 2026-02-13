// Raksha — Stalker Call Screen (Active Call)
// Plays deterrent audio with call timer

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../config/constants';
import { FAKE_CALL_CONFIG } from '../config/constants';

export default function StalkerCallScreen({ visible, onEndCall }) {
    const [callDuration, setCallDuration] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!visible) { setCallDuration(0); return; }
        timerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [visible]);

    if (!visible) return null;

    const m = Math.floor(callDuration / 60).toString().padStart(2, '0');
    const s = (callDuration % 60).toString().padStart(2, '0');

    return (
        <View style={styles.container}>
            <View style={styles.infoSection}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={32} color={COLORS.TEXT_SECONDARY} />
                </View>
                <Text style={styles.callerName}>{FAKE_CALL_CONFIG.CALLER_NAME_STALKER}</Text>
                <Text style={styles.timer}>{m}:{s}</Text>
            </View>

            <View style={styles.indicator}>
                <View style={styles.indicatorDot} />
                <Text style={styles.indicatorText}>Call in progress</Text>
            </View>

            <TouchableOpacity style={styles.endCall} onPress={onEndCall} activeOpacity={0.7}>
                <Ionicons name="call" size={28} color={COLORS.WHITE} style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
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
    infoSection: {
        alignItems: 'center',
        marginTop: 60,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.SURFACE,
        borderWidth: 1,
        borderColor: COLORS.BORDER_LIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.MD,
    },
    callerName: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.TITLE,
        color: COLORS.TEXT,
        fontWeight: '500',
        letterSpacing: 1,
    },
    timer: {
        fontFamily: TYPOGRAPHY.MONO,
        fontSize: TYPOGRAPHY.HEADING,
        color: COLORS.TEXT_SECONDARY,
        marginTop: SPACING.SM,
        letterSpacing: 2,
    },
    indicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    indicatorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.SUCCESS,
    },
    indicatorText: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.CAPTION,
        color: COLORS.TEXT_MUTED,
        letterSpacing: 1,
    },
    endCall: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: COLORS.DANGER,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
});
