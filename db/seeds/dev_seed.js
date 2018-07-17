
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('companies').del()
    .then(function () {
      // Inserts seed entries
      return knex('companies').insert([
        { id: 1, 
          label: 'Galvanize',
          name: 'Galvanize', 
          tags: ['education'],
          description: 'Galvanize is a community bridging the longstanding gap of industry and education by bringing industry partners, ambitious students, and education under one roof.', 
          image:'https://tech2025.com/wp-content/uploads/2017/02/galvanize-logo-1024x256.png'},
        
        { id: 2, 
          label: 'Wandering Bear',
          name: 'Wandering Bear Coffee', 
          tags: ['consumable'], 
          description: 'Created cold brew coffee modeled after our favorite coffee shops around New York City. The boxes (with a tap!) eliminates air and light: the two things that makes coffee go stale.', 
          image:'https://assets.themuse.com/uploaded/companies/1523/small_logo.png'},
        
        { id: 3, 
          label: 'panda',
          name: 'Kin', 
          tags: ['person', 'education'], 
          description: 'A member of the g79 Cohort of Galvanize. His hobbies include traveling, being a foodie, along with consuming copious amounts of articles, literature, and books.', 
          image:'http://thestorydragon.com/wp-content/uploads/2016/02/06.png'},
      ]);
    });
};
