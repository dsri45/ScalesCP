 Scales - Personal Finance Tracker

A comprehensive personal finance tracking app built with React Native and Expo.

## Features

### 💰 Real-Time Currency Exchange
- **Automatic Conversion**: The app automatically fetches real-time exchange rates when you change currencies
- **No Manual Input Required**: Users no longer need to manually enter conversion rates
- **Smart Caching**: Exchange rates are cached for 24 hours to reduce API calls
- **Fallback System**: If the API is unavailable, the app gracefully falls back to manual conversion
- **Premium API**: Uses ExchangeRate-API with API key for reliable service and higher rate limits

### 🔄 Currency Conversion Process
1. **Select Currency**: Choose a new currency from the currency selection screen
2. **Automatic Fetch**: App automatically fetches the latest exchange rate
3. **Transaction Conversion**: All existing transactions are converted to the new currency
4. **Success Notification**: Shows the conversion rate used for transparency

### 📱 Other Features
- Track income and expenses with detailed categorization
- Set and monitor savings goals
- Generate financial reports and export to PDF/CSV
- Dark/Light theme support
- Receipt scanning and storage
- Recurring transaction support
- Real-time balance calculations

## Setup

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- React Native development environment

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

### Currency API
The app uses ExchangeRate-API with a configured API key for reliable real-time exchange rates. The service is ready to use out of the box.

## Usage

### Changing Currency
1. Go to Settings → Currency
2. Select your desired currency
3. The app will automatically:
   - Fetch the latest exchange rate
   - Convert all existing transactions
   - Show you the conversion rate used

### Manual Conversion (Fallback)
If the API is unavailable:
1. Select your desired currency
2. Enter the conversion rate manually
3. Confirm the conversion

## Technical Details

### Currency Service
- **API**: ExchangeRate-API v6
- **Authentication**: API key for premium access
- **Caching**: 24-hour cache for exchange rates
- **Error Handling**: Graceful fallback to manual conversion
- **Rate Limiting**: Premium tier with higher limits

### Supported Currencies
The app supports 40+ currencies including:
- USD, EUR, GBP, JPY, CAD, AUD
- CHF, CNY, INR, KRW, NZD, SEK
- And many more...

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

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

## Real-Time Currency Exchange Rates

The app now supports real-time currency exchange rates using the **ExchangeRate-API (Free Version)**. This eliminates the need for users to manually enter conversion rates.

### Features:
- **Automatic Rate Fetching**: Exchange rates are fetched automatically when selecting currencies
- **24-Hour Caching**: Rates are cached for 24 hours to reduce API calls and improve performance
- **Fallback System**: If the primary API is unavailable, the app automatically switches to an alternative free API
- **Offline Support**: Manual conversion rates can still be entered if both APIs are unavailable
- **Loading States**: Users see loading indicators while rates are being fetched
- **Error Handling**: Clear warnings when APIs are unavailable with fallback options

### API Configuration:
- **Primary API**: ExchangeRate-API (Free Version) - `https://v6.exchangerate-api.com/v6/{API_KEY}/latest/{BASE_CURRENCY}`
- **Fallback API**: Alternative free API - `https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}`
- **API Key**: Free version API key is configured in `services/currencyService.ts`

### How It Works:
1. When a user selects a new currency, the app tests both APIs
2. If the primary API works, it uses that for all rate fetching
3. If the primary API fails, it automatically switches to the fallback API
4. Rates are cached for 24 hours to minimize API calls
5. If both APIs fail, users can still enter manual conversion rates

### Benefits of Free Version:
- No API key required for basic usage
- Reliable service with good uptime
- Automatic fallback to alternative free API
- Cost-effective solution for personal finance apps 
