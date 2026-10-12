export interface Video {
  id: string // identifiant YouTube
  titre: string
  contexte: string
  duree: string
  clubs: string[] // codes EuroLeague des clubs concernés, pour afficher leurs logos
}

// Vidéos officielles (chaînes EuroLeague Basketball et FC Bayern Basketball).
// Leur intégration sur un site externe est autorisée (vérifié via l'API oEmbed de YouTube).
export const VIDEOS: Video[] = [
  {
    id: "coLuCzee0tI",
    titre: "Paris Basketball – Partizan Mozzart Bet",
    contexte: "Résumé · Journée 2 · 2026-27",
    duree: "8:45",
    clubs: ["PRS", "PAR"],
  },
  {
    id: "v2ELKLdRH0s",
    titre: "FC Bayern Munich – Partizan (84-86)",
    contexte: "Résumé · 2026-27",
    duree: "3:29",
    clubs: ["MUN", "PAR"],
  },
  {
    id: "6uL3DTk-Mrk",
    titre: "FC Bayern Munich – Virtus Bologne",
    contexte: "Résumé · Journée 4 · 2026-27",
    duree: "8:12",
    clubs: ["MUN"],
  },
  {
    id: "T2h4GMwriL0",
    titre: "Nadir Hifi : tous ses paniers dans le derby français",
    contexte: "Record en carrière · Journée 4",
    duree: "1:21",
    clubs: ["PRS"],
  },
  {
    id: "_cbWEiYawE4",
    titre: "Top 10 : contres, dunks et alley-oops",
    contexte: "Journée 4 · 2026-27",
    duree: "3:19",
    clubs: [],
  },
  {
    id: "pisASGU-Yjk",
    titre: "Fenerbahçe sur le toit de l'Europe",
    contexte: "Finale · Final Four 2025",
    duree: "4:15",
    clubs: ["ULK"],
  },
  {
    id: "TCPGgfxjNCY",
    titre: "Real Madrid – Panathinaïkos, la finale",
    contexte: "Finale · Final Four 2024",
    duree: "4:37",
    clubs: ["PAN"],
  },
]
