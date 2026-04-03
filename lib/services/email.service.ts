import crypto from 'crypto';
import { EMAIL_BLOCKED_DOMAINS, EMAIL_REGEX, TOKEN_EXPIRY_HOURS } from '@/lib/constants/email.constants';

export const validateEmailFormat = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

export const isBlockedDomain = (email: string): boolean => {
  const domain = email.toLowerCase();
  return EMAIL_BLOCKED_DOMAINS.some(blocked => domain.includes(blocked));
};

export const verifyEmailDomain = async (email: string): Promise<boolean> => {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;
    
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`, {
      method: 'GET',
    }).catch(() => null);
    
    if (!response) return false;
    const data = await response.json().catch(() => ({}));
    return !!(data.Answer && data.Answer.length > 0);
  } catch {
    return false;
  }
};

export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const getTokenExpiry = (): Date => {
  return new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
};
