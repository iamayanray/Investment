import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThemeService, ThemeOption } from './services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Investment Calculator';
  currentYear = new Date().getFullYear();
  isDarkTheme = false;
  private themeSubscription: Subscription | null = null;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Subscribe to theme changes from the theme service
    this.themeSubscription = this.themeService.currentTheme$.subscribe(
      (theme: ThemeOption) => {
        this.isDarkTheme = theme.isDark;
      }
    );
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}
