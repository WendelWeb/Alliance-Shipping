'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'ht', label: 'HT', name: 'Kreyòl' },
];

export function FloatingLanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button - Only visible below 400px */}
      <div className="fixed top-14 right-3 z-30 block xs:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-primary-600" />
          <span className="text-xs font-semibold text-gray-700">
            {languages.find((l) => l.code === currentLang)?.label}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-gray-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setCurrentLang(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-primary-50 transition-colors ${
                    currentLang === lang.code
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{lang.name}</span>
                    <span className="text-[10px] font-bold opacity-60">
                      {lang.label}
                    </span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 block xs:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
