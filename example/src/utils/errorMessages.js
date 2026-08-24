// Maps raw native error text to calm, human copy for the primary UI.
// The raw string is never lost — it always stays available in Diagnostics.
export function friendlyError(rawMessage) {
  const msg = (rawMessage || '').toLowerCase();

  if (msg.includes('permission')) {
    return 'Microphone access is required for the voice assistant to work.';
  }
  if (msg.includes('model') && (msg.includes('missing') || msg.includes('not found'))) {
    return 'A required voice model is missing. Try downloading it again.';
  }
  if (msg.includes('sha256') || msg.includes('checksum')) {
    return 'A downloaded model failed verification. Please redownload it.';
  }
  if (msg.includes('storage') || msg.includes('space')) {
    return 'Not enough storage space to download the voice models.';
  }
  if (msg.includes('focus denied') || msg.includes('audio focus')) {
    return 'Another app is using audio right now.';
  }
  if (msg.includes('microphone') && msg.includes('come back')) {
    return 'The microphone stopped unexpectedly. Try again.';
  }
  if (!rawMessage) {
    return 'Something went wrong starting the voice engine.';
  }
  return 'The voice engine ran into a problem.';
}
