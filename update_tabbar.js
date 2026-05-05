const fs = require('fs');

let content = fs.readFileSync('src/navigation/AppNavigator.js', 'utf8');

// 1. Rewrite CandidateTabBar to remove the active line and reduce height
const candidateTabBarTarget = `function CandidateTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const bottomInset = Math.max(insets.bottom, 12);
  const tabWidth = width / state.routes.length;
  const indicatorPosition = useRef(new Animated.Value(state.index)).current;
  const indicatorTranslateX = indicatorPosition.interpolate({
    inputRange: [0, state.routes.length - 1],
    outputRange: [2, (state.routes.length - 1) * tabWidth + 2],
  });

  function moveIndicator(index) {
    Animated.spring(indicatorPosition, {
      damping: 26,
      mass: 0.5,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
      stiffness: 760,
      toValue: index,
      useNativeDriver: true,
    }).start();
  }

  useEffect(() => {
    moveIndicator(state.index);
  }, [indicatorPosition, state.index]);

  return (
    <View style={[styles.tabBar, { height: 52 + bottomInset }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.tabActiveLine,
          {
            transform: [{ translateX: indicatorTranslateX }],
            width: Math.max(tabWidth - 4, 0),
          },
        ]}
      />`;

const candidateTabBarReplacement = `function CandidateTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.tabBar, { height: 44 + bottomInset }]}>`;

content = content.replace(candidateTabBarTarget, candidateTabBarReplacement);

// Remove moveIndicator call from onPress in CandidateTabBar
content = content.replace('moveIndicator(index);', '');

// 2. Update CandidateTabBarItem for bounce animation and outline/fill
const candidateTabBarItemTarget = `function CandidateTabBarItem({ bottomInset, isFocused, label, onLongPress, onPress, routeName }) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const iconNames = {
    CandidateProfileTab: "person",
    ExploreTab: "home",
    MyJobsTab: "briefcase",
  };

  const handlePressIn = () => {
    overlayOpacity.setValue(0);
    Animated.timing(overlayOpacity, {
      duration: 45,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(overlayOpacity, {
      duration: 80,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.tabPressOverlay,
          {
            opacity: overlayOpacity,
          },
        ]}
      />
      <View style={[styles.tabButtonContent, { paddingBottom: bottomInset, paddingTop: Math.max(10, bottomInset > 12 ? 8 : 10) }]}>
        <Ionicons color={isFocused ? COLORS.text : COLORS.mutedLight} name={iconNames[routeName]} size={24} />
        <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
      </View>
    </Pressable>
  );
}`;

const candidateTabBarItemReplacement = `function CandidateTabBarItem({ bottomInset, isFocused, label, onLongPress, onPress, routeName }) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const iconNames = {
    CandidateProfileTab: "person",
    ExploreTab: "home",
    MyJobsTab: "briefcase",
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const iconName = isFocused ? iconNames[routeName] : \`\${iconNames[routeName]}-outline\`;

  return (
    <Pressable
      accessibilityRole="button"
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <View style={[styles.tabButtonContent, { paddingBottom: bottomInset, paddingTop: Math.max(8, bottomInset > 12 ? 6 : 8) }]}>
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <Ionicons color={isFocused ? COLORS.text : COLORS.mutedLight} name={iconName} size={22} />
        </Animated.View>
        <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
      </View>
    </Pressable>
  );
}`;

content = content.replace(candidateTabBarItemTarget, candidateTabBarItemReplacement);

// 3. Update EmployerTabs height and icon
content = content.replace(/height: 52,\n\s*paddingBottom: 5,\n\s*paddingTop: 4,/g, 'height: 44,\n          paddingBottom: 4,\n          paddingTop: 4,');

// 4. Update EmployerTabs icons outline/fill
const employerIconTarget = `tabBarIcon: ({ color, size }) => {
          const icons = {
            EmployerHomeTab: "grid-outline",
            EmployerJobsTab: "briefcase-outline",
            CompanyProfileTab: "business-outline",
          };

          return <Ionicons color={color} name={icons[route.name]} size={size} />;
        },`;
const employerIconReplacement = `tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            EmployerHomeTab: "grid",
            EmployerJobsTab: "briefcase",
            CompanyProfileTab: "business",
          };
          const name = focused ? icons[route.name] : \`\${icons[route.name]}-outline\`;
          return <Ionicons color={color} name={name} size={size} />;
        },`;
content = content.replace(employerIconTarget, employerIconReplacement);

// 5. Update AdminTabs icons outline/fill
const adminIconTarget = `tabBarIcon: ({ color, size }) => {
          const icons = {
            AdminHomeTab: "grid-outline",
            AdminJobsTab: "document-text-outline",
            AdminUsersTab: "people-outline",
          };

          return <Ionicons color={color} name={icons[route.name]} size={size} />;
        },`;
const adminIconReplacement = `tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            AdminHomeTab: "grid",
            AdminJobsTab: "document-text",
            AdminUsersTab: "people",
          };
          const name = focused ? icons[route.name] : \`\${icons[route.name]}-outline\`;
          return <Ionicons color={color} name={name} size={size} />;
        },`;
content = content.replace(adminIconTarget, adminIconReplacement);

fs.writeFileSync('src/navigation/AppNavigator.js', content, 'utf8');
console.log('AppNavigator updated successfully');
