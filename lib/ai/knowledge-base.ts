import { STUDIO } from "@/lib/data/studio";
import { artists, specialties } from "@/lib/data/content";

export const knowledgeBase = {
  agendamento: {
    como_agendar:
      "Agende pelo site em /agendar, pelo assistente, ou WhatsApp. Consulta prévia é obrigatória para peças médias e grandes.",
    walk_in: STUDIO.walkIn,
    cancelamento:
      "Cancelamentos e remarcações com 48h de antecedência. Abaixo disso, o depósito não é reembolsável.",
    deposito: STUDIO.deposit,
    acompanhante:
      "Sim, um acompanhante é bem-vindo na recepção. Na sala, apenas com combinado prévio — espaço e higiene vêm primeiro.",
  },
  precos: {
    geral:
      "Valores variam com tamanho, complexidade, local do corpo e artista. Orçamento fechado só após consulta.",
    minimo: `O valor mínimo de sessão é ${STUDIO.minPrice}.`,
    sessao: "Sessões de 4h partem de valores combinados na consulta. Projetos grandes são orçados por capítulo.",
  },
  cuidados: {
    pos_tattoo:
      "Nas primeiras 24h mantenha o filme. Depois lave com sabonete neutro, seque com toque e aplique camada fina de pomada.",
    cicatrizacao:
      "Cicatrização visível em 2 a 4 semanas. Healed completo pode levar mais. Sem sol, piscina ou academia até liberarmos.",
    produtos: "Indicamos o kit de cicatrização da loja. Não use álcool, pasta de dente ou receitas da internet.",
  },
  estudio: {
    horario: STUDIO.hours.map((h) => `${h.days}: ${h.time}`).join(" | "),
    endereco: `${STUDIO.address.full} — região aproximada; o endereço exato é confirmado na consulta.`,
    estacionamento: "Há estacionamento pago na região. Detalhes na consulta.",
    idade: "Menores de 18 não tatuamos, mesmo com autorização. Documento com foto é obrigatório.",
  },
};

export function knowledgeBaseAsText() {
  const artistsBlock = artists
    .map((a) => `- ${a.name} (${a.specialty}, ${a.years} anos): ${a.bio}`)
    .join("\n");
  const styles = specialties.map((s) => s.name).join(", ");

  return `
ESTÚDIO: ${STUDIO.name}
Endereço: ${knowledgeBase.estudio.endereco}
Horários: ${knowledgeBase.estudio.horario}
WhatsApp: ${STUDIO.phone}
E-mail: ${STUDIO.email}
Estilos: ${styles}

AGENDAMENTO:
- ${knowledgeBase.agendamento.como_agendar}
- Walk-in: ${knowledgeBase.agendamento.walk_in}
- Cancelamento: ${knowledgeBase.agendamento.cancelamento}
- Depósito: ${knowledgeBase.agendamento.deposito}
- Acompanhante: ${knowledgeBase.agendamento.acompanhante}

PREÇOS:
- ${knowledgeBase.precos.geral}
- ${knowledgeBase.precos.minimo}
- ${knowledgeBase.precos.sessao}

CUIDADOS:
- ${knowledgeBase.cuidados.pos_tattoo}
- ${knowledgeBase.cuidados.cicatrizacao}
- ${knowledgeBase.cuidados.produtos}

ESTÚDIO / POLÍTICAS:
- ${knowledgeBase.estudio.estacionamento}
- ${knowledgeBase.estudio.idade}

ARTISTAS:
${artistsBlock}
`.trim();
}

export function retrieveRelevant(query: string) {
  const q = query.toLowerCase();
  const chunks: string[] = [];
  if (/pre[cç]o|valor|custa|or[cç]amento/.test(q)) chunks.push("PREÇOS", knowledgeBase.precos.geral, knowledgeBase.precos.minimo);
  if (/agenda|hor[aá]rio|marca|dispon/.test(q)) chunks.push("AGENDAMENTO", knowledgeBase.agendamento.como_agendar, knowledgeBase.estudio.horario);
  if (/walk|encaixe/.test(q)) chunks.push(knowledgeBase.agendamento.walk_in);
  if (/cuidad|cicatriz|pomada|filme|after/.test(q)) chunks.push("CUIDADOS", knowledgeBase.cuidados.pos_tattoo, knowledgeBase.cuidados.cicatrizacao);
  if (/d[oó]nde|endere[cç]o|fica|local/.test(q)) chunks.push(knowledgeBase.estudio.endereco);
  if (/artista|realismo|fine|blackwork|quem/.test(q)) chunks.push(knowledgeBaseAsText().split("ARTISTAS:")[1] ?? "");
  if (chunks.length === 0) return knowledgeBaseAsText();
  return `${chunks.join("\n")}\n\n---\nCONTEXTO COMPLETO:\n${knowledgeBaseAsText()}`;
}
