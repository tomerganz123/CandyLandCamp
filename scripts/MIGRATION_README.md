# Database Migration Guide: midburn-camp → CandyLandCamp

This guide explains how to migrate your data from the old `midburn-camp` database to the new `CandyLandCamp` database.

## Prerequisites

- Node.js installed
- Access to both old and new MongoDB databases
- MongoDB connection strings for both databases

## Migration Script

The migration script (`migrate-to-candyland.js`) will:

1. ✅ Connect to the old database (`midburn-camp`)
2. ✅ Connect to the new database (`CandyLandCamp`)
3. ✅ Create all necessary collections in the new database:
   - `budgetexpenses` - Budget and expense tracking
   - `members` - Camp member registrations
   - `additionalinfos` - Additional member information
   - `feepayments` - Fee payment records
   - `kitchenshifts` - Kitchen shift registrations
   - `volunteershifts` - Volunteer shift registrations
4. ✅ Copy all budget data from old to new database
5. ✅ Verify the migration was successful

## Running the Migration

### Option 1: Using npm script

```bash
npm run migrate
```

### Option 2: Direct execution

```bash
node scripts/migrate-to-candyland.js
```

### Option 3: With custom environment variables

```bash
OLD_MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/midburn-camp?retryWrites=true&w=majority" \
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/CandyLandCamp?retryWrites=true&w=majority" \
node scripts/migrate-to-candyland.js
```

## Environment Variables

The script uses the following environment variables (with defaults):

- `OLD_MONGODB_URI` - Connection string for the old database (defaults to midburn-camp)
- `MONGODB_URI` - Connection string for the new database (defaults to CandyLandCamp)

You can set these in your `.env.local` file or pass them as environment variables.

## What Gets Migrated

### Budget Expenses
- All budget expense records
- Payment information
- Legacy payment data (converted to new structure)
- All metadata (dates, categories, notes, etc.)

### Database Structure
The script creates all necessary collections with proper schemas:
- Budget expenses with payment tracking
- Member management
- Additional information
- Fee payments
- Kitchen shifts
- Volunteer shifts

## Verification

After running the migration, the script will:
1. Count records in both databases
2. Compare the counts
3. Report any discrepancies

## Post-Migration Steps

1. **Update Environment Variables**
   ```bash
   # In .env.local
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/CandyLandCamp?retryWrites=true&w=majority
   ```

2. **Test the Application**
   - Start the development server: `npm run dev`
   - Access the admin dashboard
   - Verify budget data is visible
   - Test creating new budget entries

3. **Verify Data Integrity**
   - Check that all budget expenses are present
   - Verify payment information is correct
   - Test budget expense creation and editing

## Troubleshooting

### Connection Errors
- Verify your MongoDB connection strings are correct
- Check that your IP is whitelisted in MongoDB Atlas
- Ensure the database user has read/write permissions

### Migration Fails Partway
- The script uses ordered inserts, so partial data may exist
- Check the new database for what was migrated
- You may need to clear the new database and re-run the migration

### Count Mismatch
- This could indicate some records failed to insert
- Check MongoDB logs for specific errors
- Verify schema compatibility between old and new databases

## Notes

- The migration script does NOT delete data from the old database
- The old database remains intact for backup purposes
- Only budget expenses are copied in this migration
- Other collections (members, etc.) will be created but remain empty

## Support

If you encounter issues during migration:
1. Check the console output for specific error messages
2. Verify database connection strings
3. Ensure MongoDB Atlas cluster is running
4. Check network connectivity

