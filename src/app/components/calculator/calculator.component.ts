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
  }

  initForm(): void {
    this.investmentForm = this.fb.group({
      lumpSum: [0, [Validators.required, Validators.min(0)]],
      sip: [0, [Validators.required, Validators.min(0)]],
      annualRatePercent: [12, [Validators.required, Validators.min(0)]],
      years: [10, [Validators.required, Validators.min(1), Validators.max(50)]],
      stepType: ['none'],
      stepRatePercent: [0]
    });
  }

  calculate(): void {
    if (this.investmentForm.valid) {
      const params: InvestmentParams = {
        lumpSum: this.investmentForm.value.lumpSum,
        sip: this.investmentForm.value.sip,
        annualRatePercent: this.investmentForm.value.annualRatePercent,
        years: this.investmentForm.value.years,
        stepRatePercent: this.investmentForm.value.stepRatePercent,
        stepType: this.investmentForm.value.stepType
      };
      this.result = this.investmentService.calculateInvestment(params);
    }
  }

  resetForm(): void {
    this.initForm();
    this.result = null;
  }
}
