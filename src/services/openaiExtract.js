import 'dotenv/config';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function callOpenAiExtract({ imageDataUrl }) {
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY não configurada.");

    const system = `
    Você é um extrator de dados para prontuários. 
    Retorne APENAS um único objeto JSON com esta estrutura (pode omitir campos não legíveis na imagem):
    
    {
      "nome": "",
      "dataAtendimento": "",
      "naturalidade": "",
      "religiao": { "nome": "", "praticante": false },
      "idade": 0,
      "sexo": "F|M",
      "filhosQuantos": 0,
      "raca": "",
      "estadoCivil": "",
      "escolaridade": "",
      "profissao": "",
      "ocupacao": "",
      "diagnosticoMedicoAtual": "",
      "informante": { "tipo": "Paciente|Membro da Família|Amigo|Outros", "observacao": "" },
      "hda": "",
      "hp": "",
      "medicamentosUsuais": "",
      "internacaoAnterior": { "teve": false, "ondeQuando": "", "motivos": "" },
      "historiaFamiliar": { "dm": false, "has": false, "cardiopatias": false, "enxaqueca": false, "tbc": false, "ca": false },
      "etilismo": { "frequencia": "Social|Todos os dias|Três vezes por semana|Mais que três vezes por semana", "tipo": "", "quantidade": "" },
      "tabagismo": { "tabagista": false, "cigarrosPorDia": 0, "exTabagistaHaQuantoTempo": "" },
      "cuidadoCorporal": { "higieneCorporalFrequenciaDia": "", "higieneBucalFrequenciaDia": "", "usoProtese": false },
      "sonoRepousoConforto": { "satisfacao": "Satisfeito|Insatisfeito" },
      "nutricaoHidratacao": {
        "alimentacao": {
          "ricaEmFrutas": false, "ricaEmGordura": false, "ricaEmCarboidratos": false,
          "ricaEmFibras": false, "ricaEmProteina": false, "ricaEmLegumesEVerduras": false
        },
        "hidratacao": { "aguaQuantidadeDia": "", "sucoQuantidadeDia": "" }
      },
      "atividadeFisica": { "pratica": false },
      "recreacao": { "frequencia": "Três vezes/semana|Mais de três vezes/semana", "duracao": "" },
      "moradia": {
        "tipo": "Própria|Cedida|Alugada",
        "energiaEletrica": true, "aguaTratada": true, "coletaDeLixo": true,
        "quantosResidem": 0, "quantosTrabalham": 0
      },
      "pesoKg": 0, "alturaCm": 0, "glicemiaCapilar": "", "paSistolica": 0, "paDiastolica": 0
    }
    
    Regras:
    - Se não tiver certeza de um campo, retorne-o como vazio "" (strings) ou false/0 conforme o tipo.
    - Datas: normalizar para "DD/MM/AAAA".
    - NÃO inclua comentários, texto adicional ou markdown fora do JSON.
    `.trim();

    const userText = "Extraia os dados do documento nesta imagem e preencha o objeto no formato especificado.";

    const body = {
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: system },
            {
                role: "user", content: [
                    { type: "text", text: userText },
                    { type: "image_url", image_url: { url: imageDataUrl } }
                ]
            }
        ],
        temperature: 0.1,
    };

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!resp.ok) throw new Error(await resp.text());
    const json = await resp.json();
    const text = json?.choices?.[0]?.message?.content?.trim() || "{}";

    let data = {};
    try {
        data = JSON.parse(text);
    } catch {
        const m = text.match(/\{[\s\S]*\}$/);
        if (m) {
            try {
                data = JSON.parse(m[0]);
            } catch {
            }
        }
    }

    // Pequenas garantias de tipos:
    if (data?.religiao && typeof data.religiao.nome !== "string") data.religiao.nome = String(data.religiao.nome || "");
    if (data?.informante && typeof data.informante.observacao !== "string") data.informante.observacao = String(data.informante.observacao || "");

    return data;
}
