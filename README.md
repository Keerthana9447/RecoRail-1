# RecoRail

RecoRail is a recommendation simulator built with React and Vite.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

## Local Backend
A simple Node/Express backend serves menu items and recommendation logic used by the simulator, menu items, and logs pages.

To start it locally you have two options: either run the backend by
hand and then start the frontend, or use the new `dev` script which does
both for you.

```bash
# install deps first (once)
npm install

# option 1: start server and client together (recommended)
npm run dev          # spins up express backend + Vite dev server

# option 2: run the backend on its own, then launch the frontend
npm run backend      # starts express server on :8000
# in a separate terminal:
VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

The front end will automatically proxy `/api/*` to `http://localhost:8000`
when the backend is running (see `vite.config.js`), so you generally don't
need to set `VITE_API_BASE_URL` at all when using `npm run dev`.

If `VITE_API_BASE_URL` is omitted and no local server is running, the client
falls back to the tiny serverless handlers in the `api/` folder; this is
what happens in production on Vercel.

### Deploying to Vercel
Push the repository to a Git provider (GitHub/GitLab/Bitbucket) and import
it in Vercel. The `api/` directory contains the serverless endpoints, which
will automatically be served under `/api/*`. No extra configuration is needed.
The app itself will be built by Vite and served statically. State is in-memory
on each function invocation, so menu items/logs reset when the function cold
starts.
The API endpoints are:

- `GET /menu-items` — list items (sorted newest first)
- `POST /menu-items` — create a new item
- `PUT /menu-items/:id` — update an item
- `DELETE /menu-items/:id` — remove an item
- `POST /recommend` — body includes cart_items, meal_time, cuisine, user_segment, city; returns up to 6 recommendations
- `GET /logs` — returns recommendation logs
- `POST /logs` — create a log entry

Logs are generated automatically on the **server** whenever the
Simulator requests recommendations. Each call to `POST /api/recommend`
(issued by the cart whenever items change) writes a log entry, which is
then returned by `GET /api/logs` and visible on the **Logs** page. The
previous client-side `POST /logs` behaviour has been removed to keep the
flow simple and avoid duplicate records.

Make sure `VITE_MOCK_DATA` is **not** set when running in production; the
client will otherwise use the built-in sample data instead of hitting the
real `/api` endpoints.

Menu items are seeded with sample data on first server start; state is persisted to `backend/data.db` using SQLite. Logs are also stored there and survive restarts.

