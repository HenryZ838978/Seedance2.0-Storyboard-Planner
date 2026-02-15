import { reactive, computed, watch } from 'vue'

const STORAGE_KEY = 'seedance-workflow-project'

function createEmptyProject() {
  return {
    name: '未命名项目',
    aspectRatio: '16:9',
    assets: [],
    shots: [],
    audioTracks: {
      bgm: null,       // { file, name, duration, url }
      voice: [],        // [{ time, duration, text }]
      sfx: [],          // [{ time, duration, label }]
    },
    audioStrategy: 'split', // 'split' = 视音分离, 'native' = 原生音频
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

function createAsset(file, type, extraData = {}) {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    type, // 'image' | 'video' | 'audio'
    role: '', // 角色标注: 主角/配角/场景/道具/风格参考
    file,
    url: URL.createObjectURL(file),
    size: file.size,
    width: 0,
    height: 0,
    duration: 0,
    tagIndex: 0, // @Image1 中的 1
    ...extraData,
  }
}

function createShot(index) {
  return {
    id: crypto.randomUUID(),
    index,
    name: `镜头 ${index + 1}`,
    duration: 5,           // 4-15秒
    description: '',        // 场景描述
    shotType: null,         // 景别
    cameraL1: [],           // L1 基础运动 (最多3个)
    cameraSpeed: null,      // L2 速度修饰
    cameraMood: null,       // L2 情绪修饰
    cameraStyle: null,      // L2 风格修饰
    cameraCombo: null,      // L3 预设组合
    lighting: '',           // 光线描述
    style: '',              // 风格关键词
    resolution: '1080P',
    quality: '照片写实',
    transitionType: null,   // 与下一镜头的衔接方式
    assignedAssets: [],     // [{assetId, role}]
    firstFrameUrl: '',      // 首帧预览
    lastFrameUrl: '',       // 尾帧预览
    generatedPrompt: '',    // 自动生成的提示词
    notes: '',              // 备注
  }
}

// Singleton state
const project = reactive(createEmptyProject())

export function useProject() {
  // Computed
  const totalDuration = computed(() =>
    project.shots.reduce((sum, s) => sum + (s.duration || 0), 0)
  )

  const imageAssets = computed(() => project.assets.filter(a => a.type === 'image'))
  const videoAssets = computed(() => project.assets.filter(a => a.type === 'video'))
  const audioAssets = computed(() => project.assets.filter(a => a.type === 'audio'))

  // Asset management
  function addAsset(file) {
    const ext = file.name.split('.').pop().toLowerCase()
    let type = 'image'
    if (['mp4', 'mov', 'webm', 'avi'].includes(ext)) type = 'video'
    else if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(ext)) type = 'audio'

    const asset = createAsset(file, type)
    project.assets.push(asset)
    reindexAssetTags()
    
    // Detect image dimensions
    if (type === 'image') {
      const img = new Image()
      img.onload = () => {
        asset.width = img.naturalWidth
        asset.height = img.naturalHeight
      }
      img.src = asset.url
    }
    
    // Detect video/audio duration
    if (type === 'video' || type === 'audio') {
      const media = document.createElement(type)
      media.onloadedmetadata = () => {
        asset.duration = media.duration
      }
      media.src = asset.url
    }

    return asset
  }

  function removeAsset(id) {
    const idx = project.assets.findIndex(a => a.id === id)
    if (idx >= 0) {
      const asset = project.assets[idx]
      URL.revokeObjectURL(asset.url)
      project.assets.splice(idx, 1)
      // Remove from all shots
      for (const shot of project.shots) {
        shot.assignedAssets = shot.assignedAssets.filter(a => a.assetId !== id)
      }
      reindexAssetTags()
    }
  }

  function reindexAssetTags() {
    let imgIdx = 1, vidIdx = 1, audIdx = 1
    for (const a of project.assets) {
      if (a.type === 'image') a.tagIndex = imgIdx++
      else if (a.type === 'video') a.tagIndex = vidIdx++
      else if (a.type === 'audio') a.tagIndex = audIdx++
    }
  }

  // Shot management
  function addShot() {
    const shot = createShot(project.shots.length)
    project.shots.push(shot)
    return shot
  }

  function removeShot(id) {
    const idx = project.shots.findIndex(s => s.id === id)
    if (idx >= 0) project.shots.splice(idx, 1)
    reindexShots()
  }

  function reindexShots() {
    project.shots.forEach((s, i) => {
      s.index = i
      s.name = `镜头 ${i + 1}`
    })
  }

  function moveShot(fromIndex, toIndex) {
    const [shot] = project.shots.splice(fromIndex, 1)
    project.shots.splice(toIndex, 0, shot)
    reindexShots()
  }

  function assignAssetToShot(shotId, assetId, role) {
    const shot = project.shots.find(s => s.id === shotId)
    if (!shot) return
    const existing = shot.assignedAssets.find(a => a.assetId === assetId)
    if (existing) {
      existing.role = role
    } else {
      shot.assignedAssets.push({ assetId, role })
    }
  }

  function unassignAssetFromShot(shotId, assetId) {
    const shot = project.shots.find(s => s.id === shotId)
    if (!shot) return
    shot.assignedAssets = shot.assignedAssets.filter(a => a.assetId !== assetId)
  }

  // Persistence
  function saveProject() {
    const data = JSON.parse(JSON.stringify(project))
    // Strip file objects and urls (can't serialize)
    data.assets.forEach(a => { delete a.file; delete a.url })
    data.audioTracks.bgm = null
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    project.updatedAt = Date.now()
  }

  function resetProject() {
    Object.assign(project, createEmptyProject())
  }

  function exportProjectJSON() {
    const data = JSON.parse(JSON.stringify(project))
    data.assets.forEach(a => { delete a.file; delete a.url })
    return JSON.stringify(data, null, 2)
  }

  return {
    project,
    totalDuration,
    imageAssets,
    videoAssets,
    audioAssets,
    addAsset,
    removeAsset,
    addShot,
    removeShot,
    moveShot,
    assignAssetToShot,
    unassignAssetFromShot,
    saveProject,
    resetProject,
    exportProjectJSON,
  }
}
