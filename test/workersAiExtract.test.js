import assert from "node:assert/strict";
import test from "node:test";

import { callWorkersAiExtract } from "../src/services/workersAiExtract.js";

const originalFetch = global.fetch;
const originalAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const originalAuthToken = process.env.CLOUDFLARE_AUTH_TOKEN;
const originalModel = process.env.CLOUDFLARE_AI_MODEL;

test.afterEach(() => {
    global.fetch = originalFetch;

    setEnv("CLOUDFLARE_ACCOUNT_ID", originalAccountId);
    setEnv("CLOUDFLARE_AUTH_TOKEN", originalAuthToken);
    setEnv("CLOUDFLARE_AI_MODEL", originalModel);
});

test("exige as credenciais do Workers AI", async () => {
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_AUTH_TOKEN;

    await assert.rejects(
        callWorkersAiExtract({ imageDataUrl: "data:image/png;base64,AA==" }),
        /CLOUDFLARE_ACCOUNT_ID/
    );
});

test("envia a imagem e retorna o JSON estruturado", async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = "account/id";
    process.env.CLOUDFLARE_AUTH_TOKEN = "secret-token";
    delete process.env.CLOUDFLARE_AI_MODEL;

    global.fetch = async (url, options) => {
        assert.equal(
            url,
            "https://api.cloudflare.com/client/v4/accounts/account%2Fid/ai/run/@cf/meta/llama-3.2-11b-vision-instruct"
        );
        assert.equal(options.headers.Authorization, "Bearer secret-token");

        const body = JSON.parse(options.body);
        assert.equal(body.image, "data:image/png;base64,AA==");
        assert.equal(body.response_format.type, "json_schema");
        assert.equal(body.temperature, 0.1);

        return new Response(JSON.stringify({
            success: true,
            result: { response: { nome: "Maria", idade: 42 } },
        }), { status: 200, headers: { "Content-Type": "application/json" } });
    };

    const result = await callWorkersAiExtract({ imageDataUrl: "data:image/png;base64,AA==" });
    assert.deepEqual(result, { nome: "Maria", idade: 42 });
});

test("aceita resposta JSON serializada pelo modelo", async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = "account";
    process.env.CLOUDFLARE_AUTH_TOKEN = "token";

    global.fetch = async () => new Response(JSON.stringify({
        success: true,
        result: { response: "```json\n{\"nome\":\"João\"}\n```" },
    }), { status: 200, headers: { "Content-Type": "application/json" } });

    const result = await callWorkersAiExtract({ imageDataUrl: "data:image/jpeg;base64,AA==" });
    assert.deepEqual(result, { nome: "João" });
});

function setEnv(name, value) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
}
