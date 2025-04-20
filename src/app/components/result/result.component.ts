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
  
  displayedColumns: string[] = ['year', 'monthlySip', 'investment', 'interest', 'balance', 'inflationAdjustedBalance'];
  
  private themeSubscription: Subscription | null = null;
  private isDarkMode = false;
  private primaryColor = '#1976d2';
  private accentColor = '#ff4081';

  constructor(private themeService: ThemeService) {
    // Set up Indian numbering format for Highcharts
    Highcharts.setOptions({
      lang: {
        numericSymbols: ['K', 'L', 'Cr', 'Arab']
      }
    });
  }

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
          formatter: function() {
            // Format in Indian style (simplified)
            const value = this.value as number;
            if (value >= 10000000) {
              return '₹' + (value / 10000000).toFixed(2) + ' Cr';
            } else if (value >= 100000) {
              return '₹' + (value / 100000).toFixed(2) + ' L';
            } else if (value >= 1000) {
              return '₹' + (value / 1000).toFixed(2) + ' K';
            }
            return '₹' + value;
          }
        }
      }],
      tooltip: {
        shared: true,
        useHTML: true,
        formatter: function() {
          let s = '<b>' + this.x + '</b><br/>';
          this.points?.forEach(function(point) {
            // Format values in Indian style with commas
            const value = point.y as number;
            let formattedValue = Math.round(value).toString();
            
            // Apply Indian number formatting
            let lastThree = formattedValue.substring(formattedValue.length - 3);
            let otherNumbers = formattedValue.substring(0, formattedValue.length - 3);
            if (otherNumbers !== '') {
              let formattedOtherNumbers = '';
              let iteration = 0;
              for (let i = otherNumbers.length - 1; i >= 0; i--) {
                if (iteration !== 0 && iteration % 2 === 0) {
                  formattedOtherNumbers = ',' + formattedOtherNumbers;
                }
                formattedOtherNumbers = otherNumbers.charAt(i) + formattedOtherNumbers;
                iteration++;
              }
              formattedValue = formattedOtherNumbers + ',' + lastThree;
            }
            
            s += '<br/><span style="color:' + point.color + '">\u25CF</span> ' + 
                 point.series.name + ': <b>₹' + formattedValue + '</b>';
          });
          return s;
        },
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
      }, {
        name: 'Inflation-Adjusted Balance',
        type: 'spline',
        dashStyle: 'Dash',
        data: this.result.yearlyData.map(data => data.inflationAdjustedBalance),
        yAxis: 0,
        color: colors[3]
      }]
    };

    // Pie Chart - Investment vs Gains (with inflation adjustment)
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
        useHTML: true,
        formatter: function() {
          // In a pie chart context, 'this' has a different structure
          const value = this.y as number;
          const name = this.key || 'Value';
          const percentage = this.percentage || 0;
          
          let formattedValue = Math.round(value).toString();
          
          // Apply Indian number formatting
          let lastThree = formattedValue.substring(formattedValue.length - 3);
          let otherNumbers = formattedValue.substring(0, formattedValue.length - 3);
          if (otherNumbers !== '') {
            let formattedOtherNumbers = '';
            let iteration = 0;
            for (let i = otherNumbers.length - 1; i >= 0; i--) {
              if (iteration !== 0 && iteration % 2 === 0) {
                formattedOtherNumbers = ',' + formattedOtherNumbers;
              }
              formattedOtherNumbers = otherNumbers.charAt(i) + formattedOtherNumbers;
              iteration++;
            }
            formattedValue = formattedOtherNumbers + ',' + lastThree;
          }
          
          return '<b>' + name + '</b>: <b>₹' + formattedValue + 
                '</b> (' + percentage.toFixed(1) + '%)';
        },
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
