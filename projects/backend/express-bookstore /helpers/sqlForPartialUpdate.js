/** Build a SQL SET clause for partial update.
 *
 * dataToUpdate: { pages: 300, title: "New" }
 * jsToSql: { amazon_url: "amazon_url" }  // maps JS keys to DB columns when needed
 *
 * Returns:
 *  {
 *    setCols: `"pages"=$1, "title"=$2`,
 *    values: [300, "New"]
 *  }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql = {}) {
    const keys = Object.keys(dataToUpdate);
    if (keys.length === 0) {
      throw new Error("No data"); // we’ll turn this into ExpressError in the model
    }
  
    // Build: ["\"pages\"=$1", "\"title\"=$2"]
    const cols = keys.map((fieldName, idx) => {
      const colName = jsToSql[fieldName] || fieldName;
      return `"${colName}"=$${idx + 1}`;
    });
  
    return {
      setCols: cols.join(", "),
      values: Object.values(dataToUpdate),
    };
  }
  
  module.exports = sqlForPartialUpdate;