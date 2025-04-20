import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface InvestmentParams {
  lumpSum: number;
  sip: number;
  annualRatePercent: number;
  years: number;
  sipStopYear: number;
  inflationRatePercent: number;
  stepRatePercent: number;
  stepType: 'none' | 'stepup' | 'stepdown';
}

export interface YearlySip {
  year: number;
  yearlySip: number;
  monthlySip: number;
}

export interface InvestmentResult {
  futureValue: number;
  totalInvested: number;
  gain: number;
  yearlySips: YearlySip[];
  yearlyData: {
    year: number;
    investment: number;
    interest: number;
    balance: number;
    monthlySip: number;
    inflationAdjustedBalance: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private resultSubject = new BehaviorSubject<InvestmentResult | null>(null);
  results$ = this.resultSubject.asObservable();

  constructor() { }

  calculateInvestment(params: InvestmentParams): InvestmentResult {
    const {
      lumpSum = 0,
      sip = 0,
      annualRatePercent = 12,
      years = 10,
      sipStopYear = years,
      inflationRatePercent = 6.5,
      stepRatePercent = 0,
      stepType = 'none'
    } = params;

    const months = years * 12;
    const monthlyRate = annualRatePercent / 12 / 100;
    const monthlyInflationRate = inflationRatePercent / 12 / 100;
    
    let totalInvested = lumpSum;
    let futureValue = lumpSum;

    let currentSip = sip;
    const yearlySips: YearlySip[] = [];
    const yearlyData = [];

    // Calculate inflation factor for year 0 (starting point)
    let cumulativeInflationFactor = 1;

    for (let year = 1; year <= years; year++) {
      let yearlyInvestedAmount = 0;
      let yearStartBalance = futureValue;
      
      // Update inflation factor for this year
      if (year > 1) {
        cumulativeInflationFactor *= (1 + inflationRatePercent / 100);
      }
      
      for (let month = 0; month < 12; month++) {
        // Grow the existing future value
        const interestForMonth = futureValue * monthlyRate;
        futureValue += interestForMonth;
        
        // Add SIP for this month if we haven't reached the SIP stop year
        if (year <= sipStopYear) {
          futureValue += currentSip;
          totalInvested += currentSip;
          yearlyInvestedAmount += currentSip;
        }
      }

      // Calculate this year's interest
      const interestForYear = futureValue - yearStartBalance - yearlyInvestedAmount;
      
      // Calculate inflation-adjusted balance (real purchasing power)
      const inflationAdjustedBalance = futureValue / cumulativeInflationFactor;
      
      yearlyData.push({
        year,
        investment: Number(yearlyInvestedAmount.toFixed(2)),
        interest: Number(interestForYear.toFixed(2)),
        balance: Number(futureValue.toFixed(2)),
        monthlySip: year <= sipStopYear ? Number(currentSip.toFixed(2)) : 0,
        inflationAdjustedBalance: Number(inflationAdjustedBalance.toFixed(2))
      });

      yearlySips.push({
        year,
        yearlySip: Number(yearlyInvestedAmount.toFixed(2)),
        monthlySip: year <= sipStopYear ? Number(currentSip.toFixed(2)) : 0
      });

      // Only apply step-up/down if not reached SIP stop year yet
      if (year < sipStopYear) {
        // Apply step-up/down at end of the year
        if (stepType.toLowerCase() === 'stepup') {
          currentSip += currentSip * (stepRatePercent / 100);
        } else if (stepType.toLowerCase() === 'stepdown') {
          currentSip -= currentSip * (stepRatePercent / 100);
          currentSip = Math.max(currentSip, 0);
        }
      }
    }

    const result: InvestmentResult = {
      futureValue: Number(futureValue.toFixed(2)),
      totalInvested: Number(totalInvested.toFixed(2)),
      gain: Number((futureValue - totalInvested).toFixed(2)),
      yearlySips,
      yearlyData
    };

    this.resultSubject.next(result);
    return result;
  }
}
