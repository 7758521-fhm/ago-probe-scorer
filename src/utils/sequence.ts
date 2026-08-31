const COMP: Record<string, string> = { A: 'T', T: 'A', C: 'G', G: 'C' };

export function cleanSequence(input: string): string {
  const upper = input.toUpperCase().replace(/[^A-Z]/g, '');
  return upper
    .split('')
    .map((c) => (c === 'U' ? 'T' : c))
    .filter((c) => 'ACGT'.includes(c))
    .join('');
}

export function complement(base: string): string {
  return COMP[base] ?? base;
}

export function reverseComplement(seq: string): string {
  return seq.split('').reverse().map(complement).join('');
}
