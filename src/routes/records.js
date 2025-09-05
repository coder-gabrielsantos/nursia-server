import { Router } from 'express';
import { NursingRecord } from '../models/NursingRecord.js';
import { checkAdmin } from '../middleware/checkAdmin.js';

const router = Router();

/**
 * GET /records
 * Acesso: Qualquer cliente com senha de acesso (checkAccess é aplicado na app)
 */
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        const filter = q
            ? { patientName: { $regex: q, $options: 'i' } }
            : {};
        const records = await NursingRecord.find(filter).sort({ createdAt: -1 }).lean();
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: 'Failed to list records' });
    }
});

/**
 * POST /records
 * Acesso: Somente ADMIN (exige x-admin-key)
 */
router.post('/', checkAdmin, async (req, res) => {
    try {
        const payload = req.body || {};
        // pequena validação
        if (!payload.patientName || !payload.dataAtendimento) {
            return res.status(400).json({ error: 'patientName and dataAtendimento are required' });
        }
        const created = await NursingRecord.create(payload);
        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create record' });
    }
});

/**
 * PATCH /records/:id
 * Acesso: Somente ADMIN
 */
router.patch('/:id', checkAdmin, async (req, res) => {
    try {
        const updated = await NursingRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Record not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update record' });
    }
});

/**
 * DELETE /records/:id
 * Acesso: Somente ADMIN
 */
router.delete('/:id', checkAdmin, async (req, res) => {
    try {
        const deleted = await NursingRecord.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Record not found' });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete record' });
    }
});

export default router;
