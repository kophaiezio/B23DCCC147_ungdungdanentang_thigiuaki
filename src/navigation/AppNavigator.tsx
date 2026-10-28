import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import BookDetailScreen from '../screens/BookDetailScreen';
import BookFormScreen from '../screens/BookFormScreen';
import BookListScreen from '../screens/BookListScreen';
import {colors} from '../theme/colors';
import {RootStackParamList} from '../types/book';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="BookList"
        screenOptions={{
          headerStyle: {backgroundColor: colors.surface},
          headerTintColor: colors.primaryDark,
          headerTitleStyle: {fontWeight: '700'},
          contentStyle: {backgroundColor: colors.background},
        }}>
        <Stack.Screen
          name="BookList"
          component={BookListScreen}
          options={{title: 'Quản lý thư viện'}}
        />
        <Stack.Screen
          name="BookDetail"
          component={BookDetailScreen}
          options={{title: 'Chi tiết sách'}}
        />
        <Stack.Screen
          name="BookForm"
          component={BookFormScreen}
          options={({route}) => ({
            title: route.params?.bookId ? 'Chỉnh sửa sách' : 'Thêm sách',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
