export type ToolCategory =
  | 'Everyday Tools'
  | 'Convert All'
  | 'PDF Tools'
  | 'Image Tools'
  | 'Document Tools'
  | 'PowerPoint Tools'
  | 'Photo Tools'
  | 'Financial Calculators'
  | 'Date and Time Tools';

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  path: string;
  icon: string;
  popular?: boolean;
  featured?: boolean;
  tags: string[];
}

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  accent: string;
  bg: string;
  surface: string;
  surfaceCard: string;
  text: string;
  textMuted: string;
  border: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  isDark: boolean;
  colors: ThemeColors;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  userName: string;
  userEmail: string;
  rating: number;
  category: string;
  comment: string;
  timestamp: string;
  status: 'new' | 'reviewed';
}

export interface UserWorkItem {
  id: string;
  userId: string;
  toolType: string;
  title: string;
  summary: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

export interface SiteConfiguration {
  announcementEnabled: boolean;
  announcementText: string;
  announcementType: 'info' | 'warning' | 'success';
  maintenanceMode: boolean;
  creatorHub: string;
  defaultTheme: string;
  analyticsActive: boolean;
}
