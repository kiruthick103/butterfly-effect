"""Database initialization and lesson seeding."""

import uuid
from sqlalchemy.orm import Session
from app.models.database import Base, Lesson, User
from app.db.session import engine, SessionLocal
from app.core.security import get_password_hash

DEFAULT_LESSONS = [
    {
        "lesson_number": 1,
        "slug": "what-is-deterministic-chaos",
        "title": "What is Deterministic Chaos?",
        "objective": "Understand that chaotic systems are completely governed by deterministic laws without any randomness, yet display unpredictable trajectories over time.",
        "explanation": (
            "In 1963, meteorologist Edward Lorenz discovered that simplified equations of atmospheric convection "
            "never settled into periodic cycles or equilibrium. Even though the differential equations contain "
            "zero random noise, trajectories with infinitesimally different starting points diverge rapidly. "
            "This phenomenon is called deterministic chaos."
        ),
        "recommended_config": {
            "model": "lorenz",
            "initial_state": [1.0, 1.0, 1.0],
            "perturbation": [0.0, 0.0, 0.0],
            "duration": 25.0,
            "dt": 0.01,
            "parameters": {"sigma": 10.0, "rho": 28.0, "beta": 2.666667}
        },
        "prediction_question": "If you run the exact same deterministic simulation twice with identical starting conditions, what will happen?",
        "prediction_options": [
            "The trajectories will be 100% identical at every point in time.",
            "They will diverge slightly due to chaos.",
            "They will follow opposite wings of the attractor."
        ],
        "reflection_prompt": "Did the zero-perturbation experiment confirm that determinism produces identical trajectories?"
    },
    {
        "lesson_number": 2,
        "slug": "make-the-smallest-perturbation",
        "title": "Make the Smallest Possible Perturbation",
        "objective": "Observe how an initial perturbation as small as 0.000001 (one-millionth) impacts the system.",
        "explanation": (
            "We now apply an initial difference of delta_x = 10^-6 = 0.000001 along the x-coordinate. "
            "For the first few seconds, both trajectories remain visually indistinguishable. "
            "Observe the separation curve as time advances."
        ),
        "recommended_config": {
            "model": "lorenz",
            "initial_state": [1.0, 1.0, 1.0],
            "perturbation": [0.000001, 0.0, 0.0],
            "duration": 25.0,
            "dt": 0.01,
            "parameters": {"sigma": 10.0, "rho": 28.0, "beta": 2.666667}
        },
        "prediction_question": "At approximately what time t will the trajectories visually separate onto different lobes?",
        "prediction_options": [
            "Immediately at t = 0s",
            "Around t = 12s to 16s",
            "They will never separate because 10^-6 is too small"
        ],
        "reflection_prompt": "Why did the trajectories stay synchronized during t=0 to 10s before sudden divergence?"
    },
    {
        "lesson_number": 3,
        "slug": "predict-divergence-scaling",
        "title": "Predict Divergence Scaling",
        "objective": "Hypothesize how increasing the perturbation from 10^-6 to 10^-3 shifts the divergence horizon.",
        "explanation": (
            "If trajectory separation grows exponentially as D(t) ~ D(0) * e^(lambda * t), "
            "a perturbation 1,000 times larger should reach the macroscopic divergence threshold much earlier."
        ),
        "recommended_config": {
            "model": "lorenz",
            "initial_state": [1.0, 1.0, 1.0],
            "perturbation": [0.001, 0.0, 0.0],
            "duration": 25.0,
            "dt": 0.01,
            "parameters": {"sigma": 10.0, "rho": 28.0, "beta": 2.666667}
        },
        "prediction_question": "Compared to 10^-6, when will the 10^-3 perturbation cross the threshold D(t) >= 1.0?",
        "prediction_options": [
            "Significantly earlier (around t = 6s to 8s)",
            "At the exact same time",
            "Later"
        ],
        "reflection_prompt": "How does the logarithmic separation curve illustrate exponential growth?"
    },
    {
        "lesson_number": 4,
        "slug": "run-the-experiment",
        "title": "Run the Experiment",
        "objective": "Execute the numerical simulation and monitor the step-by-step state evolution.",
        "explanation": (
            "The numerical engine computes the trajectory using 4th-Order Runge-Kutta integration. "
            "Watch both the 3D phase portrait and the 2D planar projections (X-Y and X-Z)."
        ),
        "recommended_config": {
            "model": "lorenz",
            "initial_state": [1.0, 1.0, 1.0],
            "perturbation": [0.0001, 0.0, 0.0],
            "duration": 25.0,
            "dt": 0.01,
            "parameters": {"sigma": 10.0, "rho": 28.0, "beta": 2.666667}
        },
        "prediction_question": "What shape will the combined trajectories trace in phase space?",
        "prediction_options": [
            "A butterfly-shaped strange attractor with two distinct lobes",
            "A simple circle (limit cycle)",
            "A straight line to infinity"
        ],
        "reflection_prompt": "Notice how each trajectory is confined to the attractor manifold even while diverging from each other."
    },
    {
        "lesson_number": 5,
        "slug": "measure-the-divergence",
        "title": "Measure the Divergence",
        "objective": "Quantitatively inspect the separation metrics: initial separation, max separation, and saturation scale.",
        "explanation": (
            "Notice that separation distance D(t) cannot grow to infinity. "
            "Because the Lorenz attractor is bounded in state space, trajectory separation saturates around 20 to 35 units."
        ),
        "recommended_config": {
            "model": "lorenz",
            "initial_state": [1.0, 1.0, 1.0],
            "perturbation": [0.00001, 0.0, 0.0],
            "duration": 30.0,
            "dt": 0.01,
            "parameters": {"sigma": 10.0, "rho": 28.0, "beta": 2.666667}
        },
        "prediction_question": "What happens to the distance curve after t crosses the saturation horizon?",
        "prediction_options": [
            "It fluctuates quasi-randomly within the attractor's diameter",
            "It drops back down to zero permanently",
            "It grows exponentially forever without bound"
        ],
        "reflection_prompt": "Why does boundedness prevent indefinite exponential divergence?"
    },
    {
        "lesson_number": 6,
        "slug": "explain-the-result",
        "title": "Explain the Result",
        "objective": "Formulate a rigorous scientific explanation distinguishing determinism from predictability.",
        "explanation": (
            "We can know the physical laws of a system with 100% precision, yet if any measurement of the initial state "
            "has finite precision (e.g. 15 decimal digits), our prediction will completely degrade past a finite time horizon."
        ),
        "recommended_config": {
            "model": "lorenz",
            "initial_state": [1.0, 1.0, 1.0],
            "perturbation": [0.000001, 0.0, 0.0],
            "duration": 25.0,
            "dt": 0.01,
            "parameters": {"sigma": 10.0, "rho": 28.0, "beta": 2.666667}
        },
        "prediction_question": "Can higher precision sensors ever provide infinite weather forecast accuracy in a chaotic system?",
        "prediction_options": [
            "No, because exponential divergence ensures every finite digit gained only adds a logarithmically small window of time.",
            "Yes, if we measure down to the nanometer level."
        ],
        "reflection_prompt": "How does the Lyapunov predictability horizon t_p ~ ln(delta_max / delta_0) / lambda explain this limitation?"
    },
    {
        "lesson_number": 7,
        "slug": "explore-a-different-parameter",
        "title": "Explore a Different Parameter",
        "objective": "Explore parameter regimes in the Logistic Map and observe period-doubling to chaos.",
        "explanation": (
            "In discrete maps, the growth parameter r changes the dynamics from a simple point attractor (r < 3.0), "
            "to oscillations of period 2, 4, 8 (period-doubling), and finally deterministic chaos for r > 3.57."
        ),
        "recommended_config": {
            "model": "logistic",
            "initial_state": [0.5],
            "perturbation": [0.0001],
            "duration": 50.0,
            "dt": 1.0,
            "parameters": {"r": 3.9}
        },
        "prediction_question": "At r = 3.9, will a tiny perturbation of 0.0001 cause completely different future iterations?",
        "prediction_options": [
            "Yes, within 15-20 iterations the values become completely uncorrelated.",
            "No, the values will converge to the exact same fixed point."
        ],
        "reflection_prompt": "Explore the bifurcation diagram to locate periodic windows within the chaotic region."
    }
]


def init_db(db: Session) -> None:
    """Create all tables and seed default guided lessons and demo user."""
    Base.metadata.create_all(bind=engine)

    # Seed demo user
    demo_email = "researcher@butterfly.lab"
    existing_user = db.query(User).filter(User.email == demo_email).first()
    if not existing_user:
        demo_user = User(
            id="demo-user-0001",
            email=demo_email,
            full_name="Lead Chaos Researcher",
            hashed_password=get_password_hash("chaos-lab-2026"),
            is_active=True
        )
        db.add(demo_user)
        db.commit()

    # Seed lessons
    for lesson_data in DEFAULT_LESSONS:
        existing = db.query(Lesson).filter(Lesson.slug == lesson_data["slug"]).first()
        if not existing:
            lesson = Lesson(
                id=str(uuid.uuid4()),
                slug=lesson_data["slug"],
                lesson_number=lesson_data["lesson_number"],
                title=lesson_data["title"],
                objective=lesson_data["objective"],
                explanation=lesson_data["explanation"],
                recommended_config=lesson_data["recommended_config"],
                prediction_question=lesson_data["prediction_question"],
                prediction_options=lesson_data["prediction_options"],
                reflection_prompt=lesson_data["reflection_prompt"]
            )
            db.add(lesson)

    db.commit()


if __name__ == "__main__":
    db = SessionLocal()
    try:
        init_db(db)
        print("Database initialized and lessons successfully seeded.")
    finally:
        db.close()
