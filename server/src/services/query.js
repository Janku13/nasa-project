const DEFAUL_PAGE_LIMIT = 0; //MONGO ENTENDE ISSO COMO TODOS
const DEFAUL_PAGE_NUMBER = 1;

function getPagination(query) {
  const page = Math.abs(query.page) || DEFAUL_PAGE_NUMBER;
  const limit = Math.abs(query.limit) || DEFAUL_PAGE_LIMIT;
  const skip = limit * (page - 1);

  return {
    skip,
    limit,
  };
}

module.exports = {
  getPagination,
};
