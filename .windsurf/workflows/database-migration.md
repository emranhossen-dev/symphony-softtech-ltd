---
description: Safe database migration practices to prevent data loss
---

# Database Migration Workflow

## ⚠️ CRITICAL WARNING

**NEVER run `prisma migrate dev` without understanding the consequences.** It can reset your entire database and delete all data.

## Why Data Loss Occurred

The migration `20260604204154_add_notes_table` detected a "drift" between the migration history and the actual database schema. When I confirmed the reset, it:
- Deleted all tables
- Re-ran all migrations from scratch
- Lost all user data, enrollments, courses, etc.

## Safe Migration Practices

### Option 1: Use `prisma db push` (Recommended for Development)

For schema changes during development, use `prisma db push` instead of `prisma migrate dev`:

```bash
npx prisma db push
```

**Advantages:**
- Does not require migration history
- Does not reset the database
- Applies schema changes directly
- Safer for development

**Disadvantages:**
- No migration history
- Not suitable for production deployments

### Option 2: Use `prisma migrate dev` with `--create-only`

Generate migration without applying it:

```bash
npx prisma migrate dev --name add_notes_table --create-only
```

Then review the migration file before applying:
1. Check the generated SQL in `prisma/migrations/[timestamp]_[name]/migration.sql`
2. Verify it won't drop tables or delete data
3. Only then apply with `npx prisma migrate dev`

### Option 3: Manual SQL for Production

For production, write manual SQL migrations:
1. Create migration with `--create-only`
2. Write custom SQL that preserves data
3. Test on staging first
4. Apply to production

## When to Use Each Approach

| Situation | Recommended Command |
|-----------|---------------------|
| Adding new table | `npx prisma db push` |
| Adding new column (nullable) | `npx prisma db push` |
| Adding new column (with default) | `npx prisma db push` |
| Changing column type (data loss risk) | Manual SQL migration |
| Dropping table/column | Manual SQL migration |
| Production deployment | Migration with manual review |

## Pre-Migration Checklist

Before running ANY migration:

1. **Backup database** - Always have a recent backup
2. **Review schema changes** - Understand what will change
3. **Check for data loss risk** - Will any data be lost?
4. **Test on staging** - Never test on production first
5. **Have rollback plan** - Know how to revert if needed

## Recovery from Data Loss

If data loss occurs:

1. **Stop all operations** - Don't make more changes
2. **Check for backups** - Look for database backups
3. **Assess impact** - What data was lost?
4. **Recreate critical data** - User accounts, enrollments, etc.
5. **Document the incident** - Learn from the mistake

## Current Project Status

- Database was reset on 2026-06-05
- Migration `20260604204154_add_notes_table` caused the reset
- User accounts and enrollments need to be recreated
- Use `prisma db push` for future development changes

## Emergency Contact

If you're unsure about a migration:
1. Stop and ask for help
2. Don't confirm any reset prompts
3. Review the changes manually first
4. Test on a copy of the database
