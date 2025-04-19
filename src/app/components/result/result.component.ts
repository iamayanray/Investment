import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { InvestmentResult } from '../../services/investment.service';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnChanges {
  @Input() result!: InvestmentResult;
  
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  pieChartOptions: Highcharts.Options = {};
  updateFlag = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['result'] && this.result) {
      this.updateCharts();
    }
  }

  updateCharts(): void {
    // Growth Chart (Bar + Line)
    this.chartOptions = {
      chart: {
        type: 'column',
        height: 350
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
        valueDecimals: 2
      },
      legend: {
        enabled: true
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        column: {
          stacking: 'normal'
        }
      },
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
        height: 300
      },
      title: {
        text: 'Investment vs Gains'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>₹{point.y:,.2f}</b> ({point.percentage:.1f}%)'
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
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
}
