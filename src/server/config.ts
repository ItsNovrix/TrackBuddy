// Flight number regex - The "Source of Truth" for extraction
export const FLIGHT_REGEX = /\b([A-Z\d]{2,3})[\s-]?(\d{1,5})\b/i;

// Timing keywords - Used solely to trigger the Future Disclaimer warning
export const FUTURE_KEYWORDS = [
  'next week','next month','next year',
  'later this week','later this month',
  'in a few days','in \\d+ days','in \\d+ weeks','in \\d+ months',
  'on monday','on tuesday','on wednesday','on thursday','on friday','on saturday','on sunday',
  'upcoming flight','tomorrow','early tomorrow','tomorrow morning','tomorrow afternoon','tomorrow evening','tomorrow night' 
];

// Opt-out phrases - Reserved for future "Cancel" logic
export const OPTOUT_KEYWORDS = [
  "no tracking", "no links", "don't track", "please don't track"
];

// Required flair - Default value for the Settings UI
export const REQUIRED_FLAIR = 'Tracking Request';