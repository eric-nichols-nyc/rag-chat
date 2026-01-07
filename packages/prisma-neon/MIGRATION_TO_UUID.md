# Migration Guide: Notes ID from Serial to UUID

## Overview

This guide explains how to migrate the `notes` table from using serial integers to UUIDs as primary keys. This is a best practice for modern applications.

## Why UUIDs?

1. **Security**: Don't expose sequence information about your data
2. **Distributed Systems**: Work seamlessly across multiple databases/servers
3. **Data Merging**: Easy to merge datasets without ID conflicts
4. **Scalability**: No coordination needed for ID generation
5. **Industry Standard**: Common in modern, production applications

## Schema Changes Made

✅ **Updated:**
- `notes.id`: `Int` → `String @default(uuid()) @db.Uuid`
- `flash_cards.note_id`: `Int` → `String @db.Uuid`
- `note_chunks.note_id`: `Int` → `String @db.Uuid`
- `quizzes.note_id`: `Int` → `String @db.Uuid`
- `transcript_segments.note_id`: `Int` → `String @db.Uuid`

## Migration Steps

### Option 1: Fresh Start (Recommended for Learning Projects)

If you don't have important data or want a clean start:

```bash
# 1. Enable pgvector extension (required for embedding fields)
cd packages/prisma-neon
npx prisma db execute --stdin <<< "CREATE EXTENSION IF NOT EXISTS vector;"

# 2. Reset your database (⚠️ This will DELETE all data)
npx prisma db push --force-reset --accept-data-loss

# 3. Regenerate Prisma client
npx prisma generate
```

### Option 2: Data-Preserving Migration (For Existing Data)

If you have data you want to keep:

```bash
# 1. Create a migration
cd packages/prisma-neon
npx prisma migrate dev --name change_notes_id_to_uuid --create-only

# 2. Edit the migration SQL file to convert existing data
# The migration file will be in: prisma/migrations/YYYYMMDDHHMMSS_change_notes_id_to_uuid/migration.sql

# 3. Apply the migration
npx prisma migrate dev

# 4. Regenerate Prisma client
npx prisma generate
```

#### Migration SQL Template (for data preservation)

If you need to preserve data, here's a template SQL migration:

```sql
-- Step 1: Add new UUID column to notes
ALTER TABLE notes ADD COLUMN id_new UUID DEFAULT gen_random_uuid();

-- Step 2: Update all foreign key columns in related tables
-- Create temporary columns
ALTER TABLE flash_cards ADD COLUMN note_id_new UUID;
ALTER TABLE note_chunks ADD COLUMN note_id_new UUID;
ALTER TABLE quizzes ADD COLUMN note_id_new UUID;
ALTER TABLE transcript_segments ADD COLUMN note_id_new UUID;

-- Step 3: Populate new UUID columns with mappings
UPDATE flash_cards SET note_id_new = (
  SELECT id_new FROM notes WHERE notes.id = flash_cards.note_id
);
-- Repeat for other tables...

-- Step 4: Drop old columns, rename new ones
-- (Complex - requires careful ordering due to dependencies)
```

**Note**: The data-preserving migration is complex. For a learning project, Option 1 is recommended.

## Code Updates Needed

After migration, you'll need to update TypeScript code that references note IDs:

### Before (Int):
```typescript
const noteId: number = 123;
const notes = await database.notes.findUnique({ where: { id: 123 } });
```

### After (UUID):
```typescript
const noteId: string = "550e8400-e29b-41d4-a716-446655440000";
const notes = await database.notes.findUnique({
  where: { id: "550e8400-e29b-41d4-a716-446655440000" }
});
```

## Files That May Need Updates

1. **Actions**: Check `apps/app/actions/get-notes.ts` and any other actions
2. **API Routes**: Any routes that use note IDs
3. **Components**: Any components that display or use note IDs
4. **Tests**: Update test fixtures and mocks

## Verification

After migration, verify everything works:

```bash
# 1. Check the schema matches
npx prisma format

# 2. Test database connection
npx prisma db pull

# 3. Run your tests
cd apps/app
pnpm test

# 4. Test the application
pnpm dev
```

## Next Steps

After successful migration:
1. ✅ All note IDs are now UUIDs
2. ✅ Prisma client regenerated with correct types
3. ✅ Update any application code using note IDs
4. ✅ Run tests to verify everything works

## Rollback (If Needed)

If you need to rollback:

```bash
# Check migration history
npx prisma migrate status

# Rollback last migration
npx prisma migrate resolve --rolled-back <migration_name>
```

Note: Rolling back is complex once data is migrated. Always backup before migration in production!

