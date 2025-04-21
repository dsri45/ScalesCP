/**
 * ML Classification Service
 * 
 * This service provides receipt classification functionality using:
 * - Machine learning model for category prediction
 * - Fallback to simple keyword-based classification
 * - Support for both income and expense categories
 */

import { expenseCategories, incomeCategories } from '../constants/categories';

// Keywords for simple classification fallback
const categoryKeywords: { [key: string]: string[] } = {
  'Food & Dining': ['restaurant', 'cafe', 'food', 'dining', 'meal', 'eat', 'drink', 'coffee', 'lunch', 'dinner'],
  'Shopping': ['store', 'shop', 'mall', 'retail', 'purchase', 'buy', 'clothes', 'fashion', 'merchandise'],
  'Transportation': ['taxi', 'uber', 'lyft', 'bus', 'train', 'subway', 'metro', 'transport', 'fare', 'gas', 'fuel'],
  'Entertainment': ['movie', 'cinema', 'theater', 'concert', 'show', 'game', 'sports', 'event', 'ticket'],
  'Bills & Utilities': ['bill', 'utility', 'electric', 'water', 'gas', 'internet', 'phone', 'cable', 'tv'],
  'Healthcare': ['doctor', 'hospital', 'pharmacy', 'medical', 'health', 'dental', 'vision', 'insurance'],
  'Education': ['school', 'university', 'college', 'tuition', 'book', 'course', 'education', 'learning'],
  'Travel': ['hotel', 'flight', 'airline', 'vacation', 'travel', 'trip', 'lodging', 'accommodation'],
  'Personal Care': ['salon', 'spa', 'beauty', 'hair', 'nails', 'gym', 'fitness', 'wellness'],
  'Other': [] // Default category
};

/**
 * Classify a receipt using machine learning model
 * @param text - The text extracted from the receipt
 * @returns The predicted category
 */
export async function classifyReceipt(text: string): Promise<string> {
  try {
    // TODO: Implement actual ML model classification
    // For now, we'll use the simple keyword-based classification
    return classifyReceiptSimple(text);
  } catch (error) {
    console.error('Error with ML classification:', error);
    // Fall back to simple classification
    return classifyReceiptSimple(text);
  }
}

/**
 * Simple keyword-based receipt classification
 * @param text - The text extracted from the receipt
 * @returns The predicted category based on keyword matching
 */
export function classifyReceiptSimple(text: string): string {
  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Count matches for each category
  const categoryMatches: { [key: string]: number } = {};
  
  // Initialize counts
  expenseCategories.forEach(category => {
    categoryMatches[category] = 0;
  });

  // Count keyword matches
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        categoryMatches[category]++;
      }
    });
  });

  // Find category with most matches
  let maxMatches = 0;
  let predictedCategory = 'Other';

  Object.entries(categoryMatches).forEach(([category, matches]) => {
    if (matches > maxMatches) {
      maxMatches = matches;
      predictedCategory = category;
    }
  });

  return predictedCategory;
}

/**
 * Determine if a receipt is likely an income or expense
 * @param text - The text extracted from the receipt
 * @returns 'income' or 'expense'
 */
export function classifyReceiptType(text: string): 'income' | 'expense' {
  const lowerText = text.toLowerCase();
  
  // Keywords that might indicate income
  const incomeKeywords = [
    'salary', 'paycheck', 'income', 'deposit', 'transfer', 'refund',
    'reimbursement', 'payment', 'invoice', 'bill', 'receipt'
  ];

  // Check for income keywords
  for (const keyword of incomeKeywords) {
    if (lowerText.includes(keyword)) {
      return 'income';
    }
  }

  // Default to expense
  return 'expense';
} 