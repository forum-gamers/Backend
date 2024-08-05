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
      CREATE EXTENSION IF NOT EXISTS pg_trgm;

      ALTER TABLE "Chats" ADD COLUMN "searchVector" TSVECTOR;

      ALTER TABLE "Chats" ADD COLUMN "trgmSimilarity" FLOAT;

      UPDATE "Chats" SET "searchVector" = 
        setweight(to_tsvector('english', COALESCE("message", '')), 'A') ||
        setweight(to_tsvector('indonesian', COALESCE("message", '')), 'A');

      CREATE INDEX "chats_search_vector_idx" ON "Chats" USING gin("searchVector");

      CREATE INDEX "chats_message_trgm_idx" ON "Chats" USING gin (message gin_trgm_ops);

      CREATE OR REPLACE FUNCTION update_chats_search_vector() RETURNS TRIGGER AS $$
      BEGIN
        NEW."searchVector" := 
          setweight(to_tsvector('english', COALESCE(NEW."message", '')), 'A') ||
          setweight(to_tsvector('indonesian', COALESCE(NEW."message", '')), 'A');

        NEW."trgmSimilarity" := similarity(NEW."message", COALESCE(NEW."message", ''));

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
    await queryInterface.removeIndex('Chats', 'chats_message_trgm_idx');
    await queryInterface.removeColumn('Chats', 'searchVector');
    await queryInterface.removeColumn('Chats', 'trgmSimilarity');
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_update_chats_search_vector ON "Chats";
      DROP FUNCTION IF EXISTS update_chats_search_vector();
    `);
  },
};
