/**
 * Centralized configuration for Symphony Training Centre
 * Dynamic settings for the entire application
 */

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  adminEmail: string;
  supportEmail: string;
  defaultCurrency: string;
  timezone: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  version: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily: string;
}

export interface FeaturesConfig {
  enableLiveClasses: boolean;
  enableRecordedCourses: boolean;
  enableOnlineCourses: boolean;
  enableOfflineCourses: boolean;
  enableGovernmentCourses: boolean;
  enableCertificates: boolean;
  enablePayments: boolean;
  enableNotifications: boolean;
  enableAnalytics: boolean;
  enableCRM: boolean;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  instagram?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  mapUrl?: string;
}

export interface BusinessHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

// Default configuration - can be overridden by admin settings
export const defaultSiteConfig: SiteConfig = {
  name: 'Symphony Training Centre',
  description: 'Professional training and education platform',
  url: 'https://symphony-training.com',
  adminEmail: 'admin@symphony-training.com',
  supportEmail: 'support@symphony-training.com',
  defaultCurrency: 'BDT',
  timezone: 'Asia/Dhaka',
  maintenanceMode: false,
  allowRegistrations: true,
  version: '1.0.0'
};

export const defaultThemeConfig: ThemeConfig = {
  primaryColor: '#10b981',
  secondaryColor: '#f97316',
  accentColor: '#ef4444',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderRadius: '0.5rem',
  fontFamily: 'Inter, sans-serif'
};

export const defaultFeaturesConfig: FeaturesConfig = {
  enableLiveClasses: true,
  enableRecordedCourses: true,
  enableOnlineCourses: true,
  enableOfflineCourses: true,
  enableGovernmentCourses: true,
  enableCertificates: true,
  enablePayments: true,
  enableNotifications: true,
  enableAnalytics: true,
  enableCRM: true
};

export const defaultSocialLinks: SocialLinks = {
  facebook: 'https://facebook.com/symphonytraining',
  twitter: 'https://twitter.com/symphonytraining',
  linkedin: 'https://linkedin.com/company/symphonytraining',
  youtube: 'https://youtube.com/@symphonytraining',
  instagram: 'https://instagram.com/symphonytraining'
};

export const defaultContactInfo: ContactInfo = {
  phone: '01810186702',
  email: 'info@symphony-training.com',
  address: 'Tridhara Tower (2nd Floor), 67 West Panthapath, Lake Circus, Kalabagan',
  city: 'Dhaka',
  country: 'Bangladesh',
  postalCode: '1205',
  mapUrl: 'https://maps.google.com/?q=Tridhara+Tower+West+Panthapath+Dhaka'
};

export const defaultBusinessHours: BusinessHours = {
  monday: '9:00 AM - 6:00 PM',
  tuesday: '9:00 AM - 6:00 PM',
  wednesday: '9:00 AM - 6:00 PM',
  thursday: '9:00 AM - 6:00 PM',
  friday: '9:00 AM - 6:00 PM',
  saturday: '9:00 AM - 4:00 PM',
  sunday: 'Closed'
};

// Dynamic configuration getters
export const getSiteConfig = (): SiteConfig => {
  // In a real app, this would fetch from API or localStorage
  return defaultSiteConfig;
};

export const getThemeConfig = (): ThemeConfig => {
  // In a real app, this would fetch from API or localStorage
  return defaultThemeConfig;
};

export const getFeaturesConfig = (): FeaturesConfig => {
  // In a real app, this would fetch from API or localStorage
  return defaultFeaturesConfig;
};

export const getSocialLinks = (): SocialLinks => {
  // In a real app, this would fetch from API or localStorage
  return defaultSocialLinks;
};

export const getContactInfo = (): ContactInfo => {
  // In a real app, this would fetch from API or localStorage
  return defaultContactInfo;
};

export const getBusinessHours = (): BusinessHours => {
  // In a real app, this would fetch from API or localStorage
  return defaultBusinessHours;
};
