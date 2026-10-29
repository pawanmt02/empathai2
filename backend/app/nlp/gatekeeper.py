import re
import time
from typing import List, Tuple, Dict
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from app.schemas import ToneBreakdown, ToneAnalysisResult

# Initialize VADER analyzer once
try:
    _vader = SentimentIntensityAnalyzer()
except Exception:
    import nltk
    nltk.download('vader_lexicon', quiet=True)
    _vader = SentimentIntensityAnalyzer()

# Curated linguistic friction patterns
PASSIVE_AGGRESSIVE_PATTERNS = [
    (r"\bper my last email\b", "per my last email", 0.85),
    (r"\bas (?:stated|mentioned) previously\b", "as stated previously", 0.75),
    (r"\bas (?:i|we) already (?:said|told you|explained)\b", "as I already said", 0.85),
    (r"\bif you (?:actually\s+)?(?:bothered to|bother to|even)\s*(?:read|check|look)\b", "if you actually/bothered to read", 0.90),
    (r"\bif you actually read\b", "if you actually read", 0.90),
    (r"\bdid you even (?:read|check|test|look)\b", "did you even read/test", 0.85),
    (r"\bobviously\b", "obviously", 0.60),
    (r"\bclearly\b", "clearly", 0.50),
    (r"\bjust to clarify[, ]+again\b", "just to clarify again", 0.80),
    (r"\bnot sure what part of (?:this|that) was confusing\b", "not sure what part was confusing", 0.95),
    (r"\bfine[,. ]+(?:whatever|do whatever)\b", "fine, whatever", 0.80),
    (r"\bwhatever\b", "whatever", 0.65),
    (r"\bno offense(?:[, ]+but)?\b", "no offense, but", 0.70),
    (r"\bwith all due respect\b", "with all due respect", 0.65),
    (r"\bthanks for finally\b", "thanks for finally", 0.80),
    (r"\bmust be nice\b", "must be nice", 0.70),
    (r"\bgood luck with that\b", "good luck with that", 0.60),
    (r"\bjust following up (?:again|for the \d+(?:st|nd|rd|th) time)\b", "repeated follow-up exasperation", 0.75),
    (r"\bas you should know\b", "as you should know", 0.80),
    (r"\bcommon sense\b", "common sense", 0.65),
]

DEFENSIVE_PATTERNS = [
    (r"\bnot my (?:fault|problem|job)\b", "not my fault/problem", 0.85),
    (r"\bthat'?s (?:your|their) problem\b", "that's your problem", 0.85),
    (r"\byou always (?:do this|mess up|forget|blame)\b", "you always...", 0.80),
    (r"\byou never (?:listen|check|help|respond)\b", "you never...", 0.80),
    (r"\bi told you so\b", "I told you so", 0.75),
    (r"\bi already did my part\b", "I already did my part", 0.70),
    (r"\bdon'?t blame me\b", "don't blame me", 0.80),
    (r"\bwhy do i always have to\b", "why do I always have to", 0.75),
    (r"\bnot responsible for this\b", "not responsible", 0.70),
]

HOSTILE_PATTERNS = [
    (r"\bcompletely (?:wrong|useless|broken|ridiculous)\b", "completely wrong/useless", 0.85),
    (r"\b(?:total|complete) waste of (?:my )?time\b", "waste of time", 0.90),
    (r"\bare you (?:serious|blind|crazy|kidding me)\b", "are you serious/kidding", 0.85),
    (r"\bstop wasting (?:my )?time\b", "stop wasting time", 0.90),
    (r"\bhow hard is it to\b", "how hard is it to...", 0.85),
    (r"\bmake zero sense\b", "makes zero sense", 0.75),
    (r"\bhorrible (?:work|job|code|attitude)\b", "horrible work/job", 0.85),
    (r"\bdo your job\b", "do your job", 0.85),
    (r"\bi don't care\b", "I don't care", 0.65),
    (r"\bshut up\b", "shut up", 0.95),
    (r"\bidiot|stupid|moron|clueless|incompetent\b", "insulting language", 0.95),
]

POSITIVE_AFFIRMATIONS = [
    r"\bthank you\b", r"\bthanks\b", r"\bappreciate\b", r"\bgreat job\b", 
    r"\bwell done\b", r"\bhappy to help\b", r"\blooking forward\b", 
    r"\bsounds good\b", r"\blet'?s connect\b", r"\bawesome\b"
]


class GatekeeperModel:
    """
    Sub-50ms local NLP classification engine for real-time keystroke evaluation.
    Combines VADER sentiment scoring with deep rule-based lexical indicators
    for passive-aggression, hostility, defensiveness, and emotional volatility.
    """

    def __init__(self, red_threshold: int = 70, yellow_threshold: int = 36):
        self.vader = _vader
        self.red_threshold = red_threshold
        self.yellow_threshold = yellow_threshold

    def analyze(self, text: str) -> ToneAnalysisResult:
        start_time = time.perf_counter()
        clean_text = text.strip()

        if not clean_text:
            return ToneAnalysisResult(
                text="",
                score=0,
                level="green",
                primary_tone="Calm",
                secondary_tones=[],
                triggers=[],
                breakdown=ToneBreakdown(
                    sentiment_score=0.0,
                    negative_intensity=0.0,
                    passive_aggressive_score=0.0,
                    aggression_score=0.0,
                    defensiveness_score=0.0,
                ),
                requires_rewrite=False,
                suggestions=[],
                latency_ms=round((time.perf_counter() - start_time) * 1000, 2)
            )

        # 1. VADER analysis
        vs = self.vader.polarity_scores(clean_text)
        sentiment_compound = vs["compound"]  # -1.0 to 1.0
        neg_val = vs["neg"]  # 0.0 to 1.0
        pos_val = vs["pos"]

        # 2. Check uppercase shouting
        words = clean_text.split()
        shouting_words = [w for w in words if len(w) > 2 and w.isupper() and w.isalpha()]
        shout_ratio = len(shouting_words) / max(len(words), 1)

        # 3. Aggressive punctuation
        has_stacked_exclamation = bool(re.search(r"!{2,}", clean_text))
        has_stacked_question = bool(re.search(r"\?{2,}", clean_text))
        has_interrobang = bool(re.search(r"!\?|\?!", clean_text))

        # 4. Pattern matches
        lower_text = clean_text.lower()
        triggers: List[str] = []
        pa_score = 0.0
        def_score = 0.0
        hostile_score = 0.0

        for pattern, label, weight in PASSIVE_AGGRESSIVE_PATTERNS:
            if re.search(pattern, lower_text):
                pa_score = max(pa_score, weight)
                triggers.append(label)

        for pattern, label, weight in DEFENSIVE_PATTERNS:
            if re.search(pattern, lower_text):
                def_score = max(def_score, weight)
                triggers.append(label)

        for pattern, label, weight in HOSTILE_PATTERNS:
            if re.search(pattern, lower_text):
                hostile_score = max(hostile_score, weight)
                triggers.append(label)

        # Multi-match compounding
        if len(triggers) > 1:
            pa_score = min(1.0, pa_score + (len(triggers) - 1) * 0.1)
            hostile_score = min(1.0, hostile_score + (len(triggers) - 1) * 0.1)

        # Factor shouting and punctuation into hostility
        if shout_ratio > 0.3:
            hostile_score = min(1.0, hostile_score + 0.35)
            triggers.append("SHOUTING (All Caps)")
        elif shout_ratio > 0.15:
            hostile_score = min(1.0, hostile_score + 0.20)

        if has_stacked_exclamation:
            hostile_score = min(1.0, hostile_score + 0.25)
            triggers.append("Aggressive Exclamation (!!)")
        if has_stacked_question or has_interrobang:
            pa_score = min(1.0, pa_score + 0.20)
            triggers.append("Interrogative Pressure (??/!?)")

        # Check positive calming markers
        calming_count = sum(1 for p in POSITIVE_AFFIRMATIONS if re.search(p, lower_text))
        pos_buffer = min(0.3, calming_count * 0.15)

        # 5. Composite Emotional Volatility Score (0-100)
        base_neg = max(0.0, -sentiment_compound) if sentiment_compound < 0 else 0.0
        base_friction = max(pa_score, def_score, hostile_score)

        volatility_raw = (
            (base_friction * 0.55) +
            (neg_val * 0.25) +
            (base_neg * 0.20)
        ) * 100

        if hostile_score < 0.6 and pa_score < 0.6:
            volatility_raw = max(0.0, volatility_raw - (pos_buffer * 100))

        if hostile_score >= 0.8 or pa_score >= 0.85 or def_score >= 0.85:
            volatility_raw = max(volatility_raw, 78.0)
        elif len(triggers) >= 1:
            volatility_raw = max(volatility_raw, 50.0)

        final_score = int(min(100, max(0, round(volatility_raw))))

        # 6. Determine Level and Tones
        secondary_tones = []
        if final_score >= self.red_threshold:
            level = "red"
            requires_rewrite = True
            if hostile_score >= 0.7:
                primary_tone = "Hostile & Aggressive"
            elif pa_score >= 0.7:
                primary_tone = "Passive-Aggressive"
            elif def_score >= 0.7:
                primary_tone = "Defensive & Blaming"
            else:
                primary_tone = "High Emotional Friction"
        elif final_score >= self.yellow_threshold:
            level = "yellow"
            requires_rewrite = False
            if pa_score > 0.3:
                primary_tone = "Passive-Aggressive Undertone"
            elif hostile_score > 0.3:
                primary_tone = "Blunt / Impatient"
            elif def_score > 0.3:
                primary_tone = "Guarded / Defensive"
            elif sentiment_compound < -0.2:
                primary_tone = "Negative / Frustrated"
            else:
                primary_tone = "Mild Friction"
        else:
            level = "green"
            requires_rewrite = False
            if pos_val > 0.3 or sentiment_compound > 0.4:
                primary_tone = "Warm & Constructive"
            elif sentiment_compound >= 0.0:
                primary_tone = "Calm & Neutral"
            else:
                primary_tone = "Low Volatility"

        if pa_score > 0.4 and "Passive-Aggressive" not in primary_tone:
            secondary_tones.append("Passive-Aggressive")
        if def_score > 0.4 and "Defensive" not in primary_tone:
            secondary_tones.append("Defensive")
        if hostile_score > 0.4 and "Hostile" not in primary_tone:
            secondary_tones.append("Hostile")
        if shout_ratio > 0.15:
            secondary_tones.append("Shouting")

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return ToneAnalysisResult(
            text=clean_text,
            score=final_score,
            level=level,
            primary_tone=primary_tone,
            secondary_tones=secondary_tones,
            triggers=list(dict.fromkeys(triggers)),
            breakdown=ToneBreakdown(
                sentiment_score=round(sentiment_compound, 3),
                negative_intensity=round(neg_val, 3),
                passive_aggressive_score=round(pa_score, 3),
                aggression_score=round(hostile_score, 3),
                defensiveness_score=round(def_score, 3),
            ),
            requires_rewrite=requires_rewrite,
            suggestions=[],
            latency_ms=elapsed_ms
        )

gatekeeper = GatekeeperModel()
