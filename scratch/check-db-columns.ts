import { prisma } from '../src/lib/prisma'

async function checkColumns() {
  console.log('=== Checking Live Database Column Existence ===\n')

  const tables = ['wishlist_items', 'alerts', 'notification_logs']

  for (const table of tables) {
    const columns: any[] = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = '${table}'
      ORDER BY ordinal_position;
    `)
    console.log(`Table: ${table}`)
    columns.forEach((c) => {
      console.log(`  - ${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`)
    })
    console.log('')
  }
}

checkColumns()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error checking columns:', err)
    process.exit(1)
  })
