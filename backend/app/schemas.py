from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class ToneBreakdown(BaseModel):
    sentiment_score: float = Field(..., description="VADER compound score from -1.0 to 1.0")
    negative_intensity: float = Field(..., description="Negative score from 0.0 to 1.0")
    passive_aggressive_score: float = Field(..., description="Score 0.0 to 1.0")
    aggression_score: float = Field(..., description="Score 0.0 to 1.0")
    defensiveness_score: float = Field(..., description="Score 0.0 to 1.0")

class RewriteSuggestion(BaseModel):
    id: str
    category: str = Field(..., description="E.g., Collaborative, Assertive, Diplomatic")
    text: str
    tone_badge: str
    rationale: str

class ToneAnalysisResult(BaseModel):
    text: str
    score: int = Field(..., description="0-100 volatility score")
    level: str = Field(..., description="green, yellow, or red")
    primary_tone: str = Field(..., description="Primary detected tone description")
    secondary_tones: List[str] = Field(default_factory=list)
    triggers: List[str] = Field(default_factory=list, description="Specific friction phrases detected")
    breakdown: ToneBreakdown
    requires_rewrite: bool = False
    suggestions: List[RewriteSuggestion] = Field(default_factory=list)
    latency_ms: float = 0.0

class AnalyzeRequest(BaseModel):
    text: str
    context: Optional[str] = "workplace chat"
    force_rewrite: Optional[bool] = False
    api_key: Optional[str] = None

class RewriteRequest(BaseModel):
    text: str
    triggers: Optional[List[str]] = Field(default_factory=list)
    context: Optional[str] = "workplace chat"
    api_key: Optional[str] = None
