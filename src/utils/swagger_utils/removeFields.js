// /src/utils/swagger_utils/removeFields.js

// Função recursiva para remover propriedades indesejadas
export default function removeFieldsRecursively(obj, fieldsToRemove) {
    if (Array.isArray(obj)) {
        obj.forEach(item => removeFieldsRecursively(item, fieldsToRemove));
    } else if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
            if (fieldsToRemove.includes(key)) {
                delete obj[key];
            } else {
                removeFieldsRecursively(obj[key], fieldsToRemove);
            }
        });
    }
}