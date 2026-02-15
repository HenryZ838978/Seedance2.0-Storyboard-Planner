// Seedance 2.0 提示词自动拼装引擎

/**
 * 根据镜头卡片数据自动生成 Seedance 提示词
 * 模板: [素材引用] + [主体描述] + [镜头运动+修饰词] + [光线] + [风格] + [技术参数]
 */
export function generatePrompt(shot, assets) {
  const parts = []

  // 1. @ 素材引用
  const refs = buildAssetReferences(shot, assets)
  if (refs) parts.push(refs)

  // 2. 主体描述
  if (shot.description) parts.push(shot.description)

  // 3. 镜头运动
  const camera = buildCameraDescription(shot)
  if (camera) parts.push(camera)

  // 4. 光线
  if (shot.lighting) parts.push(shot.lighting)

  // 5. 风格
  if (shot.style) parts.push(shot.style)

  // 6. 技术参数
  const tech = buildTechParams(shot)
  if (tech) parts.push(tech)

  return parts.filter(Boolean).join('，\n')
}

function buildAssetReferences(shot, assets) {
  if (!shot.assignedAssets || shot.assignedAssets.length === 0) return ''
  
  const lines = []
  for (const assignment of shot.assignedAssets) {
    const asset = assets.find(a => a.id === assignment.assetId)
    if (!asset) continue
    const tag = `@${asset.type === 'video' ? 'Video' : asset.type === 'audio' ? 'Audio' : 'Image'}${asset.tagIndex}`
    
    switch (assignment.role) {
      case 'first_frame':
        lines.push(`${tag} 作为第一帧`)
        break
      case 'last_frame':
        lines.push(`${tag} 作为最后一帧`)
        break
      case 'character':
        lines.push(`${tag} 作为角色参考`)
        break
      case 'scene':
        lines.push(`参考 ${tag} 的场景`)
        break
      case 'camera_ref':
        lines.push(`完全复刻 ${tag} 的镜头运动和转场`)
        break
      case 'style_ref':
        lines.push(`参考 ${tag} 的视觉风格`)
        break
      case 'motion_ref':
        lines.push(`参考 ${tag} 的动作编排`)
        break
      case 'bgm':
        lines.push(`使用 ${tag} 作为背景音乐`)
        break
      case 'sfx':
        lines.push(`参考 ${tag} 的音效`)
        break
      default:
        lines.push(`参考 ${tag}`)
    }
  }
  return lines.join('，')
}

function buildCameraDescription(shot) {
  const parts = []
  
  // L1 基础运动
  if (shot.cameraL1 && shot.cameraL1.length > 0) {
    parts.push(shot.cameraL1.map(m => m.label).join(' + '))
  }

  // L2 修饰词
  const modifiers = []
  if (shot.cameraSpeed) modifiers.push(shot.cameraSpeed.label)
  if (shot.cameraMood) modifiers.push(shot.cameraMood.label)
  if (shot.cameraStyle) modifiers.push(shot.cameraStyle.label)
  
  if (modifiers.length > 0) {
    parts.push(modifiers.join('、'))
  }

  // 景别
  if (shot.shotType) {
    parts.push(shot.shotType.label)
  }

  return parts.join('，')
}

function buildTechParams(shot) {
  const params = []
  if (shot.resolution) params.push(shot.resolution)
  if (shot.quality) params.push(shot.quality)
  return params.join('，')
}

// 资产在镜头中的角色选项
export const ASSET_ROLES = {
  image: [
    { id: 'first_frame', label: '首帧' },
    { id: 'last_frame', label: '尾帧' },
    { id: 'character', label: '角色参考' },
    { id: 'scene', label: '场景参考' },
    { id: 'style_ref', label: '风格参考' },
  ],
  video: [
    { id: 'camera_ref', label: '运镜参考' },
    { id: 'motion_ref', label: '动作参考' },
    { id: 'style_ref', label: '风格参考' },
    { id: 'extend', label: '视频延长' },
  ],
  audio: [
    { id: 'bgm', label: '背景音乐' },
    { id: 'sfx', label: '音效参考' },
  ],
}
