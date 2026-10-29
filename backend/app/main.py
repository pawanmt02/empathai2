import logging
import json
import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.schemas import AnalyzeRequest, RewriteRequest, ToneAnalysisResult, RewriteSuggestion
from app.nlp.gatekeeper import gatekeeper
from app.llm.rewriter import generate_rewrites

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("empathai.main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Real-time emotional volatility analysis and empathetic text rewrite API for AFFECIO HACKS '26"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "EmpathAI Real-Time Emotional Intelligence Intermediary",
        "version": settings.VERSION,
        "docs": "/docs",
        "endpoints": {
            "rest_analyze": "/api/analyze",
            "rest_rewrite": "/api/rewrite",
            "websocket_tone": "/ws/tone"
        }
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "engine": "Gatekeeper NLP + Gemini LLM",
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }


@app.post("/api/analyze", response_model=ToneAnalysisResult)
async def analyze_text(payload: AnalyzeRequest):
    """
    Evaluates emotional tone and volatility. If volatility is in the 'red' tier
    (or force_rewrite is True), triggers generative empathetic rewrites.
    """
    result = gatekeeper.analyze(payload.text)

    if result.requires_rewrite or payload.force_rewrite:
        if payload.text.strip():
            result.suggestions = await generate_rewrites(
                text=payload.text,
                triggers=result.triggers,
                primary_tone=result.primary_tone,
                api_key=payload.api_key
            )

    return result


@app.post("/api/rewrite")
async def rewrite_text(payload: RewriteRequest):
    """
    Direct endpoint to generate 2-3 empathetic alternatives for any text.
    """
    suggestions = await generate_rewrites(
        text=payload.text,
        triggers=payload.triggers or [],
        primary_tone="Manual Rewrite Request",
        api_key=payload.api_key
    )
    return {"text": payload.text, "suggestions": suggestions}


@app.websocket("/ws/tone")
async def websocket_tone_endpoint(websocket: WebSocket):
    """
    Asynchronous WebSocket stream for debounced typing feedback.
    Provides sub-50ms score updates on keystrokes and attaches rewrites
    when emotional volatility enters the red threshold.
    """
    await websocket.accept()
    logger.info("WebSocket client connected to /ws/tone")

    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                text = payload.get("text", "")
                force_rewrite = payload.get("force_rewrite", False)
                user_api_key = payload.get("api_key")
            except Exception:
                text = data
                force_rewrite = False
                user_api_key = None

            start_t = time.perf_counter()
            analysis = gatekeeper.analyze(text)

            # Dual-model pipeline: only call generator if gatekeeper flags red or requested
            if (analysis.requires_rewrite or force_rewrite) and text.strip():
                analysis.suggestions = await generate_rewrites(
                    text=text,
                    triggers=analysis.triggers,
                    primary_tone=analysis.primary_tone,
                    api_key=user_api_key
                )

            analysis.latency_ms = round((time.perf_counter() - start_t) * 1000, 2)
            await websocket.send_text(analysis.model_dump_json())

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected from /ws/tone")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except Exception:
            pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
