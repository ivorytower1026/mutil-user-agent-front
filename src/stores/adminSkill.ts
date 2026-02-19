import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SkillListItem, SkillDetail, ImageVersion } from '@/types/admin'
import { adminApi } from '@/api/admin'

export const useAdminSkillStore = defineStore('adminSkill', () => {
  const skills = ref<SkillListItem[]>([])
  const currentSkill = ref<SkillDetail | null>(null)
  const currentReport = ref<string>('')
  const isLoading = ref(false)
  const reportLoading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const page = ref(1)
  const size = ref(20)

  const imageVersions = ref<ImageVersion[]>([])
  const currentImageVersion = ref<string>('')
  const imagesLoading = ref(false)

  const pendingCount = computed(() =>
    skills.value.filter(s => s.status === 'pending' && s.validation_stage === 'completed').length
  )

  async function fetchSkills(filters: { status?: string; validation_stage?: string } = {}) {
    isLoading.value = true
    error.value = null
    try {
      const response = await adminApi.getSkills({
        ...filters,
        page: page.value,
        size: size.value
      })
      skills.value = response.skills
      total.value = response.total
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch skills'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSkillDetail(skillId: string) {
    isLoading.value = true
    error.value = null
    try {
      currentSkill.value = await adminApi.getSkill(skillId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch skill detail'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSkillReport(skillId: string) {
    reportLoading.value = true
    try {
      const response = await adminApi.getSkillReport(skillId)
      if (typeof response === 'string') {
        currentReport.value = response
      } else if (response && typeof response === 'object' && 'content' in response) {
        currentReport.value = response.content
      } else {
        currentReport.value = String(response)
      }
    } catch (e) {
      currentReport.value = '加载报告失败: ' + (e instanceof Error ? e.message : 'Unknown error')
    } finally {
      reportLoading.value = false
    }
  }

  async function approveSkill(skillId: string) {
    const response = await adminApi.approveSkill(skillId)
    if (currentSkill.value && currentSkill.value.skill_id === skillId) {
      await fetchSkillDetail(skillId)
    }
    return response
  }

  async function rejectSkill(skillId: string, reason: string) {
    const response = await adminApi.rejectSkill(skillId, reason)
    if (currentSkill.value && currentSkill.value.skill_id === skillId) {
      await fetchSkillDetail(skillId)
    }
    return response
  }

  async function revalidateSkill(skillId: string) {
    return await adminApi.revalidateSkill(skillId)
  }

  async function deleteSkill(skillId: string) {
    return await adminApi.deleteSkill(skillId)
  }

  function clearCurrentSkill() {
    currentSkill.value = null
    currentReport.value = ''
  }

  async function fetchImageVersions() {
    imagesLoading.value = true
    try {
      const response = await adminApi.getImageVersions()
      imageVersions.value = response.versions
      currentImageVersion.value = response.current_version
    } catch (e) {
      console.error('Failed to fetch image versions:', e)
    } finally {
      imagesLoading.value = false
    }
  }

  async function rollbackImage(targetVersion: string) {
    const response = await adminApi.rollbackImage(targetVersion)
    await fetchImageVersions()
    return response
  }

  return {
    skills,
    currentSkill,
    currentReport,
    isLoading,
    reportLoading,
    error,
    total,
    page,
    size,
    pendingCount,
    imageVersions,
    currentImageVersion,
    imagesLoading,
    fetchSkills,
    fetchSkillDetail,
    fetchSkillReport,
    approveSkill,
    rejectSkill,
    revalidateSkill,
    deleteSkill,
    clearCurrentSkill,
    fetchImageVersions,
    rollbackImage
  }
})
