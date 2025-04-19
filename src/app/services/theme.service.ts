import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ThemeOption {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  isDark: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'selectedTheme';
  private readonly COLOR_KEY = 'customColors';

  // Predefined themes
  themeOptions: ThemeOption[] = [
    {
      id: 'indigo-light',
      name: 'Indigo Light',
      primaryColor: '#3f51b5',
      accentColor: '#ff4081',
      isDark: false
    },
    {
      id: 'indigo-dark',
      name: 'Indigo Dark',
      primaryColor: '#3f51b5',
      accentColor: '#ff4081',
      isDark: true
    },
    {
      id: 'teal-light',
      name: 'Teal Light',
      primaryColor: '#009688',
      accentColor: '#ff5722',
      isDark: false
    },
    {
      id: 'teal-dark',
      name: 'Teal Dark',
      primaryColor: '#009688',
      accentColor: '#ff5722',
      isDark: true
    },
    {
      id: 'purple-light',
      name: 'Purple Light',
      primaryColor: '#673ab7',
      accentColor: '#ffd740',
      isDark: false
    },
    {
      id: 'purple-dark',
      name: 'Purple Dark',
      primaryColor: '#673ab7',
      accentColor: '#ffd740',
      isDark: true
    },
    {
      id: 'custom',
      name: 'Custom Theme',
      primaryColor: '#1976d2',
      accentColor: '#ff4081',
      isDark: false
    }
  ];

  private currentThemeSubject = new BehaviorSubject<ThemeOption>(this.themeOptions[0]);
  currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    this.loadSavedTheme();
  }

  private loadSavedTheme(): void {
    const savedThemeId = localStorage.getItem(this.THEME_KEY);
    if (savedThemeId) {
      const theme = this.themeOptions.find(t => t.id === savedThemeId);
      if (theme) {
        // If it's custom theme, load saved colors
        if (theme.id === 'custom') {
          const customColors = JSON.parse(localStorage.getItem(this.COLOR_KEY) || '{}');
          if (customColors.primaryColor) {
            theme.primaryColor = customColors.primaryColor;
          }
          if (customColors.accentColor) {
            theme.accentColor = customColors.accentColor;
          }
          if (customColors.isDark !== undefined) {
            theme.isDark = customColors.isDark;
          }
        }
        this.setTheme(theme);
        return;
      }
    }

    // Default to system preference if no saved theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = prefersDark ? this.themeOptions[1] : this.themeOptions[0];
    this.setTheme(defaultTheme);
  }

  setTheme(theme: ThemeOption): void {
    this.currentThemeSubject.next(theme);
    localStorage.setItem(this.THEME_KEY, theme.id);
    
    // Apply the theme to the document
    this.applyTheme(theme);
  }

  setCustomTheme(primaryColor: string, accentColor: string, isDark: boolean): void {
    const customTheme = this.themeOptions.find(t => t.id === 'custom');
    if (customTheme) {
      customTheme.primaryColor = primaryColor;
      customTheme.accentColor = accentColor;
      customTheme.isDark = isDark;
      
      // Save custom colors
      localStorage.setItem(this.COLOR_KEY, JSON.stringify({
        primaryColor,
        accentColor,
        isDark
      }));
      
      this.setTheme(customTheme);
    }
  }

  private applyTheme(theme: ThemeOption): void {
    // Apply light/dark theme
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(theme.isDark ? 'dark-theme' : 'light-theme');
    
    // Apply primary and accent colors
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    document.documentElement.style.setProperty('--accent-color', theme.accentColor);
    
    // Generate light and dark variants of the primary color
    document.documentElement.style.setProperty('--primary-light', this.adjustColor(theme.primaryColor, 20));
    document.documentElement.style.setProperty('--primary-dark', this.adjustColor(theme.primaryColor, -20));
    document.documentElement.style.setProperty('--accent-light', this.adjustColor(theme.accentColor, 20));
    document.documentElement.style.setProperty('--accent-dark', this.adjustColor(theme.accentColor, -20));
  }

  // Helper to lighten or darken colors
  private adjustColor(color: string, amount: number): string {
    return color;
    // A simple approach - in production you'd want to use a proper color manipulation library
    // This is a placeholder that would be replaced with actual implementation
  }
}
