export function modPow(base, exponent, modulus) {
    if (modulus === 1) return 0;
    let result = 1;
    base = base % modulus;
    while (exponent > 0) {
      if (exponent % 2 === 1) {
        result = (result * base) % modulus;
      }
      base = (base * base) % modulus;
      exponent = Math.floor(exponent / 2);
    }
    return result;
  }