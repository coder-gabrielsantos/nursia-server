import { Router } from "express";
import { checkRecordCreator } from "../middleware/checkRecordCreator.js";
import { callOpenAiExtract } from "../services/openaiExtract.js";

const router = Router();

/** POST /AI/extract (somente Enfermeiro CAPS) */
router.post("/extract", checkRecordCreator, async (req, res) => {
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
