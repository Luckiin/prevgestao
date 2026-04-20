"use client";

import { useEffect, useState } from "react";
import Input, { Select, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { formatCPF, cleanCPF, validarCPF } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const STATUS_OPTS   = ["Ativo", "Inativo", "Concluído"];
const TIPO_OPTS     = ["administrativo", "judicial"];

export default function ClienteForm({ inicial, onSubmit, loading }) {
  const [form, setForm]           = useState({
    ...inicial,
    nome:            inicial?.nome || "",
    cpf:             inicial?.cpf || "",
    data_nascimento: inicial?.data_nascimento || "",
    rg:              inicial?.rg || "",
    nacionalidade:   inicial?.nacionalidade || "Brasileira",
    estado_civil:    inicial?.estado_civil || "",
    endereco:        inicial?.endereco || "",
    cep:             inicial?.cep || "",
    profissao:       inicial?.profissao || "",
    telefone:        inicial?.telefone || "",
    login_inss:      inicial?.login_inss || "",
    senha_inss:      inicial?.senha_inss || "",
    tipo_processo:   inicial?.tipo_processo || "administrativo",
    subdivisao_id:   inicial?.subdivisao_id || "",
    status:          inicial?.status || "Ativo",
    situacao:        inicial?.situacao || "Pendente",
    numero_processo: inicial?.numero_processo || "",
    valor_beneficio: inicial?.valor_beneficio || "",
    observacoes:     inicial?.observacoes || "",
  });
  const [subdivisoes, setSubdivisoes] = useState([]);
  const [erros, setErros]             = useState({});
  const [mostraSenha, setMostraSenha] = useState(false);

  // Carrega subdivisões filtradas por tipo
  useEffect(() => {
    fetch(`/api/subdivisoes?tipo=${form.tipo_processo}`)
      .then(r => r.json())
      .then(setSubdivisoes)
      .catch(() => {});
  }, [form.tipo_processo]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (erros[field]) setErros(e => ({ ...e, [field]: "" }));
  }

  function validar() {
    const e = {};
    if (!form.nome.trim())           e.nome = "Nome é obrigatório";
    if (!validarCPF(form.cpf))       e.cpf  = "CPF inválido";
    if (!form.data_nascimento)       e.data_nascimento = "Data de nascimento é obrigatória";
    if (!form.tipo_processo)         e.tipo_processo = "Tipo de processo é obrigatório";
    if (!form.subdivisao_id)         e.subdivisao_id = "Subdivisão é obrigatória";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;

    onSubmit({
      ...form,
      cpf:             cleanCPF(form.cpf),
      valor_beneficio: form.valor_beneficio ? Number(form.valor_beneficio) : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Dados pessoais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nome completo"
          value={form.nome}
          onChange={e => set("nome", e.target.value)}
          error={erros.nome}
          placeholder="Nome do beneficiário"
          required
          className="sm:col-span-2"
          containerClassName="sm:col-span-2"
        />

        <Input
          label="CPF"
          value={form.cpf ? formatCPF(form.cpf) : ""}
          onChange={e => set("cpf", e.target.value)}
          error={erros.cpf}
          placeholder="000.000.000-00"
          maxLength={14}
          required
        />

        <Input
          label="Data de nascimento"
          type="date"
          value={form.data_nascimento?.split("T")[0] || ""}
          onChange={e => set("data_nascimento", e.target.value)}
          error={erros.data_nascimento}
          required
        />
      </div>

      {/* Dados pessoais complementares */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="RG"
          value={form.rg || ""}
          onChange={e => set("rg", e.target.value)}
          placeholder="00.000.000-0"
        />

        <Input
          label="Profissão"
          value={form.profissao || ""}
          onChange={e => set("profissao", e.target.value)}
          placeholder="Ex: Agricultor, Pedreiro..."
        />

        <Input
          label="Nacionalidade"
          value={form.nacionalidade || ""}
          onChange={e => set("nacionalidade", e.target.value)}
          placeholder="Brasileira"
        />

        <Select
          label="Estado Civil"
          value={form.estado_civil || ""}
          onChange={e => set("estado_civil", e.target.value)}
        >
          <option value="">Selecione...</option>
          <option value="Solteiro(a)">Solteiro(a)</option>
          <option value="Casado(a)">Casado(a)</option>
          <option value="Divorciado(a)">Divorciado(a)</option>
          <option value="Viúvo(a)">Viúvo(a)</option>
          <option value="União Estável">União Estável</option>
        </Select>

        <Input
          label="Telefone"
          value={form.telefone || ""}
          onChange={e => set("telefone", e.target.value)}
          placeholder="(00) 00000-0000"
        />

        <Input
          label="CEP"
          value={form.cep || ""}
          onChange={e => set("cep", e.target.value)}
          placeholder="00000-000"
          maxLength={9}
        />

        <Input
          label="Endereço"
          value={form.endereco || ""}
          onChange={e => set("endereco", e.target.value)}
          placeholder="Rua, nº, Bairro, Cidade/UF"
          className="sm:col-span-2"
          containerClassName="sm:col-span-2"
        />
      </div>

      {/* Credenciais INSS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Login INSS"
          value={form.login_inss || ""}
          onChange={e => set("login_inss", e.target.value)}
          placeholder="CPF ou login Meu INSS"
          hint="Armazenado com criptografia AES-256"
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-ink-400">Senha INSS</label>
          <div className="relative">
            <input
              type={mostraSenha ? "text" : "password"}
              value={form.senha_inss || ""}
              onChange={e => set("senha_inss", e.target.value)}
              placeholder="••••••••"
              className="w-full bg-dark-300 border border-dark-50 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-ink-100 placeholder-ink-600
                         focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setMostraSenha(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
            >
              {mostraSenha ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Processo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Tipo de Processo"
          value={form.tipo_processo}
          onChange={e => { set("tipo_processo", e.target.value); set("subdivisao_id", ""); }}
          error={erros.tipo_processo}
          required
        >
          {TIPO_OPTS.map(o => (
            <option key={o} value={o} className="capitalize">{o.charAt(0).toUpperCase() + o.slice(1)}</option>
          ))}
        </Select>

        <Select
          label="Subdivisão Previdenciária"
          value={form.subdivisao_id}
          onChange={e => set("subdivisao_id", e.target.value)}
          error={erros.subdivisao_id}
          required
        >
          <option value="">Selecione...</option>
          {subdivisoes.map(s => (
            <option key={s.id} value={s.id}>{s.nome}</option>
          ))}
        </Select>

        <Select
          label="Status"
          value={form.status}
          onChange={e => set("status", e.target.value)}
        >
          {STATUS_OPTS.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </Select>

        <Input
          label="Número do Processo"
          value={form.numero_processo || ""}
          onChange={e => set("numero_processo", e.target.value)}
          placeholder="INSS ou judicial"
        />

        <Input
          label="Valor Estimado do Benefício"
          type="number"
          step="0.01"
          min="0"
          value={form.valor_beneficio || ""}
          onChange={e => set("valor_beneficio", e.target.value)}
          placeholder="0,00"
          hint="R$"
        />

        <Select
          label="Situação"
          value={form.situacao}
          onChange={e => set("situacao", e.target.value)}
        >
          <option value="Pendente">Pendente</option>
          <option value="Finalizado">Finalizado</option>
        </Select>
      </div>

      <Textarea
        label="Observações internas"
        value={form.observacoes || ""}
        onChange={e => set("observacoes", e.target.value)}
        placeholder="Anotações sobre o processo..."
        rows={3}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {inicial?.id ? "Salvar alterações" : "Cadastrar cliente"}
        </Button>
      </div>
    </form>
  );
}
