import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  MapPin,
  Plus,
  Star,
  Pencil,
  Trash2,
  X,
  Phone,
  User,
  Home,
} from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface Address {
  id: string;
  label: string;
  recipientName: string;
  street: string;
  city: string;
  phone: string;
  isDefault: boolean;
}

const initialAddresses: Address[] = [
  {
    id: '1',
    label: 'Home',
    recipientName: 'Jean Pierre',
    street: '12 Rue Capois',
    city: 'Port-au-Prince',
    phone: '+509 3456 7890',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    recipientName: 'Jean Pierre',
    street: '45 Avenue John Brown',
    city: 'Cap-Haitien',
    phone: '+509 4567 8901',
    isDefault: false,
  },
];

export default function AddressesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, fonts, spacing, borderRadius, shadows, card } = useTheme();

  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [formLabel, setFormLabel] = useState('');
  const [formRecipient, setFormRecipient] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formPhone, setFormPhone] = useState('');

  const resetForm = () => {
    setFormLabel('');
    setFormRecipient('');
    setFormStreet('');
    setFormCity('');
    setFormPhone('');
    setEditingAddress(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setFormLabel(address.label);
    setFormRecipient(address.recipientName);
    setFormStreet(address.street);
    setFormCity(address.city);
    setFormPhone(address.phone);
    setModalVisible(true);
  };

  const handleSaveAddress = () => {
    if (!formLabel.trim() || !formRecipient.trim() || !formStreet.trim() || !formCity.trim()) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingAddress.id
            ? {
                ...addr,
                label: formLabel.trim(),
                recipientName: formRecipient.trim(),
                street: formStreet.trim(),
                city: formCity.trim(),
                phone: formPhone.trim(),
              }
            : addr
        )
      );
    } else {
      const newAddress: Address = {
        id: Date.now().toString(),
        label: formLabel.trim(),
        recipientName: formRecipient.trim(),
        street: formStreet.trim(),
        city: formCity.trim(),
        phone: formPhone.trim(),
        isDefault: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, newAddress]);
    }

    setModalVisible(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(t.common.delete, '', [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          setAddresses((prev) => prev.filter((addr) => addr.id !== id));
        },
      },
    ]);
  };

  const handleSetDefault = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const themedStyles = useMemo(() => ({
    screen: { backgroundColor: colors.background },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.gray[100],
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    headerTitle: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.gray[900] },
    subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.gray[500], marginBottom: spacing.xl },
    emptyCard: {
      backgroundColor: card.backgroundColor,
      borderRadius: borderRadius.xl,
      padding: spacing['3xl'],
      alignItems: 'center' as const,
      marginBottom: spacing.xl,
      ...shadows.md,
    },
    emptyIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.gray[100],
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: spacing.lg,
    },
    emptyTitle: { fontFamily: fonts.headingSemiBold, fontSize: 16, color: colors.gray[800], marginBottom: spacing.xs },
    emptyDesc: { fontFamily: fonts.regular, fontSize: 13, color: colors.gray[400], textAlign: 'center' as const },
    addressCard: {
      backgroundColor: card.backgroundColor,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    addressIconCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary[50],
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginRight: spacing.sm,
    },
    addressLabel: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.gray[900], flex: 1 },
    defaultBadge: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.yellow[50],
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      gap: 4,
    },
    defaultBadgeText: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.yellow[600] },
    addressText: { fontFamily: fonts.regular, fontSize: 14, color: colors.gray[600], flex: 1 },
    addressActions: {
      flexDirection: 'row' as const,
      borderTopWidth: 1,
      borderTopColor: colors.gray[100],
      paddingTop: spacing.md,
      gap: spacing.lg,
    },
    actionButtonText: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary[600] },
    actionButtonTextYellow: { fontFamily: fonts.medium, fontSize: 13, color: colors.yellow[600] },
    actionButtonTextRed: { fontFamily: fonts.medium, fontSize: 13, color: colors.red[500] },
    addButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: colors.primary[600],
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md + 2,
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    addButtonText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.white },
    modalContent: {
      backgroundColor: card.backgroundColor,
      borderTopLeftRadius: borderRadius['2xl'],
      borderTopRightRadius: borderRadius['2xl'],
      padding: spacing.xl,
      maxHeight: '85%' as const,
    },
    modalTitle: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.gray[900] },
    modalInputLabel: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.gray[700], marginBottom: spacing.sm },
    modalInput: {
      backgroundColor: colors.gray[50],
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: card.borderColor,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md + 2,
      fontSize: 15,
      fontFamily: fonts.regular,
      color: colors.gray[900],
    },
    modalCancelButton: {
      flex: 1,
      backgroundColor: colors.gray[100],
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md + 2,
      alignItems: 'center' as const,
    },
    modalCancelText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.gray[700] },
    modalSaveButton: {
      flex: 1,
      backgroundColor: colors.primary[600],
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md + 2,
      alignItems: 'center' as const,
    },
    modalSaveText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.white },
  }), [colors, fonts, spacing, borderRadius, shadows]);

  return (
    <View style={[styles.screen, themedStyles.screen, { paddingTop: insets.top }]}>
      <Animated.View
        entering={FadeInDown.duration(400).springify().damping(18)}
        style={styles.header}
      >
        <TouchableOpacity
          style={themedStyles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.gray[800]} />
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle}>{t.profile.addresses.title}</Text>
        <View style={themedStyles.backButton} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          entering={FadeInDown.delay(80).duration(400).springify().damping(18)}
        >
          <Text style={themedStyles.subtitle}>{t.profile.addresses.subtitle}</Text>
        </Animated.View>

        {addresses.length === 0 ? (
          <Animated.View
            entering={FadeInDown.delay(150).duration(500).springify().damping(18)}
            style={themedStyles.emptyCard}
          >
            <View style={themedStyles.emptyIconCircle}>
              <MapPin size={32} color={colors.gray[400]} />
            </View>
            <Text style={themedStyles.emptyTitle}>{t.profile.addresses.empty}</Text>
            <Text style={themedStyles.emptyDesc}>{t.profile.addresses.emptyDesc}</Text>
          </Animated.View>
        ) : (
          addresses.map((address, index) => (
            <Animated.View
              key={address.id}
              entering={FadeInDown.delay(100 + index * 80)
                .duration(500)
                .springify()
                .damping(18)}
              style={themedStyles.addressCard}
            >
              <View style={styles.addressHeader}>
                <View style={styles.addressLabelRow}>
                  <View style={themedStyles.addressIconCircle}>
                    <Home size={16} color={colors.primary[600]} />
                  </View>
                  <Text style={themedStyles.addressLabel}>{address.label}</Text>
                  {address.isDefault && (
                    <View style={themedStyles.defaultBadge}>
                      <Star size={10} color={colors.yellow[600]} />
                      <Text style={themedStyles.defaultBadgeText}>
                        {t.profile.addresses.defaultBadge}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.addressBody}>
                <View style={styles.addressRow}>
                  <User size={14} color={colors.gray[400]} />
                  <Text style={themedStyles.addressText}>{address.recipientName}</Text>
                </View>
                <View style={styles.addressRow}>
                  <MapPin size={14} color={colors.gray[400]} />
                  <Text style={themedStyles.addressText}>
                    {address.street}, {address.city}
                  </Text>
                </View>
                {address.phone ? (
                  <View style={styles.addressRow}>
                    <Phone size={14} color={colors.gray[400]} />
                    <Text style={themedStyles.addressText}>{address.phone}</Text>
                  </View>
                ) : null}
              </View>

              <View style={themedStyles.addressActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openEditModal(address)}
                  activeOpacity={0.7}
                >
                  <Pencil size={14} color={colors.primary[600]} />
                  <Text style={themedStyles.actionButtonText}>
                    {t.profile.addresses.edit}
                  </Text>
                </TouchableOpacity>
                {!address.isDefault && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetDefault(address.id)}
                    activeOpacity={0.7}
                  >
                    <Star size={14} color={colors.yellow[600]} />
                    <Text style={themedStyles.actionButtonTextYellow}>
                      {t.profile.addresses.setDefault}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(address.id)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color={colors.red[500]} />
                  <Text style={themedStyles.actionButtonTextRed}>
                    {t.profile.addresses.delete}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        )}

        <Animated.View
          entering={FadeInDown.delay(300).duration(500).springify().damping(18)}
        >
          <TouchableOpacity
            style={themedStyles.addButton}
            onPress={openAddModal}
            activeOpacity={0.8}
          >
            <Plus size={18} color={colors.white} />
            <Text style={themedStyles.addButtonText}>
              {t.profile.addresses.addAddress}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={themedStyles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={themedStyles.modalTitle}>
                {editingAddress
                  ? t.profile.addresses.editAddress
                  : t.profile.addresses.addAddress}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                activeOpacity={0.7}
              >
                <X size={22} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalInputGroup}>
                <Text style={themedStyles.modalInputLabel}>
                  {t.profile.addresses.addressLabel}
                </Text>
                <TextInput
                  style={themedStyles.modalInput}
                  value={formLabel}
                  onChangeText={setFormLabel}
                  placeholder={t.profile.addresses.addressLabelPlaceholder}
                  placeholderTextColor={colors.gray[400]}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={themedStyles.modalInputLabel}>
                  {t.profile.addresses.recipientName}
                </Text>
                <TextInput
                  style={themedStyles.modalInput}
                  value={formRecipient}
                  onChangeText={setFormRecipient}
                  placeholder={t.profile.addresses.recipientName}
                  placeholderTextColor={colors.gray[400]}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={themedStyles.modalInputLabel}>
                  {t.profile.addresses.street}
                </Text>
                <TextInput
                  style={themedStyles.modalInput}
                  value={formStreet}
                  onChangeText={setFormStreet}
                  placeholder={t.profile.addresses.streetPlaceholder}
                  placeholderTextColor={colors.gray[400]}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={themedStyles.modalInputLabel}>
                  {t.profile.addresses.city}
                </Text>
                <TextInput
                  style={themedStyles.modalInput}
                  value={formCity}
                  onChangeText={setFormCity}
                  placeholder={t.profile.addresses.city}
                  placeholderTextColor={colors.gray[400]}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={themedStyles.modalInputLabel}>
                  {t.profile.addresses.phone}
                </Text>
                <TextInput
                  style={themedStyles.modalInput}
                  value={formPhone}
                  onChangeText={setFormPhone}
                  placeholder="+509 0000 0000"
                  placeholderTextColor={colors.gray[400]}
                  keyboardType="phone-pad"
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={themedStyles.modalCancelButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                activeOpacity={0.7}
              >
                <Text style={themedStyles.modalCancelText}>
                  {t.profile.addresses.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={themedStyles.modalSaveButton}
                onPress={handleSaveAddress}
                activeOpacity={0.8}
              >
                <Text style={themedStyles.modalSaveText}>
                  {editingAddress
                    ? t.profile.addresses.modify
                    : t.profile.addresses.add}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  addressHeader: {
    marginBottom: 12,
  },
  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressBody: {
    marginBottom: 12,
    gap: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalInputGroup: {
    marginBottom: 16,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
