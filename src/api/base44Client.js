// Determine API base URL. During development we talk to the local Express server
// (which remains useful for folks running `npm run backend`). In production the
// serverless functions live under `/api` so we simply use a relative path.
// NOTE: empty string is a valid base in prod because the runtime will call
// relative routes like `/api/logs`. We only mock when the explicit env var is set.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Real API client with optional mock data controlled by VITE_MOCK_DATA only.
const shouldMock = import.meta.env.VITE_MOCK_DATA === 'true';

const sampleLogs = [
  {
    id: 1,
    created_date: new Date().toISOString(),
    session_id: 'mock-session-1',
    meal_time: 'lunch',
    user_segment: 'budget',
    recommended_items: [],
    accepted_items: [],
    latency_ms: 123,
  },
  {
    id: 2,
    created_date: new Date().toISOString(),
    session_id: 'mock-session-2',
    meal_time: 'dinner',
    user_segment: 'premium',
    recommended_items: [],
    accepted_items: [],
    latency_ms: 87,
  },
];

export const base44 = {  entities: {
    RecommendationLog: {
      list: (sort = "-created_date", limit = 100) => {
        if (shouldMock) {
          return Promise.resolve(sampleLogs);
        }
        return fetch(`${API_BASE_URL}/api/logs?skip=0&limit=${limit}`)
          .then(res => res.json())
          .catch(err => {
            console.error("Error fetching logs:", err);
            return sampleLogs;
          });
      },
      create: (data) => {
        if (shouldMock) {
          // no-op when mocking
          console.warn("Mock mode: skipping log creation", data);
          return Promise.resolve({...data, id: sampleLogs.length + 1});
        }
        return fetch(`${API_BASE_URL}/api/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        .then(res => res.json())
        .catch(err => {
          console.error("Error creating log:", err);
          throw err;
        });
      }
    },
    MenuItem: {
      list: (sort = "-created_date", limit = 200) => {
        if (shouldMock) {
          return Promise.resolve([]);
        }
        return fetch(`${API_BASE_URL}/api/menu-items?skip=0&limit=${limit}`)
          .then(res => res.json())
          .catch(err => {
            console.error("Error fetching menu items:", err);
            return [];
          });
      },
      
      create: (data) =>
        fetch(`${API_BASE_URL}/api/menu-items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
          .then(res => res.json())
          .catch(err => {
            console.error("Error creating menu item:", err);
            throw err;
          }),
      
      update: (id, data) =>
        fetch(`${API_BASE_URL}/api/menu-items/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
          .then(res => res.json())
          .catch(err => {
            console.error("Error updating menu item:", err);
            throw err;
          }),
      
      delete: (id) =>
        fetch(`${API_BASE_URL}/api/menu-items/${id}`, { method: "DELETE" })
          .then(res => res.json())
          .catch(err => {
            console.error("Error deleting menu item:", err);
            throw err;
          }),
    },
  },

  
  integrations: {
    Core: {
      InvokeLLM: async (params) => {
        try {
          // Get menu items for recommendation
          const menuItems = await fetch(`${API_BASE_URL}/api/menu-items?skip=0&limit=200`)
            .then(res => res.json())
            .catch(() => []);

          // Extract cart and context from prompt
          const cartMatch = params.prompt.match(/Current cart: ([^$]*)/);
          const mealTimeMatch = params.prompt.match(/Meal time: (\w+)/);
          const cuisineMatch = params.prompt.match(/Cuisine preference: (\w+)/);
          const segmentMatch = params.prompt.match(/User segment: (\w+)/);
          const cityMatch = params.prompt.match(/City: (\w+)/);

          // Call recommendation endpoint
          const response = await fetch(`${API_BASE_URL}/api/recommend`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cart_items: [],
              meal_time: mealTimeMatch ? mealTimeMatch[1].toLowerCase() : "dinner",
              cuisine: cuisineMatch ? cuisineMatch[1].toLowerCase() : "indian",
              user_segment: segmentMatch ? segmentMatch[1].toLowerCase() : "frequent",
              city: cityMatch ? cityMatch[1].toLowerCase() : "hyderabad",
            }),
          })
            .then(res => res.json())
            .catch(err => {
              console.error("Error getting recommendations:", err);
              return { recommendations: [] };
            });

          return response;
        } catch (err) {
          console.error("Error in LLM integration:", err);
          return { recommendations: [] };
        }
      },
    },
  },
  
  // Generic methods
  get: (url) =>
    fetch(`${API_BASE_URL}${url}`)
      .then(res => res.json())
      .catch(err => {
        console.error("Error in GET request:", err);
        return null;
      }),
  
  post: (url, data) =>
    fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .catch(err => {
        console.error("Error in POST request:", err);
        throw err;
      }),
};
