import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, Linking, Image, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { expenseCategories } from '../constants/categories';
import { GOOGLE_VISION_API_KEY } from '../config/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { classifyReceipt, classifyReceiptSimple } from '../services/mlClassification';

export default function ScanReceipt() {
  const router = useRouter();
  const { theme } = useTheme();
  const { addTransaction } = useTransactions();
  const [isLoading, setIsLoading] = useState(false);
  const [scannedText, setScannedText] = useState('');
  const [extractedAmount, setExtractedAmount] = useState<number | null>(null);
  const [extractedDate, setExtractedDate] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Other');
  const [apiKeyError, setApiKeyError] = useState(false);
  const [receiptImageUri, setReceiptImageUri] = useState<string | null>(null);
  const [manualAmount, setManualAmount] = useState<string>('');
  const [manualDate, setManualDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [comment, setComment] = useState<string>('');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);

  useEffect(() => {
    // Check if API key is set
    if (!GOOGLE_VISION_API_KEY || GOOGLE_VISION_API_KEY.trim() === '') {
      setApiKeyError(true);
      Alert.alert(
        'API Key Required',
        'Please set your Google Cloud Vision API key in the scanReceipt.tsx file.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
      return;
    }

    (async () => {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission needed',
            'Camera permission is required to scan receipts',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => router.back()
              },
              {
                text: 'Open Settings',
                onPress: () => {
                  // On iOS, this will open the app settings
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                }
              }
            ]
          );
          return;
        }
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        Alert.alert('Error', 'Failed to request camera permission');
        router.back();
      }
    })();
  }, []);

  const extractAmount = (text: string): number | null => {
    try {
      const amountRegex = /\$?\d+\.\d{2}/g;
      const matches = text.match(amountRegex);
      if (matches) {
        // Get the largest amount found (usually the total)
        const amounts = matches.map(match => parseFloat(match.replace('$', '')));
        return Math.max(...amounts);
      }
      return null;
    } catch (error) {
      console.error('Error extracting amount:', error);
      return null;
    }
  };

  const extractDate = (text: string): Date | null => {
    try {
      // Try multiple date formats
      const dateFormats = [
        /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/g,  // MM/DD/YYYY or DD/MM/YYYY
        /\d{4}[-/]\d{1,2}[-/]\d{1,2}/g,    // YYYY/MM/DD
        /\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{2,4}/gi, // 15 Jan 2023
        /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{1,2},?\s\d{2,4}/gi // Jan 15, 2023
      ];
      
      for (const format of dateFormats) {
        const matches = text.match(format);
        if (matches && matches.length > 0) {
          // Try to parse the date
          const parsedDate = new Date(matches[0]);
          
          // Check if the date is valid
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }
      }
      
      // If no valid date found, return null
      return null;
    } catch (error) {
      console.error('Error extracting date:', error);
      return null;
    }
  };

  const recognizeTextWithGoogleVision = async (imageUri: string): Promise<string> => {
    try {
      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Prepare the request to Google Vision API
      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      };

      // Make the API call
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google Vision API error:', errorData);
        
        // Check for specific error types
        if (response.status === 403) {
          throw new Error('API key is invalid or has insufficient permissions');
        } else if (response.status === 429) {
          throw new Error('API quota exceeded. Please try again later');
        } else {
          throw new Error(`Google Vision API error: ${response.status}`);
        }
      }

      const data = await response.json();
      
      // Extract text from the response
      if (
        data.responses &&
        data.responses[0] &&
        data.responses[0].fullTextAnnotation &&
        data.responses[0].fullTextAnnotation.text
      ) {
        return data.responses[0].fullTextAnnotation.text;
      } else {
        throw new Error('No text found in the image');
      }
    } catch (error) {
      console.error('Error recognizing text with Google Vision:', error);
      throw error;
    }
  };

  const handleScanReceipt = async () => {
    if (apiKeyError) {
      Alert.alert(
        'API Key Required',
        'Please set your Google Cloud Vision API key in the scanReceipt.tsx file.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
      return;
    }

    try {
      setIsLoading(true);
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        try {
          // Save the image URI
          setReceiptImageUri(result.assets[0].uri);
          
          // Perform text recognition using Google Vision API
          const text = await recognizeTextWithGoogleVision(result.assets[0].uri);
          
          if (!text) {
            throw new Error('No text recognized in the image');
          }
          
          setScannedText(text);

          const amount = extractAmount(text);
          const date = extractDate(text);
          
          setExtractedAmount(amount);
          
          // Always set a date - use extracted date or default to current date
          const currentDate = new Date();
          setExtractedDate(date || currentDate);
          
          // Set manual amount if extracted
          if (amount) {
            setManualAmount(amount.toString());
          }
          
          // Set manual date - use extracted date or default to current date
          setManualDate(date || currentDate);
          
          // Classify the receipt using our ML algorithm
          setIsClassifying(true);
          try {
            // Use our custom classification algorithm
            const category = await classifyReceipt(text);
            setSelectedCategory(category);
          } catch (error) {
            console.error('Error with ML classification, falling back to simple classification:', error);
            // Fall back to simple keyword-based classification
            const category = classifyReceiptSimple(text);
            setSelectedCategory(category);
          } finally {
            setIsClassifying(false);
          }
          
          // Show the transaction form
          setShowTransactionForm(true);

        } catch (error: any) {
          console.error('Error processing image:', error);
          Alert.alert('Error', `Failed to process the receipt image: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Error scanning receipt:', error);
      Alert.alert('Error', 'Failed to scan receipt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    try {
      // Validate amount
      const amount = parseFloat(manualAmount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid amount');
        return;
      }
      
      // Create transaction
      await addTransaction({
        title: `Receipt - ${selectedCategory}`,
        amount: -amount, // Negative for expense
        date: manualDate.toISOString(),
        category: selectedCategory,
        receiptImage: receiptImageUri,
        comment: comment.trim() || undefined, // Only include if not empty
      });
      
      router.back();
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setManualDate(selectedDate);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {apiKeyError ? (
        <View style={[styles.errorContainer, { backgroundColor: theme.surface }]}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={[styles.errorText, { color: theme.text.primary }]}>
            Google Cloud Vision API key is required
          </Text>
          <Text style={[styles.errorSubtext, { color: theme.text.secondary }]}>
            Please set your API key in the scanReceipt.tsx file
          </Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: theme.primary }]}
            onPress={handleScanReceipt}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.scanButtonText}>Scan Receipt</Text>
              </>
            )}
          </TouchableOpacity>

          {receiptImageUri && (
            <View style={[styles.imagePreviewContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.previewTitle, { color: theme.text.primary }]}>Receipt Image:</Text>
              <Image 
                source={{ uri: receiptImageUri }} 
                style={styles.receiptImage} 
                resizeMode="contain"
              />
            </View>
          )}

          {showTransactionForm && (
            <View style={[styles.formContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.formTitle, { color: theme.text.primary }]}>Transaction Details</Text>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text.secondary }]}>Amount:</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.background,
                    color: theme.text.primary,
                    borderColor: theme.border
                  }]}
                  value={manualAmount}
                  onChangeText={setManualAmount}
                  placeholder="Enter amount"
                  placeholderTextColor={theme.text.secondary}
                  keyboardType="decimal-pad"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text.secondary }]}>
                  Date: {extractedDate && extractedDate !== manualDate ? '(Defaulted to current date)' : ''}
                </Text>
                <TouchableOpacity 
                  style={[styles.dateButton, { 
                    backgroundColor: theme.background,
                    borderColor: theme.border
                  }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: theme.text.primary }}>
                    {manualDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={manualDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                  />
                )}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text.secondary }]}>
                  Category: {isClassifying ? '(Classifying...)' : ''}
                </Text>
                <View style={styles.categoryContainer}>
                  {expenseCategories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        { 
                          backgroundColor: selectedCategory === category ? theme.primary : theme.background,
                          borderColor: theme.border
                        }
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text style={{ 
                        color: selectedCategory === category ? '#fff' : theme.text.primary 
                      }}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text.secondary }]}>Comment (Optional):</Text>
                <TextInput
                  style={[styles.commentInput, { 
                    backgroundColor: theme.background,
                    color: theme.text.primary,
                    borderColor: theme.border
                  }]}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Add a comment"
                  placeholderTextColor={theme.text.secondary}
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                onPress={handleAddTransaction}
              >
                <Text style={styles.addButtonText}>Add Transaction</Text>
              </TouchableOpacity>
            </View>
          )}

          {scannedText && !showTransactionForm && (
            <View style={[styles.previewContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.previewTitle, { color: theme.text.primary }]}>Scanned Text:</Text>
              <Text style={[styles.previewText, { color: theme.text.secondary }]}>{scannedText}</Text>
            </View>
          )}

          {!scannedText && !showTransactionForm && (
            <View style={[styles.instructionsContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.instructionsText, { color: theme.text.secondary }]}>
                Position your camera over a receipt to scan it. The app will automatically extract the amount, date, and suggest a category.
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  previewContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
  },
  instructionsContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  instructionsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  imagePreviewContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  formContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  dateButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 