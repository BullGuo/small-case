import SparkMD5 from "spark-md5";

import { saveFileInfo, uploadChunkFile, fileValidate } from "@/api";

// 默认分片大小为2mb
const chunkSize = 2 * 1024 * 1024;

class SliceUpload {
  errorCb;

  successCb;

  #file;

  // 当前上传的第几片 默认从第0片开始 [0, n-1]
  #uploadCount = 0;

  // 分片数
  #chunks = 0;

  // 上传后的fileId
  #fileId = null;

  // 是否取消上传
  #canceled = false;

  constructor(currentFile, onSuccess, onError) {
    this.#file = currentFile;
    this.successCb = onSuccess || function () {};
    this.errorCb = onError || function () {};
    this.#chunks = Math.ceil(currentFile.size / chunkSize);
    this.sliceUpload();
  }

  cancelUpload() {
    this.#canceled = true;
  }

  sliceUpload() {
    if (!this.#file || this.#canceled) {
      return;
    }
    const blobSlice =
      File.prototype.slice ||
      File.prototype.mozSlice ||
      File.prototype.webkitSlice;
    let currentChunk = 0;
    const spark = new SparkMD5.ArrayBuffer();
    const frOnload = async e => {
      spark.append(e.target.result);
      currentChunk++;
      if (currentChunk < this.#chunks) {
        loadNext();
      } else {
        const md5 = spark.end();
        await this.checkFileInServe(md5);
      }
    };
    const frOnerror = e => {
      this.errorCb(e);
      this.cancelUpload();
    };
    const loadNext = () => {
      const fileReader = new FileReader();
      fileReader.onload = frOnload;
      fileReader.onerror = frOnerror;
      const start = currentChunk * chunkSize,
        end = Math.min(start + chunkSize, this.#file.size);
      fileReader.readAsArrayBuffer(blobSlice.call(this.#file, start, end));
    };
    loadNext();
  }

  // 保存文件总信息
  async checkFileInServe(md5) {
    try {
      if (this.#canceled) {
        return;
      }
      const res = await saveFileInfo({
        averageSize: chunkSize,
        chunks: this.#chunks,
        date: new Date(),
        fileMd5: md5,
        fileSize: this.#file.size,
        filename: this.#file.name,
        groupId: this.#file.groupId,
        relativePath: this.#file.webkitRelativePath
      });
      if (res) {
        this.#fileId = res.id;
        await this.uploadFileBySplitToggle();
      }
    } catch (error) {
      this.errorCb(error);
      this.cancelUpload();
    }
  }

  // 并发上传文件, 后端处理排序
  async uploadFileBySplitToggle() {
    if (this.#canceled) {
      return;
    }
    const currentFile = this.#file;

    const loadNext = async () => {
      if (this.#canceled) {
        return;
      }
      const start = this.#uploadCount * chunkSize,
        end = Math.min(start + chunkSize, currentFile.size);
      // 当前分片文件
      const formData = new FormData();
      const fileBlob = currentFile.slice(start, end);
      formData.append("chunkFile", fileBlob);
      try {
        // 上传
        await uploadChunkFile({
          chunkFile: formData,
          chunk: this.#uploadCount++, // 当前文件的第几片
          chunks: this.#chunks, // 当前文件总共有多少片
          currentChunkSize: end - start, // 当前分片大小
          fileId: this.#fileId // 总文件id
        });
        if (this.#uploadCount < this.#chunks) {
          loadNext();
        } else {
          await this.getUploadedFileInfo();
        }
      } catch (error) {
        this.errorCb(error);
        this.cancelUpload();
      }
    };
    await loadNext();
  }

  // 验证文件是否上传成功
  async getUploadedFileInfo() {
    if (this.#canceled || this.#uploadCount !== this.#chunks) {
      return;
    }
    try {
      const res = await fileValidate({ fileId: this.#fileId });
      res && this.successCb(this.#fileId);
    } catch (error) {
      this.errorCb(error);
      this.cancelUpload();
    }
  }
}

new Promise((resolve, reject) => {
  new SliceUpload(file, resolve, reject);
});
