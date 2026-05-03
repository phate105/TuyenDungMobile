import { useEffect, useRef } from "react";

import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ROLES } from "../constants/appConstants";
import { COLORS } from "../constants/theme";
import { LABELS } from "../constants/labels";
import AdminJobDetailScreen from "../screens/admin/AdminJobDetailScreen";
import AdminHomeScreen from "../screens/admin/AdminHomeScreen";
import PendingJobsScreen from "../screens/admin/PendingJobsScreen";
import UserDetailScreen from "../screens/admin/UserDetailScreen";
import UserManagementScreen from "../screens/admin/UserManagementScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ApplyScreen from "../screens/candidate/ApplyScreen";
import CandidateProfileScreen from "../screens/candidate/CandidateProfileScreen";
import CompanyDetailScreen from "../screens/candidate/CompanyDetailScreen";
import CreateCVScreen from "../screens/candidate/CreateCVScreen";
import CVManagementScreen from "../screens/candidate/CVManagementScreen";
import CVPreviewScreen from "../screens/candidate/CVPreviewScreen";
import EditCandidateProfileScreen from "../screens/candidate/EditCandidateProfileScreen";
import EducationFormScreen from "../screens/candidate/EducationFormScreen";
import ExperienceFormScreen from "../screens/candidate/ExperienceFormScreen";
import ExploreScreen from "../screens/candidate/ExploreScreen";
import JobDetailScreen from "../screens/candidate/JobDetailScreen";
import JobPreferenceScreen from "../screens/candidate/JobPreferenceScreen";
import MyJobsScreen from "../screens/candidate/MyJobsScreen";
import PersonalInfoFormScreen from "../screens/candidate/PersonalInfoFormScreen";
import SearchScreen from "../screens/candidate/SearchScreen";
import SearchResultScreen from "../screens/candidate/SearchResultScreen";
import SettingsScreen from "../screens/candidate/SettingsScreen";
import SkillFormScreen from "../screens/candidate/SkillFormScreen";
import ApplicantCVScreen from "../screens/employer/ApplicantCVScreen";
import CompanyProfileScreen from "../screens/employer/CompanyProfileScreen";
import EmployerHomeScreen from "../screens/employer/EmployerHomeScreen";
import EmployerJobDetailScreen from "../screens/employer/EmployerJobDetailScreen";
import EmployerJobFormScreen from "../screens/employer/EmployerJobFormScreen";
import EmployerJobsScreen from "../screens/employer/EmployerJobsScreen";
import JobApplicationsScreen from "../screens/employer/JobApplicationsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CandidateTabBar({ state, descriptors, navigation }) {
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
    <View style={[styles.tabBar, { height: 62 + bottomInset }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.tabActiveLine,
          {
            transform: [{ translateX: indicatorTranslateX }],
            width: Math.max(tabWidth - 4, 0),
          },
        ]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = typeof options.title === "string" ? options.title : route.name;

        const onPress = () => {
          const event = navigation.emit({
            canPreventDefault: true,
            target: route.key,
            type: "tabPress",
          });

          if (!isFocused && !event.defaultPrevented) {
            moveIndicator(index);
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            target: route.key,
            type: "tabLongPress",
          });
        };

        return (
          <CandidateTabBarItem
            bottomInset={bottomInset}
            key={route.key}
            isFocused={isFocused}
            label={label}
            onLongPress={onLongPress}
            onPress={onPress}
            routeName={route.name}
          />
        );
      })}
    </View>
  );
}

function CandidateTabBarItem({ bottomInset, isFocused, label, onLongPress, onPress, routeName }) {
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
}

const stackScreenOptions = {
  animation: "slide_from_right",
  animationDuration: 110,
  gestureEnabled: true,
  headerStyle: {
    backgroundColor: COLORS.header,
  },
  headerTintColor: COLORS.surface,
  headerTitleStyle: {
    fontWeight: "900",
  },
};

const lightStackScreenOptions = {
  animation: "slide_from_right",
  animationDuration: 110,
  gestureEnabled: true,
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: COLORS.surface,
  },
  headerTintColor: COLORS.text,
  headerTitleStyle: {
    color: COLORS.text,
    fontWeight: "700",
  },
};

function AuthNavigator({ onAuthenticated }) {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Login" options={{ headerShown: false }}>
        {(props) => <LoginScreen {...props} onAuthenticated={onAuthenticated} />}
      </Stack.Screen>
      <Stack.Screen
        name="Register"
        options={{
          ...lightStackScreenOptions,
          headerBackTitleVisible: false,
          title: "\u0110\u0103ng k\u00fd",
        }}
      >
        {(props) => <RegisterScreen {...props} onAuthenticated={onAuthenticated} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function CandidateTabs({ user }) {
  return (
    <Tab.Navigator
      tabBar={(props) => <CandidateTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneContainerStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Tab.Screen name="ExploreTab" options={{ title: LABELS.tabs.explore }}>
        {(props) => <ExploreScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="MyJobsTab" options={{ title: LABELS.tabs.myJobs }}>
        {(props) => <MyJobsScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="CandidateProfileTab" options={{ title: LABELS.tabs.profile }}>
        {(props) => <CandidateProfileScreen {...props} user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function CandidateNavigator({ user, onLogout }) {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="CandidateTabs" options={{ headerShown: false }}>
        {(props) => <CandidateTabs {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="JobDetail"
        options={{
          headerShown: false,
        }}
      >
        {(props) => <JobDetailScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="CompanyDetail"
        options={{
          ...lightStackScreenOptions,
          headerBackTitleVisible: false,
          title: "Chi ti\u1ebft c\u00f4ng ty",
        }}
      >
        {(props) => <CompanyDetailScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="Search" options={{ headerShown: false }}>
        {(props) => <SearchScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="SearchResult" options={{ headerShown: false }}>
        {(props) => <SearchResultScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="Apply"
        options={{
          ...lightStackScreenOptions,
          headerBackTitleVisible: false,
          title: LABELS.screens.apply,
        }}
      >
        {(props) => <ApplyScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="Settings"
        options={{
          ...lightStackScreenOptions,
          headerBackTitleVisible: false,
          title: LABELS.screens.settings,
        }}
      >
        {(props) => <SettingsScreen {...props} user={user} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen
        name="EditCandidateProfile"
        options={{
          ...lightStackScreenOptions,
          headerBackTitleVisible: false,
          title: LABELS.screens.editProfile,
        }}
      >
        {(props) => <EditCandidateProfileScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="JobPreference"
        options={{
          ...lightStackScreenOptions,
          headerBackTitleVisible: false,
          title: LABELS.screens.jobPreference,
        }}
      >
        {(props) => <JobPreferenceScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="CVManagement"
        options={{
          ...lightStackScreenOptions,
          headerBackTitleVisible: false,
          title: LABELS.screens.cvManagement,
        }}
      >
        {(props) => <CVManagementScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="CreateCV"
        options={{
          ...lightStackScreenOptions,
          headerBackTitleVisible: false,
          title: LABELS.screens.createCV,
        }}
      >
        {(props) => <CreateCVScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="PersonalInfoForm"
        options={{
          ...lightStackScreenOptions,
          headerBackTitleVisible: false,
          title: LABELS.screens.personalInfo,
        }}
      >
        {(props) => <PersonalInfoFormScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="ExperienceForm"
        options={{
          ...lightStackScreenOptions,
          headerBackTitleVisible: false,
          title: LABELS.screens.experience,
        }}
      >
        {(props) => <ExperienceFormScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="EducationForm"
        options={{
          ...lightStackScreenOptions,
          headerBackTitleVisible: false,
          title: LABELS.screens.education,
        }}
      >
        {(props) => <EducationFormScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="SkillForm"
        options={{
          ...lightStackScreenOptions,
          headerBackTitleVisible: false,
          title: LABELS.screens.skills,
        }}
      >
        {(props) => <SkillFormScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="CVPreview"
        options={{
          ...lightStackScreenOptions,
          headerBackTitleVisible: false,
          title: LABELS.screens.cvPreview,
        }}
      >
        {(props) => <CVPreviewScreen {...props} user={user} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function EmployerNavigator({ user, onLogout }) {
  return (
    <Stack.Navigator screenOptions={lightStackScreenOptions}>
      <Stack.Screen name="EmployerHome" options={{ title: "Nh\u00e0 tuy\u1ec3n d\u1ee5ng" }}>
        {(props) => <EmployerHomeScreen {...props} user={user} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen
        name="EmployerJobs"
        options={{
          headerBackTitleVisible: false,
          title: "Tin tuy\u1ec3n d\u1ee5ng",
        }}
      >
        {(props) => <EmployerJobsScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="EmployerJobForm"
        options={({ route }) => ({
          headerBackTitleVisible: false,
          title: route.params?.jobId ? "S\u1eeda tin tuy\u1ec3n d\u1ee5ng" : "\u0110\u0103ng tin tuy\u1ec3n d\u1ee5ng",
        })}
      >
        {(props) => <EmployerJobFormScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="EmployerJobDetail"
        options={{
          headerBackTitleVisible: false,
          title: "Chi ti\u1ebft tin",
        }}
      >
        {(props) => <EmployerJobDetailScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="JobApplications"
        options={{
          headerBackTitleVisible: false,
          title: "\u1ee8ng vi\u00ean \u1ee9ng tuy\u1ec3n",
        }}
      >
        {(props) => <JobApplicationsScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="ApplicantCV"
        options={{
          headerBackTitleVisible: false,
          title: "H\u1ed3 s\u01a1 \u1ee9ng vi\u00ean",
        }}
      >
        {(props) => <ApplicantCVScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="CompanyProfile"
        options={{
          headerBackTitleVisible: false,
          title: "H\u1ed3 s\u01a1 c\u00f4ng ty",
        }}
      >
        {(props) => <CompanyProfileScreen {...props} user={user} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function AdminNavigator({ user, onLogout }) {
  return (
    <Stack.Navigator screenOptions={lightStackScreenOptions}>
      <Stack.Screen name="AdminHome" options={{ title: LABELS.screens.adminHome }}>
        {(props) => <AdminHomeScreen {...props} user={user} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen
        name="PendingJobs"
        options={{
          headerBackTitleVisible: false,
          title: "Duy\u1ec7t tin",
        }}
      >
        {(props) => <PendingJobsScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="AdminJobDetail"
        options={{
          headerBackTitleVisible: false,
          title: "Chi ti\u1ebft tin",
        }}
      >
        {(props) => <AdminJobDetailScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="UserManagement"
        options={{
          headerBackTitleVisible: false,
          title: "Qu\u1ea3n l\u00fd t\u00e0i kho\u1ea3n",
        }}
      >
        {(props) => <UserManagementScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="UserDetail"
        options={{
          headerBackTitleVisible: false,
          title: "Chi ti\u1ebft t\u00e0i kho\u1ea3n",
        }}
      >
        {(props) => <UserDetailScreen {...props} user={user} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function RoleNavigator({ user, onLogout }) {
  if (user.role === ROLES.ADMIN) {
    return <AdminNavigator user={user} onLogout={onLogout} />;
  }

  if (user.role === ROLES.EMPLOYER) {
    return <EmployerNavigator user={user} onLogout={onLogout} />;
  }

  return <CandidateNavigator user={user} onLogout={onLogout} />;
}

export default function AppNavigator({ user, onAuthenticated, onLogout }) {
  return (
    <NavigationContainer>
      {user ? (
        <RoleNavigator user={user} onLogout={onLogout} />
      ) : (
        <AuthNavigator onAuthenticated={onAuthenticated} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    alignItems: "stretch",
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: "row",
    position: "relative",
  },
  tabButton: {
    alignItems: "center",
    alignSelf: "stretch",
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
    paddingTop: 0,
    position: "relative",
  },
  tabButtonContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    zIndex: 2,
  },
  tabLabel: {
    color: COLORS.mutedLight,
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  tabLabelActive: {
    color: COLORS.text,
  },
  tabPressOverlay: {
    backgroundColor: "rgba(17, 17, 17, 0.09)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
  },
  tabActiveLine: {
    backgroundColor: COLORS.text,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    height: 2,
    left: 0,
    position: "absolute",
    top: 0,
    zIndex: 3,
  },
});

