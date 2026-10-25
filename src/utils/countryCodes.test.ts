import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_COUNTRY_CODES, SORTED_COUNTRY_CODES, parsePhoneNumberWithCountry } from './countryCodes';

test('ALL_COUNTRY_CODES contains all major world countries and territories', () => {
  assert.ok(ALL_COUNTRY_CODES.length >= 195, `Expected at least 195 countries, got ${ALL_COUNTRY_CODES.length}`);

  // Check some notable countries across all continents
  const expectedCodes = ['US', 'IN', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'BR', 'ZA', 'CN', 'NG', 'AE', 'SG', 'MX'];
  for (const code of expectedCodes) {
    const found = ALL_COUNTRY_CODES.find((c) => c.code === code);
    assert.ok(found, `Missing expected country code: ${code}`);
    assert.ok(found.dialCode.startsWith('+'), `Dial code must start with +: ${found.dialCode}`);
    assert.ok(found.flag, `Flag emoji must be present for ${code}`);
  }
});

test('SORTED_COUNTRY_CODES is sorted alphabetically by name', () => {
  for (let i = 1; i < SORTED_COUNTRY_CODES.length; i++) {
    assert.ok(
      SORTED_COUNTRY_CODES[i - 1].name.localeCompare(SORTED_COUNTRY_CODES[i].name) <= 0,
      `Unsorted: ${SORTED_COUNTRY_CODES[i - 1].name} before ${SORTED_COUNTRY_CODES[i].name}`
    );
  }
});

test('parsePhoneNumberWithCountry correctly extracts dialCode and numeric digits', () => {
  // US format
  const r1 = parsePhoneNumberWithCountry('+1 (555) 234-5678');
  assert.equal(r1.dialCode, '+1');
  assert.equal(r1.digits, '5552345678');

  // India format
  const r2 = parsePhoneNumberWithCountry('+91 9876543210');
  assert.equal(r2.dialCode, '+91');
  assert.equal(r2.digits, '9876543210');

  // UK format
  const r3 = parsePhoneNumberWithCountry('+44 20 7946 0958');
  assert.equal(r3.dialCode, '+44');
  assert.equal(r3.digits, '2079460958');

  // Multi-digit country code (Barbados +1246)
  const r4 = parsePhoneNumberWithCountry('+1246 555 1234');
  assert.equal(r4.dialCode, '+1246');
  assert.equal(r4.digits, '5551234');

  // Digits without country code
  const r5 = parsePhoneNumberWithCountry('5552345678');
  assert.equal(r5.dialCode, '+1');
  assert.equal(r5.digits, '5552345678');

  // Empty string
  const r6 = parsePhoneNumberWithCountry('');
  assert.equal(r6.dialCode, '+1');
  assert.equal(r6.digits, '');
});
