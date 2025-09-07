import { Router } from "express";
import { checkAdmin } from "../middleware/checkAdmin.js";
import { callOpenAiExtract } from "../services/openaiExtract.js";

const router = Router();

/** POST /AI/extract (headers: x-access-password + x-admin-key) */
router.post("/extract", checkAdmin, async (req, res) => {
    try {
        const { image } = req.body || {};
        if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
            return res.status(400).json({ error: "Imagem inválida." });
        }
        const extracted = await callOpenAiExtract({ imageDataUrl: image });
        return res.json({ data: extracted });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e.message || "Falha na extração." });
    }
});

export default router;
