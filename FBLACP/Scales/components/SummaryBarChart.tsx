import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryGroup } from 'victory-native';
import { useTheme } from '../contexts/ThemeContext';

const screenWidth = Dimensions.get('window').width;

interface BarChartProps {
  data: {
    income: number;
    expenses: number;
  }[];
  period: string;
  labels?: string[]; // Optional custom labels
}

export default function SummaryBarChart({ data, period, labels }: BarChartProps) {
  const { theme } = useTheme();
  
  // Format data for the bar chart
  const formattedData = data.map((item, index) => {
    return [
      { x: index, y: item.income, type: 'income' },
      { x: index, y: item.expenses, type: 'expenses' }
    ];
  }).flat();
  
  const incomeData = formattedData.filter(d => d.type === 'income');
  const expenseData = formattedData.filter(d => d.type === 'expenses');
  
  // Generate default x-axis labels if not provided
  const defaultLabels = data.map((_, i) => {
    // For small datasets (daily view), show numbers
    if (data.length <= 31) {
      return `${i+1}`;
    }
    // For larger datasets (monthly view), show "M1", "M2", etc.
    return `M${i+1}`;
  });
  
  // Use custom labels if provided, otherwise use default
  const xAxisLabels = labels || defaultLabels;

  // Determine if we need to hide some labels for readability
  const shouldSkipLabels = data.length > 10;
  
  // Calculate the maximum y value to set the domain properly
  const maxIncome = Math.max(...incomeData.map(d => d.y));
  const maxExpense = Math.max(...expenseData.map(d => d.y));
  const maxY = Math.max(maxIncome, maxExpense);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        {data.length > 1 ? 'Financial Breakdown' : 'Summary'}
      </Text>
      
      <View style={styles.chartContainer}>
        <VictoryChart
          width={screenWidth * 0.9}
          height={250}
          domainPadding={{ x: 25 }}
          padding={{ top: 20, bottom: 50, left: 60, right: 20 }}
          theme={VictoryTheme.material}
          domain={{ y: [0, maxY * 1.1] }} // Add 10% padding to the top
        >
          <VictoryAxis
            tickValues={data.map((_, i) => i)}
            tickFormat={(t, i) => shouldSkipLabels && i % 2 !== 0 ? '' : xAxisLabels[i]}
            style={{
              axis: { stroke: theme.text.secondary },
              ticks: { stroke: theme.text.secondary, size: 5 },
              tickLabels: { 
                fill: theme.text.secondary, 
                fontSize: 10,
                angle: data.length > 5 ? -45 : 0,
                textAnchor: data.length > 5 ? 'end' : 'middle',
              }
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(x) => {
              const absValue = Math.abs(x);
              const sign = x < 0 ? '-' : '';
              return `${sign}$${Math.round(absValue)}`;
            }}
            style={{
              axis: { stroke: theme.text.secondary },
              ticks: { stroke: theme.text.secondary, size: 5 },
              tickLabels: { fill: theme.text.secondary, fontSize: 10 }
            }}
          />
          <VictoryGroup 
            offset={data.length > 10 ? 8 : 20} // Reduce offset for many bars
            colorScale={[theme.income, theme.expense]}
          >
            <VictoryBar
              data={incomeData}
              alignment="middle"
              style={{ 
                data: { 
                  fill: theme.income,
                  width: data.length > 10 ? 6 : 15, // Narrower bars for many data points
                }
              }}
              animate={{
                duration: 500,
                onLoad: { duration: 500 }
              }}
              cornerRadius={{ top: 4, bottom: 0 }}
            />
            <VictoryBar
              data={expenseData}
              alignment="middle"
              style={{ 
                data: { 
                  fill: theme.expense,
                  width: data.length > 10 ? 6 : 15, // Narrower bars for many data points
                }
              }}
              animate={{
                duration: 500,
                onLoad: { duration: 500 }
              }}
              cornerRadius={{ top: 4, bottom: 0 }}
            />
          </VictoryGroup>
        </VictoryChart>
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.income }]} />
          <Text style={[styles.legendText, { color: theme.text.primary }]}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.expense }]} />
          <Text style={[styles.legendText, { color: theme.text.primary }]}>Expenses</Text>
        </View>
      </View>
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
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 