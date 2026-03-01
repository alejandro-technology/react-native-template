import { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Button,
  Text,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '@theme/index';

export default function AnimationExampleView() {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [showList, setShowList] = useState(false);

  const boxWidth = useRef(new Animated.Value(100)).current;
  const boxHeight = useRef(new Animated.Value(100)).current;
  const boxColor = useRef(new Animated.Value(0)).current;
  const colorBoxAnim = useRef(new Animated.Value(0)).current;

  const detailsOpacity = useRef(new Animated.Value(0)).current;
  const detailsTranslateX = useRef(new Animated.Value(-50)).current;

  const pulseScale = useRef(new Animated.Value(1)).current;
  const listItem1Opacity = useRef(new Animated.Value(0)).current;
  const listItem2Opacity = useRef(new Animated.Value(0)).current;
  const listItem3Opacity = useRef(new Animated.Value(0)).current;

  const rotateValue = useRef(new Animated.Value(0)).current;
  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    rotateValue.setValue(0);
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [rotateValue]);

  const handleToggleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);

    Animated.parallel([
      Animated.timing(boxWidth, {
        toValue: newExpanded ? 200 : 100,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(boxHeight, {
        toValue: newExpanded ? 200 : 100,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(boxColor, {
        toValue: newExpanded ? 1 : 0,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleToggleColor = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);

    Animated.timing(colorBoxAnim, {
      toValue: newExpanded ? 1 : 0,
      duration: 800,
      useNativeDriver: false,
    }).start();
  };

  const handleToggleDetails = () => {
    const newShow = !showDetails;
    setShowDetails(newShow);

    if (newShow) {
      detailsOpacity.setValue(0);
      detailsTranslateX.setValue(-50);
      Animated.parallel([
        Animated.timing(detailsOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(detailsTranslateX, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(detailsOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(detailsTranslateX, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleTogglePulse = () => {
    const newShow = !showPulse;
    setShowPulse(newShow);

    if (newShow) {
      pulseScale.setValue(1);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseScale.stopAnimation();
      Animated.timing(pulseScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleToggleList = () => {
    const newShow = !showList;
    setShowList(newShow);

    if (newShow) {
      listItem1Opacity.setValue(0);
      listItem2Opacity.setValue(0);
      listItem3Opacity.setValue(0);

      Animated.stagger(100, [
        Animated.timing(listItem1Opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(listItem2Opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(listItem3Opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(listItem1Opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(listItem2Opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(listItem3Opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const boxBackgroundColor = boxColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['tomato', '#6366f1'],
  });

  const colorBoxBackgroundColor = colorBoxAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ef4444', '#10b981'],
  });

  const boxStyle = {
    width: boxWidth,
    height: boxHeight,
    backgroundColor: boxBackgroundColor,
  };

  const colorBoxStyle = {
    backgroundColor: colorBoxBackgroundColor,
  };

  const detailsStyle = {
    opacity: detailsOpacity,
    transform: [{ translateX: detailsTranslateX }],
  };

  const pulseStyle = {
    transform: [{ scale: pulseScale }],
  };

  const list1Style = { opacity: listItem1Opacity };
  const list2Style = { opacity: listItem2Opacity };
  const list3Style = { opacity: listItem3Opacity };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Animation Examples</Text>
        <Text style={styles.subtitle}>React Native Animated</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. State Change Transition</Text>
        <Animated.View style={[styles.box, boxStyle]} />
        <View style={styles.buttonContainer}>
          <Button title="Toggle Size" onPress={handleToggleExpand} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Color Transition</Text>
        <Animated.View style={[styles.colorBox, colorBoxStyle]} />
        <View style={styles.buttonContainer}>
          <Button title="Change Color" onPress={handleToggleColor} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Show/Hide Animation</Text>
        <View style={styles.buttonContainer}>
          <Button
            title={showDetails ? 'Hide' : 'Show'}
            onPress={handleToggleDetails}
          />
        </View>
        {showDetails && (
          <Animated.View
            style={[
              styles.detailsCard,
              { backgroundColor: theme.colors.surface },
              detailsStyle,
            ]}
          >
            <Text style={styles.detailsText}>
              Animated with React Native Animated!
            </Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Loop Animation (Pulse)</Text>
        <View style={styles.buttonContainer}>
          <Button
            title={showPulse ? 'Hide Pulse' : 'Show Pulse'}
            onPress={handleTogglePulse}
          />
        </View>
        {showPulse && (
          <Animated.View
            style={[
              styles.pulseBox,
              { backgroundColor: theme.colors.primary },
              pulseStyle,
            ]}
          >
            <Text style={styles.pulseText}>Pulse</Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Staggered Animation</Text>
        <View style={styles.buttonContainer}>
          <Button
            title={showList ? 'Hide List' : 'Show List'}
            onPress={handleToggleList}
          />
        </View>
        {showList && (
          <View style={styles.listContainer}>
            <Animated.View
              style={[
                styles.listItem,
                { backgroundColor: '#6366f1' },
                list1Style,
              ]}
            >
              <Text style={styles.listText}>Item 1</Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.listItem,
                { backgroundColor: '#8b5cf6' },
                list2Style,
              ]}
            >
              <Text style={styles.listText}>Item 2</Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.listItem,
                { backgroundColor: '#a855f7' },
                list3Style,
              ]}
            >
              <Text style={styles.listText}>Item 3</Text>
            </Animated.View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Rotation Animation</Text>
        <Animated.View
          style={[
            styles.rotateBox,
            { backgroundColor: '#f59e0b' },
            { transform: [{ rotate }] },
          ]}
        >
          <Text style={styles.rotateText}>↻</Text>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  section: {
    marginBottom: 28,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  box: {
    borderRadius: 16,
    marginBottom: 12,
    height: 100,
    width: 100,
  },
  colorBox: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonContainer: {
    marginTop: 8,
  },
  detailsCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    width: '100%',
  },
  detailsText: {
    fontSize: 14,
  },
  pulseBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  pulseText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  listContainer: {
    width: '100%',
    marginTop: 12,
  },
  listItem: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  listText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  rotateBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  rotateText: {
    fontSize: 36,
    color: 'white',
  },
});
