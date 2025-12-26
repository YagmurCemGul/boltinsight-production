import type { AIAutoFillValues } from '@/types';

export function parseAutoFillValues(query: string): AIAutoFillValues {
  const result: AIAutoFillValues = {};
  const lowerQuery = query.toLowerCase();

  // Parse market/country
  const countries = ['usa', 'us', 'uk', 'germany', 'france', 'japan', 'brazil', 'india', 'china', 'turkey', 'spain', 'italy'];
  for (const country of countries) {
    if (lowerQuery.includes(country)) {
      result.market = country.toUpperCase() === 'US' ? 'USA' : country.charAt(0).toUpperCase() + country.slice(1);
      break;
    }
  }

  // Parse sample size
  const sampleMatch = lowerQuery.match(/(\d+)\s*(respondents?|sample|n=)/i) || lowerQuery.match(/sample\s*(?:size)?:?\s*(\d+)/i) || lowerQuery.match(/^(\d+)\s/);
  if (sampleMatch) {
    result.sampleSize = parseInt(sampleMatch[1], 10);
  }

  // Parse gender
  if (lowerQuery.includes('male') && !lowerQuery.includes('female')) {
    result.gender = 'Male Only';
  } else if (lowerQuery.includes('female') && !lowerQuery.includes('male')) {
    result.gender = 'Female Only';
  }

  // Parse age ranges
  const ageRanges: string[] = [];
  const agePatterns = [
    { pattern: /18[-–]24/i, range: '18-24' },
    { pattern: /25[-–]34/i, range: '25-34' },
    { pattern: /35[-–]44/i, range: '35-44' },
    { pattern: /45[-–]54/i, range: '45-54' },
    { pattern: /55[-–]64/i, range: '55-64' },
    { pattern: /65\+|65[-–]\d+|over\s*65/i, range: '65+' },
  ];
  for (const { pattern, range } of agePatterns) {
    if (pattern.test(lowerQuery)) {
      ageRanges.push(range);
    }
  }
  if (ageRanges.length > 0) {
    result.ageRanges = ageRanges;
  }

  // Parse methodology
  const methodologies = [
    { keywords: ['online', 'cawi', 'web'], value: 'online_survey' },
    { keywords: ['phone', 'cati', 'telephone'], value: 'telephone' },
    { keywords: ['face to face', 'f2f', 'in-person'], value: 'face_to_face' },
    { keywords: ['mobile', 'app'], value: 'mobile' },
    { keywords: ['qualitative', 'idi', 'interview'], value: 'qualitative_idi' },
    { keywords: ['focus group', 'fgd'], value: 'focus_groups' },
  ];
  for (const { keywords, value } of methodologies) {
    if (keywords.some(kw => lowerQuery.includes(kw))) {
      result.methodology = value;
      break;
    }
  }

  // Parse audience type
  const audiences = [
    { keywords: ['general pop', 'gen pop', 'general population'], value: 'general_population' },
    { keywords: ['category user', 'category buyer'], value: 'category_users' },
    { keywords: ['brand user', 'brand buyer'], value: 'brand_users' },
    { keywords: ['lapsed', 'former'], value: 'lapsed_users' },
    { keywords: ['non-user', 'non user', 'never used'], value: 'non_users' },
    { keywords: ['b2b', 'business'], value: 'b2b' },
  ];
  for (const { keywords, value } of audiences) {
    if (keywords.some(kw => lowerQuery.includes(kw))) {
      result.audienceType = value;
      break;
    }
  }

  return result;
}

export function hasAutoFillValues(values: AIAutoFillValues): boolean {
  return Object.values(values).some(v => v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true));
}
