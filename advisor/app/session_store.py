"""简单内存会话：记住意图、推荐过的案例、工具步数。"""

import time

# session_id -> state dict
_STORE = {}
_TTL_SECONDS = 60 * 60 * 6  # 6 小时


def _now():
    return time.time()


def get_session(session_id):
    if not session_id:
        return {
            "intent": None,
            "recommended_slugs": [],
            "recommended_titles": [],
            "steps": 0,
            "updated_at": _now(),
        }

    state = _STORE.get(session_id)
    if state is None:
        state = {
            "intent": None,
            "recommended_slugs": [],
            "recommended_titles": [],
            "steps": 0,
            "updated_at": _now(),
        }
        _STORE[session_id] = state
        return state

    if _now() - state.get("updated_at", 0) > _TTL_SECONDS:
        state = {
            "intent": None,
            "recommended_slugs": [],
            "recommended_titles": [],
            "steps": 0,
            "updated_at": _now(),
        }
        _STORE[session_id] = state
    return state


def save_session(session_id, state):
    if not session_id:
        return
    state["updated_at"] = _now()
    _STORE[session_id] = state
