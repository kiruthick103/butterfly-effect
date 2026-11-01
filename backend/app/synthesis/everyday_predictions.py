"""Real-Life Scenario Predictions Engine: Human-centric future outcomes, decisions, sub-scenarios, and butterfly effects for everyday life."""

from typing import Dict, List, Any, Optional
from .extra_domains import EXTRA_DOMAINS
from .everyday_decisions import EVERYDAY_SCENARIO_DECISIONS
from .schemas import FutureOutcome, FutureMilestone, SubScenario


EVERYDAY_SCENARIO_PREDICTIONS: Dict[str, Dict[str, Any]] = {
    "transit_delay": {
        "favorable": {
            "title": "Emergency Cab/Auto: Arrive 14 Mins Before Gate Lock",
            "decision": "Book Uber/Rapido immediately instead of waiting at the bus stop",
            "prediction": "You spend ₹280, bypass the 25-minute bus wait, and arrive at the campus exam gate at 8:46 AM. You enter the exam hall calm, hydrated, and seated on time.",
            "drivers": ["Immediate triage avoids bus queue delay", "Direct vehicle routing bypasses local stops", "Arrive with 14 minutes buffer"],
            "sub_scenario": {
                "title": "Signal Gridlock Near Railway Crossing",
                "effect_percentage": 35,
                "trigger_event": "Railway gate closes for express train 2 km from campus",
                "consequence": "Adds 6 minutes delay; you fast-jog the final 300 meters from the outer gate and make it into the hall with 4 minutes left."
            },
            "butterfly_effect": "Spending ₹280 in the first 2 minutes prevents a 1-year academic backlog and keeps semester GPA intact.",
            "milestones": [
                {"time": "8:18 AM", "event": "Cab booked on app within 3 minutes of missing bus", "impact": "Transit route locked in"},
                {"time": "8:46 AM", "event": "Arrive at college main gate with 14 min to spare", "impact": "Security check passed"},
                {"time": "9:00 AM", "event": "Exam papers distributed, fully focused", "impact": "Full 3-hour writing time secured"}
            ]
        },
        "adverse": {
            "title": "Wait for Next Bus: Delayed Entry & High Anxiety",
            "decision": "Wait at the bus stop hoping the 8:40 AM bus arrives early and moves fast",
            "prediction": "The 8:40 AM bus arrives late at 8:44 AM, encounters heavy school-zone traffic, and reaches campus at 9:14 AM. Exam doors are locked; you must plead with security for delayed entry.",
            "drivers": ["25-minute wait at bus stop burns remaining buffer", "Peak school traffic slows public bus", "Arrival breaches official 9:00 AM cutoff"],
            "sub_scenario": {
                "title": "Chief Superintendent Emergency Waiver",
                "effect_percentage": 45,
                "trigger_event": "You present ticket timestamp showing bus was delayed by traffic",
                "consequence": "Superintendent grants conditional entry at 9:20 AM, but you lose 20 minutes of writing time and begin in high stress."
            },
            "butterfly_effect": "A 90-second bus miss cascades into a 26-minute wait, a locked door, and losing 20 minutes of exam writing time.",
            "milestones": [
                {"time": "8:44 AM", "event": "Subsequent bus arrives delayed and overcrowded", "impact": "Buffer completely exhausted"},
                {"time": "9:14 AM", "event": "Reach exam hall with doors barred by proctor", "impact": "Forced to plead with coordinator"},
                {"time": "9:25 AM", "event": "Seated 25 minutes late with shaking hands", "impact": "Rushed answers, reduced test score"}
            ]
        },
        "critical_failure": {
            "title": "Panic on Foot or Give Up: Absent & Semester Course Retake",
            "decision": "Attempt walking/running the 7 km route or give up out of hopelessness",
            "prediction": "You arrive at 9:45 AM completely exhausted and drenched in sweat after gates have been barred permanently. You are marked absent with zero marks, failing the course.",
            "drivers": ["Walking 7 km takes 55+ minutes", "Exam hall strictly bars entry after 30 minutes", "Mandatory course backlog registered"],
            "sub_scenario": {
                "title": "Medical Leave Appeal Rejected",
                "effect_percentage": 20,
                "trigger_event": "You attempt to submit a false medical certificate for re-examination",
                "consequence": "College board rejects the appeal due to strict university guidelines, forcing a mandatory supplementary exam fee."
            },
            "butterfly_effect": "Alarm snooze for 5 minutes -> Missed bus -> Missed final exam -> Course failure -> GPA drops -> Campus placement eligibility lost.",
            "milestones": [
                {"time": "8:35 AM", "event": "Realize walking is too slow halfway through route", "impact": "Stranded between stops"},
                {"time": "9:45 AM", "event": "Reach campus; security firmly bars entry", "impact": "Official absence recorded"},
                {"time": "Next Sem", "event": "Must re-register course and pay supplementary fees", "impact": "6-month graduation delay"}
            ]
        }
    },

    "time_management": {
        "favorable": {
            "title": "Mobile Dial-In Triage: Seamless Presentation Delivery",
            "decision": "Pack in 5 minutes, book an express cab, and alert team that you will present initial slides via mobile audio",
            "prediction": "You dial into the meeting from the cab at 9:02 AM. Your peer shares the deck while you deliver the voiceover crisply. You arrive at the office in time for executive Q&A.",
            "drivers": ["Immediate notification prevents meeting cancellation", "Mobile tethering enables audio presence", "Peer covers visual screen sharing"],
            "sub_scenario": {
                "title": "Transit Cell Tower Handover Glitch",
                "effect_percentage": 30,
                "trigger_event": "Audio drops for 30 seconds under an underpass",
                "consequence": "Peer smoothly covers slide 2 until your audio returns; executives compliment team coordination."
            },
            "butterfly_effect": "Taking 45 seconds to notify your team turns a potential disaster into a showcase of executive composure.",
            "milestones": [
                {"time": "8:25 AM", "event": "Wake up, send quick Slack heads-up, call cab", "impact": "Team briefed on backup plan"},
                {"time": "9:02 AM", "event": "Dial into meeting audio while en route", "impact": "Presentation starts on schedule"},
                {"time": "9:25 AM", "event": "Walk into conference room for live Q&A", "impact": "Full stakeholder satisfaction"}
            ]
        },
        "adverse": {
            "title": "Rushed Commute: Disheveled 15-Minute Interruption",
            "decision": "Skip breakfast, drive aggressively through morning rush hour, attempt to reach office in person",
            "prediction": "Encounter two red-light jams, arrive at the office at 9:16 AM breathless and flustered. Executives have already rearranged the agenda, creating visible tension.",
            "drivers": ["Rush hour traffic absorbs aggressive driving gains", "No proactive team communication", "Late arrival interrupts VP remarks"],
            "sub_scenario": {
                "title": "Truncated Presentation Slot",
                "effect_percentage": 40,
                "trigger_event": "Executive meeting runs on strict 30-minute block",
                "consequence": "You are given only 8 minutes to present a 20-minute deck, forcing you to skip key metrics."
            },
            "butterfly_effect": "Oversleeping by 40 mins causes high-risk driving and a rushed, visibly nervous stakeholder presentation.",
            "milestones": [
                {"time": "8:40 AM", "event": "Get stuck in highway bottleneck without mobile join", "impact": "Meeting starts without you"},
                {"time": "9:16 AM", "event": "Burst into conference room apologizing", "impact": "Visible executive annoyance"},
                {"time": "9:30 AM", "event": "Key strategic proposal postponed to next month", "impact": "Project budget delayed"}
            ]
        },
        "critical_failure": {
            "title": "Panic Ghosting: Executive Escalation & Project Reassignment",
            "decision": "Panic in bed, delay notifying the team, arrive 45 minutes late without prior notice",
            "prediction": "The VP waits 12 minutes before canceling the meeting in frustration. Client leadership questions company professionalism, triggering an internal leadership review.",
            "drivers": ["Zero communication creates perception of unreliability", "High-value client left waiting in empty call", "Leadership trust severely damaged"],
            "sub_scenario": {
                "title": "Project Lead Reassigned",
                "effect_percentage": 25,
                "trigger_event": "VP requests another senior engineer take over account",
                "consequence": "You lose project ownership and the upcoming performance cycle promotion is withheld."
            },
            "butterfly_effect": "Silenced alarm -> Unreported delay -> Client cancellation -> Reassigned account -> Annual career setback.",
            "milestones": [
                {"time": "9:12 AM", "event": "VP cancels meeting; sends formal escalation email", "impact": "Incident flagged to management"},
                {"time": "9:45 AM", "event": "Arrive at office to find meeting abandoned", "impact": "Immediate 1-on-1 reprimand"},
                {"time": "Next Week", "event": "Account transitioned to another lead", "impact": "Missed promotion track"}
            ]
        }
    },

    "device_resilience": {
        "favorable": {
            "title": "Ultra Battery Saver & Cafe Recharge: Safe Arrival",
            "decision": "Enable Ultra Power Saver, screenshot boarding pass, memorize metro stops, step into a cafe for a 15-min top-up",
            "prediction": "Battery drain drops to 1%/hr. You step into a metro station cafe, spend ₹50 to use a wall outlet for 15 minutes, recharging to 25%, and reach your hotel safely.",
            "drivers": ["Ultra Power Saver cuts screen and background drain by 80%", "Offline screenshots avoid opening data connection", "15-minute quick top-up secures digital boarding pass"],
            "sub_scenario": {
                "title": "Commuter Power Bank Loan",
                "effect_percentage": 30,
                "trigger_event": "Cafe outlet is occupied by another customer",
                "consequence": "A fellow traveler loans you their portable power bank for 10 minutes, giving you 18% charge."
            },
            "butterfly_effect": "Spending 30 seconds to switch to Ultra Power Saver keeps your phone alive until you reach safety.",
            "milestones": [
                {"time": "0h", "event": "Enable Ultra Power Saver at 7% battery", "impact": "Background drain eliminated"},
                {"time": "1h", "event": "15-minute cafe wall charge reaches 25%", "impact": "Safe operating margin"},
                {"time": "3h", "event": "Reach hotel and plug into room charger", "impact": "Zero disruption"}
            ]
        },
        "adverse": {
            "title": "Maps Left Open: Phone Dies at Transit Checkpoint",
            "decision": "Leave GPS navigation open with bright screen while walking through the station",
            "prediction": "Phone dies right as you reach the automated ticket turnstile. You must step out of the queue and wait 20 minutes for station staff to manually verify your booking.",
            "drivers": ["GPS and bright screen drain 7% in 15 minutes", "No physical backup paper ticket or cash", "Checkpoint delay causes missed connection"],
            "sub_scenario": {
                "title": "Manual ID Verification by Station Supervisor",
                "effect_percentage": 45,
                "trigger_event": "You show physical government ID to station clerk",
                "consequence": "Supervisor looks up your name in passenger manifest and issues a paper pass with 6 minutes to spare."
            },
            "butterfly_effect": "Leaving screen brightness high drains phone at the exact moment proof of purchase is required.",
            "milestones": [
                {"time": "20m", "event": "Phone screen flashes low-battery shutdown", "impact": "Digital ticket inaccessible"},
                {"time": "45m", "event": "Station staff manual ticket verification", "impact": "Missed scheduled express train"},
                {"time": "2h", "event": "Board subsequent slower local train", "impact": "Arrival delayed by 90 minutes"}
            ]
        },
        "critical_failure": {
            "title": "Total Blackout: Stranded Without Navigation or Money",
            "decision": "Rely completely on dead phone without carrying cash, paper backup, or memorized route",
            "prediction": "Phone dies completely in an unfamiliar district. You cannot access UPI/Apple Pay, cab apps, or hotel address. You wander for 2 hours before finding a police booth.",
            "drivers": ["Complete dependency on dead smartphone for navigation and money", "Zero emergency cash on hand", "Language barrier in unfamiliar neighborhood"],
            "sub_scenario": {
                "title": "Emergency ATM Cash Withdrawal with Lost Fee",
                "effect_percentage": 25,
                "trigger_event": "Must locate a physical bank branch on foot",
                "consequence": "Pay inflated cash cab fare and miss hotel check-in window, forfeiting non-refundable booking."
            },
            "butterfly_effect": "Forgetting charger in morning -> Phone dies -> Digital payment lost -> Stranded at night -> ₹4,000 emergency expense.",
            "milestones": [
                {"time": "30m", "event": "Phone dies completely with no power bank", "impact": "Zero navigation or payment"},
                {"time": "2h", "event": "Wander searching for open public phone or charger", "impact": "Extreme exhaustion & anxiety"},
                {"time": "4h", "event": "Reach hotel via emergency cash loan from stranger", "impact": "Day wasted in survival mode"}
            ]
        }
    },

    "weather_disruption": {
        "favorable": {
            "title": "Early Metro Reroute: Arrive Dry 20 Mins Before Lab Exam",
            "decision": "Switch immediately to the elevated metro line instead of waiting for road buses or autos",
            "prediction": "While arterial roads submerge under 25 cm of water, the elevated metro bypasses traffic entirely. You walk into college dry and relaxed 20 minutes before lab setup.",
            "drivers": ["Elevated metro immune to street waterlogging", "Early departure beats crowd surge at metro station", "Dry arrival preserves mental focus"],
            "sub_scenario": {
                "title": "Metro Station Token Counter Crowd",
                "effect_percentage": 30,
                "trigger_event": "Bus commuters flood into metro station simultaneously",
                "consequence": "Adds 8 minutes at security gate, but your 20-minute buffer absorbs the delay cleanly."
            },
            "butterfly_effect": "Checking rain radar and choosing metro 10 minutes earlier avoids a 2-hour flood gridlock.",
            "milestones": [
                {"time": "7:30 AM", "event": "Spot heavy rain, immediately walk to metro", "impact": "Bypasses road waterlogging"},
                {"time": "8:25 AM", "event": "Exit campus station directly into covered walkway", "impact": "Arrive completely dry"},
                {"time": "9:00 AM", "event": "Lab apparatus calibrated and experiment starts", "impact": "Top score achieved"}
            ]
        },
        "adverse": {
            "title": "Road Waterlog Trap: Soaked Shoes & 30-Minute Gate Struggle",
            "decision": "Take normal city bus route despite rising street water levels",
            "prediction": "Bus stalls in knee-deep waterlogging near junction. You must wade through dirty rain water, arriving drenched with waterlogged shoes 25 minutes after the bell.",
            "drivers": ["Buses cannot navigate flooded underpasses", "Walking through water ruins lab shoes and notes", "Late gate arrival requires department head permission"],
            "sub_scenario": {
                "title": "Lab Assistant Delayed Entry Permission",
                "effect_percentage": 50,
                "trigger_event": "Professor notes widespread city flooding on news",
                "consequence": "Grants 30-minute late entry, but you must work with cold, soaked hands and rushed measurements."
            },
            "butterfly_effect": "Assuming road transit would clear in heavy rain leaves you stranded in floodwater with soaked lab notes.",
            "milestones": [
                {"time": "8:10 AM", "event": "Bus engine stalls in flooded underpass", "impact": "Passengers forced to disembark"},
                {"time": "8:50 AM", "event": "Wade through muddy water to reach campus", "impact": "Shoes and lab coat soaked"},
                {"time": "9:30 AM", "event": "Allowed to start lab with 30-min time penalty", "impact": "Rushed observations, lower grade"}
            ]
        },
        "critical_failure": {
            "title": "Flooded Road Standoff: Completely Stranded & Lab Exam Zero",
            "decision": "Wait inside stalled transit in deep water without seeking alternative high-ground routes",
            "prediction": "City bus completely gridlocked in 40 cm flood water for 2.5 hours. Lab doors lock, experiment chemicals are distributed, and professors refuse late entry.",
            "drivers": ["Total traffic standstill on low-lying arterial roads", "Lab practicals cannot be held without examiner oversight", "Mandatory repeat practical session next semester"],
            "sub_scenario": {
                "title": "Severe Weather Red Alert Declared Too Late",
                "effect_percentage": 35,
                "trigger_event": "District administration declares holiday after exam starts",
                "consequence": "Exam marks nullified for all attendees, forcing an unscheduled weekend makeup test."
            },
            "butterfly_effect": "Ignoring morning cloudburst warning -> Flooded bus trap -> Zero in lab exam -> Semester GPA drops.",
            "milestones": [
                {"time": "8:30 AM", "event": "Gridlock freeze: zero vehicles moving for 90 mins", "impact": "Completely trapped in rain"},
                {"time": "10:30 AM", "event": "Reach college after lab session has concluded", "impact": "Lab doors locked and sealed"},
                {"time": "Next Week", "event": "Receive zero for practical internal assessment", "impact": "Must appear in backlog lab"}
            ]
        }
    },

    "academic_crunch": {
        "favorable": {
            "title": "High-Yield Prioritization: 6 Hours Sleep & 78% Score",
            "decision": "Focus strictly on top 4 high-weight past-paper questions, sleep at 1:00 AM, review formulas at 7:00 AM",
            "prediction": "You master 70% of the exam weight with clear mental retention. You wake up refreshed, recognize 6 of the 8 exam questions, and score a comfortable B+/A grade.",
            "drivers": ["80/20 rule covers 75% of marks in 6 hours", "6 hours of sleep preserves working memory and recall", "Morning formula drill prevents blanking out"],
            "sub_scenario": {
                "title": "Surprise Question from Skipped Topic",
                "effect_percentage": 30,
                "trigger_event": "One 10-mark question comes from unstudied unit",
                "consequence": "You compensate by answering the remaining 90 marks flawlessly, finishing with 78% total."
            },
            "butterfly_effect": "Choosing to sleep at 1:00 AM rather than pulling an all-nighter keeps your brain sharp to solve complex questions.",
            "milestones": [
                {"time": "9:00 PM", "event": "Finish past 5 years question pattern analysis", "impact": "High-yield topics locked"},
                {"time": "1:00 AM", "event": "Go to sleep after 4 hours targeted revision", "impact": "Memory consolidation occurs"},
                {"time": "9:00 AM", "event": "Enter exam calm with razor-sharp recall", "impact": "Score 78%+ easily"}
            ]
        },
        "adverse": {
            "title": "All-Nighter Fog: Memory Blackouts on Simple Formulas",
            "decision": "Drink 3 energy drinks, stay awake until 6:00 AM trying to cram all 10 modules sequentially",
            "prediction": "You cover 80% of pages but suffer severe cognitive exhaustion. During the exam at 10:30 AM, your brain fogs up; you blank on basic integration formulas and miss 25 marks.",
            "drivers": ["Cognitive retention drops by 50% after 20 hours awake", "Overloaded short-term memory causes recall interference", "Energy drink crash hits 90 minutes into the test"],
            "sub_scenario": {
                "title": "Sudden Micro-Sleep During Exam",
                "effect_percentage": 40,
                "trigger_event": "Caffeine crash hits at hour 2 of exam",
                "consequence": "You nod off for 15 minutes at your desk before proctor taps your shoulder; lose crucial checking time."
            },
            "butterfly_effect": "Sacrificing sleep to read 2 extra chapters causes you to forget the 6 chapters you already knew.",
            "milestones": [
                {"time": "4:30 AM", "event": "Staring blankly at textbook with zero retention", "impact": "Exhaustion sets in"},
                {"time": "10:15 AM", "event": "Blank out on core equation you reviewed at 3 AM", "impact": "Unable to finish problem"},
                {"time": "12:00 PM", "event": "Submit incomplete paper with 52% estimated mark", "impact": "Bare pass threshold"}
            ]
        },
        "critical_failure": {
            "title": "Oversleep Past Exam Time: Total No-Show & Academic Penalty",
            "decision": "Study until 7:30 AM without setting multiple loud alarms, lay down for 'a 15-minute nap'",
            "prediction": "Exhaustion overpowers your body; you fall into deep REM sleep and wake up at 11:15 AM while the exam ends at 12:00 PM. Total no-show, automatic fail.",
            "drivers": ["Extreme sleep debt overrides standard phone alarms", "Taking an unmonitored nap 90 mins before exam", "Total failure to appear at testing center"],
            "sub_scenario": {
                "title": "Re-examination Request Denied",
                "effect_percentage": 20,
                "trigger_event": "Submit appeal claiming alarm malfunction",
                "consequence": "Academic dean marks case as negligence; must retake exam next year with fee penalty."
            },
            "butterfly_effect": "A '15-minute nap' at 7:30 AM turns into a 3.5-hour blackout sleep that costs an entire college semester.",
            "milestones": [
                {"time": "7:30 AM", "event": "Lay down on bed with eyes closed for '10 minutes'", "impact": "Immediate deep unconscious sleep"},
                {"time": "11:15 AM", "event": "Wake up to frantic missed calls; exam 80% over", "impact": "Hopeless panic, exam missed"},
                {"time": "Results", "event": "Grade report shows 'F' with 0 grade points", "impact": "Forced into makeup semester"}
            ]
        }
    }
}

# Generic template for any everyday scenario not explicitly in the pre-baked dictionary
def generate_generic_human_predictions(domain: str, title: str, description: str, variables: Dict[str, float]) -> Dict[str, Any]:
    """Generates rich, intuitive, human-centered predictions free from mathematical jargon."""
    return {
        "favorable": {
            "title": f"Decisive Triage: Problem Contained & Positive Outcome",
            "decision": f"Take immediate high-leverage action to neutralize primary constraint early",
            "prediction": f"By making a quick pragmatic decision within the first 15 minutes, you absorb the disruption cleanly, avoid compounding errors, and achieve a successful outcome.",
            "drivers": ["Immediate response prevents cascade", "Conservative buffer preserved", "Clear communication with stakeholders"],
            "sub_scenario": {
                "title": "Minor Friction Handled Successfully",
                "effect_percentage": 30,
                "trigger_event": "Unexpected secondary delay occurs during resolution",
                "consequence": "Your built-in buffer absorbs the delay with zero lasting impact on the outcome."
            },
            "butterfly_effect": "A decisive 2-minute choice early on prevents hours of downstream stress and expense.",
            "milestones": [
                {"time": "Step 1", "event": "Spot early warning sign and pivot immediately", "impact": "Risk contained"},
                {"time": "Step 2", "event": "Execute primary recovery path with clear focus", "impact": "Trajectory stabilized"},
                {"time": "Finish", "event": "Target reached successfully on schedule", "impact": "Positive result confirmed"}
            ]
        },
        "adverse": {
            "title": f"Hesitation & Strained Recovery: Significant Friction",
            "decision": f"Delay taking action hoping the situation resolves itself naturally",
            "prediction": f"Hesitating burns your remaining buffer. You are forced into an emergency workaround under extreme time pressure, achieving only a partial or stressful outcome.",
            "drivers": ["Delayed reaction compresses remaining time", "Secondary friction amplifies initial issue", "Rushed execution leads to avoidable errors"],
            "sub_scenario": {
                "title": "Narrow Escape with Compromise",
                "effect_percentage": 45,
                "trigger_event": "Emergency assistance or extension is partially granted",
                "consequence": "You salvage the bare minimum requirement but suffer reputation or financial penalties."
            },
            "butterfly_effect": "A 10-minute delay in acknowledging the problem multiplies the effort and cost required to fix it.",
            "milestones": [
                {"time": "Step 1", "event": "Wait passively as buffer steadily evaporates", "impact": "Window of opportunity closes"},
                {"time": "Step 2", "event": "Forced into expensive emergency workaround", "impact": "Elevated anxiety and friction"},
                {"time": "Finish", "event": "Deliver compromised outcome with minor penalties", "impact": "Sub-optimal result"}
            ]
        },
        "critical_failure": {
            "title": f"Complete Cascade: Unmitigated Breakdown & Major Loss",
            "decision": f"Ignore the problem or make a panic-driven high-risk gamble",
            "prediction": f"The initial small failure propagates unchecked across dependent areas, resulting in a total operational or personal collapse that requires weeks to recover from.",
            "drivers": ["Unaddressed bottleneck triggers cascading collapse", "Panic decision worsens core failure", "Zero fallback safety net available"],
            "sub_scenario": {
                "title": "Severe Secondary Consequence",
                "effect_percentage": 25,
                "trigger_event": "Third parties or authorities discover the uncontained failure",
                "consequence": "Triggers formal penalties, loss of standing, or lasting financial damage."
            },
            "butterfly_effect": "A tiny uncorrected starting condition cascades into a severe life disruption.",
            "milestones": [
                {"time": "Step 1", "event": "Primary threshold breached with zero mitigation", "impact": "Failure state initiated"},
                {"time": "Step 2", "event": "Downstream dependent systems collapse in series", "impact": "Total loss of control"},
                {"time": "Finish", "event": "Critical incident concludes with severe damage", "impact": "Lasting recovery needed"}
            ]
        }
    }

# Merge the extra 10 domains
EVERYDAY_SCENARIO_PREDICTIONS.update(EXTRA_DOMAINS)
