import React from 'react';
import {ScrollView, StyleSheet, Text, Pressable} from 'react-native';
import {BookCategory} from '../types/book';
import {colors} from '../theme/colors';

export type BookFilter = 'Tất cả' | BookCategory;

const filters: BookFilter[] = [
  'Tất cả',
  'Giáo trình',
  'Tiểu thuyết',
  'Khoa học',
  'Thiếu nhi',
];

interface FilterButtonsProps {
  selected: BookFilter;
  onSelect: (filter: BookFilter) => void;
}

export default function FilterButtons({
  selected,
  onSelect,
}: FilterButtonsProps): React.JSX.Element {
  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.content}
      showsHorizontalScrollIndicator={false}>
      {filters.map(filter => {
        const active = selected === filter;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{selected: active}}
            android_ripple={{color: colors.primaryLight}}
            key={filter}
            onPress={() => onSelect(filter)}
            style={({pressed}) => [
              styles.button,
              active && styles.activeButton,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.label, active && styles.activeLabel]}>
              {filter}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  activeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  activeLabel: {
    color: colors.white,
  },
  pressed: {
    opacity: 0.8,
  },
});
