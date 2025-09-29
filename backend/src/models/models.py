from sqlalchemy import (
    create_engine, Column, Integer, String, Date, Numeric, TIMESTAMP, ForeignKey,
    CheckConstraint, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

# --- Core Foundational Schemas ---

class Teacher(Base):
    __tablename__ = 'teacher'
    id = Column(Integer, primary_key=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    profile_photo_url = Column(String(255), nullable=True)

    subjects = relationship("Subject", back_populates="teacher")

class Subject(Base):
    __tablename__ = 'subjects'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    color = Column(String(7), nullable=False, unique=True)
    teacher_id = Column(Integer, ForeignKey('teacher.id'), nullable=False)

    teacher = relationship("Teacher", back_populates="subjects")
    groups = relationship("Group", back_populates="subject", cascade="all, delete-orphan")
    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="subject")
    final_grades = relationship("StudentFinalGrade", back_populates="subject")

class Group(Base):
    __tablename__ = 'groups'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(1), nullable=False) 
    grade = Column(Integer, nullable=False) 
    subject_id = Column(Integer, ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    color = Column(String(7), nullable=False, unique=True) 

    subject = relationship("Subject", back_populates="groups")
    students = relationship("Student", back_populates="group")
    classroom_group = relationship("ClassroomGroup", back_populates="group", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint('grade', 'name', 'subject_id', name='_grade_name_subject_uc'),
    )

class Student(Base):
    __tablename__ = 'students'
    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    qr_code_id = Column(String(255), nullable=True, unique=True)
    contact_number = Column(String(10), nullable=True)
    status = Column(String(50), nullable=False, default='active')
    group_id = Column(Integer, ForeignKey('groups.id', ondelete='CASCADE'), nullable=False)

    group = relationship("Group", back_populates="students")
    notebook_grades = relationship("StudentNotebookGrade", back_populates="student", cascade="all, delete-orphan")
    practice_grades = relationship("StudentPracticeGrade", back_populates="student", cascade="all, delete-orphan")
    exam_grades = relationship("StudentExamGrade", back_populates="student", cascade="all, delete-orphan")
    other_grades = relationship("StudentOtherGrade", back_populates="student", cascade="all, delete-orphan")
    topic_grades = relationship("StudentTopicGrade", back_populates="student", cascade="all, delete-orphan")
    final_grades = relationship("StudentFinalGrade", back_populates="student", cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="student", cascade="all, delete-orphan")

# --- Grading and Evaluation Schemas ---

class Period(Base):
    __tablename__ = 'periods'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    topics = relationship("Topic", back_populates="period")
    attendance_records = relationship("AttendanceRecord", back_populates="period")

class Topic(Base):
    __tablename__ = 'topics'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    period_id = Column(Integer, ForeignKey('periods.id'), nullable=False)
    subject_id = Column(Integer, ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    exam_weight = Column(Numeric(5, 2), nullable=False)
    practice_weight = Column(Numeric(5, 2), nullable=False)
    notebook_weight = Column(Numeric(5, 2), nullable=False)
    other_weight = Column(Numeric(5, 2), nullable=False)

    __table_args__ = (
        CheckConstraint('exam_weight + practice_weight + notebook_weight + other_weight = 100.00', name='check_weights_sum_100'),
    )

    period = relationship("Period", back_populates="topics")
    subject = relationship("Subject", back_populates="topics")
    notebook_assignments = relationship("NotebookAssignment", back_populates="topic", cascade="all, delete-orphan")
    practice_assignments = relationship("PracticeAssignment", back_populates="topic", cascade="all, delete-orphan")
    exam_assignments = relationship("ExamAssignment", back_populates="topic", cascade="all, delete-orphan")
    other_assignments = relationship("OtherAssignment", back_populates="topic", cascade="all, delete-orphan")
    planning_report = relationship("PlanningReport", back_populates="topic", uselist=False, cascade="all, delete-orphan")
    student_topic_grades = relationship("StudentTopicGrade", back_populates="topic", cascade="all, delete-orphan")


# --- Assignment Definition Tables ---

class NotebookAssignment(Base):
    __tablename__ = 'notebook_assignments'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    weight = Column(Numeric(5, 2), nullable=False)
    max_grade = Column(Numeric(5, 2), nullable=False, default=10.0)
    topic_id = Column(Integer, ForeignKey('topics.id', ondelete='CASCADE'), nullable=False)
    classroom_asg_id = Column(String(255), nullable=True)

    topic = relationship("Topic", back_populates="notebook_assignments")
    grades = relationship("StudentNotebookGrade", back_populates="assignment", cascade="all, delete-orphan")

class PracticeAssignment(Base):
    __tablename__ = 'practice_assignments'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    max_grade = Column(Numeric(5, 2), nullable=False, default=10.0)
    topic_id = Column(Integer, ForeignKey('topics.id', ondelete='CASCADE'), nullable=False)

    topic = relationship("Topic", back_populates="practice_assignments")
    grades = relationship("StudentPracticeGrade", back_populates="assignment", cascade="all, delete-orphan")

class ExamAssignment(Base):
    __tablename__ = 'exam_assignments'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    max_grade = Column(Numeric(5, 2), nullable=False, default=10.0)
    topic_id = Column(Integer, ForeignKey('topics.id', ondelete='CASCADE'), nullable=False, unique=True)

    topic = relationship("Topic", back_populates="exam_assignments")
    grades = relationship("StudentExamGrade", back_populates="assignment", cascade="all, delete-orphan")

class OtherAssignment(Base):
    __tablename__ = 'other_assignments'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    max_grade = Column(Numeric(5, 2), nullable=False, default=10.0)
    topic_id = Column(Integer, ForeignKey('topics.id', ondelete='CASCADE'), nullable=False)

    topic = relationship("Topic", back_populates="other_assignments")
    grades = relationship("StudentOtherGrade", back_populates="assignment", cascade="all, delete-orphan")


# --- Student Grade Tables ---

class StudentNotebookGrade(Base):
    __tablename__ = 'student_notebook_grades'
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    assignment_id = Column(Integer, ForeignKey('notebook_assignments.id', ondelete='CASCADE'), nullable=False)
    grade = Column(Numeric(5, 2), nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    __table_args__ = (UniqueConstraint('student_id', 'assignment_id', name='_student_notebook_uc'),)
    
    student = relationship("Student", back_populates="notebook_grades")
    assignment = relationship("NotebookAssignment", back_populates="grades")

class StudentPracticeGrade(Base):
    __tablename__ = 'student_practice_grades'
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    assignment_id = Column(Integer, ForeignKey('practice_assignments.id', ondelete='CASCADE'), nullable=False)
    grade = Column(Numeric(5, 2), nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (UniqueConstraint('student_id', 'assignment_id', name='_student_practice_uc'),)

    student = relationship("Student", back_populates="practice_grades")
    assignment = relationship("PracticeAssignment", back_populates="grades")

class StudentExamGrade(Base):
    __tablename__ = 'student_exam_grades'
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    assignment_id = Column(Integer, ForeignKey('exam_assignments.id', ondelete='CASCADE'), nullable=False)
    grade = Column(Numeric(5, 2), nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (UniqueConstraint('student_id', 'assignment_id', name='_student_exam_uc'),)

    student = relationship("Student", back_populates="exam_grades")
    assignment = relationship("ExamAssignment", back_populates="grades")

class StudentOtherGrade(Base):
    __tablename__ = 'student_other_grades'
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    assignment_id = Column(Integer, ForeignKey('other_assignments.id', ondelete='CASCADE'), nullable=False)
    grade = Column(Numeric(5, 2), nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (UniqueConstraint('student_id', 'assignment_id', name='_student_other_uc'),)

    student = relationship("Student", back_populates="other_grades")
    assignment = relationship("OtherAssignment", back_populates="grades")


# --- Aggregated Grade Tables ---

class StudentTopicGrade(Base):
    __tablename__ = 'student_topic_grades'
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    topic_id = Column(Integer, ForeignKey('topics.id', ondelete='CASCADE'), nullable=False)
    calculated_grade = Column(Numeric(5, 2), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    __table_args__ = (UniqueConstraint('student_id', 'topic_id', name='_student_topic_uc'),)

    student = relationship("Student", back_populates="topic_grades")
    topic = relationship("Topic", back_populates="student_topic_grades")

class StudentFinalGrade(Base):
    __tablename__ = 'student_final_grades'
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    subject_id = Column(Integer, ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    period_1_grade = Column(Numeric(5, 2), nullable=True)
    period_2_grade = Column(Numeric(5, 2), nullable=True)
    period_3_grade = Column(Numeric(5, 2), nullable=True)
    final_year_grade = Column(Numeric(5, 2), nullable=True)

    __table_args__ = (UniqueConstraint('student_id', 'subject_id', name='_student_subject_uc'),)

    student = relationship("Student", back_populates="final_grades")
    subject = relationship("Subject", back_populates="final_grades")


# --- Ancillary and Integration Schemas ---

class AttendanceRecord(Base):
    __tablename__ = 'attendance_records'
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    subject_id = Column(Integer, ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    timestamp = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    period_id = Column(Integer, ForeignKey('periods.id'), nullable=False)

    student = relationship("Student", back_populates="attendance_records")
    subject = relationship("Subject", back_populates="attendance_records")
    period = relationship("Period", back_populates="attendance_records")

class PlanningReport(Base):
    __tablename__ = 'planning_reports'
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    file_url = Column(String(255), nullable=False)
    topic_id = Column(Integer, ForeignKey('topics.id', ondelete='CASCADE'), nullable=False, unique=True)

    topic = relationship("Topic", back_populates="planning_report")

class ClassroomGroup(Base):
    __tablename__ = 'classroom_groups'
    id = Column(Integer, primary_key=True, autoincrement=True)
    group_id = Column(Integer, ForeignKey('groups.id', ondelete='CASCADE'), nullable=False, unique=True)
    classroom_course_id = Column(String(255), nullable=False, unique=True)

    group = relationship("Group", back_populates="classroom_group")

class WeeklySchedule(Base):
    __tablename__ = 'weekly_schedules'
    id = Column(Integer, primary_key=True, autoincrement=True)
    group_id = Column(Integer, ForeignKey('groups.id', ondelete='CASCADE'), nullable=False)
    day_of_week = Column(String(10), nullable=False) 
    start_time = Column(String(5), nullable=False) 
    end_time = Column(String(5), nullable=False) 

    group = relationship("Group")

    __table_args__ = (
        UniqueConstraint('day_of_week', 'start_time', name='_day_time_uc'),
    )