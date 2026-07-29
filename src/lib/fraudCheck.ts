/**
 * Anti-Fraud Transaction Reference Validation Engine
 * Validates buyer payment references against fake/suspicious patterns,
 * character length, and known invalid demo strings.
 */

export interface FraudCheckResult {
  valid: boolean;
  reason?: string;
  confidenceScore: number; // 0 to 100
}

export function validateTransactionReference(ref: string): FraudCheckResult {
  if (!ref || typeof ref !== 'string') {
    return {
      valid: false,
      reason: 'Transaction reference cannot be empty.',
      confidenceScore: 0
    };
  }

  const trimmed = ref.trim();

  if (trimmed.length < 6) {
    return {
      valid: false,
      reason: 'Transaction reference is too short. Genuine mobile money / bank references are at least 6 characters.',
      confidenceScore: 20
    };
  }

  const lower = trimmed.toLowerCase();

  // Known obvious fake or lazy input strings
  const blacklistedKeywords = [
    '12345', '123456', '12345678', '000000', '111111', '999999',
    'test', 'fake', 'abcd', 'xxxx', 'asdf', 'sample', 'null',
    'qwerty', 'demo', 'payment', 'none', 'nothing', 'sent'
  ];

  for (const keyword of blacklistedKeywords) {
    if (lower === keyword || lower.startsWith(keyword) && lower.length < 10) {
      return {
        valid: false,
        reason: `Anti-Fraud Filter Alert: "${trimmed}" is a flagged or blacklisted test pattern. Please provide the exact reference code from your payment SMS/receipt.`,
        confidenceScore: 10
      };
    }
  }

  // Check character validity (alphanumeric, dashes, slashes, spaces)
  if (!/^[a-zA-Z0-9\-_/\s]+$/.test(trimmed)) {
    return {
      valid: false,
      reason: 'Transaction reference contains illegal characters. Only numbers, letters, and dashes are allowed.',
      confidenceScore: 30
    };
  }

  // Check for repeated identical characters e.g. "AAAAAA" or "888888"
  if (/^(.)\1+$/.test(trimmed)) {
    return {
      valid: false,
      reason: 'Suspicious repetitive character pattern detected.',
      confidenceScore: 15
    };
  }

  return {
    valid: true,
    confidenceScore: 98
  };
}
