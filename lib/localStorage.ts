// Simple in-memory storage for localStorage bridge methods
// In a production app, you would want to use AsyncStorage or similar
const storage: Record<string, string> = {};

export default storage;
