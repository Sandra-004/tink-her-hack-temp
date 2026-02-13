// Raksha — Splash Screen
// 1-second branded loading with fade transition

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../config/constants';

export default function SplashScreen({ onFinish }) {
    const opacity = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 600,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();

        // Fade out after 1 second
        const timer = setTimeout(() => {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start(() => {
                if (onFinish) onFinish();
            });
        }, 1200);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity }]}>
            <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.iconWrap}>
                    <Ionicons name="shield-checkmark" size={48} color={COLORS.ACCENT} />
                </View>
                <Animated.Text style={[styles.title, { opacity: textOpacity }]}>
                    RAKSHA
                </Animated.Text>
                <Animated.Text style={[styles.subtitle, { opacity: textOpacity }]}>
                    Your silent guardian
                </Animated.Text>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.BG,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
    },
    content: {
        alignItems: 'center',
    },
    iconWrap: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: COLORS.ACCENT_DIM,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.DISPLAY,
        color: COLORS.TEXT,
        fontWeight: '600',
        letterSpacing: 8,
    },
    subtitle: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.CAPTION,
        color: COLORS.TEXT_MUTED,
        marginTop: 8,
        letterSpacing: 2,
    },
});
