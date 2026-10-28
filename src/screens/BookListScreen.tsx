import React, {useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import BookCard from '../components/BookCard';
import BookFilter, {BookFilter as BookFilterType} from '../components/FilterButtons';
import {useLibrary} from '../context/LibraryContext';
import {colors} from '../theme/colors';
import {RootStackParamList} from '../types/book';

type Props = NativeStackScreenProps<RootStackParamList, 'BookList'>;

export default function BookListScreen({navigation}: Props): React.JSX.Element {
  const {books, deleteBook} = useLibrary();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<BookFilterType>('Tất cả');
  const totalBorrowed = books.reduce((total, book) => total + book.borrowed, 0);

  const visibleBooks = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return books.filter(book => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        book.title.toLocaleLowerCase().includes(normalizedSearch) ||
        book.author.toLocaleLowerCase().includes(normalizedSearch);
      const matchesCategory =
        category === 'Tất cả' || book.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [books, category, search]);

  const confirmDelete = (bookId: string) => {
    const book = books.find(item => item.id === bookId);
    if (!book) {
      return;
    }
    if (book.borrowed > 0) {
      Alert.alert(
        'Không thể xoá sách',
        'Sách này đang có người mượn. Hãy nhận trả đủ số sách trước khi xoá.',
      );
      return;
    }

    Alert.alert('Xoá sách', `Bạn có chắc muốn xoá “${book.title}”?`, [
      {text: 'Huỷ', style: 'cancel'},
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: () => {
          deleteBook(bookId).catch(error => {
            Alert.alert('Không thể xoá sách', error.message);
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={visibleBooks}
        keyboardShouldPersistTaps="handled"
        keyExtractor={book => book.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Không tìm thấy sách</Text>
            <Text style={styles.emptyText}>
              Hãy thử từ khoá hoặc bộ lọc khác.
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{books.length}</Text>
                <Text style={styles.summaryLabel}>Đầu sách</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{totalBorrowed}</Text>
                <Text style={styles.summaryLabel}>Cuốn đang mượn</Text>
              </View>
            </View>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                accessibilityLabel="Tìm theo tên sách hoặc tác giả"
                onChangeText={setSearch}
                onSubmitEditing={Keyboard.dismiss}
                placeholder="Tìm tên sách hoặc tác giả"
                placeholderTextColor={colors.disabled}
                returnKeyType="search"
                style={styles.searchInput}
                value={search}
              />
              {search.length > 0 ? (
                <Pressable
                  accessibilityLabel="Xoá nội dung tìm kiếm"
                  onPress={() => setSearch('')}
                  style={styles.clearSearch}>
                  <Text style={styles.clearSearchText}>×</Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.sectionLabel}>Thể loại</Text>
            <BookFilter selected={category} onSelect={setCategory} />
            <View style={styles.listHeading}>
              <Text style={styles.sectionTitle}>Tủ sách</Text>
              <Text style={styles.resultCount}>{visibleBooks.length} sách</Text>
            </View>
          </View>
        }
        renderItem={({item}) => (
          <BookCard
            book={item}
            onLongPress={() => confirmDelete(item.id)}
            onPress={() => navigation.navigate('BookDetail', {bookId: item.id})}
          />
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <AppButton
              title="+ Thêm sách"
              onPress={() => navigation.navigate('BookForm')}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingTop: 14,
    paddingBottom: 22,
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
  },
  summaryNumber: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  searchBox: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 13,
  },
  searchIcon: {
    color: colors.primary,
    fontSize: 24,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 10,
  },
  clearSearch: {
    padding: 3,
  },
  clearSearchText: {
    color: colors.textSecondary,
    fontSize: 22,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 9,
    marginLeft: 2,
  },
  listHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 1,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  resultCount: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
  },
  footer: {
    paddingTop: 10,
  },
});
