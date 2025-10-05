<template>
  <div class="uploader">
    <div class="label">Choose image</div>

    <!-- Área principal -->
    <div
      class="drop-area"
      @dragover.prevent
      @drop.prevent="handleDrop"
      @click="triggerFileSelect"
    >
      <div v-if="!previewUrl" class="placeholder">
        <span>Click or drag file here</span>
      </div>

      <div v-else class="preview">
        <img :src="previewUrl" alt="Preview" />
        <button class="remove-btn" @click.stop="clearImage">×</button>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileChange"
      class="hidden-input"
    />

    <button
      class="upload-btn"
      :disabled="!selectedFile"
      @click="emitUpload"
    >
      Upload
    </button>

    <p v-if="fileName" class="filename">{{ fileName }}</p>
  </div>
</template>

<script>
export default {
  name: 'ImageUploader',
  data: () => ({
    selectedFile: null,
    previewUrl: null,
    fileName: ''
  }),
  methods: {
    triggerFileSelect() {
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      this.processFile(file);
    },
    handleDrop(event) {
      const file = event.dataTransfer.files[0];
      this.processFile(file);
    },
    processFile(file) {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      this.selectedFile = file;
      this.fileName = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    clearImage() {
      this.selectedFile = null;
      this.previewUrl = null;
      this.fileName = '';
      this.$emit('upload', null);
    },
    emitUpload() {
      if (this.selectedFile) {
        this.$emit('upload', this.selectedFile);
      }
    }
  }
};
</script>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
.label {
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
}
.drop-area {
  border: 2px dashed #444;
  border-radius: 10px;
  background-color: #1c1c1c;
  color: #999;
  text-align: center;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.drop-area:hover {
  border-color: #ff4040;
  background-color: #2a2a2a;
}
.placeholder {
  font-size: 14px;
  opacity: 0.8;
}
.preview {
  position: relative;
  width: 100%;
  height: 100%;
}
.preview img {
  max-width: 100%;
  max-height: 160px;
  border-radius: 10px;
  object-fit: cover;
}
.remove-btn {
  position: absolute;
  top: 5px;
  right: 8px;
  background: #ff4040;
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 18px;
  width: 26px;
  height: 26px;
  cursor: pointer;
  opacity: 0.8;
  transition: 0.2s;
}
.remove-btn:hover {
  opacity: 1;
}
.upload-btn {
  background: #ff4040;
  border: none;
  border-radius: 8px;
  padding: 10px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}
.upload-btn:hover {
  background: #ff6060;
}
.upload-btn:disabled {
  background: #333;
  color: #777;
  cursor: not-allowed;
}
.filename {
  font-size: 13px;
  opacity: 0.7;
  text-align: center;
}
.hidden-input {
  display: none;
}
</style>
