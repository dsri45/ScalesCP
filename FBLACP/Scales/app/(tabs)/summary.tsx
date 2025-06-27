import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Text, Alert, StyleSheet, ScrollView, Platform, Image, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useTransactions } from '../../contexts/TransactionContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Transaction } from '../../services/database';
import CategoryBarChart from '../../components/CategoryBarChart';
import SummaryBarChart from '../../components/SummaryBarChart';
import { generatePDFBarChartSVG } from '../../utils/chartUtils';

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
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      currencyDisplay: 'symbol',
    }).format(Math.abs(amount));
    
    // Put negative sign before the currency symbol
    return amount < 0 ? `-${formattedAmount}` : formattedAmount;
  };

  // Process category data for charts
  const expenseCategoryTotals: { [key: string]: number } = {};
  const incomeCategoryTotals: { [key: string]: number } = {};

  transactions.forEach(t => {
    if (t.amount < 0) {
      const category = t.category || 'Uncategorized';
      if (!expenseCategoryTotals[category]) {
        expenseCategoryTotals[category] = 0;
      }
      expenseCategoryTotals[category] += Math.abs(t.amount);
    } else if (t.amount > 0) {
      const category = t.category || 'Uncategorized';
      if (!incomeCategoryTotals[category]) {
        incomeCategoryTotals[category] = 0;
      }
      incomeCategoryTotals[category] += t.amount;
    }
  });

  const sortedExpenseCategories = Object.entries(expenseCategoryTotals)
    .sort(([_, amountA], [__, amountB]) => amountB - amountA)
    .slice(0, 8);

  const sortedIncomeCategories = Object.entries(incomeCategoryTotals)
    .sort(([_, amountA], [__, amountB]) => amountB - amountA)
    .slice(0, 8);

  const expenseChartData = sortedExpenseCategories.map(([category, amount]) => ({
    category,
    amount
  }));

  const incomeChartData = sortedIncomeCategories.map(([category, amount]) => ({
    category,
    amount
  }));

  const expenseChartSvg = generatePDFBarChartSVG(expenseChartData, currency.code);
  const incomeChartSvg = sortedIncomeCategories.length > 0
    ? generatePDFBarChartSVG(incomeChartData, currency.code, true)
    : '';

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
            h2 { color: #333; margin-top: 30px; margin-bottom: 15px; }
            .summary { margin: 20px 0; }
            .total { font-size: 1.2em; margin: 10px 0; }
            .chart-container { 
              text-align: center; 
              margin: 20px 0; 
              page-break-inside: avoid;
              overflow: hidden;
            }
            .chart-container svg {
              max-width: 100%;
              height: auto;
            }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
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
              ${formatAmount(totals.balance)}
            </span></div>
          </div>

          ${incomeChartSvg ? `
          <h2>Income Categories</h2>
          <div class="chart-container">
            ${incomeChartSvg}
          </div>
          ` : ''}

          ${expenseChartSvg ? `
          <h2>Expense Categories</h2>
          <div class="chart-container">
            ${expenseChartSvg}
          </div>
          ` : ''}

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
                    ${formatAmount(t.amount)}
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

export const generateTransactionsCSV = async ({
  transactions,
  period,
  totals,
  currency
}: GeneratePDFProps) => {
  const formatAmount = (amount: number) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      currencyDisplay: 'symbol',
    }).format(Math.abs(amount));
    
    // Put negative sign before the currency symbol
    return amount < 0 ? `-${formattedAmount}` : formattedAmount;
  };

  const formatAmountForCSV = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const formatDateForCSV = (date: Date | string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  try {
    // Create CSV content
    const csvContent = [
      // Header
      ['Financial Summary - ' + period],
      [''],
      // Summary section
      ['Total Income', formatAmountForCSV(totals.income)],
      ['Total Expenses', '-' + formatAmountForCSV(totals.expenses)],
      ['Balance', (totals.balance >= 0 ? '' : '-') + formatAmountForCSV(Math.abs(totals.balance))],
      [''],
      // Transaction details header
      ['Date', 'Title', 'Category', 'Amount'],
      // Transaction rows
      ...transactions.map(t => [
        formatDateForCSV(t.date),
        `"${t.title}"`, // Wrap in quotes to handle commas in titles
        t.category,
        (t.amount >= 0 ? '' : '-') + formatAmountForCSV(Math.abs(t.amount))
      ])
    ].map(row => row.join(',')).join('\n');

    // Create a temporary file with CSV content
    const fileName = `financial_summary_${period.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    // Write CSV content to file
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8
    });

    // Share the CSV file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Financial Summary as CSV',
        UTI: 'public.comma-separated-values-text' // iOS only
      });
    }
  } catch (error) {
    console.error('Error generating CSV:', error);
    Alert.alert('Error', 'Failed to generate CSV');
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
  const [categoryData, setCategoryData] = useState<Array<{
    category: string;
    amount: number;
    type: 'income' | 'expense';
  }>>([]);
  const [summaryChartData, setSummaryChartData] = useState<Array<{
    income: number;
    expenses: number;
  }>>([]);
  
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

    // Process category data for the chart
    const expenseCategoryTotals: { [key: string]: number } = {};
    const incomeCategoryTotals: { [key: string]: number } = {};

    filtered.forEach(t => {
      if (t.amount < 0) {
        const category = t.category || 'Uncategorized';
        if (!expenseCategoryTotals[category]) {
          expenseCategoryTotals[category] = 0;
        }
        expenseCategoryTotals[category] += Math.abs(t.amount);
      } else if (t.amount > 0) {
        const category = t.category || 'Uncategorized';
        if (!incomeCategoryTotals[category]) {
          incomeCategoryTotals[category] = 0;
        }
        incomeCategoryTotals[category] += t.amount;
      }
    });

    const sortedExpenseCategories = Object.entries(expenseCategoryTotals)
      .sort(([_, amountA], [__, amountB]) => amountB - amountA)
      .slice(0, 8);

    const sortedIncomeCategories = Object.entries(incomeCategoryTotals)
      .sort(([_, amountA], [__, amountB]) => amountB - amountA)
      .slice(0, 8);

    const expenseChartData = sortedExpenseCategories.map(([category, amount]) => ({
      category,
      amount
    }));

    const incomeChartData = sortedIncomeCategories.map(([category, amount]) => ({
      category,
      amount
    }));

    const incomeCategoryDataArray = Object.entries(incomeCategoryTotals).map(([category, amount]) => ({
      category,
      amount,
      type: 'income' as const
    }));

    const expenseCategoryDataArray = Object.entries(expenseCategoryTotals).map(([category, amount]) => ({
      category,
      amount,
      type: 'expense' as const
    }));

    const significantIncomeCategories = incomeCategoryDataArray.filter(
      item => item.amount >= (totals.income * 0.01)
    );
    const significantExpenseCategories = expenseCategoryDataArray.filter(
      item => item.amount >= (totals.expenses * 0.01)
    );

    if (incomeCategoryDataArray.length > significantIncomeCategories.length) {
      const otherAmount = incomeCategoryDataArray
        .filter(item => item.amount < (totals.income * 0.01))
        .reduce((sum, item) => sum + item.amount, 0);

      if (otherAmount > 0) {
        significantIncomeCategories.push({
          category: 'Other Income',
          amount: otherAmount,
          type: 'income' as const
        });
      }
    }

    if (expenseCategoryDataArray.length > significantExpenseCategories.length) {
      const otherAmount = expenseCategoryDataArray
        .filter(item => item.amount < (totals.expenses * 0.01))
        .reduce((sum, item) => sum + item.amount, 0);

      if (otherAmount > 0) {
        significantExpenseCategories.push({
          category: 'Other Expenses',
          amount: otherAmount,
          type: 'expense' as const
        });
      }
    }

    setCategoryData([...significantIncomeCategories, ...significantExpenseCategories]);

    // Process summary chart data (daily breakdown)
    const daysDiff = Math.ceil((normalizedEndDate.getTime() - normalizedStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const summaryData: Array<{ income: number; expenses: number }> = [];
    
    if (daysDiff <= 31) {
      // Daily breakdown for up to 31 days
      for (let i = 0; i <= daysDiff; i++) {
        const currentDate = new Date(normalizedStartDate);
        currentDate.setDate(currentDate.getDate() + i);
        
        const dayTransactions = filtered.filter(t => {
          const transactionDate = normalizeDate(t.date);
          return transactionDate.getTime() === currentDate.getTime();
        });
        
        const dayTotals = dayTransactions.reduce((acc, t) => {
          if (t.amount > 0) {
            acc.income += t.amount;
          } else {
            acc.expenses += Math.abs(t.amount);
          }
          return acc;
        }, { income: 0, expenses: 0 });
        
        summaryData.push(dayTotals);
      }
    } else {
      // Weekly breakdown for longer periods
      const weeksDiff = Math.ceil(daysDiff / 7);
      for (let i = 0; i < weeksDiff; i++) {
        const weekStart = new Date(normalizedStartDate);
        weekStart.setDate(weekStart.getDate() + (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekTransactions = filtered.filter(t => {
          const transactionDate = normalizeDate(t.date);
          return transactionDate >= weekStart && transactionDate <= weekEnd;
        });
        
        const weekTotals = weekTransactions.reduce((acc, t) => {
          if (t.amount > 0) {
            acc.income += t.amount;
          } else {
            acc.expenses += Math.abs(t.amount);
          }
          return acc;
        }, { income: 0, expenses: 0 });
        
        summaryData.push(weekTotals);
      }
    }
    
    setSummaryChartData(summaryData);

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

  const handleExportCSV = async () => {
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
      
      await generateTransactionsCSV({
        transactions: exportTransactions,
        period: dateRange,
        totals,
        currency
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export CSV');
    }
  };

  const formatAmount = (amount: number) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      currencyDisplay: 'symbol',
    }).format(Math.abs(amount));
    
    // Put negative sign before the currency symbol
    return amount < 0 ? `-${formattedAmount}` : formattedAmount;
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

        <TouchableOpacity
          style={[
            styles.exportButton, 
            { 
              backgroundColor: filteredTotals ? theme.primary : '#cccccc',
              opacity: filteredTotals ? 1 : 0.7
            }
          ]}
          onPress={handleExportCSV}
          disabled={!filteredTotals}
        >
          <Ionicons name="document-text-outline" size={24} color="#fff" />
          <Text style={styles.exportButtonText}>Export CSV</Text>
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
                {formatAmount(filteredTotals.balance)}
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
                <View key={`${t.id}-${index}`} style={styles.transactionItem}>
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
                      {formatAmount(t.amount)}
                    </Text>
                    <Text style={[styles.transactionDate, { color: theme.text.secondary }]}>
                      {new Date(t.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {categoryData.length > 0 && (
            <CategoryBarChart 
              data={categoryData} 
              period={`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
            />
          )}

          {summaryChartData.length > 0 && (
            <SummaryBarChart 
              data={summaryChartData} 
              period={`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
            />
          )}
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