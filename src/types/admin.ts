export type SkillStatus = 'pending' | 'validating' | 'approved' | 'rejected' | 'rollback_pending'
export type ValidationStage = 'layer1' | 'layer2' | 'completed' | 'failed' | null

export interface SkillListItem {
  skill_id: string
  name: string
  display_name: string | null
  description: string | null
  status: SkillStatus
  validation_stage: ValidationStage
  validation_score: number | null
  layer1_passed: boolean | null
  layer2_passed: boolean | null
  runtime_image_version: string | null
  created_at: string
  validated_at: string | null
}

export interface SkillDetail extends SkillListItem {
  skill_path: string
  format_valid: boolean
  format_errors: string[]
  format_warnings: string[]
  
  blind_test_passed: boolean | null
  skill_triggered: boolean | null
  trigger_accuracy: number | null
  
  network_test_passed: boolean | null
  offline_capable: boolean | null
  blocked_network_calls: number | null
  
  execution_metrics: ExecutionMetrics | null
  task_results: TaskResult[] | null
  
  completion_score: number | null
  trigger_accuracy_score: number | null
  offline_capability_score: number | null
  resource_efficiency_score: number | null
  
  regression_results: Record<string, RegressionResult> | null
  installed_dependencies: Record<string, unknown> | null
  
  approved_by: string | null
  approved_at: string | null
  rejected_by: string | null
  rejected_at: string | null
  reject_reason: string | null
}

export interface ExecutionMetrics {
  cpu_percent: number
  memory_mb: number
  disk_read_mb: number
  disk_write_mb: number
  execution_time_sec: number
}

export interface TaskResult {
  task: string
  completed: boolean
  skill_used: string | null
  correct_skill_used: boolean
  execution_time_ms: number
  output_summary?: string
}

export interface RegressionResult {
  passed: boolean
  score: number | null
  tasks_completed: number | null
  error: string | null
}

export interface ImageVersion {
  version: string
  skill_id: string | null
  skill_name: string | null
  created_at: string
  is_current: boolean
}

export interface SkillListResponse {
  skills: SkillListItem[]
  total: number
  page: number
  size: number
}

export interface UploadResponse {
  skill_id: string
  name: string
  status: SkillStatus
  format_valid: boolean
  format_errors: string[]
  message: string
}

export interface ApproveResponse {
  skill_id: string
  name: string
  status: SkillStatus
  runtime_image_version: string
  approved_at: string
  message: string
}

export interface RejectResponse {
  skill_id: string
  status: SkillStatus
  rejected_at: string
  reject_reason: string
}

export interface RollbackResponse {
  current_version: string
  target_version: string
  affected_skills: string[]
  message: string
}

export interface ImageVersionListResponse {
  versions: ImageVersion[]
  current_version: string
  total: number
}
