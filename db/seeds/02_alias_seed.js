
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('alias').del()
    .then(function () {
      // Inserts seed entries
      return knex('alias').insert([
        {id: 1, company_id: 9, label: 'e)eden'},
        {id: 2, company_id: 9, label: ')eden'},
        {id: 3, company_id: 9, label: 'θeden'},
        {id: 4, company_id: 34, label: 'solio'}
      ]);
    });
};
