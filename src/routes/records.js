import { Router } from 'express';
import { NursingRecord } from '../models/NursingRecord.js';
import { checkAdmin } from '../middleware/checkAdmin.js';

const router = Router();

/** Converte o payload “flat” do front para o formato do schema */
function normalizePayload(p = {}) {
    const cap = (s) => (s ? String(s).trim() : '');
    const yesNo = (v) => (String(v).toLowerCase() === 'sim');

    const sexo = p.sexo && ['F', 'M'].includes(p.sexo) ? p.sexo : undefined;

    const informanteTipoMap = {
        paciente: 'Paciente',
        membro_familia: 'Membro da Família',
        amigo: 'Amigo',
        outros: 'Outros',
    };

    const etilismoFreqMap = {
        social: 'Social',
        todos_os_dias: 'Todos os dias',
        '3x_semana': 'Três vezes por semana',
        '>3x_semana': 'Mais que três vezes por semana',
    };

    const sonoMap = { satisfeito: 'Satisfeito', insatisfeito: 'Insatisfeito' };
    const recreacaoMap = { '3x_semana': 'Três vezes/semana', '>3x_semana': 'Mais de três vezes/semana' };
    const moradiaTipoMap = { propria: 'Própria', cedida: 'Cedida', alugada: 'Alugada' };

    const out = {
        nome: cap(p.nome),
        dataAtendimento: cap(p.dataAtendimento),
        // ... resto inalterado ...
    };

    Object.keys(out).forEach((k) => (out[k] === undefined ? delete out[k] : null));
    return out;
}

/** GET /records — lista registros (requer checkAccess no app) */
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        const filter = q ? { nome: { $regex: q, $options: 'i' } } : {};
        const records = await NursingRecord.find(filter).sort({ createdAt: -1 }).lean();
        res.json(records);
    } catch {
        res.status(500).json({ error: 'Falha ao listar registros' });
    }
});

/** POST /records — somente admin (x-admin-key) */
router.post('/', checkAdmin, async (req, res) => {
    try {
        const normalized = normalizePayload(req.body || {});
        if (!normalized.nome || !normalized.dataAtendimento) {
            return res.status(400).json({ error: 'O nome e a data de atendimento são obrigatórios' });
        }
        const created = await NursingRecord.create(normalized);
        res.status(201).json(created);
    } catch {
        res.status(500).json({ error: 'Falha ao criar registro' });
    }
});

/** GET /records/:id — detalhe */
router.get('/:id', async (req, res) => {
    try {
        const rec = await NursingRecord.findById(req.params.id).lean();
        if (!rec) return res.status(404).json({ error: 'Registro não encontrado' });
        res.json(rec);
    } catch {
        res.status(500).json({ error: 'Falha ao buscar registro' });
    }
});

/** PATCH /records/:id — somente admin (agora normaliza antes de salvar) */
router.patch('/:id', checkAdmin, async (req, res) => {
    try {
        const normalized = normalizePayload(req.body || {});
        const updated = await NursingRecord.findByIdAndUpdate(
            req.params.id,
            { $set: normalized },
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ error: 'Registro não encontrado' });
        res.json(updated);
    } catch {
        res.status(500).json({ error: 'Falha ao atualizar registro' });
    }
});

/** DELETE /records/:id — somente admin */
router.delete('/:id', checkAdmin, async (req, res) => {
    try {
        const deleted = await NursingRecord.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Registro não encontrado' });
        res.json({ ok: true });
    } catch {
        res.status(500).json({ error: 'Falha ao excluir registro' });
    }
});

export default router;
