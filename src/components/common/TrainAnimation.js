// src/components/common/TrainAnimation.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COACH_WIDTH = 180;
const COACH_SPACING = 20;

const TrainAnimation = ({ announcements = [] }) => {
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    if (announcements.length === 0) return;

    // Calculate total train length
    const totalWidth = (announcements.length * (COACH_WIDTH + COACH_SPACING)) + 150; // +150 for engine

    // Animate the train
    const animate = () => {
      translateX.setValue(SCREEN_WIDTH);
      Animated.timing(translateX, {
        toValue: -totalWidth,
        duration: announcements.length * 8000, // 8 seconds per announcement
        useNativeDriver: true,
      }).start(() => {
        // Loop the animation
        animate();
      });
    };

    animate();

    return () => {
      translateX.stopAnimation();
    };
  }, [announcements]);

  if (announcements.length === 0) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.trainContainer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        {/* Engine */}
        <View style={styles.engine}>
          <View style={styles.engineTop}>
            <View style={styles.chimney} />
            <View style={styles.cabin}>
              <Ionicons name="train" size={32} color={COLORS.white} />
            </View>
          </View>
          <View style={styles.engineBody}>
            <View style={styles.wheel} />
            <View style={styles.wheel} />
          </View>
        </View>

        {/* Coaches (Announcements) */}
        {announcements.map((announcement, index) => (
          <View key={index} style={styles.coach}>
            <View style={styles.coachBody}>
              <View style={styles.coachHeader}>
                <Ionicons 
                  name={announcement.is_event ? "calendar" : "megaphone"} 
                  size={20} 
                  color={COLORS.primary} 
                />
              </View>
              <Text style={styles.coachTitle} numberOfLines={2}>
                {announcement.title}
              </Text>
              {announcement.date && (
                <Text style={styles.coachDate}>
                  {new Date(announcement.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </Text>
              )}
            </View>
            <View style={styles.coachWheels}>
              <View style={styles.coachWheel} />
              <View style={styles.coachWheel} />
            </View>
            {/* Connector */}
            {index < announcements.length - 1 && (
              <View style={styles.connector} />
            )}
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 120,
    overflow: 'hidden',
    backgroundColor: `${COLORS.primary}05`,
    marginBottom: SPACING.lg,
  },
  trainContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 10,
  },
  
  // Engine styles
  engine: {
    width: 100,
    marginRight: COACH_SPACING,
  },
  engineTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  chimney: {
    width: 15,
    height: 25,
    backgroundColor: COLORS.gray700,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    marginRight: 5,
  },
  cabin: {
    width: 60,
    height: 50,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
  },
  engineBody: {
    width: 80,
    height: 30,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 2,
  },
  wheel: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.gray800,
    borderWidth: 2,
    borderColor: COLORS.gray600,
  },

  // Coach styles
  coach: {
    marginRight: COACH_SPACING,
    position: 'relative',
  },
  coachBody: {
    width: COACH_WIDTH,
    height: 80,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 3,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  coachTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
    lineHeight: 16,
  },
  coachDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  coachWheels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 5,
  },
  coachWheel: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.gray800,
    borderWidth: 2,
    borderColor: COLORS.gray600,
  },
  connector: {
    position: 'absolute',
    right: -COACH_SPACING,
    top: '50%',
    width: COACH_SPACING,
    height: 3,
    backgroundColor: COLORS.gray600,
  },
});

export default TrainAnimation;