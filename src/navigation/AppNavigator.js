import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ROLES } from "../constants/appConstants";
import { COLORS } from "../constants/theme";
import { LABELS } from "../constants/labels";
// Admin Screens
import AdminApplicationsScreen from "../screens/admin/AdminApplicationsScreen";
import AdminHomeScreen from "../screens/admin/AdminHomeScreen";
import PendingJobsScreen from "../screens/admin/PendingJobsScreen";
import UserDetailScreen from "../screens/admin/UserDetailScreen";
import UserManagementScreen from "../screens/admin/UserManagementScreen";
import ApplicationsDetailScreen from "../screens/admin/ApplicationsDetailScreen";
import AdminJobDetailScreen from "../screens/admin/AdminJobDetailScreen";
// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
// Candidate Screens
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
// Employer Screens
import ApplicantCVScreen from "../screens/employer/ApplicantCVScreen";
import CompanyProfileScreen from "../screens/employer/CompanyProfileScreen";
import EmployerHomeScreen from "../screens/employer/EmployerHomeScreen";
import EmployerJobDetailScreen from "../screens/employer/EmployerJobDetailScreen";
import EmployerJobFormScreen from "../screens/employer/EmployerJobFormScreen";
import EmployerJobsScreen from "../screens/employer/EmployerJobsScreen";
import JobApplicationsScreen from "../screens/employer/JobApplicationsScreen";
import EmployerApplicationsScreen from "../screens/employer/EmployerApplicationsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- COMPONENTS DÙNG CHUNG CHO TABBAR ---

function AppTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.tabBar, { height: 44 + bottomInset }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = typeof options.title === "string" ? options.title : route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <AppTabBarItem
            key={route.key}
            bottomInset={bottomInset}
            isFocused={isFocused}
            label={label}
            onPress={onPress}
            routeName={route.name}
          />
        );
      })}
    </View>
  );
}

function AppTabBarItem({ bottomInset, isFocused, label, onPress, routeName }) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Bảng tra cứu Icon tổng hợp cho tất cả các vai trò
  const iconNames = {
    // Candidate
    CandidateProfileTab: "person",
    ExploreTab: "home",
    MyJobsTab: "briefcase",
    // Employer
    EmployerHomeTab: "grid",
    EmployerJobsTab: "briefcase",
    EmployerApplicationsTab: "document-attach",
    CompanyProfileTab: "business",
    // Admin
    AdminHomeTab: "grid",
    AdminJobsTab: "document-text",
    AdminUsersTab: "people",
    AdminApplicationsTab: "document-attach",
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, { toValue: 0.8, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
  };

  const baseIcon = iconNames[routeName] || "help-circle";
  const iconName = isFocused ? baseIcon : `${baseIcon}-outline`;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <View style={[styles.tabButtonContent, { paddingBottom: bottomInset, paddingTop: 10 }]}>
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <Ionicons color={isFocused ? COLORS.text : COLORS.mutedLight} name={iconName} size={22} />
        </Animated.View>
        <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
      </View>
    </Pressable>
  );
}

// --- CONFIG OPTIONS ---

const stackScreenOptions = {
  animation: "slide_from_right",
  animationDuration: 110,
  gestureEnabled: true,
  headerStyle: { backgroundColor: COLORS.header },
  headerTintColor: COLORS.surface,
  headerTitleStyle: { fontWeight: "900" },
};

const lightStackScreenOptions = {
  animation: "slide_from_right",
  animationDuration: 110,
  gestureEnabled: true,
  headerShadowVisible: false,
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.text,
  headerTitleStyle: { color: COLORS.text, fontWeight: "700" },
};

// --- NAVIGATORS ---

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
          headerStyle: { backgroundColor: COLORS.surfaceMuted },
          title: "Đăng ký",
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
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneContainerStyle: { backgroundColor: "#F0F2F5" } }}
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

// AdminTabs đã được đồng bộ
function AdminTabs({ user, onLogout }) {
  return (
    <Tab.Navigator
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: COLORS.surface },
        headerShadowVisible: false,
        headerTintColor: COLORS.text,
        headerTitleAlign: "center",
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      <Tab.Screen name="AdminHomeTab" options={{ title: "Tổng quan" }}>
        {(props) => <AdminHomeScreen {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="AdminApplicationsTab" options={{ title: "Đơn ứng tuyển" }}>
        {(props) => <AdminApplicationsScreen {...props} user={user} />}
      </Tab.Screen>
      
      <Tab.Screen name="AdminJobsTab" options={{ title: "Tin tuyển dụng" }}>
        {(props) => <PendingJobsScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="AdminUsersTab" options={{ title: "Tài khoản" }}>
        {(props) => <UserManagementScreen {...props} user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// EmployerTabs đã được đồng bộ
function EmployerTabs({ user, onLogout }) {
  return (
    <Tab.Navigator
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: COLORS.surface },
        headerShadowVisible: false,
        headerTintColor: COLORS.text,
        headerTitleAlign: "center",
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      <Tab.Screen name="EmployerHomeTab" options={{ title: "Tổng quan" }}>
        {(props) => <EmployerHomeScreen {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="EmployerJobsTab" options={{ title: "Tin tuyển dụng" }}>
        {(props) => <EmployerJobsScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="EmployerApplicationsTab" options={{ title: "Đơn ứng tuyển" }}>
        {(props) => <EmployerApplicationsScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="CompanyProfileTab" options={{ title: "Công ty" }}>
        {(props) => <CompanyProfileScreen {...props} user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// --- CÁC NAVIGATOR CHÍNH (Candidate, Employer, Admin) ---

function CandidateNavigator({ user, onLogout }) {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="CandidateTabs" options={{ headerShown: false }}>
        {(props) => <CandidateTabs {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="JobDetail" options={{ headerShown: false }}>
        {(props) => <JobDetailScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="CompanyDetail" options={{ ...lightStackScreenOptions, title: "Chi tiết công ty" }}>
        {(props) => <CompanyDetailScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="Search" options={{ headerShown: false }}>
        {(props) => <SearchScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="SearchResult" options={{ headerShown: false }}>
        {(props) => <SearchResultScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="Apply" options={{ ...lightStackScreenOptions, title: LABELS.screens.apply }}>
        {(props) => <ApplyScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="Settings" options={{ ...lightStackScreenOptions, title: LABELS.screens.settings }}>
        {(props) => <SettingsScreen {...props} user={user} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="EditCandidateProfile" options={{ ...lightStackScreenOptions, title: LABELS.screens.editProfile }}>
        {(props) => <EditCandidateProfileScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="JobPreference" options={{ ...lightStackScreenOptions, title: LABELS.screens.jobPreference }}>
        {(props) => <JobPreferenceScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="CVManagement" options={{ ...lightStackScreenOptions, title: LABELS.screens.cvManagement }}>
        {(props) => <CVManagementScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="CreateCV" options={{ ...lightStackScreenOptions, title: LABELS.screens.createCV }}>
        {(props) => <CreateCVScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="PersonalInfoForm" options={{ ...lightStackScreenOptions, title: LABELS.screens.personalInfo }}>
        {(props) => <PersonalInfoFormScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="ExperienceForm" options={{ ...lightStackScreenOptions, title: LABELS.screens.experience }}>
        {(props) => <ExperienceFormScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="EducationForm" options={{ ...lightStackScreenOptions, title: LABELS.screens.education }}>
        {(props) => <EducationFormScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="SkillForm" options={{ ...lightStackScreenOptions, title: LABELS.screens.skills }}>
        {(props) => <SkillFormScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="CVPreview" options={{ ...lightStackScreenOptions, title: LABELS.screens.cvPreview }}>
        {(props) => <CVPreviewScreen {...props} user={user} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function EmployerNavigator({ user, onLogout }) {
  return (
    <Stack.Navigator screenOptions={lightStackScreenOptions}>
      <Stack.Screen name="EmployerTabs" options={{ headerShown: false }}>
        {(props) => <EmployerTabs {...props} user={user} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen
        name="EmployerJobForm"
        options={({ route }) => ({
          title: route.params?.jobId ? "Sửa tin tuyển dụng" : "Đăng tin tuyển dụng",
        })}
      >
        {(props) => <EmployerJobFormScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="EmployerJobDetail" options={{ headerShown: false }}>
        {(props) => <EmployerJobDetailScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="JobApplications" options={{ title: "Danh sách ứng tuyển" }}>
        {(props) => <JobApplicationsScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="ApplicantCV" options={{ headerShown: false }}>
        {(props) => <ApplicantCVScreen {...props} user={user} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function AdminNavigator({ user, onLogout }) {
  return (
    <Stack.Navigator screenOptions={lightStackScreenOptions}>
      <Stack.Screen name="AdminTabs" options={{ headerShown: false }}>
        {(props) => <AdminTabs {...props} user={user} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="AdminApplicationDetail" options={{ headerShown: false }}>
        {(props) => <ApplicationsDetailScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="AdminJobDetail" options={{ headerShown: false }}>
        {(props) => <AdminJobDetailScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="UserDetail" options={{ headerShown: false }}>
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
    paddingHorizontal: 8,
  },
  tabButton: {
    alignItems: "center",
    alignSelf: "stretch",
    flex: 1,
    justifyContent: "center",
  },
  tabButtonContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
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
});
