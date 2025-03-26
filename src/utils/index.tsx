export const toRoman = (num: number): string => {
    const romanNumerals = [
      { value: 100, numeral: 'C' },
      { value: 90, numeral: 'XC' },
      { value: 50, numeral: 'L' },
      { value: 40, numeral: 'XL' },
      { value: 10, numeral: 'X' },
      { value: 9, numeral: 'IX' },
      { value: 5, numeral: 'V' },
      { value: 4, numeral: 'IV' },
      { value: 1, numeral: 'I' }
    ];
    
    let result = '';
    let remaining = num;
    
    for (const { value, numeral } of romanNumerals) {
      while (remaining >= value) {
        result += numeral;
        remaining -= value;
      }
    }
    
    return result;
  };