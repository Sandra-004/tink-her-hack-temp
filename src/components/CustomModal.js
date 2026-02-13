// Raksha — Custom Modal
// Minimalist dark modal replacing all Alert.alert()

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../config/constants';

export default function CustomModal({ visible, title, message, buttons = [], onClose }) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    {message && <Text style={styles.message}>{message}</Text>}

                    <View style={styles.actions}>
                        {buttons.map((btn, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.btn, i === buttons.length - 1 && styles.btnPrimary]}
                                onPress={btn.onPress}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.btnText,
                                    i === buttons.length - 1 && styles.btnTextPrimary,
                                ]}>
                                    {btn.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.XL,
    },
    container: {
        width: '100%',
        backgroundColor: COLORS.SURFACE,
        borderRadius: RADIUS.LG,
        padding: SPACING.LG,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
    },
    title: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.HEADING,
        color: COLORS.TEXT,
        fontWeight: '600',
        marginBottom: SPACING.SM,
    },
    message: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.BODY,
        color: COLORS.TEXT_SECONDARY,
        lineHeight: 22,
        marginBottom: SPACING.LG,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: SPACING.SM,
    },
    btn: {
        paddingVertical: SPACING.SM,
        paddingHorizontal: SPACING.MD,
        borderRadius: RADIUS.SM,
        backgroundColor: COLORS.ELEVATED,
    },
    btnPrimary: {
        backgroundColor: COLORS.ACCENT,
    },
    btnText: {
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        fontSize: TYPOGRAPHY.CAPTION,
        color: COLORS.TEXT_SECONDARY,
        fontWeight: '500',
        letterSpacing: 1,
    },
    btnTextPrimary: {
        color: COLORS.WHITE,
    },
});
