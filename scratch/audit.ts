import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8')
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim()
      let value = trimmed.slice(idx + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      process.env[key] = value
    }
  }
}

async function audit() {
  const { getMongoDb } = await import('../src/lib/mongodb')
  const db = await getMongoDb()

  console.log('=== A) price_index_snapshots ===')
  const snapshots = await db
    .collection('price_index_snapshots')
    .find({}, { projection: { month: 1, computedAt: 1, categories: 1 } })
    .sort({ month: 1 })
    .toArray()

  for (const s of snapshots) {
    console.log(`Month: ${s.month}, computedAt: ${s.computedAt}`)
    console.log(`Categories count: ${s.categories?.length || 0}`)
    if (s.categories) {
      for (const c of s.categories) {
        console.log(`  - ${c.category}: avgPrice=${c.avgPrice}, count=${c.productCount}`)
      }
    }
  }

  console.log('\n=== B) price_history grouped by month ===')
  const historyCounts = await db
    .collection('price_history')
    .aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$scraped_at' } },
          count: { $sum: 1 },
          categories: { $addToSet: '$category' },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray()

  console.log(JSON.stringify(historyCounts, null, 2))
}

audit()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
