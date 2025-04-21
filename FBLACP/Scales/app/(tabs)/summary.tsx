/**
 * Summary Component
 * 
 * This component provides a financial summary view with:
 * - Date range selection
 * - Income/Expense/Balance totals
 * - Transaction list for selected period
 * - PDF export functionality
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, TouchableOpacity, Text, Alert, StyleSheet, ScrollView, Platform, Image, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useTransactions } from '../../contexts/TransactionContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Transaction } from '../../services/database'; 
import TransactionItem from '../../components/TransactionItem';

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
  const [reportGenerated, setReportGenerated] = useState(false);

  const [filteredTotals, setFilteredTotals] = useState<{
    income: number;
    expenses: number;
    balance: number;
  } | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Force a re-render when dates change
  const [reportKey, setReportKey] = useState(0);

  // When dates change, reset the report state
  useEffect(() => {
    // Reset the report when dates change
    setFilteredTotals(null);
    setFilteredTransactions([]);
    setReportGenerated(false);
    console.log("Date range changed - report reset");
  }, [startDate, endDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  // Helper function to normalize dates for comparison (strip time portion)
  const normalizeDate = (date: Date | string): Date => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const calculateTotals = () => {
    // Normalize the start and end dates to ensure consistent comparison
    const normalizedStartDate = normalizeDate(startDate);
    const normalizedEndDate = normalizeDate(endDate);
    
    console.log('Calculating totals with normalized dates:');
    console.log('Normalized Start Date:', normalizedStartDate.toISOString().split('T')[0]);
    console.log('Normalized End Date:', normalizedEndDate.toISOString().split('T')[0]);
    
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = normalizeDate(t.date);
      const isInRange = transactionDate >= normalizedStartDate && transactionDate <= normalizedEndDate;
      
      return isInRange;
    });

    console.log(`Found ${filteredTransactions.length} transactions in date range`);
    
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
    // Initialize with strings to ensure consistent display
    const [tempStartDate, setTempStartDate] = useState<Date>(new Date(new Date().setDate(1)));
    const [tempEndDate, setTempEndDate] = useState<Date>(new Date());
    
    // iOS-specific fix
    const minimumDate = new Date(2000, 0, 1); // January 1, 2000
    
    const onStartChange = (event: any, selectedDate?: Date) => {
      // Prevent invalid dates entirely
      if (event.type === 'dismissed') {
        return;
      }
      
      if (selectedDate) {
        // Force valid date range
        if (selectedDate.getFullYear() < 2000) {
          setTempStartDate(new Date(2000, 0, 1));
        } else {
          setTempStartDate(selectedDate);
        }
      }
    };
  
    const onEndChange = (event: any, selectedDate?: Date) => {
      // Prevent invalid dates entirely
      if (event.type === 'dismissed') {
        return;
      }
      
      if (selectedDate) {
        // Force valid date range
        if (selectedDate.getFullYear() < 2000) {
          setTempEndDate(new Date());
        } else {
          setTempEndDate(selectedDate);
        }
      }
    };

    const confirmStartDate = () => {
      setStartDate(tempStartDate);
      setShowStartPicker(false);
      // Clear previous report when date changes
      setFilteredTotals(null);
      setFilteredTransactions([]);
      setReportGenerated(false);
      setReportKey(prevKey => prevKey + 1);
      console.log("Start date changed to:", tempStartDate);
    };

    const confirmEndDate = () => {
      setEndDate(tempEndDate);
      setShowEndPicker(false);
      // Clear previous report when date changes
      setFilteredTotals(null);
      setFilteredTransactions([]);
      setReportGenerated(false);
      setReportKey(prevKey => prevKey + 1);
      console.log("End date changed to:", tempEndDate);
    };

    const cancelStartPicker = () => {
      setShowStartPicker(false);
    };

    const cancelEndPicker = () => {
      setShowEndPicker(false);
    };
    
    return (
      <View style={[styles.dateRangeContainer, { backgroundColor: theme.surface }]}>
        <View style={styles.datePickerWrapper}>
          <Text style={[styles.dateLabel, { color: theme.text.secondary }]}>From</Text>
          <TouchableOpacity
            style={[styles.dateButton, { 
              backgroundColor: theme.surface,
              flexDirection: 'row',
              alignItems: 'center',
              padding: 15,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.border
            }]}
            onPress={() => {
              // Reset temp date to current valid date
              setTempStartDate(startDate && startDate.getFullYear() > 2000 ? 
                startDate : new Date(new Date().setDate(1)));
              setShowStartPicker(true);
            }}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.primary} style={{marginRight: 8}} />
            <Text style={{ 
              color: theme.text.primary,
              fontSize: 16,
              fontWeight: '500'
            }}>
              {formatDate(startDate)}
            </Text>
          </TouchableOpacity>
        </View>
  
        <View style={styles.datePickerWrapper}>
          <Text style={[styles.dateLabel, { color: theme.text.secondary }]}>To</Text>
          <TouchableOpacity
            style={[styles.dateButton, { 
              backgroundColor: theme.surface,
              flexDirection: 'row',
              alignItems: 'center',
              padding: 15,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.border
            }]}
            onPress={() => {
              // Reset temp date to current valid date
              setTempEndDate(endDate && endDate.getFullYear() > 2000 ? 
                endDate : new Date());
              setShowEndPicker(true);
            }}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.primary} style={{marginRight: 8}} />
            <Text style={{ 
              color: theme.text.primary,
              fontSize: 16,
              fontWeight: '500'
            }}>
              {formatDate(endDate)}
            </Text>
          </TouchableOpacity>
        </View>
  
        {/* Completely new implementation for date pickers that works on both platforms */}
        {showStartPicker && (
          <Modal
            transparent={true}
            visible={showStartPicker}
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: '#FFFFFF' }]}>
                <Text style={[styles.modalTitle, { color: '#000000' }]}>Select Start Date</Text>
                <DateTimePicker
                  value={tempStartDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onStartChange}
                  style={{ width: 300, height: 180 }}
                  minimumDate={minimumDate}
                />
                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#888888' }]}
                    onPress={cancelStartPicker}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.primary }]}
                    onPress={confirmStartDate}
                  >
                    <Text style={styles.modalButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {showEndPicker && (
          <Modal
            transparent={true}
            visible={showEndPicker}
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: '#FFFFFF' }]}>
                <Text style={[styles.modalTitle, { color: '#000000' }]}>Select End Date</Text>
                <DateTimePicker
                  value={tempEndDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onEndChange}
                  maximumDate={new Date()}
                  minimumDate={minimumDate}
                  style={{ width: 300, height: 180 }}
                />
                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#888888' }]}
                    onPress={cancelEndPicker}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: theme.primary }]}
                    onPress={confirmEndDate}
                  >
                    <Text style={styles.modalButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    );
  };

  const handleGenerateReport = () => {
    if (startDate > endDate) {
      Alert.alert(
        "Invalid Date Range",
        "Start date cannot be later than end date. Please select a valid date range.",
        [{ text: "OK" }]
      );
      return;
    }

    // Clear previous report data first to ensure UI refreshes
    setFilteredTotals(null);
    setFilteredTransactions([]);
    
    console.log("Generating new report with date range:", 
      normalizeDate(startDate).toISOString().split('T')[0], 
      "to", 
      normalizeDate(endDate).toISOString().split('T')[0]
    );

    // Debug logs to check date and transaction filtering
    console.log('Start Date:', startDate.toISOString());
    console.log('End Date:', endDate.toISOString());
    console.log('Total Transactions:', transactions.length);
    
    // Normalize the dates for consistent comparison
    const normalizedStartDate = normalizeDate(startDate);
    const normalizedEndDate = normalizeDate(endDate);
    
    console.log('Normalized Start Date:', normalizedStartDate.toISOString());
    console.log('Normalized End Date:', normalizedEndDate.toISOString());

    // Create a completely new array to ensure React detects the change
    let filtered: Transaction[] = [];
    
    transactions.forEach(t => {
      try {
        // Convert transaction date string to Date object and normalize it
        const transactionDate = normalizeDate(t.date);
        
        // Check if in range
        const isInRange = transactionDate >= normalizedStartDate && transactionDate <= normalizedEndDate;
        
        if (isInRange) {
          filtered.push(t);
          console.log(`Added transaction ${t.id}: ${t.title} - ${t.date}`);
        } else {
          console.log(`Skipped transaction ${t.id}: ${t.date} - not in range`);
        }
      } catch (e) {
        console.error(`Error processing transaction ${t.id}:`, e);
      }
    });

    console.log('Filtered Transactions Count:', filtered.length);

    // If no transactions found, try string comparison as fallback
    if (filtered.length === 0 && transactions.length > 0) {
      console.log('Attempting string-based date comparison as fallback');
      
      const sDate = normalizedStartDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const eDate = normalizedEndDate.toISOString().split('T')[0];
      
      filtered = transactions.filter(t => {
        // Extract date part if it's an ISO string
        let tDate = typeof t.date === 'string' ? t.date : new Date(t.date).toISOString();
        if (tDate.includes('T')) {
          tDate = tDate.split('T')[0]; // Extract YYYY-MM-DD part
        }
        
        const isInRange = tDate >= sDate && tDate <= eDate;
        console.log(`String comparison: ${tDate} in range ${sDate}-${eDate}: ${isInRange}`);
        return isInRange;
      });
      
      console.log('String comparison found:', filtered.length, 'transactions');
    }

    // Calculate totals from scratch
    const totals = {
      income: 0,
      expenses: 0,
      balance: 0
    };
    
    filtered.forEach(t => {
      if (t.amount > 0) {
        totals.income += t.amount;
      } else {
        totals.expenses += Math.abs(t.amount);
      }
    });
    
    totals.balance = totals.income - totals.expenses;
    
    console.log('Final filtered transactions:', filtered.length);
    console.log('Calculated Totals:', totals);

    // Update state with completely new objects to ensure React detects changes
    setFilteredTotals({...totals});
    setFilteredTransactions([...filtered]);
    setReportGenerated(true);
    setReportKey(prevKey => prevKey + 1); // Force re-render
  };

  const handleExport = async () => {
    try {
      // Use the normalized date function for consistency
      const normStartDate = normalizeDate(startDate);
      const normEndDate = normalizeDate(endDate);
      
      const dateRange = `${normStartDate.toLocaleDateString()} - ${normEndDate.toLocaleDateString()}`;
      
      // Filter with the same logic as the report generation
      const exportTransactions = transactions.filter(t => {
        const transactionDate = normalizeDate(t.date);
        return transactionDate >= normStartDate && transactionDate <= normEndDate;
      });
      
      // Use the same total calculation logic
      const totals = exportTransactions.reduce((acc, t) => {
        if (t.amount > 0) {
          acc.income += t.amount;
        } else {
          acc.expenses += Math.abs(t.amount);
        }
        acc.balance = acc.income - acc.expenses;
        return acc;
      }, { income: 0, expenses: 0, balance: 0 });
      
      await generateTransactionsPDF({
        transactions: exportTransactions,
        period: dateRange,
        totals,
        currency
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Failed to export PDF');
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      currencyDisplay: 'symbol',
    }).format(Math.abs(amount));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Financial Summary
        </Text>
      </View>
      
      <DateRangeSelector />

      <View style={[styles.buttonContainer, { marginBottom: 20 }]}>
        <Text style={{ color: theme.text.secondary, marginBottom: 8, textAlign: 'center' }}>
          Select a date range above and press the button below to generate your report
        </Text>
        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: theme.primary }]}
          onPress={handleGenerateReport}
        >
          <Text style={styles.generateButtonText}>Generate Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.exportButton, 
            { 
              backgroundColor: filteredTotals ? theme.primary : '#cccccc',
              opacity: filteredTotals ? 1 : 0.7
            }
          ]}
          onPress={handleExport}
          disabled={!filteredTotals}
        >
          <Ionicons name="download-outline" size={24} color="#fff" />
          <Text style={styles.exportButtonText}>Export PDF</Text>
        </TouchableOpacity>
      </View>

      {filteredTotals && (
        <View key={reportKey}>
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
            <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
              Filtered Transactions ({filteredTransactions.length})
            </Text>
            {filteredTransactions.length === 0 ? (
              <Text style={{ color: theme.text.secondary, padding: 16, textAlign: 'center' }}>
                No transactions found in the selected date range
              </Text>
            ) : (
              filteredTransactions.map((t, index) => (
                <TransactionItem
                  key={`${t.id}-${index}`}
                  {...t}
                  receiptImage={t.receiptImage ?? undefined}
                />
              ))
            )}
          </View>
        </View>
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
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  pickerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  doneButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 320,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});