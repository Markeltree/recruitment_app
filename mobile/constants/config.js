import Constants from 'expo-constants';

// Set EXPO_PUBLIC_API_URL in a .env file for devices on your LAN (e.g. http://192.168.1.10:5000/api/v1)
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000/api/v1';

// Public website hosting the privacy policy, terms and account-deletion pages
export const WEBSITE_URL = (process.env.EXPO_PUBLIC_WEBSITE_URL || '').replace(/\/$/, '');

export const CATEGORIES = ['Design', 'Engineering', 'Product', 'Data', 'Marketing', 'Sales'];
export const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship'];
export const APP_STATUSES = ['applied', 'reviewing', 'interview', 'offer', 'rejected', 'withdrawn'];
