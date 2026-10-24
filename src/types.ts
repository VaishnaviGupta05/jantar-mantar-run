{
  "version": 1,
  "gameTitle": "Jantar Mantar Run",
  "style": "Contemporary Indian Arcade",
  "palette": {
    "indigo": "#101d31",
    "charcoal": "#1a1d22",
    "sandstone": "#d8b48a",
    "terracotta": "#c96d4f",
    "saffron": "#f6b85b",
    "cream": "#f5f1e6",
    "teal": "#4ac1b5"
  },
  "assets": [
    { "id": "player-silhouette", "kind": "procedural", "description": "Hero runner silhouette with modular body parts." },
    { "id": "street-segment", "kind": "procedural", "description": "Road and building segment prefab for endless run." },
    { "id": "obstacle-police-barricade", "kind": "procedural", "description": "Three-lane barricade with collision box." },
    { "id": "safe-zone-reporter", "kind": "procedural", "description": "Checkpoint camera crew and reporter zone." },
    { "id": "collectible-marigold", "kind": "procedural", "description": "Token collectible with marigold-inspired palette." },
    { "id": "powerup-shield", "kind": "procedural", "description": "Bubble shield for temporary protection." },
    { "id": "audio-fallback", "kind": "synthesized", "description": "Procedural tones used when no external audio assets are installed." }
  ],
  "notes": "This project intentionally uses procedural geometry and synth-generated audio as a portable fallback when premium external production assets are unavailable."
}
