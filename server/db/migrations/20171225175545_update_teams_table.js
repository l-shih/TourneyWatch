exports.up = function(knex, Promise) {
  return knex.schema.table('teams', function (table) {
    table.string('name');              
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('teams', function(table) {
    table.dropColumn('name');
  });
};
