import * as React from "react";
import { UploadCloud, X, File as FileIcon, CheckCircle2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./FileUploadCard.module.css";

export const FileUploadCard = React.forwardRef(
  ({ className, files = [], onFilesChange, onFileRemove, onClose, ...props }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false);
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
        onFilesChange(droppedFiles);
      }
    };

    const handleFileSelect = (e) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        onFilesChange(selectedFiles);
      }
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

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
                <h3 className={styles.title}>Upload files</h3>
                <p className={styles.subtitle}>
                  Select and upload the files of your choice
                </p>
              </div>
            </div>
            {onClose && (
               <button className={styles.closeBtn} onClick={onClose}>
                 <X className={styles.closeIcon} />
               </button>
            )}
          </div>

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
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <UploadCloud className={styles.dropIcon} />
            <p className={styles.dropTitle}>Choose a file or drag & drop it here.</p>
            <p className={styles.dropSubtitle}>
              JPEG, PNG, PDF, and MP4 formats, up to 50 MB.
            </p>
            <div className={styles.browseBtn}>
              Browse File
            </div>
          </div>
        </div>
        
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
