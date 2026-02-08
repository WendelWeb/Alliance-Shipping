export interface Country {
  code: string; // ISO code
  name: string;
  nameHt: string; // Haitian Creole
  nameFr: string; // French
  dial: string; // Phone prefix
  flag: string; // Emoji flag
}

export const COUNTRIES: Country[] = [
  {
    code: 'HT',
    name: 'Haiti',
    nameHt: 'Ayiti',
    nameFr: 'Haïti',
    dial: '+509',
    flag: '🇭🇹',
  },
  {
    code: 'DO',
    name: 'Dominican Republic',
    nameHt: 'Repiblik Dominikèn',
    nameFr: 'République Dominicaine',
    dial: '+1-809',
    flag: '🇩🇴',
  },
  {
    code: 'DO',
    name: 'Dominican Republic',
    nameHt: 'Repiblik Dominikèn',
    nameFr: 'République Dominicaine',
    dial: '+1-829',
    flag: '🇩🇴',
  },
  {
    code: 'DO',
    name: 'Dominican Republic',
    nameHt: 'Repiblik Dominikèn',
    nameFr: 'République Dominicaine',
    dial: '+1-849',
    flag: '🇩🇴',
  },
  {
    code: 'US',
    name: 'United States',
    nameHt: 'Etazini',
    nameFr: 'États-Unis',
    dial: '+1',
    flag: '🇺🇸',
  },
  {
    code: 'CA',
    name: 'Canada',
    nameHt: 'Kanada',
    nameFr: 'Canada',
    dial: '+1',
    flag: '🇨🇦',
  },
  {
    code: 'FR',
    name: 'France',
    nameHt: 'Frans',
    nameFr: 'France',
    dial: '+33',
    flag: '🇫🇷',
  },
  {
    code: 'BR',
    name: 'Brazil',
    nameHt: 'Brezil',
    nameFr: 'Brésil',
    dial: '+55',
    flag: '🇧🇷',
  },
  {
    code: 'JM',
    name: 'Jamaica',
    nameHt: 'Jamayik',
    nameFr: 'Jamaïque',
    dial: '+1-876',
    flag: '🇯🇲',
  },
  {
    code: 'CU',
    name: 'Cuba',
    nameHt: 'Kiba',
    nameFr: 'Cuba',
    dial: '+53',
    flag: '🇨🇺',
  },
];

export function getCountryByDial(dial: string): Country | undefined {
  return COUNTRIES.find((c) => c.dial === dial);
}

export function getCountryName(country: Country, language: string = 'fr'): string {
  if (language === 'ht') return country.nameHt;
  if (language === 'fr') return country.nameFr;
  return country.name;
}
