import mongoose from 'mongoose';

/**
 * NursingRecord — estrutura igual à já usada no projeto
 */
const NursingRecordSchema = new mongoose.Schema(
    {
        // ---- Identificação / Anamnese ----
        nome: { type: String, required: true },
        dataAtendimento: { type: String, required: true },
        naturalidade: String,

        religiao: {
            nome: String,
            praticante: { type: Boolean, default: false },
        },

        idade: Number,
        sexo: { type: String, enum: ['F', 'M'], default: 'F' },
        filhosQuantos: Number,
        raca: String,
        estadoCivil: String,
        escolaridade: String,
        profissao: String,
        ocupacao: String,
        diagnosticoMedicoAtual: String,

        informante: {
            tipo: { type: String, enum: ['Paciente', 'Membro da Família', 'Amigo', 'Outros'] },
            observacao: String,
        },

        hda: String,
        hp: String,

        medicamentosUsuais: String,

        internacaoAnterior: {
            teve: { type: Boolean, default: false },
            ondeQuando: String,
            motivos: String,
        },

        historiaFamiliar: {
            dm: { type: Boolean, default: false },
            has: { type: Boolean, default: false },
            cardiopatias: { type: Boolean, default: false },
            enxaqueca: { type: Boolean, default: false },
            tbc: { type: Boolean, default: false },
            ca: { type: Boolean, default: false },
        },

        // ---- Necessidades Psicossociais / Hábitos de vida ----
        etilismo: {
            frequencia: {
                type: String,
                enum: ['Social', 'Todos os dias', 'Três vezes por semana', 'Mais que três vezes por semana'],
            },
            tipo: String,
            quantidade: String,
        },
        tabagismo: {
            tabagista: { type: Boolean, default: false },
            cigarrosPorDia: Number,
            exTabagistaHaQuantoTempo: String,
        },

        // ---- Necessidades Psicobiológicas ----
        cuidadoCorporal: {
            higieneCorporalFrequenciaDia: String,
            higieneBucalFrequenciaDia: String,
            usoProtese: { type: Boolean, default: false },
        },

        sonoRepousoConforto: {
            satisfacao: { type: String, enum: ['Satisfeito', 'Insatisfeito'] },
        },

        nutricaoHidratacao: {
            alimentacao: {
                ricaEmFrutas: { type: Boolean, default: false },
                ricaEmGordura: { type: Boolean, default: false },
                ricaEmCarboidratos: { type: Boolean, default: false },
                ricaEmFibras: { type: Boolean, default: false },
                ricaEmProteina: { type: Boolean, default: false },
                ricaEmLegumesEVerduras: { type: Boolean, default: false },
            },
            hidratacao: {
                aguaQuantidadeDia: String,
                sucoQuantidadeDia: String,
            },
        },

        atividadeFisica: { pratica: { type: Boolean, default: false } },
        recreacao: {
            frequencia: { type: String, enum: ['Três vezes/semana', 'Mais de três vezes/semana'] },
            duracao: String,
        },

        moradia: {
            tipo: { type: String, enum: ['Própria', 'Cedida', 'Alugada'] },
            energiaEletrica: { type: Boolean, default: true },
            aguaTratada: { type: Boolean, default: true },
            coletaDeLixo: { type: Boolean, default: true },
            quantosResidem: Number,
            quantosTrabalham: Number,
        },

        // ---- Medidas / Sinais ----
        pesoKg: Number,
        alturaCm: Number,
        glicemiaCapilar: String,
        paSistolica: Number,
        paDiastolica: Number,
    },
    { timestamps: true }
);

export const NursingRecord = mongoose.model('NursingRecord', NursingRecordSchema);
