import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { Button } from './Button';

interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: EmptyStateAction;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  style,
}: EmptyStateProps) {
  const { colors, fonts, spacing, borderRadius } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: spacing['3xl'], paddingVertical: spacing['5xl'] },
        style,
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          {
            borderRadius: borderRadius.full,
            backgroundColor: colors.primary[50],
            marginBottom: spacing.xl,
          },
        ]}
      >
        {icon}
      </View>

      <Text
        style={[
          styles.title,
          {
            fontFamily: fonts.headingSemiBold,
            color: colors.gray[900],
            marginBottom: spacing.sm,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.description,
          {
            fontFamily: fonts.regular,
            color: colors.gray[500],
          },
        ]}
      >
        {description}
      </Text>

      {action && (
        <View style={{ marginTop: spacing['2xl'] }}>
          <Button
            title={action.label}
            onPress={action.onPress}
            variant="primary"
            size="md"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 0.15,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
