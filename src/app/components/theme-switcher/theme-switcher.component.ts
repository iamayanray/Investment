import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.css']
})
export class ThemeSwitcherComponent implements OnInit {
  isDarkMode = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Subscribe to theme changes from the theme service
    this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkMode = theme.isDark;
    });
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    
    // Find a suitable theme based on dark/light preference
    const themeOptions = this.themeService.themeOptions;
    const targetTheme = themeOptions.find(t => t.isDark === this.isDarkMode && t.id !== 'custom');
    
    if (targetTheme) {
      this.themeService.setTheme(targetTheme);
    }
  }
}
