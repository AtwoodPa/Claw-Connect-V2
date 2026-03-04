<template>
  <div ref="rootRef" class="oc-input-wrap" :class="{ 'is-drop-active': isDropActive }" @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop.prevent="onDrop">
    <ul v-if="showCommands && filteredCommands.length" class="oc-command-panel">
      <li
        v-for="(command, idx) in filteredCommands"
        :key="command.key"
        :class="{ active: idx === commandCursor }"
        @mousedown.prevent="selectCommand(command.key)"
      >
        <strong>{{ command.label }}</strong>
        <small>{{ command.description }}</small>
      </li>
    </ul>

    <div v-if="selectedImages.length" class="oc-image-bar">
      <div v-for="(image, idx) in selectedImages" :key="idx" class="oc-image-item">
        <img :src="image.preview" alt="preview" />
        <button type="button" @click="removeImage(idx)">×</button>
      </div>
    </div>

    <div class="oc-input-main">
      <button type="button" class="oc-attach" aria-label="Attach image" @click="fileInputRef?.click()">+</button>
      <input ref="fileInputRef" type="file" multiple accept="image/*" hidden @change="handleFileSelect" />

      <div class="oc-text-wrap">
        <textarea
          ref="textareaRef"
          v-model="text"
          :placeholder="placeholderText"
          :disabled="disabled"
          rows="1"
          @input="handleInput"
          @keydown="handleKeyDown"
          @compositionstart="isComposing = true"
          @compositionend="isComposing = false"
        />
        <div class="oc-counter" :class="{ warn: remainingChars < 120 }">{{ remainingChars }}</div>
      </div>

      <button type="button" class="oc-send" :disabled="(!canSend && !loading) || disabled" @click="handleSend">
        {{ loading ? t('input.stop') : 'Send' }}
      </button>
    </div>

    <div class="oc-input-footer">
      <span v-if="queuedCount > 0" class="oc-queue">{{ t('input.queued', { count: queuedCount }) }}</span>
      <span class="oc-hint">Enter to send · Shift+Enter newline · / for commands</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { filterCommands, parseCommand } from '../utils/commands.js';
import { useI18n } from '../composables/useI18n.js';

interface SelectedImage {
  file: File;
  preview: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    disabled?: boolean;
    uploading?: boolean;
    loading?: boolean;
    queuedCount?: number;
    placeholder?: string;
    maxLength?: number;
  }>(),
  {
    disabled: false,
    uploading: false,
    loading: false,
    queuedCount: 0,
    placeholder: '',
    maxLength: 4000
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  send: [content: string, images: File[]];
  upload: [files: FileList];
  command: [command: string, args: string];
  stop: [];
}>();

const { t } = useI18n();

const rootRef = ref<HTMLElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const isComposing = ref(false);
const showCommands = ref(false);
const commandQuery = ref('');
const commandCursor = ref(0);
const isDropActive = ref(false);
const selectedImages = ref<SelectedImage[]>([]);

const text = computed<string>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const filteredCommands = computed(() => filterCommands(commandQuery.value));
const canSend = computed(() => text.value.trim().length > 0 && text.value.length <= props.maxLength);
const placeholderText = computed(() => props.placeholder || t('input.placeholder'));
const remainingChars = computed(() => Math.max(0, props.maxLength - text.value.length));

function resizeTextarea(): void {
  const el = textareaRef.value;
  if (!el) {
    return;
  }

  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
}

function updateCommandPanel(value: string): void {
  const match = value.match(/\/(\w*)$/);
  if (!match) {
    showCommands.value = false;
    commandCursor.value = 0;
    return;
  }

  showCommands.value = true;
  commandQuery.value = match[1] ?? '';
  commandCursor.value = 0;
}

function handleInput(event: Event): void {
  const value = (event.target as HTMLTextAreaElement).value;
  text.value = value;
  resizeTextarea();
  updateCommandPanel(value);
}

function selectCommand(command: string): void {
  showCommands.value = false;
  const current = text.value;
  text.value = current.replace(/\/\w*$/, `/${command} `);
  emit('command', command, '');
  requestAnimationFrame(() => {
    textareaRef.value?.focus();
  });
}

function handleKeyDown(event: KeyboardEvent): void {
  if (showCommands.value && filteredCommands.value.length > 0) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      commandCursor.value = (commandCursor.value + 1) % filteredCommands.value.length;
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      commandCursor.value = (commandCursor.value - 1 + filteredCommands.value.length) % filteredCommands.value.length;
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      selectCommand(filteredCommands.value[commandCursor.value].key);
      return;
    }
  }

  if (event.key === 'Enter' && !event.shiftKey && !isComposing.value) {
    event.preventDefault();
    if (props.loading) {
      emit('stop');
      return;
    }
    handleSend();
  }
}

function cleanupPreviews(): void {
  selectedImages.value.forEach((item) => {
    URL.revokeObjectURL(item.preview);
  });
}

function handleSend(): void {
  const content = text.value.trim();

  if (props.loading) {
    emit('stop');
    return;
  }

  if (!content || content.length > props.maxLength) {
    return;
  }

  const command = parseCommand(content);
  if (command) {
    emit('command', command.command, command.args);
    text.value = '';
    resizeTextarea();
    return;
  }

  emit(
    'send',
    content,
    selectedImages.value.map((item) => item.file)
  );

  text.value = '';
  cleanupPreviews();
  selectedImages.value = [];
  resizeTextarea();
}

function addFiles(files: File[]): void {
  files
    .slice(0, 5)
    .forEach((file) => {
      if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
        return;
      }
      selectedImages.value.push({
        file,
        preview: URL.createObjectURL(file)
      });
    });
}

function handleFileSelect(event: Event): void {
  const files = (event.target as HTMLInputElement).files;
  if (!files) {
    return;
  }

  emit('upload', files);
  addFiles(Array.from(files));

  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

function removeImage(index: number): void {
  const item = selectedImages.value[index];
  if (item) {
    URL.revokeObjectURL(item.preview);
  }
  selectedImages.value.splice(index, 1);
}

function onDragOver(): void {
  isDropActive.value = true;
}

function onDragLeave(event: DragEvent): void {
  const target = event.relatedTarget as Node | null;
  if (!rootRef.value?.contains(target)) {
    isDropActive.value = false;
  }
}

function onDrop(event: DragEvent): void {
  isDropActive.value = false;
  const files = Array.from(event.dataTransfer?.files ?? []);
  if (files.length === 0) {
    return;
  }
  addFiles(files);
}

function onPaste(event: ClipboardEvent): void {
  const files = Array.from(event.clipboardData?.files ?? []);
  if (files.length === 0) {
    return;
  }

  addFiles(files);
}

onMounted(() => {
  textareaRef.value?.addEventListener('paste', onPaste);
});

onBeforeUnmount(() => {
  textareaRef.value?.removeEventListener('paste', onPaste);
  cleanupPreviews();
});
</script>

<style scoped>
.oc-input-wrap {
  border-top: 1px solid var(--oc-color-border);
  padding: 12px;
  background: linear-gradient(180deg, var(--oc-color-panel), color-mix(in srgb, var(--oc-color-panel-elevated) 84%, transparent));
  display: grid;
  gap: 10px;
  position: relative;
}

.oc-input-wrap.is-drop-active {
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--oc-color-primary) 44%, transparent);
}

.oc-input-main {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: end;
}

.oc-attach,
.oc-send {
  border: 0;
  border-radius: 12px;
  min-width: 44px;
  height: 42px;
  cursor: pointer;
  background: color-mix(in srgb, var(--oc-color-primary) 16%, transparent);
  color: var(--oc-color-primary-strong);
  font-size: 13px;
  font-weight: 600;
}

.oc-attach:hover,
.oc-send:hover {
  transform: translateY(-1px);
}

.oc-send {
  background: var(--oc-color-primary);
  color: white;
  padding: 0 12px;
}

.oc-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.oc-text-wrap {
  position: relative;
}

textarea {
  width: 100%;
  resize: none;
  min-height: 46px;
  max-height: 200px;
  border-radius: 14px;
  border: 1px solid var(--oc-color-border);
  padding: 10px 38px 10px 12px;
  color: var(--oc-color-text);
  background: color-mix(in srgb, var(--oc-color-panel) 82%, transparent);
  outline: none;
}

textarea:focus {
  border-color: var(--oc-color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--oc-color-primary) 18%, transparent);
}

.oc-counter {
  position: absolute;
  right: 10px;
  bottom: 8px;
  color: var(--oc-color-muted);
  font-size: 11px;
}

.oc-counter.warn {
  color: #d97706;
}

.oc-image-bar {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.oc-image-item {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  flex: 0 0 auto;
  border: 1px solid var(--oc-color-border);
}

.oc-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.oc-image-item button {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  color: white;
  background: rgba(0, 0, 0, 0.55);
}

.oc-command-panel {
  list-style: none;
  margin: 0;
  padding: 6px;
  border: 1px solid var(--oc-color-border);
  border-radius: 12px;
  background: var(--oc-color-panel);
  display: grid;
  gap: 4px;
  max-height: 180px;
  overflow-y: auto;
  box-shadow: var(--oc-shadow-sm);
}

.oc-command-panel li {
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  display: grid;
}

.oc-command-panel li.active,
.oc-command-panel li:hover {
  background: color-mix(in srgb, var(--oc-color-primary) 12%, transparent);
}

.oc-command-panel small {
  color: var(--oc-color-muted);
}

.oc-input-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.oc-queue {
  color: var(--oc-color-muted);
  font-size: 12px;
}

.oc-hint {
  color: var(--oc-color-muted);
  font-size: 11px;
}

@media (max-width: 640px) {
  .oc-hint {
    display: none;
  }
}
</style>
