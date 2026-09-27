USE DataPilot;
GO

IF OBJECT_ID('dbo.datasets', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.datasets (
        id INT IDENTITY(1,1) PRIMARY KEY,
        filename NVARCHAR(255) NOT NULL,
        file_type NVARCHAR(20) NOT NULL,
        row_count INT,
        column_count INT,
        uploaded_at DATETIME2 DEFAULT SYSDATETIME()
    );
END;
GO