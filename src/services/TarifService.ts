const TARIF_BASE = 200;
const TARIF_KM = 150;
const TARIF_MINUTE = 25;

export const MODES_VEHICULE = [
  {
    id: 'moto',
    nom: 'Moto',
    emoji: '🏍️',
    description: 'Rapide et economique',
    multiplicateur: 0.6,
    capacite: '1 personne',
  },
  {
    id: 'economique',
    nom: 'Economique',
    emoji: '🚗',
    description: 'Confortable et abordable',
    multiplicateur: 1.0,
    capacite: '4 personnes',
  },
  {
    id: 'confort',
    nom: 'Confort',
    emoji: '🚙',
    description: 'Vehicule climatise',
    multiplicateur: 1.2,
    capacite: '4 personnes',
  },
  {
    id: 'premium',
    nom: 'Premium',
    emoji: '🏎️',
    description: 'Vehicule haut de gamme',
    multiplicateur: 1.4,
    capacite: '4 personnes',
  },
  {
    id: 'van',
    nom: 'Van',
    emoji: '🚐',
    description: 'Pour groupes et bagages',
    multiplicateur: 1.5,
    capacite: '7 personnes',
  },
];

const MULTIPLICATEURS_HORAIRES: any = {
  heure_pointe_matin: 1.3,
  heure_pointe_soir: 1.3,
  nuit: 1.5,
  weekend: 1.2,
  normal: 1.0,
};

export const calculerTarifDynamique = (
  distanceKm: number,
  dureeMinutes: number = 0,
  modeVehicule: string = 'economique',
) => {
  const maintenant = new Date();
  const heure = maintenant.getHours();
  const jour = maintenant.getDay();

  let typeHoraire = 'normal';
  let multiplicateurHoraire = 1.0;

  if (jour === 0 || jour === 6) {
    typeHoraire = 'weekend';
    multiplicateurHoraire = MULTIPLICATEURS_HORAIRES.weekend;
  } else if (heure >= 7 && heure <= 9) {
    typeHoraire = 'heure_pointe_matin';
    multiplicateurHoraire = MULTIPLICATEURS_HORAIRES.heure_pointe_matin;
  } else if (heure >= 17 && heure <= 19) {
    typeHoraire = 'heure_pointe_soir';
    multiplicateurHoraire = MULTIPLICATEURS_HORAIRES.heure_pointe_soir;
  } else if (heure >= 22 || heure <= 5) {
    typeHoraire = 'nuit';
    multiplicateurHoraire = MULTIPLICATEURS_HORAIRES.nuit;
  }

  const mode = MODES_VEHICULE.find(m => m.id === modeVehicule);
  const multiplicateurMode = mode?.multiplicateur || 1.0;

  const tarifBase =
    TARIF_BASE + distanceKm * TARIF_KM + dureeMinutes * TARIF_MINUTE;
  const tarifFinal = Math.round(
    tarifBase * multiplicateurHoraire * multiplicateurMode,
  );

  return {
    tarif: tarifFinal,
    typeHoraire,
    modeVehicule,
    multiplicateurHoraire,
    multiplicateurMode,
    details: {
      base: TARIF_BASE,
      distance: Math.round(distanceKm * TARIF_KM),
      duree: Math.round(dureeMinutes * TARIF_MINUTE),
      majoHoraire: Math.round(tarifBase * (multiplicateurHoraire - 1)),
      majoMode: Math.round(
        tarifBase * multiplicateurHoraire * (multiplicateurMode - 1),
      ),
    },
  };
};

export const getLibelleType = (type: string) => {
  switch (type) {
    case 'heure_pointe_matin': return 'Heure de pointe matin x1.3';
    case 'heure_pointe_soir': return 'Heure de pointe soir x1.3';
    case 'nuit': return 'Tarif nuit x1.5';
    case 'weekend': return 'Tarif weekend x1.2';
    default: return 'Tarif normal';
  }
};