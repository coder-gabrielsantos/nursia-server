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

        naturalidade: cap(p.naturalidade),
        idade: p.idade != null ? Number(p.idade) : undefined,
        sexo,
        filhosQuantos: p.filhos != null ? Number(p.filhos) : undefined,
        raca: cap(p.raca),
        estadoCivil: cap(p.estadoCivil),
        escolaridade: cap(p.escolaridade),
        profissao: cap(p.profissao),
        ocupacao: cap(p.ocupacao),
        diagnosticoMedicoAtual: cap(p.diagnosticoMedicoAtual),

        religiao: p.religiao ? { nome: cap(p.religiao), praticante: false } : undefined,

        informante: p.informante ? { tipo: informanteTipoMap[p.informante] || undefined, observacao: undefined } : undefined,

        hda: cap(p.hda),
        hp: cap(p.hp),
        medicamentosUsuais: cap(p.medicamentosUsuais),

        internacaoAnterior: {
            teve: String(p.internacaoAnterior || '').toLowerCase() === 'sim',
            ondeQuando: cap(p.internacaoOndeQuando),
            motivos: cap(p.internacaoMotivos),
        },

        historiaFamiliar: {
            dm: !!p.hf_DM,
            has: !!p.hf_HAS,
            cardiopatias: !!p['hf_Cardiopatias'],
            enxaqueca: !!p['hf_Enxaqueca'],
            tbc: !!p['hf_TBC'],
            ca: !!p['hf_CA'],
        },

        etilismo: {
            frequencia: etilismoFreqMap[p.etilismoFrequencia] || undefined,
            tipo: cap(p.etilismoTipo),
            quantidade: cap(p.etilismoQuantidade),
        },

        tabagismo: {
            tabagista: String(p.tabagista || '').toLowerCase() === 'sim',
            cigarrosPorDia: p.cigarrosDia != null ? Number(p.cigarrosDia) : undefined,
            exTabagistaHaQuantoTempo: cap(p.exTabagistaTempo),
        },

        cuidadoCorporal: {
            higieneCorporalFrequenciaDia: cap(p.higieneCorporal),
            higieneBucalFrequenciaDia: cap(p.higieneBucal),
            usoProtese: String(p.protese || '').toLowerCase() === 'sim',
        },

        sonoRepousoConforto: { satisfacao: sonoMap[p.sonoRepousoConforto] || undefined },

        nutricaoHidratacao: {
            alimentacao: {
                ricaEmFrutas: p.alimentacaoTipo === 'frutas' || p.alimentacaoComposicao === 'fibras',
                ricaEmGordura: p.alimentacaoTipo === 'gordura',
                ricaEmCarboidratos: p.alimentacaoTipo === 'carboidratos',
                ricaEmFibras: p.alimentacaoComposicao === 'fibras',
                ricaEmProteina: p.alimentacaoComposicao === 'proteina',
                ricaEmLegumesEVerduras: p.alimentacaoComposicao === 'legumes_verduras',
            },
            hidratacao: {
                aguaQuantidadeDia: cap(p.hidratacaoQuantidade),
                sucoQuantidadeDia: undefined,
            },
        },

        atividadeFisica: { pratica: String(p.atividadeFisica || '').toLowerCase() === 'sim' },
        recreacao: { frequencia: recreacaoMap[p.recreacaoFreq] || undefined, duracao: cap(p.recreacaoDuracao) },

        moradia: {
            tipo: moradiaTipoMap[p.moradia] || undefined,
            energiaEletrica: yesNo(p.energiaEletrica),
            aguaTratada: yesNo(p.aguaTratada),
            coletaDeLixo: yesNo(p.coletaLixo),
            quantosResidem: p.qtdResidem != null ? Number(p.qtdResidem) : undefined,
            quantosTrabalham: p.qtdTrabalham != null ? Number(p.qtdTrabalham) : undefined,
        },

        pesoKg: p.pesoKg != null ? Number(p.pesoKg) : undefined,
        alturaCm: p.alturaCm != null ? Number(p.alturaCm) : undefined,
        glicemiaCapilar: cap(p.glicemiaCapilar),
        paSistolica: p.paSistolica != null ? Number(p.paSistolica) : undefined,
        paDiastolica: p.paDiastolica != null ? Number(p.paDiastolica) : undefined,
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
        res.status(500).json({ error: 'Failed to list records' });
    }
});

/** POST /records — somente admin (x-admin-key) */
router.post('/', checkAdmin, async (req, res) => {
    try {
        const normalized = normalizePayload(req.body || {});
        if (!normalized.nome || !normalized.dataAtendimento) {
            return res.status(400).json({ error: 'nome e dataAtendimento são obrigatórios' });
        }
        const created = await NursingRecord.create(normalized);
        res.status(201).json(created);
    } catch {
        res.status(500).json({ error: 'Failed to create record' });
    }
});

/** GET /records/:id — detalhe */
router.get('/:id', async (req, res) => {
    try {
        const rec = await NursingRecord.findById(req.params.id).lean();
        if (!rec) return res.status(404).json({ error: 'Record not found' });
        res.json(rec);
    } catch {
        res.status(500).json({ error: 'Failed to fetch record' });
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
        if (!updated) return res.status(404).json({ error: 'Record not found' });
        res.json(updated);
    } catch {
        res.status(500).json({ error: 'Failed to update record' });
    }
});

/** DELETE /records/:id — somente admin */
router.delete('/:id', checkAdmin, async (req, res) => {
    try {
        const deleted = await NursingRecord.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Record not found' });
        res.json({ ok: true });
    } catch {
        res.status(500).json({ error: 'Failed to delete record' });
    }
});

export default router;
