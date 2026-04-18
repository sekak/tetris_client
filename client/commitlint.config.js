export default {
  extends: ["@commitlint/config-conventional"],

  rules: {
    // Type obligatoire parmi cette liste
    "type-enum": [
      2, // 2 = error
      "always",
      [
        "feat",     // nouvelle fonctionnalité
        "fix",      // correction de bug
        "docs",     // documentation
        "style",    // formatage (pas de logique)
        "refactor", // refactoring sans bug ni feature
        "test",     // ajout/modification de tests
        "chore",    // maintenance, deps, config
        "perf",     // amélioration de performance
        "ci",       // CI/CD
        "revert",   // annulation d'un commit
      ],
    ],

    "type-case": [2, "always", "lower-case"],      // feat pas Feat
    "type-empty": [2, "never"],                    // type obligatoire
    "subject-empty": [2, "never"],                 // description obligatoire
    "subject-full-stop": [2, "never"],             // pas de . à la fin
    "subject-max-length": [2, "always", 72],        // max 72 caractères
    "header-max-length": [2, "always", 100],        // ligne entière max 100
  },
};
