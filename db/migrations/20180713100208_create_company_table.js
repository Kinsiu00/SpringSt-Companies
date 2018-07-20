exports.up = function(knex, Promise) {
    return knex.schema.createTable('companies', (table) => {
        table.increments();
        table.string('label');
        table.string('name');
        table.string('description', 500);
        table.string('image');
        table.string('website');
        table.string('facebook');
        table.string('twitter');
        table.string('linkedin');
        table.timestamps(true,true);
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('companies');
};