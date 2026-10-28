import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {sampleBooks} from '../data/sampleBooks';
import {Book, BOOK_CATEGORIES} from '../types/book';

const STORAGE_KEY = '@library-manager/books';
const SAMPLE_VERSION_KEY = '@library-manager/sample-version';
const SAMPLE_VERSION = '2';

type LoadStatus = 'loading' | 'ready' | 'error';

interface LibraryContextValue {
  books: Book[];
  status: LoadStatus;
  error: string | null;
  reload: () => Promise<void>;
  saveBook: (book: Book, existingId?: string) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  borrowBook: (bookId: string) => Promise<void>;
  returnBook: (bookId: string) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

function isBook(value: unknown): value is Book {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.author === 'string' &&
    typeof candidate.category === 'string' &&
    BOOK_CATEGORIES.includes(candidate.category as Book['category']) &&
    typeof candidate.year === 'number' &&
    Number.isInteger(candidate.year) &&
    typeof candidate.quantity === 'number' &&
    Number.isInteger(candidate.quantity) &&
    candidate.quantity > 0 &&
    typeof candidate.borrowed === 'number' &&
    Number.isInteger(candidate.borrowed) &&
    candidate.borrowed >= 0 &&
    candidate.borrowed <= candidate.quantity
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.';
}

interface LibraryProviderProps {
  children: ReactNode;
}

export function LibraryProvider({children}: LibraryProviderProps): React.JSX.Element {
  const [books, setBooks] = useState<Book[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const booksRef = useRef<Book[]>([]);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  const reload = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const storedBooks = await AsyncStorage.getItem(STORAGE_KEY);
      let nextBooks: Book[];

      if (storedBooks === null) {
        nextBooks = sampleBooks;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextBooks));
        await AsyncStorage.setItem(SAMPLE_VERSION_KEY, SAMPLE_VERSION);
      } else {
        const parsed: unknown = JSON.parse(storedBooks);
        if (!Array.isArray(parsed) || !parsed.every(isBook)) {
          throw new Error('Dữ liệu sách đã lưu không đúng định dạng.');
        }
        nextBooks = parsed;
        const sampleVersion = await AsyncStorage.getItem(SAMPLE_VERSION_KEY);
        if (sampleVersion !== SAMPLE_VERSION) {
          nextBooks = [
            ...parsed.filter(
              book => !/^sample-\d+$/.test(book.id),
            ),
            ...sampleBooks,
          ];
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextBooks));
          await AsyncStorage.setItem(SAMPLE_VERSION_KEY, SAMPLE_VERSION);
        }
      }

      booksRef.current = nextBooks;
      setBooks(nextBooks);
      setStatus('ready');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const enqueueWrite = useCallback(<T,>(operation: () => Promise<T>): Promise<T> => {
    const result = writeQueue.current.then(operation);
    writeQueue.current = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }, []);

  const commitBooks = useCallback(async (nextBooks: Book[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextBooks));
    booksRef.current = nextBooks;
    setBooks(nextBooks);
  }, []);

  const saveBook = useCallback(
    (book: Book, existingId?: string) =>
      enqueueWrite(async () => {
        const currentBooks = booksRef.current;
        let nextBooks: Book[];

        if (existingId) {
          const currentBook = currentBooks.find(item => item.id === existingId);
          if (!currentBook) {
            throw new Error('Không tìm thấy sách cần chỉnh sửa.');
          }
          if (book.quantity < currentBook.borrowed) {
            throw new Error('Tổng số cuốn không thể ít hơn số cuốn đang được mượn.');
          }
          nextBooks = currentBooks.map(item =>
            item.id === existingId
              ? {...book, id: existingId, borrowed: currentBook.borrowed}
              : item,
          );
        } else {
          nextBooks = [...currentBooks, {...book, borrowed: 0}];
        }

        await commitBooks(nextBooks);
      }),
    [commitBooks, enqueueWrite],
  );

  const deleteBook = useCallback(
    (bookId: string) =>
      enqueueWrite(async () => {
        const currentBook = booksRef.current.find(item => item.id === bookId);
        if (!currentBook) {
          throw new Error('Không tìm thấy sách cần xoá.');
        }
        if (currentBook.borrowed > 0) {
          throw new Error('Sách đang được mượn nên không thể xoá.');
        }
        await commitBooks(booksRef.current.filter(item => item.id !== bookId));
      }),
    [commitBooks, enqueueWrite],
  );

  const updateBorrowed = useCallback(
    (bookId: string, change: 1 | -1) =>
      enqueueWrite(async () => {
        const currentBook = booksRef.current.find(item => item.id === bookId);
        if (!currentBook) {
          throw new Error('Không tìm thấy sách.');
        }
        if (change === 1 && currentBook.borrowed >= currentBook.quantity) {
          throw new Error('Sách đã hết, không thể cho mượn thêm.');
        }
        if (change === -1 && currentBook.borrowed === 0) {
          throw new Error('Hiện không có cuốn sách nào cần nhận trả.');
        }
        const nextBooks = booksRef.current.map(item =>
          item.id === bookId ? {...item, borrowed: item.borrowed + change} : item,
        );
        await commitBooks(nextBooks);
      }),
    [commitBooks, enqueueWrite],
  );

  const borrowBook = useCallback(
    (bookId: string) => updateBorrowed(bookId, 1),
    [updateBorrowed],
  );
  const returnBook = useCallback(
    (bookId: string) => updateBorrowed(bookId, -1),
    [updateBorrowed],
  );

  return (
    <LibraryContext.Provider
      value={{books, status, error, reload, saveBook, deleteBook, borrowBook, returnBook}}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary phải được sử dụng bên trong LibraryProvider.');
  }
  return context;
}
