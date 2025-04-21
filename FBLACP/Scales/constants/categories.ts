/**
 * Categories Constants
 * 
 * This file defines the available categories for transactions in the application.
 * It includes both expense and income categories, along with helper functions
 * to manage and retrieve these categories.
 */

/**
 * Expense Categories
 * 
 * List of predefined categories for expense transactions.
 * These categories help users organize their spending.
 */
export const expenseCategories = [
    'Food',
    'Shopping',
    'Transport',
    'Housing',
    'Entertainment',
    'Healthcare',
    'Education',
    'Utilities',
    'Travel',
    'Insurance',
    'Personal Care',
    'Gifts',
    'Investments',
    'Other'
  ];
  
/**
 * Income Categories
 * 
 * List of predefined categories for income transactions.
 * These categories help users track different sources of income.
 */
export const incomeCategories = [
    'Salary',
    'Business',
    'Investments',
    'Freelance',
    'Gifts',
    'Rental',
    'Refunds',
    'Other'
  ];
  
/**
 * Get Categories by Type
 * 
 * Helper function to retrieve categories based on transaction type.
 * 
 * @param type - The type of transaction ('income', 'expense', or 'all')
 * @returns Array of categories for the specified type
 */
export const getCategoriesByType = (type: 'income' | 'expense' | 'all') => {
    switch (type) {
      case 'income':
        return incomeCategories;
      case 'expense':
        return expenseCategories;
      case 'all':
        return [...new Set([...incomeCategories, ...expenseCategories])];
      default:
        return [];
    }
}; 