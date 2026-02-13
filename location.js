// Location & Alert Utilities for Raksha

import * as Location from 'expo-location';
import { Linking, Alert } from 'react-native';
import { createLocationURL, createWhatsAppLink } from './sensorUtils';
import { EMERGENCY_CONFIG } from '../config/constants';

/**
 * Request Location Permissions
 */
export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Raksha needs location access to send emergency alerts with your coordinates.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Location permission error:', error);
    return false;
  }
};

/**
 * Get Current Location Coordinates
 */
export const getCurrentLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 0,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error('Get location error:', error);
    
    // Fallback: Get last known location
    try {
      const lastLocation = await Location.getLastKnownPositionAsync();
      if (lastLocation) {
        return {
          latitude: lastLocation.coords.latitude,
          longitude: lastLocation.coords.longitude,
          accuracy: lastLocation.coords.accuracy,
          timestamp: lastLocation.timestamp,
          isLastKnown: true,
        };
      }
    } catch (fallbackError) {
      console.error('Fallback location error:', fallbackError);
    }
    
    return null;
  }
};

/**
 * Send Emergency Alert via WhatsApp
 */
export const sendEmergencyAlert = async () => {
  try {
    // Step 1: Get current location
    const location = await getCurrentLocation();
    
    if (!location) {
      Alert.alert(
        'Location Unavailable',
        'Unable to retrieve your location. Alert will be sent without coordinates.',
        [{ text: 'OK' }]
      );
    }
    
    // Step 2: Create location URL
    const locationURL = location 
      ? createLocationURL(location.latitude, location.longitude)
      : 'Location unavailable - GPS signal lost';
    
    // Step 3: Create alert message
    const alertMessage = EMERGENCY_CONFIG.SOS_MESSAGE_TEMPLATE(locationURL);
    
    // Step 4: Create WhatsApp deep link
    const whatsappURL = createWhatsAppLink(
      EMERGENCY_CONFIG.EMERGENCY_PHONE,
      alertMessage
    );
    
    // Step 5: Check if WhatsApp is available
    const canOpen = await Linking.canOpenURL(whatsappURL);
    
    if (canOpen) {
      await Linking.openURL(whatsappURL);
      return { success: true, method: 'whatsapp', location };
    } else {
      // Fallback: Try SMS
      const smsURL = `sms:${EMERGENCY_CONFIG.EMERGENCY_PHONE}?body=${encodeURIComponent(alertMessage)}`;
      await Linking.openURL(smsURL);
      return { success: true, method: 'sms', location };
    }
  } catch (error) {
    console.error('Emergency alert error:', error);
    
    Alert.alert(
      'Alert Failed',
      'Unable to send emergency alert. Please contact emergency services directly.',
      [{ text: 'OK' }]
    );
    
    return { success: false, error: error.message };
  }
};

/**
 * Format location for display
 */
export const formatLocation = (location) => {
  if (!location) return 'Acquiring GPS...';
  
  return `${location.latitude.toFixed(6)}°N, ${location.longitude.toFixed(6)}°E`;
};

/**
 * Calculate GPS accuracy status
 */
export const getGPSStatus = (accuracy) => {
  if (!accuracy) return { status: 'searching', color: '#FF9500' };
  
  if (accuracy < 10) return { status: 'excellent', color: '#34C759' };
  if (accuracy < 30) return { status: 'good', color: '#34C759' };
  if (accuracy < 100) return { status: 'fair', color: '#FF9500' };
  
  return { status: 'poor', color: '#FF3B30' };
};