# Quick Start: Root-Me Category Stats

## Get Real Credentials

The `.env` file contains example credentials that won't work. You need real ones:

1. Go to: https://www.root-me.org/en/Settings
2. Find the **API** section
3. Copy your **User ID** (numeric)
4. Copy your **API Key** (long alphanumeric string)

## Update .env File

```bash
# Edit .env and replace with your real credentials:
ROOTME_USER_ID=your_numeric_id_here
ROOTME_API_KEY=your_full_api_key_here
```

## Fetch Your Stats

```bash
npm run update-stats
```

Expected output:
```
Fetching Root-Me category statistics...
Fetched 44 rubrique names
Fetched 300 challenges
Fetched author data
✓ Computed stats for 20 categories

Results saved to: src/data/category-stats.json
```

## Build with Stats

```bash
npm run build
```

Category badges will appear in the Root-Me page!

## Common Issues

| Error | Solution |
|-------|----------|
| `got status 401` | Your credentials are wrong. Update `.env` with correct values from https://www.root-me.org/en/Settings |
| `got status 429` | Rate limited. Wait 15 minutes and try again |
| `No challenges fetched` | Check your credentials are correct (401 error likely) |

See [ROOT-ME-STATS.md](./ROOT-ME-STATS.md) for full documentation.
