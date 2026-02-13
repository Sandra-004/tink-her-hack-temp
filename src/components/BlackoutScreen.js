// Raksha — Blackout Screen
// Screen appears dead — only a dim clock visible
// Triple-tap to exit

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    StatusBar,
} from 'react-native';
import { COLORS, TYPOGRAPHY, BLACKOUT_CONFIG } from '../config/constants';

export default function BlackoutScreen({ visible, onExit, isRecording }) {
    const [currentTime, setCurrentTime] = useState(getTimeString());
    const tapCount = useRef(0);
    const tapTimer = useRef(null);

    useEffect(() => {
        if (!visible) return;
        const interval = setInterval(() => setCurrentTime(getTimeString()), 1000);
        return () => clearInterval(interval);
    }, [visible]);

    const handleTap = () => {
        tapCount.current += 1;

        if (tapCount.current >= BLACKOUT_CONFIG.EXIT_TAP_COUNT) {
            tapCount.current = 0;
            if (tapTimer.current) clearTimeout(tapTimer.current);
            if (onExit) onExit();
            return;
        }

        if (tapTimer.current) clearTimeout(tapTimer.current);
        tapTimer.current = setTimeout(() => {
            tapCount.current = 0;
        }, BLACKOUT_CONFIG.EXIT_TAP_WINDOW_MS);
    };

    if (!visible) return null;

    return (
        <TouchableWithoutFeedback onPress={handleTap}>
            <View style={styles.container}>
                <StatusBar hidden />
                <Text style={styles.clock}>{currentTime}</Text>
                {isRecording && <View style={styles.dot} />}
            </View>
        </TouchableWithoutFeedback>
    );
}

function getTimeString() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    clock: {
        fontFamily: TYPOGRAPHY.MONO,
        fontSize: 56,
        color: COLORS.WHITE,
        opacity: BLACKOUT_CONFIG.CLOCK_OPACITY,
        letterSpacing: 6,
        fontWeight: '200',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.WHITE,
        opacity: 0.06,
        marginTop: 20,
    },
});
