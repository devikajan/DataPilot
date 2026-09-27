# DataPilot Database

This directory contains the SQL Server database schema and database-related scripts for DataPilot.

## Database

DataPilot uses Microsoft SQL Server as the primary relational database.

## Current Schema

### `datasets`

Stores metadata about datasets uploaded to DataPilot.

| Column | Type | Description |
|---|---|---|
| `id` | INT | Unique dataset ID |
| `filename` | NVARCHAR(255) | Uploaded dataset filename |
| `file_type` | NVARCHAR(20) | Dataset format |
| `row_count` | INT | Number of rows |
| `column_count` | INT | Number of columns |
| `uploaded_at` | DATETIME2 | Dataset upload timestamp |

## Files

- `schema.sql` — SQL Server database schema
- `README.md` — Database documentation