const API_BASE_URL = "http://localhost:8000";

// Real API client
export const base44 = {
  entities: {
    RecommendationLog: {
      list: (sort = "-created_date", limit = 100) => 
        fetch(`${API_BASE_URL}/logs?skip=0&limit=${limit}`)
          .then(res => res.json())
          .catch(err => {
            console.error("Error fetching logs:", err);
            return [];
          }),
    },
    MenuItem: {
      list: (sort = "-created_date", limit = 200) =>
        fetch(`${API_BASE_URL}/menu-items?skip=0&limit=${limit}`)
          .then(res => res.json())
          .catch(err => {
            console.error("Error fetching menu items:", err);
            return [];
          }),
      
      create: (data) =>
        fetch(`${API_BASE_URL}/menu-items`, {
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
        fetch(`${API_BASE_URL}/menu-items/${id}`, {
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
        fetch(`${API_BASE_URL}/menu-items/${id}`, { method: "DELETE" })
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
          const menuItems = await fetch(`${API_BASE_URL}/menu-items?skip=0&limit=200`)
            .then(res => res.json())
            .catch(() => []);

          // Extract cart and context from prompt
          const cartMatch = params.prompt.match(/Current cart: ([^$]*)/);
          const mealTimeMatch = params.prompt.match(/Meal time: (\w+)/);
          const cuisineMatch = params.prompt.match(/Cuisine preference: (\w+)/);
          const segmentMatch = params.prompt.match(/User segment: (\w+)/);
          const cityMatch = params.prompt.match(/City: (\w+)/);

          // Call recommendation endpoint
          const response = await fetch(`${API_BASE_URL}/recommend`, {
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
