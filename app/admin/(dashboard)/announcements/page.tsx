'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useCachedFetch } from '@/hooks/useAdminCache';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone, Plus, Edit, Trash2, Search, Eye, EyeOff, Calendar,
  CheckCircle, Clock, X, Save, RefreshCw, Send, FileText,
  AlertCircle, Wrench, Bell, Sparkles, Loader2,
  Check, XCircle, Mail, Globe, ArrowLeft, Zap, CalendarClock,
  DollarSign, MapPin,
} from 'lucide-react';
import { SkeletonLoader } from '@/components/admin/LoadingSpinner';
import {
  TEMPLATES_V2, TEMPLATE_CATEGORIES, COMMUNICATION_TEMPLATES,
  fillTemplate, generateCommunicationTranslations, generateActionTranslations,
  getTemplateById, getTemplatesByCategory,
} from '@/lib/announcements/templates-v2';
import type { TemplateV2, TemplateCategory, Locale } from '@/lib/announcements/templates-v2';

// ─── Types ──────────────────────────────────────────────────────

interface Announcement {
  id: number;
  title: string;
  category: string;
  type: string;
  content: string;
  isPublished: boolean;
  publishedAt?: string | null;
  publishDate?: string | null;
  templateId?: string | null;
  actionPayload?: Record<string, any> | null;
  actionExecutedAt?: string | null;
  scheduledFor?: string | null;
  scheduledStatus?: string | null;
  emailSentAt?: string | null;
  emailSentCount?: number;
  translations?: Record<string, { title: string; content: string }> | null;
  createdAt?: string;
}

interface CityPricing {
  id: number;
  city: string;
  serviceFee: number;
  pricePerLb: number;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  perfumeDaysMin: number;
  perfumeDaysMax: number;
}

interface SpecialItem {
  id: number;
  category: string;
  brand: string;
  itemName: string;
  minModel: string | null;
  maxModel: string | null;
  fixedFee: string; // Drizzle returns decimal as string
  description: string | null;
}

interface Warehouse {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string | null;
  openingHours: string | null;
  latitude: string | null;
  longitude: string | null;
  isActive: boolean;
}

interface BroadcastProgress {
  type: 'start' | 'progress' | 'complete' | 'config_updated' | 'announcement_created' | 'emails_complete' | 'push_sent' | 'error';
  sent: number;
  failed: number;
  total: number;
  lastEmail?: string;
  lastUser?: string;
  lastLang?: string;
  status?: string;
  message?: string;
}

// ─── Template color/icon maps ───────────────────────────────────

const templateColorClasses: Record<string, string> = {
  amber: 'bg-amber-50 border-amber-200 text-amber-800 hover:border-amber-400',
  red: 'bg-red-50 border-red-200 text-red-800 hover:border-red-400',
  blue: 'bg-blue-50 border-blue-200 text-blue-800 hover:border-blue-400',
  purple: 'bg-purple-50 border-purple-200 text-purple-800 hover:border-purple-400',
  orange: 'bg-orange-50 border-orange-200 text-orange-800 hover:border-orange-400',
  green: 'bg-green-50 border-green-200 text-green-800 hover:border-green-400',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:border-emerald-400',
};

const categoryTabColors: Record<string, string> = {
  pricing: 'border-amber-500 text-amber-700 bg-amber-50',
  loyalty: 'border-emerald-500 text-emerald-700 bg-emerald-50',
  operations: 'border-blue-500 text-blue-700 bg-blue-50',
  communication: 'border-purple-500 text-purple-700 bg-purple-50',
};

const categoryColors: Record<string, string> = {
  news: 'bg-blue-100 text-blue-800',
  alert: 'bg-red-100 text-red-800',
  promo: 'bg-purple-100 text-purple-800',
  maintenance: 'bg-orange-100 text-orange-800',
};

const langFlags: Record<string, string> = { en: '🇺🇸', fr: '🇫🇷', ht: '🇭🇹', es: '🇩🇴' };

// City GPS coordinates (Haiti)
const CITY_COORDINATES: Record<string, { lat: string; lng: string }> = {
  'Port-au-Prince': { lat: '18.5400', lng: '-72.3400' },
  'Cap-Haïtien': { lat: '19.7600', lng: '-72.2000' },
  'Port-de-Paix': { lat: '19.9500', lng: '-72.8300' },
  'Les Cayes': { lat: '18.2000', lng: '-73.7500' },
  'Gonaïves': { lat: '19.4500', lng: '-72.6800' },
  'Jacmel': { lat: '18.2300', lng: '-72.5400' },
  'Jérémie': { lat: '18.6500', lng: '-74.1200' },
  'Hinche': { lat: '19.1500', lng: '-72.0200' },
};

// ─── Component ──────────────────────────────────────────────────

export default function AnnouncementsPage() {
  // ─── View State ─────────────────────────────────────────────
  const [view, setView] = useState<'list' | 'create'>('list');
  const [activeTab, setActiveTab] = useState<TemplateCategory>('pricing');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateV2 | null>(null);
  const [previewLang, setPreviewLang] = useState<Locale>('fr');

  // ─── List State ─────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // ─── Form State (Action templates) ──────────────────────────
  const [cityData, setCityData] = useState<CityPricing[]>([]);
  const [specialItems, setSpecialItems] = useState<SpecialItem[]>([]);
  const [warehouseData, setWarehouseData] = useState<Warehouse[]>([]);
  const [loyaltyConfigs, setLoyaltyConfigs] = useState<{ key: string; value: number }[]>([]);
  const [loadingFormData, setLoadingFormData] = useState(false);

  // City fee change
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [cityFeeChanges, setCityFeeChanges] = useState<Record<string, { newServiceFee: string; newPricePerLb: string }>>({});

  // Delivery time change
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [deliveryTimeForm, setDeliveryTimeForm] = useState({ newDeliveryDaysMin: '', newDeliveryDaysMax: '', newPerfumeDaysMin: '', newPerfumeDaysMax: '' });

  // Loyalty rate change
  const [loyaltyChanges, setLoyaltyChanges] = useState<Record<string, string>>({});

  // Special item forms
  const [specialItemForm, setSpecialItemForm] = useState({ category: 'phone', brand: '', itemName: '', minModel: '', maxModel: '', fixedFee: '', description: '' });
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [modifyItemForm, setModifyItemForm] = useState({ category: '', brand: '', itemName: '', minModel: '', maxModel: '', fixedFee: '', description: '' });

  // Warehouse forms
  const [warehouseForm, setWarehouseForm] = useState({ name: '', city: '', address: '', phone: '', openingHours: '', latitude: '', longitude: '' });
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [modifyWarehouseForm, setModifyWarehouseForm] = useState({ name: '', city: '', address: '', phone: '', openingHours: '', latitude: '', longitude: '' });
  const [warehouseCloseReason, setWarehouseCloseReason] = useState('');

  // Communication template variables
  const [commVars, setCommVars] = useState<Record<string, string>>({});

  // Scheduling
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('now');
  const [scheduledDate, setScheduledDate] = useState('');

  // Submit state
  const [submitting, setSubmitting] = useState(false);

  // Broadcast modal
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState<BroadcastProgress | null>(null);
  const [broadcastLog, setBroadcastLog] = useState<{ email: string; user: string; lang: string; status: string }[]>([]);
  const [broadcastStep, setBroadcastStep] = useState<string>('');
  const logEndRef = useRef<HTMLDivElement>(null);

  // ─── Data Fetching ──────────────────────────────────────────

  const fetchAnnouncements = useCallback(async () => {
    const response = await fetch('/api/admin/announcements');
    if (!response.ok) throw new Error('Failed to fetch announcements');
    const data = await response.json();
    return data.announcements || [];
  }, []);

  const { data, loading, refreshing, refresh } = useCachedFetch<Announcement[]>(
    'admin-announcements', fetchAnnouncements,
  );

  const announcements = data || [];

  // Fetch form data when selecting an action template
  const fetchFormData = useCallback(async (templateId: string) => {
    setLoadingFormData(true);
    try {
      if (['city_fee_change', 'delivery_time_change', 'new_city', 'remove_city'].includes(templateId)) {
        const res = await fetch('/api/pricing/all');
        const data = await res.json();
        setCityData(data.cities || []);
      }
      if (['new_special_item', 'modify_special_item', 'remove_special_item'].includes(templateId)) {
        const res = await fetch('/api/admin/special-items');
        const data = await res.json();
        setSpecialItems(data.items || []);
      }
      if (['new_warehouse', 'modify_warehouse', 'close_warehouse', 'remove_warehouse'].includes(templateId)) {
        const res = await fetch('/api/admin/warehouses');
        const data = await res.json();
        setWarehouseData(data.warehouses || []);
      }
      if (templateId === 'loyalty_rate_change') {
        const res = await fetch('/api/admin/loyalty/config');
        const data = await res.json();
        const configs = (data.configs || []).filter((c: any) => c.key !== 'credit_per_referral');
        setLoyaltyConfigs(configs.map((c: any) => ({ key: c.key, value: c.value })));
        const initial: Record<string, string> = {};
        configs.forEach((c: any) => { initial[c.key] = String(c.value); });
        setLoyaltyChanges(initial);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setLoadingFormData(false);
    }
  }, []);

  // ─── Template Selection ─────────────────────────────────────

  const handleSelectTemplate = (template: TemplateV2) => {
    setSelectedTemplate(template);
    // Reset all form state
    setSelectedCities([]);
    setCityFeeChanges({});
    setSelectedCity('');
    setDeliveryTimeForm({ newDeliveryDaysMin: '', newDeliveryDaysMax: '', newPerfumeDaysMin: '', newPerfumeDaysMax: '' });
    setLoyaltyChanges({});
    setSpecialItemForm({ category: 'phone', brand: '', itemName: '', minModel: '', maxModel: '', fixedFee: '', description: '' });
    setSelectedItemId(null);
    setModifyItemForm({ category: '', brand: '', itemName: '', minModel: '', maxModel: '', fixedFee: '', description: '' });
    setWarehouseForm({ name: '', city: '', address: '', phone: '', openingHours: '', latitude: '', longitude: '' });
    setSelectedWarehouseId(null);
    setModifyWarehouseForm({ name: '', city: '', address: '', phone: '', openingHours: '', latitude: '', longitude: '' });
    setWarehouseCloseReason('');
    setCommVars({});
    setScheduleMode('now');
    setScheduledDate('');

    // Init communication vars
    if (!template.isAction && COMMUNICATION_TEMPLATES[template.id]) {
      const vars: Record<string, string> = {};
      COMMUNICATION_TEMPLATES[template.id].variables.forEach((v) => { vars[v.key] = ''; });
      setCommVars(vars);
    }

    // Fetch data for action templates
    if (template.isAction) {
      fetchFormData(template.id);
    }
  };

  // ─── Build Action Payload ───────────────────────────────────

  const buildActionPayload = (): Record<string, any> | null => {
    if (!selectedTemplate?.isAction) return null;

    switch (selectedTemplate.id) {
      case 'city_fee_change': {
        const cities = selectedCities.map((cityName) => {
          const current = cityData.find((c) => c.city === cityName);
          const changes = cityFeeChanges[cityName] || {};
          return {
            city: cityName,
            oldServiceFee: current?.serviceFee || 0,
            newServiceFee: parseFloat(changes.newServiceFee) || current?.serviceFee || 0,
            oldPricePerLb: current?.pricePerLb || 0,
            newPricePerLb: parseFloat(changes.newPricePerLb) || current?.pricePerLb || 0,
          };
        }).filter((c) => c.oldServiceFee !== c.newServiceFee || c.oldPricePerLb !== c.newPricePerLb);
        if (cities.length === 0) return null;
        return { cities };
      }
      case 'delivery_time_change': {
        const current = cityData.find((c) => c.city === selectedCity);
        if (!current) return null;
        return {
          city: selectedCity,
          oldDeliveryDaysMin: current.deliveryDaysMin,
          oldDeliveryDaysMax: current.deliveryDaysMax,
          newDeliveryDaysMin: parseInt(deliveryTimeForm.newDeliveryDaysMin) || current.deliveryDaysMin,
          newDeliveryDaysMax: parseInt(deliveryTimeForm.newDeliveryDaysMax) || current.deliveryDaysMax,
          oldPerfumeDaysMin: current.perfumeDaysMin,
          oldPerfumeDaysMax: current.perfumeDaysMax,
          newPerfumeDaysMin: parseInt(deliveryTimeForm.newPerfumeDaysMin) || current.perfumeDaysMin,
          newPerfumeDaysMax: parseInt(deliveryTimeForm.newPerfumeDaysMax) || current.perfumeDaysMax,
        };
      }
      case 'loyalty_rate_change': {
        const changes = loyaltyConfigs
          .map((c) => ({
            key: c.key,
            oldValue: c.value,
            newValue: parseFloat(loyaltyChanges[c.key]) || c.value,
          }))
          .filter((c) => c.oldValue !== c.newValue);
        if (changes.length === 0) return null;
        return { changes };
      }
      case 'new_special_item':
        if (!specialItemForm.brand || !specialItemForm.itemName || !specialItemForm.fixedFee) return null;
        return {
          category: specialItemForm.category,
          brand: specialItemForm.brand,
          itemName: specialItemForm.itemName,
          minModel: specialItemForm.minModel || undefined,
          maxModel: specialItemForm.maxModel || undefined,
          fixedFee: parseFloat(specialItemForm.fixedFee),
          description: specialItemForm.description || undefined,
        };
      case 'modify_special_item': {
        const item = specialItems.find((i) => i.id === selectedItemId);
        if (!item || !modifyItemForm.fixedFee) return null;
        return {
          itemId: item.id,
          oldCategory: item.category,
          newCategory: modifyItemForm.category,
          oldBrand: item.brand,
          newBrand: modifyItemForm.brand,
          oldItemName: item.itemName,
          newItemName: modifyItemForm.itemName,
          oldMinModel: item.minModel,
          newMinModel: modifyItemForm.minModel || null,
          oldMaxModel: item.maxModel,
          newMaxModel: modifyItemForm.maxModel || null,
          oldFixedFee: item.fixedFee,
          newFixedFee: parseFloat(modifyItemForm.fixedFee),
          oldDescription: item.description,
          newDescription: modifyItemForm.description || null,
        };
      }
      case 'remove_special_item': {
        const item = specialItems.find((i) => i.id === selectedItemId);
        if (!item) return null;
        return { itemId: item.id, itemName: item.itemName, brand: item.brand };
      }
      case 'new_warehouse':
        if (!warehouseForm.name || !warehouseForm.city || !warehouseForm.address) return null;
        return { ...warehouseForm };
      case 'modify_warehouse': {
        const wh = warehouseData.find((w) => w.id === selectedWarehouseId);
        if (!wh || !modifyWarehouseForm.name) return null;
        return {
          warehouseId: wh.id,
          oldName: wh.name,
          newName: modifyWarehouseForm.name,
          oldCity: wh.city,
          newCity: modifyWarehouseForm.city,
          oldAddress: wh.address,
          newAddress: modifyWarehouseForm.address,
          oldPhone: wh.phone,
          newPhone: modifyWarehouseForm.phone || null,
          oldOpeningHours: wh.openingHours,
          newOpeningHours: modifyWarehouseForm.openingHours || null,
          oldLatitude: wh.latitude,
          newLatitude: modifyWarehouseForm.latitude || null,
          oldLongitude: wh.longitude,
          newLongitude: modifyWarehouseForm.longitude || null,
        };
      }
      case 'close_warehouse': {
        const wh = warehouseData.find((w) => w.id === selectedWarehouseId);
        if (!wh) return null;
        return { warehouseId: wh.id, name: wh.name, city: wh.city, reason: warehouseCloseReason || undefined };
      }
      case 'remove_warehouse': {
        const wh = warehouseData.find((w) => w.id === selectedWarehouseId);
        if (!wh) return null;
        return { warehouseId: wh.id, name: wh.name, city: wh.city, reason: warehouseCloseReason || undefined };
      }
      case 'new_city': {
        if (!warehouseForm.city || !warehouseForm.latitude || !warehouseForm.longitude) return null;
        return {
          city: warehouseForm.city,
          serviceFee: parseFloat(cityFeeChanges[warehouseForm.city]?.newServiceFee || '5.00'),
          pricePerLb: parseFloat(cityFeeChanges[warehouseForm.city]?.newPricePerLb || '4.00'),
          deliveryDaysMin: parseInt(deliveryTimeForm.newDeliveryDaysMin) || 3,
          deliveryDaysMax: parseInt(deliveryTimeForm.newDeliveryDaysMax) || 6,
          perfumeDaysMin: parseInt(deliveryTimeForm.newPerfumeDaysMin) || 8,
          perfumeDaysMax: parseInt(deliveryTimeForm.newPerfumeDaysMax) || 11,
        };
      }
      case 'remove_city': {
        if (!selectedCity) return null;
        return { city: selectedCity, reason: warehouseCloseReason || undefined };
      }
      default:
        return null;
    }
  };

  // ─── Get Preview Text ───────────────────────────────────────

  const getPreview = (): { title: string; content: string } | null => {
    if (!selectedTemplate) return null;

    if (selectedTemplate.isAction) {
      const payload = buildActionPayload();
      if (!payload) return null;
      const translations = generateActionTranslations(selectedTemplate.id, payload);
      return translations[previewLang] || null;
    } else {
      const tmpl = COMMUNICATION_TEMPLATES[selectedTemplate.id];
      if (!tmpl) return null;
      return {
        title: fillTemplate(tmpl.title[previewLang], commVars),
        content: fillTemplate(tmpl.content[previewLang], commVars),
      };
    }
  };

  // ─── Submit Handler ─────────────────────────────────────────

  const handleSubmit = async () => {
    if (!selectedTemplate) return;
    setSubmitting(true);

    try {
      // ⭐ Handle special item actions DIRECTLY (not via announcements)
      if (selectedTemplate.id === 'new_special_item') {
        // Create new special item
        const response = await fetch('/api/admin/special-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: specialItemForm.category,
            brand: specialItemForm.brand,
            itemName: specialItemForm.itemName,
            minModel: specialItemForm.minModel || undefined,
            maxModel: specialItemForm.maxModel || undefined,
            fixedFee: parseFloat(specialItemForm.fixedFee),
            description: specialItemForm.description || undefined,
            isActive: true,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to create special item');
        }

        alert('✅ Article spécial créé avec succès!');
        setView('list');
        setSelectedTemplate(null);
        refresh();
        setSubmitting(false);
        return;
      }

      if (selectedTemplate.id === 'modify_special_item') {
        // Modify existing special item
        if (!selectedItemId) {
          alert('Veuillez sélectionner un article à modifier');
          setSubmitting(false);
          return;
        }

        const response = await fetch(`/api/admin/special-items/${selectedItemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: modifyItemForm.category,
            brand: modifyItemForm.brand,
            itemName: modifyItemForm.itemName,
            minModel: modifyItemForm.minModel || undefined,
            maxModel: modifyItemForm.maxModel || undefined,
            fixedFee: parseFloat(modifyItemForm.fixedFee),
            description: modifyItemForm.description || undefined,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to update special item');
        }

        alert('✅ Article spécial modifié avec succès!');
        setView('list');
        setSelectedTemplate(null);
        refresh();
        setSubmitting(false);
        return;
      }

      if (selectedTemplate.id === 'remove_special_item') {
        // Delete/deactivate special item
        if (!selectedItemId) {
          alert('Veuillez sélectionner un article à supprimer');
          setSubmitting(false);
          return;
        }

        const response = await fetch(`/api/admin/special-items/${selectedItemId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to delete special item');
        }

        alert('✅ Article spécial désactivé avec succès!');
        setView('list');
        setSelectedTemplate(null);
        refresh();
        setSubmitting(false);
        return;
      }

      // ⭐ Continue with normal announcement flow for other templates
      const isAction = selectedTemplate.isAction;
      const actionPayload = isAction ? buildActionPayload() : null;

      if (isAction && !actionPayload) {
        alert('No changes detected. Please modify at least one value.');
        setSubmitting(false);
        return;
      }

      // Build request body
      const body: Record<string, any> = {
        templateId: selectedTemplate.id,
        category: selectedTemplate.type,
        isPublished: true,
      };

      if (isAction) {
        body.actionPayload = actionPayload;
        // Generate title/content from translations
        const translations = generateActionTranslations(selectedTemplate.id, actionPayload!);
        body.title = translations.en?.title || selectedTemplate.name.en;
        body.content = translations.en?.content || '';
      } else {
        body.variables = commVars;
        const translations = generateCommunicationTranslations(selectedTemplate.id, commVars);
        body.title = translations.en?.title || '';
        body.content = translations.en?.content || '';
      }

      if (scheduleMode === 'schedule' && scheduledDate) {
        body.scheduledFor = scheduledDate;
      }

      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create announcement');
      }

      const result = await response.json();

      if (scheduleMode === 'schedule') {
        // Scheduled - no broadcast now
        alert('Announcement scheduled successfully!');
        setView('list');
        setSelectedTemplate(null);
        refresh();
      } else {
        // Immediate - start broadcast
        startBroadcast(result.announcement.id);
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Broadcast ──────────────────────────────────────────────

  const startBroadcast = async (announcementId: number) => {
    setBroadcastModal(true);
    setBroadcastProgress(null);
    setBroadcastLog([]);
    setBroadcastStep('Preparing...');

    try {
      const response = await fetch('/api/admin/announcements/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementId }),
      });

      if (!response.ok || !response.body) throw new Error('Failed to start broadcast');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === 'start') {
                setBroadcastStep('Sending emails...');
                setBroadcastProgress({ type: 'start', sent: 0, failed: 0, total: event.total });
              } else if (event.type === 'progress') {
                setBroadcastProgress(event);
                setBroadcastLog((prev) => [...prev, {
                  email: event.lastEmail, user: event.lastUser,
                  lang: event.lastLang, status: event.status,
                }]);
              } else if (event.type === 'complete') {
                setBroadcastStep('Complete!');
                setBroadcastProgress(event);
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error('Broadcast error:', error);
      setBroadcastStep('Error');
      setBroadcastProgress((prev) => prev ? { ...prev, type: 'complete' } : { type: 'complete', sent: 0, failed: 0, total: 0 });
    }
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [broadcastLog]);

  // ─── List Handlers ──────────────────────────────────────────

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const response = await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      refresh();
    } catch { alert('Failed to delete announcement'); }
  };

  const handleCancelScheduled = async (id: number) => {
    try {
      await fetch('/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'cancel_scheduled' }),
      });
      refresh();
    } catch { alert('Failed to cancel'); }
  };

  // ─── Helpers ────────────────────────────────────────────────

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const filteredAnnouncements = announcements.filter((a: Announcement) => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || a.type === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const preview = selectedTemplate ? getPreview() : null;

  // ─── Loading ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 flex-1 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
        <SkeletonLoader rows={5} />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // CREATE VIEW
  // ═══════════════════════════════════════════════════════════════

  if (view === 'create') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => { setView('list'); setSelectedTemplate(null); }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedTemplate ? selectedTemplate.name.fr : 'Announcements Hub'}
            </h1>
            <p className="text-sm text-gray-500">
              {selectedTemplate ? selectedTemplate.description.fr : 'Choose a template to get started'}
            </p>
          </div>
        </div>

        {/* If no template selected: show category tabs + template grid */}
        {!selectedTemplate && (
          <>
            {/* Category Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-0">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => setActiveTab(cat.id)}
                  className={`px-4 py-3 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${
                    activeTab === cat.id
                      ? categoryTabColors[cat.id]
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}>
                  {cat.icon} {cat.name.fr}
                </button>
              ))}
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getTemplatesByCategory(activeTab).map((tmpl) => (
                <motion.button key={tmpl.id} onClick={() => handleSelectTemplate(tmpl)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${templateColorClasses[tmpl.color]}`}>
                  <span className="text-3xl mb-3 block">{tmpl.icon}</span>
                  <span className="font-bold text-base block">{tmpl.name.fr}</span>
                  <span className="text-xs opacity-70 block mt-1">{tmpl.description.fr}</span>
                  {tmpl.isAction && (
                    <span className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-white/60 rounded-full text-xs font-semibold">
                      <Zap className="h-3 w-3" /> Action DB
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </>
        )}

        {/* Template Form */}
        {selectedTemplate && (
          <div className="theme-card rounded-2xl p-6 shadow-sm border-2 border-primary-200">
            {loadingFormData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                <span className="ml-3 text-gray-600">Loading current data...</span>
              </div>
            ) : (
              <>
                {/* ─── ACTION TEMPLATE FORMS ─────────────────── */}

                {/* City Fee Change */}
                {selectedTemplate.id === 'city_fee_change' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-amber-600" />
                      Select Cities to Update
                    </h3>
                    <div className="space-y-3">
                      {cityData.map((city) => (
                        <motion.div
                          key={city.city}
                          whileHover={{ scale: 1.01 }}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedCities.includes(city.city)
                              ? 'border-amber-400 bg-amber-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-amber-200'
                          }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCities.includes(city.city)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCities([...selectedCities, city.city]);
                                  setCityFeeChanges((prev) => ({
                                    ...prev,
                                    [city.city]: { newServiceFee: String(city.serviceFee), newPricePerLb: String(city.pricePerLb) },
                                  }));
                                } else {
                                  setSelectedCities(selectedCities.filter((c) => c !== city.city));
                                }
                              }}
                              className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                            <div className="p-2 bg-amber-100 rounded-lg">
                              <span className="text-xl">📍</span>
                            </div>
                            <div className="flex-1">
                              <span className="font-bold text-gray-900 block">{city.city}</span>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  Service: ${city.serviceFee.toFixed(2)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  Per lb: ${city.pricePerLb.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </label>

                          <AnimatePresence>
                            {selectedCities.includes(city.city) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pl-11 grid grid-cols-1 sm:grid-cols-2 gap-3"
                              >
                                <div>
                                  <label className="flex items-center gap-1 text-xs font-semibold text-gray-700 mb-2">
                                    <DollarSign className="h-3 w-3 text-amber-600" />
                                    New Service Fee
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={cityFeeChanges[city.city]?.newServiceFee || ''}
                                    onChange={(e) => setCityFeeChanges((prev) => ({
                                      ...prev, [city.city]: { ...prev[city.city], newServiceFee: e.target.value },
                                    }))}
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-semibold"
                                  />
                                </div>
                                <div>
                                  <label className="flex items-center gap-1 text-xs font-semibold text-gray-700 mb-2">
                                    <DollarSign className="h-3 w-3 text-amber-600" />
                                    New Price/lb
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={cityFeeChanges[city.city]?.newPricePerLb || ''}
                                    onChange={(e) => setCityFeeChanges((prev) => ({
                                      ...prev, [city.city]: { ...prev[city.city], newPricePerLb: e.target.value },
                                    }))}
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-semibold"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Time Change */}
                {selectedTemplate.id === 'delivery_time_change' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary-600" />
                      Select City
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {cityData.map((city) => (
                        <motion.button
                          key={city.city}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedCity(city.city);
                            setDeliveryTimeForm({
                              newDeliveryDaysMin: String(city.deliveryDaysMin),
                              newDeliveryDaysMax: String(city.deliveryDaysMax),
                              newPerfumeDaysMin: String(city.perfumeDaysMin),
                              newPerfumeDaysMax: String(city.perfumeDaysMax),
                            });
                          }}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            selectedCity === city.city
                              ? 'border-primary-500 bg-primary-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">📍</span>
                            <span className="font-bold text-gray-900">{city.city}</span>
                          </div>
                          <div className="text-xs text-gray-500 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {city.deliveryDaysMin}-{city.deliveryDaysMax} days
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    {selectedCity && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      >
                        <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                          <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <span className="text-2xl">📦</span>
                            Standard Delivery
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="flex items-center gap-1 text-xs font-semibold text-blue-700 mb-2">
                                <ArrowLeft className="h-3 w-3" />
                                Min Days
                              </label>
                              <input
                                type="number"
                                value={deliveryTimeForm.newDeliveryDaysMin}
                                onChange={(e) => setDeliveryTimeForm((prev) => ({ ...prev, newDeliveryDaysMin: e.target.value }))}
                                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="flex items-center gap-1 text-xs font-semibold text-blue-700 mb-2">
                                <ArrowLeft className="h-3 w-3 rotate-180" />
                                Max Days
                              </label>
                              <input
                                type="number"
                                value={deliveryTimeForm.newDeliveryDaysMax}
                                onChange={(e) => setDeliveryTimeForm((prev) => ({ ...prev, newDeliveryDaysMax: e.target.value }))}
                                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                          <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                            <span className="text-2xl">🧴</span>
                            Perfume/Restricted
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="flex items-center gap-1 text-xs font-semibold text-purple-700 mb-2">
                                <ArrowLeft className="h-3 w-3" />
                                Min Days
                              </label>
                              <input
                                type="number"
                                value={deliveryTimeForm.newPerfumeDaysMin}
                                onChange={(e) => setDeliveryTimeForm((prev) => ({ ...prev, newPerfumeDaysMin: e.target.value }))}
                                className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              />
                            </div>
                            <div>
                              <label className="flex items-center gap-1 text-xs font-semibold text-purple-700 mb-2">
                                <ArrowLeft className="h-3 w-3 rotate-180" />
                                Max Days
                              </label>
                              <input
                                type="number"
                                value={deliveryTimeForm.newPerfumeDaysMax}
                                onChange={(e) => setDeliveryTimeForm((prev) => ({ ...prev, newPerfumeDaysMax: e.target.value }))}
                                className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Loyalty Rate Change */}
                {selectedTemplate.id === 'loyalty_rate_change' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-emerald-600" />
                      Modify Loyalty Rates
                    </h3>
                    <div className="grid gap-3">
                      {loyaltyConfigs.map((config) => {
                        const isPoints = config.key.includes('points');
                        const getIcon = (key: string) => {
                          if (key.includes('shipment')) return { icon: '📦', color: 'emerald' };
                          if (key.includes('lb')) return { icon: '⚖️', color: 'blue' };
                          if (key.includes('points')) return { icon: '⭐', color: 'purple' };
                          return { icon: '💰', color: 'amber' };
                        };
                        const { icon, color } = getIcon(config.key);
                        return (
                          <motion.div
                            key={config.key}
                            whileHover={{ scale: 1.01 }}
                            className={`flex items-center gap-4 p-4 bg-${color}-50 border-2 border-${color}-200 rounded-xl transition-all hover:shadow-md`}
                          >
                            <div className={`p-3 bg-${color}-100 rounded-lg`}>
                              <span className="text-2xl">{icon}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900">
                                {config.key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <span>Current:</span>
                                <span className="font-semibold">
                                  {isPoints ? `${config.value} pts` : `$${config.value.toFixed(2)}`}
                                </span>
                              </p>
                            </div>
                            <div className="w-32">
                              <div className="relative">
                                <input
                                  type="number"
                                  step={isPoints ? '1' : '0.01'}
                                  value={loyaltyChanges[config.key] || ''}
                                  onChange={(e) => setLoyaltyChanges((prev) => ({ ...prev, [config.key]: e.target.value }))}
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                  placeholder={isPoints ? config.value.toString() : config.value.toFixed(2)}
                                />
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* New Special Item */}
                {selectedTemplate.id === 'new_special_item' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Plus className="h-5 w-5 text-green-600" />
                      Create New Special Item
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          Category
                        </label>
                        <select
                          value={specialItemForm.category}
                          onChange={(e) => setSpecialItemForm((prev) => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="phone">📱 Phone</option>
                          <option value="tablet">📱 Tablet</option>
                          <option value="electronics">💻 Electronics</option>
                          <option value="satellite">📡 Satellite</option>
                          <option value="other">📦 Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <Sparkles className="h-4 w-4 text-green-600" />
                          Brand *
                        </label>
                        <input
                          type="text"
                          value={specialItemForm.brand}
                          placeholder="Apple, Samsung..."
                          onChange={(e) => setSpecialItemForm((prev) => ({ ...prev, brand: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          Item Name *
                        </label>
                        <input
                          type="text"
                          value={specialItemForm.itemName}
                          placeholder="iPhone Series"
                          onChange={(e) => setSpecialItemForm((prev) => ({ ...prev, itemName: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          Fixed Fee ($) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={specialItemForm.fixedFee}
                          placeholder="25.00"
                          onChange={(e) => setSpecialItemForm((prev) => ({ ...prev, fixedFee: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <ArrowLeft className="h-4 w-4 text-green-600" />
                          Min Model
                        </label>
                        <input
                          type="text"
                          value={specialItemForm.minModel}
                          placeholder="7"
                          onChange={(e) => setSpecialItemForm((prev) => ({ ...prev, minModel: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <ArrowLeft className="h-4 w-4 text-green-600 rotate-180" />
                          Max Model
                        </label>
                        <input
                          type="text"
                          value={specialItemForm.maxModel}
                          placeholder="16"
                          onChange={(e) => setSpecialItemForm((prev) => ({ ...prev, maxModel: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          Description (optional)
                        </label>
                        <input
                          type="text"
                          value={specialItemForm.description}
                          placeholder="Optional description..."
                          onChange={(e) => setSpecialItemForm((prev) => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Modify Special Item */}
                {selectedTemplate.id === 'modify_special_item' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      Select Item to Modify
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                      {specialItems.map((item) => {
                        const modelRange = item.minModel && item.maxModel
                          ? ` [${item.minModel}-${item.maxModel}]`
                          : item.minModel
                            ? ` [${item.minModel}]`
                            : item.maxModel
                              ? ` [${item.maxModel}]`
                              : '';
                        const categoryIcons: Record<string, string> = {
                          phone: '📱',
                          tablet: '📱',
                          electronics: '💻',
                          satellite: '📡',
                          other: '📦',
                        };
                        return (
                          <motion.button
                            key={item.id}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedItemId(item.id);
                              setModifyItemForm({
                                category: item.category,
                                brand: item.brand,
                                itemName: item.itemName,
                                minModel: item.minModel || '',
                                maxModel: item.maxModel || '',
                                fixedFee: String(item.fixedFee),
                                description: item.description || '',
                              });
                            }}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              selectedItemId === item.id
                                ? 'border-purple-500 bg-purple-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{categoryIcons[item.category] || '📦'}</span>
                                <div>
                                  <div className="font-bold text-gray-900 text-sm">
                                    {item.brand} {item.itemName}
                                  </div>
                                  {modelRange && (
                                    <div className="text-xs text-gray-500">{modelRange}</div>
                                  )}
                                </div>
                              </div>
                              <span className="text-lg font-bold text-primary-600">
                                ${parseFloat(item.fixedFee).toFixed(2)}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                    {selectedItemId && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200"
                      >
                        <div className="col-span-2">
                          <h4 className="font-semibold text-purple-900 flex items-center gap-2 mb-3">
                            <Edit className="h-4 w-4" />
                            Edit Item Details
                          </h4>
                        </div>
                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                            <FileText className="h-4 w-4 text-purple-600" />
                            Category
                          </label>
                          <select
                            value={modifyItemForm.category}
                            onChange={(e) => setModifyItemForm((prev) => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          >
                            <option value="phone">📱 Phone</option>
                            <option value="tablet">📱 Tablet</option>
                            <option value="electronics">💻 Electronics</option>
                            <option value="satellite">📡 Satellite</option>
                            <option value="other">📦 Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            Brand
                          </label>
                          <input
                            type="text"
                            value={modifyItemForm.brand}
                            onChange={(e) => setModifyItemForm((prev) => ({ ...prev, brand: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                            <FileText className="h-4 w-4 text-purple-600" />
                            Item Name
                          </label>
                          <input
                            type="text"
                            value={modifyItemForm.itemName}
                            onChange={(e) => setModifyItemForm((prev) => ({ ...prev, itemName: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                            <DollarSign className="h-4 w-4 text-purple-600" />
                            Fixed Fee ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={modifyItemForm.fixedFee}
                            onChange={(e) => setModifyItemForm((prev) => ({ ...prev, fixedFee: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                            <ArrowLeft className="h-4 w-4 text-purple-600" />
                            Min Model
                          </label>
                          <input
                            type="text"
                            value={modifyItemForm.minModel}
                            onChange={(e) => setModifyItemForm((prev) => ({ ...prev, minModel: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                            <ArrowLeft className="h-4 w-4 text-purple-600 rotate-180" />
                            Max Model
                          </label>
                          <input
                            type="text"
                            value={modifyItemForm.maxModel}
                            onChange={(e) => setModifyItemForm((prev) => ({ ...prev, maxModel: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                            <FileText className="h-4 w-4 text-purple-600" />
                            Description
                          </label>
                          <textarea
                            rows={2}
                            value={modifyItemForm.description}
                            onChange={(e) => setModifyItemForm((prev) => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Remove Special Item */}
                {selectedTemplate.id === 'remove_special_item' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Trash2 className="h-5 w-5 text-red-600" />
                      Select Item to Remove
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                      {specialItems.map((item) => {
                        const modelRange = item.minModel && item.maxModel
                          ? ` [${item.minModel}-${item.maxModel}]`
                          : item.minModel
                            ? ` [${item.minModel}]`
                            : item.maxModel
                              ? ` [${item.maxModel}]`
                              : '';
                        const categoryIcons: Record<string, string> = {
                          phone: '📱',
                          tablet: '📱',
                          electronics: '💻',
                          satellite: '📡',
                          other: '📦',
                        };
                        return (
                          <motion.button
                            key={item.id}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedItemId(item.id)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              selectedItemId === item.id
                                ? 'border-red-500 bg-red-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{categoryIcons[item.category] || '📦'}</span>
                                <div>
                                  <div className="font-bold text-gray-900 text-sm">
                                    {item.brand} {item.itemName}
                                  </div>
                                  {modelRange && (
                                    <div className="text-xs text-gray-500">{modelRange}</div>
                                  )}
                                </div>
                              </div>
                              <span className="text-lg font-bold text-primary-600">
                                ${parseFloat(item.fixedFee).toFixed(2)}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* New Warehouse */}
                {selectedTemplate.id === 'new_warehouse' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Plus className="h-5 w-5 text-blue-600" />
                      Create New Warehouse
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <Wrench className="h-4 w-4 text-blue-600" />
                          Warehouse Name *
                        </label>
                        <input
                          type="text"
                          value={warehouseForm.name}
                          placeholder="Dépôt Delmas"
                          onChange={(e) => setWarehouseForm((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <Globe className="h-4 w-4 text-blue-600" />
                          City *
                        </label>
                        <select
                          value={warehouseForm.city}
                          onChange={(e) => {
                            const city = e.target.value;
                            // Check if we have predefined GPS coordinates for common cities
                            const coords = CITY_COORDINATES[city] || { lat: '', lng: '' };
                            setWarehouseForm((prev) => ({
                              ...prev,
                              city,
                              // Auto-fill GPS if available from predefined list, otherwise leave empty for manual entry
                              latitude: coords.lat,
                              longitude: coords.lng
                            }));
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-- Select City --</option>
                          {cityData.map((cityObj) => (
                            <option key={cityObj.city} value={cityObj.city}>
                              📍 {cityObj.city}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <Globe className="h-4 w-4 text-blue-600" />
                          Address *
                        </label>
                        <input
                          type="text"
                          value={warehouseForm.address}
                          placeholder="123 Rue Example..."
                          onChange={(e) => setWarehouseForm((prev) => ({ ...prev, address: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <Bell className="h-4 w-4 text-blue-600" />
                          Phone (optional)
                        </label>
                        <input
                          type="text"
                          value={warehouseForm.phone}
                          placeholder="+509 ..."
                          onChange={(e) => setWarehouseForm((prev) => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          Opening Hours (optional)
                        </label>
                        <input
                          type="text"
                          value={warehouseForm.openingHours}
                          placeholder="Lun-Sam 8h-17h"
                          onChange={(e) => setWarehouseForm((prev) => ({ ...prev, openingHours: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          Latitude *
                        </label>
                        <input
                          type="text"
                          value={warehouseForm.latitude}
                          placeholder="18.5400"
                          onChange={(e) => setWarehouseForm((prev) => ({ ...prev, latitude: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-filled from city selection</p>
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          Longitude *
                        </label>
                        <input
                          type="text"
                          value={warehouseForm.longitude}
                          placeholder="-72.3400"
                          onChange={(e) => setWarehouseForm((prev) => ({ ...prev, longitude: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-filled from city selection</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modify Warehouse */}
                {selectedTemplate.id === 'modify_warehouse' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Edit className="h-5 w-5 text-blue-600" />
                      Select Warehouse to Modify
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {warehouseData.filter((w) => w.isActive).map((wh) => (
                        <motion.button
                          key={wh.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedWarehouseId(wh.id);
                            setModifyWarehouseForm({
                              name: wh.name,
                              city: wh.city,
                              address: wh.address,
                              phone: wh.phone || '',
                              openingHours: wh.openingHours || '',
                              latitude: wh.latitude ? String(wh.latitude) : '',
                              longitude: wh.longitude ? String(wh.longitude) : '',
                            });
                          }}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            selectedWarehouseId === wh.id
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Wrench className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 mb-1">{wh.name}</div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                <Globe className="h-3 w-3" />
                                {wh.city}
                              </div>
                              <div className="text-xs text-gray-400 line-clamp-1">{wh.address}</div>
                              {wh.phone && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <Bell className="h-3 w-3" />
                                  {wh.phone}
                                </div>
                              )}
                            </div>
                          </div>
                          {wh.openingHours && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                              <Clock className="h-3 w-3" />
                              {wh.openingHours}
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                    {selectedWarehouseId && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200"
                      >
                        <div className="col-span-2">
                          <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-3">
                            <Edit className="h-4 w-4" />
                            Edit Warehouse Details
                          </h4>
                        </div>
                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                            <Wrench className="h-4 w-4 text-blue-600" />
                            Warehouse Name
                          </label>
                          <input
                            type="text"
                            value={modifyWarehouseForm.name}
                            onChange={(e) => setModifyWarehouseForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                            <Globe className="h-4 w-4 text-blue-600" />
                            City
                          </label>
                          <input
                            type="text"
                            value={modifyWarehouseForm.city}
                            onChange={(e) => setModifyWarehouseForm((prev) => ({ ...prev, city: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                            <Globe className="h-4 w-4 text-blue-600" />
                            Address
                          </label>
                          <input
                            type="text"
                            value={modifyWarehouseForm.address}
                            onChange={(e) => setModifyWarehouseForm((prev) => ({ ...prev, address: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                            <Bell className="h-4 w-4 text-blue-600" />
                            Phone
                          </label>
                          <input
                            type="text"
                            value={modifyWarehouseForm.phone}
                            onChange={(e) => setModifyWarehouseForm((prev) => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            Opening Hours
                          </label>
                          <input
                            type="text"
                            value={modifyWarehouseForm.openingHours}
                            onChange={(e) => setModifyWarehouseForm((prev) => ({ ...prev, openingHours: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            Latitude
                          </label>
                          <input
                            type="text"
                            value={modifyWarehouseForm.latitude}
                            placeholder="18.5400"
                            onChange={(e) => setModifyWarehouseForm((prev) => ({ ...prev, latitude: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            Longitude
                          </label>
                          <input
                            type="text"
                            value={modifyWarehouseForm.longitude}
                            placeholder="-72.3400"
                            onChange={(e) => setModifyWarehouseForm((prev) => ({ ...prev, longitude: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Close Warehouse */}
                {selectedTemplate.id === 'close_warehouse' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      Select Warehouse to Close
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {warehouseData.filter((w) => w.isActive).map((wh) => (
                        <motion.button
                          key={wh.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedWarehouseId(wh.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            selectedWarehouseId === wh.id
                              ? 'border-red-500 bg-red-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-2">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <Wrench className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 mb-1">{wh.name}</div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                <Globe className="h-3 w-3" />
                                {wh.city}
                              </div>
                              <div className="text-xs text-gray-400 line-clamp-1">{wh.address}</div>
                              {wh.phone && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <Bell className="h-3 w-3" />
                                  {wh.phone}
                                </div>
                              )}
                            </div>
                          </div>
                          {wh.openingHours && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                              <Clock className="h-3 w-3" />
                              {wh.openingHours}
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                    {selectedWarehouseId && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200"
                      >
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          Reason for Closure (optional)
                        </label>
                        <input
                          type="text"
                          value={warehouseCloseReason}
                          placeholder="Relocation, renovation, etc."
                          onChange={(e) => setWarehouseCloseReason(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Remove Warehouse */}
                {selectedTemplate.id === 'remove_warehouse' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      Select Warehouse to Delete Permanently
                    </h3>
                    <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                      <p className="text-sm text-red-700 font-medium">
                        ⚠️ Warning: This will permanently DELETE the warehouse from the database. Use &ldquo;Close Warehouse&rdquo; if you want to deactivate instead.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {warehouseData.map((wh) => (
                        <motion.button
                          key={wh.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedWarehouseId(wh.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            selectedWarehouseId === wh.id
                              ? 'border-red-600 bg-red-100 shadow-md'
                              : 'border-gray-200 bg-white hover:border-red-400 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-2">
                            <div className="p-2 bg-red-200 rounded-lg">
                              <Wrench className="h-5 w-5 text-red-700" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 mb-1">{wh.name}</div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                <Globe className="h-3 w-3" />
                                {wh.city}
                              </div>
                              <div className="text-xs text-gray-400 line-clamp-1">{wh.address}</div>
                              <div className="text-xs mt-1">
                                {wh.isActive ? (
                                  <span className="text-green-600 font-medium">Active</span>
                                ) : (
                                  <span className="text-gray-500">Inactive</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    {selectedWarehouseId && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-300"
                      >
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          Reason for Deletion (optional)
                        </label>
                        <input
                          type="text"
                          value={warehouseCloseReason}
                          placeholder="Permanent closure, no longer needed, etc."
                          onChange={(e) => setWarehouseCloseReason(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </motion.div>
                    )}
                  </div>
                )}

                {/* New City */}
                {selectedTemplate.id === 'new_city' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Plus className="h-5 w-5 text-green-600" />
                      Add New City
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                      <div className="sm:col-span-2">
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <Globe className="h-4 w-4 text-green-600" />
                          City Name *
                        </label>
                        <input
                          type="text"
                          value={warehouseForm.city}
                          placeholder="Jacmel, Hinche, Jérémie..."
                          onChange={(e) => setWarehouseForm((prev) => ({ ...prev, city: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          Service Fee ($) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={cityFeeChanges[warehouseForm.city]?.newServiceFee || ''}
                          placeholder="5.00"
                          onChange={(e) => setCityFeeChanges((prev) => ({
                            ...prev,
                            [warehouseForm.city]: { ...prev[warehouseForm.city], newServiceFee: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          Price per Lb ($) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={cityFeeChanges[warehouseForm.city]?.newPricePerLb || ''}
                          placeholder="4.00"
                          onChange={(e) => setCityFeeChanges((prev) => ({
                            ...prev,
                            [warehouseForm.city]: { ...prev[warehouseForm.city], newPricePerLb: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          Delivery Days (Min)
                        </label>
                        <input
                          type="number"
                          value={deliveryTimeForm.newDeliveryDaysMin}
                          placeholder="3"
                          onChange={(e) => setDeliveryTimeForm((prev) => ({ ...prev, newDeliveryDaysMin: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          Delivery Days (Max)
                        </label>
                        <input
                          type="number"
                          value={deliveryTimeForm.newDeliveryDaysMax}
                          placeholder="6"
                          onChange={(e) => setDeliveryTimeForm((prev) => ({ ...prev, newDeliveryDaysMax: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <Sparkles className="h-4 w-4 text-green-600" />
                          Perfume Days (Min)
                        </label>
                        <input
                          type="number"
                          value={deliveryTimeForm.newPerfumeDaysMin}
                          placeholder="8"
                          onChange={(e) => setDeliveryTimeForm((prev) => ({ ...prev, newPerfumeDaysMin: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <Sparkles className="h-4 w-4 text-green-600" />
                          Perfume Days (Max)
                        </label>
                        <input
                          type="number"
                          value={deliveryTimeForm.newPerfumeDaysMax}
                          placeholder="11"
                          onChange={(e) => setDeliveryTimeForm((prev) => ({ ...prev, newPerfumeDaysMax: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <MapPin className="h-4 w-4 text-green-600" />
                          Latitude * (GPS)
                        </label>
                        <input
                          type="text"
                          value={warehouseForm.latitude}
                          placeholder="18.2000"
                          onChange={(e) => setWarehouseForm((prev) => ({ ...prev, latitude: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <MapPin className="h-4 w-4 text-green-600" />
                          Longitude * (GPS)
                        </label>
                        <input
                          type="text"
                          value={warehouseForm.longitude}
                          placeholder="-73.7500"
                          onChange={(e) => setWarehouseForm((prev) => ({ ...prev, longitude: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Remove City */}
                {selectedTemplate.id === 'remove_city' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      Select City to Deactivate
                    </h3>
                    <div className="p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                      <p className="text-sm text-yellow-700 font-medium">
                        ℹ️ Note: This will deactivate the city (isActive = false). It will no longer appear in dropdowns.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {cityData.map((city) => (
                        <motion.button
                          key={city.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedCity(city.city)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            selectedCity === city.city
                              ? 'border-red-500 bg-red-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <MapPin className="h-4 w-4 text-red-600" />
                            </div>
                            <div className="font-bold text-gray-900">{city.city}</div>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Service: ${city.serviceFee}</div>
                            <div>Per Lb: ${city.pricePerLb}</div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    {selectedCity && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200"
                      >
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          Reason for Deactivation (optional)
                        </label>
                        <input
                          type="text"
                          value={warehouseCloseReason}
                          placeholder="No longer served, relocated, etc."
                          onChange={(e) => setWarehouseCloseReason(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ─── COMMUNICATION TEMPLATE FORM ───────────── */}
                {!selectedTemplate.isAction && COMMUNICATION_TEMPLATES[selectedTemplate.id] && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Bell className="h-5 w-5 text-purple-600" />
                      Announcement Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                      {COMMUNICATION_TEMPLATES[selectedTemplate.id].variables.map((v) => (
                        <div key={v.key} className={v.type === 'textarea' ? 'md:col-span-2' : ''}>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                            <FileText className="h-4 w-4 text-purple-600" />
                            {v.label[previewLang]}
                          </label>
                          {v.type === 'textarea' ? (
                            <textarea
                              value={commVars[v.key] || ''}
                              placeholder={v.placeholder}
                              rows={3}
                              onChange={(e) => setCommVars((prev) => ({ ...prev, [v.key]: e.target.value }))}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          ) : (
                            <input
                              type={v.type === 'number' ? 'number' : 'text'}
                              value={commVars[v.key] || ''}
                              placeholder={v.placeholder}
                              onChange={(e) => setCommVars((prev) => ({ ...prev, [v.key]: e.target.value }))}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── PREVIEW ───────────────────────────────── */}
                {preview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-gray-300 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary-600" />
                        Live Preview
                      </h4>
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border-2 border-gray-200">
                        <Globe className="h-4 w-4 text-gray-500" />
                        {(['fr', 'en', 'ht', 'es'] as Locale[]).map((lang) => (
                          <motion.button
                            key={lang}
                            onClick={() => setPreviewLang(lang)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
                              previewLang === lang
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {langFlags[lang]} {lang.toUpperCase()}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <motion.div
                      key={previewLang}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-xl p-5 border-2 border-primary-200 shadow-sm"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <Megaphone className="h-5 w-5 text-primary-600" />
                        </div>
                        <h5 className="font-bold text-gray-900 text-lg flex-1">{preview.title}</h5>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed pl-12">
                        {preview.content}
                      </p>
                    </motion.div>
                  </motion.div>
                )}

                {/* ─── SCHEDULE TOGGLE ────────────────────────── */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="flex flex-wrap items-center gap-3">
                    <motion.button
                      onClick={() => setScheduleMode('now')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                        scheduleMode === 'now'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-2 border-green-600 shadow-md'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                      }`}
                    >
                      <Zap className="h-5 w-5" /> Execute Now
                    </motion.button>
                    <motion.button
                      onClick={() => setScheduleMode('schedule')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                        scheduleMode === 'schedule'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-2 border-blue-600 shadow-md'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <CalendarClock className="h-5 w-5" /> Schedule for Later
                    </motion.button>
                    <AnimatePresence>
                      {scheduleMode === 'schedule' && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Clock className="h-4 w-4 text-gray-500" />
                          <input
                            type="datetime-local"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* ─── SUBMIT ────────────────────────────────── */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <motion.button
                    onClick={handleSubmit}
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.02 }}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                  >
                    {submitting ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : scheduleMode === 'schedule' ? (
                      <CalendarClock className="h-6 w-6" />
                    ) : (
                      <Send className="h-6 w-6" />
                    )}
                    <span className="text-lg">
                      {submitting
                        ? 'Processing...'
                        : scheduleMode === 'schedule'
                        ? 'Schedule Announcement'
                        : 'Execute & Publish & Send Emails'}
                    </span>
                  </motion.button>
                  <motion.button
                    onClick={() => setSelectedTemplate(null)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-5 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                  >
                    <ArrowLeft className="h-5 w-5" /> Back to Templates
                  </motion.button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── Broadcast Modal ──────────────────────────────── */}
        <AnimatePresence>
          {broadcastModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="theme-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">

                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Send className="h-5 w-5 text-primary-600" />
                      {broadcastStep}
                    </h2>
                    {broadcastProgress?.type === 'complete' && (
                      <button onClick={() => { setBroadcastModal(false); setView('list'); setSelectedTemplate(null); refresh(); }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {broadcastProgress ? (
                    <>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {broadcastProgress.type === 'complete' ? 'Complete!' : 'Sending...'}
                          </span>
                          <span className="text-sm font-bold text-primary-600">
                            {broadcastProgress.sent + broadcastProgress.failed} / {broadcastProgress.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${broadcastProgress.total > 0 ? ((broadcastProgress.sent + broadcastProgress.failed) / broadcastProgress.total) * 100 : 0}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <Check className="h-5 w-5 text-green-600 mx-auto mb-1" />
                          <p className="text-lg font-bold text-green-700">{broadcastProgress.sent}</p>
                          <p className="text-xs text-green-600">Sent</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                          <p className="text-lg font-bold text-red-700">{broadcastProgress.failed}</p>
                          <p className="text-xs text-red-600">Failed</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <Mail className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                          <p className="text-lg font-bold text-gray-700">{broadcastProgress.total}</p>
                          <p className="text-xs text-gray-600">Total</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                      <span className="ml-3 text-gray-600">Preparing broadcast...</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto border-t border-gray-100 max-h-[250px]">
                  <div className="p-4 space-y-1">
                    {broadcastLog.map((entry, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-md hover:bg-gray-50">
                        {entry.status === 'sent'
                          ? <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                          : <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />}
                        <span className="text-gray-500 w-6">{langFlags[entry.lang]}</span>
                        <span className="font-medium text-gray-700 truncate">{entry.user}</span>
                        <span className="text-gray-400 truncate ml-auto">{entry.email}</span>
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </div>

                {broadcastProgress?.type === 'complete' && (
                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button onClick={() => { setBroadcastModal(false); setView('list'); setSelectedTemplate(null); refresh(); }}
                      className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5" /> Done - Close
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // LIST VIEW
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements Hub</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all changes: pricing, items, warehouses, loyalty & communications</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refresh} disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setView('create')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-md">
            <Plus className="h-5 w-5" /> New Announcement
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: announcements.length, icon: Megaphone, bg: 'bg-gray-50' },
          { label: 'Published', value: announcements.filter((a: Announcement) => a.isPublished).length, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
          { label: 'Scheduled', value: announcements.filter((a: Announcement) => a.scheduledStatus === 'pending').length, icon: CalendarClock, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Action Changes', value: announcements.filter((a: Announcement) => a.templateId && a.actionExecutedAt).length, icon: Zap, bg: 'bg-amber-50', color: 'text-amber-600' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-gray-100`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color || 'text-gray-900'}`}>{stat.value}</p>
              </div>
              <stat.icon className={`h-7 w-7 ${stat.color || 'text-gray-400'}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search announcements..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">All Types</option>
          <option value="news">News</option>
          <option value="alert">Alert</option>
          <option value="promo">Promo</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filteredAnnouncements.map((announcement: Announcement, index: number) => (
          <motion.div key={announcement.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="theme-card rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-gray-900 truncate">{announcement.title}</h3>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${categoryColors[announcement.type] || 'bg-gray-100 text-gray-800'}`}>
                    {announcement.type?.toUpperCase()}
                  </span>
                  {announcement.templateId && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">
                      <Zap className="h-3 w-3" /> {announcement.templateId.replace(/_/g, ' ')}
                    </span>
                  )}
                  {announcement.scheduledStatus === 'pending' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                      <CalendarClock className="h-3 w-3" /> Scheduled
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{announcement.content}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {announcement.isPublished ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    <CheckCircle className="h-3 w-3" /> Published
                  </span>
                ) : announcement.scheduledStatus === 'pending' ? (
                  <button onClick={() => handleCancelScheduled(announcement.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full hover:bg-red-100">
                    <X className="h-3 w-3" /> Cancel
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                    <Clock className="h-3 w-3" /> Draft
                  </span>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {announcement.publishDate ? formatDate(announcement.publishDate) : formatDate(announcement.createdAt!)}
              </span>
              {announcement.emailSentAt && (
                <span className="flex items-center gap-1 text-green-600">
                  <Mail className="h-3 w-3" /> {announcement.emailSentCount} emails
                </span>
              )}
              {announcement.scheduledFor && announcement.scheduledStatus === 'pending' && (
                <span className="flex items-center gap-1 text-blue-600">
                  <CalendarClock className="h-3 w-3" /> Scheduled: {formatDate(announcement.scheduledFor)}
                </span>
              )}
              {announcement.translations && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> 4 langs
                </span>
              )}
              {!announcement.emailSentAt && announcement.isPublished && (
                <button onClick={() => startBroadcast(announcement.id)}
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold">
                  <Send className="h-3 w-3" /> Send Emails
                </button>
              )}
              <button onClick={() => handleDelete(announcement.id)}
                className="flex items-center gap-1 text-red-400 hover:text-red-600 ml-auto">
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12 theme-card rounded-2xl border border-gray-100">
          <Megaphone className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first announcement from the hub</p>
          <button onClick={() => setView('create')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="h-5 w-5" /> New Announcement
          </button>
        </div>
      )}

      {/* Broadcast Modal (for re-sending from list) */}
      <AnimatePresence>
        {broadcastModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="theme-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary-600" /> Email Broadcast
                  </h2>
                  {broadcastProgress?.type === 'complete' && (
                    <button onClick={() => { setBroadcastModal(false); refresh(); }}
                      className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
                  )}
                </div>
              </div>
              <div className="p-6">
                {broadcastProgress ? (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {broadcastProgress.type === 'complete' ? 'Complete!' : 'Sending...'}
                        </span>
                        <span className="text-sm font-bold text-primary-600">
                          {broadcastProgress.sent + broadcastProgress.failed} / {broadcastProgress.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${broadcastProgress.total > 0 ? ((broadcastProgress.sent + broadcastProgress.failed) / broadcastProgress.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-green-700">{broadcastProgress.sent}</p>
                        <p className="text-xs text-green-600">Sent</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-lg font-bold text-red-700">{broadcastProgress.failed}</p>
                        <p className="text-xs text-red-600">Failed</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-700">{broadcastProgress.total}</p>
                        <p className="text-xs text-gray-600">Total</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                    <span className="ml-3 text-gray-600">Preparing...</span>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto border-t border-gray-100 max-h-[200px]">
                <div className="p-4 space-y-1">
                  {broadcastLog.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs py-1 px-2">
                      {entry.status === 'sent' ? <Check className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                      <span>{langFlags[entry.lang]}</span>
                      <span className="font-medium text-gray-700 truncate">{entry.user}</span>
                      <span className="text-gray-400 truncate ml-auto">{entry.email}</span>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </div>
              {broadcastProgress?.type === 'complete' && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <button onClick={() => { setBroadcastModal(false); refresh(); }}
                    className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5" /> Done
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
