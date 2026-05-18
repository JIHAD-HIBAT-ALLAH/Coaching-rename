import { useState, useEffect, useRef } from "react";
import { Check, Eye, EyeOff, BookOpen, X, Printer } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ggemanktjjcfijbjxxpb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnZW1hbmt0ampjZmlqYmp4eHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwOTgzMTgsImV4cCI6MjA5NDY3NDMxOH0.9SYq808VF9CSYmt5xu3zBACGcrXI6aL4vsRluV9_brs";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const WORKSHOP_KEY = "main";

// ─── Data ─────────────────────────────────────────────────────────────────────

// Termes groupés par source pour affichage dans la banque
const TERMS_BY_SOURCE = {
  terrain: [
    { term: "Accompagnement", note: "4/7 clients ★" },
    { term: "Suivi",          note: "Gan Prévoyance" },
    { term: "Entretien / Bilan", note: "Gan Prévoyance" },
    { term: "Revue d'activité",  note: "Atlantic" },
    { term: "Évaluation",        note: "Biogaran" },
    { term: "Coaching",          note: "Metro (keep)" },
    { term: "Projet d'agences",  note: "Gan Assurances" },
  ],
  ceo: [
    { term: "Succès",    note: "Success sessions" },
    { term: "Échanges",  note: "Échange individuel" },
    { term: "Suivis",    note: "Point de suivi" },
    { term: "Revue",     note: "Revue individuelle" },
  ],
  concurrent: [
    { term: "Check-in",            note: "15Five · Lattice" },
    { term: "Conversations",       note: "Betterworks" },
    { term: "Entretiens individuels", note: "Leapsome" },
    { term: "Animation",           note: "Objow" },
  ],
};

const TERMS = [
  ...TERMS_BY_SOURCE.terrain.map(x => x.term),
  ...TERMS_BY_SOURCE.ceo.map(x => x.term),
  ...TERMS_BY_SOURCE.concurrent.map(x => x.term),
];

const GROUPS = [
  {
    id: "dc", name: "Directeur Commercial", short: "DC", color: "#2563EB", light: "#DBEAFE",
    role: "Management d'équipe commerciale directe",
    clients: "Metro · GB Foods · GCA · GNE · Thermor · Paredes · Terreal · Atlantic",
    usecase: "Organise des sessions individuelles régulières avec chacun de ses commerciaux pour suivre les objectifs, documenter les plans d'action et mesurer la progression. Les sessions structurées remplacent les réunions informelles.",
    tension: "Le terme doit être crédible auprès d'une équipe commerciale — ni trop RH, ni trop 'développement personnel'. Donner envie de venir, pas évoquer un contrôle.",
  },
  {
    id: "dr", name: "Directeur Réseau", short: "DR", color: "#0D9488", light: "#CCFBF1",
    role: "Animation de réseaux externes et partenaires",
    clients: "Gan Assurances · Gan Prévoyance · Groupama GCM · Groupama CA · Groupama MED · Chubb Delta · Chubb Sicli",
    usecase: "Suit des agents indépendants, des franchisés ou des partenaires non-salariés. Les sessions permettent de suivre leur activité et co-construire des plans de développement — sans lien hiérarchique direct.",
    tension: "Rapport non-hiérarchique indispensable. Le terme 'coaching' crée un rapport de force inacceptable avec les agents indépendants. C'est le cas déclencheur du projet (Gan Assurances).",
  },
  {
    id: "mt", name: "Manager Terrain", short: "MT", color: "#16A34A", light: "#DCFCE7",
    role: "Encadrement de forces de vente terrain",
    clients: "Atlantic · Biogaran · Thermor · Paredes · Metro · Terreal",
    usecase: "Accompagne ses commerciaux lors de visites clients, fait des débriefs post-visite et organise des points de suivi réguliers. Sessions courtes, fréquentes, orientées action immédiate.",
    tension: "Vocabulaire terrain et opérationnel. Le terme doit être court, pratique et ne pas sonner 'siège' ou 'corporate'.",
  },
  {
    id: "rh", name: "DRH / RH", short: "RH", color: "#7C3AED", light: "#EDE9FE",
    role: "Ressources humaines · Acheteur et décideur",
    clients: "Sefe · LVL Medical · Hedis · Rawbank",
    usecase: "Intègre les sessions dans les processus RH officiels : entretiens annuels, plans de développement des compétences, obligations de formation. Le terme apparaît dans des documents légaux et réglementaires.",
    tension: "Légitimité institutionnelle. Le terme doit s'intégrer dans une convention de formation ou un dossier Qualiopi sans guillemets ni note d'explication.",
  },
  {
    id: "of", name: "Org. de Formation", short: "OF", color: "#EA580C", light: "#FFEDD5",
    role: "Formation continue · Resp. pédagogique",
    clients: "Sage · ING · Areas · Iryo · Ciments Calcia · Unibeton",
    usecase: "Intègre des sessions de suivi individuel dans des parcours certifiants. Ces sessions mesurent la progression, documentent les acquis et répondent aux exigences Qualiopi : diagnostic initial, évaluation intermédiaire, bilan final.",
    tension: "Crédibilité réglementaire. Le terme doit appartenir au vocabulaire du secteur formation et passer un contrôle Qualiopi sans questionnement.",
  },
];

const CRITERIA = [
  {
    id: "coverage",
    name: "Couverture",
    weight: 30,
    desc: "Combien de profils se retrouvent naturellement dans ce terme",
    why: "C'est le problème central d'Incenteev. Un terme qui ne couvre pas tous les profils crée des fractures clients et peut forcer l'Option B (liste per-client).",
    how: "Combien des 5 groupes utiliseraient ce mot naturellement sans qu'on le leur impose ?",
    examples: "Score 5 = les 5 groupes · Score 3 = 3 groupes seulement · Score 1 = 1 seul groupe (ex: Projet d'agences → Gan Assurances uniquement)",
  },
  {
    id: "neutrality",
    name: "Neutralité",
    weight: 25,
    desc: "Évite la connotation hiérarchique / contrôle / autorité",
    why: "C'est le déclencheur du projet (Gan Assurances). Sans neutralité, le groupe Directeur Réseau rejette le terme — il crée un rapport de force inacceptable avec les agents indépendants.",
    how: "Le terme évoque-t-il une relation de pouvoir descendant ? Contrôle, notation, jugement, surveillance ?",
    examples: "Score 5 = Accompagnement (chemin parcouru ensemble) · Score 3 = Suivi (peut sonner surveillance) · Score 1 = Évaluation (notation implicite)",
  },
  {
    id: "clarity",
    name: "Clarté",
    weight: 20,
    desc: "Compréhension immédiate sans contexte",
    why: "La feature existe déjà, les utilisateurs ont un contexte. Mais un terme trop vague ou trop anglais crée de la friction à l'adoption et ralentit l'onboarding.",
    how: "Si on remplace 'Coaching' dans la navigation par ce terme, est-ce que quelqu'un qui ne connaît pas l'outil comprend ce que c'est ?",
    examples: "Score 5 = évident sans explication · Score 3 = compréhensible avec contexte · Score 1 = ambigu ou vide de sens (ex: Échanges / Sync pour un non-anglophone)",
  },
  {
    id: "scalability",
    name: "Scalabilité",
    weight: 15,
    desc: "Le terme tient si la feature évolue (collectif, IA, certifiant)",
    why: "Important pour la roadmap long terme. Lié directement au Système complet : si les dérivés (Rôle 1, Rôle 2, Séance) sonnent faux ou awkward, le terme a un problème de scalabilité.",
    how: "Dans 3 ans, si on ajoute des sessions de groupe, du coaching IA ou des parcours certifiants — est-ce que le terme s'élargit naturellement ou se ratatine ?",
    examples: "Score 5 = Accompagnement (très scalable, couvre individuel et collectif) · Score 2 = Entretien (suggère une rencontre courte en face-à-face uniquement)",
  },
  {
    id: "translation",
    name: "Traductibilité",
    weight: 10,
    desc: "Équivalent naturel en anglais sans perte de sens",
    why: "La majorité des clients Incenteev sont FR, mais ce critère compte pour les clients internationaux et les exports CSV. Lié au tableau Système complet colonne EN.",
    how: "Existe-t-il un équivalent EN naturel qui sonne professionnel et ne perd pas le sens du terme FR ?",
    examples: "Score 5 = Check-in (universel EN) · Score 3 = Suivis → Follow-up (acceptable) · Score 1 = Accompagnement (pas de traduction EN directe naturelle)",
  },
];

const MAX_VOTES = 3; // 3 votes par groupe au total, distribuables librement (plusieurs sur le même terme OK)

// ─── Système complet — dérivés pré-remplis pour chaque terme ─────────────────

const SYSTEM_COMPLETE: {
  [term: string]: {
    role1: string;
    role2: string;
    session: string;
    teamSession: string;
    template: string;
    en: string;
    enRole1: string;
    enRole2: string;
    enSession: string;
    enTeam: string;
    enOk: boolean;
  }
} = {
  "Accompagnement": {
    role1: "Référent / Accompagnateur (OF)",
    role2: "Collaborateur / Bénéficiaire (OF/RH)",
    session: "Séance d'accompagnement / Entretien d'accompagnement",
    teamSession: "Accompagnement collectif / Atelier d'accompagnement",
    template: "Modèle d'accompagnement",
    en: "Support program / Development program",
    enRole1: "Advisor / Development lead",
    enRole2: "Participant / Advisee",
    enSession: "Support session / Development session",
    enTeam: "Group support session / Team workshop",
    enOk: false,
  },
  "Suivi": {
    role1: "Responsable / Manager",
    role2: "Collaborateur",
    session: "Point de suivi / Entretien de suivi",
    teamSession: "Réunion de suivi",
    template: "Modèle de suivi",
    en: "Check-in",
    enRole1: "Manager",
    enRole2: "Team member / Contributor",
    enSession: "Check-in / Follow-up session",
    enTeam: "Team check-in",
    enOk: true,
  },
  "Entretien / Bilan": {
    role1: "Manager",
    role2: "Collaborateur",
    session: "Entretien individuel / Bilan individuel (OF)",
    teamSession: "Bilan d'équipe",
    template: "Modèle d'entretien",
    en: "One-to-one",
    enRole1: "Manager",
    enRole2: "Employee / Direct report",
    enSession: "One-to-one",
    enTeam: "Team debrief",
    enOk: false,
  },
  "Revue d'activité": {
    role1: "Responsable",
    role2: "Collaborateur / Commercial",
    session: "Revue d'activité",
    teamSession: "Revue d'activité d'équipe",
    template: "Modèle de revue",
    en: "Business review / Activity review",
    enRole1: "Manager",
    enRole2: "Contributor / Rep (sales)",
    enSession: "Business review / Activity review",
    enTeam: "Team business review",
    enOk: true,
  },
  "Évaluation": {
    role1: "Évaluateur",
    role2: "Évalué",
    session: "Séance d'évaluation",
    teamSession: "Évaluation collective",
    template: "Modèle d'évaluation",
    en: "Performance review",
    enRole1: "Reviewer / Manager",
    enRole2: "Reviewee / Employee",
    enSession: "Performance review / Assessment session",
    enTeam: "Team performance review",
    enOk: false,
  },
  "Coaching": {
    role1: "Coach",
    role2: "Coaché",
    session: "Séance de coaching",
    teamSession: "Coaching d'équipe",
    template: "Modèle de coaching",
    en: "Coaching",
    enRole1: "Coach",
    enRole2: "Coachee",
    enSession: "Coaching session",
    enTeam: "Team coaching session / Group coaching",
    enOk: true,
  },
  "Projet d'agences": {
    role1: "Inspecteur réseau / Responsable réseau",
    role2: "Agent / Partenaire",
    session: "Réunion d'inspection / Point de développement",
    teamSession: "Réunion réseau",
    template: "Modèle projet agences",
    en: "Network review",
    enRole1: "Network manager / Field inspector",
    enRole2: "Agent / Partner",
    enSession: "Network review / Partner session",
    enTeam: "Network meeting",
    enOk: false,
  },
  "Succès": {
    role1: "Manager",
    role2: "Collaborateur",
    session: "Session Succès",
    teamSession: "Session Succès d'équipe",
    template: "Modèle de succès",
    en: "Success session",
    enRole1: "Manager",
    enRole2: "Member",
    enSession: "Success session",
    enTeam: "Team success session",
    enOk: false,
  },
  "Échanges": {
    role1: "Animateur",
    role2: "Participant",
    session: "Échange individuel",
    teamSession: "Échange d'équipe",
    template: "Modèle d'échange",
    en: "Exchange session / Dialogue session",
    enRole1: "Facilitator",
    enRole2: "Participant",
    enSession: "Exchange session",
    enTeam: "Group exchange",
    enOk: false,
  },
  "Suivis": {
    role1: "Manager",
    role2: "Collaborateur",
    session: "Point de suivi",
    teamSession: "Réunion de suivi",
    template: "Modèle de suivi",
    en: "Check-in",
    enRole1: "Manager",
    enRole2: "Team member",
    enSession: "Check-in",
    enTeam: "Team check-in",
    enOk: true,
  },
  "Revue": {
    role1: "Responsable",
    role2: "Collaborateur",
    session: "Revue individuelle",
    teamSession: "Revue d'équipe",
    template: "Modèle de revue",
    en: "Review",
    enRole1: "Manager",
    enRole2: "Contributor",
    enSession: "Review / Individual review",
    enTeam: "Team review",
    enOk: true,
  },
  "Check-in": {
    role1: "Manager",
    role2: "Collaborateur / Membre",
    session: "Check-in individuel",
    teamSession: "Check-in d'équipe",
    template: "Modèle check-in",
    en: "Check-in",
    enRole1: "Manager",
    enRole2: "Team member / Direct report",
    enSession: "Check-in / Individual check-in",
    enTeam: "Team check-in",
    enOk: true,
  },
  "Conversations": {
    role1: "Manager",
    role2: "Collaborateur",
    session: "Conversation individuelle",
    teamSession: "Conversation d'équipe",
    template: "Modèle de conversation",
    en: "Conversation",
    enRole1: "Manager",
    enRole2: "Employee",
    enSession: "1-on-1 conversation / Individual conversation",
    enTeam: "Team conversation",
    enOk: false,
  },
  "Entretiens individuels": {
    role1: "Manager",
    role2: "Collaborateur / Direct report",
    session: "Entretien individuel",
    teamSession: "Réunion d'équipe",
    template: "Modèle d'entretien",
    en: "Meetings",
    enRole1: "Manager",
    enRole2: "Direct report / Team member",
    enSession: "Meeting / 1-on-1 meeting",
    enTeam: "Team meeting",
    enOk: true,
  },
  "Animation": {
    role1: "Animateur",
    role2: "Participant",
    session: "Session d'animation / Point d'animation",
    teamSession: "Animation d'équipe",
    template: "Modèle d'animation",
    en: "Facilitation",
    enRole1: "Facilitator",
    enRole2: "Participant",
    enSession: "Facilitation session / Guided session",
    enTeam: "Team facilitation / Workshop",
    enOk: false,
  },
};



// ─── Types ────────────────────────────────────────────────────────────────────

type Zone = "preferred" | "acceptable" | "rejected";
type GroupSort = { preferred: string[]; acceptable: string[]; rejected: string[] };
type SortState  = { [gid: string]: GroupSort };
// scores[gid][term][cid] = score 1-5
type ScoreState = { [gid: string]: { [term: string]: { [cid: string]: number } } };
type VoteState  = { [gid: string]: string[] };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initSort(): SortState {
  const r: SortState = {};
  for (const g of GROUPS) r[g.id] = { preferred: [], acceptable: [], rejected: [] };
  return r;
}

function initScores(): ScoreState {
  const r: ScoreState = {};
  for (const g of GROUPS) {
    r[g.id] = {};
    for (const t of TERMS) {
      r[g.id][t] = {};
      for (const cr of CRITERIA) r[g.id][t][cr.id] = 3;
    }
  }
  return r;
}

// A group has "scored" if at least one criterion differs from default (3)
function groupHasScored(scores: ScoreState, gid: string, term: string): boolean {
  return CRITERIA.some(cr => (scores[gid]?.[term]?.[cr.id] ?? 3) !== 3);
}

// Average score across ACTIVE groups that have actually scored
function avgScore(scores: ScoreState, term: string, cid: string, activeGroupIds: string[]): number {
  const active = activeGroupIds.filter(gid => groupHasScored(scores, gid, term));
  if (active.length === 0) return 3;
  const vals = active.map(gid => scores[gid]?.[term]?.[cid] ?? 3);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

// Weighted score using averages from active groups only
function avgWeightedLive(scores: ScoreState, weights: {[id:string]:number}, term: string, activeGroupIds: string[]): number {
  return CRITERIA.reduce((s, cr) => s + avgScore(scores, term, cr.id, activeGroupIds) * ((weights[cr.id] ?? cr.weight) / 100), 0);
}

// Count how many active groups have scored a term
function activeGroupCount(scores: ScoreState, term: string, activeGroupIds: string[]): number {
  return activeGroupIds.filter(gid => groupHasScored(scores, gid, term)).length;
}

function initVotes(): VoteState {
  const r: VoteState = {};
  for (const g of GROUPS) r[g.id] = [];
  return r;
}

function calcWeighted(ts: { [k: string]: number }): number {
  return CRITERIA.reduce((s, c) => s + (ts[c.id] ?? 3) * (c.weight / 100), 0);
}

function getZone(gs: GroupSort, term: string): Zone | null {
  if (gs.preferred.includes(term))  return "preferred";
  if (gs.acceptable.includes(term)) return "acceptable";
  if (gs.rejected.includes(term))   return "rejected";
  return null;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StepHeader({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="mb-8">
      <p className="text-[11px] font-mono text-gray-400 uppercase tracking-widest mb-1">
        Étape {n} / 4
      </p>
      <h2 className="text-2xl font-bold mb-1">{title}</h2>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}

function ScoreSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-5 h-5 rounded-full text-[10px] font-bold transition-all hover:scale-110 ${
            n === value ? "bg-[#0E0E12] text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

// ─── Profile Drawer ───────────────────────────────────────────────────────────

function ProfileDrawer({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState(GROUPS[0].id);
  const g = GROUPS.find(x => x.id === active)!;
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md h-full shadow-2xl overflow-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-black/[0.08] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">Profils clients</p>
            <h2 className="text-base font-bold">Cas d'usage par groupe</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Group tabs */}
        <div className="flex gap-1.5 px-5 pt-4 pb-2 flex-wrap">
          {GROUPS.map(gr => (
            <button
              key={gr.id}
              onClick={() => setActive(gr.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
              style={
                active === gr.id
                  ? { backgroundColor: gr.color, color: "#fff", borderColor: gr.color }
                  : { backgroundColor: gr.light, color: gr.color, borderColor: "transparent" }
              }
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={active === gr.id ? { backgroundColor: "rgba(255,255,255,0.25)" } : { backgroundColor: gr.color, color: "#fff" }}
              >
                {gr.short}
              </span>
              {gr.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-4 space-y-4">
          {/* Role */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">Rôle</p>
            <p className="text-sm font-semibold" style={{ color: g.color }}>{g.role}</p>
          </div>

          {/* Clients */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5">Clients Incenteev</p>
            <div className="flex flex-wrap gap-1.5">
              {g.clients.split(" · ").map(cl => (
                <span
                  key={cl}
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: g.light, color: g.color }}
                >
                  {cl}
                </span>
              ))}
            </div>
          </div>

          {/* Use case */}
          <div className="rounded-xl p-4" style={{ backgroundColor: g.light }}>
            <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: g.color }}>Cas d'usage — Comment ce profil utilise le Coaching</p>
            <p className="text-sm text-gray-700 leading-relaxed">{g.usecase}</p>
          </div>

          {/* Tension */}
          <div className="rounded-xl border-2 p-4" style={{ borderColor: g.color + "40" }}>
            <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: g.color }}>⚡ Tension terminologique</p>
            <p className="text-sm text-gray-700 leading-relaxed">{g.tension}</p>
          </div>

          {/* Question */}
          <div className="rounded-xl bg-gray-900 p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">La question à répondre</p>
            <p className="text-sm text-white leading-relaxed font-medium">
              {active === "dc" && "Dans votre quotidien de manager commercial, quel mot décrit le mieux ces sessions individuelles avec vos commerciaux ?"}
              {active === "dr" && "Pour des sessions avec des agents indépendants — sans lien hiérarchique — quel terme serait accepté naturellement par les deux parties ?"}
              {active === "mt" && "Sur le terrain, au quotidien, quel mot utilisent naturellement les managers et leurs commerciaux pour ces points de suivi ?"}
              {active === "rh" && "Quel terme utiliseriez-vous dans une convention de formation ou un dossier Qualiopi — sans avoir à le mettre entre guillemets ?"}
              {active === "of" && "Dans un catalogue pédagogique ou un dossier Qualiopi, quel terme utiliseriez-vous pour ces sessions de suivi individuel ?"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Guide Modal ──────────────────────────────────────────────────────────────

function GuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-black/[0.08] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">Document animateur</p>
            <h2 className="text-lg font-bold">Guide de l'atelier · 90 min</h2>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => window.print()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Imprimer"
            >
              <Printer size={15} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-8 text-sm">
          <section>
            <h3 className="font-bold text-base mb-2">Objectif</h3>
            <p className="text-gray-600 leading-relaxed">
              Choisir collectivement le terme le plus pertinent pour remplacer le mot "coaching"
              dans votre contexte professionnel, en intégrant les perspectives de toutes les
              parties prenantes.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-4">Déroulé — 90 minutes</h3>
            <div className="space-y-4">
              {[
                { time: "00–05", title: "Introduction", desc: "Présentez le contexte, les 10 termes candidats et les 5 groupes participants." },
                { time: "05–25", title: "Card Sorting · 20 min", desc: "Chaque groupe classe les termes en 3 catégories : Préféré / Acceptable / Rejeté. Les groupes travaillent simultanément ou en alternance sur l'application." },
                { time: "25–40", title: "Restitution · 15 min", desc: "Affichez la synthèse. Animez une discussion sur les convergences et divergences. Notez les verbatims." },
                { time: "40–60", title: "Matrice de Scoring · 20 min", desc: "Vote collectif ou par groupe sur les 5 critères pondérés. Expliquez les pondérations avant de commencer." },
                { time: "60–80", title: "Dot Voting · 20 min", desc: "Chaque groupe dispose de 3 votes à répartir librement. Les scores pondérés sont masqués pendant la phase de vote." },
                { time: "80–90", title: "Révélation & décision · 10 min", desc: "Révélez les résultats combinés. Facilitez le consensus et documentez la décision finale." },
              ].map(s => (
                <div key={s.time} className="flex gap-4">
                  <span className="font-mono text-xs text-gray-300 pt-0.5 w-12 flex-shrink-0">{s.time}</span>
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-base mb-3">Les 5 critères de scoring</h3>
            <div className="space-y-4">
              {CRITERIA.map(cr => (
                <div key={cr.id} className="border-l-2 border-gray-200 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-md flex-shrink-0">{cr.weight}%</span>
                    <span className="font-semibold">{cr.name}</span>
                  </div>
                  <p className="text-gray-500 text-xs mb-1">{cr.why}</p>
                  <p className="text-gray-400 text-xs italic">{cr.examples}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700">
              <strong>Lien avec le Système complet :</strong> le tableau des dérivés (étape 3) alimente directement le critère Scalabilité. Si Accompagnateur / Accompagné sonnent faux pour plusieurs groupes → baisser le score Scalabilité de ce terme.
            </div>
          </section>

          <section>
            <h3 className="font-bold text-base mb-3">Groupes participants</h3>
            <div className="grid gap-2">
              {GROUPS.map(g => (
                <div
                  key={g.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: g.light }}
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: g.color }}
                  >
                    {g.short}
                  </span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: g.color }}>{g.name}</p>
                    <p className="text-xs text-gray-500">{MAX_VOTES} votes disponibles · Card sorting individuel</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-base mb-3">Conseils d'animation</h3>
            <ul className="space-y-2 text-gray-600">
              {[
                "Encouragez les groupes à discuter avant de classer — les débats sont aussi riches que les votes",
                "Sur la restitution, notez les verbatims qui expliquent les divergences entre groupes",
                "Pour le scoring, vous pouvez ajuster les pondérations selon les priorités de votre organisation",
                "Le dot voting est indépendant du scoring — les deux perspectives enrichissent la décision",
                "Si le consensus est difficile, proposez une période de test avec 2 termes finalistes",
              ].map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gray-300 flex-shrink-0">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Intro Step ───────────────────────────────────────────────────────────────

function IntroStep({ onStart }: { onStart: (activeIds: string[]) => void }) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>(GROUPS.map(g => g.id));

  function toggleGroup(id: string) {
    setSelectedGroups(prev =>
      prev.includes(id)
        ? prev.length > 2 ? prev.filter(g => g !== id) : prev // minimum 2 groups
        : [...prev, id]
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-8 pb-20">
      <div className="mb-10">
        <p className="text-[11px] font-mono text-gray-400 uppercase tracking-widest mb-3">
          Naming Workshop · 90 min
        </p>
        <h2 className="text-4xl font-bold mb-4 leading-tight">
          Quel terme pour<br />
          remplacer <span className="text-gray-300 italic not-italic">Coaching</span> ?
        </h2>
        <p className="text-gray-500 text-base leading-relaxed">
          Un atelier collaboratif structuré pour choisir collectivement la meilleure
          terminologie avec toutes vos parties prenantes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-10">
        {[
          { num: "01", title: "Card Sorting",    time: "20 min", desc: "Classez les termes par préférence (Préféré / Acceptable / Rejeté)" },
          { num: "02", title: "Restitution",     time: "15 min", desc: "Analysez les convergences et divergences entre groupes" },
          { num: "03", title: "Scoring",         time: "20 min", desc: "Évaluez sur 5 critères pondérés pour objectiver le choix" },
          { num: "04", title: "Dot Voting",      time: "20 min", desc: "Votez collectivement pour le terme final" },
        ].map(s => (
          <div key={s.num} className="bg-white rounded-xl p-5 border border-black/[0.08]">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[11px] font-mono text-gray-300">{s.num}</span>
              <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{s.time}</span>
            </div>
            <p className="font-semibold mb-1.5 text-sm">{s.title}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Group selection */}
      <div className="mb-10">
        <p className="text-[11px] font-mono text-gray-400 uppercase tracking-widest mb-1">
          Groupes présents aujourd'hui
        </p>
        <p className="text-xs text-gray-400 mb-4">Sélectionnez les groupes qui participent à cet atelier. La majorité sera calculée sur ces groupes uniquement.</p>
        <div className="flex flex-col gap-2">
          {GROUPS.map(g => {
            const active = selectedGroups.includes(g.id);
            return (
              <button
                key={g.id}
                onClick={() => toggleGroup(g.id)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: active ? g.color : "rgba(0,0,0,0.08)",
                  backgroundColor: active ? g.light : "#fff",
                }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 transition-all"
                  style={{ backgroundColor: active ? g.color : "#D1D5DB" }}
                >
                  {active ? "✓" : g.short}
                </span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: active ? g.color : "#6B7280" }}>{g.name}</p>
                  <p className="text-xs text-gray-400">{g.role}</p>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {selectedGroups.length} groupe{selectedGroups.length > 1 ? "s" : ""} sélectionné{selectedGroups.length > 1 ? "s" : ""} · minimum 2
        </p>
      </div>

      <button
        onClick={() => onStart(selectedGroups)}
        disabled={selectedGroups.length < 2}
        className="bg-[#0E0E12] text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Démarrer l'atelier →
      </button>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

// ─── Workshop shared state type ───────────────────────────────────────────────
type WorkshopState = {
  step: number;
  activeGroups: string[];
  sort: SortState;
  scores: ScoreState;
  votes: VoteState;
  weights: { [id: string]: number };
  systemEdits: { [term: string]: { role1: string; role2: string; session: string; teamSession: string; template: string; en: string; enRole1: string; enRole2: string; enSession: string; enTeam: string; enOk: boolean } };
  systemGroupOk: { [gid: string]: { [term: string]: boolean } };
  systemGroupEnOk: { [gid: string]: { [term: string]: boolean } };
  selectedFinal: string[];
};

function defaultWorkshopState(): WorkshopState {
  return {
    step: 0,
    activeGroups: GROUPS.map(g => g.id),
    sort: initSort(),
    scores: initScores(),
    votes: initVotes(),
    weights: Object.fromEntries(CRITERIA.map(c => [c.id, c.weight])),
    systemEdits: {},
    systemGroupOk: {},
    systemGroupEnOk: {},
    selectedFinal: [],
  };
}

export default function App() {
  // ── Local UI state (not synced) ──
  const [sortGroup, setSortGroup] = useState(GROUPS[0].id);
  const [voteGroup, setVoteGroup] = useState(GROUPS[0].id);
  const [showScores, setShowScores]     = useState(false);
  const [showGuide, setShowGuide]       = useState(false);
  const [showProfiles, setShowProfiles] = useState(false);
  const [activeScoreGroup, setActiveScoreGroup] = useState<string>("central");
  const [weightsError, setWeightsError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);

  // ── Shared state (synced via Supabase) ──
  const [ws, setWs] = useState<WorkshopState>(defaultWorkshopState());
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Shorthand accessors
  const step          = ws.step;
  const sort          = ws.sort;
  const scores        = ws.scores;
  const votes         = ws.votes;
  const weights       = ws.weights;
  const activeGroups  = ws.activeGroups;
  const selectedFinal = ws.selectedFinal;
  const systemEdits   = ws.systemEdits;
  const systemGroupOk    = ws.systemGroupOk;
  const systemGroupEnOk  = ws.systemGroupEnOk;

  // ── Load + subscribe ──────────────────────────────────────────────────────
  useEffect(() => {
    // Initial load
    supabase
      .from("workshop_state")
      .select("state")
      .eq("key", WORKSHOP_KEY)
      .single()
      .then(({ data, error }) => {
        if (data?.state) {
          setWs({ ...defaultWorkshopState(), ...data.state });
        } else if (error?.code === "PGRST116") {
          // Row doesn't exist yet — create it
          supabase.from("workshop_state").insert({ key: WORKSHOP_KEY, state: defaultWorkshopState() }).then();
        }
        setConnected(true);
      });

    // Realtime subscription
    const channel = supabase
      .channel("workshop")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "workshop_state", filter: `key=eq.${WORKSHOP_KEY}` },
        (payload) => {
          if (payload.new?.state) {
            setWs(prev => ({ ...prev, ...payload.new.state }));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Push changes to Supabase (debounced 400ms) ──────────────────────────
  function pushState(next: WorkshopState) {
    setWs(next);
    setSyncing(true);
    if (pendingRef.current) clearTimeout(pendingRef.current);
    pendingRef.current = setTimeout(async () => {
      await supabase.from("workshop_state").upsert({ key: WORKSHOP_KEY, state: next });
      setSyncing(false);
    }, 400);
  }

  // ── Setters that go through pushState ────────────────────────────────────
  function setStep(v: number)          { pushState({ ...ws, step: v }); }
  function setSort(v: SortState)       { pushState({ ...ws, sort: v }); }
  function setScores(v: ScoreState)    { pushState({ ...ws, scores: v }); }
  function setVotes(v: VoteState)      { pushState({ ...ws, votes: v }); }
  function setWeights(v: { [id: string]: number }) { pushState({ ...ws, weights: v }); }
  function setActiveGroups(v: string[]) { pushState({ ...ws, activeGroups: v }); }
  function setSelectedFinal(v: string[]) { pushState({ ...ws, selectedFinal: v }); }

  // ── Ok toggles ────────────────────────────────────────────────────────────
  function toggleGroupOk(gid: string, term: string) {
    const next = { ...ws.systemGroupOk, [gid]: { ...ws.systemGroupOk[gid], [term]: !(ws.systemGroupOk[gid]?.[term] ?? true) } };
    pushState({ ...ws, systemGroupOk: next });
  }
  function getGroupOk(gid: string, term: string): boolean {
    return systemGroupOk[gid]?.[term] ?? true;
  }
  function getCentralOkVerdict(term: string): "ok" | "ko" | "discuss" {
    const v = activeGroups.map(gid => getGroupOk(gid, term));
    const ok = v.filter(Boolean).length, ko = v.length - ok;
    return ok > ko ? "ok" : ko > ok ? "ko" : "discuss";
  }

  function toggleGroupEnOk(gid: string, term: string) {
    const next = { ...ws.systemGroupEnOk, [gid]: { ...ws.systemGroupEnOk[gid], [term]: !(ws.systemGroupEnOk[gid]?.[term] ?? true) } };
    pushState({ ...ws, systemGroupEnOk: next });
  }
  function getGroupEnOk(gid: string, term: string): boolean {
    return systemGroupEnOk[gid]?.[term] ?? true;
  }
  function getCentralEnOkVerdict(term: string): "ok" | "ko" | "discuss" {
    const v = activeGroups.map(gid => getGroupEnOk(gid, term));
    const ok = v.filter(Boolean).length, ko = v.length - ok;
    return ok > ko ? "ok" : ko > ok ? "ko" : "discuss";
  }

  // ── System edits ──────────────────────────────────────────────────────────
  function getSystemRow(term: string) {
    return systemEdits[term] ?? SYSTEM_COMPLETE[term] ?? { role1: "", role2: "", session: "", teamSession: "", template: "", en: "", enRole1: "", enRole2: "", enSession: "", enTeam: "", enOk: false };
  }
  function updateSystemField(term: string, field: string, value: string) {
    const current = getSystemRow(term);
    const next = { ...ws.systemEdits, [term]: { ...current, [field]: field === 'enOk' ? value === 'true' : value } };
    pushState({ ...ws, systemEdits: next });
  }

  // ── Weights ───────────────────────────────────────────────────────────────
  function handleWeightChange(id: string, val: string) {
    const n = parseInt(val) || 0;
    const next = { ...weights, [id]: n };
    const total = Object.values(next).reduce((a, b) => a + b, 0);
    setWeights(next);
    setWeightsError(total !== 100 ? `Total : ${total}% — doit être égal à 100%` : null);
  }

  // ── Loading screen moved to render ──

  // Per-group weighted score
  function calcWeightedGroup(gid: string, term: string): number {
    return CRITERIA.reduce((s, cr) => s + (scores[gid]?.[term]?.[cr.id] ?? 3) * ((weights[cr.id] ?? cr.weight) / 100), 0);
  }

  // Global weighted score = average across active groups only
  function calcWeightedLive(term: string): number {
    return avgWeightedLive(scores, weights, term, activeGroups);
  }

  // Active group count for a term (only among selected groups)
  function calcActiveGroupCount(term: string): number {
    return activeGroupCount(scores, term, activeGroups);
  }

  // Drag state
  const [dragTerm, setDragTerm]       = useState<string | null>(null);
  const [dragFrom, setDragFrom]       = useState<Zone | "pool" | null>(null);
  const [dragOverZone, setDragOverZone] = useState<Zone | "pool" | null>(null);

  // Click-to-select state (mobile / accessibility fallback)
  const [selTerm, setSelTerm] = useState<string | null>(null);
  const [selFrom, setSelFrom] = useState<Zone | "pool" | null>(null);

  const curSort = sort[sortGroup];
  const curG    = GROUPS.find(g => g.id === sortGroup)!;
  const pool    = TERMS.filter(
    t => !curSort.preferred.includes(t) &&
         !curSort.acceptable.includes(t) &&
         !curSort.rejected.includes(t)
  );

  function moveTerm(term: string, from: Zone | "pool", to: Zone | "pool") {
    const prev = sort;
    const gs = { ...prev[sortGroup], ...Object.fromEntries(
      (["preferred", "acceptable", "rejected"] as Zone[]).map(z => [z, [...prev[sortGroup][z]]])
    ) };
    if (from !== "pool") gs[from] = gs[from].filter(t => t !== term);
    if (to !== "pool" && !gs[to].includes(term)) gs[to] = [...gs[to], term];
    setSort({ ...prev, [sortGroup]: gs });
  }

  function handleDrop(toZone: Zone | "pool") {
    if (dragTerm && dragFrom !== null) moveTerm(dragTerm, dragFrom, toZone);
    setDragTerm(null);
    setDragFrom(null);
    setDragOverZone(null);
  }

  function handleTermClick(term: string, from: Zone | "pool") {
    if (selTerm === term) {
      setSelTerm(null);
      setSelFrom(null);
    } else {
      setSelTerm(term);
      setSelFrom(from);
    }
  }

  function handleZoneClick(zone: Zone | "pool") {
    if (selTerm !== null && selFrom !== null) {
      moveTerm(selTerm, selFrom, zone);
      setSelTerm(null);
      setSelFrom(null);
    }
  }

  // Add 1 vote to term (allows multiple votes on same term), remove 1 on right-click
  function addVote(gid: string, term: string) {
    const cur = votes[gid] ?? [];
    if (cur.length >= MAX_VOTES) return;
    setVotes({ ...votes, [gid]: [...cur, term] });
  }

  function removeVote(gid: string, term: string) {
    const cur = [...(votes[gid] ?? [])];
    const idx = cur.lastIndexOf(term);
    if (idx === -1) return;
    cur.splice(idx, 1);
    setVotes({ ...votes, [gid]: cur });
  }

  function toggleVote(gid: string, term: string) {
    addVote(gid, term);
  }

  const voteCount = (gid: string, term: string) =>
    votes[gid].filter(t => t === term).length;

  const totalVotes = (term: string) =>
    activeGroups.reduce((s, gid) => s + (votes[gid]?.filter(t => t === term).length ?? 0), 0);

  const stepLabels = ["Card Sorting", "Restitution", "Système", "Scoring", "Dot Voting", "Résultats"];

  // ── Render ──

  if (!connected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Connexion à l'atelier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-black/[0.08]">
        <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
          <button
            onClick={() => setStep(0)}
            className="flex flex-col leading-none hover:opacity-70 transition-opacity text-left"
          >
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
              Naming Workshop
            </span>
            <span className="text-sm font-bold">Coaching → ?</span>
          </button>

          <nav className="hidden md:flex items-center gap-0.5">
            {stepLabels.map((label, i) => (
              <button
                key={label}
                onClick={() => setStep(i + 1)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  step === i + 1
                    ? "bg-[#0E0E12] text-white"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                <span className="text-[10px] font-mono opacity-50">{i + 1}</span>
                {label}
                {step > i + 1 && <Check size={11} className="text-green-500" />}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Sync indicator */}
            <div className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full transition-all ${syncing ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${syncing ? "bg-amber-400 animate-pulse" : "bg-green-500"}`} />
              {syncing ? "Sync..." : "En direct"}
            </div>
            <button
              onClick={() => setShowProfiles(true)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 font-medium"
            >
              <span className="text-base">👥</span>
              <span className="hidden sm:inline">Profils</span>
            </button>
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 font-medium"
            >
              <BookOpen size={14} />
              <span className="hidden sm:inline">Guide</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-5 py-8">

        {/* ── Step 0: Intro ── */}
        {step === 0 && <IntroStep onStart={(ids) => { setActiveGroups(ids); setStep(1); }} />}

        {/* ── Step 1: Card Sorting ── */}
        {step === 1 && (
          <div>
            <StepHeader
              n={1}
              title="Card Sorting"
              desc="Sélectionnez un groupe, puis glissez dans Préféré les termes qui correspondent à ce profil — ou cliquez pour sélectionner puis cliquez la zone."
            />

            {/* Group tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {GROUPS.filter(g => activeGroups.includes(g.id)).map(g => {
                const placed = sort[g.id].preferred.length + sort[g.id].acceptable.length + sort[g.id].rejected.length;
                const active = sortGroup === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => { setSortGroup(g.id); setSelTerm(null); setSelFrom(null); }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      active ? "text-white border-transparent shadow-sm" : "bg-white border-black/[0.08] text-gray-600 hover:border-gray-300"
                    }`}
                    style={active ? { backgroundColor: g.color } : {}}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={
                        active
                          ? { backgroundColor: "rgba(255,255,255,0.25)", color: "white" }
                          : { backgroundColor: g.light, color: g.color }
                      }
                    >
                      {g.short}
                    </span>
                    <span className="hidden sm:inline">{g.name}</span>
                    <span className="sm:hidden">{g.short}</span>
                    {placed > 0 && (
                      <span className={`text-[10px] font-mono ${active ? "text-white/60" : "text-gray-400"}`}>
                        {placed}/10
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Pool */}
            <div className="mb-5">
              <p className="text-[11px] font-mono text-gray-400 uppercase tracking-widest mb-2">
                Termes disponibles ({pool.length}) — glissez-les dans Préféré
                {selTerm !== null && (
                  <span className="ml-3 normal-case font-sans text-[#2563EB] text-xs not-italic">
                    → Cliquez une catégorie pour placer "{selTerm}"
                  </span>
                )}
              </p>
              <div
                className={`min-h-14 bg-white rounded-xl border-2 p-3 flex flex-wrap gap-2 transition-all cursor-pointer ${
                  dragOverZone === "pool" ? "border-gray-400 bg-gray-50" : "border-dashed border-gray-200"
                }`}
                onDragOver={e => { e.preventDefault(); setDragOverZone("pool"); }}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={() => handleDrop("pool")}
                onClick={() => handleZoneClick("pool")}
              >
                {pool.length === 0 && (
                  <p className="text-xs text-gray-300 m-auto">Tous les termes ont été classés ✓</p>
                )}
                {pool.map(term => {
                  const src = TERMS_BY_SOURCE.terrain.find(x => x.term === term) ? { label: "Terrain", color: "#16A34A" }
                            : TERMS_BY_SOURCE.ceo.find(x => x.term === term)     ? { label: "CEO",     color: "#2563EB" }
                            : { label: "Concurrent", color: "#7C3AED" };
                  const meta = [...TERMS_BY_SOURCE.terrain, ...TERMS_BY_SOURCE.ceo, ...TERMS_BY_SOURCE.concurrent].find(x => x.term === term);
                  return (
                    <div
                      key={term}
                      draggable
                      onDragStart={() => { setDragTerm(term); setDragFrom("pool"); }}
                      onDragEnd={() => { setDragTerm(null); setDragFrom(null); setDragOverZone(null); }}
                      onClick={e => { e.stopPropagation(); handleTermClick(term, "pool"); }}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium cursor-grab active:cursor-grabbing select-none transition-all ${
                        selTerm === term
                          ? "border-[#2563EB] bg-[#DBEAFE] text-[#2563EB] scale-105"
                          : dragTerm === term
                          ? "opacity-40 scale-95 border-gray-200 bg-white"
                          : "bg-white border-black/[0.08] hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ backgroundColor: src.color + "22", color: src.color }}>{src.label}</span>
                        {term}
                        {meta && <span className="text-[9px] text-gray-300 hidden sm:inline">{meta.note}</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drop zones */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              {(
                [
                  { zone: "preferred" as Zone, label: "Préféré", hint: "termes choisis pour ce profil", accent: "#16A34A" },
                ] as const
              ).map(({ zone, label, hint, accent }) => {
                const terms  = curSort[zone];
                const isOver = dragOverZone === zone;
                const isTarget = selTerm !== null && selFrom !== zone;
                return (
                  <div key={zone} className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold">{label}</span>
                      <span className="text-xs text-gray-400">{hint}</span>
                      <span className="ml-auto text-xs font-mono text-gray-300">{terms.length}</span>
                    </div>
                    <div
                      className={`flex-1 min-h-40 rounded-xl border-2 p-3 flex flex-col gap-2 transition-all cursor-pointer ${
                        isOver ? "scale-[1.01]" : ""
                      }`}
                      style={{
                        borderColor:     isOver || isTarget ? accent : "rgba(0,0,0,0.08)",
                        borderStyle:     terms.length === 0 ? "dashed" : "solid",
                        backgroundColor: isOver
                          ? `${accent}12`
                          : isTarget
                          ? `${accent}06`
                          : "white",
                      }}
                      onDragOver={e => { e.preventDefault(); setDragOverZone(zone); }}
                      onDragLeave={() => setDragOverZone(null)}
                      onDrop={() => handleDrop(zone)}
                      onClick={() => handleZoneClick(zone)}
                    >
                      {terms.length === 0 && (
                        <p className="text-xs text-gray-300 m-auto text-center select-none">
                          {isTarget ? "Cliquer pour placer ici" : "Glissez des termes ici"}
                        </p>
                      )}
                      {terms.map(term => (
                        <div
                          key={term}
                          draggable
                          onDragStart={() => { setDragTerm(term); setDragFrom(zone); }}
                          onDragEnd={() => { setDragTerm(null); setDragFrom(null); setDragOverZone(null); }}
                          onClick={e => { e.stopPropagation(); handleTermClick(term, zone); }}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium cursor-grab active:cursor-grabbing select-none transition-all ${
                            selTerm === term
                              ? "scale-105 shadow-sm"
                              : dragTerm === term
                              ? "opacity-40 scale-95 border-transparent bg-white"
                              : "bg-white hover:shadow-sm"
                          }`}
                          style={
                            selTerm === term
                              ? { borderColor: curG.color, backgroundColor: curG.light, color: curG.color }
                              : { borderColor: "rgba(0,0,0,0.08)" }
                          }
                        >
                          {term}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="bg-[#0E0E12] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Voir la restitution →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Restitution ── */}
        {step === 2 && (
          <div>
            <StepHeader n={2} title="Restitution" desc="Synthèse des préférences par groupe de profil." />

            <div className="bg-white rounded-2xl border border-black/[0.08] overflow-hidden mb-6">
              {/* ── Group / Central switcher ── */}
              <div className="px-4 py-3 border-b border-black/[0.06] bg-gray-50 flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveScoreGroup("central")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "1.5px solid",
                    cursor: "pointer",
                    backgroundColor: activeScoreGroup === "central" ? "#111827" : "#fff",
                    color: activeScoreGroup === "central" ? "#fff" : "#6B7280",
                    borderColor: activeScoreGroup === "central" ? "#111827" : "#E5E7EB",
                  }}
                >
                  Vue centrale (moyennes)
                </button>
                {GROUPS.filter(g => activeGroups.includes(g.id)).map(g => (
                  <button
                    key={g.id}
                    onClick={() => setActiveScoreGroup(g.id)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      border: "1.5px solid transparent",
                      cursor: "pointer",
                      backgroundColor: activeScoreGroup === g.id ? g.color : g.light,
                      color: activeScoreGroup === g.id ? "#fff" : g.color,
                    }}
                  >
                    {g.short} — {g.name}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/[0.07]">
                      <th className="text-left px-5 py-3 text-[11px] font-mono uppercase tracking-widest text-gray-400">
                        Terme
                      </th>
                      {GROUPS.filter(g => activeGroups.includes(g.id)).map(g => (
                        <th key={g.id} className="px-4 py-3 text-center">
                          <span className="text-xs font-bold" style={{ color: g.color }}>
                            {g.short}
                          </span>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-[11px] font-mono uppercase tracking-widest text-gray-400">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...TERMS]
                      .filter(t => activeGroups.some(gid => getZone(sort[gid], t) === "preferred"))
                      .sort((a, b) => {
                        const sc = (t: string) =>
                          activeGroups.reduce(
                            (s, gid) => s + (getZone(sort[gid], t) === "preferred" ? 1 : 0),
                            0
                          );
                        return sc(b) - sc(a);
                      })
                      .map(term => {
                        const score = activeGroups.reduce(
                          (s, gid) =>
                            s + (getZone(sort[gid], term) === "preferred" ? 1 : 0),
                          0
                        );
                        return (
                          <tr
                            key={term}
                            className="border-b border-black/[0.04] last:border-0 hover:bg-gray-50/60 transition-colors"
                          >
                            <td className="px-5 py-3 font-medium">{term}</td>
                            {GROUPS.filter(g => activeGroups.includes(g.id)).map(g => {
                              const z = getZone(sort[g.id], term);
                              return (
                                <td key={g.id} className="px-4 py-3 text-center">
                                  {z === "preferred" ? (
                                    <span
                                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-white"
                                      style={{ backgroundColor: g.color }}
                                    >
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="text-gray-200 text-xs">—</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`text-sm font-mono font-bold ${
                                  score > 0
                                    ? "text-green-600"
                                    : score < 0
                                    ? "text-red-400"
                                    : "text-gray-300"
                                }`}
                              >
                                {score > 0 ? `+${score}` : score}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 text-xs text-gray-500 mb-8 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#16A34A] inline-flex items-center justify-center text-[9px] font-bold text-white">✓</span>
                Terme choisi par ce groupe
              </span>
              <span className="text-gray-400">Score = nombre de groupes ayant choisi ce terme (max {GROUPS.length})</span>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-black/[0.1] hover:bg-gray-100 transition-colors"
              >
                ← Retour
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-[#0E0E12] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Système complet →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Scoring ── */}
        {step === 4 && (
          <div>
            <StepHeader
              n={4}
              title="Matrice de Scoring"
              desc="Évaluez chaque terme de 1 à 5 sur les critères pondérés — collectivement ou par groupe."
            />

            {/* ── Recap Système Complet FR + EN ── */}
            <details className="bg-white rounded-2xl border border-black/[0.08] overflow-hidden mb-5" open>
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold">📋 Rappel — Système complet FR &amp; EN</p>
                  <p className="text-xs text-gray-400 mt-0.5">Utilisez ce rappel pour évaluer le critère Scalabilité &amp; Traductibilité</p>
                </div>
                <span className="text-gray-300 text-xs group-open:rotate-180 transition-transform inline-block ml-1">▼</span>
              </summary>
              <div className="border-t border-black/[0.06]">
                {/* FR */}
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">🇫🇷 Système FR</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-black/[0.06]">
                        <th className="text-left px-4 py-2 font-mono uppercase tracking-widest text-gray-400 text-[10px]">Terme</th>
                        <th className="text-left px-3 py-2 font-mono uppercase tracking-widest text-gray-400 text-[10px]">Coach</th>
                        <th className="text-left px-3 py-2 font-mono uppercase tracking-widest text-gray-400 text-[10px]">Coaché</th>
                        <th className="text-left px-3 py-2 font-mono uppercase tracking-widest text-gray-400 text-[10px]">Coaching Session</th>
                        <th className="text-left px-3 py-2 font-mono uppercase tracking-widest text-gray-400 text-[10px]">Team Meeting</th>
                        <th className="text-center px-3 py-2 font-mono uppercase tracking-widest text-gray-400 text-[10px]">Verdict</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TERMS.filter(t => activeGroups.some(gid => getZone(sort[gid], t) === "preferred")).map((term, i) => {
                        const sys = getSystemRow(term);
                        const verdict = getCentralOkVerdict(term);
                        return (
                          <tr key={term} className={`border-b border-black/[0.04] last:border-0 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                            <td className="px-4 py-2 font-semibold text-gray-800">{term}</td>
                            <td className="px-3 py-2 text-gray-600">{sys.role1 || "—"}</td>
                            <td className="px-3 py-2 text-gray-600">{sys.role2 || "—"}</td>
                            <td className="px-3 py-2 text-gray-600">{sys.session || "—"}</td>
                            <td className="px-3 py-2 text-gray-600">{sys.teamSession || "—"}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                verdict === "ok" ? "bg-green-100 text-green-700" :
                                verdict === "ko" ? "bg-red-100 text-red-600" :
                                "bg-amber-100 text-amber-700"
                              }`}>
                                {verdict === "ok" ? "✅ OK" : verdict === "ko" ? "❌" : "🟡"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* EN */}
                <div className="px-4 pt-4 pb-1 border-t border-black/[0.06]">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">🇬🇧 Système EN</p>
                </div>
                <div className="overflow-x-auto pb-2">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-blue-50 border-b border-black/[0.06]">
                        <th className="text-left px-4 py-2 font-mono uppercase tracking-widest text-blue-400 text-[10px]">Terme</th>
                        <th className="text-left px-3 py-2 font-mono uppercase tracking-widest text-blue-400 text-[10px]">EN</th>
                        <th className="text-left px-3 py-2 font-mono uppercase tracking-widest text-blue-400 text-[10px]">Coach EN</th>
                        <th className="text-left px-3 py-2 font-mono uppercase tracking-widest text-blue-400 text-[10px]">Coachee EN</th>
                        <th className="text-left px-3 py-2 font-mono uppercase tracking-widest text-blue-400 text-[10px]">Coaching Session EN</th>
                        <th className="text-left px-3 py-2 font-mono uppercase tracking-widest text-blue-400 text-[10px]">Team Meeting EN</th>
                        <th className="text-center px-3 py-2 font-mono uppercase tracking-widest text-blue-400 text-[10px]">Verdict EN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TERMS.filter(t => activeGroups.some(gid => getZone(sort[gid], t) === "preferred")).map((term, i) => {
                        const sys = getSystemRow(term);
                        return (
                          <tr key={term} className={`border-b border-black/[0.04] last:border-0 ${i % 2 === 0 ? "" : "bg-blue-50/30"}`}>
                            <td className="px-4 py-2 font-semibold text-gray-800">{term}</td>
                            <td className="px-3 py-2 text-gray-600">{sys.en || "—"}</td>
                            <td className="px-3 py-2 text-gray-600">{sys.enRole1 || "—"}</td>
                            <td className="px-3 py-2 text-gray-600">{sys.enRole2 || "—"}</td>
                            <td className="px-3 py-2 text-gray-600">{sys.enSession || "—"}</td>
                            <td className="px-3 py-2 text-gray-600">{sys.enTeam || "—"}</td>
                            <td className="px-3 py-2 text-center">
                              {(() => {
                                const verdict = getCentralEnOkVerdict(term);
                                return (
                                  <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    verdict === "ok" ? "bg-green-100 text-green-700" :
                                    verdict === "ko" ? "bg-red-100 text-red-600" :
                                    "bg-amber-100 text-amber-700"
                                  }`}>
                                    {verdict === "ok" ? "✅ OK" : verdict === "ko" ? "❌" : "🟡"}
                                  </span>
                                );
                              })()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>

            {/* Criteria chips — editable weights + full explanation */}
            <div className="mb-5">
              <div className="space-y-2">
                {CRITERIA.map(cr => (
                  <details key={cr.id} className="bg-white rounded-xl border border-black/[0.08] group overflow-hidden">
                    <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">{cr.name}</span>
                        <span className="text-xs text-gray-400">{cr.desc}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-0.5">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={weights[cr.id]}
                            onClick={e => e.stopPropagation()}
                            onChange={e => { e.stopPropagation(); handleWeightChange(cr.id, e.target.value); }}
                            className="w-12 text-center text-sm font-bold border border-gray-200 rounded-md py-0.5 focus:outline-none focus:border-black/30"
                          />
                          <span className="text-xs text-gray-400">%</span>
                        </div>
                        <span className="text-gray-300 text-xs group-open:rotate-180 transition-transform inline-block ml-1">▼</span>
                      </div>
                    </summary>
                    <div className="px-4 pb-4 pt-2 border-t border-black/[0.05] space-y-2">
                      <div className="flex gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 w-16 flex-shrink-0 pt-0.5">Pourquoi</span>
                        <p className="text-xs text-gray-600 leading-relaxed">{cr.why}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 w-16 flex-shrink-0 pt-0.5">Comment</span>
                        <p className="text-xs text-gray-600 leading-relaxed">{cr.how}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 w-16 flex-shrink-0 pt-0.5">Exemples</span>
                        <p className="text-xs text-gray-500 leading-relaxed font-mono">{cr.examples}</p>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
              {weightsError && (
                <p className="mt-2 text-xs text-red-500 font-medium">{weightsError}</p>
              )}
              {!weightsError && (
                <p className="mt-2 text-xs text-gray-400">Total : 100% ✓ — cliquez sur un critère pour voir son explication · modifiez les % selon vos priorités</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-black/[0.08] overflow-hidden mb-8">
              {/* ── Group / Central switcher ── */}
              <div className="px-4 py-3 border-b border-black/[0.06] bg-gray-50 flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveScoreGroup("central")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "1.5px solid",
                    cursor: "pointer",
                    backgroundColor: activeScoreGroup === "central" ? "#111827" : "#fff",
                    color: activeScoreGroup === "central" ? "#fff" : "#6B7280",
                    borderColor: activeScoreGroup === "central" ? "#111827" : "#E5E7EB",
                  }}
                >
                  Vue centrale (moyennes)
                </button>
                {GROUPS.filter(g => activeGroups.includes(g.id)).map(g => (
                  <button
                    key={g.id}
                    onClick={() => setActiveScoreGroup(g.id)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      border: "1.5px solid transparent",
                      cursor: "pointer",
                      backgroundColor: activeScoreGroup === g.id ? g.color : g.light,
                      color: activeScoreGroup === g.id ? "#fff" : g.color,
                    }}
                  >
                    {g.short} — {g.name}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/[0.07]">
                      <th className="text-left px-5 py-3 text-[11px] font-mono uppercase tracking-widest text-gray-400">
                        Terme
                      </th>
                      {activeScoreGroup === "central" ? (
                        <>
                          {GROUPS.filter(g => activeGroups.includes(g.id)).map(g => (
                            <th key={g.id} className="px-3 py-3 text-center min-w-[90px]">
                              <p className="text-xs font-semibold" style={{ color: g.color }}>{g.short}</p>
                              <p className="text-[10px] text-gray-400 font-normal">{g.name}</p>
                            </th>
                          ))}
                          <th className="px-4 py-3 text-center min-w-[80px]" style={{ borderLeft: "1px solid #E5E7EB" }}>
                            <p className="text-xs font-semibold text-gray-900">Moyenne</p>
                            <p className="text-[10px] text-gray-400 font-normal">groupes actifs</p>
                          </th>
                        </>
                      ) : (
                        <>
                          {CRITERIA.map(cr => (
                            <th key={cr.id} className="px-3 py-3 text-center min-w-[110px]">
                              <p className="text-xs font-semibold">{cr.name}</p>
                            </th>
                          ))}
                          <th className="px-4 py-3 text-center text-[11px] font-mono uppercase tracking-widest text-gray-400 min-w-[70px]">
                            Score
                          </th>
                        </>
                      )}
                      <th className="px-3 py-3 text-center text-[11px] font-mono uppercase tracking-widest text-gray-400">
                        Rang
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const scoringTerms = TERMS.filter(t =>
                        activeGroups.some(gid => getZone(sort[gid], t) === "preferred")
                      );

                      if (activeScoreGroup === "central") {
                        // ── Central view: columns = groups + average ──────────
                        return scoringTerms.map((term, ti) => {
                          const avg = calcWeightedLive(term);
                          const nActive = calcActiveGroupCount(term);
                          return (
                            <tr key={term} className={`border-b border-black/[0.04] last:border-0 ${ti % 2 === 0 ? "" : "bg-gray-50/40"}`}>
                              <td className="px-5 py-2.5 font-medium whitespace-nowrap">{term}</td>
                              {GROUPS.filter(g => activeGroups.includes(g.id)).map(g => {
                                const scored = groupHasScored(scores, g.id, term);
                                return (
                                  <td key={g.id} className="px-3 py-2.5 text-center">
                                    {scored ? (
                                      <span className="text-sm font-mono font-semibold" style={{ color: g.color }}>
                                        {calcWeightedGroup(g.id, term).toFixed(1)}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-gray-300">—</span>
                                    )}
                                  </td>
                                );
                              })}
                              <td className="px-4 py-2.5 text-center" style={{ borderLeft: "1px solid #E5E7EB" }}>
                                {nActive > 0 ? (
                                  <div>
                                    <span className="text-sm font-mono font-bold text-gray-900">{avg.toFixed(2)}</span>
                                    <p className="text-[10px] text-gray-400">÷{nActive}</p>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-300">—</span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                {(() => {
                                  const ranked = [...scoringTerms].sort((a, b) => calcWeightedLive(b) - calcWeightedLive(a));
                                  const rank = ranked.indexOf(term) + 1;
                                  return rank <= 3 ? (
                                    <span className={`text-sm font-bold ${rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : "text-amber-600"}`}>#{rank}</span>
                                  ) : (
                                    <span className="text-xs text-gray-300 font-mono">#{rank}</span>
                                  );
                                })()}
                              </td>
                            </tr>
                          );
                        });
                      } else {
                        // ── Group view: columns = criteria ────────────────────
                        const gid = activeScoreGroup;
                        return scoringTerms.map((term, ti) => {
                          const ws = calcWeightedGroup(gid, term);
                          const ranked = [...scoringTerms].sort((a, b) => calcWeightedGroup(gid, b) - calcWeightedGroup(gid, a));
                          const rank = ranked.indexOf(term) + 1;
                          return (
                            <tr key={term} className={`border-b border-black/[0.04] last:border-0 ${ti % 2 === 0 ? "" : "bg-gray-50/40"}`}>
                              <td className="px-5 py-2.5 font-medium whitespace-nowrap">{term}</td>
                              {CRITERIA.map(cr => (
                                <td key={cr.id} className="px-3 py-2.5">
                                  <ScoreSelector
                                    value={scores[gid]?.[term]?.[cr.id] ?? 3}
                                    onChange={v => {
                                      setScores({
                                        ...scores,
                                        [gid]: {
                                          ...scores[gid],
                                          [term]: { ...scores[gid]?.[term], [cr.id]: v },
                                        },
                                      });
                                    }}
                                  />
                                </td>
                              ))}
                              <td className="px-4 py-2.5 text-center">
                                <span className="text-sm font-mono font-bold">{ws.toFixed(2)}</span>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                {rank <= 3 ? (
                                  <span className={`text-sm font-bold ${rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : "text-amber-600"}`}>#{rank}</span>
                                ) : (
                                  <span className="text-xs text-gray-300 font-mono">#{rank}</span>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      }
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-black/[0.1] hover:bg-gray-100 transition-colors"
              >
                ← Retour
              </button>
              <button
                onClick={() => setStep(5)}
                className="bg-[#0E0E12] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Dot Voting →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Système complet ── */}
        {step === 3 && (
          <div>
            <StepHeader
              n={3}
              title="Système complet"
              desc="Vérifiez que les dérivés de chaque terme retenu sonnent naturels — avant de voter."
            />

            <div className="bg-white rounded-2xl border border-black/[0.08] overflow-hidden mb-6">
              {/* ── Group / Central switcher ── */}
              <div className="px-4 py-3 border-b border-black/[0.06] bg-gray-50 flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveScoreGroup("central")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "1.5px solid",
                    cursor: "pointer",
                    backgroundColor: activeScoreGroup === "central" ? "#111827" : "#fff",
                    color: activeScoreGroup === "central" ? "#fff" : "#6B7280",
                    borderColor: activeScoreGroup === "central" ? "#111827" : "#E5E7EB",
                  }}
                >
                  Vue centrale (moyennes)
                </button>
                {GROUPS.filter(g => activeGroups.includes(g.id)).map(g => (
                  <button
                    key={g.id}
                    onClick={() => setActiveScoreGroup(g.id)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      border: "1.5px solid transparent",
                      cursor: "pointer",
                      backgroundColor: activeScoreGroup === g.id ? g.color : g.light,
                      color: activeScoreGroup === g.id ? "#fff" : g.color,
                    }}
                  >
                    {g.short} — {g.name}
                  </button>
                ))}
              </div>

              {/* ── Tableau FR ── */}
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">🇫🇷 Système FR</p>
              </div>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/[0.07] bg-gray-50">
                      <th className="text-left px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-gray-400">Terme</th>
                      <th className="px-3 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-gray-400">Coach<br/><span className="normal-case font-normal text-gray-300">Rôle 1</span></th>
                      <th className="px-3 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-gray-400">Coaché<br/><span className="normal-case font-normal text-gray-300">Rôle 2</span></th>
                      <th className="px-3 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-gray-400">Coaching Session<br/><span className="normal-case font-normal text-gray-300">Séance de coaching</span></th>
                      <th className="px-3 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-gray-400">Team Meeting<br/><span className="normal-case font-normal text-gray-300">Réunion d'équipe</span></th>
                      <th className="px-3 py-3 text-center text-[11px] font-mono uppercase tracking-widest text-gray-400">
                        {activeScoreGroup === "central" ? "Verdict global" : "Ok ?"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TERMS
                      .filter(t => activeGroups.some(gid => getZone(sort[gid], t) === "preferred"))
                      .map((term, i) => {
                        const sys = getSystemRow(term);
                        if (!SYSTEM_COMPLETE[term] && !systemEdits[term]) return null;
                        const cellCls = "w-full text-xs bg-transparent border border-transparent hover:border-gray-200 focus:border-gray-400 rounded-md px-2 py-1 focus:outline-none transition-colors leading-snug";
                        return (
                          <tr key={term} className={`border-b border-black/[0.04] last:border-0 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                            <td className="px-4 py-2.5 font-semibold text-gray-900 whitespace-nowrap text-sm">{term}</td>
                            <td className="px-2 py-2 max-w-[140px]"><input className={cellCls} value={sys.role1} onChange={e => updateSystemField(term, "role1", e.target.value)} placeholder="ex-Coach" title={sys.role1} /></td>
                            <td className="px-2 py-2 max-w-[140px]"><input className={cellCls} value={sys.role2} onChange={e => updateSystemField(term, "role2", e.target.value)} placeholder="ex-Coaché" title={sys.role2} /></td>
                            <td className="px-2 py-2 max-w-[180px]"><input className={cellCls} value={sys.session} onChange={e => updateSystemField(term, "session", e.target.value)} placeholder="Séance de coaching" title={sys.session} /></td>
                            <td className="px-2 py-2 max-w-[180px]"><input className={cellCls} value={sys.teamSession || ""} onChange={e => updateSystemField(term, "teamSession", e.target.value)} placeholder="Réunion d'équipe" title={sys.teamSession} /></td>
                            <td className="px-2 py-2 text-center">
                              {activeScoreGroup === "central" ? (() => {
                                const verdict = getCentralOkVerdict(term);
                                return (
                                  <div className="flex flex-col items-center gap-1">
                                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                      verdict === "ok" ? "bg-green-100 text-green-700" :
                                      verdict === "ko" ? "bg-red-100 text-red-600" :
                                      "bg-amber-100 text-amber-700"
                                    }`}>
                                      {verdict === "ok" ? "✅ OK global" : verdict === "ko" ? "❌ Non retenu" : "🟡 À discuter"}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {activeGroups.filter(gid => getGroupOk(gid, term)).length}/{activeGroups.length} groupes ✓
                                    </span>
                                  </div>
                                );
                              })() : (
                                <button
                                  onClick={() => toggleGroupOk(activeScoreGroup, term)}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors mx-auto ${getGroupOk(activeScoreGroup, term) ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}
                                  title="Cliquer pour basculer ✓ / ✗"
                                >
                                  {getGroupOk(activeScoreGroup, term) ? "✓" : "✗"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* ── Tableau EN ── */}
              <div className="px-4 pt-2 pb-2 border-t border-black/[0.06]">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 mt-3">🇬🇧 Système EN — vérification traductibilité</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/[0.07] bg-blue-50">
                      <th className="text-left px-4 py-3 text-[11px] font-mono uppercase tracking-widest text-blue-400">Terme</th>
                      <th className="px-3 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-blue-400">Terme EN</th>
                      <th className="px-3 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-blue-400">Coach EN<br/><span className="normal-case font-normal text-blue-200">Rôle 1</span></th>
                      <th className="px-3 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-blue-400">Coachee EN<br/><span className="normal-case font-normal text-blue-200">Rôle 2</span></th>
                      <th className="px-3 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-blue-400">Coaching Session EN</th>
                      <th className="px-3 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-blue-400">Team Meeting EN</th>
                      <th className="px-3 py-3 text-center text-[11px] font-mono uppercase tracking-widest text-blue-400">
                        {activeScoreGroup === "central" ? "Verdict global" : "Ok EN ?"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TERMS
                      .filter(t => activeGroups.some(gid => getZone(sort[gid], t) === "preferred"))
                      .map((term, i) => {
                        const sys = getSystemRow(term);
                        if (!SYSTEM_COMPLETE[term] && !systemEdits[term]) return null;
                        const cellCls = "w-full text-xs bg-transparent border border-transparent hover:border-gray-200 focus:border-gray-400 rounded-md px-2 py-1 focus:outline-none transition-colors leading-snug";
                        return (
                          <tr key={term} className={`border-b border-black/[0.04] last:border-0 ${i % 2 === 0 ? "" : "bg-blue-50/30"}`}>
                            <td className="px-4 py-2.5 font-semibold text-gray-900 whitespace-nowrap text-sm">{term}</td>
                            <td className="px-2 py-2 max-w-[140px]"><input className={cellCls} value={sys.en} onChange={e => updateSystemField(term, "en", e.target.value)} placeholder="Terme EN" title={sys.en} /></td>
                            <td className="px-2 py-2 max-w-[130px]"><input className={cellCls} value={sys.enRole1 || ""} onChange={e => updateSystemField(term, "enRole1", e.target.value)} placeholder="EN Coach" title={sys.enRole1} /></td>
                            <td className="px-2 py-2 max-w-[130px]"><input className={cellCls} value={sys.enRole2 || ""} onChange={e => updateSystemField(term, "enRole2", e.target.value)} placeholder="EN Coachee" title={sys.enRole2} /></td>
                            <td className="px-2 py-2 max-w-[180px]"><input className={cellCls} value={sys.enSession || ""} onChange={e => updateSystemField(term, "enSession", e.target.value)} placeholder="EN Coaching Session" title={sys.enSession} /></td>
                            <td className="px-2 py-2 max-w-[160px]"><input className={cellCls} value={sys.enTeam || ""} onChange={e => updateSystemField(term, "enTeam", e.target.value)} placeholder="EN Team Meeting" title={sys.enTeam} /></td>
                            <td className="px-2 py-2 text-center">
                              {activeScoreGroup === "central" ? (() => {
                                const verdict = getCentralEnOkVerdict(term);
                                return (
                                  <div className="flex flex-col items-center gap-1">
                                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                      verdict === "ok" ? "bg-green-100 text-green-700" :
                                      verdict === "ko" ? "bg-red-100 text-red-600" :
                                      "bg-amber-100 text-amber-700"
                                    }`}>
                                      {verdict === "ok" ? "✅ OK global" : verdict === "ko" ? "❌ Non retenu" : "🟡 À discuter"}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {activeGroups.filter(gid => getGroupEnOk(gid, term)).length}/{activeGroups.length} groupes ✓
                                    </span>
                                  </div>
                                );
                              })() : (
                                <button
                                  onClick={() => toggleGroupEnOk(activeScoreGroup, term)}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors mx-auto ${getGroupEnOk(activeScoreGroup, term) ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}
                                >
                                  {getGroupEnOk(activeScoreGroup, term) ? "✓" : "✗"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 text-sm">
              <p className="font-semibold text-amber-800 mb-1">Comment utiliser ce tableau</p>
              <p className="text-amber-700">Lisez chaque ligne à voix haute. Si un dérivé sonne faux pour votre profil, signalez-le. Les alertes alimentent le critère <strong>Scalabilité</strong> dans la matrice. Un terme dont les dérivés posent problème mérite discussion avant le Dot Voting. EN vert = traduction naturelle · EN orange = traduction approximative.</p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-black/[0.1] hover:bg-gray-100 transition-colors"
              >
                ← Retour
              </button>
              <button
                onClick={() => setStep(4)}
                className="bg-[#0E0E12] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Matrice de Scoring →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Dot Voting ── */}
        {step === 5 && (
          <div>
            <StepHeader
              n={5}
              title="Dot Voting"
              desc={`Chaque groupe dispose de ${MAX_VOTES} votes à répartir librement sur les termes.`}
            />

            {/* Group selector + reveal */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span className="text-sm text-gray-500 mr-1">Groupe actif :</span>
              {GROUPS.filter(g => activeGroups.includes(g.id)).map(g => (
                <button
                  key={g.id}
                  onClick={() => setVoteGroup(g.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                    voteGroup === g.id
                      ? "text-white border-transparent"
                      : "bg-white border-black/[0.08] text-gray-600 hover:border-gray-300"
                  }`}
                  style={voteGroup === g.id ? { backgroundColor: g.color } : {}}
                >
                  {g.short}
                  <span
                    className={`text-[10px] font-mono ${
                      voteGroup === g.id ? "text-white/60" : "text-gray-400"
                    }`}
                  >
                    {votes[g.id].length}/{MAX_VOTES}
                  </span>
                </button>
              ))}
              <button
                onClick={() => setShowScores(!showScores)}
                className="ml-auto flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-lg border border-black/[0.1] bg-white hover:bg-gray-50 transition-colors font-medium"
              >
                {showScores ? <EyeOff size={13} /> : <Eye size={13} />}
                {showScores ? "Masquer scores" : "Révéler scores"}
              </button>
            </div>

            {/* Active group indicator */}
            {(() => {
              const g    = GROUPS.find(x => x.id === voteGroup)!;
              const used = votes[voteGroup].length;
              return (
                <div
                  className="flex items-center gap-3 mb-6 p-3.5 rounded-xl border"
                  style={{ backgroundColor: g.light, borderColor: `${g.color}30` }}
                >
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: g.color }}
                  >
                    {g.short}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: g.color }}>
                      {g.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {used} vote{used > 1 ? "s" : ""} utilisé{used > 1 ? "s" : ""} sur {MAX_VOTES}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {Array.from({ length: MAX_VOTES }).map((_, i) => (
                      <div
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border-2 transition-all"
                        style={
                          i < used
                            ? { backgroundColor: g.color, borderColor: g.color }
                            : { borderColor: `${g.color}50` }
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Term cards — only preferred terms from card sorting */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
              {TERMS
                .filter(t => activeGroups.some(gid => getZone(sort[gid], t) === "preferred"))
                .map(term => {
                const g      = GROUPS.find(x => x.id === voteGroup)!;
                const myVotes = voteCount(voteGroup, term);
                const tv     = totalVotes(term);
                const ws     = calcWeightedLive(term);
                const allTermsFiltered = TERMS.filter(t => activeGroups.some(gid => getZone(sort[gid], t) === "preferred"));
                const vRank  = [...allTermsFiltered]
                  .sort((a, b) => totalVotes(b) - totalVotes(a))
                  .indexOf(term) + 1;
                return (
                  <div
                    key={term}
                    className={`relative text-left bg-white rounded-xl p-4 border-2 transition-all ${
                      myVotes > 0 ? "shadow-md" : "border-black/[0.08]"
                    }`}
                    style={myVotes > 0 ? { borderColor: g.color, boxShadow: `0 4px 14px ${g.color}22` } : {}}
                  >
                    <p className="text-sm font-semibold mb-2 leading-tight pr-4">{term}</p>

                    {/* Votes from all groups — dots per vote */}
                    <div className="flex flex-wrap gap-1 mb-2 min-h-4">
                      {GROUPS.map(gr =>
                        Array.from({ length: voteCount(gr.id, term) }).map((_, vi) => (
                          <div
                            key={`${gr.id}-${vi}`}
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: gr.color }}
                            title={`${gr.name} (vote ${vi+1})`}
                          />
                        ))
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-gray-400">
                        {tv} vote{tv !== 1 ? "s" : ""}
                      </span>
                      {showScores && (
                        <span className="text-xs font-mono font-bold text-gray-500">
                          {ws.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* +/- vote buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeVote(voteGroup, term)}
                        disabled={myVotes === 0}
                        className="w-7 h-7 rounded-lg border border-black/[0.1] flex items-center justify-center text-sm font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      >
                        −
                      </button>
                      <span
                        className="flex-1 text-center text-sm font-bold font-mono"
                        style={{ color: myVotes > 0 ? g.color : "#9CA3AF" }}
                      >
                        {myVotes}
                      </span>
                      <button
                        onClick={() => addVote(voteGroup, term)}
                        disabled={votes[voteGroup].length >= MAX_VOTES}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
                        style={{ backgroundColor: g.color }}
                      >
                        +
                      </button>
                    </div>

                    {/* Rank badge */}
                    {showScores && vRank <= 3 && (
                      <div
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                        style={{
                          backgroundColor:
                            vRank === 1 ? "#F59E0B" : vRank === 2 ? "#9CA3AF" : "#B45309",
                        }}
                      >
                        {vRank}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Results chart */}
            {showScores && (
              <div className="bg-white rounded-2xl border border-black/[0.08] p-6 mb-8">
                <h3 className="text-sm font-semibold mb-5">Résultats combinés</h3>
                <div className="space-y-3">
                  {(() => {
                    const filteredTerms = TERMS.filter(t => activeGroups.some(gid => getZone(sort[gid], t) === "preferred"));
                    return [...filteredTerms]
                    .sort((a, b) => totalVotes(b) - totalVotes(a))
                    .map((term, i) => {
                      const tv    = totalVotes(term);
                      const ws    = calcWeightedLive(term);
                      const maxV  = Math.max(...filteredTerms.map(t => totalVotes(t))) || 1;
                      const maxWS = Math.max(...filteredTerms.map(t => calcWeightedLive(t)));
                      return (
                        <div key={term} className="flex items-center gap-3">
                          <span className="text-xs font-mono text-gray-300 w-4 flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium w-36 flex-shrink-0 truncate">
                            {term}
                          </span>
                          {/* Votes bar */}
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${(tv / maxV) * 100}%`,
                                backgroundColor: "#0E0E12",
                              }}
                            />
                          </div>
                          <span className="text-xs font-mono text-gray-500 w-5 text-right flex-shrink-0">
                            {tv}
                          </span>
                          {/* Score bar */}
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${(ws / maxWS) * 100}%`,
                                backgroundColor: "#2563EB",
                              }}
                            />
                          </div>
                          <span className="text-xs font-mono text-gray-300 w-8 flex-shrink-0 text-right">
                            {ws.toFixed(1)}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
                <div className="flex gap-5 mt-5 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full bg-[#0E0E12] inline-block" />
                    Votes dot voting
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full bg-[#2563EB] inline-block" />
                    Score pondéré
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-black/[0.1] hover:bg-gray-100 transition-colors"
              >
                ← Retour
              </button>
              <button
                onClick={() => {
                  const filtered = TERMS.filter(t => activeGroups.some(gid => getZone(sort[gid], t) === "preferred"));
                  const sorted = [...filtered].sort((a, b) => totalVotes(b) - totalVotes(a));
                  setSelectedFinal(sorted.slice(0, 5));
                  setStep(6);
                }}
                className="bg-[#0E0E12] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Voir les résultats →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 6: Résultats finaux ── */}
        {step === 6 && (() => {
          const preferredTerms = TERMS.filter(t => activeGroups.some(gid => getZone(sort[gid], t) === "preferred"));
          const allScored = [...preferredTerms].sort((a, b) => calcWeightedLive(b) - calcWeightedLive(a));
          const allVoted  = [...preferredTerms].sort((a, b) => totalVotes(b) - totalVotes(a));
          const top5 = selectedFinal.length > 0 ? selectedFinal : allVoted.slice(0, 5);
          const maxScore = Math.max(...top5.map(t => calcWeightedLive(t))) || 1;
          const maxVotes = Math.max(...top5.map(t => totalVotes(t))) || 1;

          return (
            <div>
              <StepHeader
                n={6}
                title="Résultats finaux"
                desc={`${top5.length} terme${top5.length > 1 ? "s" : ""} finaliste${top5.length > 1 ? "s" : ""} — classés par votes puis par score pondéré.`}
              />

              {preferredTerms.length > 5 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">⚠</span>
                  <span>{preferredTerms.length} termes étaient en lice. Seuls les 5 mieux classés par votes sont affichés. Vous pouvez ajuster la sélection ci-dessous.</span>
                </div>
              )}

              {/* Final term cards */}
              <div className="space-y-3 mb-8">
                {top5.map((term, i) => {
                  const tv = totalVotes(term);
                  const ws = calcWeightedLive(term);
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                  const sys = getSystemRow(term);
                  return (
                    <div
                      key={term}
                      className={`bg-white rounded-2xl border-2 p-5 transition-all ${
                        i === 0 ? "border-yellow-300 shadow-md" : "border-black/[0.08]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          {medal && <span className="text-2xl">{medal}</span>}
                          {!medal && (
                            <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-mono text-gray-400">
                              {i + 1}
                            </span>
                          )}
                          <div>
                            <p className="text-lg font-bold text-gray-900">{term}</p>
                            <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                              <span>{sys.role1 || "—"} → {sys.role2 || "—"}</span>
                              <span className="text-gray-300">·</span>
                              <span>{sys.session || "—"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-right flex-shrink-0">
                          <div>
                            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Votes</p>
                            <p className="text-xl font-bold font-mono">{tv}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Score</p>
                            <p className="text-xl font-bold font-mono text-blue-600">{ws.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Dual bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 w-10 text-right font-mono">votes</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gray-800 transition-all duration-700"
                              style={{ width: `${(tv / maxVotes) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-gray-400 w-5">{tv}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 w-10 text-right font-mono">score</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all duration-700"
                              style={{ width: `${(ws / maxScore) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-gray-400 w-5">{ws.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Groups who chose it */}
                      <div className="flex gap-1.5 mt-3">
                        {GROUPS.filter(g => activeGroups.includes(g.id)).map(g => {
                          const chose = getZone(sort[g.id], term) === "preferred";
                          return (
                            <span
                              key={g.id}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                                chose ? "text-white" : "bg-gray-100 text-gray-300"
                              }`}
                              style={chose ? { backgroundColor: g.color } : {}}
                            >
                              {g.short}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Adjust selection if more than 5 terms */}
              {preferredTerms.length > 5 && (
                <div className="bg-white rounded-2xl border border-black/[0.08] p-5 mb-8">
                  <p className="text-sm font-semibold mb-1">Ajuster la sélection finale</p>
                  <p className="text-xs text-gray-500 mb-4">Sélectionnez exactement 5 termes maximum à conserver pour la décision.</p>
                  <div className="flex flex-wrap gap-2">
                    {preferredTerms.map(term => {
                      const inFinal = selectedFinal.includes(term);
                      const disabled = !inFinal && selectedFinal.length >= 5;
                      return (
                        <button
                          key={term}
                          disabled={disabled}
                          onClick={() => {
                            setSelectedFinal(prev =>
                              prev.includes(term)
                                ? prev.filter(t => t !== term)
                                : prev.length < 5 ? [...prev, term] : prev
                            );
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                            inFinal
                              ? "bg-[#0E0E12] text-white border-[#0E0E12]"
                              : disabled
                              ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                              : "bg-white text-gray-600 border-black/[0.08] hover:border-gray-300"
                          }`}
                        >
                          {term}
                          {inFinal && <span className="ml-1.5 text-white/60 text-xs">{[...allVoted].indexOf(term) + 1}</span>}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">{selectedFinal.length}/5 sélectionnés</p>
                </div>
              )}

              {/* Decision box */}
              <div className={`rounded-2xl p-5 mb-8 border-2 ${
                top5.length === 1
                  ? "bg-green-50 border-green-200"
                  : "bg-blue-50 border-blue-100"
              }`}>
                <p className="text-sm font-semibold mb-2">
                  {top5.length === 1 ? "✅ Décision claire" : top5.length <= 3 ? "⚖️ Quelques finalistes" : "🔵 Liste de finalistes"}
                </p>
                <p className="text-sm text-gray-700">
                  {top5.length === 1
                    ? `Le terme retenu est "${top5[0]}" — 1 seul terme dominant. Option A (terme global).`
                    : top5.length <= 3
                    ? `${top5.length} termes finalistes. Discussion recommandée. Si les profils sont divisés → Option B (liste per-client).`
                    : `${top5.length} termes. Vote fragmenté → Option B probable (liste limitée per-client).`
                  }
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(5)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border border-black/[0.1] hover:bg-gray-100 transition-colors"
                >
                  ← Retour
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-black/[0.1] hover:bg-gray-100 transition-colors"
                >
                  Imprimer les résultats
                </button>
              </div>
            </div>
          );
        })()}
      </main>

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
      {showProfiles && <ProfileDrawer onClose={() => setShowProfiles(false)} />}
    </div>
  );
}
