String.prototype.interpolate = function (data) {
  // On cherche tous les morceaux qui ressemblent à {{ quelque chose }}
  return this.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, path) => {
    // On le découpe le text en morceaux séparés par un point : ["type", "name"]
    // Puis on va chercher la valeur dans l'objet, étape par étape
    const value = path
      .split(".")
      .reduce((current, key) => current?.[key], data);

    // Si on a trouve une valeur, on l'affiche.
    // Sinon, on laisse le texte tel quel 
    return value !== undefined ? value : match;
  });
};
