import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Text, Alert, StyleSheet, ScrollView, Platform, Image } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useTransactions } from '../../contexts/TransactionContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Transaction } from '../../services/database'; 

interface GeneratePDFProps {
  transactions: Transaction[];
  period: string;
  totals: {
    income: number;
    expenses: number;
    balance: number;
  };
  currency: {
    symbol: string;
    code: string;
  };
}

export const generateTransactionsPDF = async ({
  transactions,
  period,
  totals,
  currency
}: GeneratePDFProps) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      currencyDisplay: 'symbol',
    }).format(Math.abs(amount));
  };

  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Financial Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .summary { margin: 20px 0; }
            .total { font-size: 1.2em; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .positive { color: #4CAF50; }
            .negative { color: #F44336; }
          </style>
        </head>
        <body>
          <h1>Financial Summary - ${period}</h1>
          
          <div class="summary">
            <div class="total">Total Income: <span class="positive">${formatAmount(totals.income)}</span></div>
            <div class="total">Total Expenses: <span class="negative">${formatAmount(totals.expenses)}</span></div>
            <div class="total">Balance: <span class="${totals.balance >= 0 ? 'positive' : 'negative'}">
              ${totals.balance >= 0 ? '' : '-'}${formatAmount(Math.abs(totals.balance))}
            </span></div>
          </div>

          <h2>Transaction Details</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(t => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString()}</td>
                  <td>${t.title}</td>
                  <td>${t.category}</td>
                  <td class="${t.amount >= 0 ? 'positive' : 'negative'}">
                    ${t.amount >= 0 ? '' : '-'}${formatAmount(Math.abs(t.amount))}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Generate PDF file
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false
    });

    // Share the PDF file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Export Financial Summary',
        UTI: 'com.adobe.pdf' // iOS only
      });
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    Alert.alert('Error', 'Failed to generate PDF');
    throw error;
  }
};

export default function Summary() {
  const { theme } = useTheme();
  const { transactions } = useTransactions();
  const { currency } = useCurrency();
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(1))); // First day of current month
  const [endDate, setEndDate] = useState(new Date()); // Today
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  const [filteredTotals, setFilteredTotals] = useState<{
    income: number;
    expenses: number;
    balance: number;
  } | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const calculateTotals = () => {
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    return filteredTransactions.reduce((acc, t) => {
      if (t.amount > 0) {
        acc.income += t.amount;
      } else {
        acc.expenses += Math.abs(t.amount);
      }
      acc.balance = acc.income - acc.expenses;
      return acc;
    }, { income: 0, expenses: 0, balance: 0 });
  };

  const handleStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const DateRangeSelector = () => {
    const onStartChange = (event: any, selectedDate?: Date) => {
      const currentDate = selectedDate || startDate;
      if (Platform.OS === 'android') {
        setShowStartPicker(false);
      }
      if (selectedDate) {
        setStartDate(currentDate);
      }
    };
  
    const onEndChange = (event: any, selectedDate?: Date) => {
      const currentDate = selectedDate || endDate;
      if (Platform.OS === 'android') {
        setShowEndPicker(false);
      }
      if (selectedDate) {
        setEndDate(currentDate);
      }
    };
  
    return (
      <View style={[styles.dateRangeContainer, { backgroundColor: theme.surface }]}>
        <View style={styles.datePickerWrapper}>
          <Text style={[styles.dateLabel, { color: theme.text.secondary }]}>From</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.background }]}
            onPress={() => setShowStartPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.text.primary} />
            <Text style={[styles.dateButtonText, { color: theme.text.primary }]}>
              {formatDate(startDate)}
            </Text>
          </TouchableOpacity>
        </View>
  
        <View style={styles.datePickerWrapper}>
          <Text style={[styles.dateLabel, { color: theme.text.secondary }]}>To</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.background }]}
            onPress={() => setShowEndPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.text.primary} />
            <Text style={[styles.dateButtonText, { color: theme.text.primary }]}>
              {formatDate(endDate)}
            </Text>
          </TouchableOpacity>
        </View>
  
        {Platform.OS === 'ios' ? (
          <>
            {showStartPicker && (
              <View style={[styles.pickerContainer, { backgroundColor: theme.surface }]}>
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="inline"
                  onChange={onStartChange}
                  maximumDate={endDate}
                />
                <TouchableOpacity
                  style={[styles.doneButton, { backgroundColor: theme.primary }]}
                  onPress={() => setShowStartPicker(false)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
            {showEndPicker && (
              <View style={[styles.pickerContainer, { backgroundColor: theme.surface }]}>
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="inline"
                  onChange={onEndChange}
                  minimumDate={startDate}
                  maximumDate={new Date()}
                />
                <TouchableOpacity
                  style={[styles.doneButton, { backgroundColor: theme.primary }]}
                  onPress={() => setShowEndPicker(false)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={onStartChange}
                maximumDate={endDate}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={onEndChange}
                minimumDate={startDate}
                maximumDate={new Date()}
              />
            )}
          </>
        )}
      </View>
    );
  };

  const handleExport = async () => {
    try {
      const totals = calculateTotals();
      const dateRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      await generateTransactionsPDF({
        transactions: transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= startDate && transactionDate <= endDate;
        }),
        period: dateRange,
        totals,
        currency
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Failed to export PDF');
    }
  };

  const handleGenerateReport = () => {
    const filtered = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const totals = filtered.reduce((acc, t) => {
      if (t.amount > 0) {
        acc.income += t.amount;
      } else {
        acc.expenses += Math.abs(t.amount);
      }
      acc.balance = acc.income - acc.expenses;
      return acc;
    }, { income: 0, expenses: 0, balance: 0 });

    setFilteredTotals(totals);
    setFilteredTransactions(filtered);
  };

  const totals = calculateTotals();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      currencyDisplay: 'symbol',
    }).format(Math.abs(amount));
  };

  const refreshGifAnimation = () => {
    setImageKey(prev => prev + 1);
  };

  useEffect(() => {
    // No animation in summary view
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Financial Summary
        </Text>
      </View>
      
      <DateRangeSelector />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: theme.primary }]}
          onPress={handleGenerateReport}
        >
          <Text style={styles.generateButtonText}>Generate Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: theme.primary }]}
          onPress={handleExport}
        >
          <Ionicons name="download-outline" size={24} color="#fff" />
          <Text style={styles.exportButtonText}>Export PDF</Text>
        </TouchableOpacity>
      </View>

      {filteredTotals && (
        <>
          <View style={[styles.summaryCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
              Summary for {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </Text>
            
            <View style={styles.totalItem}>
              <Text style={[styles.totalLabel, { color: theme.text.secondary }]}>Total Income</Text>
              <Text style={[styles.totalAmount, { color: '#4CAF50' }]}>
                {formatAmount(filteredTotals.income)}
              </Text>
            </View>

            <View style={styles.totalItem}>
              <Text style={[styles.totalLabel, { color: theme.text.secondary }]}>Total Expenses</Text>
              <Text style={[styles.totalAmount, { color: '#F44336' }]}>
                {formatAmount(filteredTotals.expenses)}
              </Text>
            </View>

            <View style={[styles.totalItem, styles.balanceItem]}>
              <Text style={[styles.totalLabel, { color: theme.text.secondary }]}>Balance</Text>
              <Text style={[styles.totalAmount, { 
                color: filteredTotals.balance >= 0 ? '#4CAF50' : '#F44336' 
              }]}>
                {filteredTotals.balance >= 0 ? '' : '-'}
                {formatAmount(Math.abs(filteredTotals.balance))}
              </Text>
            </View>
          </View>

          <View style={[styles.transactionsCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.text.primary }]}>Filtered Transactions</Text>
            {filteredTransactions.map((t, index) => (
              <View key={index} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <Text style={[styles.transactionTitle, { color: theme.text.primary }]}>
                    {t.title}
                  </Text>
                  <Text style={[styles.transactionCategory, { color: theme.text.secondary }]}>
                    {t.category}
                  </Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[styles.transactionAmount, { 
                    color: t.amount >= 0 ? '#4CAF50' : '#F44336' 
                  }]}>
                    {t.amount >= 0 ? '' : '-'}
                    {formatAmount(Math.abs(t.amount))}
                  </Text>
                  <Text style={[styles.transactionDate, { color: theme.text.secondary }]}>
                    {new Date(t.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  datePickerWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginTop: 4,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  totalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceItem: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  totalLabel: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  transactionsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
  },
  pickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderRadius: 12,
    zIndex: 1000,
  },
  doneButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  buttonContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },

  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});