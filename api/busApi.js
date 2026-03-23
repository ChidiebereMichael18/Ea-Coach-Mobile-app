import api from '../services/api';

/**
 * Fetch buses by route (from / to). No auth required.
 * @param {{ from?: string, to?: string }} params
 * @returns {Promise<{ success: boolean, data?: array, error?: string }>}
 */
export async function getBuses(params = {}) {
  try {
    const q = new URLSearchParams();
    if (params.from) q.set('from', params.from);
    if (params.to) q.set('to', params.to);
    const query = q.toString();
    const url = `/buses${query ? `?${query}` : ''}`;
    const response = await api.get(url);
    return { success: true, data: Array.isArray(response.data) ? response.data : [] };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch buses' 
    };
  }
}
