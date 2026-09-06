/**
 * Utility helpers for KaushalAI Virtual Labs client
 */

export const formatDuration = (minutes) => {
  if (!minutes) return 'N/A';
  return `${minutes} min`;
};

export const sanitizeLabId = (labId) => {
  return String(labId).replace(/[^a-zA-Z0-9-_]/g, '');
};
