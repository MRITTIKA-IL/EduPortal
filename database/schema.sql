-- ================================================
-- Student Portal Database Schema (T-SQL / SSMS)
-- ================================================

-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'StudentPortalDB')
BEGIN
    CREATE DATABASE StudentPortalDB;
END
GO

USE StudentPortalDB;
GO

-- ================================================
-- PUBLIC SITE TABLES
-- ================================================

-- Announcements / News & Events
CREATE TABLE Announcements (
    AnnouncementID   INT IDENTITY(1,1) PRIMARY KEY,
    Title            NVARCHAR(255)   NOT NULL,
    Slug             NVARCHAR(255)   NOT NULL UNIQUE,
    Summary          NVARCHAR(500)   NOT NULL,
    Content          NVARCHAR(MAX)   NOT NULL,
    Category         NVARCHAR(50)    NOT NULL DEFAULT 'General', -- 'News', 'Event', 'Academic', 'General'
    ImageURL         NVARCHAR(500)   NULL,
    PublishedAt      DATETIME2       NULL,
    IsPublished      BIT             NOT NULL DEFAULT 0,
    IsFeatured       BIT             NOT NULL DEFAULT 0,
    CreatedAt        DATETIME2       NOT NULL DEFAULT GETDATE(),
    UpdatedAt        DATETIME2       NOT NULL DEFAULT GETDATE()
);

-- Courses (Public Catalog)
CREATE TABLE Departments (
    DepartmentID    INT IDENTITY(1,1) PRIMARY KEY,
    Name            NVARCHAR(100)  NOT NULL,
    Code            NVARCHAR(10)   NOT NULL UNIQUE,
    Description     NVARCHAR(500)  NULL,
    HeadOfDept      NVARCHAR(100)  NULL,
    CreatedAt       DATETIME2      NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Courses (
    CourseID        INT IDENTITY(1,1) PRIMARY KEY,
    CourseCode      NVARCHAR(20)   NOT NULL UNIQUE,
    Title           NVARCHAR(255)  NOT NULL,
    Description     NVARCHAR(MAX)  NULL,
    Credits         INT            NOT NULL DEFAULT 3,
    DepartmentID    INT            NULL REFERENCES Departments(DepartmentID),
    Level           NVARCHAR(20)   NOT NULL DEFAULT 'Undergraduate', -- 'Undergraduate', 'Postgraduate'
    IsActive        BIT            NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2      NOT NULL DEFAULT GETDATE()
);

-- Contact Form Submissions
CREATE TABLE ContactMessages (
    MessageID       INT IDENTITY(1,1) PRIMARY KEY,
    FullName        NVARCHAR(100)  NOT NULL,
    Email           NVARCHAR(255)  NOT NULL,
    Phone           NVARCHAR(20)   NULL,
    Subject         NVARCHAR(255)  NOT NULL,
    MessageBody     NVARCHAR(MAX)  NOT NULL,
    Status          NVARCHAR(20)   NOT NULL DEFAULT 'Unread', -- 'Unread', 'Read', 'Replied'
    SubmittedAt     DATETIME2      NOT NULL DEFAULT GETDATE()
);

-- ================================================
-- STUDENT / AUTH TABLES (Phase 2)
-- ================================================

CREATE TABLE Users (
    UserID          INT IDENTITY(1,1) PRIMARY KEY,
    Email           NVARCHAR(255)  NOT NULL UNIQUE,
    PasswordHash    NVARCHAR(500)  NOT NULL,
    Role            NVARCHAR(20)   NOT NULL DEFAULT 'Student', -- 'Student', 'Admin', 'Staff'
    IsActive        BIT            NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2      NOT NULL DEFAULT GETDATE(),
    LastLoginAt     DATETIME2      NULL
);

CREATE TABLE Students (
    StudentID       INT IDENTITY(1,1) PRIMARY KEY,
    UserID          INT            NOT NULL UNIQUE REFERENCES Users(UserID),
    StudentNumber   NVARCHAR(20)   NOT NULL UNIQUE,
    FirstName       NVARCHAR(50)   NOT NULL,
    LastName        NVARCHAR(50)   NOT NULL,
    DateOfBirth     DATE           NULL,
    Phone           NVARCHAR(20)   NULL,
    Address         NVARCHAR(500)  NULL,
    DepartmentID    INT            NULL REFERENCES Departments(DepartmentID),
    EnrollmentYear  INT            NULL,
    GPA             DECIMAL(3,2)   NULL DEFAULT 0.00,
    ProfileImageURL NVARCHAR(500)  NULL,
    CreatedAt       DATETIME2      NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Enrollments (
    EnrollmentID    INT IDENTITY(1,1) PRIMARY KEY,
    StudentID       INT            NOT NULL REFERENCES Students(StudentID),
    CourseID        INT            NOT NULL REFERENCES Courses(CourseID),
    Semester        NVARCHAR(20)   NOT NULL, -- e.g. 'Fall 2026'
    Grade           NVARCHAR(5)    NULL,     -- 'A', 'B+', etc.
    GradePoints     DECIMAL(3,2)   NULL,
    Status          NVARCHAR(20)   NOT NULL DEFAULT 'Active', -- 'Active', 'Dropped', 'Completed'
    EnrolledAt      DATETIME2      NOT NULL DEFAULT GETDATE(),
    UNIQUE(StudentID, CourseID, Semester)
);

-- ================================================
-- SAMPLE DATA (PUBLIC SITE)
-- ================================================

INSERT INTO Departments (Name, Code, Description, HeadOfDept) VALUES
('Computer Science',       'CS',   'Study of algorithms, programming, and software engineering.', 'Dr. James Wilson'),
('Business Administration', 'BA',   'Management, finance, marketing and entrepreneurship.',       'Dr. Sarah Chen'),
('Engineering',             'ENG',  'Civil, mechanical and electrical engineering programs.',     'Dr. Michael Patel'),
('Medicine & Health',       'MED',  'Pre-med, nursing, and public health programs.',              'Dr. Emily Roberts'),
('Arts & Humanities',       'AH',   'Literature, philosophy, fine arts and social sciences.',     'Dr. David Nguyen');

INSERT INTO Courses (CourseCode, Title, Description, Credits, DepartmentID, Level) VALUES
('CS101', 'Introduction to Programming',       'Learn Python basics, algorithms, and problem solving.',          3, 1, 'Undergraduate'),
('CS201', 'Data Structures & Algorithms',      'Arrays, linked lists, trees, graphs, sorting, and searching.',  3, 1, 'Undergraduate'),
('CS301', 'Database Systems',                  'SQL, database design, normalization, and transactions.',         3, 1, 'Undergraduate'),
('CS401', 'Machine Learning',                  'Supervised, unsupervised learning, neural networks.',            3, 1, 'Postgraduate'),
('BA101', 'Principles of Management',          'Introduction to organizational management concepts.',             3, 2, 'Undergraduate'),
('BA201', 'Financial Accounting',              'Basics of accounting, financial statements, and reporting.',      3, 2, 'Undergraduate'),
('ENG101', 'Engineering Mathematics I',        'Calculus, linear algebra, and differential equations.',          4, 3, 'Undergraduate'),
('MED101', 'Human Anatomy & Physiology',       'Structure and function of the human body systems.',               4, 4, 'Undergraduate');

INSERT INTO Announcements (Title, Slug, Summary, Content, Category, IsPublished, IsFeatured, PublishedAt) VALUES
('Welcome to Fall Semester 2026',
 'welcome-fall-2026',
 'A warm welcome to all new and returning students for the Fall 2026 semester.',
 '<p>We are delighted to welcome all students to the Fall 2026 semester. This year promises exciting academic opportunities, new courses, and campus events. Please check your schedules and reach out to your academic advisors if you need guidance.</p>',
 'Academic', 1, 1, GETDATE()),

('Campus Library Extended Hours',
 'library-extended-hours-2026',
 'The campus library will be open 24/7 during the examination period.',
 '<p>Starting November 20th, the main campus library will operate 24 hours a day, 7 days a week through the end of the examination period on December 15th. Additional study rooms will also be available for booking online.</p>',
 'News', 1, 0, GETDATE()),

('Annual Science Fair – Register Now',
 'annual-science-fair-2026',
 'Registration is open for the Annual Science Fair. Deadline: December 1, 2026.',
 '<p>The Annual Science Fair is back! Students from all departments are encouraged to participate. Submit your project proposals by December 1, 2026. Winners will receive scholarships and certificates. Register through the student portal.</p>',
 'Event', 1, 1, GETDATE());
GO
