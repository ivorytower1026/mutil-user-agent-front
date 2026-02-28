export type SkillStatus = 'pending' | 'validating' | 'approved' | 'rejected'
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
  created_at: string
  validated_at: string | null
}

export interface Task {
  task_id: number
  task: string
  is_new?: boolean
}

export interface TaskEvaluation {
  task_id: number
  task: string
  raw_score: number
  converted_score: number
  reason: string
  skill_used: string
  correct_skill_used: boolean
}

export interface SkillTestResult {
  passed: boolean
  scores?: {
    completion_score: number
    trigger_score: number
    offline_score: number
    overall: number
  }
  error?: string
}

export interface FullTestResults {
  passed: boolean
  total_tested: number
  failed_count: number
  failed_skills: string[]
  results?: Record<string, SkillTestResult>
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
  
  task_results: TaskEvaluation[] | null
  validation_tasks?: Task[]
  
  last_full_test_at?: string
  full_test_results?: FullTestResults
  
  completion_score: number | null
  trigger_accuracy_score: number | null
  offline_capability_score: number | null
  
  regression_results: Record<string, RegressionResult> | null
  installed_dependencies: string[] | null
  
  approved_by: string | null
  approved_at: string | null
  rejected_by: string | null
  rejected_at: string | null
  reject_reason: string | null
}

export interface RegressionResult {
  passed: boolean
  score?: number
  tasks_completed?: number
  total_tasks?: number
  error?: string
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
  approved_at: string
  message: string
}

export interface RejectResponse {
  skill_id: string
  status: SkillStatus
  rejected_at: string
  reject_reason: string
}

export interface FullTestResponse {
  status: 'started'
  message: string
}

export type SimpleSkillStatus = 'active' | 'disabled'

export interface SimpleSkillItem {
  skill_id: string
  name: string
  display_name: string | null
  description: string | null
  status: SimpleSkillStatus
  format_valid: boolean
  format_errors: string[]
  format_warnings: string[]
  created_at: string
}

export interface SimpleSkillListResponse {
  skills: SimpleSkillItem[]
  total: number
}

export interface SimpleSkillResponse {
  skill_id: string
  name: string
  display_name: string | null
  description: string | null
  status: SimpleSkillStatus
  format_valid: boolean
  format_errors: string[]
  format_warnings: string[]
  created_at: string
}
