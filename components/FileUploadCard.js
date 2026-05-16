import * as React from "react";
import { UploadCloud, X, File as FileIcon, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./FileUploadCard.module.css";

/**
 * uploadFileToPinata – posts a file + metadata to /api/pinata/upload
 * and returns { cid, name, size, title, description, country, ... }
 */
async function uploadFileToPinata(file, metadata, onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", metadata.title || "");
  formData.append("description", metadata.description || "");
  formData.append("country", metadata.country || "");
  formData.append("category", metadata.category || "");
  formData.append("originDate", metadata.originDate || "");
  formData.append("latitude", String(metadata.latitude || 0));
  formData.append("longitude", String(metadata.longitude || 0));

  // We can't get real XHR progress from fetch, so simulate incremental progress
  // then jump to 100 when done
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress = Math.min(progress + 8, 90);
    onProgress?.(progress);
  }, 300);

  try {
    const res = await fetch("/api/pinata/upload", {
      method: "POST",
      body: formData,
    });

    clearInterval(progressInterval);

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Upload failed");
    }

    onProgress?.(100);
    return await res.json();
  } catch (err) {
    clearInterval(progressInterval);
    throw err;
  }
}

export const FileUploadCard = React.forwardRef(
  ({ className, files = [], onFilesChange, onFileRemove, onUploadComplete, onClose, ...props }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [showForm, setShowForm] = React.useState(false);
    const [pendingFiles, setPendingFiles] = React.useState([]);
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadError, setUploadError] = React.useState(null);

    // Metadata form state
    const [metadata, setMetadata] = React.useState({
      title: "",
      description: "",
      country: "",
      category: "",
      originDate: "",
      latitude: "",
      longitude: "",
    });

    const fileInputRef = React.useRef(null);

    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles && droppedFiles.length > 0) {
        setPendingFiles(droppedFiles);
        setShowForm(true);
        setUploadError(null);
      }
    };

    const handleFileSelect = (e) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        setPendingFiles(selectedFiles);
        setShowForm(true);
        setUploadError(null);
      }
      // Reset input so user can re-select the same file
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleMetadataChange = (field, value) => {
      setMetadata(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmitUpload = async () => {
      if (pendingFiles.length === 0) return;
      setIsUploading(true);
      setUploadError(null);

      // Create file entries for progress tracking
      const newFileEntries = pendingFiles.map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: "uploading",
        cid: null,
      }));

      // Add to parent's file list immediately
      onFilesChange(pendingFiles, newFileEntries);

      try {
        for (let i = 0; i < pendingFiles.length; i++) {
          const file = pendingFiles[i];
          const entryId = newFileEntries[i].id;

          const result = await uploadFileToPinata(file, metadata, (progress) => {
            // Update progress on the specific file entry
            onFilesChange(null, null, entryId, progress, progress >= 100 ? "completed" : "uploading");
          });

          // Notify parent of completed upload with CID
          onUploadComplete?.({
            ...result,
            fileEntryId: entryId,
          });
        }

        // Reset form
        setShowForm(false);
        setPendingFiles([]);
        setMetadata({
          title: "",
          description: "",
          country: "",
          category: "",
          originDate: "",
          latitude: "",
          longitude: "",
        });
      } catch (err) {
        console.error("Upload error:", err);
        setUploadError(err.message || "Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };

    const handleCancelForm = () => {
      setShowForm(false);
      setPendingFiles([]);
      setUploadError(null);
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 KB";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    };

    const fileItemVariants = {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
    };

    const categories = [
      "Reaction",
      "Viral Video",
      "Image Macro",
      "Sticker",
      "GIF",
      "Catchphrase",
      "Challenge",
      "Other",
    ];

    return (
      <motion.div
        ref={ref}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3 }}
        className={`${styles.card} ${className || ''}`}
        {...props}
      >
        <div className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.headerContent}>
              <div className={styles.iconWrapper}>
                <UploadCloud className={styles.headerIcon} />
              </div>
              <div>
                <h3 className={styles.title}>Upload meme</h3>
                <p className={styles.subtitle}>
                  Upload your meme to IPFS via Pinata
                </p>
              </div>
            </div>
            {onClose && (
               <button className={styles.closeBtn} onClick={onClose}>
                 <X className={styles.closeIcon} />
               </button>
            )}
          </div>

          {/* Drop zone — only show when form is not active */}
          {!showForm && (
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.gif,.webp,.png,.jpg,.jpeg,.mp4,.webm"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <UploadCloud className={styles.dropIcon} />
              <p className={styles.dropTitle}>Choose a file or drag & drop it here.</p>
              <p className={styles.dropSubtitle}>
                JPEG, PNG, GIF, WEBP, and MP4 formats, up to 100 MB.
              </p>
              <div className={styles.browseBtn}>
                Browse File
              </div>
            </div>
          )}

          {/* Metadata form — shows after file is selected */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={styles.metadataForm}
              >
                {/* Selected file preview */}
                <div className={styles.selectedFilePreview}>
                  {pendingFiles.map((file, idx) => (
                    <div key={idx} className={styles.selectedFileItem}>
                      <div className={styles.fileTypeIcon}>
                        {file.type.split("/")[1]?.toUpperCase().substring(0, 3) || "DOC"}
                      </div>
                      <span className={styles.selectedFileName}>{file.name}</span>
                      <span className={styles.selectedFileSize}>{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                </div>

                {/* Form fields */}
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Title *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. Doge, Nyan Cat, Rickroll"
                      value={metadata.title}
                      onChange={(e) => handleMetadataChange("title", e.target.value)}
                      disabled={isUploading}
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Description</label>
                    <textarea
                      className={styles.formTextarea}
                      placeholder="Origin story, context, or explanation..."
                      rows={3}
                      value={metadata.description}
                      onChange={(e) => handleMetadataChange("description", e.target.value)}
                      disabled={isUploading}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Country</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="e.g. Japan, USA"
                        value={metadata.country}
                        onChange={(e) => handleMetadataChange("country", e.target.value)}
                        disabled={isUploading}
                      />
                    </div>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Category</label>
                      <select
                        className={styles.formInput}
                        value={metadata.category}
                        onChange={(e) => handleMetadataChange("category", e.target.value)}
                        disabled={isUploading}
                      >
                        <option value="">Select...</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Origin Date</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="e.g. 2013, Jan 2021"
                        value={metadata.originDate}
                        onChange={(e) => handleMetadataChange("originDate", e.target.value)}
                        disabled={isUploading}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Latitude</label>
                      <input
                        type="number"
                        step="any"
                        className={styles.formInput}
                        placeholder="e.g. 35.6762"
                        value={metadata.latitude}
                        onChange={(e) => handleMetadataChange("latitude", e.target.value)}
                        disabled={isUploading}
                      />
                    </div>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Longitude</label>
                      <input
                        type="number"
                        step="any"
                        className={styles.formInput}
                        placeholder="e.g. 139.6503"
                        value={metadata.longitude}
                        onChange={(e) => handleMetadataChange("longitude", e.target.value)}
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {uploadError && (
                  <div className={styles.errorMsg}>{uploadError}</div>
                )}

                {/* Action buttons */}
                <div className={styles.formActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={handleCancelForm}
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.submitBtn}
                    onClick={handleSubmitUpload}
                    disabled={isUploading || !metadata.title.trim()}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className={styles.spinnerIcon} />
                        Uploading to IPFS...
                      </>
                    ) : (
                      <>
                        <UploadCloud style={{ width: 14, height: 14 }} />
                        Upload to IPFS
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Uploaded files list */}
        {files.length > 0 && (
          <div className={styles.fileListWrapper}>
            <ul className={styles.fileList}>
              <AnimatePresence>
                {files.map((file) => (
                  <motion.li
                    key={file.id}
                    variants={fileItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    layout
                    className={styles.fileItem}
                  >
                    <div className={styles.fileItemLeft}>
                      <div className={styles.fileTypeIcon}>
                        {file.file.type.split("/")[1]?.toUpperCase().substring(0, 3) || "DOC"}
                      </div>
                      <div className={styles.fileInfo}>
                        <p className={styles.fileName}>{file.file.name}</p>
                        <div className={styles.fileMeta}>
                          {file.status === "uploading" && (
                            <span>{formatFileSize((file.file.size * file.progress) / 100)} of {formatFileSize(file.file.size)}</span>
                          )}
                           {file.status === "completed" && (
                            <span>{formatFileSize(file.file.size)}</span>
                          )}
                          <span className={styles.dot}>•</span>
                          <span className={file.status === 'uploading' ? styles.statusUploading : styles.statusCompleted}>
                            {file.status === 'uploading' ? `Uploading...` : 'Completed'}
                          </span>
                          {file.cid && (
                            <>
                              <span className={styles.dot}>•</span>
                              <span className={styles.cidText} title={file.cid}>
                                CID: {file.cid.substring(0, 8)}...
                              </span>
                            </>
                          )}
                        </div>
                        {file.status === 'uploading' && (
                          <div className={styles.progressTrack}>
                            <div className={styles.progressFill} style={{ width: `${file.progress}%` }} />
                          </div>
                        )}
                      </div>
                    </div>

                     <div className={styles.fileActions}>
                        {file.status === 'completed' && <CheckCircle2 className={styles.iconCompleted} />}
                        <button className={styles.deleteBtn} onClick={() => onFileRemove(file.id)}>
                           {file.status === 'completed' ? <Trash2 className={styles.deleteIcon} /> : <X className={styles.deleteIcon} />}
                        </button>
                     </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </motion.div>
    );
  }
);
FileUploadCard.displayName = "FileUploadCard";
