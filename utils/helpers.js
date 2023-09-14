const formatDate = (date) => {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

module.exports = {
  json: function (context) {
    return JSON.stringify(context);
  },
  for: function (from, to, incr, block) {
    let accum = "";
    for (let i = from; i <= to; i += incr) {
      accum += block.fn(i);
    }
    return accum;
  },
  formatDate: formatDate,
};
