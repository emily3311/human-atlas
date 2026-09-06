export type LearningMode = 'anatomy' | 'explore' | 'cards' | 'quiz' | 'course' | 'cases' | 'exam';

export function workspaceUiState(showModel: boolean, mobile: boolean, focused: boolean, controlsOpen: boolean) {
  return { focused: showModel && focused, controlsVisible: !mobile || controlsOpen };
}

export function workspacePolicy(mode: LearningMode, mobile: boolean, expanded: boolean) {
  const taskFirst = mobile && ['cards', 'course', 'cases'].includes(mode);
  return { taskFirst, showModel: mode !== 'exam' && (!taskFirst || expanded) };
}
