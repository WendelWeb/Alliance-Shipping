'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Palette, RotateCcw } from 'lucide-react';
import { useTheme, themes, ACCENT_PRESETS } from '@/lib/themes/ThemeProvider';
import type { ThemeDefinition } from '@/lib/themes/definitions';
import { cn } from '@/lib/utils/cn';

function ThemePreviewCard({ theme, isSelected, onSelect }: {
  theme: ThemeDefinition;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative w-full rounded-xl overflow-hidden transition-all duration-200',
        'hover:scale-[1.02] active:scale-[0.98]',
        isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : 'ring-1 ring-gray-200'
      )}
    >
      {/* Mini preview */}
      <div
        className="h-20 p-2.5 flex flex-col gap-1.5"
        style={{ backgroundColor: theme.preview.bg }}
      >
        {/* Mini card */}
        <div
          className="flex-1 rounded-md p-1.5 flex items-center gap-1.5"
          style={{
            backgroundColor: theme.preview.card,
            border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
          }}
        >
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: theme.preview.accent }}
          />
          <div className="flex-1 space-y-1">
            <div
              className="h-1.5 rounded-full w-3/4"
              style={{ backgroundColor: theme.preview.text, opacity: 0.8 }}
            />
            <div
              className="h-1 rounded-full w-1/2"
              style={{ backgroundColor: theme.preview.text, opacity: 0.3 }}
            />
          </div>
        </div>
        {/* Bottom bar */}
        <div className="flex gap-1">
          {[0.8, 0.5, 0.3].map((opacity, i) => (
            <div
              key={i}
              className="h-1 rounded-full flex-1"
              style={{ backgroundColor: theme.preview.accent, opacity }}
            />
          ))}
        </div>
      </div>

      {/* Label */}
      <div className="px-2 py-1.5 text-xs font-medium text-center text-gray-700 bg-gray-50 truncate">
        {theme.name}
      </div>

      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  );
}

function AccentSwatch({ color, isSelected, onSelect }: {
  color: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-8 h-8 rounded-full transition-all duration-200',
        'hover:scale-110 active:scale-95',
        isSelected ? 'ring-2 ring-offset-2 ring-gray-400' : ''
      )}
      style={{ backgroundColor: color }}
    >
      {isSelected && (
        <Check className="w-4 h-4 text-white mx-auto" />
      )}
    </button>
  );
}

export function ThemePicker({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { themeId, setTheme, customAccent, setCustomAccent, theme: currentTheme } = useTheme();

  const styleThemes = themes.filter((t) => t.category === 'style');
  const colorThemes = themes.filter((t) => t.category === 'color');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[560px] z-50 flex flex-col"
          >
            <div className="bg-theme-surface-solid rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-bold text-gray-900">Theme</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Style Themes */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Style
                  </h3>
                  <div className="grid grid-cols-4 gap-2.5">
                    {styleThemes.map((t) => (
                      <ThemePreviewCard
                        key={t.id}
                        theme={t}
                        isSelected={themeId === t.id}
                        onSelect={() => setTheme(t.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Color Themes */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Color
                  </h3>
                  <div className="grid grid-cols-4 gap-2.5">
                    {colorThemes.map((t) => (
                      <ThemePreviewCard
                        key={t.id}
                        theme={t}
                        isSelected={themeId === t.id}
                        onSelect={() => setTheme(t.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Accent */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Custom Accent
                    </h3>
                    {customAccent && (
                      <button
                        onClick={() => setCustomAccent(null)}
                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Default
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {ACCENT_PRESETS.map((preset) => (
                      <AccentSwatch
                        key={preset.hex}
                        color={preset.hex}
                        isSelected={customAccent === preset.hex}
                        onSelect={() => setCustomAccent(
                          customAccent === preset.hex ? null : preset.hex
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
