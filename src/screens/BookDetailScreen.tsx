import React from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import {useLibrary} from '../context/LibraryContext';
import {colors} from '../theme/colors';
import {RootStackParamList} from '../types/book';

type Props = NativeStackScreenProps<RootStackParamList, 'BookDetail'>;

export default function BookDetailScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const {books, borrowBook, returnBook} = useLibrary();
  const book = books.find(item => item.id === route.params.bookId);

  const runBorrowAction = (action: () => Promise<void>, title: string) => {
    if (!book) {
      return;
    }
    action().catch(error => Alert.alert(title, error.message));
  };

  if (!book) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missingBook}>
          <Text style={styles.missingText}>Không tìm thấy sách này.</Text>
          <AppButton title="Quay lại" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const remaining = book.quantity - book.borrowed;

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.bookHeader}>
          <View style={styles.bookMark}>
            <Text style={styles.bookMarkText}>SÁCH</Text>
          </View>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>Tác giả: {book.author}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.category}>{book.category}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <InfoRow label="Năm xuất bản" value={String(book.year)} />
          <InfoRow label="Tổng số cuốn" value={`${book.quantity} cuốn`} />
          <InfoRow label="Đang được mượn" value={`${book.borrowed} cuốn`} />
          <InfoRow
            label="Còn trong thư viện"
            value={remaining === 0 ? 'Hết sách' : `${remaining} cuốn`}
            valueStyle={remaining === 0 ? styles.outOfStock : undefined}
          />
        </View>

        <Text style={styles.sectionTitle}>Mượn và trả sách</Text>
        <Text style={styles.helper}>
          Cập nhật số lượng sách đang được bạn đọc mượn.
        </Text>
        <View style={styles.actionRow}>
          <View style={styles.actionButton}>
            <AppButton
              disabled={remaining === 0}
              title="Cho mượn"
              onPress={() => runBorrowAction(() => borrowBook(book.id), 'Cho mượn sách')}
            />
          </View>
          <View style={styles.actionButton}>
            <AppButton
              disabled={book.borrowed === 0}
              title="Nhận trả"
              variant="secondary"
              onPress={() => runBorrowAction(() => returnBook(book.id), 'Nhận trả sách')}
            />
          </View>
        </View>
        <AppButton
          title="Chỉnh sửa thông tin"
          variant="secondary"
          onPress={() => navigation.navigate('BookForm', {bookId: book.id})}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  valueStyle?: object;
}

function InfoRow({label, value, valueStyle}: InfoRowProps): React.JSX.Element {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 28,
  },
  bookHeader: {
    alignItems: 'center',
    padding: 22,
    borderRadius: 18,
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  bookMark: {
    height: 52,
    width: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginBottom: 12,
  },
  bookMarkText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
  },
  author: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 7,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 13,
  },
  category: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 22,
  },
  infoRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  outOfStock: {
    color: colors.danger,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  helper: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 5,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
  },
  missingBook: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  missingText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
