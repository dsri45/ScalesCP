import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency, currencies } from '../contexts/CurrencyContext';
import { router } from 'expo-router';
import CurrencyConversionDialog from '../components/CurrencyConversionDialog';  // Import your dialog component

export default function CurrencySelect() {
  const { theme } = useTheme();
  const { setCurrency } = useCurrency();
  
  const [selectedCurrency, setSelectedCurrency] = useState<{ code: string; symbol: string } | null>(null);
  const [isDialogVisible, setDialogVisible] = useState(false);  // State for controlling the modal visibility

  const handleSelect = (currency: { code: string; symbol: string }) => {
    setSelectedCurrency(currency);
    setDialogVisible(true);  // Show dialog when currency is selected
  };

  const handleConfirm = (rate: number) => {
    // Update the currency with the selected conversion rate
    if (selectedCurrency) {
      setCurrency({ code: selectedCurrency.code, symbol: selectedCurrency.symbol });
      setDialogVisible(false);  // Close the dialog
      router.back();  // Or any other navigation logic
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={currencies}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, { backgroundColor: theme.surface }]}
            onPress={() => handleSelect(item)}
          >
            <Text style={[styles.text, { color: theme.text.primary }]}>
              {item.code} ({item.symbol})
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Currency Conversion Dialog */}
      {selectedCurrency && (
        <CurrencyConversionDialog
          visible={isDialogVisible}
          onClose={() => setDialogVisible(false)}  // Close the dialog when user presses close
          onConfirm={handleConfirm}  // Pass the selected conversion rate
          fromCurrency={selectedCurrency.code}
          toCurrency="USD"  // Or pass the target currency code if needed
        />
      )}
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
});
