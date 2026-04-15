# Byro

Byro is a mobile-first Next.js prototype for managing and sharing an offline trust profile.

## Local Development

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Production build check:

```bash
npm run build
```

## One-Click Deploy

This project is ready to deploy on Vercel with no extra server setup.

### Recommended Flow

1. Push this project to a GitHub repository.
2. Open Vercel and create a new project from that GitHub repository.
3. Vercel will detect `Next.js` automatically.
4. Click `Deploy`.

### Build Settings

Vercel should auto-detect these values:

- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `.next`

## Notes

- This app currently uses local client-side state with `zustand`.
- Social profile links are hardcoded mock/prototype data.
- User-edited state persists in the browser through local storage, not a backend database.
