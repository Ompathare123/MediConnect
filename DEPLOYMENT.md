# MediConnect Deployment (Render + Vercel)

## 1) Backend on Render

- Service type: `Web Service`
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Runtime: `Node`

### Backend Environment Variables (Render)

Set these in Render dashboard:

- `MONGO_URI`
- `JWT_SECRET`
- `PORT` = `5000` (optional, Render also injects `PORT`)
- `FRONTEND_URL` = `https://<your-vercel-app>.vercel.app`
- `EMAIL_USER`
- `EMAIL_PASS`

Health check endpoint:

- `/api/health`

## 2) Frontend on Vercel

- Project root: `client`
- Framework preset: `Create React App`
- Build command: `npm run build`
- Output directory: `build`

### Frontend Environment Variables (Vercel)

Set in Vercel project settings:

- `REACT_APP_API_BASE_URL` = `https://<your-render-service>.onrender.com`

`vercel.json` is already added for SPA route handling.

## 3) Secrets and Git Safety

- `server/.env` is no longer tracked.
- Use `server/.env.example` and `client/.env.example` as templates.
- Rotate old secrets if they were previously pushed.

## 4) Free Tier Note

File uploads currently use local `server/uploads`. On Render free instances, local disk is ephemeral, so uploaded files can be lost after restart/redeploy.

Current behavior is unchanged and functional, but persistent file storage requires an external storage provider (for example Cloudinary/S3) for full production durability.
