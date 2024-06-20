import { useState, useEffect } from 'react';
import axios from 'axios';

const fetchCurrencies = async () => {
  try {
    const response = await axios.get('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json');
    console.log('Currencies:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching currencies from primary source:', error);
    try {
      const fallbackResponse = await axios.get('https://latest.currency-api.pages.dev/v1/currencies.json');
      console.log('Fallback Currencies:', fallbackResponse.data);
      return fallbackResponse.data;
    } catch (fallbackError) {
      console.error('Error fetching currencies from fallback source:', fallbackError);
    }
  }
  return {};
};

const fetchConversionRate = async (from, to) => {
  try {
    const response = await axios.get(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`);
    console.log(`Conversion rate data from ${from}:`, response.data);
    if (response.data[from] && response.data[from][to]) {
      return response.data[from][to];
    } else {
      console.warn(`Conversion rate for ${from} to ${to} not found in primary source.`);
    }
  } catch (error) {
    console.error(`Error fetching conversion rate from primary source for ${from} to ${to}:`, error);
  }

  try {
    const fallbackResponse = await axios.get(`https://latest.currency-api.pages.dev/v1/currencies/${from}.json`);
    console.log(`Fallback conversion rate data from ${from}:`, fallbackResponse.data);
    if (fallbackResponse.data[from] && fallbackResponse.data[from][to]) {
      return fallbackResponse.data[from][to];
    } else {
      console.warn(`Conversion rate for ${from} to ${to} not found in fallback source.`);
    }
  } catch (fallbackError) {
    console.error(`Error fetching conversion rate from fallback source for ${from} to ${to}:`, fallbackError);
  }
  
  return null;
};

export default function Home() {
  const [currencies, setCurrencies] = useState({});
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [amount, setAmount] = useState(1);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const getCurrencies = async () => {
      const data = await fetchCurrencies();
      setCurrencies(data);
    };
    getCurrencies();
  }, []);

  const handleConvert = async () => {
    if (fromCurrency && toCurrency && amount) {
      const rate = await fetchConversionRate(fromCurrency, toCurrency);
      if (rate !== null && !isNaN(rate)) {
        const result = amount * rate;
        setConvertedAmount(result);
        const newTransaction = {
          from: fromCurrency,
          to: toCurrency,
          amount,
          result,
          date: new Date().toLocaleString(),
        };
        setTransactions((prev) => [newTransaction, ...prev.slice(0, 4)]);
      } else {
        setConvertedAmount('Conversion rate not available');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold text-center mb-6">Currency Converter</h1>
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label className="block text-gray-700">From:</label>
          <select
            className="w-full mt-2 p-2 border rounded-lg"
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
          >
            <option value="" disabled>Select currency</option>
            {Object.keys(currencies).map((currency) => (
              <option key={currency} value={currency}>
                {currency.toUpperCase()} - {currencies[currency]}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">To:</label>
          <select
            className="w-full mt-2 p-2 border rounded-lg"
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
          >
            <option value="" disabled>Select currency</option>
            {Object.keys(currencies).map((currency) => (
              <option key={currency} value={currency}>
                {currency.toUpperCase()} - {currencies[currency]}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Amount:</label>
          <input
            type="number"
            className="w-full mt-2 p-2 border rounded-lg"
            value={amount.toString()}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          />
        </div>
        <button
          className="w-full bg-blue-500 text-white py-2 rounded-lg"
          onClick={handleConvert}
        >
          Convert
        </button>
        {convertedAmount !== null && (
          <div className="mt-4 p-4 bg-blue-100 text-blue-700 rounded-lg">
            <h2 className="text-lg font-bold">Converted Amount: {convertedAmount}</h2>
          </div>
        )}
        <h2 className="mt-6 text-lg font-bold">Last 5 Conversions:</h2>
        <ul className="mt-2 space-y-2">
          {transactions.map((transaction, index) => (
            <li key={index} className="p-2 bg-gray-200 rounded-lg">
              {transaction.date}: {transaction.amount} {transaction.from.toUpperCase()} to {transaction.to.toUpperCase()} = {transaction.result}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
