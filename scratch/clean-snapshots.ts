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

async function cleanContaminatedSnapshots() {
  const { getMongoDb } = await import('../src/lib/mongodb')
  const db = await getMongoDb()

  const contaminatedMonths = ['2026-04', '2026-08', '2026-09']

  for (const month of contaminatedMonths) {
    const res = await db.collection('price_index_snapshots').deleteOne({ month })
    console.log(`Deleted month ${month}: deletedCount = ${res.deletedCount}`)
  }

  const remaining = await db
    .collection('price_index_snapshots')
    .find({}, { projection: { month: 1, computedAt: 1 } })
    .sort({ month: 1 })
    .toArray()

  console.log('\n=== Remaining Snapshots in DB ===')
  console.log(JSON.stringify(remaining, null, 2))
}

cleanContaminatedSnapshots()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
