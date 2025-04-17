# Scales - Expense Tracking App

## Receipt Scanning Feature

The app includes a receipt scanning feature that uses Google Cloud Vision API for OCR (Optical Character Recognition) to extract text from receipts.

### Setting Up Google Cloud Vision API

To use the receipt scanning feature, you need to set up a Google Cloud Vision API key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Cloud Vision API for your project:
   - In the navigation menu, go to "APIs & Services" > "Library"
   - Search for "Cloud Vision API" and click on it
   - Click "Enable"
4. Create credentials (API key):
   - In the navigation menu, go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" and select "API key"
   - Copy the generated API key
5. (Recommended) Restrict the API key to Cloud Vision API only for security:
   - In the credentials page, click on the API key you just created
   - Under "Application restrictions", select "IP addresses" and add your app's IP addresses
   - Under "API restrictions", select "Restrict key" and select "Cloud Vision API"
   - Click "Save"
6. Add your API key to the app:
   - Open `config/api.ts` in the project
   - Replace `'YOUR_GOOGLE_VISION_API_KEY'` with your actual API key

### Usage

1. Open the app and navigate to the "Add Transaction" screen
2. Tap the "Scan Receipt" button
3. Position your camera over a receipt
4. The app will automatically extract the amount, date, and suggest a category
5. Confirm the transaction details and tap "Add Transaction"

### Troubleshooting

If you encounter issues with the receipt scanning feature:

- Ensure you have a valid Google Cloud Vision API key
- Check your internet connection
- Make sure the receipt is well-lit and in focus
- If the app fails to extract the amount, try scanning the receipt again or enter the amount manually

## Other Features

[Add information about other features of the app here] 