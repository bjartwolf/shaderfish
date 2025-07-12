import { expect, test } from 'vitest'

import { frequencyFromNoteNumberEqualTemperament } from './music_theory.js'

test('a4 is still 440', () => {
  expect(frequencyFromNoteNumberEqualTemperament(69)).toBe(440)
})

test('c4 is around 261.63', () => {
  expect(frequencyFromNoteNumberEqualTemperament(60)).toBeCloseTo(261.63, 2)
})

