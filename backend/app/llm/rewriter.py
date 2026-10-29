import json
import logging
import re
from typing import List, Optional
from app.config import settings
from app.schemas import RewriteSuggestion

logger = logging.getLogger("empathai.rewriter")

# Smart contextual templates for instantaneous offline fallback or API failure resilience
FALLBACK_TRANSFORMATIONS = [
    {
        "trigger": r"per my last email|as stated previously|as i already said",
        "collaborative": "Following up on the notes from our previous discussion, here is a quick recap so we're all aligned.",
        "assertive": "To ensure we remain on track, please refer to the action items outlined in the previous email.",
        "diplomatic": "Re-sharing the previous details here for convenience in case it got buried in your inbox.",
        "rationale": "Removes exasperation and replaces blame with clear, helpful context."
    },
    {
        "trigger": r"if you actually read|did you even read|did you even test",
        "collaborative": "Could we double-check the latest specs together? I want to make sure we didn't miss anything.",
        "assertive": "Please verify against the documentation requirements to ensure everything matches up.",
        "diplomatic": "I reviewed the requirements and noticed a few discrepancies—could you take a second look?",
        "rationale": "Avoids attacking the recipient's competence and focuses directly on the deliverable."
    },
    {
        "trigger": r"waste of time|stop wasting time",
        "collaborative": "Let's refocus our energy on the highest-priority blockers so we can make quick progress.",
        "assertive": "To make the best use of everyone's time, let's keep our focus tightly aligned on key deliverables.",
        "diplomatic": "I want to be respectful of our schedules—let's streamline this discussion to actionable next steps.",
        "rationale": "Reframes frustration into productive prioritization and respect for team time."
    },
    {
        "trigger": r"fine[,. ]+whatever|whatever|do whatever you want",
        "collaborative": "I see you have a different perspective on this. Let's take 5 minutes to find common ground.",
        "assertive": "I have some reservations about this approach, but I am open to discussing how we can mitigate the risks.",
        "diplomatic": "Let's pause and make sure we both feel confident in this decision before moving forward.",
        "rationale": "Prevents passive-aggressive disengagement and opens the door for genuine constructive dialogue."
    },
    {
        "trigger": r"not my (?:fault|problem)|that'?s your problem",
        "collaborative": "While this falls outside my immediate scope, let's figure out how we can team up to resolve it.",
        "assertive": "This particular item isn't in my current queue, but I can direct you to the right owner or documentation.",
        "diplomatic": "I understand this is a pressing issue. Let's look at who is best positioned to help unblock this.",
        "rationale": "Establishes clear boundaries while showing empathy and proactive team orientation."
    },
    {
        "trigger": r"completely (?:wrong|useless|broken)|are you (?:serious|blind|crazy)",
        "collaborative": "I noticed an issue with this implementation. Let's look over the edge cases together and fix it.",
        "assertive": "The current result does not meet our acceptance criteria. Let's review the required changes.",
        "diplomatic": "It looks like there might be an unexpected bug here. Could you help me understand how this was produced?",
        "rationale": "Eliminates abrasive emotional judgment and shifts focus to objective problem solving."
    }
]


def _generate_rule_based_rewrites(text: str, triggers: List[str], primary_tone: str) -> List[RewriteSuggestion]:
    """Generates empathetic rewrites using rule-based heuristics when LLM is unavailable."""
    lower = text.lower()
    
    # Check if any specific template matches
    for rule in FALLBACK_TRANSFORMATIONS:
        if re.search(rule["trigger"], lower):
            return [
                RewriteSuggestion(
                    id="opt-1",
                    category="Collaborative",
                    text=rule["collaborative"],
                    tone_badge="Warm & Partnering",
                    rationale=rule["rationale"]
                ),
                RewriteSuggestion(
                    id="opt-2",
                    category="Assertive",
                    text=rule["assertive"],
                    tone_badge="Clear & Professional",
                    rationale="Communicates the objective requirement with clarity and firm respect."
                ),
                RewriteSuggestion(
                    id="opt-3",
                    category="Diplomatic",
                    text=rule["diplomatic"],
                    tone_badge="De-escalating",
                    rationale="Preserves rapport and softens tension in a sensitive exchange."
                )
            ]

    # Generalized empathetic transformation
    cleaned = re.sub(r"[!]{2,}|\?{2,}", ".", text)
    cleaned = cleaned.replace("not my problem", "outside my scope")
    cleaned = cleaned.replace("waste of time", "not our top priority")
    cleaned = cleaned.capitalize()

    return [
        RewriteSuggestion(
            id="opt-1",
            category="Collaborative",
            text=f"I wanted to connect on this—{cleaned} Let's collaborate to get this sorted smoothly.",
            tone_badge="Empathetic & Warm",
            rationale="Adds collaborative framing that invites teamwork instead of defensiveness."
        ),
        RewriteSuggestion(
            id="opt-2",
            category="Assertive",
            text=f"To clarify our next steps: {cleaned} Please let me know how you'd like to proceed.",
            tone_badge="Professional & Direct",
            rationale="Delivers the key message clearly without confrontational emotional tone."
        ),
        RewriteSuggestion(
            id="opt-3",
            category="Diplomatic",
            text=f"I want to make sure we're on the same page regarding this. {cleaned}",
            tone_badge="Balanced & Calm",
            rationale="Encourages mutual understanding while de-escalating potential conflict."
        )
    ]


async def generate_rewrites(
    text: str, 
    triggers: List[str], 
    primary_tone: str, 
    api_key: Optional[str] = None
) -> List[RewriteSuggestion]:
    """
    Invokes the Google Gemini LLM to generate 2-3 actionable, context-aware empathetic rewrites.
    Falls back gracefully to intelligent local heuristics if API key is absent or unreachable.
    """
    active_key = api_key or settings.GEMINI_API_KEY

    if not active_key:
        logger.info("No Gemini API key supplied or configured; using smart heuristic rewriter.")
        return _generate_rule_based_rewrites(text, triggers, primary_tone)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=active_key)
        
        system_instruction = (
            "You are EmpathAI, an expert AI communication intermediary designed for the AFFECIO HACKS '26 hackathon. "
            "Your task is to rewrite user messages that carry negative emotional volatility, passive-aggression, defensiveness, or hostility. "
            "CRITICAL RULES:\n"
            "1. NEVER lose the sender's underlying factual point, boundaries, or requirements.\n"
            "2. Eliminate all sarcasm, condescension, exasperation, and blame.\n"
            "3. Provide exactly 3 diverse rewrite styles:\n"
            "   - 'Collaborative': Warm, supportive, partnering.\n"
            "   - 'Assertive': Professional, crisp, maintains healthy boundaries without hostility.\n"
            "   - 'Diplomatic': De-escalating, softens tension, highly respectful.\n"
            "4. For each suggestion, provide a concise 1-sentence rationale explaining why it works.\n"
            "5. Return strictly valid JSON conforming to the requested schema."
        )

        prompt = (
            f"Original message: \"{text}\"\n"
            f"Detected tone: {primary_tone}\n"
            f"Friction triggers: {', '.join(triggers) if triggers else 'General volatility'}\n\n"
            "Generate 3 empathetic rewrites in JSON format:\n"
            "{\n"
            "  \"suggestions\": [\n"
            "    {\"id\": \"1\", \"category\": \"Collaborative\", \"text\": \"...\", \"tone_badge\": \"Warm & Supportive\", \"rationale\": \"...\"},\n"
            "    {\"id\": \"2\", \"category\": \"Assertive\", \"text\": \"...\", \"tone_badge\": \"Professional & Clear\", \"rationale\": \"...\"},\n"
            "    {\"id\": \"3\", \"category\": \"Diplomatic\", \"text\": \"...\", \"tone_badge\": \"Diplomatic & Calm\", \"rationale\": \"...\"}\n"
            "  ]\n"
            "}"
        )

        response = await client.aio.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
                response_mime_type="application/json"
            )
        )

        raw_json = response.text or "{}"
        data = json.loads(raw_json)

        suggestions_data = data.get("suggestions", [])
        if not suggestions_data:
            return _generate_rule_based_rewrites(text, triggers, primary_tone)

        results = []
        for idx, item in enumerate(suggestions_data):
            results.append(
                RewriteSuggestion(
                    id=str(item.get("id", idx + 1)),
                    category=item.get("category", "Empathetic"),
                    text=item.get("text", ""),
                    tone_badge=item.get("tone_badge", "De-escalated"),
                    rationale=item.get("rationale", "Softens friction while preserving original intent.")
                )
            )
        return results

    except Exception as e:
        logger.warning(f"Gemini API generation failed or encountered error: {e}. Falling back to rule-based engine.")
        return _generate_rule_based_rewrites(text, triggers, primary_tone)
