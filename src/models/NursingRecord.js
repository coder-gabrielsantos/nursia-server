import mongoose from 'mongoose';

/**
 * NursingRecord
 * Representa um atendimento de enfermagem (somente dados relevantes à enfermagem).
 * Todos os campos abaixo foram mapeados a partir do formulário enviado (duas páginas).
 */

const NursingRecordSchema = new mongoose.Schema(
    {
        // ---- Identificação / Anamnese ----
        nome: { type: String, required: true },                         // 1- Nome
        dataAtendimento: { type: String, required: true },              // 2- Data (dd/mm/aaaa)
        naturalidade: String,                                           // 3- Naturalidade

        religiao: {
            nome: String,                                                 // 4- Religião
            praticante: { type: Boolean, default: false }                 //    Praticante (SIM/NÃO)
        },

        idade: Number,                                                  // 5- Idade
        sexo: { type: String, enum: ['F', 'M'], default: 'F' },         // 6- Sexo
        filhosQuantos: Number,                                          // 7- Filhos - Quantos?
        raca: String,                                                   // 8- Raça
        estadoCivil: String,                                            // 9- Estado Civil
        escolaridade: String,                                           // 10- Grau de Escolaridade
        profissao: String,                                              // 11- Profissão
        ocupacao: String,                                               // 12- Ocupação
        diagnosticoMedicoAtual: String,                                 // 13- Diagnóstico Médico Atual

        informante: {                                                   // 14- Informante
            tipo: { type: String, enum: ['Paciente', 'Membro da Família', 'Amigo', 'Outros'] },
            observacao: String
        },

        hda: String,                                                    // 15- Histórico da Doença Atual (HDA)
        hp: String,                                                     // 16- História/Progresso (HP)

        medicamentosUsuais: String,

        internacaoAnterior: {                                           // Internação anterior
            teve: { type: Boolean, default: false },
            ondeQuando: String,
            motivos: String
        },

        historiaFamiliar: {                                             // 17- História Familiar (HF)
            dm: { type: Boolean, default: false },
            has: { type: Boolean, default: false },
            cardiopatias: { type: Boolean, default: false },
            enxaqueca: { type: Boolean, default: false },
            tbc: { type: Boolean, default: false },
            ca: { type: Boolean, default: false }                         // Câncer
        },

        // ---- Necessidades Psicossociais / Hábitos de vida (18) ----
        etilismo: {
            frequencia: {
                type: String,
                enum: ['Social', 'Todos os dias', 'Três vezes por semana', 'Mais que três vezes por semana']
            },
            tipo: String,
            quantidade: String
        },
        tabagismo: {
            tabagista: { type: Boolean, default: false },
            cigarrosPorDia: Number,
            exTabagistaHaQuantoTempo: String
        },

        // ---- Necessidades Psicobiológicas ----
        cuidadoCorporal: {                                              // 19- Cuidado Corporal
            higieneCorporalFrequenciaDia: String,
            higieneBucalFrequenciaDia: String,
            usoProtese: { type: Boolean, default: false }
        },

        sonoRepousoConforto: {                                          // 20- Hábito de Sono, Repouso e Conforto
            satisfacao: { type: String, enum: ['Satisfeito', 'Insatisfeito'] }
        },

        nutricaoHidratacao: {                                           // 21- Nutrição e Hidratação
            alimentacao: {
                // múltiplas marcas do papel (checkboxes)
                ricaEmFrutas: { type: Boolean, default: false },
                ricaEmGordura: { type: Boolean, default: false },
                ricaEmCarboidratos: { type: Boolean, default: false },
                ricaEmFibras: { type: Boolean, default: false },
                ricaEmProteina: { type: Boolean, default: false },
                ricaEmLegumesEVerduras: { type: Boolean, default: false }
            },
            hidratacao: {
                aguaQuantidadeDia: String,                                  // campo "Água"
                sucoQuantidadeDia: String                                   // campo "Suco Quantidade/Dia"
            }
        },

        atividadeFisica: {                                              // 22- Atividade Física
            pratica: { type: Boolean, default: false }
        },
        recreacao: {
            frequencia: { type: String, enum: ['Três vezes/semana', 'Mais de três vezes/semana'] },
            duracao: String
        },

        moradia: {                                                      // 23- Moradia
            tipo: { type: String, enum: ['Própria', 'Cedida', 'Alugada'] },
            energiaEletrica: { type: Boolean, default: true },
            aguaTratada: { type: Boolean, default: true },
            coletaDeLixo: { type: Boolean, default: true },
            quantosResidem: Number,
            quantosTrabalham: Number
        },

        // ---- Medidas / Sinais ----
        pesoKg: Number,
        alturaCm: Number,
        glicemiaCapilar: String,
        paSistolica: Number,                                            // PA: sistólica
        paDiastolica: Number,                                           // PA: diastólica
    },
    { timestamps: true }
);

export const NursingRecord = mongoose.model('NursingRecord', NursingRecordSchema);
