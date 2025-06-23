import AsyncStorage from '@react-native-async-storage/async-storage';

// Currency exchange rate service using ExchangeRate-API (Free Version)
// Using free API key for basic service

interface CurrencyRatesResponse {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  conversion_rates: Record<string, number>;
}

interface FreeCurrencyRatesResponse {
  rates: Record<string, number>;
  base: string;
  date: string;
}

class CurrencyService {
  private baseUrl = 'https://v6.exchangerate-api.com/v6';
  private apiKey = 'f0771d16207ae544d91ceb5c';
  private freeApiUrl = 'https://api.exchangerate-api.com/v4';
  private useFreeApi = false; // Fallback flag
  
  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      if (this.useFreeApi) {
        // Use alternative free API as fallback
        const url = `${this.freeApiUrl}/latest/${fromCurrency}`;
        console.log('Using alternative free API - Fetching exchange rate from:', url);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('Alternative free API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: FreeCurrencyRatesResponse = await response.json();
        const rate = data.rates[toCurrency];
        
        if (!rate) {
          throw new Error(`Exchange rate not found for ${toCurrency}`);
        }
        
        console.log(`Alternative free API - Exchange rate ${fromCurrency} to ${toCurrency}:`, rate);
        return rate;
      } else {
        // Use ExchangeRate-API free version
        const url = `${this.baseUrl}/${this.apiKey}/latest/${fromCurrency}`;
        console.log('Using ExchangeRate-API free version - Fetching exchange rate from:', url);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('ExchangeRate-API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('ExchangeRate-API error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: CurrencyRatesResponse = await response.json();
        
        if (data.result !== 'success') {
          throw new Error('Failed to fetch exchange rate');
        }
        
        const rate = data.conversion_rates[toCurrency];
        if (!rate) {
          throw new Error(`Exchange rate not found for ${toCurrency}`);
        }
        
        console.log(`ExchangeRate-API - Exchange rate ${fromCurrency} to ${toCurrency}:`, rate);
        return rate;
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      
      // Try to get a cached rate as fallback
      const cachedRate = await this.getCachedRate(fromCurrency, toCurrency);
      if (cachedRate) {
        console.log('Using cached exchange rate as fallback');
        return cachedRate;
      }
      
      // Final fallback to a default rate of 1 if everything fails
      console.log('Using default exchange rate of 1 as fallback');
      return 1;
    }
  }

  /**
   * Get all available exchange rates for a base currency
   */
  async getAllRates(baseCurrency: string): Promise<Record<string, number>> {
    try {
      if (this.useFreeApi) {
        const url = `${this.freeApiUrl}/latest/${baseCurrency}`;
        console.log('Using alternative free API - Fetching all rates from:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Alternative free API error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: FreeCurrencyRatesResponse = await response.json();
        return data.rates;
      } else {
        const url = `${this.baseUrl}/${this.apiKey}/latest/${baseCurrency}`;
        console.log('Using ExchangeRate-API free version - Fetching all rates from:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('ExchangeRate-API error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: CurrencyRatesResponse = await response.json();
        
        if (data.result !== 'success') {
          throw new Error('Failed to fetch exchange rates');
        }
        
        return data.conversion_rates;
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Return empty object if API fails
      return {};
    }
  }

  /**
   * Test API connection and determine which API to use
   */
  async testApiConnection(): Promise<boolean> {
    try {
      // First, try the ExchangeRate-API free version
      const testUrl = `${this.baseUrl}/${this.apiKey}/latest/USD`;
      console.log('Testing ExchangeRate-API free version connection:', testUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('ExchangeRate-API test response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('ExchangeRate-API test response:', data);
        
        if (data.result === 'success' && data.conversion_rates) {
          console.log('ExchangeRate-API free version is working');
          this.useFreeApi = false;
          return true;
        }
      }
      
      // If ExchangeRate-API fails, try the alternative free API
      console.log('ExchangeRate-API failed, trying alternative free API');
      const alternativeUrl = `${this.freeApiUrl}/latest/USD`;
      console.log('Testing alternative free API connection:', alternativeUrl);
      
      const altController = new AbortController();
      const altTimeoutId = setTimeout(() => altController.abort(), 5000);
      
      const altResponse = await fetch(alternativeUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: altController.signal
      });
      
      clearTimeout(altTimeoutId);
      console.log('Alternative free API test response status:', altResponse.status);
      
      if (altResponse.ok) {
        const altData = await altResponse.json();
        console.log('Alternative free API test response:', altData);
        
        if (altData.rates) {
          console.log('Alternative free API is working');
          this.useFreeApi = true;
          return true;
        }
      }
      
      console.log('Both APIs failed');
      return false;
    } catch (error) {
      console.error('Error testing API connection:', error);
      return false;
    }
  }

  /**
   * Get cached exchange rate from AsyncStorage
   */
  async getCachedRate(fromCurrency: string, toCurrency: string): Promise<number | null> {
    try {
      const key = `exchange_rate_${fromCurrency}_${toCurrency}`;
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const data = JSON.parse(cached);
        // Check if cache is still valid (24 hours)
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return data.rate;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached rate:', error);
      return null;
    }
  }

  /**
   * Cache exchange rate in AsyncStorage
   */
  async cacheRate(fromCurrency: string, toCurrency: string, rate: number): Promise<void> {
    try {
      const key = `exchange_rate_${fromCurrency}_${toCurrency}`;
      const data = {
        rate,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching rate:', error);
    }
  }
}

export const currencyService = new CurrencyService(); 