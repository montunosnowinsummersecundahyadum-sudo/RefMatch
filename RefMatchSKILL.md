---
name: refmatch-referee-assignment
description: Recommends and explains the best-suited referee for a football fixture before kickoff, using synthetic team, referee, and fixture data. Use this skill whenever the user asks to assign, rank, compare, or justify a referee for a match, assess pre-match risk (aggression, card risk, controversy, tempo), generate a pre-match officiating briefing, or run a what-if on referee availability or neutrality constraints, even if they do not say "referee assignment" explicitly.
---

# RefMatch: Explainable Referee Assignment

Pre-match analytics agent for the Inside the Game: Developer Hackathon (Microsoft x Premier League). It answers one question: *which available referee is the best fit for this fixture, and why?*

All data is **synthetic**. Never present outputs as real referee evaluations or real Premier League decisions.

## When to use

- "Who should referee Team A vs Team B?"
- "Rank the available referees for this derby."
- "Explain why Referee X was recommended."
- "What changes if Referee X is unavailable?"
- "Write a pre-match officiating briefing."

## Workflow

1. **Load inputs** (see schema below). If a field is missing, state the assumption and continue.
2. **Build the Match Risk Profile** for the fixture.
3. **Filter** referees by hard constraints (availability, rest days, neutrality).
4. **Score fit** for each remaining referee.
5. **Rank** and keep the top 3.
6. **Explain** each ranking in plain language, linked to the Laws of the Game.
7. **Optional:** write the pre-match briefing, or re-run with changed constraints (what-if).

Keep scoring deterministic and numeric. Use the language model only to explain results, never to invent scores.

## Input schema

**Team profile** (per team, 0-100 unless noted)
- `pressing_intensity`, `foul_rate` (per match), `physicality`, `card_tendency`, `dissent_history`, `possession_style` (`possession` | `direct` | `counter`)

**Fixture context**
- `rivalry_level` (0-100), `stakes` (`none` | `title` | `european` | `relegation`), `is_derby` (bool), `expected_tempo` (0-100)

**Referee profile**
- `cards_per_match`, `foul_tolerance`, `advantage_rate`, `penalty_rate`, `consistency` (0-100), `high_intensity_matches` (count), `history_with_teams` (list of recent matches)

**Constraints**
- `available` (bool), `rest_days`, `nationality`, `recent_games_with_team` (months since last match with either club)

## Match Risk Profile

Compute four scores (0-100) from the two team profiles and fixture context:

| Dimension | Main drivers |
|---|---|
| Aggression | combined `physicality`, `pressing_intensity`, `foul_rate` |
| Card risk | combined `card_tendency`, `dissent_history`, `rivalry_level` |
| Controversy risk | `stakes`, `is_derby`, `rivalry_level` |
| Tempo | `expected_tempo`, `possession_style` mismatch |

## Fit scoring

Fit = weighted match between the risk profile and referee strengths. Default weights (adjustable):

| Component | Weight | Logic |
|---|---|---|
| Intensity experience | 25% | high aggression favours more `high_intensity_matches` |
| Consistency | 20% | high controversy risk favours high `consistency` |
| Advantage handling | 20% | high tempo favours higher `advantage_rate` |
| Card calibration | 15% | high card risk favours a referee whose `cards_per_match` is stable, not extreme |
| Familiarity | 10% | penalise heavy recent history with either club |
| Rest and availability | 10% | penalise short rest |

Output fit as a percentage. Show the top 3 and the top two positive drivers and top one risk flag for each.

## Output format

```
Recommended: Referee A (Fit 87%)
Why: <2-3 sentences using the top drivers>
Law context: <1 sentence linking to fouls, advantage, or cards>
Flag: <one risk or neutrality note>

Alternatives: Referee B (81%), Referee C (76%)
```

Then offer: pre-match briefing, or what-if.

## Explanation rules

- Name the specific numbers that drove the result (for example, "both teams average high foul rates").
- Link behaviour to the relevant Law of the Game (Law 12 fouls and misconduct, Law 5 referee, advantage provisions) in plain language. Do not quote rule text at length.
- State neutrality status explicitly.
- Never claim certainty. Use "best fit given the data" rather than "the correct referee".
- Never criticise a referee as incompetent; describe fit, not quality.

## Pre-match briefing (optional)

Three short paragraphs for broadcasters and fans:
1. What kind of match to expect (tempo, physicality).
2. How the recommended referee is likely to manage it.
3. Two or three moments to watch (advantage calls, early cards, set pieces).

## What-if mode

When a constraint changes, re-run steps 3-6 and report:
- New ranking
- What changed and why
- Fit score deltas for the top 3

## Guardrails

- Label all data and outputs as synthetic.
- Do not use real referee names or real match histories unless supplied by the user.
- Do not present fit scores as predictions of match outcomes.
- If inputs are too sparse to rank meaningfully, say so and ask for the missing fields.

## Suggested stack

Python scoring service (Azure Functions) for risk and fit; Azure OpenAI for explanations and briefings; Azure AI Search for Laws of the Game retrieval; simple web front end.
