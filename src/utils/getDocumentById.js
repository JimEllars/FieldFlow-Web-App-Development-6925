/**
 * Utility function to get a document by ID from the documents array
 * 
 * @param {Array} documents - Array of document objects
 * @param {string} id - Document ID to find
 * @returns {Object|null} - The found document or null if not found
 */
export const getDocumentById = (documents, id) => {
  if (!Array.isArray(documents) || !id) {
    return null
  }
  
  return documents.find(doc => doc.id === id) || null
}

export default getDocumentById