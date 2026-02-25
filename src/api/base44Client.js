// Mock base44 client to allow the app to run without base44 SDK
export const base44 = {
  entities: {
    RecommendationLog: {
      list: () => Promise.resolve([]), // Return empty array
    },
    MenuItem: {
      list: () => Promise.resolve([]), // Return empty array
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({}),
    },
  },
  // Mock methods as needed
  get: () => Promise.resolve({}),
  post: () => Promise.resolve({}),
  // Add other methods if used
};
