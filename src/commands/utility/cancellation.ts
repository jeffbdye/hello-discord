const cancellationMessages = [
  'Cancelled.',
  'Not like this :sob:',
  'Not this time?',
  'Guess not. No worries tho',
  'Cancelled. Next time, though.',
];

// TODO: account for if the user has sent a message yet - don't send a random message until after the first
export function getRandomCancelledMessage() {
  const messageIndex = Math.floor(Math.random() * cancellationMessages.length);
  return cancellationMessages[messageIndex];
}
