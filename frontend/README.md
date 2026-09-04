# cinema-shop-vue-ui

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

Install the project dependencies:

```sh
npm install
```

### Environment Variables

Create a `.env` file inside the `frontend` directory using `.env.sample` as a template.

For Windows PowerShell:

```powershell
Copy-Item .env.sample .env
```

For macOS or Linux:

```sh
cp .env.sample .env
```

The file must contain the URL of the running backend API:

```env
VITE_API_URL=http://127.0.0.1:8080
```

Make sure the backend is running and available at `http://127.0.0.1:8080` before starting the frontend.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

The development server will be available at:

```text
http://localhost:5173
```

### Compile and Minify for Production

```sh
npm run build
```
