import React, {useEffect, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import FormField from '../components/FormField';
import {useLibrary} from '../context/LibraryContext';
import {colors} from '../theme/colors';
import {Book, BookCategory, BOOK_CATEGORIES, RootStackParamList} from '../types/book';

type Props = NativeStackScreenProps<RootStackParamList, 'BookForm'>;
type FormFieldName = 'title' | 'author' | 'year' | 'quantity';
type FormErrors = Partial<Record<FormFieldName, string>>;

export default function BookFormScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const {books, saveBook} = useLibrary();
  const existingId = route.params?.bookId;
  const existingBook = books.find(book => book.id === existingId);
  const [title, setTitle] = useState(existingBook?.title ?? '');
  const [author, setAuthor] = useState(existingBook?.author ?? '');
  const [category, setCategory] = useState<BookCategory>(
    existingBook?.category ?? BOOK_CATEGORIES[0],
  );
  const [year, setYear] = useState(
    existingBook ? String(existingBook.year) : String(new Date().getFullYear()),
  );
  const [quantity, setQuantity] = useState(
    existingBook ? String(existingBook.quantity) : '1',
  );
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!existingId) {
      return;
    }
    if (!existingBook) {
      Alert.alert('Không tìm thấy sách', 'Sách cần chỉnh sửa không còn tồn tại.', [
        {text: 'Đóng', onPress: () => navigation.goBack()},
      ]);
    }
  }, [existingBook, existingId, navigation]);

  const updateField = (field: FormFieldName, value: string) => {
    if (field === 'title') {
      setTitle(value);
    } else if (field === 'author') {
      setAuthor(value);
    } else if (field === 'year') {
      setYear(value);
    } else {
      setQuantity(value);
    }
    setErrors(currentErrors => ({...currentErrors, [field]: undefined}));
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    const numericYear = Number(year);
    const numericQuantity = Number(quantity);
    const currentYear = new Date().getFullYear();

    if (!title.trim()) {
      nextErrors.title = 'Vui lòng nhập tên sách.';
    }
    if (!author.trim()) {
      nextErrors.author = 'Vui lòng nhập tên tác giả.';
    }
    if (!/^\d+$/.test(year) || !Number.isInteger(numericYear) || numericYear < 1900 || numericYear > currentYear) {
      nextErrors.year = `Năm xuất bản phải từ 1900 đến ${currentYear}.`;
    }
    if (!/^\d+$/.test(quantity) || !Number.isInteger(numericQuantity) || numericQuantity <= 0) {
      nextErrors.quantity = 'Tổng số cuốn phải là số nguyên lớn hơn 0.';
    } else if (existingBook && numericQuantity < existingBook.borrowed) {
      nextErrors.quantity = `Không thể ít hơn ${existingBook.borrowed} cuốn đang được mượn.`;
    }

    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const book: Book = {
      id: existingBook?.id ?? Date.now().toString(),
      title: title.trim(),
      author: author.trim(),
      category,
      year: Number(year),
      quantity: Number(quantity),
      borrowed: existingBook?.borrowed ?? 0,
    };

    try {
      await saveBook(book, existingId);
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Không thể lưu sách',
        error instanceof Error ? error.message : 'Đã xảy ra lỗi khi lưu sách.',
      );
    }
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoiding}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.intro}>
            {existingBook
              ? 'Cập nhật thông tin cho cuốn sách trong thư viện.'
              : 'Điền thông tin để thêm sách mới vào thư viện.'}
          </Text>
          <FormField
            autoCapitalize="sentences"
            error={errors.title}
            label="Tên sách"
            onChangeText={value => updateField('title', value)}
            placeholder="Nhập tên sách"
            value={title}
          />
          <FormField
            autoCapitalize="words"
            error={errors.author}
            label="Tác giả"
            onChangeText={value => updateField('author', value)}
            placeholder="Nhập tên tác giả"
            value={author}
          />

          <View style={styles.categoryField}>
            <Text style={styles.label}>Thể loại</Text>
            <View style={styles.categoryList}>
              {BOOK_CATEGORIES.map(item => {
                const active = item === category;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{selected: active}}
                    android_ripple={{color: colors.primaryLight}}
                    key={item}
                    onPress={() => setCategory(item)}
                    style={({pressed}) => [
                      styles.categoryButton,
                      active && styles.categoryButtonActive,
                      pressed && styles.pressed,
                    ]}>
                    <Text
                      style={[
                        styles.categoryButtonText,
                        active && styles.categoryButtonTextActive,
                      ]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <FormField
            error={errors.year}
            keyboardType="number-pad"
            label="Năm xuất bản"
            maxLength={4}
            onChangeText={value => updateField('year', value)}
            placeholder="Ví dụ: 2024"
            value={year}
          />
          <FormField
            error={errors.quantity}
            keyboardType="number-pad"
            label="Tổng số cuốn"
            onChangeText={value => updateField('quantity', value)}
            placeholder="Nhập số lượng"
            value={quantity}
          />

          <View style={styles.saveButton}>
            <AppButton
              title={existingBook ? 'Lưu thay đổi' : 'Thêm sách'}
              onPress={handleSave}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  intro: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  categoryField: {
    marginBottom: 17,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 9,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 13,
    paddingVertical: 9,
    overflow: 'hidden',
  },
  categoryButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: colors.white,
  },
  pressed: {
    opacity: 0.8,
  },
  saveButton: {
    marginTop: 4,
  },
});
