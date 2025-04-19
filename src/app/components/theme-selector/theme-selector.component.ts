import { Component, OnInit } from '@angular/core';
import { ThemeService, ThemeOption } from '../../services/theme.service';

@Component({
  selector: 'app-theme-selector',
  templateUrl: './theme-selector.component.html',
  styleUrls: ['./theme-selector.component.css']
})
export class ThemeSelectorComponent implements OnInit {
  isOpen = false;
  themeOptions: ThemeOption[] = [];
  currentTheme: ThemeOption | null = null;
  
  customPrimaryColor = '#1976d2';
  customAccentColor = '#ff4081';
  customIsDark = false;

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    this.themeOptions = this.themeService.themeOptions;
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
      // Update custom theme values when custom theme is active
      if (theme.id === 'custom') {
        this.customPrimaryColor = theme.primaryColor;
        this.customAccentColor = theme.accentColor;
        this.customIsDark = theme.isDark;
      }
    });
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  selectTheme(theme: ThemeOption): void {
    this.themeService.setTheme(theme);
  }

  applyCustomTheme(): void {
    this.themeService.setCustomTheme(
      this.customPrimaryColor,
      this.customAccentColor,
      this.customIsDark
    );
  }

  resetCustomColors(): void {
    this.customPrimaryColor = '#1976d2';
    this.customAccentColor = '#ff4081';
    this.applyCustomTheme();
  }
} 