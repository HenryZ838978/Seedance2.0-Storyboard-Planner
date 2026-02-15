"""LLM-based prompt optimization for Seedance 2.0."""

import litellm
from db import get_setting

SYSTEM_PROMPT = """你是 Seedance 2.0 视频生成的提示词专家。用户会给你一段粗略的场景描述，你需要将其优化为专业的 Seedance 2.0 提示词。

优化规则：
1. 补充精确的镜头运动术语（Pan/Tilt/Zoom/Dolly/Crane/Orbit/Tracking 等）
2. 添加速度修饰词（Slow/Fast/Subtle/Gradual/Sudden）
3. 添加情绪修饰词（Cinematic/Aggressive/Dreamy/Intimate/Epic/Dynamic）
4. 添加风格修饰词（Handheld/Aerial/Gimbal/POV/Steadicam）
5. 补充光线描述
6. 保持用户原始意图不变
7. 组合镜头运动不超过 2-3 种
8. 直接输出优化后的提示词，不要解释

模板格式：
[主体描述]，[镜头运动] + [速度/情绪修饰词]，[光线描述]，[风格关键词]"""


async def optimize_prompt(raw_prompt: str, context: str = "") -> str:
    """Take a rough description and enhance it with cinematic language."""
    api_key = await get_setting("llm_api_key")
    if not api_key:
        raise ValueError("LLM API key not configured")

    provider = await get_setting("llm_provider") or "openai"
    model = await get_setting("llm_model") or "gpt-4o-mini"
    base_url = await get_setting("llm_base_url")

    # Build model string for LiteLLM
    if provider == "openai":
        model_str = model
    elif provider == "ollama":
        model_str = f"ollama/{model}"
    else:
        model_str = f"{provider}/{model}"

    user_message = f"请优化以下场景描述为 Seedance 2.0 专业提示词：\n\n{raw_prompt}"
    if context:
        user_message += f"\n\n上下文信息（景别、时长等）：{context}"

    kwargs = {
        "model": model_str,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        "api_key": api_key,
        "temperature": 0.7,
        "max_tokens": 500,
    }
    if base_url:
        kwargs["api_base"] = base_url

    response = await litellm.acompletion(**kwargs)
    return response.choices[0].message.content.strip()
