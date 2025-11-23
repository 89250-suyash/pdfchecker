import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function checkPdfWithRules(file, rulesArray, onProgress) {
  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("rules", JSON.stringify(rulesArray));

  // axios POST; progress callback optional
  const res = await axios.post(`${API_BASE}/check`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        onProgress(percent);
      }
    }
  });

  return res.data;
}
