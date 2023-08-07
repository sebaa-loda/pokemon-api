const validateUuid = (id) => {
    const UuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
    return UuidRegex.test(id);
  }

module.exports = {
    validateUuid
}