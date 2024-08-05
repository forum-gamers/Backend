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

      ALTER TABLE "ReplyComments" ADD COLUMN "searchVector" TSVECTOR;

      ALTER TABLE "ReplyComments" ADD COLUMN "trgmSimilarity" FLOAT;

      UPDATE "ReplyComments" SET "searchVector" = 
        setweight(to_tsvector('english', COALESCE("text", '')), 'A') ||
        setweight(to_tsvector('indonesian', COALESCE("text", '')), 'A');

      CREATE INDEX "reply_comments_search_vector_idx" ON "ReplyComments" USING gin("searchVector");

      CREATE INDEX "reply_comments_text_trgm_idx" ON "ReplyComments" USING gin (text gin_trgm_ops);

      CREATE OR REPLACE FUNCTION update_reply_comments_search_vector() RETURNS TRIGGER AS $$
      BEGIN
        NEW."searchVector" := 
          setweight(to_tsvector('english', COALESCE(NEW."text", '')), 'A') ||
          setweight(to_tsvector('indonesian', COALESCE(NEW."text", '')), 'A');

        NEW."trgmSimilarity" := similarity(NEW."text", COALESCE(NEW."text", ''));

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trigger_update_reply_comments_search_vector
      BEFORE INSERT OR UPDATE ON "ReplyComments"
      FOR EACH ROW
      EXECUTE FUNCTION update_reply_comments_search_vector();
    `);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeIndex(
      'ReplyComments',
      'reply_comments_search_vector_idx',
    );
    await queryInterface.removeIndex(
      'ReplyComments',
      'reply_comments_text_trgm_idx',
    );
    await queryInterface.removeColumn('ReplyComments', 'searchVector');
    await queryInterface.removeColumn('ReplyComments', 'trgmSimilarity');
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_update_reply_comments_search_vector ON "ReplyComments";
      DROP FUNCTION IF EXISTS update_reply_comments_search_vector();
    `);
  },
};
