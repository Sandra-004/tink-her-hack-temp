// Raksha — Menu Grid
// 2x2 card-based layout with icons

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../config/constants';

export default function MenuGrid({
    isRecording,
    isGuardActive,
    onToggleRecording,
    onToggleGuard,
    onFakeCall,
}) {
    return (
        <View style={styles.grid}>
            {/* Record */}
            <TouchableOpacity
                style={[styles.card, isRecording && styles.cardActive]}
                onPress={onToggleRecording}
                activeOpacity={0.7}
            >
                <View style={[styles.iconWrap, isRecording && styles.iconWrapActive]}>
                    <Ionicons
                        name={isRecording ? 'stop-circle' : 'mic'}
                        size={24}
                        color={isRecording ? COLORS.DANGER : COLORS.TEXT_SECONDARY}
                    />
                </View>
                <Text style={styles.cardLabel}>
                    {isRecording ? 'Stop Rec' : 'Record'}
                </Text>
                <Text style={[styles.cardStatus, isRecording && styles.statusActive]}>
                    {isRecording ? 'ACTIVE' : 'OFF'}
                </Text>
            </TouchableOpacity>

            {/* Guard */}
            <TouchableOpacity
                style={[styles.card, isGuardActive && styles.cardActive]}
                onPress={onToggleGuard}
                activeOpacity={0.7}
            >
                <View style={[styles.iconWrap, isGuardActive && styles.iconWrapActive]}>
                    <Ionicons
                        name={isGuardActive ? 'shield-checkmark' : 'shield-outline'}
                        size={24}
                        color={isGuardActive ? COLORS.ACCENT : COLORS.TEXT_SECONDARY}
                    />
                </View>
                <Text style={styles.cardLabel}>Guard</Text>
                <Text style={[styles.cardStatus, isGuardActive && styles.statusAccent]}>
                    {isGuardActive ? 'ARMED' : 'OFF'}
                </Text>
            </TouchableOpacity>

            {/* Fake Call */}
            <TouchableOpacity
                style={styles.card}
                onPress={onFakeCall}
                activeOpacity={0.7}
            >
                <View style={styles.iconWrap}>
                    <Ionicons name="call-outline" size={24} color={COLORS.TEXT_SECONDARY} />
                </View>
                <Text style={styles.cardLabel}>Fake Call</Text>
                <Text style={styles.cardStatus}>TAP</Text>
            </TouchableOpacity>

            {/* Status */}
            <View style={styles.card}>
                <View style={styles.iconWrap}>
                    <MaterialCommunityIcons
                        name="shield-check-outline"
                        size={24}
                        color={isGuardActive ? COLORS.SUCCESS : COLORS.TEXT_SECONDARY}
                    />
                </View>
                <Text style={styles.cardLabel}>Status</Text>
                <Text style={[styles.cardStatus, isGuardActive && styles.statusSuccess]}>
                    {isGuardActive ? 'PROTECTED' : 'STANDBY'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: SPACING.MD,
        gap: SPACING.SM,
    },
    card: {
        width: '48.5%',
        flexBasis: '48.5%',
        backgroundColor: COLORS.SURFACE,
        borderRadius: RADIUS.LG,
        padding: SPACING.LG,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.BORDER,
    },
    cardActive: {
        borderColor: COLORS.BORDER_LIGHT,
        backgroundColor: COLORS.ELEVATED,
    },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.MD,
        backgroundColor: COLORS.ELEVATED,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.SM,
    },
    iconWrapActive: {
        backgroundColor: COLORS.ACCENT_DIM,
    },
    cardLabel: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.BODY,
        color: COLORS.TEXT,
        fontWeight: '500',
        marginBottom: 4,
    },
    cardStatus: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.TINY,
        color: COLORS.TEXT_MUTED,
        letterSpacing: 2,
    },
    statusActive: {
        color: COLORS.DANGER,
    },
    statusAccent: {
        color: COLORS.ACCENT,
    },
    statusSuccess: {
        color: COLORS.SUCCESS,
    },
});
