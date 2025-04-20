import { Component, Input, OnChanges, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { InvestmentResult } from '../../services/investment.service';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnChanges, OnInit, OnDestroy {
  @Input() result!: InvestmentResult;
  
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  pieChartOptions: Highcharts.Options = {};
  updateFlag = false;
  
  private themeSubscription: Subscription | null = null;
  private isDarkMode = false;
  private primaryColor = '#1976d2';
  private accentColor = '#ff4081';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkMode = theme.isDark;
      this.primaryColor = theme.primaryColor;
      this.accentColor = theme.accentColor;
      
      if (this.result) {
        this.updateCharts();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['result'] && this.result) {
      this.updateCharts();
    }
  }

  updateCharts(): void {
    // Get colors suitable for the current theme
    const colors = this.getChartColors();
    
    // Growth Chart (Bar + Line)
    this.chartOptions = {
      chart: {
        type: 'column',
        height: 350,
        backgroundColor: 'transparent'
      },
      title: {
        text: 'Year-by-Year Investment Growth'
      },
      xAxis: {
        categories: this.result.yearlyData.map(data => `Year ${data.year}`),
        title: {
          text: 'Year'
        }
      },
      yAxis: [{
        title: {
          text: 'Amount (₹)'
        },
        labels: {
          format: '₹{value:,.0f}'
        }
      }],
      tooltip: {
        shared: true,
        valuePrefix: '₹',
        valueDecimals: 2,
        backgroundColor: this.isDarkMode ? '#424242' : '#ffffff',
        style: {
          color: this.isDarkMode ? '#ffffff' : '#333333'
        }
      },
      legend: {
        enabled: true,
        itemStyle: {
          color: this.isDarkMode ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)'
        }
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        column: {
          stacking: 'normal'
        }
      },
      colors: colors,
      series: [{
        name: 'Investment',
        type: 'column',
        data: this.result.yearlyData.map(data => data.investment)
      }, {
        name: 'Interest',
        type: 'column',
        data: this.result.yearlyData.map(data => data.interest)
      }, {
        name: 'Balance',
        type: 'spline',
        data: this.result.yearlyData.map(data => data.balance),
        yAxis: 0
      }]
    };

    // Pie Chart - Investment vs Gains
    this.pieChartOptions = {
      chart: {
        type: 'pie',
        height: 300,
        backgroundColor: 'transparent'
      },
      title: {
        text: 'Investment vs Gains'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>₹{point.y:,.2f}</b> ({point.percentage:.1f}%)',
        backgroundColor: this.isDarkMode ? '#424242' : '#ffffff',
        style: {
          color: this.isDarkMode ? '#ffffff' : '#333333'
        }
      },
      credits: {
        enabled: false
      },
      colors: [colors[0], colors[1]],
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: {
              color: this.isDarkMode ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
              textOutline: this.isDarkMode ? '1px contrast' : undefined
            }
          }
        }
      },
      series: [{
        name: 'Amount',
        type: 'pie',
        data: [
          {
            name: 'Total Invested',
            y: this.result.totalInvested
          },
          {
            name: 'Gains',
            y: this.result.gain,
            sliced: true,
            selected: true
          }
        ]
      }]
    };
    
    this.updateFlag = true;
  }
  
  private getChartColors(): string[] {
    if (this.isDarkMode) {
      // Generate theme-appropriate colors for dark mode
      return [
        this.primaryColor,
        this.accentColor,
        this.lightenColor(this.primaryColor, 20),
        this.lightenColor(this.accentColor, 20)
      ];
    } else {
      // Light mode colors
      return [
        this.primaryColor,
        this.accentColor,
        this.darkenColor(this.primaryColor, 20),
        this.darkenColor(this.accentColor, 20)
      ];
    }
  }
  
  // Helper functions to adjust colors for better contrast
  private lightenColor(color: string, amount: number): string {
    return this.adjustColor(color, amount);
  }
  
  private darkenColor(color: string, amount: number): string {
    return this.adjustColor(color, -amount);
  }
  
  private adjustColor(color: string, amount: number): string {
    // Simple implementation, in production use a proper library
    // This is just for demo purposes
    return color;
  }
}
