-- AI Interview Proctor System - MySQL Schema Creation Script

CREATE DATABASE IF NOT EXISTS proctor_db;
USE proctor_db;

-- -----------------------------------------------------
-- Table structure for tables
-- -----------------------------------------------------

-- Drop new tables if exists in reverse dependency order
DROP TABLE IF EXISTS evaluation_results;
DROP TABLE IF EXISTS candidate_responses;
DROP TABLE IF EXISTS interview_templates;
DROP TABLE IF EXISTS coding_test_cases;
DROP TABLE IF EXISTS question_categories;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS cheating_logs;
DROP TABLE IF EXISTS ai_events;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS resume;
DROP TABLE IF EXISTS candidate_sessions;
DROP TABLE IF EXISTS interview_schedule;
DROP TABLE IF EXISTS question_set_questions;
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS question_sets;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

-- 1. USERS TABLE
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. ROLES TABLE
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. PERMISSIONS TABLE
CREATE TABLE permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. USER_ROLES JUNCTION TABLE
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ROLE_PERMISSIONS JUNCTION TABLE
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A1. QUESTION CATEGORIES TABLE
CREATE TABLE question_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_custom BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A2. QUESTIONS TABLE
CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    type VARCHAR(30) NOT NULL, -- MCQ, SUBJECTIVE, CODING, SQL, DEBUGGING
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) NOT NULL, -- EASY, MEDIUM, HARD
    topic VARCHAR(100) DEFAULT 'General',
    estimated_time_minutes INT DEFAULT 10,
    marks INT DEFAULT 10,
    negative_marks DOUBLE DEFAULT 0.0,
    created_by_id BIGINT DEFAULT NULL,
    version INT DEFAULT 1,
    is_archived BOOLEAN DEFAULT FALSE,
    options TEXT, -- For MCQ options
    correct_answer TEXT,
    mcq_type VARCHAR(20) DEFAULT 'SINGLE', -- SINGLE, MULTIPLE
    starter_code TEXT, -- Multi-language JSON / code snippet
    constraints TEXT,
    explanation TEXT,
    image_url VARCHAR(255),
    code_snippet TEXT,
    min_words INT DEFAULT 0,
    max_words INT DEFAULT 1000,
    evaluation_type VARCHAR(30) DEFAULT 'AUTO', -- AUTO, MANUAL, AI_ASSISTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_question_category (category),
    INDEX idx_question_difficulty (difficulty),
    INDEX idx_question_type (type),
    CONSTRAINT fk_question_creator FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A3. CODING TEST CASES TABLE
CREATE TABLE coding_test_cases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    sample_input TEXT,
    sample_output TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    explanation TEXT,
    order_index INT DEFAULT 0,
    CONSTRAINT fk_testcase_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- B. QUESTION_SETS TABLE
CREATE TABLE question_sets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    total_questions INT DEFAULT 0,
    total_marks INT DEFAULT 0,
    passing_marks INT DEFAULT 0,
    duration_minutes INT DEFAULT 60,
    randomize_order BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- C. QUESTION_SET_QUESTIONS JUNCTION TABLE
CREATE TABLE question_set_questions (
    question_set_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    PRIMARY KEY (question_set_id, question_id),
    CONSTRAINT fk_qsq_set FOREIGN KEY (question_set_id) REFERENCES question_sets(id) ON DELETE CASCADE,
    CONSTRAINT fk_qsq_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- D. INTERVIEW TEMPLATES TABLE
CREATE TABLE interview_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    duration_minutes INT NOT NULL,
    interview_type VARCHAR(50) NOT NULL,
    question_set_id BIGINT DEFAULT NULL,
    enable_ai_proctoring BOOLEAN DEFAULT TRUE,
    enable_browser_lock BOOLEAN DEFAULT TRUE,
    enable_webcam BOOLEAN DEFAULT TRUE,
    enable_microphone BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_template_qset FOREIGN KEY (question_set_id) REFERENCES question_sets(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. INTERVIEWS TABLE
CREATE TABLE interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    code VARCHAR(20) NOT NULL UNIQUE,
    duration_minutes INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    creator_id BIGINT NOT NULL,
    candidate_id BIGINT NOT NULL,
    question_set_id BIGINT DEFAULT NULL,
    difficulty VARCHAR(20) DEFAULT 'MEDIUM',
    question_count INT DEFAULT 5,
    interview_type VARCHAR(50) DEFAULT 'FULL_STACK',
    enable_ai_proctoring BOOLEAN DEFAULT TRUE,
    enable_browser_lock BOOLEAN DEFAULT TRUE,
    enable_webcam BOOLEAN DEFAULT TRUE,
    enable_microphone BOOLEAN DEFAULT TRUE,
    scheduled_start DATETIME NULL,
    scheduled_end DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_interview_code (code),
    CONSTRAINT fk_interview_creator FOREIGN KEY (creator_id) REFERENCES users(id),
    CONSTRAINT fk_interview_candidate FOREIGN KEY (candidate_id) REFERENCES users(id),
    CONSTRAINT fk_interview_qset FOREIGN KEY (question_set_id) REFERENCES question_sets(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- E. CANDIDATE RESPONSES TABLE
CREATE TABLE candidate_responses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    interview_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    candidate_id BIGINT NOT NULL,
    response_text TEXT,
    selected_options VARCHAR(255),
    submitted_code TEXT,
    programming_language VARCHAR(30),
    score DOUBLE DEFAULT 0.0,
    status VARCHAR(30) DEFAULT 'SUBMITTED', -- SUBMITTED, EVALUATED, PENDING
    evaluator_feedback TEXT,
    ai_feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_response_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_response_user FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- F. EVALUATION RESULTS TABLE
CREATE TABLE evaluation_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL UNIQUE,
    candidate_id BIGINT NOT NULL,
    total_score DOUBLE NOT NULL,
    max_score DOUBLE NOT NULL,
    passing_marks DOUBLE NOT NULL,
    passed BOOLEAN NOT NULL,
    evaluation_type VARCHAR(30) DEFAULT 'AUTO',
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eval_candidate FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. INTERVIEW_SCHEDULE TABLE
CREATE TABLE interview_schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_id BIGINT NOT NULL UNIQUE,
    scheduled_start DATETIME NOT NULL,
    scheduled_end DATETIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    CONSTRAINT fk_schedule_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. CANDIDATE_SESSIONS TABLE
CREATE TABLE candidate_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    client_ip VARCHAR(45),
    user_agent VARCHAR(255),
    fullscreen_exits INT DEFAULT 0,
    tab_switches INT DEFAULT 0,
    warning_count INT DEFAULT 0,
    INDEX idx_session_interview (interview_id),
    INDEX idx_session_user (user_id),
    CONSTRAINT fk_session_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. RESUME TABLE
CREATE TABLE resume (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    parsed_text LONGTEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. REPORTS TABLE
CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL UNIQUE,
    candidate_id BIGINT NOT NULL,
    final_score DOUBLE NOT NULL,
    decision VARCHAR(20) NOT NULL,
    summary TEXT,
    final_status VARCHAR(30),
    company_name VARCHAR(100),
    job_role VARCHAR(100),
    duration INT,
    risk_level VARCHAR(30),
    ai_recommendation TEXT,
    file_path VARCHAR(255),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_report_session FOREIGN KEY (session_id) REFERENCES candidate_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_candidate FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notification_user (user_id),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. AUDIT_LOGS TABLE
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. AI_EVENTS TABLE
CREATE TABLE ai_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50) NOT NULL,
    confidence DOUBLE NOT NULL,
    screenshot_path VARCHAR(255) NULL,
    INDEX idx_ai_event_session (session_id),
    CONSTRAINT fk_aievent_session FOREIGN KEY (session_id) REFERENCES candidate_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. CHEATING_LOGS TABLE
CREATE TABLE cheating_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    log_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(10) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cheating_log_session (session_id),
    CONSTRAINT fk_cheatinglog_session FOREIGN KEY (session_id) REFERENCES candidate_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. SETTINGS TABLE
CREATE TABLE settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Seed Data Insertion
-- -----------------------------------------------------

-- Insert Default Roles
INSERT INTO roles (name, description) VALUES
('ROLE_CANDIDATE', 'Standard candidate participating in interviews'),
('ROLE_INTERVIEWER', 'Interviewer who schedules, manages and evaluates candidates'),
('ROLE_ADMIN', 'Administrator with full system monitoring and configuration rights');

-- Insert Default Permissions
INSERT INTO permissions (name, description) VALUES
('JOIN_INTERVIEW', 'Permission to join and take a live proctored interview'),
('VIEW_OWN_REPORTS', 'Permission to view own reports and feedback'),
('SCHEDULE_INTERVIEW', 'Permission to schedule and invite candidates to interviews'),
('MANAGE_INTERVIEWS', 'Permission to edit, cancel, and oversee ongoing interviews'),
('VIEW_ALL_REPORTS', 'Permission to see performance and cheating reports of all candidates'),
('MANAGE_USERS', 'Permission to add, update, and manage accounts and roles'),
('SYSTEM_LOGS', 'Permission to view internal audit trails and configuration parameters');

-- Map Roles to Permissions
-- Admin Role gets all permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7);

-- Interviewer Role gets scheduling, proctoring controls, and reports
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5);

-- Candidate Role gets only join and view own reports
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2);

-- Seed System Settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('max_warnings_allowed', '3', 'Number of warnings before session suspension'),
('face_confidence_threshold', '0.70', 'Confidence score for positive facial verification'),
('audio_decibel_threshold', '65', 'Ambient sound energy threshold in dB to trigger warning'),
('allow_resume_upload', 'true', 'Enable resume parse feature in candidate dashboard'),
('eye_gaze_deviation_limit', '10', 'Number of frames a candidate can look away before triggering alert'),
('yolo_model_path', 'yolov8n.pt', 'Model file name/path for object detection');

-- Insert default question categories
INSERT INTO question_categories (name, description, is_custom) VALUES
('Data Structures', 'Arrays, Linked Lists, Trees, Graphs, Hash Tables', FALSE),
('Algorithms', 'Sorting, Searching, Dynamic Programming, Greedy Algorithms', FALSE),
('Java', 'Core Java, Multithreading, JVM, Spring Framework', FALSE),
('Python', 'Python Data Structures, Generators, AsyncIO, Data Science', FALSE),
('C++', 'Pointers, STL, Memory Management, OOP in C++', FALSE),
('JavaScript', 'Promises, Closures, Event Loop, ES6+ Features', FALSE),
('React', 'Hooks, State Management, Virtual DOM, Components', FALSE),
('Spring Boot', 'Spring MVC, Security, JPA/Hibernate, Microservices', FALSE),
('Database', 'Relational Model, Normalization, ACID Properties, Indexing', FALSE),
('SQL', 'Queries, Joins, Aggregations, Transactions', FALSE),
('Operating System', 'Processes, Threads, Memory Management, Deadlocks', FALSE),
('Computer Networks', 'TCP/IP, HTTP/HTTPS, DNS, WebSockets, WebRTC', FALSE),
('OOP', 'Inheritance, Polymorphism, Abstraction, Encapsulation', FALSE),
('HR', 'Behavioral, Communication, Teamwork, Scenario Questions', FALSE),
('Aptitude', 'Quantitative Reasoning, Logical Reasoning, Verbal Ability', FALSE);

-- Insert default questions
INSERT INTO questions (title, text, type, category, difficulty, topic, estimated_time_minutes, marks, negative_marks, options, correct_answer, mcq_type, starter_code, constraints, explanation) VALUES
('Monolithic vs Microservices Architecture', 'Describe the architectural differences between monolithic and microservices structures.', 'SUBJECTIVE', 'System Design', 'MEDIUM', 'Architecture', 15, 10, 0.0, NULL, NULL, 'SINGLE', NULL, 'Min 100 words', 'Monolithic architecture packages all features into a single deployable artifact, whereas Microservices decouple domains into independently deployable units.'),
('Spring Boot Asynchronous Transactions', 'How does a Spring Boot application handle transactions asynchronously using @Transactional and @Async?', 'SUBJECTIVE', 'Spring Boot', 'MEDIUM', 'Transactions', 10, 10, 0.0, NULL, NULL, 'SINGLE', NULL, 'Min 50 words', 'By default @Transactional is thread-bound via ThreadLocal. Asynchronous execution via @Async transfers context across executor threads.'),
('WebRTC Signaling & STUN/TURN Servers', 'Explain the concepts of WebRTC signaling, ICE candidates, and STUN/TURN servers.', 'SUBJECTIVE', 'Computer Networks', 'HARD', 'WebRTC', 15, 15, 0.0, NULL, NULL, 'SINGLE', NULL, 'Min 100 words', 'STUN assists clients in discovering public IP/port mappings behind NAT. TURN relays media packets when direct P2P connections are blocked.'),
('Binary Search Tree Time Complexity', 'What is the average time complexity of searching in a balanced binary search tree?', 'MCQ', 'Data Structures', 'EASY', 'BST', 2, 5, 1.0, 'O(1),O(log n),O(n),O(n log n)', 'O(log n)', 'SINGLE', NULL, 'Single choice', 'A balanced BST halves search space at each node comparison resulting in O(log n) complexity.'),
('SOLID Principles Verification', 'Which of the following is NOT one of the 5 SOLID principles?', 'MCQ', 'OOP', 'EASY', 'Design Principles', 2, 5, 1.0, 'Single Responsibility,Open Closed,Interface Segregation,Multiple Inheritance', 'Multiple Inheritance', 'SINGLE', NULL, 'Single choice', 'Multiple Inheritance is an OOP language feature, not one of the SOLID design principles.'),
('Optimistic vs Pessimistic Locking', 'Explain the difference between optimistic and pessimistic locking in database transaction management.', 'SUBJECTIVE', 'Database', 'MEDIUM', 'Transactions', 10, 10, 0.0, NULL, NULL, 'SINGLE', NULL, 'Min 50 words', 'Optimistic locking uses version numbers and assumes rare conflicts. Pessimistic locking acquires explicit database row locks.'),
('Reverse Array in Python', 'Write a function `reverse_array(arr)` that returns the reversed array without using built-in `.reverse()`.', 'CODING', 'Python', 'EASY', 'Arrays', 10, 15, 0.0, NULL, NULL, 'SINGLE', 'def reverse_array(arr):\n    # Write code here\n    pass', '1 <= len(arr) <= 10^5', 'Iterate from right to left or swap elements from ends to center.');

-- Insert default question sets
INSERT INTO question_sets (name, description, category, difficulty, total_questions, total_marks, passing_marks, duration_minutes) VALUES
('Default Software Engineer Assessment Set', 'Standard conceptual questions for general software engineering candidates', 'Software Engineering', 'MEDIUM', 7, 70, 40, 60);

-- Map questions to set
INSERT INTO question_set_questions (question_set_id, question_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7);

-- Insert default interview templates
INSERT INTO interview_templates (name, description, category, difficulty, duration_minutes, interview_type, question_set_id, enable_ai_proctoring, enable_browser_lock, enable_webcam, enable_microphone) VALUES
('Java Developer Assessment', 'Evaluates Core Java, Spring Boot, Multithreading, and System Design', 'Java', 'MEDIUM', 60, 'FULL_STACK', 1, TRUE, TRUE, TRUE, TRUE),
('Python Developer Assessment', 'Evaluates Python Data Structures, Algorithms, Data Science, and APIs', 'Python', 'MEDIUM', 60, 'CODING_INTERVIEW', 1, TRUE, TRUE, TRUE, TRUE),
('MERN Stack Developer', 'Evaluates React.js, Node.js, Express, MongoDB, and Frontend State', 'JavaScript', 'MEDIUM', 45, 'FULL_STACK', 1, TRUE, TRUE, TRUE, TRUE),
('Full Stack Developer', 'End-to-end full stack architecture, database, and coding evaluation', 'Software Engineering', 'MEDIUM', 90, 'FULL_STACK', 1, TRUE, TRUE, TRUE, TRUE),
('Backend Developer Assessment', 'Focuses on API Design, Relational Databases, Microservices & Security', 'Spring Boot', 'HARD', 60, 'SUBJECTIVE', 1, TRUE, TRUE, TRUE, TRUE),
('Frontend Developer Assessment', 'Focuses on JavaScript ES6+, React Hooks, CSS Grid, and Performance', 'React', 'MEDIUM', 45, 'CODING_INTERVIEW', 1, TRUE, TRUE, TRUE, TRUE),
('HR Screening Interview', 'Evaluates communication skills, scenario responses, and cultural fit', 'HR', 'EASY', 30, 'SUBJECTIVE', 1, FALSE, FALSE, TRUE, TRUE),
('Aptitude Test', 'Evaluates logical reasoning, quantitative analysis, and problem solving', 'Aptitude', 'EASY', 30, 'MCQ', 1, TRUE, TRUE, TRUE, FALSE);

-- -----------------------------------------------------
-- Default Seed Users (password for all = "Admin@123")
-- BCrypt hash of "Admin@123" with strength 10
-- -----------------------------------------------------
INSERT INTO users (email, password_hash, first_name, last_name, is_enabled) VALUES
('admin@proctor.com',      '$2b$10$H7MaKmhzQ4wLC..7FU.HDeTQ.PO9hNz7ft.aOhjNhXX0bJIqu5B9u', 'System', 'Admin',       TRUE),
('interviewer@proctor.com','$2b$10$H7MaKmhzQ4wLC..7FU.HDeTQ.PO9hNz7ft.aOhjNhXX0bJIqu5B9u', 'Demo',   'Interviewer', TRUE),
('candidate@proctor.com',  '$2b$10$H7MaKmhzQ4wLC..7FU.HDeTQ.PO9hNz7ft.aOhjNhXX0bJIqu5B9u', 'Demo',   'Candidate',   TRUE);

-- Assign roles: Admin → ROLE_ADMIN(3), Interviewer → ROLE_INTERVIEWER(2), Candidate → ROLE_CANDIDATE(1)
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 3),
(2, 2),
(3, 1);

