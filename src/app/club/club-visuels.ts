import { Club, Joueur } from "models/joueur.model"

// Images stockées dans assets/, rangées par code EuroLeague du club
const LOGOS: Record<string, string> = {
  PAN: "panathinaikos_aktor.webp",
  PAR: "partizan_mozzart_bet.webp",
  PRS: "paris_basketball.webp",
  ULK: "fenerbahce_beko.webp",
  MUN: "bayern_munich.webp",
}

const COACHS: Record<string, string> = {
  PAN: "obradovic_zeljko.webp",
  PAR: "penarroya_joan.webp",
  PRS: "lefebvre_maxime.webp",
  ULK: "jasikevicius_sarunas.webp",
  MUN: "gavel_anton.webp",
}

// Pays des clubs et nationalités des joueurs → code des drapeaux flagcdn
const CODES_PAYS: Record<string, string> = {
  Grèce: "gr",
  Serbie: "rs",
  France: "fr",
  Turquie: "tr",
  Allemagne: "de",
  "États-Unis": "us",
  Brésil: "br",
  Chili: "cl",
  Argentine: "ar",
  Italie: "it",
  Croatie: "hr",
  Nigeria: "ng",
  Danemark: "dk",
  Lituanie: "lt",
  Gabon: "ga",
  Espagne: "es",
}

export const POSTES: Record<string, string> = {
  M: "Meneur",
  AR: "Arrière",
  AI: "Ailier",
  AF: "Ailier fort",
  P: "Pivot",
}

// Un club sans code connu (ex. ajouté plus tard par l'équipe) a des visuels par défaut
export function logoClub(club: Pick<Club, "code">): string {
  const fichier = club.code ? LOGOS[club.code] : undefined
  return "assets/logo_club/" + (fichier ?? "defaut.svg")
}

export function photoCoach(club: Club): string | null {
  const fichier = club.code ? COACHS[club.code] : undefined
  return fichier ? "assets/coach/" + fichier : null
}

export function photoStade(club: Club): string | null {
  return club.code && LOGOS[club.code] ? "assets/stades/" + club.code.toLowerCase() + ".jpg" : null
}

// Accepte aussi les lignes de statistiques, qui n'ont que le nom et le prénom du joueur
export function photoJoueur(joueur: Pick<Joueur, "nom" | "prenom">): string {
  return "assets/joueurs/" + joueur.nom.toLowerCase() + "_" + joueur.prenom.toLowerCase() + ".png"
}

export function drapeau(pays: string): string {
  return "https://flagcdn.com/w40/" + (CODES_PAYS[pays] ?? "eu") + ".png"
}

function luminance(hex: string): number {
  const valeurs = hex
    .replace("#", "")
    .match(/.{2}/g)!
    .map((c) => {
      const v = parseInt(c, 16) / 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
  return 0.2126 * valeurs[0] + 0.7152 * valeurs[1] + 0.0722 * valeurs[2]
}

// Variables CSS du thème d'un club :
// --c1 / --c2 = couleurs officielles, --sur-c1 = texte lisible sur --c1,
// --accent = couleur du club la plus visible sur fond sombre
export function themeClub(club: Club): Record<string, string> {
  const c1 = club.couleurPrimaire
  const c2 = club.couleurSecondaire
  return {
    "--c1": c1,
    "--c2": c2,
    "--sur-c1": luminance(c1) > 0.4 ? "#101010" : "#ffffff",
    "--accent": luminance(c1) > 0.12 ? c1 : c2,
    "--sur-accent": luminance(luminance(c1) > 0.12 ? c1 : c2) > 0.4 ? "#101010" : "#ffffff",
  }
}
