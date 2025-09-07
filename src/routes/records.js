import { Router } from 'express';
import { NursingRecord } from '../models/NursingRecord.js';
import { checkAdmin } from '../middleware/checkAdmin.js';

const router = Router();

/** Converte o payload “flat” do front para o formato do schema */
/** Converte o payload do front (flat ou nested) para o formato do schema */
function normalizePayload(p = {}) {
    const cap = (s) => (s !== undefined && s !== null ? String(s).trim() : '');
    const num = (v) => (v === '' || v === undefined || v === null ? undefined : Number(v));
    const yesNo = (v) => {
        if (typeof v === 'boolean') return v;
        if (v === null || v === undefined) return undefined;
        return String(v).toLowerCase() === 'sim';
    };

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

    // --- Identificação / Anamnese ---
    const religiao = p.religiao
        ? (typeof p.religiao === 'string'
            ? { nome: cap(p.religiao), praticante: false }
            : {
                nome: cap(p.religiao?.nome),
                praticante: !!p.religiao?.praticante,
            })
        : undefined;

    const informante = (p.informante || p.informante?.tipo)
        ? (() => {
            const map = {
                paciente: 'Paciente',
                membro_familia: 'Membro da Família',
                amigo: 'Amigo',
                outros: 'Outros',
            };
            const rawTipo = p.informante?.tipo ?? p.informante;
            if (rawTipo == null) return undefined;
            const t = String(rawTipo).trim();
            const mapped = map[t] || map[t.toLowerCase()];
            return {
                tipo: mapped || t, // se não estiver no mapa, mantém capitalizado/trimado
                observacao: p.informante?.observacao
                    ? String(p.informante.observacao).trim()
                    : undefined,
            };
        })()
        : undefined;

    const internacaoAnterior = p.internacaoAnterior && typeof p.internacaoAnterior === 'object'
        ? {
            teve: !!p.internacaoAnterior.teve,
            ondeQuando: cap(p.internacaoAnterior.ondeQuando),
            motivos: cap(p.internacaoAnterior.motivos),
        }
        : {
            teve: yesNo(p.internacaoAnterior),
            ondeQuando: cap(p.internacaoOndeQuando),
            motivos: cap(p.internacaoMotivos),
        };

    const historiaFamiliar = p.historiaFamiliar && typeof p.historiaFamiliar === 'object'
        ? {
            dm: !!p.historiaFamiliar.dm,
            has: !!p.historiaFamiliar.has,
            cardiopatias: !!p.historiaFamiliar.cardiopatias,
            enxaqueca: !!p.historiaFamiliar.enxaqueca,
            tbc: !!p.historiaFamiliar.tbc,
            ca: !!p.historiaFamiliar.ca,
        }
        : {
            dm: !!p.hf_DM,
            has: !!p.hf_HAS,
            cardiopatias: !!p.hf_Cardiopatias,
            enxaqueca: !!p.hf_Enxaqueca,
            tbc: !!p.hf_TBC,
            ca: !!p.hf_CA,
        };

    // --- Psicossociais ---
    const etilismo = p.etilismo && typeof p.etilismo === 'object'
        ? {
            frequencia: p.etilismo.frequencia ? cap(p.etilismo.frequencia) : undefined,
            tipo: cap(p.etilismo.tipo),
            quantidade: cap(p.etilismo.quantidade),
        }
        : (p.etilismoFrequencia || p.etilismoTipo || p.etilismoQuantidade)
            ? {
                frequencia: etilismoFreqMap[p.etilismoFrequencia],
                tipo: cap(p.etilismoTipo),
                quantidade: cap(p.etilismoQuantidade),
            }
            : undefined;

    const tabagismo = p.tabagismo && typeof p.tabagismo === 'object'
        ? {
            tabagista: !!p.tabagismo.tabagista,
            cigarrosPorDia: num(p.tabagismo.cigarrosPorDia),
            exTabagistaHaQuantoTempo: cap(p.tabagismo.exTabagistaHaQuantoTempo),
        }
        : p.tabagista
            ? {
                tabagista: p.tabagista === 'sim',
                cigarrosPorDia: num(p.cigarrosDia),
                exTabagistaHaQuantoTempo: cap(p.exTabagistaTempo),
            }
            : undefined;

    // --- Psicobiológicas ---
    const cuidadoCorporal = p.cuidadoCorporal && typeof p.cuidadoCorporal === 'object'
        ? {
            higieneCorporalFrequenciaDia: cap(p.cuidadoCorporal.higieneCorporalFrequenciaDia),
            higieneBucalFrequenciaDia: cap(p.cuidadoCorporal.higieneBucalFrequenciaDia),
            usoProtese: !!p.cuidadoCorporal.usoProtese,
        }
        : {
            higieneCorporalFrequenciaDia: cap(p.higieneCorporal),
            higieneBucalFrequenciaDia: cap(p.higieneBucal),
            usoProtese: yesNo(p.protese),
        };

    const sonoRepousoConforto = p.sonoRepousoConforto && typeof p.sonoRepousoConforto === 'object'
        ? {
            satisfacao: p.sonoRepousoConforto.satisfacao ? cap(p.sonoRepousoConforto.satisfacao) : undefined,
        }
        : p.sonoRepousoConforto
            ? { satisfacao: sonoMap[p.sonoRepousoConforto] }
            : undefined;

    const nutricaoHidratacao = p.nutricaoHidratacao && typeof p.nutricaoHidratacao === 'object'
        ? {
            alimentacao: {
                ricaEmFrutas: !!p.nutricaoHidratacao.alimentacao?.ricaEmFrutas,
                ricaEmGordura: !!p.nutricaoHidratacao.alimentacao?.ricaEmGordura,
                ricaEmCarboidratos: !!p.nutricaoHidratacao.alimentacao?.ricaEmCarboidratos,
                ricaEmFibras: !!p.nutricaoHidratacao.alimentacao?.ricaEmFibras,
                ricaEmProteina: !!p.nutricaoHidratacao.alimentacao?.ricaEmProteina,
                ricaEmLegumesEVerduras: !!p.nutricaoHidratacao.alimentacao?.ricaEmLegumesEVerduras,
            },
            hidratacao: {
                aguaQuantidadeDia: cap(p.nutricaoHidratacao.hidratacao?.aguaQuantidadeDia),
                sucoQuantidadeDia: cap(p.nutricaoHidratacao.hidratacao?.sucoQuantidadeDia),
            },
        }
        : {
            alimentacao: {
                ricaEmFrutas: p.alimentacaoTipo === 'frutas',
                ricaEmGordura: p.alimentacaoTipo === 'gordura',
                ricaEmCarboidratos: p.alimentacaoTipo === 'carboidratos',
                ricaEmFibras: p.alimentacaoComposicao === 'fibras',
                ricaEmProteina: p.alimentacaoComposicao === 'proteina',
                ricaEmLegumesEVerduras: p.alimentacaoComposicao === 'legumes_verduras',
            },
            hidratacao: {
                aguaQuantidadeDia: cap(p.hidratacaoQuantidade),
                sucoQuantidadeDia: '', // se não usa, fica vazio
            },
        };

    const atividadeFisica = p.atividadeFisica && typeof p.atividadeFisica === 'object'
        ? { pratica: !!p.atividadeFisica.pratica }
        : { pratica: yesNo(p.atividadeFisica) };

    const recreacao = p.recreacao && typeof p.recreacao === 'object'
        ? {
            frequencia: p.recreacao.frequencia ? cap(p.recreacao.frequencia) : undefined,
            duracao: cap(p.recreacao.duracao),
        }
        : (p.recreacaoFreq || p.recreacaoDuracao)
            ? {
                frequencia: recreacaoMap[p.recreacaoFreq],
                duracao: cap(p.recreacaoDuracao),
            }
            : undefined;

    // --- Moradia ---
    const moradia = p.moradia && typeof p.moradia === 'object'
        ? {
            tipo: p.moradia.tipo ? cap(p.moradia.tipo) : undefined,
            energiaEletrica: !!p.moradia.energiaEletrica,
            aguaTratada: !!p.moradia.aguaTratada,
            coletaDeLixo: !!p.moradia.coletaDeLixo,
            quantosResidem: num(p.moradia.quantosResidem),
            quantosTrabalham: num(p.moradia.quantosTrabalham),
        }
        : {
            tipo: moradiaTipoMap[p.moradia],
            energiaEletrica: yesNo(p.energiaEletrica),
            aguaTratada: yesNo(p.aguaTratada),
            coletaDeLixo: yesNo(p.coletaLixo),
            quantosResidem: num(p.qtdResidem),
            quantosTrabalham: num(p.qtdTrabalham),
        };

    const out = {
        // Identificação
        nome: cap(p.nome),
        dataAtendimento: cap(p.dataAtendimento), // já pode vir DD/MM/AAAA
        naturalidade: cap(p.naturalidade),
        religiao,
        idade: num(p.idade),
        sexo,
        filhosQuantos: num(p.filhosQuantos ?? p.filhos),
        raca: cap(p.raca),
        estadoCivil: cap(p.estadoCivil),
        escolaridade: cap(p.escolaridade),
        profissao: cap(p.profissao),
        ocupacao: cap(p.ocupacao),
        diagnosticoMedicoAtual: cap(p.diagnosticoMedicoAtual),
        informante,
        hda: cap(p.hda),
        hp: cap(p.hp),
        medicamentosUsuais: cap(p.medicamentosUsuais),
        internacaoAnterior,
        historiaFamiliar,

        // Psicossociais
        etilismo,
        tabagismo,

        // Psicobiológicas
        cuidadoCorporal,
        sonoRepousoConforto,
        nutricaoHidratacao,
        atividadeFisica,
        recreacao,

        // Moradia
        moradia,

        // Medidas
        pesoKg: num(p.pesoKg),
        alturaCm: num(p.alturaCm),
        glicemiaCapilar: cap(p.glicemiaCapilar),
        paSistolica: num(p.paSistolica),
        paDiastolica: num(p.paDiastolica),
    };

    // remove undefined para não sobrescrever com campos vazios
    Object.keys(out).forEach((k) => {
        if (out[k] === undefined) delete out[k];
    });
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
