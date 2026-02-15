// Seedance 2.0 镜头运动数据库
// L1: 基础运动 | L2: 修饰词 | L3: 经典组合

export const L1_MOVEMENTS = [
  { id: 'pan', label: 'Pan 摇镜', desc: '水平旋转', icon: '↔', use: '展示宽广场景' },
  { id: 'tilt', label: 'Tilt 俯仰', desc: '垂直旋转', icon: '↕', use: '展示高度对比' },
  { id: 'zoom', label: 'Zoom 变焦', desc: '镜头拉近/推远', icon: '🔍', use: '突出重点元素' },
  { id: 'dolly', label: 'Dolly 推轨', desc: '轨道推进/后退', icon: '🛤', use: '接近或远离主体' },
  { id: 'truck', label: 'Truck 横移', desc: '横向平移', icon: '⇄', use: '跟随移动主体' },
  { id: 'pedestal', label: 'Pedestal 升降台', desc: '垂直升降', icon: '⇅', use: '改变视角高度' },
  { id: 'crane', label: 'Crane 升降', desc: '戏剧性升/降', icon: '🏗', use: '宏大揭示' },
  { id: 'orbit', label: 'Orbit 环绕', desc: '围绕主体圆形运动', icon: '⟳', use: '360度展示' },
  { id: 'arc', label: 'Arc 弧线', desc: '弧形轨迹', icon: '⌒', use: '部分环绕' },
  { id: 'tracking', label: 'Tracking 跟踪', desc: '跟随移动物体', icon: '🎯', use: '保持对焦主体' },
  { id: 'static', label: 'Static 固定', desc: '固定位置', icon: '📌', use: '稳定画面' },
  { id: 'push', label: 'Push 推近', desc: '缓慢前进', icon: '→', use: '渐进式接近' },
  { id: 'pull', label: 'Pull 拉远', desc: '缓慢后退', icon: '←', use: '渐进式揭示' },
]

export const L2_SPEED = [
  { id: 'slow', label: 'Slow 缓慢', desc: '悬念、怀旧、抒情' },
  { id: 'fast', label: 'Fast 快速', desc: '紧张、紧迫、加速' },
  { id: 'subtle', label: 'Subtle 微妙', desc: '极小运动、增强沉浸' },
  { id: 'gradual', label: 'Gradual 渐进', desc: '缓慢渐变' },
  { id: 'sudden', label: 'Sudden 突然', desc: '冲击、反转' },
  { id: 'smooth', label: 'Smooth 平滑', desc: '流畅均匀' },
]

export const L2_MOOD = [
  { id: 'cinematic', label: 'Cinematic 电影级', desc: '专业电影质感' },
  { id: 'aggressive', label: 'Aggressive 激烈', desc: '恐怖、动作、追逐' },
  { id: 'dreamy', label: 'Dreamy 梦幻', desc: '梦幻、回忆、童话' },
  { id: 'intimate', label: 'Intimate 亲密', desc: '情感细节、关系' },
  { id: 'epic', label: 'Epic 史诗', desc: '宏大、壮观' },
  { id: 'dynamic', label: 'Dynamic 动感', desc: '活力、变化' },
]

export const L2_STYLE = [
  { id: 'handheld', label: 'Handheld 手持', desc: '纪录片感、真实' },
  { id: 'aerial', label: 'Aerial 航拍', desc: '鸟瞰、宏大' },
  { id: 'dutch_angle', label: 'Dutch Angle 倾斜', desc: '不安、扭曲' },
  { id: 'gimbal', label: 'Gimbal 稳定器', desc: '专业平滑' },
  { id: 'pov', label: 'POV 第一人称', desc: '沉浸式' },
  { id: 'steadicam', label: 'Steadicam 斯坦尼康', desc: '平滑跟拍' },
]

export const L3_COMBOS = [
  { id: 'orbit_zoom', movements: ['orbit', 'zoom'], label: 'Orbit + Zoom In', desc: '强烈视觉冲击、主体揭示' },
  { id: 'crane_pan', movements: ['crane', 'pan'], label: 'Crane Up + Pan', desc: '宏大氛围、开场/结尾' },
  { id: 'dolly_zoom', movements: ['dolly', 'zoom'], label: 'Dolly Zoom 希区柯克', desc: '眩晕、心理冲击' },
  { id: 'track_handheld', movements: ['tracking'], label: 'Tracking + Handheld', desc: '极度紧张、逃亡' },
  { id: 'hyperlapse_orbit', movements: ['orbit'], label: 'Hyperlapse + Orbit', desc: '时间压缩、空间流动' },
  { id: 'push_tilt', movements: ['push', 'tilt'], label: 'Push + Tilt Up', desc: '渐进揭示宏大场景' },
]

export const SHOT_TYPES = [
  { id: 'extreme_wide', label: '大全景', desc: 'Extreme Wide Shot' },
  { id: 'wide', label: '全景', desc: 'Wide Shot' },
  { id: 'medium_wide', label: '中全景', desc: 'Medium Wide Shot' },
  { id: 'medium', label: '中景', desc: 'Medium Shot' },
  { id: 'medium_close', label: '中近景', desc: 'Medium Close-Up' },
  { id: 'close', label: '近景', desc: 'Close-Up' },
  { id: 'extreme_close', label: '极端特写', desc: 'Extreme Close-Up' },
]

export const TRANSITION_TYPES = [
  { id: 'extend', label: '接着拍', desc: '视频延长模式，视觉连续性最强', icon: '⏩' },
  { id: 'last_frame', label: '尾帧接力', desc: '截取上段尾帧作为下段首帧', icon: '🔗' },
  { id: 'hard_cut', label: '硬切', desc: '直接切换，适合场景跳转', icon: '✂️' },
  { id: 'dissolve', label: '交叉溶解', desc: '后期添加，柔和过渡', icon: '🌫' },
  { id: 'flash', label: '闪白', desc: '后期添加，掩盖接缝', icon: '⚡' },
  { id: 'whip_pan', label: '甩镜转场', desc: '快速甩动镜头切换', icon: '💨' },
]

export const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9 横屏', desc: 'YouTube / 电影' },
  { id: '9:16', label: '9:16 竖屏', desc: 'TikTok / 抖音' },
  { id: '1:1', label: '1:1 方形', desc: 'Instagram' },
]
