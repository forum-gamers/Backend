'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(`
      ALTER TABLE "Chats" ADD COLUMN "searchVector" TSVECTOR;
      UPDATE "Chats" SET "searchVector" = 
        setweight(to_tsvector('english', COALESCE("message", '')), 'A') ||
        setweight(to_tsvector('indonesian', COALESCE("message", '')), 'A');
      CREATE INDEX "chats_search_vector_idx" ON "Chats" USING gin("searchVector");

      CREATE OR REPLACE FUNCTION update_chats_search_vector() RETURNS TRIGGER AS $$
      BEGIN
        NEW."searchVector" := 
          setweight(to_tsvector('english', COALESCE(NEW."message", '')), 'A') ||
          setweight(to_tsvector('indonesian', COALESCE(NEW."message", '')), 'A');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trigger_update_chats_search_vector
      BEFORE INSERT OR UPDATE ON "Chats"
      FOR EACH ROW
      EXECUTE FUNCTION update_chats_search_vector();
    `);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeIndex('Chats', 'chats_search_vector_idx');
    await queryInterface.removeColumn('Chats', 'searchVector');
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_update_chats_search_vector ON "Chats";
      DROP FUNCTION IF EXISTS update_chats_search_vector();
    `);
  },
};
