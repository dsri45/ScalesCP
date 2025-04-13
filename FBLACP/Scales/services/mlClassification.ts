import { expenseCategories } from '../constants/categories';

// Define keyword mappings for each category
const categoryKeywords = {
  'Food': ['Dasani', 'Cookie', 'restaurant', 'cafe', 'food', 'meal', 'dining', 'coffee', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger', 'sandwich', 'salad', 'drink', 'beverage', 'snack', 'dessert', 'ice cream', 'bakery', 'grocery', 'market', 'supermarket', 'convenience', 'store'],
  'Transport': ['taxi', 'uber', 'lyft', 'transport', 'transit', 'bus', 'train', 'subway', 'fare', 'cab', 'ride', 'shuttle', 'parking', 'garage', 'toll', 'metro', 'railway', 'airport', 'terminal', 'flight', 'airline'],
  'Shopping': ['store', 'market', 'shop', 'retail', 'mall', 'department', 'boutique', 'outlet', 'clothing', 'apparel', 'fashion', 'accessories', 'electronics', 'gadget', 'device', 'appliance', 'furniture', 'home', 'decor', 'beauty', 'cosmetics', 'pharmacy', 'drugstore', 'bookstore', 'office supplies'],
  'Entertainment': ['movie', 'theatre', 'cinema', 'concert', 'event', 'ticket', 'show', 'performance', 'game', 'arcade', 'bowling', 'pool', 'club', 'bar', 'pub', 'nightclub', 'festival', 'exhibition', 'museum', 'gallery', 'park', 'attraction', 'admission', 'subscription', 'streaming', 'music', 'video'],
  'Bills': ['bill', 'utility', 'subscription', 'service', 'payment', 'monthly', 'electric', 'water', 'gas', 'internet', 'phone', 'mobile', 'cable', 'tv', 'television', 'rent', 'mortgage', 'insurance', 'tax', 'fee', 'charge', 'account', 'statement', 'invoice', 'receipt'],
  'Health': ['pharmacy', 'doctor', 'medical', 'health', 'clinic', 'hospital', 'dental', 'prescription', 'medicine', 'drug', 'vitamin', 'supplement', 'wellness', 'fitness', 'gym', 'yoga', 'therapy', 'counseling', 'psychiatrist', 'psychologist', 'optometrist', 'eye', 'vision', 'glasses', 'contact', 'lens'],
  'Education': ['school', 'university', 'college', 'course', 'education', 'tuition', 'book', 'textbook', 'student', 'class', 'seminar', 'workshop', 'training', 'certification', 'degree', 'diploma', 'academic', 'library', 'study', 'research', 'project', 'assignment', 'exam', 'test', 'fee', 'registration'],
  'Travel': ['hotel', 'flight', 'airline', 'travel', 'vacation', 'resort', 'lodging', 'accommodation', 'hostel', 'motel', 'inn', 'suite', 'room', 'booking', 'reservation', 'tour', 'excursion', 'sightseeing', 'adventure', 'cruise', 'car rental', 'vehicle', 'transportation', 'transfer', 'shuttle', 'guide'],
  'Gifts': ['gift', 'present', 'donation', 'charity', 'contribution', 'card', 'greeting', 'celebration', 'birthday', 'anniversary', 'wedding', 'holiday', 'christmas', 'thanksgiving', 'easter', 'valentine', 'flower', 'bouquet', 'jewelry', 'watch', 'accessory', 'toy', 'game', 'book', 'art', 'craft']
};

// Feature extraction function
const extractFeatures = (text: string): Record<string, number> => {
  const lowerText = text.toLowerCase();
  
  // Initialize feature scores
  const features: Record<string, number> = {};
  
  // Calculate feature scores for each category
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    let score = 0;
    
    // Count keyword matches
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        score += 1;
      }
    });
    
    // Add some weight to exact matches
    keywords.forEach(keyword => {
      if (lowerText === keyword) {
        score += 2;
      }
    });
    
    // Add some weight to matches at the beginning of words
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}`, 'i');
      if (regex.test(lowerText)) {
        score += 1.5;
      }
    });
    
    features[category] = score;
  });
  
  return features;
};

// Simple neural network-like classification
const classifyWithFeatures = (features: Record<string, number>): string => {
  // Find the category with the highest score
  let maxCategory = 'Other';
  let maxScore = 0;
  
  Object.entries(features).forEach(([category, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxCategory = category;
    }
  });
  
  // If no category has a significant score, return 'Other'
  return maxScore > 0 ? maxCategory : 'Other';
};

// Classify receipt text using our custom algorithm
export const classifyReceipt = async (text: string): Promise<string> => {
  try {
    // Extract features from the text
    const features = extractFeatures(text);
    
    // Classify based on features
    const category = classifyWithFeatures(features);
    
    return category;
  } catch (error) {
    console.error('Error classifying receipt:', error);
    return 'Other'; // Default to 'Other' if classification fails
  }
};

// Alternative simpler classification method
export const classifyReceiptSimple = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  // Count keyword matches for each category
  const categoryScores: Record<string, number> = {};
  
  // Initialize scores
  Object.keys(categoryKeywords).forEach(category => {
    categoryScores[category] = 0;
  });
  
  // Count matches
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        categoryScores[category]++;
      }
    });
  });
  
  // Find the category with the highest score
  let maxCategory = 'Other';
  let maxScore = 0;
  
  Object.entries(categoryScores).forEach(([category, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxCategory = category;
    }
  });
  
  // If no category has a score greater than 0, return 'Other'
  return maxScore > 0 ? maxCategory : 'Other';
}; 