/**
 * cryptoUtils.js
 * Utilitários de criptografia AES-256-GCM para credenciais INSS
 * Formato armazenado: "iv:tag:ciphertext" (tudo em hex)
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // bytes (96 bits – ideal para GCM)

function getKey() {
  const hexKey = process.env.ENCRYPTION_KEY;
  if (!hexKey || hexKey.length !== 64) {
    throw new Error("ENCRYPTION_KEY deve ter 64 caracteres hex (32 bytes)");
  }
  return Buffer.from(hexKey, "hex");
}

/**
 * Criptografa texto plano → string "iv:tag:ciphertext" (hex)
 */
export function encrypt(plaintext) {
  if (!plaintext) return null;

  const crypto = require("crypto");
  const key    = getKey();
  const iv     = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    tag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

/**
 * Descriptografa string "iv:tag:ciphertext" → texto plano
 */
export function decrypt(encryptedStr) {
  if (!encryptedStr) return null;

  const parts = encryptedStr.split(":");
  if (parts.length !== 3) throw new Error("Formato de dado criptografado inválido");

  const crypto   = require("crypto");
  const key      = getKey();
  const [ivHex, tagHex, dataHex] = parts;

  const iv        = Buffer.from(ivHex, "hex");
  const tag       = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Criptografa objeto { login_inss, senha_inss } se fornecido
 * Retorna { login_inss_enc, senha_inss_enc }
 */
export function encryptCredenciais({ login_inss, senha_inss }) {
  return {
    login_inss: login_inss ? encrypt(login_inss) : null,
    senha_inss: senha_inss ? encrypt(senha_inss) : null,
  };
}

/**
 * Descriptografa campos de credenciais retornados do banco
 */
export function decryptCredenciais(row) {
  if (!row) return row;
  return {
    ...row,
    login_inss: row.login_inss ? decrypt(row.login_inss) : null,
    senha_inss: row.senha_inss ? decrypt(row.senha_inss) : null,
  };
}
