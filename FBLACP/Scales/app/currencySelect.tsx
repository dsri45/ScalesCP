import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency, currencies } from '../contexts/CurrencyContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CurrencySelect() {
  const { theme } = useTheme();
  const { setCurrency, isLoadingRate, isApiAvailable } = useCurrency();
  
  const [selectedCurrency, setSelectedCurrency] = useState<{ code: string; symbol: string } | null>(null);
  const [isCheckingApi, setIsCheckingApi] = useState(true);

  // Check API availability when component mounts
  React.useEffect(() => {
    const checkApi = async () => {
      setIsCheckingApi(true);
      // Wait a bit to let the context check complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsCheckingApi(false);
    };
    checkApi();
  }, []);

  const handleSelect = async (currency: { code: string; symbol: string }) => {
    setSelectedCurrency(currency);
    
    try {
      await setCurrency({ code: currency.code, symbol: currency.symbol });
      router.back();
    } catch (error) {
      console.error('Error selecting currency:', error);
      Alert.alert('Error', 'Failed to change currency. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {!isCheckingApi && !isApiAvailable && (
        <View style={[styles.warningBanner, { backgroundColor: '#FFF3CD', borderColor: '#FFEAA7' }]}>
          <Ionicons name="warning-outline" size={20} color="#856404" />
          <Text style={[styles.warningText, { color: '#856404' }]}>
            Real-time exchange rates unavailable. Manual conversion will be required.
          </Text>
        </View>
      )}
      
      {isCheckingApi && (
        <View style={[styles.loadingBanner, { backgroundColor: theme.surface }]}>
          <Ionicons name="refresh" size={20} color={theme.primary} style={styles.loadingIcon} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
            Checking exchange rate availability...
          </Text>
        </View>
      )}
      
      <FlatList
        data={currencies}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, { backgroundColor: theme.surface }]}
            onPress={() => handleSelect(item)}
            disabled={isLoadingRate}
          >
            <View style={styles.itemContent}>
              <Text style={[styles.text, { color: theme.text.primary }]}>
                {item.code} ({item.symbol})
              </Text>
              {isLoadingRate && selectedCurrency?.code === item.code && (
                <Ionicons name="refresh" size={16} color={theme.primary} style={styles.loadingIcon} />
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  text: {
    fontSize: 16,
  },
  warningBanner: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFEAA7',
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    fontSize: 14,
    marginLeft: 8,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIcon: {
    marginLeft: 8,
  },
  loadingBanner: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginLeft: 8,
  },
});
