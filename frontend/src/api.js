import axios from "axios";

const API_BASE = "https://pdfchecker-h3mj.onrender.com";

export async function checkPdfWithRules(file, rulesArray, onProgress) {
  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("rules", JSON.stringify(rulesArray));

  const res = await axios.post(`${API_BASE}/check`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        onProgress(percent);
      }
    },
  });

  return res.data;
}
