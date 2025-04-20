import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indianCurrency'
})
export class IndianCurrencyPipe implements PipeTransform {
  transform(value: number): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }
    
    // Convert value to string and remove any existing commas
    let valueStr = Math.round(value).toString().replace(/,/g, '');
    let result = '';
    let lastThree = valueStr.substring(valueStr.length - 3);
    let otherNumbers = valueStr.substring(0, valueStr.length - 3);
    
    if (otherNumbers !== '') {
      // Format remaining digits with commas for lakhs and crores
      let iteration = 0;
      for (let i = otherNumbers.length - 1; i >= 0; i--) {
        if (iteration !== 0 && iteration % 2 === 0) {
          result = ',' + result;
        }
        result = otherNumbers.charAt(i) + result;
        iteration++;
      }
      result = result + ',' + lastThree;
    } else {
      result = lastThree;
    }
    
    return result;
  }
} 