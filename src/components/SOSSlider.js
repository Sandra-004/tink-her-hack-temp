// Raksha — SOS Slider
// Smooth slide-to-activate with spring animation, auto-resets

import React, { useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    PanResponder,
    Animated,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../config/constants';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SLIDER_PADDING = SPACING.MD;
const TRACK_WIDTH = SCREEN_WIDTH - SLIDER_PADDING * 2;
const KNOB_SIZE = 52;
const MAX_SLIDE = TRACK_WIDTH - KNOB_SIZE - 6;

export default function SOSSlider({ onActivate, disabled = false }) {
    const translateX = useRef(new Animated.Value(0)).current;
    const isSliding = useRef(false);

    const resetSlider = useCallback(() => {
        Animated.spring(translateX, {
            toValue: 0,
            friction: 6,
            useNativeDriver: true,
        }).start(() => {
            isSliding.current = false;
        });
    }, [translateX]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !disabled && !isSliding.current,
            onMoveShouldSetPanResponder: () => !disabled && !isSliding.current,
            onPanResponderGrant: () => { isSliding.current = true; },
            onPanResponderMove: (_, gs) => {
                translateX.setValue(Math.max(0, Math.min(gs.dx, MAX_SLIDE)));
            },
            onPanResponderRelease: (_, gs) => {
                if (gs.dx >= MAX_SLIDE * 0.85) {
                    Animated.spring(translateX, {
                        toValue: MAX_SLIDE,
                        useNativeDriver: true,
                    }).start(() => {
                        if (onActivate) onActivate();
                        setTimeout(resetSlider, 600);
                    });
                } else {
                    resetSlider();
                }
            },
        })
    ).current;

    // Fade the label as user slides
    const labelOpacity = translateX.interpolate({
        inputRange: [0, MAX_SLIDE * 0.4, MAX_SLIDE],
        outputRange: [1, 0.3, 0],
    });

    return (
        <View style={styles.wrapper}>
            <View style={[styles.track, disabled && styles.trackDisabled]}>
                {/* Label */}
                <Animated.Text style={[styles.label, { opacity: labelOpacity }]}>
                    Slide to SOS
                </Animated.Text>

                {/* Knob */}
                <Animated.View
                    style={[styles.knob, { transform: [{ translateX }] }]}
                    {...panResponder.panHandlers}
                >
                    <Ionicons name="arrow-forward" size={20} color={COLORS.TEXT} />
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: SLIDER_PADDING,
        paddingBottom: 30,
        paddingTop: 10,
    },
    track: {
        height: KNOB_SIZE + 6,
        borderRadius: (KNOB_SIZE + 6) / 2,
        justifyContent: 'center',
        paddingHorizontal: 3,
        backgroundColor: COLORS.SURFACE,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        overflow: 'hidden',
    },
    trackDisabled: {
        opacity: 0.3,
    },
    label: {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.CAPTION,
        color: COLORS.TEXT_MUTED,
        letterSpacing: 2,
    },
    knob: {
        width: KNOB_SIZE,
        height: KNOB_SIZE,
        borderRadius: KNOB_SIZE / 2,
        backgroundColor: COLORS.DANGER,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
