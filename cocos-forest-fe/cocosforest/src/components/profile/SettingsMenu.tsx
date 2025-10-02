import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsMenuProps {
  onLogout: () => void;
  onWithdraw: () => void;
}

interface MenuItem {
  id: number;
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  isLogout?: boolean;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onLogout, onWithdraw }) => {
  const settingsMenu: MenuItem[] = [
    { id: 1, title: '알림 설정', iconName: 'notifications-outline' },
    { id: 2, title: '개인정보 보호', iconName: 'shield-checkmark-outline' },
    { id: 3, title: '도움말', iconName: 'help-circle-outline' },
    { id: 4, title: '이용약관', iconName: 'document-text-outline' },
    { id: 5, title: '로그아웃', iconName: 'log-out-outline', isLogout: true }
  ];

  const handleMenuPress = (item: MenuItem) => {
    if (item.isLogout) {
      onLogout();
    }
  };

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>설정</Text>
        {settingsMenu.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.settingItem, item.isLogout && styles.logoutItem]}
            onPress={() => handleMenuPress(item)}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name={item.iconName}
                size={20}
                color={item.isLogout ? '#EF4444' : '#666'}
                style={styles.settingIcon}
              />
              <Text style={[styles.settingText, item.isLogout && styles.logoutText]}>
                {item.title}
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.withdrawSection}>
        <TouchableOpacity
          style={styles.withdrawItem}
          onPress={onWithdraw}
        >
          <Text style={styles.withdrawText}>회원탈퇴</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#000',
  },
  logoutText: {
    color: '#EF4444',
  },
  settingArrow: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  withdrawSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  withdrawItem: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  withdrawText: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },
});

export default SettingsMenu;