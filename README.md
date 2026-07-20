# Yango React — Application de VTC avec assistance d'urgence

Application mobile de type VTC (client + chauffeur) développée en React Native, intégrant un système de sécurité avec alertes SOS géolocalisées. Le projet associe la commande de course classique à des consignes de secours adaptées selon le cas d'urgence.

Projet réalisé en équipe de 5 développeurs.

## 🎯 Le projet

Deux applications distinctes partageant un même backend Firebase :
- **YangoClient** — l'app côté passager (commande de course, suivi en temps réel, chat, SOS)
- **YangoDriver** — l'app côté chauffeur (réception de courses, navigation, gestion des trajets)

## ✨ Fonctionnalités

- **Authentification par rôle** (client / chauffeur)
- **Carte interactive** via OpenStreetMap (Nominatim / Overpass) pour la géolocalisation et les itinéraires
- **Tarification dynamique** — calcul du prix selon 5 modes de véhicule avec multiplicateurs horaires
- **Suivi en temps réel** des courses via les listeners Firestore
- **Chat intégré** par course entre client et chauffeur
- **SOS géolocalisé** — déclenchement d'alerte avec position GPS envoyée en cas d'urgence, y compris par commande vocale
- **Carte d'urgence** affichant les secours les plus proches
- **Analyse d'image par IA** via l'appareil photo (intégration Claude API)
- **Réservation à l'avance** de courses
- **Paiement simulé** (MTN Mobile Money, Orange Money, Cash)

## 🛠️ Stack technique

- React Native 0.73.0
- TypeScript
- Firebase (Auth, Firestore, temps réel)
- OpenStreetMap (Nominatim / Overpass API)
- Claude API (analyse d'image)

## 🚀 Installation

```bash
# Cloner le repo
git clone https://github.com/nitcheudeudjeu-bit/yangoReact.git
cd yangoReact

# Installer les dépendances
npm install

# Lancer Metro
npm start

# Dans un autre terminal — Android
npm run android

# Ou iOS
npm run ios
```

### Prérequis
- Environnement React Native configuré ([guide officiel](https://reactnative.dev/docs/environment-setup))
- Un projet Firebase configuré (voir `google-services.json` / `GoogleService-Info.plist`)

## 📱 Captures d'écran

<!-- Ajoute ici 3-4 captures : écran de connexion, carte avec course en cours, écran de chat, déclenchement SOS -->
<!-- Exemple : ![Écran d'accueil](./screenshots/home.png) -->

## 🎥 Démo

<!-- Ajoute ici un lien vers une courte vidéo de démo (YouTube non répertorié, ou GIF) -->

## 🧩 Défis techniques rencontrés

- Incompatibilité Firebase v24 → downgrade vers v18
- Résolution de conflits de dépendances avec `react-native-vision-camera`
- Gestion des timeouts AAPT2 et du pinning `minSdkVersion` / Kotlin

## 👥 Équipe

Projet développé en équipe de 5 développeurs dans le cadre du cours ICT202 (Mobile Development) — Université de Yaoundé I.

## 📄 Licence

Projet académique — usage éducatif.
