/**
 * Profile / membership API wrappers (privileged ops stay on the server).
 */
import { apiRequest } from './client';

/**
 * Checks whether a phone exists in approved_members (server-side).
 * @param {string} phone
 * @returns {Promise<{verified: boolean, member: object|null}>}
 */
export async function checkMembership(phone) {
  return apiRequest('/api/profile?action=check-membership', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

/**
 * Creates/updates the user profile; server sets is_verified from membership.
 * @param {object} profileData
 * @returns {Promise<{data: object, verified: boolean}>}
 */
export async function completeProfile(profileData) {
  return apiRequest('/api/profile?action=complete', {
    method: 'POST',
    body: JSON.stringify(profileData),
  });
}
