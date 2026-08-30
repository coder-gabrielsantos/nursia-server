import "dotenv/config";

const DEFAULT_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";

const stringField = { type: "string" };
const numberField = { type: "number" };
const booleanField = { type: "boolean" };

const object = (properties) => ({
    type: "object",
    properties,
    additionalProperties: false,
});

// O schema replica apenas os campos preenchidos automaticamente no formulário.
const nursingRecordSchema = object({
    nome: stringField,
    dataAtendimento: stringField,
    naturalidade: stringField,
    religiao: object({ nome: stringField, praticante: booleanField }),
    idade: numberField,
    sexo: { type: "string", enum: ["F", "M"] },
    filhosQuantos: numberField,
    raca: stringField,
    estadoCivil: stringField,
    escolaridade: stringField,
    profissao: stringField,
    ocupacao: stringField,
    diagnosticoMedicoAtual: stringField,
    informante: object({
        tipo: { type: "string", enum: ["Paciente", "Membro da Família", "Amigo", "Outros"] },
        observacao: stringField,
    }),
    hda: stringField,
    hp: stringField,
    medicamentosUsuais: stringField,
    internacaoAnterior: object({
        teve: booleanField,
        ondeQuando: stringField,
        motivos: stringField,
    }),
    historiaFamiliar: object({
        dm: booleanField,
        has: booleanField,
        cardiopatias: booleanField,
        enxaqueca: booleanField,
        tbc: booleanField,
        ca: booleanField,
    }),
    etilismo: object({
        frequencia: {
            type: "string",
            enum: ["Social", "Todos os dias", "Três vezes por semana", "Mais que três vezes por semana"],
        },
        tipo: stringField,
        quantidade: stringField,
    }),
    tabagismo: object({
        tabagista: booleanField,
        cigarrosPorDia: numberField,
        exTabagistaHaQuantoTempo: stringField,
    }),
    cuidadoCorporal: object({
        higieneCorporalFrequenciaDia: stringField,
        higieneBucalFrequenciaDia: stringField,
        usoProtese: booleanField,
    }),
    sonoRepousoConforto: object({
        satisfacao: { type: "string", enum: ["Satisfeito", "Insatisfeito"] },
    }),
    nutricaoHidratacao: object({
        alimentacao: object({
            ricaEmFrutas: booleanField,
            ricaEmGordura: booleanField,
            ricaEmCarboidratos: booleanField,
            ricaEmFibras: booleanField,
            ricaEmProteina: booleanField,
            ricaEmLegumesEVerduras: booleanField,
        }),
        hidratacao: object({
            aguaQuantidadeDia: stringField,
            sucoQuantidadeDia: stringField,
        }),
    }),
    atividadeFisica: object({ pratica: booleanField }),
    recreacao: object({
        frequencia: { type: "string", enum: ["Três vezes/semana", "Mais de três vezes/semana"] },
        duracao: stringField,
    }),
    moradia: object({
        tipo: { type: "string", enum: ["Própria", "Cedida", "Alugada"] },
        energiaEletrica: booleanField,
        aguaTratada: booleanField,
        coletaDeLixo: booleanField,
        quantosResidem: numberField,
        quantosTrabalham: numberField,
    }),
    pesoKg: numberField,
    alturaCm: numberField,
    glicemiaCapilar: stringField,
    paSistolica: numberField,
    paDiastolica: numberField,
});

const systemPrompt = `
Você extrai dados de prontuários de enfermagem escritos em português brasileiro.

Regras obrigatórias:
- Copie somente informações realmente visíveis no documento; nunca deduza ou complete por conta própria.
- Omita campos ilegíveis, ausentes ou ambíguos.
- Considere marcações em caixas, círculos e alternativas assinaladas.
- Normalize datas legíveis para DD/MM/AAAA.
- Use números sem unidades nos campos numéricos.
- Responda exclusivamente com um objeto JSON compatível com o schema solicitado.
`.trim();

function parseModelResponse(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) return value;

    if (typeof value !== "string") {
        throw new Error("Workers AI retornou uma resposta vazia.");
    }

    const text = value.trim();
    try {
        return JSON.parse(text);
    } catch {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start >= 0 && end > start) {
            try {
                return JSON.parse(text.slice(start, end + 1));
            } catch {
                // A mensagem abaixo evita que uma extração vazia pareça bem-sucedida.
            }
        }
    }

    throw new Error("Workers AI retornou JSON inválido.");
}

function upstreamErrorMessage(payload, status) {
    const details = payload?.errors
        ?.map((error) => error?.message)
        .filter(Boolean)
        .join("; ");

    return details
        ? `Workers AI recusou a extração (${status}): ${details}`
        : `Workers AI recusou a extração (${status}).`;
}

export async function callWorkersAiExtract({ imageDataUrl }) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const authToken = process.env.CLOUDFLARE_AUTH_TOKEN;
    const model = process.env.CLOUDFLARE_AI_MODEL || DEFAULT_MODEL;

    if (!accountId || !authToken) {
        throw new Error("CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_AUTH_TOKEN devem ser configurados.");
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${model}`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: "Extraia os dados preenchidos neste prontuário.",
                },
            ],
            image: imageDataUrl,
            response_format: {
                type: "json_schema",
                json_schema: nursingRecordSchema,
            },
            temperature: 0.1,
            max_tokens: 2048,
        }),
    });

    let payload;
    try {
        payload = await response.json();
    } catch {
        throw new Error(`Workers AI retornou uma resposta inválida (${response.status}).`);
    }

    if (!response.ok || payload?.success === false) {
        throw new Error(upstreamErrorMessage(payload, response.status));
    }

    const data = parseModelResponse(payload?.result?.response);

    // Mantém compatibilidade com o normalizador já usado pelo cliente.
    if (data?.religiao && typeof data.religiao.nome !== "string") {
        data.religiao.nome = String(data.religiao.nome || "");
    }
    if (data?.informante && typeof data.informante.observacao !== "string") {
        data.informante.observacao = String(data.informante.observacao || "");
    }

    return data;
}
