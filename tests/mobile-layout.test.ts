import assert from 'node:assert/strict';
import test from 'node:test';
import { workspacePolicy } from '../app/tcm/mobile-layout.ts';

test('task modes mount the phone model only when requested, and exam never mounts it', () => {
  assert.deepEqual(workspacePolicy('cards', true, false), {taskFirst:true, showModel:false});
  assert.deepEqual(workspacePolicy('cards', true, true), {taskFirst:true, showModel:true});
  assert.deepEqual(workspacePolicy('course', true, false), {taskFirst:true, showModel:false});
  assert.deepEqual(workspacePolicy('cases', true, false), {taskFirst:true, showModel:false});
  assert.deepEqual(workspacePolicy('quiz', true, false), {taskFirst:false, showModel:true});
  assert.deepEqual(workspacePolicy('anatomy', true, false), {taskFirst:false, showModel:true});
  assert.deepEqual(workspacePolicy('explore', true, false), {taskFirst:false, showModel:true});
  assert.deepEqual(workspacePolicy('cards', false, false), {taskFirst:false, showModel:true});
  assert.deepEqual(workspacePolicy('exam', false, true), {taskFirst:false, showModel:false});
  assert.deepEqual(workspacePolicy('exam', true, true), {taskFirst:false, showModel:false});
});
