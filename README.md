# PW-PIPRO Web App (Vercel Ready)

Responsive, full-screen web app with integrated serverless proxy, automated branding replacement (`MARCO` -> `PW`), and updated Telegram links.

---

## Vercel Par Deploy Karne Ka Tarika (Step-by-Step Guide)

Aap is repository ko Vercel par 2 aasan tareeqo se deploy kar sakte hain:

### Tareeqa 1: GitHub Se Direct Deploy (Sabse Aasan & Recommended)

1. **Repository ko GitHub par push / import karein**:
   - Agar aapne AI Studio se GitHub export kiya hai ya local git repository push ki hai.
2. **[Vercel](https://vercel.com) par login karein**:
   - Vercel dashboard par jayein aur **"Add New..."** > **"Project"** par click karein.
3. **Apni GitHub Repository select karein** aur **"Import"** par click karein.
4. **Project Settings**:
   - **Framework Preset**: `Vite` (Vercel isse automatically detect kar lega).
   - **Root Directory**: `./` (Default rehne dein).
   - **Build Command**: `vite build` (Ya `npm run build`).
   - **Output Directory**: `dist`.
   *(Ye sabhi configurations pehle se `vercel.json` me set hain, isliye aapko manually kuch badalne ki zaroorat nahi hai).*
5. **"Deploy"** button par click karein.
6. 1 minute me aapka live Vercel URL (jaise `https://pw-pipro-app.vercel.app`) active ho jayega!

---

### Tareeqa 2: Vercel CLI Se Deploy

Terminal / Command Prompt me ye commands run karein:

```bash
# 1. Vercel CLI install karein (agar pehle se nahi hai)
npm install -g vercel

# 2. Project folder me login karein
vercel login

# 3. Production me deploy karein
vercel --prod
```

CLI aapse prompt karega:
- `Set up and deploy?`: **Y**
- `Which scope?`: Apka account
- `Link to existing project?`: **N**
- `Project name`: Enter dabayein
- `Directory?`: Enter dabayein (`./`)

Deployment turant complete ho jayegi aur production URL mil jayega!

---

## Project Structure & Architecture

- **`vercel.json`**: Vercel ke routing rules configured hain jo `/frame`, `/assets`, aur `/_serverFn` requests ko serverless API (`/api/index.ts`) par route karte hain aur baaki sabhi routes par Vite client-side SPA serve karte hain.
- **`api/index.ts`**: Vercel Serverless Function entry point.
- **`server/app.ts`**: Core Express app jo target server se live content proxy karta hai, `MARCO` ko `Pw` se replace karta hai aur Telegram links ko update karta hai.
- **`src/App.tsx`**: Full-screen clean web viewport bina kisi extra top frame ke.
