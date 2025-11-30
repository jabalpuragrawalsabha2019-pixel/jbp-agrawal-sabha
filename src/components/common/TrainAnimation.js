// src/components/common/TrainAnimation.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COACH_WIDTH = 150;
const COACH_SPACING = 8;
const COACH_HEIGHT = 70;

const Spokes = ({ size = 'large' }) => {
  const spokeCount = 8;
  const spokes = Array.from({ length: spokeCount });
  const wheelSize = size === 'large' ? 28 : 20;
  const spokeLength = wheelSize / 2 - 3;
  
  return (
    <>
      {spokes.map((_, i) => {
        const angle = (i * 360) / spokeCount;
        return (
          <View
            key={i}
            style={[
              styles.spoke,
              {
                width: 2,
                height: spokeLength,
                backgroundColor: '#FFD700',
                position: 'absolute',
                transform: [{ rotate: `${angle}deg` }, { translateY: -(spokeLength / 2) }],
              },
            ]}
          />
        );
      })}
    </>
  );
};

const TrainAnimation = ({ announcements = [] }) => {
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const smokeOpacity1 = useRef(new Animated.Value(0)).current;
  const smokeOpacity2 = useRef(new Animated.Value(0)).current;
  const smokeY1 = useRef(new Animated.Value(0)).current;
  const smokeY2 = useRef(new Animated.Value(0)).current;
  const wheelRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateSmoke = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(smokeOpacity1, {
              toValue: 0.6,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(smokeY1, {
              toValue: -25,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(smokeOpacity1, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(smokeY1, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(smokeOpacity2, {
              toValue: 0.6,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(smokeY2, {
              toValue: -25,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(smokeOpacity2, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(smokeY2, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    const animateWheels = () => {
      Animated.loop(
        Animated.timing(wheelRotation, {
          toValue: 360,
          duration: 1200,
          useNativeDriver: true,
        })
      ).start();
    };

    animateSmoke();
    animateWheels();
  }, []);

  useEffect(() => {
    if (announcements.length === 0) return;

    const totalWidth = SCREEN_WIDTH + (announcements.length * (COACH_WIDTH + COACH_SPACING)) + 20;
    const duration = (totalWidth / SCREEN_WIDTH) * 8000;

    const animate = () => {
      translateX.setValue(SCREEN_WIDTH);
      Animated.timing(translateX, {
        toValue: -totalWidth,
        duration: duration,
        useNativeDriver: true,
      }).start(() => {
        animate();
      });
    };

    animate();

    return () => {
      translateX.stopAnimation();
    };
  }, [announcements]);

  if (announcements.length === 0) return null;

  const wheelSpin = wheelRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.trainContainer,
          { transform: [{ translateX }] },
        ]}
      >
        <View style={styles.locomotive}>
          <View style={styles.engineRow}>
            <View style={styles.chimney}>
              <Animated.View 
                style={[
                  styles.smoke,
                  { opacity: smokeOpacity1, transform: [{ translateY: smokeY1 }] }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.smoke,
                  { opacity: smokeOpacity2, transform: [{ translateY: smokeY2 }] }
                ]} 
              />
            </View>
              
            <View style={styles.boiler}>
              <View style={styles.boilerGlow} />
              <View style={styles.frontBadge}>
                <Text style={styles.badgeText}>JBP</Text>
              </View>
            </View>
              
            <View style={styles.cabin}>
              <Text style={styles.cabinTitle}>Agrawal Sabha</Text>
            </View>
              
            <View style={styles.engineNose}>
              <View style={styles.headlightOuter}>
                <View style={styles.headlightInner} />
              </View>
            </View>

            <View style={styles.cowCatcher} />

          </View>
              
          <View style={styles.wheelsRow}>
            <View style={styles.wheelWithSpokes}>
              <Animated.View style={[styles.bigWheel, { transform: [{ rotate: wheelSpin }] }]}>
                <Spokes />
              </Animated.View>
            </View>
              
            <View style={styles.wheelWithSpokes}>
              <Animated.View style={[styles.smallWheelCenter, { transform: [{ rotate: wheelSpin }] }]}>
                <Spokes size="small" />
              </Animated.View>
            </View>

            <Animated.View
              style={[
                styles.rod,
                {
                  transform: [
                    {
                      translateX: wheelRotation.interpolate({
                        inputRange: [0, 360],
                        outputRange: [0, -10], // small realistic motion
                      }),
                    },
                  ],
                },
              ]}
            />


            <View style={styles.wheelWithSpokes}>
              <Animated.View style={[styles.smallWheelCenter, { transform: [{ rotate: wheelSpin }] }]}>
                <Spokes size="small" />
              </Animated.View>
            </View>

            <View style={styles.wheelWithSpokes}>
              <Animated.View style={[styles.bigWheel, { transform: [{ rotate: wheelSpin }] }]}>
                <Spokes />
              </Animated.View>
            </View>
          </View>
        </View>

        {announcements.map((announcement, index) => (
          <View key={index} style={styles.coachWrapper}>
            <View style={styles.coach}>
              <View style={styles.coachBody}>
                <View style={styles.royalPattern}>
                  <View style={styles.patternDot} />
                  <View style={styles.patternDot} />
                  <View style={styles.patternDot} />
                </View>
                
                <View style={styles.contentRow}>
                  <View style={styles.iconBadge}>
                    <Ionicons 
                      name={announcement.is_event ? "star" : "megaphone-outline"} 
                      size={16} 
                      color="#FFD700" 
                    />
                  </View>
                  
                  <View style={styles.textContent}>
                    <Text style={styles.announcementTitle} numberOfLines={1}>
                      {announcement.title}
                    </Text>
                    {announcement.date && (
                      <View style={styles.dateRow}>
                        <Ionicons 
                          name="calendar-outline" 
                          size={10} 
                          color="#FFD700" 
                        />
                        <Text style={styles.announcementDate}>
                          {new Date(announcement.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.flourishBottom}>
                  <View style={styles.flourishDiamond} />
                  <View style={styles.flourishLine} />
                  <View style={styles.flourishDiamond} />
                </View>
              </View>
              
              <View style={styles.coachWheels}>
                <Animated.View style={[styles.coachWheel, { transform: [{ rotate: wheelSpin }] }]}>
                  <View style={styles.wheelCenter} />
                </Animated.View>
                <Animated.View style={[styles.coachWheel, { transform: [{ rotate: wheelSpin }] }]}>
                  <View style={styles.wheelCenter} />
                </Animated.View>
              </View>
            </View>
            
            {index < announcements.length - 1 && (
              <View style={styles.connector} />
            )}
          </View>
        ))}
      </Animated.View>
      
      <View style={styles.track}>
        <View style={styles.rail} />
        <View style={styles.rail} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 130,
    overflow: 'hidden',
    backgroundColor: `${COLORS.primary}08`,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    position: 'relative',
  },
  trainContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: -15,
    paddingTop: 8,
    paddingLeft: 5,
    marginTop: 18,
  },
  
  locomotive: {
    width: 160,
    top: 6, 
    marginRight: 4,
    paddingBottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  
  engineRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: COACH_HEIGHT - 18,
    justifyContent: 'center',
  },
  
  chimney: {
    width: 20,
    height: 32,
    backgroundColor: '#3B0000',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,

    // 🔥 tapered bottom to look like FRONT chimney
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,

    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',

    // 🔥 pull chimney slightly forward
    marginRight: -4,
    marginBottom: -3,

    // 🔥 tilt slightly forward
    transform: [{ rotate: '-6deg' }],
  },

  smoke: {
    width: 16,
    height: 16,
    borderRadius: 10,
    backgroundColor: '#CFCFCF',
    position: 'absolute',
    top: -10,
    marginLeft: -2,
  },
  
  boiler: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4F0000',
    borderWidth: 3,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
    position: 'relative',
  },
  boilerGlow: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 50,
    backgroundColor: 'rgba(255,215,0,0.08)',
  },
  frontBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#630000',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#4F0000',
    letterSpacing: 0.5,
  },
  
  cabin: {
    width: 120,
    height: COACH_HEIGHT - 20,
    backgroundColor: '#630000',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FFD700',
    marginLeft: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  cabinTitle: {
    fontSize: 12,
    flexShrink: 1,
    fontWeight: '800',
    color: '#FFD700',
    textAlign: 'center',
  },
  
  engineNose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#300000',
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0,
  },
  cowCatcher: {
    width: 0,
    height: 0,

    // create right-angle triangle
    borderTopWidth: 26,        // height of triangle
    borderRightWidth: 40,      // base length
    borderTopColor: 'transparent',
    borderRightColor: '#630000',   // gold triangle

    position: 'absolute',
    bottom: -20,          // position under engine
    right: 186,          // push forward
    transform: [{ rotate: '-0deg' }], // slight forward tilt
    zIndex: 999,
  },



  
  headlightOuter: {
    width: 16,
    height: 16,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  headlightInner: {
    width: 8,
    height: 8,
    backgroundColor: '#FFF8D1',
    borderRadius: 4,
  },
  
  wheelsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 0,
    paddingBottom: 0,
    marginLeft: -18,
  },
  
  wheelWithSpokes: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  
  bigWheel: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    borderWidth: 3,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  smallWheelCenter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  rod: {
    width: 70,   // stretch between big wheels
    height: 4,
    backgroundColor: '#FFD700',
    borderRadius: 2,
    marginHorizontal: 4,   // small spacing
    position: 'absolute',  // necessary to keep rod aligned
    bottom: 6,             // adjust rod height
    marginLeft: 35,    // 👉 THIS moves the rod right
    marginRight: 10,   // optional, keeps rod centered
  },
  
  coachWrapper: {
    marginRight: COACH_SPACING,
    position: 'relative',
  },
  coach: {
    position: 'relative',
  },
  coachBody: {
    width: COACH_WIDTH,
    height: COACH_HEIGHT-11,
    backgroundColor: '#5C0A0A',
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  royalPattern: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    gap: 2,
  },
  patternDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFD700',
    opacity: 0.6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingTop: 2,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FFD700',
    flexShrink: 0,
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  announcementTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 1,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  announcementDate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFD700',
    letterSpacing: 0.2,
  },
  flourishBottom: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  flourishLine: {
    width: 30,
    height: 0.8,
    backgroundColor: '#FFD700',
    opacity: 0.5,
  },
  flourishDiamond: {
    width: 5,
    height: 5,
    backgroundColor: '#FFD700',
    transform: [{ rotate: '45deg' }],
    opacity: 0.6,
  },
  coachWheels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 2,
  },
  coachWheel: {
    width: 20,
    height: 20,
    borderRadius: 11,
    backgroundColor: COLORS.gray800,
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: -5,
  },
  wheelCenter: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFD700',
  },
  connector: {
    position: 'absolute',
    right: -(COACH_SPACING / 2),
    top: '45%',
    width: COACH_SPACING,
    height: 2,
    backgroundColor: '#FFD700',
    borderRadius: 1,
  },
  
  track: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    height: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  rail: {
    width: '45%',
    height: 2,
    backgroundColor: COLORS.gray400,
    borderRadius: 1,
  },
});

export default TrainAnimation;