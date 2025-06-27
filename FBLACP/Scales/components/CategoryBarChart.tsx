import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, FlatList } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';

const screenWidth = Dimensions.get('window').width;

interface CategoryData {
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

interface CategoryBarChartProps {
  data: CategoryData[];
  period: string;
}

// Define a set of colors for income categories
const INCOME_COLORS = [
  '#4CAF50', // Green
  '#8BC34A', // Light Green
  '#CDDC39', // Lime
  '#00BCD4', // Cyan
  '#009688', // Teal
];

// Define a set of colors for expense categories
const EXPENSE_COLORS = [
  '#F44336', // Red
  '#FF9800', // Orange
  '#E91E63', // Pink
  '#9C27B0', // Purple
  '#673AB7', // Deep Purple
  '#3F51B5', // Indigo
];

interface LegendItemProps {
  title: string;
  value: string;
  color: string;
  isHeader?: boolean;
}

const LegendItem = ({ title, value, color, isHeader = false }: LegendItemProps) => {
  const { theme } = useTheme();
  
  if (isHeader) {
    return (
      <View style={styles.legendHeaderContainer}>
        <Text style={[styles.legendHeaderText, { color: theme.text.primary }]}>
          {title}
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.legendItemContainer}>
      <View style={[styles.legendColorSquare, { backgroundColor: color }]} />
      <View style={styles.legendTextContainer}>
        <Text 
          style={[styles.legendItemText, { color: theme.text.primary }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        <Text style={[styles.legendValueText, { color: theme.text.secondary }]}>
          {value}
        </Text>
      </View>
    </View>
  );
};

// Custom component to handle header + categories layout properly
const LegendSection = ({ title, items }: { title: string, items: LegendItemProps[] }) => {
  return (
    <View style={styles.legendSectionContainer}>
      <LegendItem 
        title={title}
        value=""
        color=""
        isHeader={true}
      />
      <View style={styles.legendSectionGrid}>
        {items.map((item, index) => (
          <LegendItem
            key={`item-${index}`}
            title={item.title}
            value={item.value}
            color={item.color}
          />
        ))}
      </View>
    </View>
  );
};

export default function CategoryBarChart({ data, period }: CategoryBarChartProps) {
  const { theme } = useTheme();
  const { currency } = useCurrency();

  if (data.length === 0) {
    return null;
  }

  const maxAmount = Math.max(...data.map(item => item.amount));

  const formatAmount = (amount: number) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      currencyDisplay: 'symbol',
    }).format(Math.abs(amount));
    
    // Put negative sign before the currency symbol
    return amount < 0 ? `-${formattedAmount}` : formattedAmount;
  };

  // Separate income and expense data
  const incomeData = data.filter(item => item.type === 'income');
  const expenseData = data.filter(item => item.type === 'expense');
  
  // Sort categories by amount (highest first)
  const sortedIncomeData = [...incomeData].sort((a, b) => b.amount - a.amount);
  const sortedExpenseData = [...expenseData].sort((a, b) => b.amount - a.amount);
  
  // Format data for the chart
  const incomeChartData = sortedIncomeData.map((item, index) => ({
    x: item.category,
    y: item.amount,
    fill: INCOME_COLORS[index % INCOME_COLORS.length],
    type: 'income'
  }));
  
  const expenseChartData = sortedExpenseData.map((item, index) => ({
    x: item.category,
    y: item.amount,
    fill: EXPENSE_COLORS[index % EXPENSE_COLORS.length],
    type: 'expense'
  }));
  
  // Combine data for the chart
  const chartData = [...incomeChartData, ...expenseChartData];
  
  // Prepare legend items for income categories
  const incomeItems = sortedIncomeData.map((item, index) => ({
    title: item.category,
    value: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(item.amount),
    color: INCOME_COLORS[index % INCOME_COLORS.length]
  }));
  
  // Prepare legend items for expense categories
  const expenseItems = sortedExpenseData.map((item, index) => ({
    title: item.category,
    value: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(item.amount),
    color: EXPENSE_COLORS[index % EXPENSE_COLORS.length]
  }));
  
  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        Financial Categories: {period}
      </Text>
      
      <View style={styles.chartContainer}>
        <VictoryChart
          width={screenWidth * 0.85}
          height={300}
          domainPadding={{ x: 20 }}
          padding={{ top: 20, bottom: 30, left: 60, right: 20 }}
          theme={VictoryTheme.material}
          domain={{ y: [0, maxAmount * 1.1] }}
        >
          <VictoryAxis
            tickFormat={(t) => ''}
            style={{
              axis: { stroke: theme.text.secondary },
              ticks: { stroke: 'transparent' }
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(x) => `$${Math.round(x)}`}
            style={{
              axis: { stroke: theme.text.secondary },
              ticks: { stroke: theme.text.secondary, size: 5 },
              tickLabels: { fill: theme.text.secondary, fontSize: 10 }
            }}
          />
          <VictoryBar
            data={chartData}
            style={{ 
              data: { 
                fill: ({ datum }) => datum.fill,
                width: chartData.length > 8 ? 20 : 30,
              }
            }}
            animate={{
              duration: 500,
              onLoad: { duration: 500 }
            }}
            cornerRadius={{ top: 4, bottom: 0 }}
            barWidth={chartData.length > 8 ? 16 : 25}
          />
        </VictoryChart>
      </View>
      
      <Text style={[styles.legendTitle, { color: theme.text.primary }]}>
        Category Breakdown
      </Text>
      
      <ScrollView 
        style={[styles.legendContainer, { borderTopColor: theme.border }]}
        showsVerticalScrollIndicator={true}
      >
        {incomeItems.length > 0 && (
          <LegendSection title="Income Categories" items={incomeItems} />
        )}
        
        {expenseItems.length > 0 && (
          <LegendSection title="Expense Categories" items={expenseItems} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    borderRadius: 20,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  legendContainer: {
    width: '100%',
    borderTopWidth: 1,
    paddingTop: 8,
    maxHeight: 300,
  },
  legendSectionContainer: {
    width: '100%',
    marginBottom: 12,
  },
  legendSectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendHeaderContainer: {
    width: '100%',
    paddingVertical: 6,
    marginVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
  legendHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  legendItemContainer: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  legendColorSquare: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendItemText: {
    fontSize: 12,
    fontWeight: '500',
  },
  legendValueText: {
    fontSize: 11,
    marginTop: 2,
  },
}); 