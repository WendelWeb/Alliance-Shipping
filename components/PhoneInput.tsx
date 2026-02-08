'use client';

import { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  countryCode?: string;
}

export function PhoneInput({
  value,
  onChange,
  placeholder = '+509 1234 5678',
  className = '',
  label,
  required = false,
  countryCode = '+509',
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  // Format phone number as WhatsApp style
  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');

    // Format based on length (Haiti format: +509 XXXX XXXX)
    if (digits.length === 0) return '';
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)}`;
  };

  // Update display value when prop value changes
  useEffect(() => {
    if (value) {
      // If value includes country code, remove it for display
      let phoneDigits = value;
      if (value.startsWith('+509')) {
        phoneDigits = value.slice(4);
      } else if (value.startsWith('509')) {
        phoneDigits = value.slice(3);
      }
      setDisplayValue(formatPhoneNumber(phoneDigits.replace(/\D/g, '')));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    setDisplayValue(formatted);

    // Send back full number with country code
    const digits = formatted.replace(/\s/g, '');
    if (digits) {
      onChange(`${countryCode}${digits}`);
    } else {
      onChange('');
    }
  };

  const handleBlur = () => {
    // Create WhatsApp link format
    if (displayValue) {
      const digits = displayValue.replace(/\s/g, '');
      onChange(`${countryCode}${digits}`);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Phone className="inline h-4 w-4 mr-1" />
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <span className="text-gray-600 font-semibold">{countryCode}</span>
        </div>
        <input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder.replace(countryCode, '').trim()}
          className="w-full pl-20 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all"
        />
      </div>
      {displayValue && (
        <a
          href={`https://wa.me/${countryCode}${displayValue.replace(/\s/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Ouvrir dans WhatsApp
        </a>
      )}
    </div>
  );
}
