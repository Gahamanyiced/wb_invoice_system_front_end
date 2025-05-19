// src/utils/phoneUtils.js
import { parsePhoneNumberFromString, getExampleNumber } from 'libphonenumber-js/max';
import examples from 'libphonenumber-js/examples.mobile.json';

/**
 * Get a formatted list of countries with phone information
 * @returns {Array} Array of country objects with code, name and phone pattern
 */
export const getCountriesWithPhoneInfo = () => {
  // ISO 3166-1 alpha-2 country codes
  const countries = [
    { code: 'RW', name: 'Rwanda' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'KE', name: 'Kenya' },
    { code: 'UG', name: 'Uganda' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'CA', name: 'Canada' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'IN', name: 'India' },
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japan' },
    { code: 'AU', name: 'Australia' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'GH', name: 'Ghana' },
    { code: 'SN', name: 'Senegal' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'CD', name: 'Congo (DRC)' },
    { code: 'EG', name: 'Egypt' },
    { code: 'MA', name: 'Morocco' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    // Add more countries as needed
  ].sort((a, b) => a.name.localeCompare(b.name));

  // Enhance countries with phone metadata
  return countries.map(country => {
    const exampleNumber = getExampleNumber(country.code, examples);
    const formattedExample = exampleNumber ? exampleNumber.formatInternational() : '';
    const countryCode = exampleNumber ? `+${exampleNumber.countryCallingCode}` : '';
    
    return {
      ...country,
      countryCode,
      exampleFormat: formattedExample || `+??? ??????????`
    };
  });
};

/**
 * Validate a phone number for a specific country
 * @param {string} phoneNumber - The phone number to validate
 * @param {string} countryCode - The ISO country code (e.g., 'US', 'RW')
 * @returns {Object} Object with isValid flag and formatted number if valid
 */
export const validatePhoneNumber = (phoneNumber, countryCode) => {
  try {
    if (!phoneNumber) return { isValid: false, error: 'Phone number is required' };
    
    const parsedNumber = parsePhoneNumberFromString(phoneNumber, countryCode);
    
    if (!parsedNumber) {
      return { 
        isValid: false, 
        error: 'Invalid phone number format' 
      };
    }
    
    return {
      isValid: parsedNumber.isValid(),
      error: parsedNumber.isValid() ? null : 'Invalid phone number format',
      formattedNumber: parsedNumber.isValid() ? parsedNumber.formatInternational() : null
    };
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Invalid phone number format' 
    };
  }
};

/**
 * Get example phone number and format info for a specific country
 * @param {string} countryCode - The ISO country code (e.g., 'US', 'RW')
 * @returns {Object} Object with example number and country code
 */
export const getPhoneExampleForCountry = (countryCode) => {
  try {
    const exampleNumber = getExampleNumber(countryCode, examples);
    if (!exampleNumber) {
      return {
        example: '+??? ??????????',
        countryCode: '',
      };
    }
    
    return {
      example: exampleNumber.formatInternational(),
      countryCode: `+${exampleNumber.countryCallingCode}`,
    };
  } catch (error) {
    return {
      example: '+??? ??????????',
      countryCode: '',
    };
  }
};