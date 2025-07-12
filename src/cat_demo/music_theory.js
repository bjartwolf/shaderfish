
export function frequencyFromNoteNumberEqualTemperament(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

