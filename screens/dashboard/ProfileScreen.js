import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Icon from '@expo/vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';
import { colors, shadows } from '../../styles/colors';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const ProfileScreen = () => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    promo: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.fullName || user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    const res = await updateProfile(formData);
    if (res.success) {
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } else {
      Alert.alert('Error', res.error || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.avatarLarge}
          >
            <Text style={styles.avatarText}>{formData.name?.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          {isEditing && (
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Icon name="camera" size={16} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.userNameHeader}>{user?.name || 'User'}</Text>
        <Text style={styles.userSince}>Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</Text>
      </View>

      <View style={styles.formSection}>
        <Input
          label="Full Name"
          value={formData.name}
          onChangeText={(txt) => setFormData({ ...formData, name: txt })}
          editable={isEditing}
          leftIcon="user"
          containerStyle={styles.inputSpacing}
        />
        <Input
          label="Email Address"
          value={formData.email}
          onChangeText={(txt) => setFormData({ ...formData, email: txt })}
          editable={false} // Email usually not editable directly
          leftIcon="mail"
          containerStyle={styles.inputSpacing}
        />
        <Input
          label="Phone Number"
          value={formData.phone}
          onChangeText={(txt) => setFormData({ ...formData, phone: txt })}
          editable={isEditing}
          leftIcon="phone"
          containerStyle={styles.inputSpacing}
          keyboardType="phone-pad"
        />
        
        {isEditing ? (
          <View style={styles.actionRow}>
            <Button 
                title="Cancel" 
                variant="outline" 
                onPress={() => setIsEditing(false)} 
                style={styles.halfBtn} 
            />
            <Button 
                title="Save Changes" 
                onPress={handleSave} 
                style={styles.halfBtn} 
            />
          </View>
        ) : (
          <Button 
            title="Edit Profile" 
            variant="outline" 
            onPress={() => setIsEditing(true)} 
            icon="edit-3"
            style={styles.editBtn}
          />
        )}
      </View>
    </View>
  );

  const renderSecurityTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.securityWarning}>
        <Icon name="shield" size={24} color={colors.warning} />
        <Text style={styles.securityWarningText}>
          Verification required for sensitive changes.
        </Text>
      </View>

      <View style={styles.formSection}>
        <Input label="Current Password" secureTextEntry placeholder="••••••••" leftIcon="lock" />
        <Input label="New Password" secureTextEntry placeholder="••••••••" leftIcon="lock" />
        <Input label="Confirm New Password" secureTextEntry placeholder="••••••••" leftIcon="lock" />
        <Button title="Update Password" onPress={() => {}} style={styles.updateBtn} />
      </View>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingTextContent}>
          <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
          <Text style={styles.settingSub}>Add an extra layer of security</Text>
        </View>
        <Icon name="chevron-right" size={20} color={colors.gray[400]} />
      </TouchableOpacity>
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.notificationGroup}>
        <View style={styles.switchItem}>
          <View style={styles.switchText}>
            <Text style={styles.switchLabel}>Email Notifications</Text>
            <Text style={styles.switchSub}>Booking confirmations and updates</Text>
          </View>
          <Switch
            value={notifications.email}
            onValueChange={(val) => setNotifications({ ...notifications, email: val })}
            trackColor={{ false: colors.gray[200], true: colors.primaryLight }}
            thumbColor={notifications.email ? colors.primary : '#F4F4F4'}
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchText}>
            <Text style={styles.switchLabel}>SMS Notifications</Text>
            <Text style={styles.switchSub}>Real-time trip updates via SMS</Text>
          </View>
          <Switch
            value={notifications.sms}
            onValueChange={(val) => setNotifications({ ...notifications, sms: val })}
            trackColor={{ false: colors.gray[200], true: colors.primaryLight }}
            thumbColor={notifications.sms ? colors.primary : '#F4F4F4'}
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchText}>
            <Text style={styles.switchLabel}>Promotional Offers</Text>
            <Text style={styles.switchSub}>Deals, discounts and travel news</Text>
          </View>
          <Switch
            value={notifications.promo}
            onValueChange={(val) => setNotifications({ ...notifications, promo: val })}
            trackColor={{ false: colors.gray[200], true: colors.primaryLight }}
            thumbColor={notifications.promo ? colors.primary : '#F4F4F4'}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header - Flush with top */}
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.headerArea}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <SafeAreaView edges={['top']}>
              <View style={styles.header}>
                <Text style={styles.title}>My Profile</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Icon name="log-out" size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </LinearGradient>

          <View style={styles.tabsContainer}>
            {[
              { id: 'profile', label: 'Profile', icon: 'user' },
              { id: 'security', label: 'Security', icon: 'shield' },
              { id: 'notifications', label: 'Alerts', icon: 'bell' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => {
                    setActiveTab(tab.id);
                    setIsEditing(false);
                }}
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              >
                <Icon
                  name={tab.icon}
                  size={16}
                  color={activeTab === tab.id ? colors.primary : colors.gray[400]}
                />
                <Text
                  style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}

          <View style={styles.footerSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  headerArea: {
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 6,
    marginTop: -28, // Offset up
    marginBottom: 24,
    ...shadows.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 15,
  },
  activeTab: {
    backgroundColor: colors.primaryGhost,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[400],
    marginLeft: 8,
  },
  activeTabText: {
    color: colors.primary,
  },
  tabContent: {
    paddingHorizontal: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.primary,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.gray[900],
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  userNameHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  userSince: {
    fontSize: 14,
    color: colors.gray[400],
    marginTop: 4,
  },
  formSection: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 28,
    ...shadows.md,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  halfBtn: {
    width: '48%',
  },
  editBtn: {
    marginTop: 8,
  },
  securityWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  securityWarningText: {
    fontSize: 13,
    color: '#92400E',
    marginLeft: 12,
    flex: 1,
  },
  updateBtn: {
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 24,
    marginTop: 24,
    ...shadows.sm,
  },
  settingTextContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  settingSub: {
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 2,
  },
  notificationGroup: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 8,
    ...shadows.md,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
  },
  switchText: {
    flex: 1,
    paddingRight: 16,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[800],
  },
  switchSub: {
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 2,
  },
  footerSpacing: {
    height: 100,
  },
});

export default ProfileScreen;
