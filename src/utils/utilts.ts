export const clearAnalyticsData = () => {
  const keys = Object.keys(localStorage);
  const analyticsKeys = keys.filter(key => key.startsWith('user_') && key.endsWith('_analytics'));
  analyticsKeys.forEach(key => localStorage.removeItem(key));
};
