import { computed } from 'vue'
import { useProject } from './useProject'

// Seedance 2.0 硬限制
const LIMITS = {
  MAX_FILES_PER_SHOT: 12,
  MAX_IMAGES: 9,
  MAX_VIDEOS: 3,
  MAX_AUDIO: 3,
  MAX_VIDEO_DURATION: 15,
  MIN_DURATION: 4,
  MAX_DURATION: 15,
  MIN_IMAGE_WIDTH: 1920, // 2K 推荐最低宽度
  MAX_CAMERA_COMBOS: 3,
}

export function useValidation() {
  const { project } = useProject()

  const warnings = computed(() => {
    const w = []

    // 全局素材检查
    const imgs = project.assets.filter(a => a.type === 'image')
    const vids = project.assets.filter(a => a.type === 'video')
    const auds = project.assets.filter(a => a.type === 'audio')

    if (imgs.length > LIMITS.MAX_IMAGES) {
      w.push({ level: 'error', scope: 'global', msg: `图片素材 ${imgs.length} 张，超过上限 ${LIMITS.MAX_IMAGES} 张` })
    }
    if (vids.length > LIMITS.MAX_VIDEOS) {
      w.push({ level: 'error', scope: 'global', msg: `视频素材 ${vids.length} 个，超过上限 ${LIMITS.MAX_VIDEOS} 个` })
    }
    if (auds.length > LIMITS.MAX_AUDIO) {
      w.push({ level: 'error', scope: 'global', msg: `音频素材 ${auds.length} 个，超过上限 ${LIMITS.MAX_AUDIO} 个` })
    }

    // 分辨率检查
    for (const img of imgs) {
      if (img.width > 0 && img.width < LIMITS.MIN_IMAGE_WIDTH) {
        w.push({
          level: 'warn',
          scope: 'asset',
          assetId: img.id,
          msg: `${img.name} 分辨率 ${img.width}x${img.height}，建议 ≥2K (${LIMITS.MIN_IMAGE_WIDTH}px)`,
        })
      }
    }

    // 视频总时长检查
    const totalVidDuration = vids.reduce((sum, v) => sum + (v.duration || 0), 0)
    if (totalVidDuration > 15) {
      w.push({ level: 'warn', scope: 'global', msg: `参考视频总时长 ${totalVidDuration.toFixed(1)}s，超过推荐的 15s` })
    }

    // 逐镜头检查
    for (const shot of project.shots) {
      const shotLabel = shot.name

      // 时长
      if (shot.duration < LIMITS.MIN_DURATION) {
        w.push({ level: 'error', scope: 'shot', shotId: shot.id, msg: `${shotLabel} 时长 ${shot.duration}s < 最小 ${LIMITS.MIN_DURATION}s` })
      }
      if (shot.duration > LIMITS.MAX_DURATION) {
        w.push({ level: 'error', scope: 'shot', shotId: shot.id, msg: `${shotLabel} 时长 ${shot.duration}s > 最大 ${LIMITS.MAX_DURATION}s` })
      }

      // 每个镜头的素材分配
      const assigned = shot.assignedAssets
      const shotImgs = assigned.filter(a => {
        const asset = project.assets.find(x => x.id === a.assetId)
        return asset && asset.type === 'image'
      })
      const shotVids = assigned.filter(a => {
        const asset = project.assets.find(x => x.id === a.assetId)
        return asset && asset.type === 'video'
      })
      const shotAuds = assigned.filter(a => {
        const asset = project.assets.find(x => x.id === a.assetId)
        return asset && asset.type === 'audio'
      })

      if (assigned.length > LIMITS.MAX_FILES_PER_SHOT) {
        w.push({ level: 'error', scope: 'shot', shotId: shot.id, msg: `${shotLabel} 分配了 ${assigned.length} 个文件，超过上限 ${LIMITS.MAX_FILES_PER_SHOT}` })
      }
      if (shotImgs.length > LIMITS.MAX_IMAGES) {
        w.push({ level: 'error', scope: 'shot', shotId: shot.id, msg: `${shotLabel} 图片 ${shotImgs.length}/${LIMITS.MAX_IMAGES}` })
      }
      if (shotVids.length > LIMITS.MAX_VIDEOS) {
        w.push({ level: 'error', scope: 'shot', shotId: shot.id, msg: `${shotLabel} 视频 ${shotVids.length}/${LIMITS.MAX_VIDEOS}` })
      }

      // 镜头运动组合不超过3
      if (shot.cameraL1 && shot.cameraL1.length > LIMITS.MAX_CAMERA_COMBOS) {
        w.push({ level: 'warn', scope: 'shot', shotId: shot.id, msg: `${shotLabel} 组合了 ${shot.cameraL1.length} 种镜头运动，建议 ≤${LIMITS.MAX_CAMERA_COMBOS}` })
      }

      // 缺少描述
      if (!shot.description || shot.description.trim() === '') {
        w.push({ level: 'warn', scope: 'shot', shotId: shot.id, msg: `${shotLabel} 缺少场景描述` })
      }
    }

    // 角色一致性检查
    const characterAssignments = new Map() // assetId -> shot names[]
    for (const shot of project.shots) {
      for (const a of shot.assignedAssets) {
        if (a.role === 'character') {
          if (!characterAssignments.has(a.assetId)) characterAssignments.set(a.assetId, [])
          characterAssignments.get(a.assetId).push(shot.name)
        }
      }
    }

    return w
  })

  const errors = computed(() => warnings.value.filter(w => w.level === 'error'))
  const hasErrors = computed(() => errors.value.length > 0)

  function getShotWarnings(shotId) {
    return warnings.value.filter(w => w.shotId === shotId)
  }

  function getAssetWarnings(assetId) {
    return warnings.value.filter(w => w.assetId === assetId)
  }

  return {
    warnings,
    errors,
    hasErrors,
    getShotWarnings,
    getAssetWarnings,
    LIMITS,
  }
}
