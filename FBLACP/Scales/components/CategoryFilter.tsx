/**
 * CategoryFilter Component
 * 
 * A reusable component that displays a list of categories with icons
 * and allows users to filter transactions by category.
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
type IconNames = keyof typeof Ionicons.glyphMap;

/**
 * Props for the CategoryFilter component
 */
interface CategoryFilterProps {
  categories: string[];        // List of available categories
  selectedCategory: string | null;  // Currently selected category
  onSelectCategory: (category: string | null) => void;  // Callback when category is selected
}

/**
 * Mapping of category names to their corresponding Ionicons
 * Used to display appropriate icons for each category
 */
const categoryIcons: { [key: string]: IconNames } = {
  'Food & Drinks': 'restaurant',
  'Shopping': 'cart',
  'Transport': 'car',
  'Housing': 'home',
  'Entertainment': 'game-controller',
  'Healthcare': 'medical',
  'Education': 'school',
  'Utilities': 'flash',
  'Travel': 'airplane',
  'Insurance': 'shield-checkmark',
  'Personal Care': 'person',
  'Gifts': 'gift',
  'Investments': 'trending-up',
  'Salary': 'cash',
  'Business': 'briefcase',
  'Freelance': 'laptop',
  'Rental': 'key',
  'Refunds': 'return-up-back',
  'Other': 'ellipsis-horizontal',
};

/**
 * CategoryFilter Component
 * 
 * Renders a scrollable list of categories with icons.
 * Allows users to select/deselect categories for filtering.
 */
export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
        Categories
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.container}
      >
        <Pressable
          style={[
            styles.chip,
            { 
              backgroundColor: !selectedCategory ? theme.primary : theme.surface,
              borderColor: theme.border,
              shadowColor: theme.shadowColor,
            }
          ]}
          onPress={() => onSelectCategory(null)}
        >
          <Ionicons 
            name="apps" 
            size={16} 
            color={!selectedCategory ? '#fff' : theme.text.primary} 
          />
          <Text style={[
            styles.chipText,
            { color: !selectedCategory ? '#fff' : theme.text.primary }
          ]}>
            All
          </Text>
        </Pressable>
        {categories.map((category) => (
          <Pressable
            key={category}
            style={[
              styles.chip,
              { 
                backgroundColor: selectedCategory === category ? theme.primary : theme.surface,
                borderColor: theme.border,
                shadowColor: theme.shadowColor,
              }
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <Ionicons 
              name={categoryIcons[category] || 'help-circle'} 
              size={16} 
              color={selectedCategory === category ? '#fff' : theme.text.primary} 
            />
            <Text style={[
              styles.chipText,
              { color: selectedCategory === category ? '#fff' : theme.text.primary }
            ]}>
              {category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  container: {
    flexGrow: 0,
    paddingHorizontal: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  chipText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
}); 