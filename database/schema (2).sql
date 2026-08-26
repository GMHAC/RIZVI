CREATE DATABASE IF NOT EXISTS rizvi_management;
USE rizvi_management;

CREATE TABLE department_master (
    department_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    department_code VARCHAR(50) NOT NULL UNIQUE,
    department_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dashboard_master (
    dashboard_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    dashboard_code VARCHAR(80) NOT NULL UNIQUE,
    department_id BIGINT NULL,
    dashboard_title VARCHAR(200) NOT NULL,
    theme_code VARCHAR(50) NOT NULL DEFAULT 'corporate',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    version_no INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dashboard_department
      FOREIGN KEY (department_id) REFERENCES department_master(department_id)
);

CREATE TABLE dashboard_widget (
    widget_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    dashboard_id BIGINT NOT NULL,
    widget_code VARCHAR(100) NOT NULL,
    widget_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    config_json JSON NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_widget_dashboard
      FOREIGN KEY (dashboard_id) REFERENCES dashboard_master(dashboard_id)
);

CREATE TABLE dashboard_role_permission (
    permission_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_code VARCHAR(80) NOT NULL,
    dashboard_id BIGINT NOT NULL,
    can_view BOOLEAN NOT NULL DEFAULT TRUE,
    can_edit_config BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE KEY uq_role_dashboard (role_code, dashboard_id),
    CONSTRAINT fk_permission_dashboard
      FOREIGN KEY (dashboard_id) REFERENCES dashboard_master(dashboard_id)
);

CREATE TABLE dashboard_audit_log (
    audit_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NULL,
    action_code VARCHAR(80) NOT NULL,
    dashboard_id BIGINT NULL,
    old_config JSON NULL,
    new_config JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed departments
INSERT INTO department_master (department_code, department_name) VALUES
('EXECUTIVE','Executive Management'),
('HR','HR'),
('ADMIN','Admin'),
('COMPLIANCE','Compliance'),
('SECURITY','Security'),
('FIRE_SAFETY','Fire & Safety'),
('QUALITY','Quality'),
('PRODUCTION','Production'),
('IE','Industrial Engineering'),
('MAINTENANCE','Maintenance'),
('STORE','Store'),
('PROCUREMENT','Procurement'),
('ACCOUNTS','Accounts & Finance'),
('AUDIT','Internal Audit'),
('WELFARE','Welfare'),
('MEDICAL','Medical'),
('PLANNING','Planning'),
('PAD','PAD');
