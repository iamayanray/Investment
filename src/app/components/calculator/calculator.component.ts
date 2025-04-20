import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InvestmentService, InvestmentParams, InvestmentResult } from '../../services/investment.service';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent implements OnInit {
  investmentForm!: FormGroup;
  result: InvestmentResult | null = null;
  
  // Current inflation rate in India (as of the latest data available)
  readonly CURRENT_INFLATION_RATE = 6.5;

  constructor(
    private fb: FormBuilder,
    private investmentService: InvestmentService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.investmentService.results$.subscribe(result => {
      this.result = result;
    });

    // Listen to step type changes to update validators
    this.investmentForm.get('stepType')?.valueChanges.subscribe(value => {
      if (value === 'none') {
        this.investmentForm.get('stepRatePercent')?.setValue(0);
        this.investmentForm.get('stepRatePercent')?.clearValidators();
      } else {
        this.investmentForm.get('stepRatePercent')?.setValidators([Validators.required, Validators.min(0)]);
      }
      this.investmentForm.get('stepRatePercent')?.updateValueAndValidity();
    });
    
    // Add validation to ensure SIP stop year is not greater than investment years
    this.investmentForm.get('years')?.valueChanges.subscribe(years => {
      const sipStopYear = this.investmentForm.get('sipStopYear');
      if (sipStopYear && sipStopYear.value > years) {
        sipStopYear.setValue(years);
      }
    });
  }

  initForm(): void {
    this.investmentForm = this.fb.group({
      lumpSum: [0, [Validators.required, Validators.min(0)]],
      sip: [0, [Validators.required, Validators.min(0)]],
      annualRatePercent: [12, [Validators.required, Validators.min(0)]],
      years: [10, [Validators.required, Validators.min(1), Validators.max(50)]],
      sipStopYear: [10, [Validators.required, Validators.min(0), Validators.max(50)]],
      inflationRatePercent: [this.CURRENT_INFLATION_RATE, [Validators.required, Validators.min(0)]],
      stepType: ['none'],
      stepRatePercent: [0]
    });
  }

  calculate(): void {
    if (this.investmentForm.valid) {
      const formValue = this.investmentForm.value;
      
      // Ensure SIP stop year is not greater than investment years
      const sipStopYear = Math.min(formValue.sipStopYear, formValue.years);
      
      const params: InvestmentParams = {
        lumpSum: formValue.lumpSum,
        sip: formValue.sip,
        annualRatePercent: formValue.annualRatePercent,
        years: formValue.years,
        sipStopYear: sipStopYear,
        inflationRatePercent: formValue.inflationRatePercent,
        stepRatePercent: formValue.stepRatePercent,
        stepType: formValue.stepType
      };
      this.result = this.investmentService.calculateInvestment(params);
    }
  }

  resetForm(): void {
    this.initForm();
    this.result = null;
  }
}
