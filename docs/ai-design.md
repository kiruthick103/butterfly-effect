# Responsible AI Architecture & Design Specification
**AI Butterfly Effect Lab**

---

## 1. Core Architectural Directive
**The numerical simulator is the single source of truth. AI must never pretend to be the numerical simulator.**

### 1.1 Why LLMs Must Not Calculate Dynamical Systems
Large Language Models predict tokens probabilistically. When prompted to "integrate the Lorenz equations" or "calculate where the trajectory lands at $t = 10$", an LLM will generate plausible-looking numbers that violate:
1. Continuous dynamical flow properties
2. Phase space volume contraction rates ($\nabla \cdot \mathbf{f} = -(\sigma + 1 + \beta) < 0$)
3. Symplectic and geometric constraints

In scientific inquiry, presenting uncalculated numbers as computational truth is scientific misconduct.

### 1.2 The Division of Epistemic Labor
```
┌──────────────────────────────────────┐        ┌────────────────────────────────────┐
│      PHYSICAL COMPUTATION            │        │        SPECULATIVE REASONING       │
│                                      │        │                                    │
│  • RK4 4th-Order Integration         │        │  • Causal What-If Branching        │
│  • Euclidean Separation D(t)         ├───────►│  • Epistemic Uncertainty Mapping   │
│  • Finite-Time Separation Rate       │Verified│  • Qualitative Manifold Analogy    │
│  • Attractor Saturation Detection    │ Facts  │  • Hypothesis Formulation          │
│                                      │        │                                    │
│         [STATUS: COMPUTED]           │        │        [STATUS: HYPOTHESIS]        │
└──────────────────────────────────────┘        └────────────────────────────────────┘
```

---

## 2. Provider Abstraction Architecture

The application abstracts LLM dependencies behind the `AIProvider` interface:

```python
class AIProvider(ABC):
    @abstractmethod
    async def generate_scenario(self, prompt: str, numerical_context: Dict[str, Any]) -> Dict[str, Any]:
        pass
```

1. **`OpenAIProvider`**: Connects to OpenAI API using JSON Schema Structured Outputs (`response_format: { type: "json_schema" }`). Ensures zero malformed responses.
2. **`MockAIProvider`**: Research-grounded deterministic scenario generator conditioned on empirical metrics. Guarantees 100% functionality offline and during keyless demonstrations.

---

## 3. Strict Schema Validation & Sanitization

Every AI response must satisfy the Pydantic schema:
- `scenario_title`: Concise descriptive title.
- `provenance_status`: Strictly stamped with `"SPECULATIVE SCENARIO - AI GENERATED HYPOTHESIS"`.
- `assumptions`: Explicit physical prerequisites.
- `branches`: Array of causal branches with `id`, `trigger`, `effects`, `time_horizon` (`short`, `medium`, `long`), and `uncertainties`.
- `limitations`: Explicit statement clarifying that AI output is hypothetical and cannot replace the numerical solver.
