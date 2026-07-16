export async function runAdminAction(handler) {
  try {
    const result = await handler();
    return result ?? { success: true };
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Request failed. Please try again.',
      status: error?.status || 500,
    };
  }
}
