exports.up = function(knex, Promise) {
    return knex.schema.createTable('companies', (table) => {
        table.increments();
        table.string('label');
        table.string('name');
        table.string('tags');
        table.string('description');
        table.string('image')
        table.timestamps(true,true);
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('companies');
};