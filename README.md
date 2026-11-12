# clans_manage

Clash of Clans Management Dashboard - Next.js 16.4.3 Application

## Project Overview

**clans_manage** is a web application for managing Clash of Clans clans, featuring:
- Clan detail pages with member lists
- Legend League leaderboard with division filters
- CWL (Clan War League) roster management
- Current war status tracking
- API integration with ClashKing and Official CoC APIs

## Technology Stack

- **Framework**: Next.js 16.4.3 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **State Management**: React Hooks (useState, useMemo, useEffect)
- **Icons**: react-icons
- **HTTP Client**: axios with interceptors
- **Lint/Format**: Biome.js
- **Build**: Turbopack

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── api/          # API Routes (cwl, leagues/members)
│   ├── clans/        # Clan detail pages [tag]
│   ├── layout.tsx    # Root layout dengan Navbar
│   └── page.tsx      # Home page
├── containers/       # Reusable React components
│   ├── Clan.tsx
│   ├── ClanMemberList.tsx
│   ├── CwlMemberManager.tsx
│   ├── currentwar.tsx
│   ├── CwlMemberPopup.tsx
│   └── LegendLeaderboard.tsx
├── hooks/            # Custom React hooks
│   ├── clans.ts
│   ├── cwl.ts
│   └── useLegendLeaderboard.ts
├── lib/              # Library & data
│   └── type.ts       # TypeScript interfaces
├── service/          # API Services
│   ├── axios.ts
│   └── endpoints.ts
└── utility/          # Utility components
    └── navbar.tsx
```

## Key Features

| Feature | Description |
|---------|-------------|
| **Home Page** | Menampilkan 3 clan (Clan Master, CM Family, indi klan tan) dengan card member |
| **Legend Leaderboard** | Leaderboard lengkap dengan filter divisi (Legend I/II/III), search player/tag/clan, auto-refresh pukul 12 siang WIB |
| **Clan Detail** | Halaman `/clans/[tag]/` menampilkan detail clan, member list, dan CWL roster |
| **CWL Roster** | Menampilkan member CWL dari data.json per-clan |
| **Current War** | Status perang clan saat ini dengan statistik attacks dan destruction |
| **API Integration** | Dual API: ClashKing (api.clashk.ing) + Official CoC API |

## Getting Started

### Prerequisites

- Node.js 20+
- npm atau yarn

### Installation

```bash
# Install dependencies
npm install

# Atau dengan yarn
yarn 
```

### Setup ENV

Buatlah .env di clans_manage dan tempelkan ini:

```bash

CLASHKING_URL=
COC_URL=
API_COC=

```

Untuk COC_URL anda dapat mengambil di
- https://developer.clashofclans.com/

untuk API_COC anda dapat mengambil di website yang sama dan anda harus register dan login
setelah login anda masuk ke bagian profile, dan di situ ada "Create Api", setelah membuat API nya copy dan paste
di API_COC pada file .env yang telah anda buat

### Development Server

```bash
# Menjalankan development server di http://localhost:3000
npm run dev

# Atau menggunakan Turbopack
npx next dev
```

### Build for Production

```bash
npm run build
```

### Lint and Format

```bash
# Menjalankan lint
npm run lint

# Format code
npm run format
```

### Notes 

- ini website hanya untuk Clan Saya dan membernya pada game Clash of Clans