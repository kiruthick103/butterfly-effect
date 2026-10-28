"""SQLAlchemy Database Models for persistence."""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    experiments = relationship("Experiment", back_populates="user", cascade="all, delete-orphan")
    scenarios = relationship("Scenario", back_populates="user", cascade="all, delete-orphan")


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    model = Column(String(50), nullable=False, default="lorenz")
    model_version = Column(String(50), default="1963-canonical")
    parameters = Column(JSON, nullable=False)
    initial_state = Column(JSON, nullable=False)
    perturbation = Column(JSON, nullable=False)
    duration = Column(Float, nullable=False, default=25.0)
    dt = Column(Float, nullable=False, default=0.01)
    integrator = Column(String(50), nullable=False, default="rk4")
    tags = Column(JSON, nullable=True, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="experiments")
    runs = relationship("Run", back_populates="experiment", cascade="all, delete-orphan")


class Run(Base):
    __tablename__ = "runs"

    id = Column(String(36), primary_key=True, index=True)
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False, index=True)
    configuration_hash = Column(String(64), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="completed")
    software_version = Column(String(50), default="1.0.0")
    created_at = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("Experiment", back_populates="runs")
    result = relationship("RunResult", uselist=False, back_populates="run", cascade="all, delete-orphan")


class RunResult(Base):
    __tablename__ = "run_results"

    id = Column(String(36), primary_key=True, index=True)
    run_id = Column(String(36), ForeignKey("runs.id"), nullable=False, unique=True, index=True)
    metrics = Column(JSON, nullable=False)
    scientific_explanation = Column(Text, nullable=True)
    # Downsampled trajectory data stored for immediate instant replay & chart comparison
    trajectory_data = Column(JSON, nullable=True)
    execution_time_ms = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    run = relationship("Run", back_populates="result")


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=True, index=True)
    prompt = Column(Text, nullable=False)
    scenario_title = Column(String(255), nullable=True)
    assumptions = Column(JSON, nullable=False, default=list)
    branches = Column(JSON, nullable=False, default=list)
    uncertainties = Column(JSON, nullable=False, default=list)
    limitations = Column(JSON, nullable=False, default=list)
    ai_provider = Column(String(50), default="mock")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="scenarios")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String(36), primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    lesson_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    objective = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    recommended_config = Column(JSON, nullable=False)
    prediction_question = Column(Text, nullable=False)
    prediction_options = Column(JSON, nullable=True)
    reflection_prompt = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), nullable=True, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
