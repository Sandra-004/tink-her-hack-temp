// Raksha — Fall/Scream Detection Alert
// Full-screen overlay with countdown and swipe-to-dismiss

import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    PanResponder,
    Animated,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../config/constants';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DISMISS_THRESHOLD = SCREEN_WIDTH * 0.4;

export default function FallDetectionAlert({ isVisible, countdown, alertType = 'fall', onCancel }) {
    const swipeX = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gs) => {
                swipeX.setValue(Math.max(0, gs.dx));
            },
            onPanResponderRelease: (_, gs) => {
                if (gs.dx >= DISMISS_THRESHOLD) {
                    Animated.timing(swipeX, {
                        toValue: SCREEN_WIDTH,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => {
                        swipeX.setValue(0);
                        if (onCancel) onCancel();
                    });
                } else {
                    Animated.spring(swipeX, {
                        toValue: 0,
                        friction: 5,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    if (!isVisible) return null;

    const isFall = alertType === 'fall';
    const title = isFall ? 'Fall Detected' : 'Scream Detected';
    const icon = isFall ? 'fitness' : 'volume-high';

    const labelOpacity = swipeX.interpolate({
        inputRange: [0, DISMISS_THRESHOLD],
        outputRange: [1, 0.2],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.overlay}>
            {/* Icon + Title */}
            <View style={styles.header}>
                <View style={styles.iconCircle}>
                    <Ionicons name={icon} size={36} color={COLORS.DANGER} />
                </View>
                <Text style={styles.title}>{title}</Text>
            </View>

            {/* Countdown */}
            <View style={styles.countdownWrap}>
                <Text style={styles.countdown}>{countdown}</Text>
                <Text style={styles.countdownLabel}>seconds</Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>
                Auto SOS will trigger if you don't respond
            </Text>

            {/* Swipe to dismiss */}
            <View style={styles.swipeTrack}>
                <Animated.Text style={[styles.swipeLabel, { opacity: labelOpacity }]}>
                    Swipe to cancel
                </Animated.Text>
                <Animated.View
                    style={[styles.swipeKnob, { transform: [{ translateX: swipeX }] }]}
                    {...panResponder.panHandlers}
                >
                    <Ionicons name="checkmark" size={20} color={COLORS.TEXT} />
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.BG,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: SPACING.XL,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.XL,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.DANGER_DIM,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.MD,
    },
    title: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.TITLE,
        color: COLORS.TEXT,
        fontWeight: '600',
        letterSpacing: 1,
    },
    countdownWrap: {
        alignItems: 'center',
        marginBottom: SPACING.XL,
    },
    countdown: {
        fontFamily: TYPOGRAPHY.MONO,
        fontSize: 100,
        color: COLORS.TEXT,
        fontWeight: '200',
        lineHeight: 110,
    },
    countdownLabel: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.CAPTION,
        color: COLORS.TEXT_MUTED,
        letterSpacing: 2,
    },
    description: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.CAPTION,
        color: COLORS.TEXT_SECONDARY,
        textAlign: 'center',
        marginBottom: SPACING.XXL,
    },
    swipeTrack: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.SURFACE,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        justifyContent: 'center',
        paddingHorizontal: 3,
        overflow: 'hidden',
    },
    swipeLabel: {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.CAPTION,
        color: COLORS.TEXT_MUTED,
        letterSpacing: 1,
    },
    swipeKnob: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.SUCCESS,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
