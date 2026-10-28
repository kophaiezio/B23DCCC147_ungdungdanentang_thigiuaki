import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Book} from '../types/book';
import {colors} from '../theme/colors';

interface BookCardProps {
  book: Book;
  onPress: () => void;
  onLongPress: () => void;
}

export default function BookCard({
  book,
  onPress,
  onLongPress,
}: BookCardProps): React.JSX.Element {
  const remaining = book.quantity - book.borrowed;
  const isOutOfStock = remaining === 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${book.title}, ${book.author}, còn ${remaining} cuốn`}
      android_ripple={{color: colors.primaryLight}}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({pressed}) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.content}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>Tác giả: {book.author}</Text>
        <View style={styles.footer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.category}>{book.category}</Text>
          </View>
          <Text style={[styles.quantity, isOutOfStock && styles.outOfStock]}>
            {isOutOfStock ? 'Hết sách' : `Còn ${remaining} cuốn`}
          </Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#172B25',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
  },
  pressed: {
    opacity: 0.82,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
  },
  author: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  category: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
  },
  quantity: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  outOfStock: {
    color: colors.danger,
  },
  chevron: {
    color: colors.textSecondary,
    fontSize: 26,
    paddingHorizontal: 14,
  },
});
