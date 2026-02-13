// Sensor Processing Utilities for Raksha

import { SENSOR_THRESHOLDS } from '../config/constants';

/**
 * Calculate total acceleration magnitude from X, Y, Z components
 * Formula: √(x² + y² + z²)
 */
export const calculateAccelerationMagnitude = (x, y, z) => {
  return Math.sqrt(x * x + y * y + z * z);
};



/**
 * Fall Detection State Machine
 * Detects: High Impact → Stillness → Potential Fall
 */
export class FallDetector {
  constructor() {
    this.impactDetected = false;
    this.impactTime = 0;
    this.stillnessDuration = 0;
    this.lastMovementTime = 0;
  }

  processAcceleration(magnitude, timestamp) {
    // Phase 1: Detect Impact
    if (magnitude > SENSOR_THRESHOLDS.FALL_IMPACT_THRESHOLD) {
      console.log(`[FallDetector] 💥 Impact Detected! Magnitude: ${magnitude.toFixed(2)}`);
      this.impactDetected = true;
      this.impactTime = timestamp;
      this.lastMovementTime = timestamp;
      return { phase: 'impact', fallDetected: false };
    }

    // Phase 2: Monitor Stillness After Impact
    if (this.impactDetected) {
      const isStill = magnitude < 0.3; // Near-zero movement

      if (isStill) {
        const stillnessTime = timestamp - this.lastMovementTime;

        if (stillnessTime >= SENSOR_THRESHOLDS.FALL_STILLNESS_DURATION) {
          // Fall detected!
          console.log(`[FallDetector] 🚨 FALL CONFIRMED! Stillness duration: ${stillnessTime}ms`);
          const result = { phase: 'fall', fallDetected: true };
          this.reset();
          return result;
        }

        return {
          phase: 'monitoring',
          fallDetected: false,
          stillnessProgress: stillnessTime / SENSOR_THRESHOLDS.FALL_STILLNESS_DURATION
        };
      } else {
        // Movement detected - reset
        if (timestamp - this.lastMovementTime > 1000) {
          console.log(`[FallDetector] ❌ Fall aborted due to movement. Resetting stillness timer. (Magnitude: ${magnitude.toFixed(2)})`);
        }
        this.lastMovementTime = timestamp;
      }
    }

    return { phase: 'idle', fallDetected: false };
  }

  reset() {
    this.impactDetected = false;
    this.impactTime = 0;
    this.stillnessDuration = 0;
    this.lastMovementTime = 0;
  }
}

/**
 * Format acceleration data for display
 */
export const formatSensorData = (x, y, z) => {
  return {
    x: x.toFixed(3),
    y: y.toFixed(3),
    z: z.toFixed(3),
    magnitude: calculateAccelerationMagnitude(x, y, z).toFixed(3),
  };
};

/**
 * Generate evidence filename with timestamp
 */
export const generateEvidenceFilename = (type = 'audio') => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, -5); // Remove milliseconds

  return `EVIDENCE_${timestamp}.${type === 'audio' ? 'm4a' : 'jpg'}`;
};

/**
 * Create Google Maps location URL
 */
export const createLocationURL = (latitude, longitude) => {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

/**
 * Create WhatsApp deep link with pre-filled message
 */
export const createWhatsAppLink = (phoneNumber, message) => {
  const encodedMessage = encodeURIComponent(message);
  return `whatsapp://send?text=${encodedMessage}&phone=${phoneNumber}`;
};