const TypesAccepted = ["string", "number", "boolean", "object"];
export default function validateStructure(structure) {
    if (!structure || typeof structure !== "object") {
        throw new TypeError("Un composant doit être un objet.");
    }

    if (typeof structure.type !== "string") {
        throw new TypeError(
        `La propriété "type" est obligatoire et doit être une chaîne (reçu: ${typeof structure.type}).`,
        );
    }

    if (structure.attributes !== undefined) {
        if (!Array.isArray(structure.attributes)) {
            throw new TypeError('La propriété "attributes" doit être un tableau de paires [clé, valeur].');
        }

        for (const [key, value] of structure.attributes) {
            if (!TypesAccepted.includes(typeof value)) {
                throw new TypeError(
                `L'attribut "${key}" a une valeur invalide : type "${typeof value}" reçu, attendu string, number, boolean ou object.`,
                );
            }
        }
    }

    if (structure.children !== undefined && !Array.isArray(structure.children)) {
        throw new TypeError('La propriété "children" doit être un tableau.');
    }

    if (structure.events !== undefined && !Array.isArray(structure.events)) {
        throw new TypeError('La propriété "events" doit être un tableau de paires [événement, handler].');
    }



}
